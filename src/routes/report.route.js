const express = require("express");
const router = express.Router();

const reportController = require("../controllers/report.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");


// CREATE REPORT
// Admin / Organizer
router.post(
  "/",
  authenticate,
  authorize(1, 2),
  upload.single("report"),
  reportController.createReport
);


// GET ALL REPORTS
// Admin / Organizer
router.get(
  "/",
  authenticate,
  authorize(1, 2),
  reportController.getAllReports
);


// GET REPORT BY ID
// Admin / Organizer
router.get(
  "/:id",
  authenticate,
  authorize(1, 2),
  reportController.getReportById
);


// DELETE REPORT
// Admin only
router.delete(
  "/:id",
  authenticate,
  authorize(1),
  reportController.deleteReport
);


module.exports = router;