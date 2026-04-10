const express = require("express");
const router = express.Router();

const dtrController = require("../../controllers/admin/dtrController");

router.post("/import", dtrController.importDTR);
router.get("/departments", dtrController.getDepartments);
router.get("/employees", dtrController.getEmployeesByDepartment);

module.exports = router;