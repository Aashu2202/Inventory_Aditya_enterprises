const FYTransfer = require("../models/fyTransfer.model");
const FinancialYear = require("../models/financialYear.model");

const FYTransferController = {
    // Initiate financial year transfer
    initiateTransfer: (req, res) => {
        const { companyId, fromFinancialYearId, toFinancialYearId, description } = req.body;
        const userId = req.userId; // From auth middleware

        if (!companyId || !fromFinancialYearId || !toFinancialYearId) {
            return res.status(400).json({
                success: false,
                message: "Company ID, From FY ID and To FY ID are required"
            });
        }

        if (fromFinancialYearId === toFinancialYearId) {
            return res.status(400).json({
                success: false,
                message: "Source and destination financial years cannot be the same"
            });
        }

        const transferData = {
            companyId,
            fromFinancialYearId,
            toFinancialYearId,
            transferredBy: userId,
            description: description || ''
        };

        FYTransfer.createTransferLog(transferData, (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Error creating transfer log",
                    error: err
                });
            }

            res.status(201).json({
                success: true,
                message: "Transfer initiated successfully",
                transferId: result.insertId,
                status: 'Pending'
            });
        });
    },

    // Get transfer logs for company
    getTransferLogs: (req, res) => {
        const { companyId } = req.params;

        FYTransfer.getByCompany(companyId, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Error fetching transfer logs",
                    error: err
                });
            }

            res.status(200).json({
                success: true,
                data: results
            });
        });
    },

    // Get transfer log details
    getTransferLogById: (req, res) => {
        const { id } = req.params;

        FYTransfer.getById(id, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Error fetching transfer log",
                    error: err
                });
            }

            if (!results || results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Transfer log not found"
                });
            }

            res.status(200).json({
                success: true,
                data: results[0]
            });
        });
    },

    // Execute financial year transfer
    executeTransfer: (req, res) => {
        const { id } = req.params;
        const { companyId, fromFinancialYearId, toFinancialYearId } = req.body;

        if (!companyId || !fromFinancialYearId || !toFinancialYearId) {
            return res.status(400).json({
                success: false,
                message: "Company ID, From FY ID and To FY ID are required"
            });
        }

        // Validate both financial years exist
        FinancialYear.getById(fromFinancialYearId, (err1, fromResults) => {
            if (err1 || !fromResults || fromResults.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Source financial year not found"
                });
            }

            FinancialYear.getById(toFinancialYearId, (err2, toResults) => {
                if (err2 || !toResults || toResults.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Destination financial year not found"
                    });
                }

                // Execute transfer
                FYTransfer.completeTransfer(id, companyId, fromFinancialYearId, toFinancialYearId, (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: "Error executing transfer",
                            error: err
                        });
                    }

                    res.status(200).json({
                        success: true,
                        message: "Financial year transfer completed successfully",
                        status: 'Completed'
                    });
                });
            });
        });
    },

    // Cancel/Reject transfer
    cancelTransfer: (req, res) => {
        const { id } = req.params;
        const { notes } = req.body;

        FYTransfer.updateStatus(id, 'Failed', notes || '', (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Error cancelling transfer",
                    error: err
                });
            }

            res.status(200).json({
                success: true,
                message: "Transfer cancelled successfully"
            });
        });
    }
};

module.exports = FYTransferController;
