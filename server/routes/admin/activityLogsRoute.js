const express = require("express");
const router = express.Router();

const activityLogsController = require("../../controllers/activityLogsController");

//GET /activity-logs
router.get("/", activityLogsController.getActivityLogs);
//POST /activity-logs
router.post("/", activityLogsController.createActivityLog);

module.exports = router;
