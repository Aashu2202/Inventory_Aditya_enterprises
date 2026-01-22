const db = require("../config/db");

const Vendor = {
    findAll: (callback) => {
        db.query("SELECT * FROM Vendors ORDER BY VendorName ASC", callback);
    },

    create: (vendorData, callback) => {
        const { VendorName, ContactPerson, Phone, Email, Address, GSTIN } = vendorData;
        const query = `
      INSERT INTO Vendors (VendorName, ContactPerson, Phone, Email, Address, GSTIN) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
        db.query(query, [VendorName, ContactPerson, Phone, Email, Address, GSTIN], callback);
    },

    update: (id, vendorData, callback) => {
        const { VendorName, ContactPerson, Phone, Email, Address, GSTIN } = vendorData;
        const query = `
      UPDATE Vendors 
      SET VendorName=?, ContactPerson=?, Phone=?, Email=?, Address=?, GSTIN=? 
      WHERE VendorId=?
    `;
        db.query(query, [VendorName, ContactPerson, Phone, Email, Address, GSTIN, id], callback);
    },

    delete: (id, callback) => {
        db.query("DELETE FROM Vendors WHERE VendorId = ?", [id], callback);
    }
};

module.exports = Vendor;
