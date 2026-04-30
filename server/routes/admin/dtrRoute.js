const express = require("express");
const router = express.Router();

const dtrController = require("../../controllers/admin/dtrController");

router.post("/import", dtrController.importDTR);
router.get("/departments", dtrController.getDepartments);
router.get("/employees", dtrController.getEmployeesByDepartment);
router.get("/employee-dtr", dtrController.getEmployeeDTR);
router.put("/update-dtr", dtrController.updateEmployeeDTR);
router.get("/signatory", dtrController.getDepartmentSignatory);
router.get("/export-department-xlsx", dtrController.exportDepartmentXLSX);

module.exports = router;
