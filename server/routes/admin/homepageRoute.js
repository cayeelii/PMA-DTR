const express = require("express");
const router = express.Router();

const homepageController = require("../../controllers/admin/homepageController");


router.get("/dtr-batches", homepageController.getDTRBatches);

module.exports = router;    