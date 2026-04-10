const express = require("express");
const router = express.Router();

const adminActivityLogsController = require("../../controllers/admin/adminActivityLogsController");

//GET /activity-logs
router.get("/", adminActivityLogsController.getActivityLogs);
//POST /activity-logs
router.post("/", adminActivityLogsController.createActivityLog);

module.exports = router;
