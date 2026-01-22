const db = require("../config/db");

const Store = {
    findAll: (callback) => {
        db.query("SELECT * FROM Stores", callback);
    },

    create: (storeData, callback) => {
        const { StoreName, Location, ContactNumber } = storeData;
        db.query("INSERT INTO Stores (StoreName, Location, ContactNumber) VALUES (?, ?, ?)", [StoreName, Location, ContactNumber], callback);
    },

    getInventory: (storeId, callback) => {
        const query = `
      SELECT i.*, p.ProductName, p.Barcode, p.SKU, c.CategoryName 
      FROM Inventory i 
      INNER JOIN Products p ON i.ProductId = p.ProductId 
      LEFT JOIN Categories c ON p.CategoryId = c.CategoryId
      WHERE i.StoreId = ?
    `;
        db.query(query, [storeId], callback);
    },

    update: (id, storeData, callback) => {
        const { StoreName, Location, ContactNumber } = storeData;
        db.query("UPDATE Stores SET StoreName=?, Location=?, ContactNumber=? WHERE StoreId=?", [StoreName, Location, ContactNumber, id], callback);
    },

    delete: (id, callback) => {
        db.query("DELETE FROM Stores WHERE StoreId = ?", [id], callback);
    }
};

module.exports = Store;
