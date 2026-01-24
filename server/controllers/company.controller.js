const Company = require("../models/company.model");

const companyController = {
    // Get all active companies
    getAll: (req, res) => {
        Company.findAll((err, data) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            res.json(data);
        });
    },

    // Get company by ID
    getById: (req, res) => {
        const { id } = req.params;
        Company.findById(id, (err, data) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            if (data.length === 0) {
                return res.status(404).json({ error: "Company not found" });
            }
            res.json(data[0]);
        });
    },

    // Create new company
    create: (req, res) => {
        const { CompanyName, Address, City, State, Country, Phone, Email, TaxID } = req.body;

        // Validate required fields
        if (!CompanyName) {
            return res.status(400).json({ error: "CompanyName is required" });
        }

        Company.create(req.body, (err, result) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({ error: "Company name already exists" });
                }
                return res.status(500).json({ error: "Database error", details: err });
            }

            // Initialize default accounts for the new company
            const db = require("../config/db");
            const defaultAccounts = [
                { name: "Cash in Hand", type: "CASH" },
                { name: "Main Bank Account", type: "BANK" }
            ];

            let accountsCreated = 0;
            defaultAccounts.forEach(account => {
                const accountQuery = "INSERT INTO Accounts (CompanyID, AccountName, AccountType, Balance) VALUES (?, ?, ?, 0)";
                db.query(accountQuery, [result.insertId, account.name, account.type], (accountErr) => {
                    if (accountErr) console.error("Default account creation error:", accountErr);
                    accountsCreated++;
                });
            });

            // Also create default warehouse
            const warehouseQuery = "INSERT INTO Warehouses (CompanyID, WarehouseName, City) VALUES (?, ?, ?)";
            db.query(warehouseQuery, [result.insertId, "Main Warehouse", City || "Default City"], (warehouseErr) => {
                if (warehouseErr) console.error("Default warehouse creation error:", warehouseErr);
            });

            res.status(201).json({
                success: true,
                message: "Company created successfully",
                companyId: result.insertId
            });
        });
    },

    // Update company
    update: (req, res) => {
        const { id } = req.params;
        const { CompanyName } = req.body;

        if (!CompanyName) {
            return res.status(400).json({ error: "CompanyName is required" });
        }

        Company.update(id, req.body, (err, result) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({ error: "Company name already exists" });
                }
                return res.status(500).json({ error: "Database error", details: err });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Company not found" });
            }

            res.json({
                success: true,
                message: "Company updated successfully"
            });
        });
    },

    // Delete (soft delete) company
    delete: (req, res) => {
        const { id } = req.params;

        // Prevent deletion of default company
        if (id === "1") {
            return res.status(400).json({ error: "Cannot delete default company" });
        }

        Company.delete(id, (err, result) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Company not found" });
            }

            res.json({
                success: true,
                message: "Company deleted successfully"
            });
        });
    },

    // Upload company logo
    uploadLogo: (req, res) => {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const logoPath = `/uploads/logos/${req.file.filename}`;

        Company.updateLogo(id, logoPath, (err, result) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Company not found" });
            }

            res.json({
                success: true,
                message: "Logo uploaded successfully",
                logoPath: logoPath
            });
        });
    }
};

module.exports = companyController;
