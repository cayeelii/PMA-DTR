const express = require("express");
const router = express.Router();

const adminUserController = require("../controllers/adminUsersController");

//GET /users/pending
router.get("/pending", adminUserController.getPendingUsers);

//PATCH /users/approve/:user_id
router.patch("/approve/:user_id", adminUserController.approveUser);

module.exports = router;
