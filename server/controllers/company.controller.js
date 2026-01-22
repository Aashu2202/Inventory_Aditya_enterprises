const Company = require("../models/company.model");

const CompanyController = {
    // Create new company
    createCompany: (req, res) => {
        const { companyName, legalName, gstin, pan, email, phone, website, address, city, state, postalCode, country, logoPath, companyType } = req.body;

        // Validation
        if (!companyName || !gstin) {
            return res.status(400).json({ 
                success: false, 
                message: "Company Name and GSTIN are required" 
            });
        }

        const companyData = {
            companyName,
            legalName,
            gstin,
            pan,
            email,
            phone,
            website,
            address,
            city,
            state,
            postalCode,
            country,
            logoPath,
            companyType
        };

        Company.create(companyData, (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ 
                        success: false, 
                        message: "Company already exists" 
                    });
                }
                return res.status(500).json({ 
                    success: false, 
                    message: "Error creating company", 
                    error: err 
                });
            }

            res.status(201).json({ 
                success: true, 
                message: "Company created successfully", 
                companyId: result.insertId,
                data: companyData
            });
        });
    },

    // Get all companies
    getAllCompanies: (req, res) => {
        Company.getAll((err, companies) => {
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    message: "Error fetching companies", 
                    error: err 
                });
            }

            res.status(200).json({ 
                success: true, 
                data: companies 
            });
        });
    },

    // Get company by ID
    getCompanyById: (req, res) => {
        const { id } = req.params;

        Company.getById(id, (err, results) => {
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    message: "Error fetching company", 
                    error: err 
                });
            }

            if (!results || results.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Company not found" 
                });
            }

            res.status(200).json({ 
                success: true, 
                data: results[0] 
            });
        });
    },

    // Update company
    updateCompany: (req, res) => {
        const { id } = req.params;
        const { companyName, legalName, gstin, pan, email, phone, website, address, city, state, postalCode, logoPath, companyType } = req.body;

        const companyData = {
            companyName,
            legalName,
            gstin,
            pan,
            email,
            phone,
            website,
            address,
            city,
            state,
            postalCode,
            logoPath,
            companyType
        };

        Company.update(id, companyData, (err, result) => {
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    message: "Error updating company", 
                    error: err 
                });
            }

            res.status(200).json({ 
                success: true, 
                message: "Company updated successfully", 
                data: companyData
            });
        });
    },

    // Delete company (soft delete)
    deleteCompany: (req, res) => {
        const { id } = req.params;

        Company.delete(id, (err, result) => {
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    message: "Error deleting company", 
                    error: err 
                });
            }

            res.status(200).json({ 
                success: true, 
                message: "Company deleted successfully" 
            });
        });
    },

    // Get company by GSTIN
    getCompanyByGSTIN: (req, res) => {
        const { gstin } = req.params;

        Company.getByGSTIN(gstin, (err, results) => {
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    message: "Error fetching company", 
                    error: err 
                });
            }

            if (!results || results.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Company not found" 
                });
            }

            res.status(200).json({ 
                success: true, 
                data: results[0] 
            });
        });
    }
};

module.exports = CompanyController;
