const express = require("express");
const router = express.Router();
const backupController = require("../controllers/backup.controller");

router.get("/export", backupController.exportData);
router.post("/import", backupController.importData);

module.exports = router;
