const AccessToken = require("../models/accessToken.model");
const FinancialYear = require("../models/financialYear.model");

const AccessTokenController = {
    // Generate new token for financial year
    generateToken: (req, res) => {
        const { companyId, financialYearId, tokenType, expiryDate } = req.body;
        const userId = req.userId; // From auth middleware

        if (!companyId || !financialYearId) {
            return res.status(400).json({
                success: false,
                message: "Company ID and Financial Year ID are required"
            });
        }

        const tokenData = {
            companyId,
            financialYearId,
            tokenType: tokenType || 'Annual',
            generatedBy: userId,
            expiryDate
        };

        AccessToken.generateToken(tokenData, (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Error generating token",
                    error: err
                });
            }

            res.status(201).json({
                success: true,
                message: "Token generated successfully",
                token: result.tokenValue,
                tokenId: result.insertId,
                expiryDate: expiryDate
            });
        });
    },

    // Verify token
    verifyToken: (req, res) => {
        const { token, companyId, financialYearId } = req.body;

        if (!token || !companyId || !financialYearId) {
            return res.status(400).json({
                success: false,
                message: "Token, Company ID and Financial Year ID are required"
            });
        }

        AccessToken.verifyToken(token, companyId, financialYearId, (err, isValid, tokenData) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Error verifying token",
                    error: err
                });
            }

            if (!isValid) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid or expired token"
                });
            }

            res.status(200).json({
                success: true,
                message: "Token is valid",
                isValid: true,
                expiryDate: tokenData.ExpiryDate
            });
        });
    },

    // Get token for company and financial year
    getTokenByCompanyAndFY: (req, res) => {
        const { companyId, financialYearId } = req.params;

        AccessToken.getTokenByCompanyAndFY(companyId, financialYearId, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Error fetching token",
                    error: err
                });
            }

            if (!results || results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Token not found"
                });
            }

            res.status(200).json({
                success: true,
                data: results[0]
            });
        });
    },

    // Get all tokens for company
    getTokensByCompany: (req, res) => {
        const { companyId } = req.params;

        AccessToken.getTokensByCompany(companyId, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Error fetching tokens",
                    error: err
                });
            }

            res.status(200).json({
                success: true,
                data: results
            });
        });
    },

    // Regenerate token for financial year
    regenerateToken: (req, res) => {
        const { companyId, financialYearId, expiryDate } = req.body;
        const userId = req.userId; // From auth middleware

        if (!companyId || !financialYearId) {
            return res.status(400).json({
                success: false,
                message: "Company ID and Financial Year ID are required"
            });
        }

        AccessToken.regenerateToken(companyId, financialYearId, userId, expiryDate, (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Error regenerating token",
                    error: err
                });
            }

            res.status(201).json({
                success: true,
                message: "Token regenerated successfully",
                token: result.tokenValue,
                tokenId: result.tokenId
            });
        });
    },

    // Revoke token
    revokeToken: (req, res) => {
        const { tokenId } = req.params;

        AccessToken.revokeToken(tokenId, (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Error revoking token",
                    error: err
                });
            }

            res.status(200).json({
                success: true,
                message: "Token revoked successfully"
            });
        });
    }
};

module.exports = AccessTokenController;
