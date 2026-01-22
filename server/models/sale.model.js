const db = require("../config/db");

const Sale = {
    create: (saleData, callback) => {
        const {
            StoreId, UserId, BillNumber, SubTotal, GST_Total, Discount, GrandTotal, PaymentMode,
            CustomerName, CustomerMobile, CustomerAddress, CustomerType, items
        } = saleData;

        db.getConnection((err, connection) => {
            if (err) return callback(err);

            connection.beginTransaction((err) => {
                if (err) {
                    connection.release();
                    return callback(err);
                }

                // 1. Insert into Sales table
                const salesQuery = `
          INSERT INTO Sales (StoreId, UserId, BillNumber, SubTotal, GST_Total, Discount, GrandTotal, PaymentMode, CustomerName, CustomerMobile, CustomerAddress, CustomerType) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
                connection.query(salesQuery, [StoreId, UserId, BillNumber, SubTotal, GST_Total, Discount, GrandTotal, PaymentMode, CustomerName, CustomerMobile, CustomerAddress, CustomerType], (err, res) => {
                    if (err) return connection.rollback(() => { connection.release(); callback(err); });

                    const saleId = res.insertId;

                    // 2. Insert items and Update Inventory
                    const itemPromises = items.map(item => {
                        return new Promise((resolve, reject) => {
                            const itemQuery = `
                INSERT INTO SaleItems (SaleId, ProductId, Quantity, UnitPrice, GST_Amount, Total) 
                VALUES (?, ?, ?, ?, ?, ?)
              `;
                            connection.query(itemQuery, [saleId, item.ProductId, item.Quantity, item.UnitPrice, item.GST_Amount, item.Total], (err) => {
                                if (err) return reject(err);

                                // Update stock
                                const stockQuery = "UPDATE Inventory SET Quantity = Quantity - ? WHERE ProductId = ? AND StoreId = ?";
                                connection.query(stockQuery, [item.Quantity, item.ProductId, StoreId], (err) => {
                                    if (err) return reject(err);
                                    resolve();
                                });
                            });
                        });
                    });

                    Promise.all(itemPromises)
                        .then(() => {
                            connection.commit((err) => {
                                if (err) return connection.rollback(() => { connection.release(); callback(err); });
                                connection.release();
                                callback(null, { saleId });
                            });
                        })
                        .catch(itemErr => {
                            connection.rollback(() => { connection.release(); callback(itemErr); });
                        });
                });
            });
        });
    },

    findAll: (callback) => {
        const query = `
      SELECT s.*, u.Username, st.StoreName 
      FROM Sales s 
      LEFT JOIN Users u ON s.UserId = u.UserId 
      LEFT JOIN Stores st ON s.StoreId = st.StoreId 
      ORDER BY s.SaleDate DESC
    `;
        db.query(query, callback);
    },

    findById: (id, callback) => {
        const query = "SELECT * FROM Sales WHERE SaleId = ?";
        db.query(query, [id], (err, sales) => {
            if (err || sales.length === 0) return callback(err || new Error("Sale not found"));

            const itemsQuery = `
        SELECT si.*, p.ProductName, p.Barcode 
        FROM SaleItems si 
        INNER JOIN Products p ON si.ProductId = p.ProductId 
        WHERE si.SaleId = ?
      `;
            db.query(itemsQuery, [id], (err, items) => {
                callback(err, { ...sales[0], items });
            });
        });
    }
};

module.exports = Sale;
