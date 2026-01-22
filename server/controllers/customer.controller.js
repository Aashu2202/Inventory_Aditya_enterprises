const Customer = require("../models/customer.model");

exports.getAllCustomers = (req, res) => {
    Customer.findAll((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.getCustomerById = (req, res) => {
    Customer.findById(req.params.id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Customer not found" });
        res.json(result[0]);
    });
};

exports.createCustomer = (req, res) => {
    Customer.create(req.body, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Customer created", id: result.insertId });
    });
};

exports.updateCustomer = (req, res) => {
    Customer.update(req.params.id, req.body, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Customer updated" });
    });
};

exports.deleteCustomer = (req, res) => {
    Customer.delete(req.params.id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Customer deleted" });
    });
};
