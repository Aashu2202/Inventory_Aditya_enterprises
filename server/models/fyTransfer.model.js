const db = require("../config/db");

const FYTransfer = {
    // Create transfer log
    createTransferLog: (transferData, callback) => {
        const query = `
            INSERT INTO FYTransferLogs (
                FromFinancialYearID, ToFinancialYearID, CompanyID, 
                TransferredBy, Status, Description
            ) VALUES (?, ?, ?, ?, 'Pending', ?)
        `;
        
        const values = [
            transferData.fromFinancialYearId,
            transferData.toFinancialYearId,
            transferData.companyId,
            transferData.transferredBy,
            transferData.description
        ];
        
        db.query(query, values, callback);
    },

    // Get transfer logs for company
    getByCompany: (companyId, callback) => {
        const query = `
            SELECT * FROM FYTransferLogs 
            WHERE CompanyID = ? 
            ORDER BY TransferredDate DESC
        `;
        db.query(query, [companyId], callback);
    },

    // Get transfer log by ID
    getById: (transferId, callback) => {
        const query = "SELECT * FROM FYTransferLogs WHERE TransferID = ?";
        db.query(query, [transferId], callback);
    },

    // Update transfer status
    updateStatus: (transferId, status, notes, callback) => {
        const query = `
            UPDATE FYTransferLogs 
            SET Status = ?, Notes = ? 
            WHERE TransferID = ?
        `;
        db.query(query, [status, notes, transferId], callback);
    },

    // Transfer Products and Inventory
    transferProductsAndInventory: (fromFYId, toFYId, companyId, callback) => {
        const query = `
            INSERT INTO Products (
                CompanyID, FinancialYearID, ProductName, CategoryID, 
                SupplierID, HSNCode, GSTPercent, UnitPrice, 
                RetailPrice, WholesalePrice, ReorderLevel, IsActive
            )
            SELECT 
                ?, ?, ProductName, CategoryID, SupplierID, HSNCode, 
                GSTPercent, UnitPrice, RetailPrice, WholesalePrice, 
                ReorderLevel, IsActive
            FROM Products 
            WHERE CompanyID = ? AND FinancialYearID = ?
        `;
        
        db.query(query, [companyId, toFYId, companyId, fromFYId], (err, result) => {
            if (err) {
                return callback(err);
            }

            // Now transfer inventory data
            const invQuery = `
                INSERT INTO Inventory (
                    CompanyID, FinancialYearID, ProductID, WarehouseID, Quantity
                )
                SELECT i.CompanyID, ?, p2.ProductID, i.WarehouseID, i.Quantity
                FROM Inventory i
                JOIN Products p1 ON i.ProductID = p1.ProductID
                JOIN Products p2 ON p1.ProductName = p2.ProductName 
                    AND p2.CompanyID = ? AND p2.FinancialYearID = ?
                WHERE i.CompanyID = ? AND i.FinancialYearID = ?
            `;

            db.query(invQuery, [toFYId, companyId, toFYId, companyId, fromFYId], callback);
        });
    },

    // Transfer Customers
    transferCustomers: (fromFYId, toFYId, companyId, callback) => {
        const query = `
            INSERT INTO Customers (CompanyID, CompanyName, Phone, Email, GSTIN, Address, City, State)
            SELECT CompanyID, CompanyName, Phone, Email, GSTIN, Address, City, State
            FROM Customers 
            WHERE CompanyID = ?
            ON DUPLICATE KEY UPDATE Email = VALUES(Email)
        `;
        
        db.query(query, [companyId], callback);
    },

    // Transfer Suppliers
    transferSuppliers: (fromFYId, toFYId, companyId, callback) => {
        const query = `
            INSERT INTO Suppliers (
                CompanyID, CompanyName, ContactName, Phone, Email, 
                GSTIN, Address, City, State, Country
            )
            SELECT CompanyID, CompanyName, ContactName, Phone, Email, 
                   GSTIN, Address, City, State, Country
            FROM Suppliers 
            WHERE CompanyID = ?
            ON DUPLICATE KEY UPDATE Email = VALUES(Email)
        `;
        
        db.query(query, [companyId], callback);
    },

    // Transfer Categories
    transferCategories: (fromFYId, toFYId, companyId, callback) => {
        const query = `
            INSERT INTO Categories (CompanyID, CategoryName, Description)
            SELECT CompanyID, CategoryName, Description
            FROM Categories 
            WHERE CompanyID = ?
            ON DUPLICATE KEY UPDATE Description = VALUES(Description)
        `;
        
        db.query(query, [companyId], callback);
    },

    // Transfer Accounts
    transferAccounts: (fromFYId, toFYId, companyId, callback) => {
        const query = `
            INSERT INTO Accounts (CompanyID, AccountName, AccountType, Balance)
            SELECT CompanyID, AccountName, AccountType, 0
            FROM Accounts 
            WHERE CompanyID = ? 
            AND AccountType IN ('CASH', 'BANK')
            ON DUPLICATE KEY UPDATE Balance = 0
        `;
        
        db.query(query, [companyId], callback);
    },

    // Complete FY Transfer - Transfer all data
    completeTransfer: (transferId, companyId, fromFYId, toFYId, callback) => {
        // Update transfer status to In Progress
        const statusQuery = `
            UPDATE FYTransferLogs 
            SET Status = 'In Progress' 
            WHERE TransferID = ?
        `;

        db.query(statusQuery, [transferId], (err) => {
            if (err) {
                return callback(err);
            }

            // Execute all transfers in sequence
            const transferCategories = () => {
                FYTransfer.transferCategories(fromFYId, toFYId, companyId, (err) => {
                    if (err) {
                        updateTransferStatus('Failed');
                        return;
                    }
                    transferSuppliers();
                });
            };

            const transferSuppliers = () => {
                FYTransfer.transferSuppliers(fromFYId, toFYId, companyId, (err) => {
                    if (err) {
                        updateTransferStatus('Failed');
                        return;
                    }
                    transferCustomers();
                });
            };

            const transferCustomers = () => {
                FYTransfer.transferCustomers(fromFYId, toFYId, companyId, (err) => {
                    if (err) {
                        updateTransferStatus('Failed');
                        return;
                    }
                    transferProductsAndInventory();
                });
            };

            const transferProductsAndInventory = () => {
                FYTransfer.transferProductsAndInventory(fromFYId, toFYId, companyId, (err) => {
                    if (err) {
                        updateTransferStatus('Failed');
                        return;
                    }
                    transferAccounts();
                });
            };

            const transferAccounts = () => {
                FYTransfer.transferAccounts(fromFYId, toFYId, companyId, (err) => {
                    if (err) {
                        updateTransferStatus('Failed');
                        return;
                    }
                    updateTransferStatus('Completed');
                });
            };

            const updateTransferStatus = (status) => {
                const finalQuery = `
                    UPDATE FYTransferLogs 
                    SET Status = ? 
                    WHERE TransferID = ?
                `;
                db.query(finalQuery, [status, transferId], callback);
            };

            // Start the chain
            transferCategories();
        });
    }
};

module.exports = FYTransfer;
