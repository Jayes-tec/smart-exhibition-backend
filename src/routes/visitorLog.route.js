const express = require("express");
const router = express.Router();

const visitorLogController = require("../controllers/visitorLog.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");


// CREATE VISITOR LOG
// Admin / Organizer / Exhibitor
router.post(
  "/",
  authenticate,
  authorize(1, 2, 3),
  visitorLogController.createVisitorLog
);


// GET ALL VISITOR LOGS
// Admin / Organizer
router.get(
  "/",
  authenticate,
  authorize(1, 2),
  visitorLogController.getAllVisitorLogs
);


// GET MY VISITOR LOGS
// Visitor
router.get(
  "/my-logs",
  authenticate,
  authorize(4),
  visitorLogController.getMyVisitorLogs
);


// GET VISITOR LOG BY ID
// Admin / Organizer / Exhibitor / Visitor
router.get(
  "/:id",
  authenticate,
  authorize(1, 2, 3, 4),
  visitorLogController.getVisitorLogById
);


module.exports = router;