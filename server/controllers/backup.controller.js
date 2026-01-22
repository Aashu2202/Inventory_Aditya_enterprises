const db = require("../config/db");

const backupController = {
    exportData: (req, res) => {
        const tables = [
            "Users", "Categories", "Stores", "Products", "Inventory",
            "Vendors", "PurchaseOrders", "PurchaseOrderItems",
            "Sales", "SaleItems", "StockTransfers"
        ];

        const backupData = {};
        const promises = tables.map(table => {
            return new Promise((resolve, reject) => {
                db.query(`SELECT * FROM ${table}`, (err, data) => {
                    if (err) reject(err);
                    backupData[table] = data;
                    resolve();
                });
            });
        });

        Promise.all(promises)
            .then(() => {
                res.json({
                    success: true,
                    timestamp: new Date().toISOString(),
                    data: backupData
                });
            })
            .catch(err => {
                res.status(500).json({ error: "Backup failed", details: err });
            });
    },

    importData: (req, res) => {
        const { data } = req.body;
        if (!data) return res.status(400).json({ error: "No data provided" });

        // Note: A robust implementation would handle table clearing and insertion in order
        // to satisfy foreign key constraints. For this MVP, we'll suggest manual restore or 
        // basic row insertion logic.
        res.status(501).json({ message: "Restore functionality via API is restricted for safety. Use SQL Workbench to import generated JSON." });
    }
};

module.exports = backupController;
