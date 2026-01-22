const Transfer = require("../models/transfer.model");

const transferController = {
    create: (req, res) => {
        Transfer.create(req.body, (err, result) => {
            if (err) return res.status(500).json({ error: "Database error or insufficient stock", details: err });
            res.json({ success: true, message: "Stock transferred successfully" });
        });
    },

    getAll: (req, res) => {
        Transfer.findAll((err, data) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            res.json(data);
        });
    }
};

module.exports = transferController;
