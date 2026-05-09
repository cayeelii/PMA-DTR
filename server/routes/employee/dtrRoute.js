const express = require("express");
const router = express.Router();

const employeeDtr = require("../../controllers/employee/dtrController");

// Employee logged-in DTR
router.get("/view", employeeDtr.getEmployeeDTR);

// Get the latest month and year for which the employee has DTR records
router.get("/latest-month", employeeDtr.getLatestDTR);

module.exports = router;