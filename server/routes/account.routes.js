const express = require("express");
const router = express.Router();
const accountController = require("../controllers/account.controller");

router.get("/", accountController.getAll);
router.post("/", accountController.create);

module.exports = router;
