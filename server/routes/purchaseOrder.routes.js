const express = require("express");
const router = express.Router();
const purchaseOrderController = require("../controllers/purchaseOrder.controller");

router.get("/", purchaseOrderController.getAll);
router.post("/", purchaseOrderController.create);
router.patch("/:id/status", purchaseOrderController.updateStatus);

module.exports = router;
