const express = require("express");
const router = express.Router();

const maintenanceController = require("../../controllers/admin/maintenanceController");

router.get("/", maintenanceController.getMaintenance);

// ADD
router.post("/add", maintenanceController.addMaintenance);

// DELETE
router.delete("/:id", maintenanceController.deleteMaintenance);

module.exports = router;