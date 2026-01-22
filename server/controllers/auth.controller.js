const User = require("../models/user.model");

const authController = {
    login: (req, res) => {
        const { username, password } = req.body;

        User.findByUsernameAndPassword(username, password, (err, data) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });

            if (data.length > 0) {
                const user = data[0];
                delete user.Password;
                res.json({ success: true, message: "Login successful", user });
            } else {
                res.status(401).json({ success: false, message: "Invalid username or password" });
            }
        });
    },

    getProducts: (req, res) => {
        User.findAllProducts((err, data) => {
            if (err) return res.json(err);
            res.json(data);
        });
    }
};

module.exports = authController;
