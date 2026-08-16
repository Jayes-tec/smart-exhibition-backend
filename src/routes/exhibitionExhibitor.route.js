const express = require("express");
const router = express.Router();

const exhibitionExhibitorController = require("../controllers/exhibitionExhibitor.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");


// CREATE EXHIBITION EXHIBITOR
// Admin / Organizer
// NOTE: manual override path — normal flow is booth-booking approve,
// which auto-creates this record. This endpoint stays for Admin/Organizer
// to register an exhibitor directly without going through a booking.
router.post(
  "/",
  authenticate,
  authorize(1, 2),
  exhibitionExhibitorController.createExhibitionExhibitor
);


// GET ALL EXHIBITION EXHIBITORS
// Admin / Organizer
router.get(
  "/",
  authenticate,
  authorize(1, 2),
  exhibitionExhibitorController.getAllExhibitionExhibitors
);


// GET EXHIBITION EXHIBITOR BY ID
// Admin / Organizer / Exhibitor
router.get(
  "/:id",
  authenticate,
  authorize(1, 2, 3),
  exhibitionExhibitorController.getExhibitionExhibitorById
);


// UPDATE STATUS
// Organizer
router.put(
  "/:id/status",
  authenticate,
  authorize(2),
  exhibitionExhibitorController.updateStatus
);


// DELETE EXHIBITION EXHIBITOR
// Admin / Organizer
router.delete(
  "/:id",
  authenticate,
  authorize(1, 2),
  exhibitionExhibitorController.deleteExhibitionExhibitor
);


module.exports = router;