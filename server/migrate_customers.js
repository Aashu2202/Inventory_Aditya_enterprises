const db = require("./config/db");

const sql = `
  ALTER TABLE Sales 
  ADD COLUMN CustomerName VARCHAR(255) DEFAULT 'Walking Customer',
  ADD COLUMN CustomerMobile VARCHAR(20),
  ADD COLUMN CustomerAddress TEXT;
`;

db.query(sql, (err, result) => {
    if (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log("Columns already exist.");
        } else {
            console.error("Migration failed:", err);
            process.exit(1);
        }
    } else {
        console.log("Migration successful!");
    }
    process.exit(0);
});
