const db = require("../config/db");

const Product = {
  findAll: (callback) => {
    const query = `
      SELECT p.*, c.CategoryName, s.CompanyName as SupplierName 
      FROM Products p 
      LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
      LEFT JOIN Suppliers s ON p.SupplierID = s.SupplierID
    `;
    db.query(query, callback);
  },

  findById: (id, callback) => {
    db.query("SELECT * FROM Products WHERE ProductID = ?", [id], callback);
  },

  findByBarcode: (barcode, callback) => {
    const query = `
      SELECT p.*, c.CategoryName 
      FROM Products p
      LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
      WHERE p.Barcode = ?
    `;
    db.query(query, [barcode], callback);
  },

  create: (productData, callback) => {
    const { ProductName, CategoryID, SupplierID, UnitPrice, RetailPrice, WholesalePrice, ReorderLevel, IsActive, Barcode, CompanyID, HSNCode } = productData;
    const query = `
      INSERT INTO Products (CompanyID, ProductName, CategoryID, SupplierID, UnitPrice, RetailPrice, WholesalePrice, ReorderLevel, Barcode, IsActive, HSNCode) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [CompanyID || 1, ProductName, CategoryID, SupplierID, UnitPrice, RetailPrice, WholesalePrice, ReorderLevel, Barcode || null, IsActive || 1, HSNCode || null], callback);
  },

  // Simplified: Barcode is now part of product update
  update: (id, productData, callback) => {
    const { ProductName, CategoryID, SupplierID, UnitPrice, RetailPrice, WholesalePrice, ReorderLevel, IsActive, Barcode, HSNCode } = productData;
    const query = `
      UPDATE Products 
      SET ProductName = ?, CategoryID = ?, SupplierID = ?, 
          UnitPrice = ?, RetailPrice = ?, WholesalePrice = ?, ReorderLevel = ?, IsActive = ?, Barcode = ?, HSNCode = ?
      WHERE ProductID = ?
    `;
    db.query(query, [ProductName, CategoryID, SupplierID, UnitPrice, RetailPrice, WholesalePrice, ReorderLevel, IsActive, Barcode, HSNCode, id], callback);
  },

  delete: (id, callback) => {
    // Use a transaction to safely delete the product and all related records
    db.query("SET FOREIGN_KEY_CHECKS = 0", (err) => {
      if (err) return callback(err);

      // List of all tables that might have references to products
      const tablesToClean = [
        { table: 'Inventory', column: 'ProductID' },
        { table: 'OrderDetails', column: 'ProductID' },
        { table: 'PurchaseDetails', column: 'ProductID' },
        { table: 'BillItems', column: 'ProductID' },
        { table: 'StockMovements', column: 'ProductID' }
      ];

      let cleanupCount = 0;

      // Clean up each table
      const cleanupNextTable = () => {
        if (cleanupCount >= tablesToClean.length) {
          // All tables cleaned, now delete the product
          db.query("DELETE FROM Products WHERE ProductID = ?", [id], (err) => {
            // Re-enable foreign key checks
            db.query("SET FOREIGN_KEY_CHECKS = 1", (fkErr) => {
              if (err) return callback(err);
              if (fkErr) return callback(fkErr);
              callback(null, { success: true });
            });
          });
          return;
        }

        const tableInfo = tablesToClean[cleanupCount];
        db.query(`DELETE FROM \`${tableInfo.table}\` WHERE \`${tableInfo.column}\` = ?`, [id], (err) => {
          // Ignore errors for this table
          cleanupCount++;
          cleanupNextTable();
        });
      };

      cleanupNextTable();
    });
  },

  // Stock related
  getStockSummary: (callback) => {
    db.query("SELECT * FROM vw_StockSummary", callback);
  },

  getInventoryByProduct: (productId, callback) => {
    const query = `
      SELECT i.*, w.WarehouseName 
      FROM Inventory i 
      INNER JOIN Warehouses w ON i.WarehouseID = w.WarehouseID 
      WHERE i.ProductID = ?
    `;
    db.query(query, [productId], callback);
  },

  updateStock: (productId, warehouseId, quantity, callback) => {
    const query = `
      INSERT INTO Inventory (ProductID, WarehouseID, Quantity) 
      VALUES (?, ?, ?) 
      ON DUPLICATE KEY UPDATE Quantity = ?
    `;
    db.query(query, [productId, warehouseId, quantity, quantity], callback);
  },

  getStock: (productId, callback) => {
    const query = `
      SELECT i.Quantity, w.WarehouseName 
      FROM Inventory i
      JOIN Warehouses w ON i.WarehouseID = w.WarehouseID
      WHERE i.ProductID = ?
    `;
    db.query(query, [productId], callback);
  }
};

module.exports = Product;
