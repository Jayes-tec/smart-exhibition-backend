const express = require("express");
const router = express.Router();

const exhibitorController = require("../controllers/exhibitor.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");


// UPLOAD LOGO (returns logo url to use in POST/PUT below)
// Exhibitor
router.post(
  "/upload-logo",
  authenticate,
  authorize(3),
  upload.single("logo"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    res.status(200).json({ success: true, message: "Logo uploaded", logo: `/uploads/exhibitors/${req.file.filename}` });
  }
);


// CREATE EXHIBITOR
// Exhibitor
router.post(
  "/",
  authenticate,
  authorize(3),
  exhibitorController.createExhibitor
);


// GET ALL EXHIBITORS
// Admin / Organizer
router.get(
  "/",
  authenticate,
  authorize(1, 2),
  exhibitorController.getAllExhibitors
);


// GET EXHIBITOR BY ID
// Admin / Organizer / Exhibitor
router.get(
  "/:id",
  authenticate,
  authorize(1, 2, 3),
  exhibitorController.getExhibitorById
);


// UPDATE EXHIBITOR
// Exhibitor
router.put(
  "/:id",
  authenticate,
  authorize(3),
  exhibitorController.updateExhibitor
);


// DELETE EXHIBITOR
// Admin / Organizer / Exhibitor
router.delete(
  "/:id",
  authenticate,
  authorize(1, 2, 3),
  exhibitorController.deleteExhibitor
);


module.exports = router;