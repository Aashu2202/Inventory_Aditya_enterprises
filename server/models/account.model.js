const db = require("../config/db");

const Account = {
    findAll: (callback) => {
        db.query("SELECT * FROM Accounts", callback);
    },

    findById: (id, callback) => {
        db.query("SELECT * FROM Accounts WHERE AccountID = ?", [id], callback);
    },

    updateBalance: (id, amount, type, callback) => {
        // type: 'ADD' (income/transfer in) or 'SUB' (expense/transfer out)
        const operator = type === 'ADD' ? '+' : '-';
        const query = `UPDATE Accounts SET Balance = Balance ${operator} ? WHERE AccountID = ?`;
        db.query(query, [amount, id], callback);
    },

    create: (data, callback) => {
        const { AccountName, AccountType, Balance } = data;
        db.query("INSERT INTO Accounts (AccountName, AccountType, Balance) VALUES (?, ?, ?)", [AccountName, AccountType, Balance || 0], callback);
    }
};

module.exports = Account;
