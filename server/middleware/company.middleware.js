const db = require("../config/db");

// Middleware to resolve active company from header, query param, or default
const companyMiddleware = (req, res, next) => {
    // Check for companyId in: header, query, body (in order of priority)
    let companyId = req.headers["x-company-id"] || 
                    req.query.companyId || 
                    req.body.companyId || 
                    1; // Default to company ID 1

    // Verify company exists
    const query = "SELECT CompanyID, CompanyName FROM Companies WHERE CompanyID = ? AND IsActive = 1";
    db.query(query, [companyId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database error", details: err });
        }

        if (results.length === 0) {
            // Fall back to default company if specified company doesn't exist
            companyId = 1;
        }

        // Attach to request object for use in controllers
        req.companyId = companyId;
        next();
    });
};

module.exports = companyMiddleware;
