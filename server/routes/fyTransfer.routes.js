const express = require("express");
const router = express.Router();
const FYTransferController = require("../controllers/fyTransfer.controller");

// Initiate financial year transfer
router.post("/initiate", FYTransferController.initiateTransfer);

// Get transfer logs for company
router.get("/company/:companyId", FYTransferController.getTransferLogs);

// Get transfer log details
router.get("/:id", FYTransferController.getTransferLogById);

// Execute transfer
router.post("/:id/execute", FYTransferController.executeTransfer);

// Cancel transfer
router.post("/:id/cancel", FYTransferController.cancelTransfer);

module.exports = router;
