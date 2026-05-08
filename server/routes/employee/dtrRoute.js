const express = require("express");
const router = express.Router();

const {
  getEmployeeDTR,
} = require("../../controllers/employee/getEmployeeDTR");

// Employee logged-in DTR
router.get("/view", getEmployeeDTR);

module.exports = router;