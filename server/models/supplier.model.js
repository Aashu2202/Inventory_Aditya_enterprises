const db = require("../config/db");

const Supplier = {
    findAll: (callback) => {
        db.query("SELECT * FROM Suppliers", callback);
    },

    findById: (id, callback) => {
        db.query("SELECT * FROM Suppliers WHERE SupplierID = ?", [id], callback);
    },

    create: (data, callback) => {
        const { CompanyName, ContactName, Phone, Email, Address, City, State, Country, CompanyID } = data;
        const query = `
      INSERT INTO Suppliers (CompanyID, CompanyName, ContactName, Phone, Email, Address, City, State, Country)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        db.query(query, [CompanyID || 1, CompanyName, ContactName, Phone, Email, Address, City, State, Country || 'India'], callback);
    },

    update: (id, data, callback) => {
        const { CompanyName, ContactName, Phone, Email, Address, City, State, Country } = data;
        const query = `
      UPDATE Suppliers 
      SET CompanyName = ?, ContactName = ?, Phone = ?, Email = ?, Address = ?, City = ?, State = ?, Country = ?
      WHERE SupplierID = ?
    `;
        db.query(query, [CompanyName, ContactName, Phone, Email, Address, City, State, Country, id], callback);
    },

    delete: (id, callback) => {
        db.query("DELETE FROM Suppliers WHERE SupplierID = ?", [id], callback);
    }
};

module.exports = Supplier;
