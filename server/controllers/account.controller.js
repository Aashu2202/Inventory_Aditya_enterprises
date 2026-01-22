const Account = require("../models/account.model");

const accountController = {
    getAll: (req, res) => {
        Account.findAll((err, data) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            res.json(data);
        });
    },

    create: (req, res) => {
        Account.create(req.body, (err, result) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            res.json({ success: true, message: "Account created successfully", id: result.insertId });
        });
    }
};

module.exports = accountController;
