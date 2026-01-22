const PurchaseOrder = require("../models/purchaseOrder.model");

const purchaseOrderController = {
    create: (req, res) => {
        PurchaseOrder.create(req.body, (err, result) => {
            if (err) return res.status(500).json({ error: "Order creation failed", details: err });
            res.json({ success: true, message: "Purchase order created", orderId: result.orderId });
        });
    },

    getAll: (req, res) => {
        PurchaseOrder.findAll((err, data) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            res.json(data);
        });
    },

    updateStatus: (req, res) => {
        PurchaseOrder.updateStatus(req.params.id, req.body.Status, (err, result) => {
            if (err) return res.status(500).json({ error: "Status update failed", details: err });
            res.json({ success: true, message: "Order status updated" });
        });
    }
};

module.exports = purchaseOrderController;
