const db = require("../config/db");
const crypto = require("crypto");

const AccessToken = {
    // Generate a new token for a financial year
    generateToken: (tokenData, callback) => {
        const tokenValue = crypto.randomBytes(32).toString('hex');
        
        const query = `
            INSERT INTO AccessTokens (
                CompanyID, FinancialYearID, TokenValue, TokenType, 
                GeneratedBy, IsActive, ExpiryDate
            ) VALUES (?, ?, ?, ?, ?, 1, ?)
        `;
        
        const values = [
            tokenData.companyId,
            tokenData.financialYearId,
            tokenValue,
            tokenData.tokenType || 'Annual',
            tokenData.generatedBy,
            tokenData.expiryDate
        ];
        
        db.query(query, values, (err, result) => {
            if (err) {
                return callback(err);
            }
            callback(null, { ...result, tokenValue });
        });
    },

    // Verify token validity
    verifyToken: (tokenValue, companyId, financialYearId, callback) => {
        const query = `
            SELECT * FROM AccessTokens 
            WHERE TokenValue = ? 
            AND CompanyID = ? 
            AND FinancialYearID = ? 
            AND IsActive = 1 
            AND (ExpiryDate IS NULL OR ExpiryDate > NOW())
        `;
        
        db.query(query, [tokenValue, companyId, financialYearId], (err, results) => {
            if (err) {
                return callback(err, false);
            }
            
            if (results && results.length > 0) {
                // Update last used date
                const updateQuery = `
                    UPDATE AccessTokens 
                    SET LastUsedDate = CURRENT_TIMESTAMP 
                    WHERE TokenID = ?
                `;
                db.query(updateQuery, [results[0].TokenID]);
                callback(null, true, results[0]);
            } else {
                callback(null, false);
            }
        });
    },

    // Get token by company and financial year
    getTokenByCompanyAndFY: (companyId, financialYearId, callback) => {
        const query = `
            SELECT TokenID, CompanyID, FinancialYearID, TokenType, 
                   GeneratedBy, IsActive, IssuedDate, ExpiryDate, LastUsedDate
            FROM AccessTokens 
            WHERE CompanyID = ? 
            AND FinancialYearID = ? 
            AND IsActive = 1
            LIMIT 1
        `;
        
        db.query(query, [companyId, financialYearId], callback);
    },

    // Get all tokens for a company
    getTokensByCompany: (companyId, callback) => {
        const query = `
            SELECT t.TokenID, t.CompanyID, t.FinancialYearID, t.TokenType, 
                   t.IsActive, t.IssuedDate, t.ExpiryDate, t.LastUsedDate,
                   f.FYName, f.StartDate, f.EndDate
            FROM AccessTokens t
            JOIN FinancialYears f ON t.FinancialYearID = f.FinancialYearID
            WHERE t.CompanyID = ? 
            ORDER BY t.IssuedDate DESC
        `;
        
        db.query(query, [companyId], callback);
    },

    // Deactivate token (revoke)
    revokeToken: (tokenId, callback) => {
        const query = "UPDATE AccessTokens SET IsActive = 0 WHERE TokenID = ?";
        db.query(query, [tokenId], callback);
    },

    // Regenerate token for a financial year
    regenerateToken: (companyId, financialYearId, userId, expiryDate, callback) => {
        // First revoke old tokens for this FY
        const revokeQuery = `
            UPDATE AccessTokens 
            SET IsActive = 0 
            WHERE CompanyID = ? AND FinancialYearID = ?
        `;
        
        db.query(revokeQuery, [companyId, financialYearId], (err) => {
            if (err) {
                return callback(err);
            }
            
            // Generate new token
            const tokenValue = crypto.randomBytes(32).toString('hex');
            const generateQuery = `
                INSERT INTO AccessTokens (
                    CompanyID, FinancialYearID, TokenValue, TokenType,
                    GeneratedBy, IsActive, ExpiryDate
                ) VALUES (?, ?, ?, 'Annual', ?, 1, ?)
            `;
            
            db.query(generateQuery, [companyId, financialYearId, tokenValue, userId, expiryDate], (err, result) => {
                if (err) {
                    return callback(err);
                }
                callback(null, { tokenValue, tokenId: result.insertId });
            });
        });
    },

    // Check if token is expired
    isTokenExpired: (expiryDate, callback) => {
        const isExpired = expiryDate && new Date(expiryDate) < new Date();
        callback(null, isExpired);
    }
};

module.exports = AccessToken;
