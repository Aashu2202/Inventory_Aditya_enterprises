const Store = require("../models/store.model");

const storeController = {
    getAll: (req, res) => {
        Store.findAll((err, data) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            res.json(data);
        });
    },

    create: (req, res) => {
        Store.create(req.body, (err, result) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            res.json({ success: true, message: "Store created successfully", id: result.insertId });
        });
    },

    getInventory: (req, res) => {
        Store.getInventory(req.params.id, (err, data) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            res.json(data);
        });
    },

    update: (req, res) => {
        Store.update(req.params.id, req.body, (err, result) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            res.json({ success: true, message: "Store updated successfully" });
        });
    },

    delete: (req, res) => {
        Store.delete(req.params.id, (err, result) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            res.json({ success: true, message: "Store deleted successfully" });
        });
    }
};

module.exports = storeController;
