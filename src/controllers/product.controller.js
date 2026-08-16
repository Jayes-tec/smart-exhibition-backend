const productService = require("../services/product.service");

// CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    const data = {
      ...req.body,
      userId: req.user.userId,
    };

    const result = await productService.createProduct(data);

    res.status(result.statusCode || 201).json(result);
  } catch (error) {
    console.error("Create Product Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET ALL PRODUCTS
const getAllProducts = async (req, res) => {
  try {
    const result = await productService.getAllProducts();

    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Get All Products Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET PRODUCT BY ID
const getProductById = async (req, res) => {
  try {
    const result = await productService.getProductById(
      req.params.id,
      req.user
    );

    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Get Product By ID Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// UPDATE PRODUCT
const updateProduct = async (req, res) => {
  try {
    const data = {
      ...req.body,
      userId: req.user.userId,
    };

    const result = await productService.updateProduct(
      req.params.id,
      data
    );

    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Update Product Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// DELETE PRODUCT
const deleteProduct = async (req, res) => {
  try {
    const result = await productService.deleteProduct(
      req.params.id,
      req.user.userId
    );

    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Delete Product Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};