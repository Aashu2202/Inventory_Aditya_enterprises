const db = require("../config/db");

const Company = {
    findAll: (callback) => {
        const query = "SELECT * FROM Companies WHERE IsActive = 1 ORDER BY CompanyName";
        db.query(query, callback);
    },

    findById: (id, callback) => {
        const query = "SELECT * FROM Companies WHERE CompanyID = ? AND IsActive = 1";
        db.query(query, [id], callback);
    },

    create: (data, callback) => {
        const query = "INSERT INTO Companies (CompanyName, Address, City, State, Country, Phone, Email, TaxID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        const values = [
            data.CompanyName,
            data.Address || null,
            data.City || null,
            data.State || null,
            data.Country || "India",
            data.Phone || null,
            data.Email || null,
            data.TaxID || null
        ];
        db.query(query, values, callback);
    },

    update: (id, data, callback) => {
        const query = "UPDATE Companies SET CompanyName = ?, Address = ?, City = ?, State = ?, Country = ?, Phone = ?, Email = ?, TaxID = ? WHERE CompanyID = ?";
        const values = [
            data.CompanyName,
            data.Address || null,
            data.City || null,
            data.State || null,
            data.Country || "India",
            data.Phone || null,
            data.Email || null,
            data.TaxID || null,
            id
        ];
        db.query(query, values, callback);
    },

    // Soft delete - mark as inactive
    delete: (id, callback) => {
        const query = "UPDATE Companies SET IsActive = 0 WHERE CompanyID = ?";
        db.query(query, [id], callback);
    },

    // Upload company logo
    updateLogo: (id, logoPath, callback) => {
        const query = "UPDATE Companies SET LogoPath = ? WHERE CompanyID = ?";
        db.query(query, [logoPath, id], callback);
    }
};

module.exports = Company;
