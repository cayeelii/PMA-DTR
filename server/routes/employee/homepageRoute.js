const express = require("express");
const router = express.Router();

const homepageController = require("../../controllers/employee/homepageController");

router.get("/", getEmployeeHomepage);

module.exports = router;