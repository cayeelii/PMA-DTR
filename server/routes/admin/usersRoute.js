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

//PATCH /users/archive/:user_id
router.patch("/archive/:user_id", adminUserController.archiveUser);

//GET /users/archived?role=employee|admin
router.get("/archived", adminUserController.getArchivedUsers);

//PATCH /users/restore/:user_id
router.patch("/restore/:user_id", adminUserController.restoreUser);

//POST /users/add
router.post("/add", adminUserController.addAdminUser);

//POST /users/add-employee
router.post("/add-employee", adminUserController.addEmployee);

//GET /users/admins
router.get("/admins", adminUserController.getAllAdmins);

//POST /users/add-supervisor
router.post("/add-supervisor", adminUserController.addSupervisor);

//Get /users/supervisors
router.get("/supervisors", adminUserController.getSupervisors);

module.exports = router;
