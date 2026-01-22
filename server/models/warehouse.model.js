const db = require("../config/db");

const Warehouse = {
    findAll: (callback) => {
        db.query("SELECT * FROM Warehouses", callback);
    },

    findById: (id, callback) => {
        db.query("SELECT * FROM Warehouses WHERE WarehouseID = ?", [id], callback);
    },

    create: (data, callback) => {
        const { WarehouseName, Address, City, State, Phone } = data;
        const query = `
      INSERT INTO Warehouses (WarehouseName, Address, City, State, Phone)
      VALUES (?, ?, ?, ?, ?)
    `;
        db.query(query, [WarehouseName, Address, City, State, Phone], callback);
    },

    update: (id, data, callback) => {
        const { WarehouseName, Address, City, State, Phone } = data;
        const query = `
      UPDATE Warehouses 
      SET WarehouseName = ?, Address = ?, City = ?, State = ?, Phone = ?
      WHERE WarehouseID = ?
    `;
        db.query(query, [WarehouseName, Address, City, State, Phone, id], callback);
    },

    delete: (id, callback) => {
        db.query("DELETE FROM Warehouses WHERE WarehouseID = ?", [id], callback);
    }
};

module.exports = Warehouse;
