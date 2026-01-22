const db = require("./config/db");

const migrate = async () => {
    const addColumn = (colName, definition) => {
        return new Promise((resolve) => {
            db.query(`ALTER TABLE Sales ADD COLUMN ${colName} ${definition}`, (err) => {
                if (err) {
                    if (err.code === 'ER_DUP_COLUMN_NAME') {
                        console.log(`Column ${colName} already exists.`);
                    } else {
                        console.error(`Error adding ${colName}:`, err.message);
                    }
                } else {
                    console.log(`Column ${colName} added successfully.`);
                }
                resolve();
            });
        });
    };

    const modifyColumn = (colName, definition) => {
        return new Promise((resolve) => {
            db.query(`ALTER TABLE Sales MODIFY COLUMN ${colName} ${definition}`, (err) => {
                if (err) {
                    console.error(`Error modifying ${colName}:`, err.message);
                } else {
                    console.log(`Column ${colName} modified successfully.`);
                }
                resolve();
            });
        });
    };

    console.log("Starting Sales table migration...");

    await addColumn("CustomerType", "VARCHAR(100) DEFAULT 'Walking Customer'");
    await addColumn("CustomerName", "VARCHAR(255) DEFAULT 'Walking Customer'");
    await addColumn("CustomerMobile", "VARCHAR(20)");
    await addColumn("CustomerAddress", "TEXT");

    await modifyColumn("CustomerName", "VARCHAR(255) DEFAULT 'Walking Customer'");
    await modifyColumn("CustomerMobile", "VARCHAR(20)");
    await modifyColumn("CustomerAddress", "TEXT");
    await modifyColumn("CustomerType", "VARCHAR(100) DEFAULT 'Walking Customer'");

    console.log("Migration finished.");
    process.exit(0);
};

migrate();
