const Product = require("../models/product.model");
const Category = require("../models/category.model");
const db = require("../config/db");

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
            if (err) {
                console.error('Delete product error:', err);
                return res.status(500).json({ error: "Database error", details: err.message });
            }
            res.json({ success: true, message: "Product deleted successfully" });
        });
    },

    getStockSummary: (req, res) => {
        Product.getStockSummary((err, results) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            res.json(results);
        });
    },

    bulkImport: async (req, res) => {
        try {
            const { products } = req.body;
            if (!products || !Array.isArray(products) || products.length === 0) {
                return res.status(400).json({ message: "No products provided" });
            }

            const categoryNames = new Set();
            const categoriesMap = new Map();

            // First, get existing categories
            const existingCategories = await new Promise((resolve, reject) => {
                db.query("SELECT CategoryID, CategoryName FROM categories", (err, results) => {
                    if (err) reject(err);
                    else resolve(results || []);
                });
            });

            existingCategories.forEach(cat => {
                categoriesMap.set(cat.CategoryName.toLowerCase(), cat.CategoryID);
            });

            // Collect unique categories from import
            products.forEach(product => {
                if (product['Category']) {
                    categoryNames.add(product['Category']);
                }
            });

            // Create missing categories
            for (const catName of categoryNames) {
                if (!categoriesMap.has(catName.toLowerCase())) {
                    const newCatId = await new Promise((resolve, reject) => {
                        db.query(
                            "INSERT INTO categories (CategoryName) VALUES (?)",
                            [catName],
                            (err, result) => {
                                if (err) reject(err);
                                else resolve(result.insertId);
                            }
                        );
                    });
                    categoriesMap.set(catName.toLowerCase(), newCatId);
                }
            }

            // Insert products
            let successCount = 0;
            let errors = [];

            for (const product of products) {
                try {
                    const productData = {
                        ProductName: product['Product Name'] || '',
                        HSNCode: product['HSN Code'] || '',
                        Barcode: product['Barcode / EAN (auto-generate if blank)'] || `890${Date.now().toString().slice(-10)}`,
                        CategoryID: categoriesMap.get(product['Category']?.toLowerCase()) || null,
                        SupplierID: product['Primary Supplier (optional)'] ? 1 : null, // Default to 1 if supplier name provided
                        RetailPrice: parseFloat(product['Retail Price']) || 0,
                        WholesalePrice: parseFloat(product['Wholesale Price']) || 0,
                        UnitPrice: parseFloat(product['Retail Price']) || 0
                    };

                    // Validate required fields
                    if (!productData.ProductName || !productData.RetailPrice) {
                        errors.push(`Row skipped: Missing Product Name or Retail Price`);
                        continue;
                    }

                    await new Promise((resolve, reject) => {
                        Product.create(productData, (err, result) => {
                            if (err) reject(err);
                            else {
                                // Initialize stock
                                Product.updateStock(result.insertId, 1, 0, () => {
                                    resolve();
                                });
                            }
                        });
                    });

                    successCount++;
                } catch (error) {
                    errors.push(`Error importing "${product['Product Name']}": ${error.message}`);
                }
            }

            res.json({
                success: true,
                message: `${successCount} products imported successfully`,
                successCount,
                errors: errors.length > 0 ? errors : undefined
            });
        } catch (error) {
            console.error('Bulk import error:', error);
            res.status(500).json({ message: "Bulk import failed", details: error.message });
        }
    }
};

module.exports = productController;
