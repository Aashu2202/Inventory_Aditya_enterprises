const db = require("../config/db");

const StockMovement = {
    findAll: (callback) => {
        const query = `
      SELECT sm.*, p.ProductName, w.WarehouseName 
      FROM StockMovements sm
      JOIN Products p ON sm.ProductID = p.ProductID
      JOIN Warehouses w ON sm.WarehouseID = w.WarehouseID
      ORDER BY sm.MovementDate DESC
    `;
        db.query(query, callback);
    },

    findByProduct: (productId, callback) => {
        const query = `
      SELECT sm.*, w.WarehouseName 
      FROM StockMovements sm
      JOIN Warehouses w ON sm.WarehouseID = w.WarehouseID
      WHERE sm.ProductID = ?
      ORDER BY sm.MovementDate DESC
    `;
        db.query(query, [productId], callback);
    }
};

module.exports = StockMovement;
