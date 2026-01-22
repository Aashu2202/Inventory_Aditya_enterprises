const Expense = require("../models/expense.model");

const expenseController = {
    getAll: (req, res) => {
        Expense.findAll((err, data) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            res.json(data);
        });
    },

    create: (req, res) => {
        const { Category, Amount, AccountID } = req.body;
        if (!Category || !Amount || !AccountID) {
            return res.status(400).json({ error: "Missing required fields (Category, Amount, AccountID)" });
        }

        Expense.create(req.body, (err, result) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            res.json({ success: true, message: "Expense recorded and account balance updated", id: result.insertId });
        });
    }
};

module.exports = expenseController;
