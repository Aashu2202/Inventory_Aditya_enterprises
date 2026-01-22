CREATE DATABASE IF NOT EXISTS inventory_db;
USE inventory_db;

CREATE TABLE IF NOT EXISTS Users (
    UserId INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(255) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Role VARCHAR(50),
    Department VARCHAR(100),
    Designation VARCHAR(100),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert a default admin user for testing
-- Username: admin, Password: password123 (Plain text as per current setup)
INSERT IGNORE INTO Users (Username, Password, Role, Department, Designation)
VALUES ('admin', 'password123', 'Admin', 'IT', 'Administrator');
