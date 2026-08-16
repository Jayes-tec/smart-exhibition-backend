const db = require("../config/db");


// CREATE EXHIBITOR
const createExhibitor = async (data) => {
  const {
    user_id,
    company_name,
    industry,
    website,
    gst_number,
    description,
    logo,
    head_office,
    contact_person,
  } = data;

  // 1. Validation
  if (!user_id || !company_name) {
    return {
      success: false,
      statusCode: 400,
      message: "User ID and company name are required",
    };
  }

  // 2. Check User Exists
  const [user] = await db.query(
    `SELECT user_id, role_id
     FROM users
     WHERE user_id = ?`,
    [user_id]
  );

  if (user.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "User not found",
    };
  }

  // 3. Check User is Exhibitor
  if (user[0].role_id !== 3) {
    return {
      success: false,
      statusCode: 403,
      message: "Only Exhibitor can create exhibitor profile",
    };
  }

  // 4. Check Exhibitor Profile Already Exists
  const [existing] = await db.query(
    `SELECT exhibitor_id
     FROM exhibitors
     WHERE user_id = ?`,
    [user_id]
  );

  if (existing.length > 0) {
    return {
      success: false,
      statusCode: 409,
      message: "Exhibitor profile already exists",
    };
  }

  // 5. Create Exhibitor
  const [result] = await db.query(
    `INSERT INTO exhibitors
    (
      user_id,
      company_name,
      industry,
      website,
      gst_number,
      description,
      logo,
      head_office,
      contact_person
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user_id,
      company_name,
      industry || null,
      website || null,
      gst_number || null,
      description || null,
      logo || null,
      head_office || null,
      contact_person || null,
    ]
  );

  return {
    success: true,
    statusCode: 201,
    message: "Exhibitor profile created successfully",
    exhibitorId: result.insertId,
  };
};


// GET ALL EXHIBITORS
const getAllExhibitors = async () => {
  const [rows] = await db.query(
    `SELECT
       e.*,
       u.name AS user_name,
       u.email AS user_email,
       u.phone AS user_phone
     FROM exhibitors e
     JOIN users u
       ON e.user_id = u.user_id
     ORDER BY e.exhibitor_id DESC`
  );

  return {
    success: true,
    statusCode: 200,
    data: rows,
  };
};


// GET EXHIBITOR BY ID
const getExhibitorById = async (id, user) => {
  const [rows] = await db.query(
    `SELECT
       e.*,
       u.name AS user_name,
       u.email AS user_email,
       u.phone AS user_phone
     FROM exhibitors e
     JOIN users u
       ON e.user_id = u.user_id
     WHERE e.exhibitor_id = ?`,
    [id]
  );

  if (rows.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Exhibitor not found",
    };
  }

  // Admin / Organizer can view any exhibitor
  if (user.roleId === 1 || user.roleId === 2) {
    return {
      success: true,
      statusCode: 200,
      data: rows[0],
    };
  }

  // Exhibitor can view only their own profile
  if (user.roleId === 3) {
    if (rows[0].user_id !== user.userId) {
      return {
        success: false,
        statusCode: 403,
        message: "You can only view your own exhibitor profile",
      };
    }
  }

  return {
    success: true,
    statusCode: 200,
    data: rows[0],
  };
};


// UPDATE EXHIBITOR
const updateExhibitor = async (id, data, user) => {
  const {
    company_name,
    industry,
    website,
    gst_number,
    description,
    logo,
    head_office,
    contact_person,
  } = data;

  // 1. Check Exhibitor Exists
  const [exhibitor] = await db.query(
    `SELECT exhibitor_id, user_id
     FROM exhibitors
     WHERE exhibitor_id = ?`,
    [id]
  );

  if (exhibitor.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Exhibitor not found",
    };
  }

  // 2. Exhibitor can update only their own profile
  if (
    user.roleId === 3 &&
    exhibitor[0].user_id !== user.userId
  ) {
    return {
      success: false,
      statusCode: 403,
      message: "You can only update your own exhibitor profile",
    };
  }

  // 3. Update Exhibitor
  await db.query(
    `UPDATE exhibitors
     SET
       company_name = ?,
       industry = ?,
       website = ?,
       gst_number = ?,
       description = ?,
       logo = ?,
       head_office = ?,
       contact_person = ?
     WHERE exhibitor_id = ?`,
    [
      company_name,
      industry || null,
      website || null,
      gst_number || null,
      description || null,
      logo || null,
      head_office || null,
      contact_person || null,
      id,
    ]
  );

  return {
    success: true,
    statusCode: 200,
    message: "Exhibitor profile updated successfully",
  };
};


// DELETE EXHIBITOR
const deleteExhibitor = async (id, user) => {

  // 1. Check Exhibitor Exists
  const [exhibitor] = await db.query(
    `SELECT exhibitor_id, user_id
     FROM exhibitors
     WHERE exhibitor_id = ?`,
    [id]
  );

  if (exhibitor.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Exhibitor not found",
    };
  }

  // 2. Exhibitor can delete only their own profile
  if (
    user.roleId === 3 &&
    exhibitor[0].user_id !== user.userId
  ) {
    return {
      success: false,
      statusCode: 403,
      message: "You can only delete your own exhibitor profile",
    };
  }

  // 3. Delete Exhibitor
  await db.query(
    `DELETE FROM exhibitors
     WHERE exhibitor_id = ?`,
    [id]
  );

  return {
    success: true,
    statusCode: 200,
    message: "Exhibitor profile deleted successfully",
  };
};


module.exports = {
  createExhibitor,
  getAllExhibitors,
  getExhibitorById,
  updateExhibitor,
  deleteExhibitor,
};