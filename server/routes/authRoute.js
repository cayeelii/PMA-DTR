const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  getCurrentUser,
  changePassword,
} = require("../controllers/authController");

// POST /auth/register
router.post("/register", register);

// POST /auth/login
router.post("/login", login);

// POST /auth/logout
router.post("/logout", logout);

// GET /auth/current-user
router.get("/current-user", getCurrentUser);

// POST /auth/change-password
router.post("/change-password", changePassword);

module.exports = router;