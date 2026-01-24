DROP DATABASE IF EXISTS inventory_db;
CREATE DATABASE inventory_db;
USE inventory_db;

-- Drop old tables to ensure clean migration to V4
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS BillItems;
DROP TABLE IF EXISTS Bills;
DROP TABLE IF EXISTS OrderDetails;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS PurchaseDetails;
DROP TABLE IF EXISTS Purchases;
DROP TABLE IF EXISTS ProductBarcodes;
DROP TABLE IF EXISTS Inventory;
DROP TABLE IF EXISTS Products;
DROP TABLE IF EXISTS Warehouses;
DROP TABLE IF EXISTS Suppliers;
DROP TABLE IF EXISTS Customers;
DROP TABLE IF EXISTS Categories;
DROP TABLE IF EXISTS StockMovements;
DROP TABLE IF EXISTS InventoryAudit;
DROP TABLE IF EXISTS Expenses;
DROP TABLE IF EXISTS Accounts;
DROP TABLE IF EXISTS Companies;
-- Also drop old schema names if they exist
DROP TABLE IF EXISTS vendors;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS saleitems;
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS purchaseorders;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
SET FOREIGN_KEY_CHECKS = 1;

-- ===========================
-- COMPANIES TABLE (New)
-- ===========================
CREATE TABLE Companies (
    CompanyID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyName VARCHAR(150) NOT NULL,
    Address VARCHAR(255),
    City VARCHAR(100),
    State VARCHAR(100),
    Country VARCHAR(100) DEFAULT 'India',
    Phone VARCHAR(20),
    Email VARCHAR(100),
    Logo LONGBLOB,
    LogoPath VARCHAR(255),
    TaxID VARCHAR(50),
    IsActive TINYINT(1) DEFAULT 1,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_company_name (CompanyName)
);

-- Insert default company
INSERT INTO Companies (CompanyID, CompanyName, City, Country, IsActive) 
VALUES (1, 'Aditya Enterprises', 'Default City', 'India', 1)
ON DUPLICATE KEY UPDATE CompanyName = 'Aditya Enterprises';

-- ===========================
-- CATEGORIES TABLE
-- ===========================
CREATE TABLE Categories (
    CategoryID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyID INT NOT NULL,
    CategoryName VARCHAR(100) NOT NULL,
    Description VARCHAR(255),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID) ON DELETE CASCADE,
    UNIQUE KEY uk_category (CompanyID, CategoryName)
);

-- ===========================
-- SUPPLIERS TABLE
-- ===========================
CREATE TABLE Suppliers (
    SupplierID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyID INT NOT NULL,
    CompanyName VARCHAR(100) NOT NULL,
    ContactName VARCHAR(50),
    Phone VARCHAR(20),
    Email VARCHAR(100),
    Address VARCHAR(200),
    City VARCHAR(50),
    State VARCHAR(50),
    Country VARCHAR(50) DEFAULT 'India',
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID) ON DELETE CASCADE,
    UNIQUE KEY uk_supplier (CompanyID, CompanyName)
);

-- ===========================
-- WAREHOUSES TABLE
-- ===========================
CREATE TABLE Warehouses (
    WarehouseID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyID INT NOT NULL,
    WarehouseName VARCHAR(100) NOT NULL,
    Address VARCHAR(200),
    City VARCHAR(50),
    State VARCHAR(50),
    Phone VARCHAR(20),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID) ON DELETE CASCADE,
    UNIQUE KEY uk_warehouse (CompanyID, WarehouseName)
);

-- Insert default warehouse for default company
INSERT INTO Warehouses (WarehouseID, CompanyID, WarehouseName, City) 
VALUES (1, 1, 'Main Warehouse', 'Default City')
ON DUPLICATE KEY UPDATE WarehouseName = 'Main Warehouse';

-- ===========================
-- PRODUCTS TABLE
-- ===========================
CREATE TABLE Products (
    ProductID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyID INT NOT NULL,
    ProductName VARCHAR(100) NOT NULL,
    CategoryID INT NOT NULL,
    SupplierID INT NOT NULL,
    UnitPrice DECIMAL(10,2) NOT NULL,
    RetailPrice DECIMAL(10,2),
    WholesalePrice DECIMAL(10,2),
    ReorderLevel INT DEFAULT 0,
    Barcode VARCHAR(100) UNIQUE,
    HSNCode VARCHAR(50),
    IsActive TINYINT(1) DEFAULT 1,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID) ON DELETE CASCADE,
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID),
    FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID),
    UNIQUE KEY uk_product (CompanyID, ProductName)
);

-- ProductBarcodes Table REMOVED (Barcode now in Products table)

-- Insert default supplier
INSERT INTO Suppliers (SupplierID, CompanyID, CompanyName, ContactName, City, Country) 
VALUES (1, 1, 'General Supplier', 'Default Contact', 'Default City', 'India')
ON DUPLICATE KEY UPDATE CompanyName = 'General Supplier';

-- ===========================
-- INVENTORY TABLE
-- ===========================
CREATE TABLE Inventory (
    InventoryID INT AUTO_INCREMENT PRIMARY KEY,
    ProductID INT NOT NULL,
    WarehouseID INT NOT NULL,
    Quantity INT DEFAULT 0,
    LastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT UK_Inventory UNIQUE (ProductID, WarehouseID),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE,
    FOREIGN KEY (WarehouseID) REFERENCES Warehouses(WarehouseID) ON DELETE CASCADE
);

-- ===========================
-- CUSTOMERS TABLE
-- ===========================
CREATE TABLE Customers (
    CustomerID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyID INT NOT NULL,
    CompanyName VARCHAR(100) NOT NULL,
    Phone VARCHAR(20),
    Email VARCHAR(100),
    Address VARCHAR(200),
    City VARCHAR(50),
    State VARCHAR(50),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID) ON DELETE CASCADE,
    UNIQUE KEY uk_customer (CompanyID, CompanyName)
);

-- ===========================
-- PURCHASES TABLE
-- ===========================
CREATE TABLE Purchases (
    PurchaseID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyID INT NOT NULL,
    SupplierID INT NOT NULL,
    InvoiceNumber VARCHAR(50),
    PurchaseDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    TotalAmount DECIMAL(12,2),
    FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID) ON DELETE CASCADE,
    FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID)
);

-- ===========================
-- PURCHASE DETAILS TABLE
-- ===========================
CREATE TABLE PurchaseDetails (
    PurchaseDetailID INT AUTO_INCREMENT PRIMARY KEY,
    PurchaseID INT NOT NULL,
    ProductID INT NOT NULL,
    Quantity INT NOT NULL,
    UnitCost DECIMAL(10,2),
    LineTotal DECIMAL(15,2) AS (
        Quantity * UnitCost
    ) STORED,
    FOREIGN KEY (PurchaseID) REFERENCES Purchases(PurchaseID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);

-- ===========================
-- ORDERS TABLE (SALES ORDERS)
-- ===========================
CREATE TABLE Orders (
    OrderID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyID INT NOT NULL,
    OrderNumber VARCHAR(50),
    CustomerID INT NOT NULL,
    OrderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    TotalAmount DECIMAL(12,2),
    OrderStatus VARCHAR(20) DEFAULT 'Pending',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID) ON DELETE CASCADE,
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    UNIQUE KEY uk_order_number (CompanyID, OrderNumber)
);

-- ===========================
-- ORDER DETAILS TABLE
-- ===========================
CREATE TABLE OrderDetails (
    OrderDetailID INT AUTO_INCREMENT PRIMARY KEY,
    OrderID INT NOT NULL,
    ProductID INT NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(10,2),
    LineTotal DECIMAL(15,2) AS (Quantity * UnitPrice) STORED,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);

-- ===========================
-- BILLS TABLE (NEW)
-- ===========================
CREATE TABLE Bills (
    BillID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyID INT NOT NULL,
    BillNumber VARCHAR(50) NOT NULL,
    OrderID INT,
    CustomerID INT NOT NULL,
    BillDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    DueDate DATE,
    Subtotal DECIMAL(15,2) DEFAULT 0,
    GrandTotal DECIMAL(15,2) DEFAULT 0,
    Notes TEXT,
    Terms TEXT,
    BillStatus ENUM('DRAFT', 'FINAL', 'CANCELLED') DEFAULT 'DRAFT',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID) ON DELETE CASCADE,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE SET NULL,
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    UNIQUE KEY uk_bill_number (CompanyID, BillNumber)
);

-- ===========================
-- BILL ITEMS TABLE (NEW)
-- ===========================
CREATE TABLE BillItems (
    BillItemID INT AUTO_INCREMENT PRIMARY KEY,
    BillID INT NOT NULL,
    ProductID INT NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(10,2) NOT NULL,
    LineTotal DECIMAL(15,2) AS (Quantity * UnitPrice) STORED,
    FOREIGN KEY (BillID) REFERENCES Bills(BillID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);

-- ===========================
-- STOCK MOVEMENTS TABLE
-- ===========================
CREATE TABLE StockMovements (
    StockMoveID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyID INT NOT NULL,
    ProductID INT NOT NULL,
    WarehouseID INT NOT NULL,
    Quantity INT NOT NULL, -- +IN / -OUT
    MovementType VARCHAR(20), -- PURCHASE, SALE, RETURN
    ReferenceID INT,
    MovementDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    FOREIGN KEY (WarehouseID) REFERENCES Warehouses(WarehouseID)
);

-- ===========================
-- INVENTORY AUDIT TABLE
-- ===========================
CREATE TABLE InventoryAudit (
    AuditID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyID INT NOT NULL,
    ProductID INT,
    WarehouseID INT,
    OldQuantity INT,
    NewQuantity INT,
    ChangeDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Reason VARCHAR(200),
    FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID) ON DELETE CASCADE
);

-- ===========================
-- ACCOUNTS TABLE
-- ===========================
CREATE TABLE Accounts (
    AccountID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyID INT NOT NULL,
    AccountName VARCHAR(100) NOT NULL,
    AccountType ENUM('CASH', 'BANK') DEFAULT 'CASH',
    Balance DECIMAL(15,2) DEFAULT 0,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID) ON DELETE CASCADE,
    UNIQUE KEY uk_account (CompanyID, AccountName)
);

-- ===========================
-- EXPENSES TABLE
-- ===========================
CREATE TABLE Expenses (
    ExpenseID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyID INT NOT NULL,
    ExpenseDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Category VARCHAR(100) NOT NULL, -- e.g. Hammali, Chai, Petrol
    Amount DECIMAL(12,2) NOT NULL,
    Description VARCHAR(255),
    AccountID INT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID) ON DELETE CASCADE,
    FOREIGN KEY (AccountID) REFERENCES Accounts(AccountID)
);

-- Default Accounts for default company
INSERT INTO Accounts (AccountID, CompanyID, AccountName, AccountType, Balance) 
VALUES (1, 1, 'Cash in Hand', 'CASH', 0)
ON DUPLICATE KEY UPDATE AccountName = 'Cash in Hand';

INSERT INTO Accounts (AccountID, CompanyID, AccountName, AccountType, Balance) 
VALUES (2, 1, 'Main Bank Account', 'BANK', 0)
ON DUPLICATE KEY UPDATE AccountName = 'Main Bank Account';

-- ===========================
-- TRIGGERS
-- ===========================
DROP TRIGGER IF EXISTS trg_UpdateInventory;
CREATE TRIGGER trg_UpdateInventory
AFTER INSERT ON StockMovements
FOR EACH ROW
BEGIN
    INSERT INTO Inventory (ProductID, WarehouseID, Quantity, LastUpdated)
    VALUES (NEW.ProductID, NEW.WarehouseID, NEW.Quantity, NOW())
    ON DUPLICATE KEY UPDATE 
        Quantity = Inventory.Quantity + NEW.Quantity,
        LastUpdated = NOW();
END;

-- ===========================
-- VIEWS
-- ===========================
CREATE OR REPLACE VIEW vw_StockSummary AS
SELECT 
    p.ProductID,
    p.CompanyID,
    p.ProductName,
    c.CategoryName,
    SUM(i.Quantity) AS TotalQuantity,
    p.UnitPrice,
    (SUM(i.Quantity) * p.UnitPrice) AS TotalValue
FROM Products p
LEFT JOIN Inventory i ON p.ProductID = i.ProductID
LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
GROUP BY p.ProductID, p.CompanyID, p.ProductName, c.CategoryName, p.UnitPrice;

-- View for company-wise bill summary
CREATE OR REPLACE VIEW vw_BillSummary AS
SELECT 
    b.BillID,
    b.CompanyID,
    b.BillNumber,
    co.CompanyName,
    c.CompanyName AS CustomerName,
    b.BillDate,
    b.GrandTotal,
    b.BillStatus,
    COUNT(bi.BillItemID) AS ItemCount
FROM Bills b
LEFT JOIN Companies co ON b.CompanyID = co.CompanyID
LEFT JOIN Customers c ON b.CustomerID = c.CustomerID
LEFT JOIN BillItems bi ON b.BillID = bi.BillID
GROUP BY b.BillID, b.CompanyID, b.BillNumber, co.CompanyName, c.CompanyName, b.BillDate, b.GrandTotal, b.BillStatus;
