const Purchase = require("../models/purchase.model");

exports.getAllPurchases = (req, res) => {
    Purchase.findAll((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.getPurchaseById = (req, res) => {
    Purchase.findById(req.params.id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!result) return res.status(404).json({ message: "Purchase not found" });
        res.json(result);
    });
};

exports.createPurchase = (req, res) => {
    const { purchaseData, details, warehouseID } = req.body;
    if (!purchaseData || !details || !warehouseID) {
        return res.status(400).json({ message: "Missing required data" });
    }

    Purchase.create(purchaseData, details, warehouseID, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Purchase recorded successfully", purchaseID: result.purchaseID });
    });
};
