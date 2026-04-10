const express = require("express");
const router = express.Router();

const adminSignatoriesRoute = require("../../controllers/admin/adminSignatoriesController");

//GET /signatories/departments
router.get("/departments", adminSignatoriesRoute.getDepartments);

//GET /signatories
router.get("/", adminSignatoriesRoute.getSignatories);

//POST /signatories/add
router.post("/add", adminSignatoriesRoute.addSignatory);

//PUT /signatories/update
router.put("/update", adminSignatoriesRoute.updateSignatory);

module.exports = router;
