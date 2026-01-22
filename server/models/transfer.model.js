const db = require("../config/db");

const Transfer = {
    create: (transferData, callback) => {
        const { ProductId, FromStoreId, ToStoreId, Quantity, Status } = transferData;

        db.getConnection((err, connection) => {
            if (err) return callback(err);

            connection.beginTransaction((err) => {
                if (err) {
                    connection.release();
                    return callback(err);
                }

                // 1. Deduct from Source
                const deductQuery = "UPDATE Inventory SET Quantity = Quantity - ? WHERE ProductId = ? AND StoreId = ?";
                connection.query(deductQuery, [Quantity, ProductId, FromStoreId], (err, res) => {
                    if (err) return connection.rollback(() => { connection.release(); callback(err); });

                    // 2. Add to Destination
                    const addQuery = `
            INSERT INTO Inventory (ProductId, StoreId, Quantity) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE Quantity = Quantity + VALUES(Quantity)
          `;
                    connection.query(addQuery, [ProductId, ToStoreId, Quantity], (err, res) => {
                        if (err) return connection.rollback(() => { connection.release(); callback(err); });

                        // 3. Log Transfer
                        const logQuery = "INSERT INTO StockTransfers (ProductId, FromStoreId, ToStoreId, Quantity, Status) VALUES (?, ?, ?, ?, ?)";
                        connection.query(logQuery, [ProductId, FromStoreId, ToStoreId, Quantity, Status || 'Completed'], (err, res) => {
                            if (err) return connection.rollback(() => { connection.release(); callback(err); });

                            connection.commit((err) => {
                                if (err) return connection.rollback(() => { connection.release(); callback(err); });
                                connection.release();
                                callback(null, res);
                            });
                        });
                    });
                });
            });
        });
    },

    findAll: (callback) => {
        const query = `
      SELECT t.*, p.ProductName, s1.StoreName as FromStore, s2.StoreName as ToStore 
      FROM StockTransfers t 
      INNER JOIN Products p ON t.ProductId = p.ProductId 
      INNER JOIN Stores s1 ON t.FromStoreId = s1.StoreId 
      INNER JOIN Stores s2 ON t.ToStoreId = s2.StoreId
      ORDER BY t.TransferDate DESC
    `;
        db.query(query, callback);
    }
};

module.exports = Transfer;
