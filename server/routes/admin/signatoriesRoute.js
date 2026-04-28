const express = require("express");
const router = express.Router();

const adminSignatoriesRoute = require("../../controllers/admin/signatoriesController");

//GET /signatories/departments
router.get("/departments", adminSignatoriesRoute.getDepartments);

//GET /signatories
router.get("/", adminSignatoriesRoute.getSignatories);

//POST /signatories/add
router.post("/add", adminSignatoriesRoute.addSignatory);

//PUT /signatories/update
router.put("/update", adminSignatoriesRoute.updateSignatory);

//DELETE /signatories/delete/:signatory_id
router.delete("/delete/:signatory_id", adminSignatoriesRoute.deleteSignatory);

module.exports = router;
