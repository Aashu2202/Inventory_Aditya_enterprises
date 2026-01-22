const db = require('./config/db');

db.query('SHOW TABLES', (err, results) => {
    if (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
    console.log('Tables in database:', results.map(r => Object.values(r)[0]));

    db.query('SELECT * FROM Suppliers LIMIT 1', (err, results) => {
        if (err) console.error('Suppliers table error:', err.message);
        else console.log('Suppliers table exists and is accessible');

        db.query('SELECT * FROM vw_StockSummary LIMIT 1', (err, results) => {
            if (err) console.error('vw_StockSummary view error:', err.message);
            else console.log('vw_StockSummary view exists and is accessible');
            process.exit(0);
        });
    });
});
