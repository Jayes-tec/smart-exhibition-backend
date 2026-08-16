const db = require("../config/db");

// CREATE STAFF
const createStaff = async (data) => {
  const {
    exhibition_exhibitor_id,
    name,
    email,
    phone,
    designation,
    userId,
  } = data;

  // 1. Validation
  if (!exhibition_exhibitor_id || !name) {
    return {
      success: false,
      statusCode: 400,
      message: "Exhibition exhibitor ID and name are required",
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
        "You can only create staff for your own exhibitor account",
    };
  }

  // Staff can only be created for an approved exhibition registration
  if (exhibitionExhibitor[0].status !== "Approved") {
    return {
      success: false,
      statusCode: 400,
      message: "Staff can only be created for an approved exhibition registration",
    };
  }

  // 3. Create Staff
  const [result] = await db.query(
    `INSERT INTO booth_staff
    (
      exhibition_exhibitor_id,
      name,
      email,
      phone,
      designation
    )
    VALUES (?, ?, ?, ?, ?)`,
    [
      exhibition_exhibitor_id,
      name,
      email || null,
      phone || null,
      designation || null,
    ]
  );

  return {
    success: true,
    statusCode: 201,
    message: "Booth staff created successfully",
    staffId: result.insertId,
  };
};


// GET ALL STAFF
const getAllStaff = async () => {
  const [rows] = await db.query(
    `SELECT
       bs.*,
       ee.exhibition_id,
       ee.exhibitor_id,
       e.company_name,
       ex.title AS exhibition_name
     FROM booth_staff bs
     JOIN exhibition_exhibitors ee
       ON bs.exhibition_exhibitor_id = ee.exhibition_exhibitor_id
     JOIN exhibitors e
       ON ee.exhibitor_id = e.exhibitor_id
     JOIN exhibitions ex
       ON ee.exhibition_id = ex.exhibition_id
     ORDER BY bs.staff_id DESC`
  );

  return {
    success: true,
    statusCode: 200,
    data: rows,
  };
};


// GET STAFF BY ID
const getStaffById = async (id, user) => {
  const [rows] = await db.query(
    `SELECT
       bs.*,
       ee.exhibition_id,
       ee.exhibitor_id,
       ee.status AS exhibition_exhibitor_status,
       e.company_name,
       e.user_id AS exhibitor_user_id,
       ex.title AS exhibition_name
     FROM booth_staff bs
     JOIN exhibition_exhibitors ee
       ON bs.exhibition_exhibitor_id = ee.exhibition_exhibitor_id
     JOIN exhibitors e
       ON ee.exhibitor_id = e.exhibitor_id
     JOIN exhibitions ex
       ON ee.exhibition_id = ex.exhibition_id
     WHERE bs.staff_id = ?`,
    [id]
  );

  if (rows.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Staff not found",
    };
  }

  // Admin / Organizer can view any staff
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

  // Exhibitor can view only their own staff
  if (
    user &&
    user.roleId === 3 &&
    rows[0].exhibitor_user_id !== user.userId
  ) {
    return {
      success: false,
      statusCode: 403,
      message: "You can only view your own booth staff",
    };
  }

  return {
    success: true,
    statusCode: 200,
    data: rows[0],
  };
};


// UPDATE STAFF
const updateStaff = async (id, data) => {
  const {
    name,
    email,
    phone,
    designation,
    status,
    userId,
  } = data;

  // 1. Check Staff belongs to logged-in Exhibitor
  const [staff] = await db.query(
    `SELECT
       bs.staff_id,
       ee.status AS exhibition_exhibitor_status
     FROM booth_staff bs
     JOIN exhibition_exhibitors ee
       ON bs.exhibition_exhibitor_id = ee.exhibition_exhibitor_id
     JOIN exhibitors e
       ON ee.exhibitor_id = e.exhibitor_id
     WHERE bs.staff_id = ?
     AND e.user_id = ?`,
    [id, userId]
  );

  if (staff.length === 0) {
    return {
      success: false,
      statusCode: 403,
      message: "You can only update your own booth staff",
    };
  }

  // Staff can only be updated for an approved exhibition registration
  if (staff[0].exhibition_exhibitor_status !== "Approved") {
    return {
      success: false,
      statusCode: 400,
      message: "Staff can only be updated for an approved exhibition registration",
    };
  }

  // 2. Validate Staff Status
  const allowedStatuses = ["Active", "Inactive"];

  if (status && !allowedStatuses.includes(status)) {
    return {
      success: false,
      statusCode: 400,
      message: "Invalid staff status",
    };
  }

  // 3. Update Staff
  await db.query(
    `UPDATE booth_staff
     SET
       name = ?,
       email = ?,
       phone = ?,
       designation = ?,
       status = ?
     WHERE staff_id = ?`,
    [
      name,
      email || null,
      phone || null,
      designation || null,
      status || "Active",
      id,
    ]
  );

  return {
    success: true,
    statusCode: 200,
    message: "Booth staff updated successfully",
  };
};


// DELETE STAFF
const deleteStaff = async (id, user) => {

  // 1. Check Staff Exists
  const [staff] = await db.query(
    `SELECT
       bs.staff_id,
       ee.exhibitor_id,
       ee.status AS exhibition_exhibitor_status
     FROM booth_staff bs
     JOIN exhibition_exhibitors ee
       ON bs.exhibition_exhibitor_id = ee.exhibition_exhibitor_id
     WHERE bs.staff_id = ?`,
    [id]
  );

  if (staff.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Staff not found",
    };
  }

  // 2. Exhibitor can delete only their own staff
  if (user.roleId === 3) {

    const [exhibitor] = await db.query(
      `SELECT exhibitor_id
       FROM exhibitors
       WHERE user_id = ?`,
      [user.userId]
    );

    if (
      exhibitor.length === 0 ||
      exhibitor[0].exhibitor_id !== staff[0].exhibitor_id
    ) {
      return {
        success: false,
        statusCode: 403,
        message: "You can only delete your own booth staff",
      };
    }
  }

  // 3. Delete Staff
  await db.query(
    `DELETE FROM booth_staff
     WHERE staff_id = ?`,
    [id]
  );

  return {
    success: true,
    statusCode: 200,
    message: "Booth staff deleted successfully",
  };
};


module.exports = {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
};