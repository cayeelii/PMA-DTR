const express = require("express");
const router = express.Router();

const dtrController = require("../../controllers/admin/dtrController");

router.post("/import", dtrController.importDTR);

module.exports = router;