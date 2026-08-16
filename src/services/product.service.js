const db = require("../config/db");

// CREATE PRODUCT
const createProduct = async (data) => {
  const {
    exhibition_exhibitor_id,
    product_name,
    category,
    description,
    price,
    image,
    userId,
  } = data;

  // 1. Validation
  if (!exhibition_exhibitor_id || !product_name) {
    return {
      success: false,
      statusCode: 400,
      message: "Exhibition exhibitor ID and product name are required",
    };
  }

  // 2. Check Exhibition-Exhibitor belongs to logged-in Exhibitor
  const [exhibitionExhibitor] = await db.query(
    `SELECT
       ee.exhibition_exhibitor_id,
       ee.status
     FROM exhibition_exhibitors ee
     JOIN exhibitors e
       ON ee.exhibitor_id = e.exhibitor_id
     WHERE ee.exhibition_exhibitor_id = ?
     AND e.user_id = ?`,
    [exhibition_exhibitor_id, userId]
  );

  if (exhibitionExhibitor.length === 0) {
    return {
      success: false,
      statusCode: 403,
      message:
        "You can only create products for your own exhibitor account",
    };
  }

  // Products can only be created for an approved exhibition registration
  if (exhibitionExhibitor[0].status !== "Approved") {
    return {
      success: false,
      statusCode: 400,
      message:
        "Products can only be created for an approved exhibition registration",
    };
  }

  // 3. Create Product
  const [result] = await db.query(
    `INSERT INTO products
    (
      exhibition_exhibitor_id,
      product_name,
      category,
      description,
      price,
      image
    )
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      exhibition_exhibitor_id,
      product_name,
      category ?? null,
      description ?? null,
      price ?? null,
      image ?? null,
    ]
  );

  return {
    success: true,
    statusCode: 201,
    message: "Product created successfully",
    productId: result.insertId,
  };
};


// GET ALL PRODUCTS
const getAllProducts = async () => {
  const [rows] = await db.query(
    `SELECT
      p.*,
      ee.exhibition_id,
      ee.exhibitor_id,
      e.company_name,
      ex.title AS exhibition_name
     FROM products p
     JOIN exhibition_exhibitors ee
       ON p.exhibition_exhibitor_id = ee.exhibition_exhibitor_id
     JOIN exhibitors e
       ON ee.exhibitor_id = e.exhibitor_id
     JOIN exhibitions ex
       ON ee.exhibition_id = ex.exhibition_id
     ORDER BY p.product_id DESC`
  );

  return {
    success: true,
    statusCode: 200,
    data: rows,
  };
};


// GET PRODUCT BY ID
const getProductById = async (id, user) => {
  const [rows] = await db.query(
    `SELECT
      p.*,
      ee.exhibition_id,
      ee.exhibitor_id,
      e.company_name,
      e.user_id AS exhibitor_user_id,
      ex.title AS exhibition_name
     FROM products p
     JOIN exhibition_exhibitors ee
       ON p.exhibition_exhibitor_id = ee.exhibition_exhibitor_id
     JOIN exhibitors e
       ON ee.exhibitor_id = e.exhibitor_id
     JOIN exhibitions ex
       ON ee.exhibition_id = ex.exhibition_id
     WHERE p.product_id = ?`,
    [id]
  );

  if (rows.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Product not found",
    };
  }

  // Admin / Organizer can view any product
  if (
    user &&
    (user.roleId === 1 || user.roleId === 2)
  ) {
    return {
      success: true,
      statusCode: 200,
      data: rows[0],
    };
  }

  // Exhibitor can view only their own product
  if (
    user &&
    user.roleId === 3 &&
    rows[0].exhibitor_user_id !== user.userId
  ) {
    return {
      success: false,
      statusCode: 403,
      message: "You can only view your own product",
    };
  }

  return {
    success: true,
    statusCode: 200,
    data: rows[0],
  };
};


// UPDATE PRODUCT
const updateProduct = async (id, data) => {
  const {
    product_name,
    category,
    description,
    price,
    image,
    status,
    userId,
  } = data;

  // 1. Check Product belongs to logged-in Exhibitor
  const [product] = await db.query(
    `SELECT
       p.product_id,
       ee.status AS exhibition_exhibitor_status
     FROM products p
     JOIN exhibition_exhibitors ee
       ON p.exhibition_exhibitor_id = ee.exhibition_exhibitor_id
     JOIN exhibitors e
       ON ee.exhibitor_id = e.exhibitor_id
     WHERE p.product_id = ?
     AND e.user_id = ?`,
    [id, userId]
  );

  if (product.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Product not found",
    };
  }

  // Product can only be updated for an approved exhibition registration
  if (product[0].exhibition_exhibitor_status !== "Approved") {
    return {
      success: false,
      statusCode: 400,
      message:
        "Product can only be updated for an approved exhibition registration",
    };
  }

  // 2. Validate Product Status
  const allowedStatuses = ["Active", "Inactive"];

  if (status && !allowedStatuses.includes(status)) {
    return {
      success: false,
      statusCode: 400,
      message: "Invalid product status",
    };
  }

  // 3. Update Product
  await db.query(
    `UPDATE products
     SET
       product_name = ?,
       category = ?,
       description = ?,
       price = ?,
       image = ?,
       status = ?
     WHERE product_id = ?`,
    [
      product_name,
      category ?? null,
      description ?? null,
      price ?? null,
      image ?? null,
      status || "Active",
      id,
    ]
  );

  return {
    success: true,
    statusCode: 200,
    message: "Product updated successfully",
  };
};


// DELETE PRODUCT
const deleteProduct = async (id, userId) => {
  // 1. Check Product belongs to logged-in Exhibitor
  const [product] = await db.query(
    `SELECT
       p.product_id,
       ee.status AS exhibition_exhibitor_status
     FROM products p
     JOIN exhibition_exhibitors ee
       ON p.exhibition_exhibitor_id = ee.exhibition_exhibitor_id
     JOIN exhibitors e
       ON ee.exhibitor_id = e.exhibitor_id
     WHERE p.product_id = ?
     AND e.user_id = ?`,
    [id, userId]
  );

  if (product.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Product not found",
    };
  }

  // Product can only be deleted for an approved exhibition registration
  if (product[0].exhibition_exhibitor_status !== "Approved") {
    return {
      success: false,
      statusCode: 400,
      message:
        "Product can only be deleted for an approved exhibition registration",
    };
  }

  // 2. Delete Product
  await db.query(
    `DELETE FROM products
     WHERE product_id = ?`,
    [id]
  );

  return {
    success: true,
    statusCode: 200,
    message: "Product deleted successfully",
  };
};


module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};