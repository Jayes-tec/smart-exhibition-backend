const express = require("express");
const router = express.Router();

const visitorController = require("../controllers/visitor.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

// CREATE VISITOR PROFILE
router.post(
  "/",
  authenticate,
  authorize(4), // Visitor
  visitorController.createVisitor
);

// GET ALL VISITORS
router.get(
  "/",
  authenticate,
  authorize(1, 2), // Admin / Organizer
  visitorController.getAllVisitors
);

// GET OWN VISITOR PROFILE
router.get(
  "/profile",
  authenticate,
  authorize(4),
  visitorController.getVisitorProfile
);

// UPDATE OWN VISITOR PROFILE
router.put(
  "/profile",
  authenticate,
  authorize(4),
  visitorController.updateVisitor
);

module.exports = router;