const db = require("../config/db");

const Company = {
    // Create a new company
    create: (companyData, callback) => {
        const query = `
            INSERT INTO Companies (
                CompanyName, LegalName, GSTIN, PAN, Email, Phone, 
                Website, Address, City, State, PostalCode, Country, 
                LogoPath, CompanyType
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            companyData.companyName,
            companyData.legalName,
            companyData.gstin,
            companyData.pan,
            companyData.email,
            companyData.phone,
            companyData.website,
            companyData.address,
            companyData.city,
            companyData.state,
            companyData.postalCode,
            companyData.country || 'India',
            companyData.logoPath,
            companyData.companyType
        ];
        db.query(query, values, callback);
    },

    // Get all companies
    getAll: (callback) => {
        const query = `
            SELECT * FROM Companies 
            WHERE IsActive = 1 
            ORDER BY CompanyName
        `;
        db.query(query, callback);
    },

    // Get company by ID
    getById: (companyId, callback) => {
        const query = "SELECT * FROM Companies WHERE CompanyID = ? AND IsActive = 1";
        db.query(query, [companyId], callback);
    },

    // Update company details
    update: (companyId, companyData, callback) => {
        const query = `
            UPDATE Companies SET
                CompanyName = ?, LegalName = ?, GSTIN = ?, PAN = ?,
                Email = ?, Phone = ?, Website = ?, Address = ?,
                City = ?, State = ?, PostalCode = ?, LogoPath = ?,
                CompanyType = ?, UpdatedDate = CURRENT_TIMESTAMP
            WHERE CompanyID = ?
        `;
        const values = [
            companyData.companyName,
            companyData.legalName,
            companyData.gstin,
            companyData.pan,
            companyData.email,
            companyData.phone,
            companyData.website,
            companyData.address,
            companyData.city,
            companyData.state,
            companyData.postalCode,
            companyData.logoPath,
            companyData.companyType,
            companyId
        ];
        db.query(query, values, callback);
    },

    // Delete (soft delete) company
    delete: (companyId, callback) => {
        const query = "UPDATE Companies SET IsActive = 0 WHERE CompanyID = ?";
        db.query(query, [companyId], callback);
    },

    // Get company by GSTIN
    getByGSTIN: (gstin, callback) => {
        const query = "SELECT * FROM Companies WHERE GSTIN = ? AND IsActive = 1";
        db.query(query, [gstin], callback);
    }
};

module.exports = Company;
