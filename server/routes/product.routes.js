const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");

// Specific routes first (before generic :id routes)
router.get("/stock-summary", productController.getStockSummary);
router.post("/bulk-import", productController.bulkImport);
router.get("/barcode/:barcode", productController.getByBarcode);
router.post("/stock", productController.updateStock);
router.get("/:id/stock", productController.getStock);

// Generic routes last
router.get("/", productController.getAll);
router.post("/", productController.create);
router.put("/:id", productController.update);
router.delete("/:id", productController.delete);

module.exports = router;
