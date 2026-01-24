const express = require("express");
const router = express.Router();
const companyController = require("../controllers/company.controller");

// Get all companies
router.get("/", companyController.getAll);

// Get company by ID
router.get("/:id", companyController.getById);

// Create new company
router.post("/", companyController.create);

// Update company
router.put("/:id", companyController.update);

// Delete company
router.delete("/:id", companyController.delete);

// Upload company logo
router.post("/:id/logo", companyController.uploadLogo);

module.exports = router;
