const express = require("express");
const router = express.Router();
const billController = require("../controllers/bill.controller");
const companyMiddleware = require("../middleware/company.middleware");

// Apply company middleware to all bill routes
router.use(companyMiddleware);

// Get all bills for active company
router.get("/", billController.getAll);

// Get bill by ID
router.get("/:id", billController.getById);

// Create new bill
router.post("/", billController.create);

// Update bill
router.put("/:id", billController.update);

// Add items to bill
router.post("/:id/items", billController.addItem);

// Delete item from bill
router.delete("/:billId/items/:itemId", billController.deleteItem);

// Finalize bill
router.post("/:id/finalize", billController.finalize);

// Cancel bill
router.post("/:id/cancel", billController.cancel);

module.exports = router;
