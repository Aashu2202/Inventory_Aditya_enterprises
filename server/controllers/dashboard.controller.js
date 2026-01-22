const db = require("../config/db");

const dashboardController = {
    getStats: (req, res) => {
        const queries = {
            totalSales: "SELECT SUM(TotalAmount) as total FROM Orders",
            productCount: "SELECT COUNT(*) as count FROM Products",
            lowStockCount: "SELECT COUNT(*) as count FROM vw_StockSummary WHERE TotalQuantity <= 10",
            totalStockValue: "SELECT SUM(TotalValue) as value FROM vw_StockSummary",
            recentSales: "SELECT o.*, c.CompanyName as CustomerName FROM Orders o JOIN Customers c ON o.CustomerID = c.CustomerID ORDER BY o.OrderDate DESC LIMIT 5"
        };

        const stats = {};
        const promises = Object.keys(queries).map(key => {
            return new Promise((resolve, reject) => {
                db.query(queries[key], (err, data) => {
                    if (err) reject(err);
                    stats[key] = data;
                    resolve();
                });
            });
        });

        Promise.all(promises)
            .then(() => {
                res.json({
                    totalSales: stats.totalSales[0].total || 0,
                    productCount: stats.productCount[0].count || 0,
                    lowStockCount: stats.lowStockCount[0].count || 0,
                    stockValue: stats.totalStockValue[0].value || 0,
                    recentSales: stats.recentSales.map(s => ({
                        SaleId: s.OrderID,
                        BillNumber: s.OrderNumber,
                        SaleDate: s.OrderDate,
                        GrandTotal: s.TotalAmount,
                        PaymentMode: s.Status, // Mapping status as payment placeholder
                        CustomerName: s.CustomerName
                    }))
                });
            })
            .catch(err => {
                res.status(500).json({ error: "Failed to fetch dashboard stats", details: err });
            });
    }
};

module.exports = dashboardController;
