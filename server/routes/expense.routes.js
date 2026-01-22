const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expense.controller");

router.get("/", expenseController.getAll);
router.post("/", expenseController.create);

module.exports = router;
