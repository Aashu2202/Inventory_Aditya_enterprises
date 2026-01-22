const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");

router.get("/", productController.getAll);
router.get("/stock-summary", productController.getStockSummary);
router.post("/", productController.create);
router.get("/barcode/:barcode", productController.getByBarcode);
router.get("/:id/stock", productController.getStock);
router.post("/stock", productController.updateStock);
router.put("/:id", productController.update);
router.delete("/:id", productController.delete);

module.exports = router;
