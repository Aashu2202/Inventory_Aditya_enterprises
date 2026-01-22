const Product = require("../models/product.model");

const productController = {
    getAll: (req, res) => {
        Product.findAll((err, data) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            res.json(data);
        });
    },

    create: (req, res) => {
        // Validate and set default UnitPrice from RetailPrice if empty
        const productData = req.body;
        if (!productData.UnitPrice || productData.UnitPrice === '') {
            productData.UnitPrice = productData.RetailPrice || productData.WholesalePrice || 0;
        }
        
        Product.create(productData, (err, result) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });

            const productId = result.insertId;
            // Initialize stock in Main Warehouse (StoreId 1) with 0 quantity
            Product.updateStock(productId, 1, 0, (stockErr) => {
                if (stockErr) console.error("Stock initialization error:", stockErr);
                res.json({ success: true, message: "Product created and stock initialized", id: productId });
            });
        });
    },

    getByBarcode: (req, res) => {
        Product.findByBarcode(req.params.barcode, (err, data) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            if (data.length > 0) {
                res.json(data[0]);
            } else {
                res.status(404).json({ message: "Product not found" });
            }
        });
    },

    updateStock: (req, res) => {
        const { productId, storeId, quantity } = req.body;
        Product.updateStock(productId, storeId, quantity, (err, result) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            res.json({ success: true, message: "Stock updated successfully" });
        });
    },

    getStock: (req, res) => {
        Product.getStock(req.params.id, (err, data) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            res.json(data);
        });
    },

    update: (req, res) => {
        // Validate and set default UnitPrice from RetailPrice if empty
        const productData = req.body;
        if (!productData.UnitPrice || productData.UnitPrice === '') {
            productData.UnitPrice = productData.RetailPrice || productData.WholesalePrice || 0;
        }
        
        Product.update(req.params.id, productData, (err, result) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            res.json({ success: true, message: "Product updated successfully" });
        });
    },

    delete: (req, res) => {
        Product.delete(req.params.id, (err, result) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            res.json({ success: true, message: "Product deleted successfully" });
        });
    },

    getStockSummary: (req, res) => {
        Product.getStockSummary((err, results) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            res.json(results);
        });
    }
};

module.exports = productController;
