const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");

router.get("/", orderController.getAllOrders);
router.get("/gst-sales", orderController.getGSTSales);
router.get("/:id", orderController.getOrderById);
router.post("/", orderController.createOrder);

module.exports = router;
