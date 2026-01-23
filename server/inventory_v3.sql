CREATE DATABASE IF NOT EXISTS inventory_db;
USE inventory_db;

-- Drop old tables to ensure clean migration to V3
SET FOREIGN_KEY_CHECKS = 0;
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

CREATE TABLE Categories (
    CategoryID INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(100) NOT NULL,
    Description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS Suppliers (
    SupplierID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyName VARCHAR(100) NOT NULL,
    ContactName VARCHAR(50),
    Phone VARCHAR(20),
    Email VARCHAR(100),
    Address VARCHAR(200),
    City VARCHAR(50),
    State VARCHAR(50),
    Country VARCHAR(50) DEFAULT 'India',
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Warehouses (
    WarehouseID INT AUTO_INCREMENT PRIMARY KEY,
    WarehouseName VARCHAR(100) NOT NULL,
    Address VARCHAR(200),
    City VARCHAR(50),
    State VARCHAR(50),
    Phone VARCHAR(20)
);

-- Insert default warehouse
INSERT INTO Warehouses (WarehouseID, WarehouseName, City) VALUES (1, 'Main Warehouse', 'Default City')
ON DUPLICATE KEY UPDATE WarehouseName = 'Main Warehouse';

CREATE TABLE IF NOT EXISTS Products (
    ProductID INT AUTO_INCREMENT PRIMARY KEY,
    ProductName VARCHAR(100) NOT NULL,
    CategoryID INT NOT NULL,
    SupplierID INT NOT NULL,
    UnitPrice DECIMAL(10,2) NOT NULL,
    RetailPrice DECIMAL(10,2),
    WholesalePrice DECIMAL(10,2),
    ReorderLevel INT DEFAULT 0,
    IsActive TINYINT(1) DEFAULT 1,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID),
    FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID)
);

CREATE TABLE IF NOT EXISTS ProductBarcodes (
    BarcodeID INT AUTO_INCREMENT PRIMARY KEY,
    ProductID INT NOT NULL,
    BarcodeValue VARCHAR(100) UNIQUE NOT NULL,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);

CREATE TABLE IF NOT EXISTS Inventory (
    InventoryID INT AUTO_INCREMENT PRIMARY KEY,
    ProductID INT NOT NULL,
    WarehouseID INT NOT NULL,
    Quantity INT DEFAULT 0,
    LastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT UK_Inventory UNIQUE (ProductID, WarehouseID),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    FOREIGN KEY (WarehouseID) REFERENCES Warehouses(WarehouseID)
);

CREATE TABLE IF NOT EXISTS Customers (
    CustomerID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyName VARCHAR(100) NOT NULL,
    Phone VARCHAR(20),
    Email VARCHAR(100),
    Address VARCHAR(200),
    City VARCHAR(50),
    State VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS Purchases (
    PurchaseID INT AUTO_INCREMENT PRIMARY KEY,
    SupplierID INT NOT NULL,
    InvoiceNumber VARCHAR(50),
    PurchaseDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    TotalAmount DECIMAL(12,2),
    FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID)
);

CREATE TABLE IF NOT EXISTS PurchaseDetails (
    PurchaseDetailID INT AUTO_INCREMENT PRIMARY KEY,
    PurchaseID INT NOT NULL,
    ProductID INT NOT NULL,
    Quantity INT NOT NULL,
    UnitCost DECIMAL(10,2),
    LineTotal DECIMAL(15,2) AS (
        Quantity * UnitCost
    ) STORED,
    FOREIGN KEY (PurchaseID) REFERENCES Purchases(PurchaseID),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);

CREATE TABLE IF NOT EXISTS Orders (
    OrderID INT AUTO_INCREMENT PRIMARY KEY,
    OrderNumber VARCHAR(50),
    CustomerID INT NOT NULL,
    OrderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    TotalAmount DECIMAL(12,2),
    OrderStatus VARCHAR(20) DEFAULT 'Pending',
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
);

CREATE TABLE IF NOT EXISTS OrderDetails (
    OrderDetailID INT AUTO_INCREMENT PRIMARY KEY,
    OrderID INT NOT NULL,
    ProductID INT NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(10,2),
    LineTotal DECIMAL(15,2) AS (Quantity * UnitPrice) STORED,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);

CREATE TABLE IF NOT EXISTS StockMovements (
    StockMoveID INT AUTO_INCREMENT PRIMARY KEY,
    ProductID INT NOT NULL,
    WarehouseID INT NOT NULL,
    Quantity INT NOT NULL, -- +IN / -OUT
    MovementType VARCHAR(20), -- PURCHASE, SALE, RETURN
    ReferenceID INT,
    MovementDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    FOREIGN KEY (WarehouseID) REFERENCES Warehouses(WarehouseID)
);

-- Trigger for Stock Updates
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

CREATE TABLE IF NOT EXISTS InventoryAudit (
    AuditID INT AUTO_INCREMENT PRIMARY KEY,
    ProductID INT,
    WarehouseID INT,
    OldQuantity INT,
    NewQuantity INT,
    ChangeDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Reason VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS Accounts (
    AccountID INT AUTO_INCREMENT PRIMARY KEY,
    AccountName VARCHAR(100) NOT NULL,
    AccountType ENUM('CASH', 'BANK') DEFAULT 'CASH',
    Balance DECIMAL(15,2) DEFAULT 0,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Expenses (
    ExpenseID INT AUTO_INCREMENT PRIMARY KEY,
    ExpenseDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Category VARCHAR(100) NOT NULL, -- e.g. Hammali, Chai, Petrol
    Amount DECIMAL(12,2) NOT NULL,
    Description VARCHAR(255),
    AccountID INT,
    FOREIGN KEY (AccountID) REFERENCES Accounts(AccountID)
);

-- Default Accounts
INSERT INTO Accounts (AccountName, AccountType, Balance) VALUES ('Cash in Hand', 'CASH', 0)
ON DUPLICATE KEY UPDATE AccountName = 'Cash in Hand';
INSERT INTO Accounts (AccountName, AccountType, Balance) VALUES ('Main Bank Account', 'BANK', 0)
ON DUPLICATE KEY UPDATE AccountName = 'Main Bank Account';

CREATE OR REPLACE VIEW vw_StockSummary AS
SELECT 
    p.ProductID,
    p.ProductName,
    c.CategoryName,
    SUM(i.Quantity) AS TotalQuantity,
    p.UnitPrice,
    (SUM(i.Quantity) * p.UnitPrice) AS TotalValue
FROM Products p
LEFT JOIN Inventory i ON p.ProductID = i.ProductID
LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
GROUP BY p.ProductID, p.ProductName, c.CategoryName, p.UnitPrice;
