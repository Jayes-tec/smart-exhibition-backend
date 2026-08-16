const db = require("../config/db");

// CREATE VISITOR PROFILE
const createVisitor = async (user_id, data) => {
  const {
    company,
    designation,
    gender,
    dob,
    city,
    state,
    country,
  } = data;

  // 1. Check User Exists
  const [user] = await db.query(
    `SELECT user_id FROM users WHERE user_id = ?`,
    [user_id]
  );

  if (user.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "User not found",
    };
  }

  // 2. Check Visitor Profile Already Exists
  const [existingVisitor] = await db.query(
    `SELECT visitor_id FROM visitors WHERE user_id = ?`,
    [user_id]
  );

  if (existingVisitor.length > 0) {
    return {
      success: false,
      statusCode: 409,
      message: "Visitor profile already exists",
    };
  }

  // 3. Create Visitor Profile
  const [result] = await db.query(
    `INSERT INTO visitors
    (
      user_id,
      company,
      designation,
      gender,
      dob,
      city,
      state,
      country
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user_id,
      company,
      designation,
      gender,
      dob,
      city,
      state,
      country,
    ]
  );

  return {
    success: true,
    statusCode: 201,
    message: "Visitor profile created successfully",
    visitorId: result.insertId,
  };
};


// GET ALL VISITORS
const getAllVisitors = async () => {
  const [rows] = await db.query(
    `SELECT
      v.*,
      u.name,
      u.email,
      u.phone
     FROM visitors v
     JOIN users u
     ON v.user_id = u.user_id
     ORDER BY v.visitor_id DESC`
  );

  return {
    success: true,
    statusCode: 200,
    data: rows,
  };
};


// GET OWN VISITOR PROFILE
const getVisitorProfile = async (user_id) => {
  const [rows] = await db.query(
    `SELECT
      v.*,
      u.name,
      u.email,
      u.phone
     FROM visitors v
     JOIN users u
     ON v.user_id = u.user_id
     WHERE v.user_id = ?`,
    [user_id]
  );

  // Check Visitor Profile Exists
  if (rows.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Visitor profile not found",
    };
  }

  return {
    success: true,
    statusCode: 200,
    data: rows[0],
  };
};


// UPDATE OWN VISITOR PROFILE
const updateVisitor = async (user_id, data) => {
  const {
    company,
    designation,
    gender,
    dob,
    city,
    state,
    country,
  } = data;

  // 1. Check Visitor Profile Exists
  const [visitor] = await db.query(
    `SELECT visitor_id FROM visitors WHERE user_id = ?`,
    [user_id]
  );

  if (visitor.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Visitor profile not found",
    };
  }

  // 2. Update Visitor Profile
  await db.query(
    `UPDATE visitors
     SET
       company = ?,
       designation = ?,
       gender = ?,
       dob = ?,
       city = ?,
       state = ?,
       country = ?
     WHERE user_id = ?`,
    [
      company,
      designation,
      gender,
      dob,
      city,
      state,
      country,
      user_id,
    ]
  );

  return {
    success: true,
    statusCode: 200,
    message: "Visitor profile updated successfully",
  };
};





module.exports = {
  createVisitor,
  getAllVisitors,
  getVisitorProfile,
  updateVisitor,
};
