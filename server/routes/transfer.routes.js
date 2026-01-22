const express = require("express");
const router = express.Router();
const transferController = require("../controllers/transfer.controller");

router.get("/", transferController.getAll);
router.post("/", transferController.create);

module.exports = router;
