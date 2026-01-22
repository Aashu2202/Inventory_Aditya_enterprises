# Database Schema v4 - Complete Setup Guide

## Overview
This document describes the enhanced database schema for the Inventory Management System with support for:
- Multi-company management
- Financial year management
- Access token control
- Year-end data transfers

---

## NEW TABLES

### 1. Companies Table
Stores all company information and details.

```sql
CompanyID (PK)          - Auto-increment primary key
CompanyName             - Unique company name
LegalName               - Legal business name
GSTIN                   - Unique GST identification number
PAN                     - Pan number
Email, Phone            - Contact information
Website                 - Company website
Address, City, State     - Physical location
PostalCode              - Postal code
Country                 - Country (default: India)
LogoPath                - Path to company logo
CompanyType             - Sole Proprietor, Partnership, Private Limited, Public Limited
IsActive                - 1 (active) or 0 (inactive)
CreatedDate             - Creation timestamp
UpdatedDate             - Last update timestamp
```

**Indexes:**
- `idx_gstin` on GSTIN
- `idx_status` on IsActive

**Constraints:**
- GSTIN and CompanyName are UNIQUE

---

### 2. Users Table (Enhanced)
User accounts with company association.

```sql
UserID (PK)             - Auto-increment primary key
Username                - Unique username
Password                - Hashed password
Email                   - Unique email
UserRole                - SuperAdmin, CompanyAdmin, Manager, Staff
CompanyID (FK)          - References Companies table
IsActive                - User status
CreatedDate             - Creation timestamp
LastLogin               - Last login timestamp
```

**Roles:**
- **SuperAdmin (Developer)**: Full system access, manages companies and tokens
- **CompanyAdmin**: Manages company operations and year-end transfers
- **Manager**: Manages daily operations
- **Staff**: Limited access

---

### 3. FinancialYears Table
Define financial periods for each company.

```sql
FinancialYearID (PK)    - Auto-increment primary key
CompanyID (FK)          - References Companies table
FYName                  - Format: "2024-2025", "2023-2024", etc.
StartDate               - Financial year start (typically April 1st in India)
EndDate                 - Financial year end (typically March 31st)
Status                  - Active, Closed, Archived
CreatedDate             - Creation timestamp
ClosedDate              - When the FY was closed
```

**Constraints:**
- `uk_company_fy`: Unique combination of (CompanyID, FYName)

**Indexes:**
- `idx_status` on Status

---

### 4. AccessTokens Table
Control system access by financial year.

```sql
TokenID (PK)            - Auto-increment primary key
CompanyID (FK)          - Company this token is for
FinancialYearID (FK)    - Associated financial year
TokenValue              - 64-character random hex token (unique)
TokenType               - Annual, Monthly, Temporary
GeneratedBy (FK)        - UserID of SuperAdmin who created it
IsActive                - 1 (valid) or 0 (revoked)
IssuedDate              - When token was created
ExpiryDate              - When token expires
LastUsedDate            - Last time token was used
CreatedDate             - Record creation timestamp
```

**Constraints:**
- `uk_token_fy`: Unique combination of (CompanyID, FinancialYearID)

**Indexes:**
- `idx_active_token` on (IsActive, ExpiryDate)

**How It Works:**
1. SuperAdmin generates token for each financial year
2. Token expires after the financial year ends
3. On year-end, new token is generated for new financial year
4. Old tokens are automatically revoked
5. Any API request must verify token validity

---

### 5. FYTransferLogs Table
Track financial year data transfers.

```sql
TransferID (PK)         - Auto-increment primary key
FromFinancialYearID (FK) - Source FY
ToFinancialYearID (FK)  - Destination FY
CompanyID (FK)          - Company being transferred
TransferredBy (FK)      - UserID who initiated transfer
TransferredDate         - When transfer was initiated
Status                  - Pending, In Progress, Completed, Failed
Description             - Transfer description/reason
Notes                   - Additional notes
```

**Status Flow:**
1. **Pending**: Transfer initiated, awaiting approval
2. **In Progress**: Transfer is currently running
3. **Completed**: Transfer finished successfully
4. **Failed**: Transfer encountered error

---

## MODIFIED TABLES

All existing tables have been enhanced with company and financial year support:

### 1. Categories
- Added: `CompanyID` (Foreign Key)
- Added: `uk_category` unique index on (CompanyID, CategoryName)
- Benefit: Each company has independent categories

### 2. Suppliers
- Added: `CompanyID` (Foreign Key)
- Added: `idx_company` index on CompanyID
- Benefit: Multi-company supplier management

### 3. Warehouses
- Added: `CompanyID` (Foreign Key)
- Added: `idx_company` index on CompanyID
- Benefit: Each company manages own warehouses

### 4. Products
- Added: `CompanyID` (Foreign Key)
- Added: `FinancialYearID` (Foreign Key)
- Added: `idx_company` and `idx_fy` indexes
- Benefit: Products specific to company and FY

### 5. Inventory
- Added: `CompanyID` (Foreign Key)
- Added: `FinancialYearID` (Foreign Key)
- Updated: `UK_Inventory` unique on (CompanyID, FinancialYearID, ProductID, WarehouseID)
- Benefit: Isolated inventory per company and FY

### 6. Customers
- Added: `CompanyID` (Foreign Key)
- Added: `idx_company` index on CompanyID

### 7. Purchases
- Added: `CompanyID` (Foreign Key)
- Added: `FinancialYearID` (Foreign Key)
- Added: `idx_company_fy` composite index

### 8. Orders
- Added: `CompanyID` (Foreign Key)
- Added: `FinancialYearID` (Foreign Key)
- Added: `idx_company_fy` composite index

### 9. StockMovements
- Added: `CompanyID` (Foreign Key)
- Added: `FinancialYearID` (Foreign Key)
- Added: `idx_company_fy` composite index

### 10. Expenses & Accounts
- Added: `CompanyID` (Foreign Key)
- Added: `FinancialYearID` (Foreign Key) for Expenses
- Benefit: Isolated financial records per company and year

---

## DATA TRANSFER PROCESS

### What Gets Transferred on Year-End:

#### ✅ Transferred (Master Data)
```
1. Categories - All product categories
2. Suppliers - All supplier contact information
3. Customers - All customer information
4. Products - Product definitions and specifications
5. Inventory - Current stock quantities
6. Accounts - Bank and cash accounts (with reset balance)
7. Warehouses - Warehouse information
```

#### ❌ Not Transferred (Historical Data)
```
- Orders/Sales history
- Purchases history
- Expense records
- Stock movement logs
- Audit trails
- Financial transactions
```

### Transfer Execution Steps:
```
1. Create new financial year
2. Admin initiates transfer (creates log entry)
3. System transfers categories first
4. Then suppliers, customers, warehouses
5. Then products to new FY
6. Then inventory quantities
7. Finally reset account balances to 0
8. Mark transfer as completed
9. Generate new access token
```

---

## INDEXES & PERFORMANCE

### Composite Indexes (for fast queries)
- `idx_company_fy` on (CompanyID, FinancialYearID)
  - Used for: Getting company's data for specific FY

- `idx_active_token` on (IsActive, ExpiryDate)
  - Used for: Verifying valid tokens

### Foreign Key Relationships
- Ensures data integrity
- Cascading deletes (deleting company deletes all related data)
- Prevents orphaned records

---

## MIGRATION STEPS

### From v3 to v4:

```sql
-- 1. Create new tables
-- 2. Migrate existing data to a default company
INSERT INTO Companies (CompanyName, GSTIN, LegalName)
VALUES ('Default Company', 'DEFAULT_GSTIN', 'Default Company');

-- 3. Update all existing tables to set CompanyID = 1
UPDATE Categories SET CompanyID = 1;
UPDATE Suppliers SET CompanyID = 1;
UPDATE Warehouses SET CompanyID = 1;
-- ... continue for all tables

-- 4. Create financial year for current data
INSERT INTO FinancialYears (CompanyID, FYName, StartDate, EndDate)
VALUES (1, '2024-2025', '2024-04-01', '2025-03-31');

-- 5. Update all products and related records with FinancialYearID = 1
UPDATE Products SET FinancialYearID = 1 WHERE CompanyID = 1;
-- ... continue for Inventory, Orders, Purchases, etc.

-- 6. Create SuperAdmin user
INSERT INTO Users (Username, Password, Email, UserRole)
VALUES ('superadmin', 'hashed_password', 'admin@company.com', 'SuperAdmin');

-- 7. Generate initial token
-- (Use the API endpoint or generate manually)
```

---

## SAMPLE DATA POPULATION

See `inventory_v4.sql` for sample data that includes:
- Default company (Aditya Enterprises)
- Financial year (2024-2025)
- Default warehouses
- Sample users

---

## BACKUP & RECOVERY

### Backup Strategy
```bash
# Full database backup
mysqldump -u root -p inventory_db > backup_$(date +%Y%m%d).sql

# Backup with data separation
mysqldump -u root -p --databases inventory_db > backup_full.sql
```

### Recovery
```bash
# Restore from backup
mysql -u root -p inventory_db < backup_20240601.sql
```

---

## MONITORING QUERIES

### Check Active Tokens
```sql
SELECT * FROM AccessTokens 
WHERE IsActive = 1 
AND ExpiryDate > NOW();
```

### Get Company Dashboard Data
```sql
SELECT 
    c.CompanyName,
    COUNT(DISTINCT fy.FinancialYearID) as TotalFYs,
    COUNT(DISTINCT p.ProductID) as TotalProducts,
    SUM(i.Quantity) as TotalInventory,
    COUNT(DISTINCT cu.CustomerID) as TotalCustomers
FROM Companies c
LEFT JOIN FinancialYears fy ON c.CompanyID = fy.CompanyID
LEFT JOIN Products p ON c.CompanyID = p.CompanyID
LEFT JOIN Inventory i ON c.CompanyID = i.CompanyID
LEFT JOIN Customers cu ON c.CompanyID = cu.CompanyID
GROUP BY c.CompanyID, c.CompanyName;
```

### Track Transfer History
```sql
SELECT 
    ft.TransferID,
    c.CompanyName,
    fy1.FYName as FromFY,
    fy2.FYName as ToFY,
    ft.Status,
    ft.TransferredDate
FROM FYTransferLogs ft
JOIN Companies c ON ft.CompanyID = c.CompanyID
JOIN FinancialYears fy1 ON ft.FromFinancialYearID = fy1.FinancialYearID
JOIN FinancialYears fy2 ON ft.ToFinancialYearID = fy2.FinancialYearID
ORDER BY ft.TransferredDate DESC;
```

---

## INTEGRATION WITH EXISTING CODE

### Update Controllers:
All existing controllers need to include `companyId` and `financialYearId` in queries.

Example:
```javascript
// OLD
SELECT * FROM Products WHERE ProductID = ?

// NEW
SELECT * FROM Products 
WHERE ProductID = ? 
AND CompanyID = ? 
AND FinancialYearID = ?
```

### Update Routes:
Routes should validate user's company access before operations.

### Update Models:
All queries must be scoped to company and financial year.

---

## SECURITY CONSIDERATIONS

1. **Token Validation**
   - Every request must validate token
   - Token must match company and active FY
   - Revoked tokens are rejected

2. **Company Isolation**
   - Users can only access their company's data
   - Data from different companies is never mixed
   - Admin can view multiple companies

3. **Financial Year Protection**
   - Closed FY cannot be modified
   - Data transfers are logged
   - All changes are auditable

---

## TROUBLESHOOTING

### Issue: "Token not found"
- Solution: Regenerate token using `/api/access-tokens/regenerate`

### Issue: "Financial year already exists"
- Solution: Use unique FY names per company

### Issue: "Foreign key constraint fails"
- Solution: Ensure CompanyID exists in Companies table first

---

## VERSION HISTORY

- **v1.0**: Initial schema (single company)
- **v2.0**: Enhanced tables and triggers
- **v3.0**: Additional modules (vendors, stores, etc.)
- **v4.0**: Multi-company, FY management, token control, transfers
