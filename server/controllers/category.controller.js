const Category = require("../models/category.model");

const categoryController = {
    getAll: (req, res) => {
        Category.findAll((err, data) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            res.json(data);
        });
    },

    create: (req, res) => {
        Category.create(req.body, (err, result) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            res.json({ success: true, message: "Category created successfully", id: result.insertId });
        });
    },

    update: (req, res) => {
        Category.update(req.params.id, req.body, (err, result) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            res.json({ success: true, message: "Category updated successfully" });
        });
    },

    delete: (req, res) => {
        Category.delete(req.params.id, (err, result) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            res.json({ success: true, message: "Category deleted successfully" });
        });
    }
};

module.exports = categoryController;
