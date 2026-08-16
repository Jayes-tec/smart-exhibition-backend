const express = require("express");
const router = express.Router();

const feedbackController = require("../controllers/feedback.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");


// CREATE FEEDBACK
// Visitor
router.post(
  "/",
  authenticate,
  authorize(4),
  feedbackController.createFeedback
);


// GET ALL FEEDBACK
// Admin / Organizer
router.get(
  "/",
  authenticate,
  authorize(1, 2),
  feedbackController.getAllFeedback
);


// GET FEEDBACK BY ID
// Admin / Organizer
router.get(
  "/:id",
  authenticate,
  authorize(1, 2),
  feedbackController.getFeedbackById
);


// DELETE FEEDBACK
// Admin
router.delete(
  "/:id",
  authenticate,
  authorize(1),
  feedbackController.deleteFeedback
);


module.exports = router;