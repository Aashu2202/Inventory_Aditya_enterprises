const db = require("../config/db");

const Order = {
    findAll: (callback) => {
        const query = `
      SELECT o.*, c.CompanyName as CustomerName 
      FROM Orders o 
      JOIN Customers c ON o.CustomerID = c.CustomerID
      ORDER BY o.OrderDate DESC
    `;
        db.query(query, callback);
    },

    findById: (id, callback) => {
        const query = `
      SELECT o.*, c.CompanyName as CustomerName 
      FROM Orders o 
      JOIN Customers c ON o.CustomerID = c.CustomerID
      WHERE o.OrderID = ?
    `;
        db.query(query, [id], (err, results) => {
            if (err) return callback(err);
            if (results.length === 0) return callback(null, null);

            const order = results[0];
            const detailsQuery = `
        SELECT od.*, p.ProductName 
        FROM OrderDetails od 
        JOIN Products p ON od.ProductID = p.ProductID 
        WHERE od.OrderID = ?
      `;
            db.query(detailsQuery, [id], (err, details) => {
                if (err) return callback(err);
                order.details = details;
                callback(null, order);
            });
        });
    },

    create: (orderData, details, warehouseID, callback) => {
        const { CustomerID, OrderNumber, OrderDate, TotalAmount, OrderStatus } = orderData;

        db.getConnection((err, connection) => {
            if (err) return callback(err);

            connection.beginTransaction((err) => {
                if (err) {
                    connection.release();
                    return callback(err);
                }

                const orderQuery = `
          INSERT INTO Orders (CustomerID, OrderNumber, OrderDate, TotalAmount, OrderStatus)
          VALUES (?, ?, ?, ?, ?)
        `;

                connection.query(orderQuery, [CustomerID, OrderNumber, OrderDate || new Date(), TotalAmount, OrderStatus || 'Pending'], (err, result) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            callback(err);
                        });
                    }

                    const orderID = result.insertId;
                    const detailsQuery = `
            INSERT INTO OrderDetails (OrderID, ProductID, Quantity, UnitPrice)
            VALUES ?
          `;

                    const detailsValues = details.map(d => [orderID, d.ProductID, d.Quantity, d.UnitPrice]);

                    connection.query(detailsQuery, [detailsValues], (err) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                callback(err);
                            });
                        }

                        // Also record StockMovements for each item (Negative quantity for sales)
                        const movementQuery = `
              INSERT INTO StockMovements (ProductID, WarehouseID, Quantity, MovementType, ReferenceID)
              VALUES ?
            `;
                        const movementValues = details.map(d => [d.ProductID, warehouseID, -d.Quantity, 'SALE', orderID]);

                        connection.query(movementQuery, [movementValues], (err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    callback(err);
                                });
                            }

                            connection.commit((err) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        callback(err);
                                    });
                                }
                                connection.release();
                                callback(null, { orderID });
                            });
                        });
                    });
                });
            });
        });
    },

};

module.exports = Order;
