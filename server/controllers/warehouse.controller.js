const Warehouse = require("../models/warehouse.model");

exports.getAllWarehouses = (req, res) => {
    Warehouse.findAll((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.getWarehouseById = (req, res) => {
    Warehouse.findById(req.params.id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Warehouse not found" });
        res.json(result[0]);
    });
};

exports.createWarehouse = (req, res) => {
    Warehouse.create(req.body, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Warehouse created", id: result.insertId });
    });
};

exports.updateWarehouse = (req, res) => {
    Warehouse.update(req.params.id, req.body, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Warehouse updated" });
    });
};

exports.deleteWarehouse = (req, res) => {
    Warehouse.delete(req.params.id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Warehouse deleted" });
    });
};
