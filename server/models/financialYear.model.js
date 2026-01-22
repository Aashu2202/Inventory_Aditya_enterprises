const db = require("../config/db");

const FinancialYear = {
    // Create a new financial year
    create: (fyData, callback) => {
        const query = `
            INSERT INTO FinancialYears (CompanyID, FYName, StartDate, EndDate, Status)
            VALUES (?, ?, ?, ?, 'Active')
        `;
        
        const values = [
            fyData.companyId,
            fyData.fyName,
            fyData.startDate,
            fyData.endDate
        ];
        
        db.query(query, values, callback);
    },

    // Get all financial years for a company
    getByCompany: (companyId, callback) => {
        const query = `
            SELECT * FROM FinancialYears 
            WHERE CompanyID = ? 
            ORDER BY StartDate DESC
        `;
        db.query(query, [companyId], callback);
    },

    // Get active financial year for a company
    getActive: (companyId, callback) => {
        const query = `
            SELECT * FROM FinancialYears 
            WHERE CompanyID = ? AND Status = 'Active'
            LIMIT 1
        `;
        db.query(query, [companyId], callback);
    },

    // Get financial year by ID
    getById: (financialYearId, callback) => {
        const query = "SELECT * FROM FinancialYears WHERE FinancialYearID = ?";
        db.query(query, [financialYearId], callback);
    },

    // Check if financial year exists
    exists: (companyId, fyName, callback) => {
        const query = `
            SELECT * FROM FinancialYears 
            WHERE CompanyID = ? AND FYName = ?
            LIMIT 1
        `;
        db.query(query, [companyId, fyName], callback);
    },

    // Update financial year status
    updateStatus: (financialYearId, status, callback) => {
        let updateQuery = `
            UPDATE FinancialYears 
            SET Status = ?
        `;
        const values = [status];

        if (status === 'Closed') {
            updateQuery += `, ClosedDate = CURRENT_TIMESTAMP`;
        }
        
        updateQuery += ` WHERE FinancialYearID = ?`;
        values.push(financialYearId);

        db.query(updateQuery, values, callback);
    },

    // Get financial year by date range
    getByDateRange: (companyId, date, callback) => {
        const query = `
            SELECT * FROM FinancialYears 
            WHERE CompanyID = ? 
            AND StartDate <= ? 
            AND EndDate >= ?
            LIMIT 1
        `;
        db.query(query, [companyId, date, date], callback);
    }
};

module.exports = FinancialYear;
