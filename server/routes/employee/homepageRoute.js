const express = require("express");
const router = express.Router();

const homepageController = require("../../controllers/employee/homepageController");

router.get("/", homepageController.getEmployeeHomepage);

module.exports = router;