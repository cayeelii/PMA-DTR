const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

//POST /auth/register
router.post("/register", authController.register);

//POST /auth/login
router.post("/login", authController.login);

module.exports = router;