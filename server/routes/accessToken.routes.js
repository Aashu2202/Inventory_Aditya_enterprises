const express = require("express");
const router = express.Router();
const AccessTokenController = require("../controllers/accessToken.controller");

// Generate new token for financial year
router.post("/generate", AccessTokenController.generateToken);

// Verify token
router.post("/verify", AccessTokenController.verifyToken);

// Get token by company and financial year
router.get("/:companyId/:financialYearId", AccessTokenController.getTokenByCompanyAndFY);

// Get all tokens for company
router.get("/company/:companyId", AccessTokenController.getTokensByCompany);

// Regenerate token
router.post("/regenerate", AccessTokenController.regenerateToken);

// Revoke token
router.put("/:tokenId/revoke", AccessTokenController.revokeToken);

module.exports = router;
