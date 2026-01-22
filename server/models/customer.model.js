const db = require("../config/db");

const Customer = {
    findAll: (callback) => {
        db.query("SELECT * FROM Customers", callback);
    },

    findById: (id, callback) => {
        db.query("SELECT * FROM Customers WHERE CustomerID = ?", [id], callback);
    },

    create: (data, callback) => {
        const { CompanyName, Phone, Email, GSTIN, Address, City, State } = data;
        const query = `
      INSERT INTO Customers (CompanyName, Phone, Email, GSTIN, Address, City, State)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
        db.query(query, [CompanyName, Phone, Email, GSTIN, Address, City, State], callback);
    },

    update: (id, data, callback) => {
        const { CompanyName, Phone, Email, GSTIN, Address, City, State } = data;
        const query = `
      UPDATE Customers 
      SET CompanyName = ?, Phone = ?, Email = ?, GSTIN = ?, Address = ?, City = ?, State = ?
      WHERE CustomerID = ?
    `;
        db.query(query, [CompanyName, Phone, Email, GSTIN, Address, City, State, id], callback);
    },

    delete: (id, callback) => {
        db.query("DELETE FROM Customers WHERE CustomerID = ?", [id], callback);
    }
};

module.exports = Customer;
