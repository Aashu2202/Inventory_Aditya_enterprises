const db = require("../config/db");

const Purchase = {
    findAll: (callback) => {
        const query = `
      SELECT p.*, s.CompanyName as SupplierName 
      FROM Purchases p 
      JOIN Suppliers s ON p.SupplierID = s.SupplierID
      ORDER BY p.PurchaseDate DESC
    `;
        db.query(query, callback);
    },

    findById: (id, callback) => {
        const query = `
      SELECT p.*, s.CompanyName as SupplierName 
      FROM Purchases p 
      JOIN Suppliers s ON p.SupplierID = s.SupplierID
      WHERE p.PurchaseID = ?
    `;
        db.query(query, [id], (err, results) => {
            if (err) return callback(err);
            if (results.length === 0) return callback(null, null);

            const purchase = results[0];
            const detailsQuery = `
        SELECT pd.*, pr.ProductName 
        FROM PurchaseDetails pd 
        JOIN Products pr ON pd.ProductID = pr.ProductID 
        WHERE pd.PurchaseID = ?
      `;
            db.query(detailsQuery, [id], (err, details) => {
                if (err) return callback(err);
                purchase.details = details;
                callback(null, purchase);
            });
        });
    },

    create: (purchaseData, details, warehouseID, callback) => {
        const { SupplierID, InvoiceNumber, PurchaseDate, TotalAmount } = purchaseData;

        db.getConnection((err, connection) => {
            if (err) return callback(err);

            connection.beginTransaction((err) => {
                if (err) {
                    connection.release();
                    return callback(err);
                }

                const purchaseQuery = `
          INSERT INTO Purchases (SupplierID, InvoiceNumber, PurchaseDate, TotalAmount)
          VALUES (?, ?, ?, ?)
        `;

                connection.query(purchaseQuery, [SupplierID, InvoiceNumber, PurchaseDate || new Date(), TotalAmount], (err, result) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            callback(err);
                        });
                    }

                    const purchaseID = result.insertId;
                    const detailsQuery = `
            INSERT INTO PurchaseDetails (PurchaseID, ProductID, Quantity, UnitCost)
            VALUES ?
          `;

                    const detailsValues = details.map(d => [purchaseID, d.ProductID, d.Quantity, d.UnitCost]);

                    connection.query(detailsQuery, [detailsValues], (err) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                callback(err);
                            });
                        }

                        // Also record StockMovements for each item
                        const movementQuery = `
              INSERT INTO StockMovements (ProductID, WarehouseID, Quantity, MovementType, ReferenceID)
              VALUES ?
            `;
                        const movementValues = details.map(d => [d.ProductID, warehouseID, d.Quantity, 'PURCHASE', purchaseID]);

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
                                callback(null, { purchaseID });
                            });
                        });
                    });
                });
            });
        });
    }
};

module.exports = Purchase;
