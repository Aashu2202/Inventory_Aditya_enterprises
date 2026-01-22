const Sale = require("../models/sale.model");

const saleController = {
    create: (req, res) => {
        Sale.create(req.body, (err, result) => {
            if (err) return res.status(500).json({ error: "Checkout error", details: err });
            res.json({ success: true, message: "Sale completed successfully", saleId: result.saleId });
        });
    },

    getAll: (req, res) => {
        Sale.findAll((err, data) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            res.json(data);
        });
    },

    getById: (req, res) => {
        Sale.findById(req.params.id, (err, data) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            res.json(data);
        });
    }
};

module.exports = saleController;
