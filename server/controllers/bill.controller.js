const Bill = require("../models/bill.model");

const billController = {
    // Get all bills for a company
    getAll: (req, res) => {
        const companyId = req.companyId || req.headers["x-company-id"] || req.query.companyId || 1;

        Bill.findAll(companyId, (err, data) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            res.json(data);
        });
    },

    // Get bill by ID with items
    getById: (req, res) => {
        const { id } = req.params;

        Bill.findById(id, (err, billData) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            if (billData.length === 0) {
                return res.status(404).json({ error: "Bill not found" });
            }

            Bill.getBillItems(id, (itemErr, itemData) => {
                if (itemErr) return res.status(500).json({ error: "Database error", details: itemErr });

                const bill = billData[0];
                bill.items = itemData;
                res.json(bill);
            });
        });
    },

    // Create new bill
    create: (req, res) => {
        const companyId = req.companyId || req.headers["x-company-id"] || req.query.companyId || 1;
        const { CustomerID, OrderID, BillDate, Notes, Terms, items } = req.body;

        if (!CustomerID) {
            return res.status(400).json({ error: "CustomerID is required" });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ error: "Bill must have at least one item" });
        }

        // Generate bill number
        Bill.getNextBillNumber(companyId, (numErr, billNumber) => {
            if (numErr) return res.status(500).json({ error: "Error generating bill number", details: numErr });

            const billData = {
                CompanyID: companyId,
                BillNumber: billNumber,
                OrderID: OrderID || null,
                CustomerID: CustomerID,
                BillDate: BillDate || new Date(),
                Notes: Notes || null,
                Terms: Terms || null
            };

            Bill.create(billData, (createErr, result) => {
                if (createErr) {
                    return res.status(500).json({ error: "Database error", details: createErr });
                }

                const billId = result.insertId;

                // Add items to bill
                Bill.addItem(billId, items, (itemErr) => {
                    if (itemErr) {
                        return res.status(500).json({ error: "Error adding bill items", details: itemErr });
                    }

                    res.status(201).json({
                        success: true,
                        message: "Bill created successfully",
                        billId: billId,
                        billNumber: billNumber
                    });
                });
            });
        });
    },

    // Update bill (only if in DRAFT status)
    update: (req, res) => {
        const { id } = req.params;
        const { Notes, Terms, BillDate, DueDate } = req.body;

        Bill.update(id, { Notes, Terms, BillDate, DueDate }, (err, result) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });

            if (result.affectedRows === 0) {
                return res.status(400).json({ error: "Bill cannot be updated (not in DRAFT status or not found)" });
            }

            res.json({
                success: true,
                message: "Bill updated successfully"
            });
        });
    },

    // Add item to bill
    addItem: (req, res) => {
        const { id } = req.params;
        const { items } = req.body; // items is an array

        if (!items || items.length === 0) {
            return res.status(400).json({ error: "Items array is required" });
        }

        Bill.addItem(id, items, (err) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });

            res.json({
                success: true,
                message: "Items added to bill"
            });
        });
    },

    // Delete item from bill
    deleteItem: (req, res) => {
        const { billId, itemId } = req.params;

        Bill.deleteItem(itemId, (err, result) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Bill item not found" });
            }

            // Recalculate bill totals
            Bill.getBillItems(billId, (itemErr, itemData) => {
                if (itemErr) return res.status(500).json({ error: "Database error", details: itemErr });

                const totalAmount = itemData.reduce((sum, item) => sum + (item.Quantity * item.UnitPrice), 0);
                const updateQuery = "UPDATE Bills SET Subtotal = ?, GrandTotal = ? WHERE BillID = ?";
                require("../config/db").query(updateQuery, [totalAmount, totalAmount, billId], (updateErr) => {
                    if (updateErr) return res.status(500).json({ error: "Database error", details: updateErr });

                    res.json({
                        success: true,
                        message: "Item removed from bill"
                    });
                });
            });
        });
    },

    // Finalize bill (change from DRAFT to FINAL)
    finalize: (req, res) => {
        const { id } = req.params;

        Bill.finalize(id, (err, result) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });

            if (result.affectedRows === 0) {
                return res.status(400).json({ error: "Bill cannot be finalized (not in DRAFT status or not found)" });
            }

            res.json({
                success: true,
                message: "Bill finalized successfully"
            });
        });
    },

    // Cancel bill
    cancel: (req, res) => {
        const { id } = req.params;

        Bill.cancel(id, (err, result) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Bill not found" });
            }

            res.json({
                success: true,
                message: "Bill cancelled successfully"
            });
        });
    }
};

module.exports = billController;
