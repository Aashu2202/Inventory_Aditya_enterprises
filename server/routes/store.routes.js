const express = require("express");
const router = express.Router();
const storeController = require("../controllers/store.controller");

router.get("/", storeController.getAll);
router.post("/", storeController.create);
router.get("/:id/inventory", storeController.getInventory);
router.put("/:id", storeController.update);
router.delete("/:id", storeController.delete);

module.exports = router;
