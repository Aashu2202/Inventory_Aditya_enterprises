const Vendor = require("../models/vendor.model");

const vendorController = {
    getAll: (req, res) => {
        Vendor.findAll((err, data) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            res.json(data);
        });
    },

    create: (req, res) => {
        Vendor.create(req.body, (err, result) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            res.json({ success: true, message: "Vendor added successfully", id: result.insertId });
        });
    },

    update: (req, res) => {
        Vendor.update(req.params.id, req.body, (err, result) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            res.json({ success: true, message: "Vendor updated successfully" });
        });
    },

    delete: (req, res) => {
        Vendor.delete(req.params.id, (err, result) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            res.json({ success: true, message: "Vendor removed successfully" });
        });
    }
};

module.exports = vendorController;
