const express = require("express");
const router = express.Router();

const adminUserController = require("../../controllers/admin/usersController");

//GET /users/pending
router.get("/pending", adminUserController.getPendingUsers);

//GET /users/employees/approved
router.get("/employees/approved", adminUserController.getApprovedEmployees);

//PATCH /users/approve/:user_id
router.patch("/approve/:user_id", adminUserController.approveUser);

//PATCH /users/reject/:user_id
router.patch("/reject/:user_id", adminUserController.rejectUser);

//POST /users/add
router.post("/add", adminUserController.addAdminUser);

// GET /users/admins
router.get("/admins", adminUserController.getAllAdmins);

module.exports = router;
