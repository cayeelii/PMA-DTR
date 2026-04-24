const express = require("express");
const router = express.Router();

const adminActivityLogsController = require("../../controllers/admin/activityLogsController");

//GET /activity-logs/filters (must come before "/" to avoid shadowing)
router.get("/filters", adminActivityLogsController.getActivityLogFilters);
//GET /activity-logs
router.get("/", adminActivityLogsController.getActivityLogs);
//POST /activity-logs
router.post("/", adminActivityLogsController.createActivityLog);

module.exports = router;
