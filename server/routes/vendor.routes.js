const express = require("express");
const router = express.Router();
const vendorController = require("../controllers/vendor.controller");

router.get("/", vendorController.getAll);
router.post("/", vendorController.create);
router.put("/:id", vendorController.update);
router.delete("/:id", vendorController.delete);

module.exports = router;
