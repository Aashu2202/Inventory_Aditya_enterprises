const express = require("express");
const router = express.Router();
const StockMovement = require("../models/stockMovement.model");

router.get("/", (req, res) => {
    StockMovement.findAll((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

router.get("/product/:id", (req, res) => {
    StockMovement.findByProduct(req.params.id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

module.exports = router;
