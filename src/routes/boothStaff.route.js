const express = require("express");
const router = express.Router();


const boothStaffController = require("../controllers/boothStaff.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");



// CREATE STAFF
// Exhibitor
router.post(
  "/",
  authenticate,
  authorize(3),
  boothStaffController.createStaff
);



// GET ALL STAFF
// Admin / Organizer
router.get(
  "/",
  authenticate,
  authorize(1, 2),
  boothStaffController.getAllStaff
);



// GET STAFF BY ID
// Admin / Organizer / Exhibitor
router.get(
  "/:id",
  authenticate,
  authorize(1, 2, 3),
  boothStaffController.getStaffById
);



// UPDATE STAFF
// Exhibitor
router.put(
  "/:id",
  authenticate,
  authorize(3),
  boothStaffController.updateStaff
);



// DELETE STAFF
// Admin / Organizer / Exhibitor
router.delete(
  "/:id",
  authenticate,
  authorize(1, 2, 3),
  boothStaffController.deleteStaff
);



module.exports = router;