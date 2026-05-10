const express = require("express");
const router = express.Router();

const supervisor = require("../../controllers/employee/supervisorController");

router.get("/employees", supervisor.getSupervisorEmployees);

module.exports = router;   