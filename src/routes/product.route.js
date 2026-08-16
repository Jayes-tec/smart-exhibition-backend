const express = require("express");
const router = express.Router();


const productController = require("../controllers/product.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");


// UPLOAD PRODUCT IMAGE (returns image url to use in POST/PUT below)
// Exhibitor
router.post(
  "/upload-image",
  authenticate,
  authorize(3),
  upload.single("image"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    res.status(200).json({ success: true, message: "Image uploaded", image: `/uploads/products/${req.file.filename}` });
  }
);





// CREATE PRODUCT
// Only Exhibitor
router.post(
  "/",
  authenticate,
  authorize(3),
  productController.createProduct
);



// GET ALL PRODUCTS
// Admin / Organizer
router.get(
  "/",
  authenticate,
  authorize(1, 2),
  productController.getAllProducts
);



// GET PRODUCT BY ID
// Admin / Organizer / Exhibitor
router.get(
  "/:id",
  authenticate,
  authorize(1, 2, 3),
  productController.getProductById
);



// UPDATE PRODUCT
// Exhibitor
router.put(
  "/:id",
  authenticate,
  authorize(3),
  productController.updateProduct
);



// DELETE PRODUCT
// Exhibitor
router.delete(
  "/:id",
  authenticate,
  authorize(3),
  productController.deleteProduct
);



module.exports = router;