const express = require("express");
const router = express.Router();

const exhibitionController = require("../controllers/exhibition.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");
// CREATE EXHIBITION
router.post(
  "/",
  authenticate,
  authorize(2),
  upload.single("banner"),
  exhibitionController.createExhibition
);

// GET ALL EXHIBITIONS
router.get(
  "/",
  authenticate,
  exhibitionController.getAllExhibitions
);

// GET EXHIBITION BY ID
router.get(
  "/:id",
  authenticate,
  exhibitionController.getExhibitionById
);

// UPDATE EXHIBITION
router.put(
  "/:id",
  authenticate,
  authorize(2),
  upload.single("banner"),
  exhibitionController.updateExhibition
);

// DELETE EXHIBITION
router.delete(
  "/:id",
  authenticate,
  authorize(2),
  exhibitionController.deleteExhibition
);

module.exports = router;
