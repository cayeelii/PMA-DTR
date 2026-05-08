const express = require("express");
const router = express.Router();

const scheduleController = require("../../controllers/admin/scheduleController");

// GET all schedules
router.get("/", scheduleController.getSchedules);

// GET single schedule
router.get("/:id", scheduleController.getScheduleById);

// CREATE schedule
router.post("/", scheduleController.createSchedule);

// UPDATE schedule
router.put("/:id", scheduleController.updateSchedule);

// ARCHIVE schedule (soft delete)
router.patch("/:id/archive", scheduleController.archiveSchedule);

module.exports = router;