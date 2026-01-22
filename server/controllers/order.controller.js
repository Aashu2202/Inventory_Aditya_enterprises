const Order = require("../models/order.model");

exports.getAllOrders = (req, res) => {
    Order.findAll((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.getOrderById = (req, res) => {
    Order.findById(req.params.id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!result) return res.status(404).json({ message: "Order not found" });
        res.json(result);
    });
};

exports.createOrder = (req, res) => {
    const { orderData, details, warehouseID } = req.body;
    if (!orderData || !details || !warehouseID) {
        return res.status(400).json({ message: "Missing required data" });
    }

    Order.create(orderData, details, warehouseID, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Order recorded successfully", orderID: result.orderID });
    });
};

exports.getGSTSales = (req, res) => {
    Order.getGSTSales((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};
