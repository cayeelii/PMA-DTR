const express = require("express");
const router = express.Router();

const supervisor = require("../../controllers/employee/supervisorController");

router.get("/employees", supervisor.getSupervisorEmployees);

router.get("/available-months", supervisor.getAvailableDTRMonths);

router.get("/view", supervisor.getEmployeeDTR);

module.exports = router;   