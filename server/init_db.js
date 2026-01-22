const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    multipleStatements: true
});

const sqlFile = path.join(__dirname, 'inventory_v3.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

console.log('Starting database setup (Schema V3)...');

connection.query(sql, (err) => {
    if (err) {
        console.error('Database setup failed!');
        console.error(err.message);
        process.exit(1);
    }
    console.log('Database setup complete! All tables and views created.');
    process.exit(0);
});
