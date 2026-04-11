const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { changePassword } = require("../controllers/authController");


//POST /auth/change-password
router.post("/change-password", changePassword);

//POST /auth/register
router.post("/register", authController.register);

//POST /auth/adminLogin
router.post("/adminLogin", authController.adminLogin);

//POST /auth/employeeLogin
router.post("/employeeLogin", authController.employeeLogin);

//POST /auth/logout
router.post("/logout", authController.logout);

//GET /auth/current-user
router.get("/current-user", authController.getCurrentUser);

module.exports = router;
