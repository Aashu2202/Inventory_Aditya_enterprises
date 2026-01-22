const mysql = require("mysql2");

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "inventory_db"
});

// Check if columns exist before adding
db.query(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME='Products' AND TABLE_SCHEMA='inventory_db'
`, (err, results) => {
    if (err) {
        console.error('Error checking columns:', err);
        process.exit(1);
    }

    const columnNames = results.map(col => col.COLUMN_NAME);
    const hasRetailPrice = columnNames.includes('RetailPrice');
    const hasWholesalePrice = columnNames.includes('WholesalePrice');

    console.log('Existing columns:', columnNames);
    console.log('RetailPrice exists:', hasRetailPrice);
    console.log('WholesalePrice exists:', hasWholesalePrice);

    const queries = [];

    if (!hasRetailPrice) {
        queries.push(`ALTER TABLE Products ADD COLUMN RetailPrice DECIMAL(10,2) AFTER UnitPrice`);
    }

    if (!hasWholesalePrice) {
        queries.push(`ALTER TABLE Products ADD COLUMN WholesalePrice DECIMAL(10,2) AFTER RetailPrice`);
    }

    if (queries.length === 0) {
        console.log('✓ Both columns already exist. No changes needed.');
        db.end();
        process.exit(0);
    }

    // Execute each query
    let executed = 0;
    queries.forEach(query => {
        db.query(query, (err) => {
            if (err) {
                console.error('Error executing query:', err);
                process.exit(1);
            }
            executed++;
            console.log(`✓ Query ${executed}/${queries.length} completed:`, query);

            if (executed === queries.length) {
                console.log('\n✓ Database migration completed successfully!');
                db.end();
                process.exit(0);
            }
        });
    });
});
