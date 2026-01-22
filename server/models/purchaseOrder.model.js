const db = require("../config/db");

const PurchaseOrder = {
    create: (orderData, callback) => {
        const { VendorId, StoreId, OrderNumber, TotalAmount, Status, items } = orderData;

        db.getConnection((err, connection) => {
            if (err) return callback(err);

            connection.beginTransaction((err) => {
                if (err) {
                    connection.release();
                    return callback(err);
                }

                // 1. Insert into PurchaseOrders
                const orderQuery = `
          INSERT INTO PurchaseOrders (VendorId, StoreId, OrderNumber, TotalAmount, Status) 
          VALUES (?, ?, ?, ?, ?)
        `;
                connection.query(orderQuery, [VendorId, StoreId, OrderNumber, Status || 'Pending'], (err, res) => {
                    if (err) return connection.rollback(() => { connection.release(); callback(err); });

                    const orderId = res.insertId;

                    // 2. Insert items
                    const itemPromises = items.map(item => {
                        return new Promise((resolve, reject) => {
                            const itemQuery = "INSERT INTO PurchaseOrderItems (PurchaseOrderId, ProductId, Quantity, UnitPrice, Total) VALUES (?, ?, ?, ?, ?)";
                            connection.query(itemQuery, [orderId, item.ProductId, item.Quantity, item.UnitPrice, item.Total], (err) => {
                                if (err) return reject(err);

                                // If status is 'Received' or 'Completed', update stock immediately
                                if (Status === 'Received' || Status === 'Completed') {
                                    const stockQuery = `
                    INSERT INTO Inventory (ProductId, StoreId, Quantity) 
                    VALUES (?, ?, ?) 
                    ON DUPLICATE KEY UPDATE Quantity = Quantity + VALUES(Quantity)
                  `;
                                    connection.query(stockQuery, [item.ProductId, StoreId, item.Quantity], (err) => {
                                        if (err) return reject(err);
                                        resolve();
                                    });
                                } else {
                                    resolve();
                                }
                            });
                        });
                    });

                    Promise.all(itemPromises)
                        .then(() => {
                            connection.commit((err) => {
                                if (err) return connection.rollback(() => { connection.release(); callback(err); });
                                connection.release();
                                callback(null, { orderId });
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
      SELECT po.*, v.VendorName, s.StoreName 
      FROM PurchaseOrders po 
      LEFT JOIN Vendors v ON po.VendorId = v.VendorId 
      LEFT JOIN Stores s ON po.StoreId = s.StoreId 
      ORDER BY po.OrderDate DESC
    `;
        db.query(query, callback);
    },

    updateStatus: (id, status, callback) => {
        // If updating to Received, we need to handle stock increment
        // For simplicity, this implementation assumes stock is updated upon creation if marked Received
        // A robust version would fetch items and update stock here if transitioning from PENDING -> RECEIVED
        const query = "UPDATE PurchaseOrders SET Status = ? WHERE PurchaseOrderId = ?";
        db.query(query, [status, id], callback);
    }
};

module.exports = PurchaseOrder;
