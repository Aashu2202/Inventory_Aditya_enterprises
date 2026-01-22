const express = require("express");
const router = express.Router();
const saleController = require("../controllers/sale.controller");

router.get("/", saleController.getAll);
router.get("/:id", saleController.getById);
router.post("/", saleController.create);

module.exports = router;
