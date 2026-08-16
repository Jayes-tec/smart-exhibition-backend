const express = require("express");
const router = express.Router();

const boothDocumentController = require("../controllers/boothDocument.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");


// UPLOAD FILE (returns file_url to use in POST / below)
// Exhibitor
router.post(
  "/upload",
  authenticate,
  authorize(3),
  upload.single("file"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    res.status(200).json({
      success: true,
      message: "File uploaded",
      file_url: `/uploads/booth-documents/${req.file.filename}`,
    });
  }
);


// CREATE DOCUMENT
// Exhibitor
router.post(
  "/",
  authenticate,
  authorize(3),
  boothDocumentController.createDocument
);


// GET ALL DOCUMENTS
// Admin / Organizer
router.get(
  "/",
  authenticate,
  authorize(1, 2),
  boothDocumentController.getAllDocuments
);


// GET DOCUMENT BY ID
// Admin / Organizer
router.get(
  "/:id",
  authenticate,
  authorize(1, 2),
  boothDocumentController.getDocumentById
);


// DELETE DOCUMENT
// Admin / Organizer
router.delete(
  "/:id",
  authenticate,
  authorize(1, 2, 3),
  boothDocumentController.deleteDocument
);


module.exports = router; 