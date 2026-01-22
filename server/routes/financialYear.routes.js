const express = require("express");
const router = express.Router();
const FinancialYearController = require("../controllers/financialYear.controller");

// Create new financial year
router.post("/create", FinancialYearController.createFinancialYear);

// Get all financial years for company
router.get("/company/:companyId", FinancialYearController.getByCompany);

// Get active financial year for company
router.get("/company/:companyId/active", FinancialYearController.getActive);

// Get financial year by date
router.get("/company/:companyId/date/:date", FinancialYearController.getByDateRange);

// Get financial year by ID
router.get("/:id", FinancialYearController.getById);

// Update financial year status
router.put("/:id/status", FinancialYearController.updateStatus);

module.exports = router;
