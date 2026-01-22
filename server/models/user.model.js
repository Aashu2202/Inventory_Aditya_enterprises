const db = require("../config/db");

const User = {
    findByUsernameAndPassword: (username, password, callback) => {
        const query = "SELECT * FROM Users WHERE Username = ? AND Password = ?";
        db.query(query, [username, password], callback);
    },

    findAllProducts: (callback) => {
        db.query("SELECT * FROM products", callback);
    }
};

module.exports = User;
