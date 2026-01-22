const express = require("express");
const router = express.Router();
const CompanyController = require("../controllers/company.controller");

// Create new company
router.post("/create", CompanyController.createCompany);

// Get all companies
router.get("/", CompanyController.getAllCompanies);

// Get company by ID
router.get("/:id", CompanyController.getCompanyById);

// Get company by GSTIN
router.get("/gstin/:gstin", CompanyController.getCompanyByGSTIN);

// Update company
router.put("/:id", CompanyController.updateCompany);

// Delete company (soft delete)
router.delete("/:id", CompanyController.deleteCompany);

module.exports = router;
