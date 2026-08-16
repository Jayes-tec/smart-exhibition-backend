const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notification.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");


// CREATE NOTIFICATION
// Admin / Organizer
router.post(
  "/",
  authenticate,
  authorize(1, 2),
  notificationController.createNotification
);


// GET ALL NOTIFICATIONS
// Admin / Organizer
router.get(
  "/",
  authenticate,
  authorize(1, 2),
  notificationController.getAllNotifications
);

// GET MY NOTIFICATIONS
// Logged-in user
router.get(
  "/my",
  authenticate,
  notificationController.getMyNotifications
);


// GET NOTIFICATION BY ID
// Logged-in user
router.get(
  "/:id",
  authenticate,
  notificationController.getNotificationById
);


// MARK NOTIFICATION AS READ
// Logged-in user
router.put(
  "/:id/read",
  authenticate,
  notificationController.markAsRead
);


// DELETE NOTIFICATION
// Admin / Organizer
router.delete(
  "/:id",
  authenticate,
  authorize(1, 2),
  notificationController.deleteNotification
);


module.exports = router;