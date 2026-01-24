const db = require("../config/db");

const Bill = {
    findAll: (companyId, callback) => {
        const query = `
            SELECT b.*, c.CompanyName as CustomerName
            FROM Bills b
            LEFT JOIN Customers c ON b.CustomerID = c.CustomerID
            WHERE b.CompanyID = ?
            ORDER BY b.BillDate DESC
        `;
        db.query(query, [companyId], callback);
    },

    findById: (billId, callback) => {
        const query = `
            SELECT b.*, c.CompanyName as CustomerName, co.CompanyName as OwnerCompanyName, co.Address, co.City, co.State, co.Phone, co.Email, co.LogoPath
            FROM Bills b
            LEFT JOIN Customers c ON b.CustomerID = c.CustomerID
            LEFT JOIN Companies co ON b.CompanyID = co.CompanyID
            WHERE b.BillID = ?
        `;
        db.query(query, [billId], callback);
    },

    getBillItems: (billId, callback) => {
        const query = `
            SELECT bi.*, p.ProductName
            FROM BillItems bi
            LEFT JOIN Products p ON bi.ProductID = p.ProductID
            WHERE bi.BillID = ?
            ORDER BY bi.BillItemID
        `;
        db.query(query, [billId], callback);
    },

    create: (data, callback) => {
        const query = `
            INSERT INTO Bills (CompanyID, BillNumber, OrderID, CustomerID, BillDate, Subtotal, GrandTotal, Notes, Terms, BillStatus)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT')
        `;
        const values = [
            data.CompanyID,
            data.BillNumber,
            data.OrderID || null,
            data.CustomerID,
            data.BillDate || new Date(),
            data.Subtotal || 0,
            data.GrandTotal || 0,
            data.Notes || null,
            data.Terms || null
        ];
        db.query(query, values, callback);
    },

    addItem: (billId, items, callback) => {
        // Items is an array of {ProductID, Quantity, UnitPrice}
        if (items.length === 0) return callback(null, { insertId: billId });

        let itemsInserted = 0;
        let totalAmount = 0;
        let error = null;

        items.forEach((item, index) => {
            const query = `
                INSERT INTO BillItems (BillID, ProductID, Quantity, UnitPrice)
                VALUES (?, ?, ?, ?)
            `;
            totalAmount += item.Quantity * item.UnitPrice;

            db.query(query, [billId, item.ProductID, item.Quantity, item.UnitPrice], (err) => {
                if (err && !error) error = err;
                itemsInserted++;

                if (itemsInserted === items.length) {
                    if (error) {
                        return callback(error);
                    }
                    // Update bill totals
                    const updateQuery = "UPDATE Bills SET Subtotal = ?, GrandTotal = ? WHERE BillID = ?";
                    db.query(updateQuery, [totalAmount, totalAmount, billId], callback);
                }
            });
        });
    },

    update: (billId, data, callback) => {
        // Only allow updates if bill is in DRAFT status
        const query = `
            UPDATE Bills 
            SET Notes = ?, Terms = ?, BillDate = ?, DueDate = ?
            WHERE BillID = ? AND BillStatus = 'DRAFT'
        `;
        const values = [
            data.Notes || null,
            data.Terms || null,
            data.BillDate || new Date(),
            data.DueDate || null,
            billId
        ];
        db.query(query, values, callback);
    },

    finalize: (billId, callback) => {
        // Change status from DRAFT to FINAL
        const query = "UPDATE Bills SET BillStatus = 'FINAL', UpdatedAt = NOW() WHERE BillID = ? AND BillStatus = 'DRAFT'";
        db.query(query, [billId], callback);
    },

    cancel: (billId, callback) => {
        // Change status to CANCELLED
        const query = "UPDATE Bills SET BillStatus = 'CANCELLED', UpdatedAt = NOW() WHERE BillID = ?";
        db.query(query, [billId], callback);
    },

    // Generate next bill number for a company
    getNextBillNumber: (companyId, callback) => {
        const query = `
            SELECT COUNT(*) as count FROM Bills 
            WHERE CompanyID = ? AND YEAR(BillDate) = YEAR(CURDATE())
        `;
        db.query(query, [companyId], (err, results) => {
            if (err) return callback(err);
            
            const count = results[0].count + 1;
            const year = new Date().getFullYear().toString().slice(-2);
            const month = String(new Date().getMonth() + 1).padStart(2, '0');
            const billNumber = `BILL-${year}-${month}-${String(count).padStart(5, '0')}`;
            
            callback(null, billNumber);
        });
    },

    deleteItem: (billItemId, callback) => {
        const query = "DELETE FROM BillItems WHERE BillItemID = ?";
        db.query(query, [billItemId], callback);
    }
};

module.exports = Bill;
