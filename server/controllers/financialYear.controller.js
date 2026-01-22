const FinancialYear = require("../models/financialYear.model");

const FinancialYearController = {
    // Create new financial year
    createFinancialYear: (req, res) => {
        const { companyId, fyName, startDate, endDate } = req.body;

        if (!companyId || !fyName || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Company ID, FY Name, Start Date and End Date are required"
            });
        }

        // Validate date range
        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({
                success: false,
                message: "Start date must be before end date"
            });
        }

        // Check if FY already exists
        FinancialYear.exists(companyId, fyName, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Error checking financial year",
                    error: err
                });
            }

            if (results && results.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Financial year already exists for this company"
                });
            }

            const fyData = {
                companyId,
                fyName,
                startDate,
                endDate
            };

            FinancialYear.create(fyData, (err, result) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: "Error creating financial year",
                        error: err
                    });
                }

                res.status(201).json({
                    success: true,
                    message: "Financial year created successfully",
                    financialYearId: result.insertId,
                    data: {
                        ...fyData,
                        status: 'Active'
                    }
                });
            });
        });
    },

    // Get all financial years for company
    getByCompany: (req, res) => {
        const { companyId } = req.params;

        FinancialYear.getByCompany(companyId, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Error fetching financial years",
                    error: err
                });
            }

            res.status(200).json({
                success: true,
                data: results
            });
        });
    },

    // Get active financial year
    getActive: (req, res) => {
        const { companyId } = req.params;

        FinancialYear.getActive(companyId, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Error fetching active financial year",
                    error: err
                });
            }

            if (!results || results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "No active financial year found"
                });
            }

            res.status(200).json({
                success: true,
                data: results[0]
            });
        });
    },

    // Get financial year by ID
    getById: (req, res) => {
        const { id } = req.params;

        FinancialYear.getById(id, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Error fetching financial year",
                    error: err
                });
            }

            if (!results || results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Financial year not found"
                });
            }

            res.status(200).json({
                success: true,
                data: results[0]
            });
        });
    },

    // Update financial year status
    updateStatus: (req, res) => {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['Active', 'Closed', 'Archived'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be Active, Closed, or Archived"
            });
        }

        FinancialYear.updateStatus(id, status, (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Error updating financial year",
                    error: err
                });
            }

            res.status(200).json({
                success: true,
                message: `Financial year status updated to ${status}`,
                status
            });
        });
    },

    // Get financial year by date
    getByDateRange: (req, res) => {
        const { companyId, date } = req.params;

        FinancialYear.getByDateRange(companyId, date, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Error fetching financial year",
                    error: err
                });
            }

            if (!results || results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "No financial year found for this date"
                });
            }

            res.status(200).json({
                success: true,
                data: results[0]
            });
        });
    }
};

module.exports = FinancialYearController;
