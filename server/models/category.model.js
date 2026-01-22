const db = require("../config/db");

const Category = {
    findAll: (callback) => {
        db.query("SELECT * FROM Categories", callback);
    },

    create: (data, callback) => {
        const { CategoryName, Description } = data;
        db.query("INSERT INTO Categories (CategoryName, Description) VALUES (?, ?)", [CategoryName, Description], callback);
    },

    update: (id, data, callback) => {
        const { CategoryName, Description } = data;
        db.query("UPDATE Categories SET CategoryName = ?, Description = ? WHERE CategoryID = ?", [CategoryName, Description, id], callback);
    },

    delete: (id, callback) => {
        db.query("DELETE FROM Categories WHERE CategoryID = ?", [id], callback);
    }
};

module.exports = Category;
