const express = require("express");
const router = express.Router();

const homepageController = require("../../controllers/admin/homepageController");


router.get("/dtr-batches", homepageController.getDTRBatches);
router.get("/latest-batch", homepageController.getLatestBatch);

module.exports = router;    