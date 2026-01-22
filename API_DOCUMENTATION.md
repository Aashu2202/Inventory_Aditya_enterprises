# Inventory Management System - API Documentation
## Enhanced Multi-Company & Financial Year Management

---

## 1. COMPANIES MANAGEMENT API

### Base URL: `/api/companies`

#### 1.1 Create Company
**POST** `/create`

Create a new company with complete details.

**Request Body:**
```json
{
    "companyName": "Aditya Enterprises",
    "legalName": "Aditya Enterprises Pvt Ltd",
    "gstin": "27AABCU1234A1Z0",
    "pan": "AABCU1234A",
    "email": "info@adityaenterprises.com",
    "phone": "9876543210",
    "website": "www.adityaenterprises.com",
    "address": "123 Business Street",
    "city": "Pune",
    "state": "Maharashtra",
    "postalCode": "411001",
    "country": "India",
    "companyType": "Private Limited",
    "logoPath": "/images/company_logo.png"
}
```

**Response (201):**
```json
{
    "success": true,
    "message": "Company created successfully",
    "companyId": 1,
    "data": { ... }
}
```

---

#### 1.2 Get All Companies
**GET** `/`

Retrieve all active companies.

**Response (200):**
```json
{
    "success": true,
    "data": [
        {
            "CompanyID": 1,
            "CompanyName": "Aditya Enterprises",
            "GSTIN": "27AABCU1234A1Z0",
            "Email": "info@adityaenterprises.com",
            "IsActive": 1,
            ...
        }
    ]
}
```

---

#### 1.3 Get Company by ID
**GET** `/:id`

Retrieve a specific company by ID.

**Response (200):**
```json
{
    "success": true,
    "data": {
        "CompanyID": 1,
        "CompanyName": "Aditya Enterprises",
        ...
    }
}
```

---

#### 1.4 Get Company by GSTIN
**GET** `/gstin/:gstin`

Retrieve company details using GSTIN.

---

#### 1.5 Update Company
**PUT** `/:id`

Update company information.

---

#### 1.6 Delete Company
**DELETE** `/:id`

Soft delete a company (mark as inactive).

---

## 2. FINANCIAL YEARS MANAGEMENT API

### Base URL: `/api/financial-years`

#### 2.1 Create Financial Year
**POST** `/create`

Create a new financial year for a company.

**Request Body:**
```json
{
    "companyId": 1,
    "fyName": "2024-2025",
    "startDate": "2024-04-01",
    "endDate": "2025-03-31"
}
```

**Response (201):**
```json
{
    "success": true,
    "message": "Financial year created successfully",
    "financialYearId": 1,
    "data": {
        "companyId": 1,
        "fyName": "2024-2025",
        "startDate": "2024-04-01",
        "endDate": "2025-03-31",
        "status": "Active"
    }
}
```

---

#### 2.2 Get All Financial Years for Company
**GET** `/company/:companyId`

Retrieve all financial years for a specific company.

**Response (200):**
```json
{
    "success": true,
    "data": [
        {
            "FinancialYearID": 1,
            "FYName": "2024-2025",
            "StartDate": "2024-04-01",
            "EndDate": "2025-03-31",
            "Status": "Active"
        }
    ]
}
```

---

#### 2.3 Get Active Financial Year
**GET** `/company/:companyId/active`

Retrieve the currently active financial year.

---

#### 2.4 Get Financial Year by Date
**GET** `/company/:companyId/date/:date`

Get the financial year that contains the given date.

**Example:** `/company/1/date/2024-06-15`

---

#### 2.5 Get Financial Year by ID
**GET** `/:id`

Retrieve specific financial year details.

---

#### 2.6 Update Financial Year Status
**PUT** `/:id/status`

Change the status of a financial year.

**Request Body:**
```json
{
    "status": "Closed"
}
```

**Valid statuses:** `Active`, `Closed`, `Archived`

---

## 3. ACCESS TOKENS MANAGEMENT API

### Base URL: `/api/access-tokens`

#### 3.1 Generate New Token
**POST** `/generate`

Generate a new access token for a financial year (SuperAdmin only).

**Request Body:**
```json
{
    "companyId": 1,
    "financialYearId": 1,
    "tokenType": "Annual",
    "expiryDate": "2025-03-31T23:59:59Z"
}
```

**Response (201):**
```json
{
    "success": true,
    "message": "Token generated successfully",
    "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
    "tokenId": 1,
    "expiryDate": "2025-03-31T23:59:59Z"
}
```

---

#### 3.2 Verify Token
**POST** `/verify`

Verify if a token is valid and active.

**Request Body:**
```json
{
    "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
    "companyId": 1,
    "financialYearId": 1
}
```

**Response (200):**
```json
{
    "success": true,
    "message": "Token is valid",
    "isValid": true,
    "expiryDate": "2025-03-31T23:59:59Z"
}
```

---

#### 3.3 Get Token by Company and FY
**GET** `/:companyId/:financialYearId`

Retrieve token details for a specific company and financial year.

---

#### 3.4 Get All Tokens for Company
**GET** `/company/:companyId`

Retrieve all tokens (including expired/revoked) for a company.

**Response (200):**
```json
{
    "success": true,
    "data": [
        {
            "TokenID": 1,
            "CompanyID": 1,
            "FinancialYearID": 1,
            "TokenType": "Annual",
            "IsActive": 1,
            "IssuedDate": "2024-04-01T10:00:00Z",
            "ExpiryDate": "2025-03-31T23:59:59Z",
            "LastUsedDate": "2024-06-15T14:30:00Z",
            "FYName": "2024-2025"
        }
    ]
}
```

---

#### 3.5 Regenerate Token
**POST** `/regenerate`

Generate a new token for a financial year and revoke old ones.

**Request Body:**
```json
{
    "companyId": 1,
    "financialYearId": 1,
    "expiryDate": "2025-03-31T23:59:59Z"
}
```

---

#### 3.6 Revoke Token
**PUT** `/:tokenId/revoke`

Immediately revoke/disable a token.

**Response (200):**
```json
{
    "success": true,
    "message": "Token revoked successfully"
}
```

---

## 4. FINANCIAL YEAR DATA TRANSFER API

### Base URL: `/api/fy-transfer`

#### 4.1 Initiate Transfer
**POST** `/initiate`

Initiate a financial year transfer request (CompanyAdmin only).

**Request Body:**
```json
{
    "companyId": 1,
    "fromFinancialYearId": 1,
    "toFinancialYearId": 2,
    "description": "Year-end transfer from 2024-2025 to 2025-2026"
}
```

**Response (201):**
```json
{
    "success": true,
    "message": "Transfer initiated successfully",
    "transferId": 1,
    "status": "Pending"
}
```

---

#### 4.2 Get Transfer Logs
**GET** `/company/:companyId`

Retrieve all transfer logs for a company.

**Response (200):**
```json
{
    "success": true,
    "data": [
        {
            "TransferID": 1,
            "FromFinancialYearID": 1,
            "ToFinancialYearID": 2,
            "Status": "Completed",
            "TransferredBy": 1,
            "TransferredDate": "2024-06-15T10:00:00Z",
            "Description": "Year-end transfer"
        }
    ]
}
```

---

#### 4.3 Get Transfer Details
**GET** `/:id`

Retrieve specific transfer log details.

---

#### 4.4 Execute Transfer
**POST** `/:id/execute`

Execute the financial year transfer (CompanyAdmin only).

**What gets transferred:**
- Categories
- Suppliers
- Customers
- Products & Inventory
- Accounts (with reset balance)
- Warehouses
- Stock levels

**Request Body:**
```json
{
    "companyId": 1,
    "fromFinancialYearId": 1,
    "toFinancialYearId": 2
}
```

**Response (200):**
```json
{
    "success": true,
    "message": "Financial year transfer completed successfully",
    "status": "Completed"
}
```

---

#### 4.5 Cancel Transfer
**POST** `/:id/cancel`

Cancel or reject a pending transfer.

**Request Body:**
```json
{
    "notes": "Transfer cancelled due to data inconsistency"
}
```

---

## DATA TRANSFER DETAILS

### What Gets Transferred During FY Transfer:

1. **Categories** - All product categories
2. **Suppliers** - All supplier information
3. **Customers** - All customer information
4. **Products** - All product definitions with current specifications
5. **Inventory** - Stock quantities for all products by warehouse
6. **Accounts** - Bank and cash accounts (balance reset to 0)
7. **Warehouses** - Warehouse information

### What Does NOT Get Transferred:

- Sales/Orders history
- Purchase history
- Expense records
- Stock movement logs
- Audit trails
- Financial transactions

---

## USER ROLES & PERMISSIONS

### SuperAdmin (Developer)
- Create companies
- Create/manage financial years
- Generate and revoke access tokens
- View all company data

### CompanyAdmin (Client Head)
- Manage company's products, suppliers, customers
- Initiate and execute financial year transfers
- View company's financial data

### Manager
- Manage daily operations (sales, purchases, inventory)
- Generate reports
- Cannot access company/token settings

### Staff
- Limited access to assigned modules
- View-only in most areas

---

## ERROR RESPONSES

### 400 Bad Request
```json
{
    "success": false,
    "message": "Detailed error message",
    "error": {}
}
```

### 401 Unauthorized
```json
{
    "success": false,
    "message": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
    "success": false,
    "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
    "success": false,
    "message": "Error message",
    "error": {}
}
```

---

## AUTHENTICATION

Include token in request header:
```
Authorization: Bearer <access_token>
```

---

## EXAMPLE WORKFLOW

### 1. SuperAdmin Setup
```
1. Create Company → POST /api/companies/create
2. Create Financial Year → POST /api/financial-years/create
3. Generate Token → POST /api/access-tokens/generate
```

### 2. Year-End Transfer (CompanyAdmin)
```
1. Create New Financial Year → POST /api/financial-years/create
2. Initiate Transfer → POST /api/fy-transfer/initiate
3. Execute Transfer → POST /api/fy-transfer/:id/execute
4. Generate New Token → POST /api/access-tokens/regenerate
```

### 3. Token Verification
```
Client sends requests with token in header
API verifies token → POST /api/access-tokens/verify
If invalid, request is rejected
```

---

## NOTES

- All timestamps are in ISO 8601 format (UTC)
- Financial year dates should not overlap for same company
- Tokens are tied to specific financial years
- Transfers preserve data integrity with automatic rollback on failure
- Soft deletes are used for data retention/audit purposes
