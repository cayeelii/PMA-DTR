const express = require("express");
const router = express.Router();

const adminUserController = require("../../controllers/admin/adminUsersController");

//GET /users/pending
router.get("/pending", adminUserController.getPendingUsers);

//PATCH /users/approve/:user_id
router.patch("/approve/:user_id", adminUserController.approveUser);

//PATCH /users/reject/:user_id
router.patch("/reject/:user_id", adminUserController.rejectUser);

module.exports = router;
