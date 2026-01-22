const db = require("../config/db");

const Expense = {
    findAll: (callback) => {
        const query = `
            SELECT e.*, a.AccountName 
            FROM Expenses e
            LEFT JOIN Accounts a ON e.AccountID = a.AccountID
            ORDER BY e.ExpenseDate DESC
        `;
        db.query(query, callback);
    },

    create: (data, callback) => {
        const { Category, Amount, Description, AccountID, ExpenseDate } = data;

        db.getConnection((err, connection) => {
            if (err) return callback(err);

            connection.beginTransaction((err) => {
                if (err) {
                    connection.release();
                    return callback(err);
                }

                const expenseQuery = "INSERT INTO Expenses (Category, Amount, Description, AccountID, ExpenseDate) VALUES (?, ?, ?, ?, ?)";
                connection.query(expenseQuery, [Category, Amount, Description, AccountID, ExpenseDate || new Date()], (err, result) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            callback(err);
                        });
                    }

                    // Deduct from Account Balance
                    const updateAccountQuery = "UPDATE Accounts SET Balance = Balance - ? WHERE AccountID = ?";
                    connection.query(updateAccountQuery, [Amount, AccountID], (err) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                callback(err);
                            });
                        }

                        connection.commit((err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    callback(err);
                                });
                            }
                            connection.release();
                            callback(null, result);
                        });
                    });
                });
            });
        });
    }
};

module.exports = Expense;
