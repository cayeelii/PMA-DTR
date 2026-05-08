const express = require("express");
const router = express.Router();

const employeeDtr = require("../../controllers/employee/dtrController");

// Employee logged-in DTR
router.get("/view", employeeDtr.getEmployeeDTR);

module.exports = router;