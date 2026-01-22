const Supplier = require("../models/supplier.model");

exports.getAllSuppliers = (req, res) => {
    Supplier.findAll((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.getSupplierById = (req, res) => {
    Supplier.findById(req.params.id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Supplier not found" });
        res.json(result[0]);
    });
};

exports.createSupplier = (req, res) => {
    Supplier.create(req.body, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Supplier created", id: result.insertId });
    });
};

exports.updateSupplier = (req, res) => {
    Supplier.update(req.params.id, req.body, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Supplier updated" });
    });
};

exports.deleteSupplier = (req, res) => {
    Supplier.delete(req.params.id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Supplier deleted" });
    });
};
