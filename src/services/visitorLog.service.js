const db = require("../config/db");


// =====================================================
// CREATE VISITOR LOG
// =====================================================
const createVisitorLog = async (data) => {
  const {
    visitor_id,
    booth_id,
    entry_time,
    exit_time,
    visit_date,
    userId,
    roleId,
  } = data;

  // 1. Required fields
  if (!visitor_id || !booth_id || !entry_time || !visit_date) {
    return {
      success: false,
      statusCode: 400,
      message: "Visitor, booth, entry time and visit date are required",
    };
  }

  // 2. Check Visitor Exists
  const [visitor] = await db.query(
    `SELECT
       visitor_id,
       user_id
     FROM visitors
     WHERE visitor_id = ?`,
    [visitor_id]
  );

  if (visitor.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Visitor not found",
    };
  }

  // 3. Check Booth Exists
  // Also get exhibition ID through hall
  const [booth] = await db.query(
    `SELECT
       b.booth_id,
       b.status,
       h.exhibition_id
     FROM booths b
     JOIN halls h
       ON b.hall_id = h.hall_id
     WHERE b.booth_id = ?`,
    [booth_id]
  );

  if (booth.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Booth not found",
    };
  }

  // Visitor logs can only be created for an allocated booth
  if (booth[0].status !== "Allocated") {
    return {
      success: false,
      statusCode: 400,
      message: "Visitor log can only be created for an allocated booth",
    };
  }

  // 4. Exhibitor can create visitor logs only
  // for their own approved booth
  if (roleId === 3) {
    const [exhibitorBooth] = await db.query(
      `SELECT
         ee.exhibition_exhibitor_id
       FROM exhibition_exhibitors ee
       JOIN exhibitors e
         ON ee.exhibitor_id = e.exhibitor_id
       WHERE ee.booth_id = ?
       AND e.user_id = ?
       AND ee.status = 'Approved'`,
      [booth_id, userId]
    );

    if (exhibitorBooth.length === 0) {
      return {
        success: false,
        statusCode: 403,
        message: "You can only create visitor logs for your own booth",
      };
    }
  }

  // 5. Visitor cannot create arbitrary visitor logs
  if (roleId === 4) {
    return {
      success: false,
      statusCode: 403,
      message: "Visitors cannot create visitor logs",
    };
  }

  // 6. Only Admin, Organizer and Exhibitor are allowed
  if (
    roleId !== 1 &&
    roleId !== 2 &&
    roleId !== 3
  ) {
    return {
      success: false,
      statusCode: 403,
      message: "You are not authorized to create visitor logs",
    };
  }

  // 7. Validate Entry Time
  const entry = new Date(entry_time);

  if (Number.isNaN(entry.getTime())) {
    return {
      success: false,
      statusCode: 400,
      message: "Invalid entry time",
    };
  }

  // 8. Validate Visit Date
  const visitDate = new Date(visit_date);

  if (Number.isNaN(visitDate.getTime())) {
    return {
      success: false,
      statusCode: 400,
      message: "Invalid visit date",
    };
  }

  // 9. Calculate Duration
  let duration = null;

  if (exit_time) {
    const exit = new Date(exit_time);

    if (Number.isNaN(exit.getTime())) {
      return {
        success: false,
        statusCode: 400,
        message: "Invalid exit time",
      };
    }

    if (exit < entry) {
      return {
        success: false,
        statusCode: 400,
        message: "Exit time cannot be before entry time",
      };
    }

    duration = Math.floor(
      (exit - entry) / (1000 * 60)
    );
  }

  // 10. Create Visitor Log
  const [result] = await db.query(
    `INSERT INTO visitor_logs
    (
      visitor_id,
      booth_id,
      entry_time,
      exit_time,
      duration,
      visit_date
    )
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      visitor_id,
      booth_id,
      entry_time,
      exit_time || null,
      duration,
      visit_date,
    ]
  );

  return {
    success: true,
    statusCode: 201,
    message: "Visitor log created successfully",
    logId: result.insertId,
  };
};


// =====================================================
// GET ALL VISITOR LOGS
// =====================================================
const getAllVisitorLogs = async () => {
  const [rows] = await db.query(
    `SELECT
      vl.*,
      v.company,
      v.designation,
      u.name AS visitor_name,
      u.email AS visitor_email,
      b.booth_number,
      h.hall_name,
      e.company_name
     FROM visitor_logs vl
     JOIN visitors v
       ON vl.visitor_id = v.visitor_id
     JOIN users u
       ON v.user_id = u.user_id
     JOIN booths b
       ON vl.booth_id = b.booth_id
     JOIN halls h
       ON b.hall_id = h.hall_id
     LEFT JOIN exhibition_exhibitors ee
       ON b.booth_id = ee.booth_id
       AND ee.status = 'Approved'
     LEFT JOIN exhibitors e
       ON ee.exhibitor_id = e.exhibitor_id
     ORDER BY vl.log_id DESC`
  );

  return {
    success: true,
    statusCode: 200,
    data: rows,
  };
};


// =====================================================
// GET VISITOR LOG BY ID
// =====================================================
const getVisitorLogById = async (id, user) => {
  const [rows] = await db.query(
    `SELECT
      vl.*,
      v.company,
      v.designation,
      v.user_id AS visitor_user_id,
      u.name AS visitor_name,
      u.email AS visitor_email,
      b.booth_number,
      h.hall_name,
      e.company_name,
      e.user_id AS exhibitor_user_id
     FROM visitor_logs vl
     JOIN visitors v
       ON vl.visitor_id = v.visitor_id
     JOIN users u
       ON v.user_id = u.user_id
     JOIN booths b
       ON vl.booth_id = b.booth_id
     JOIN halls h
       ON b.hall_id = h.hall_id
     LEFT JOIN exhibition_exhibitors ee
       ON b.booth_id = ee.booth_id
       AND ee.status = 'Approved'
     LEFT JOIN exhibitors e
       ON ee.exhibitor_id = e.exhibitor_id
     WHERE vl.log_id = ?`,
    [id]
  );

  // 1. Check Visitor Log Exists
  if (rows.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Visitor log not found",
    };
  }

  // 2. Admin / Organizer can view any visitor log
  if (
    user.roleId === 1 ||
    user.roleId === 2
  ) {
    return {
      success: true,
      statusCode: 200,
      data: rows[0],
    };
  }

  // 3. Visitor can view only their own visitor logs
  if (
    user.roleId === 4 &&
    rows[0].visitor_user_id !== user.userId
  ) {
    return {
      success: false,
      statusCode: 403,
      message: "You can only view your own visitor logs",
    };
  }

  // 4. Exhibitor can view logs of their own booth
  if (
    user.roleId === 3 &&
    rows[0].exhibitor_user_id !== user.userId
  ) {
    return {
      success: false,
      statusCode: 403,
      message: "You can only view visitor logs for your own booth",
    };
  }

  return {
    success: true,
    statusCode: 200,
    data: rows[0],
  };
};


// =====================================================
// GET MY VISITOR LOGS
// =====================================================
const getMyVisitorLogs = async (userId) => {
  const [rows] = await db.query(
    `SELECT
      vl.*,
      b.booth_number,
      h.hall_name,
      e.company_name
     FROM visitor_logs vl
     JOIN visitors v
       ON vl.visitor_id = v.visitor_id
     JOIN booths b
       ON vl.booth_id = b.booth_id
     JOIN halls h
       ON b.hall_id = h.hall_id
     LEFT JOIN exhibition_exhibitors ee
       ON b.booth_id = ee.booth_id
       AND ee.status = 'Approved'
     LEFT JOIN exhibitors e
       ON ee.exhibitor_id = e.exhibitor_id
     WHERE v.user_id = ?
     ORDER BY vl.log_id DESC`,
    [userId]
  );

  return {
    success: true,
    statusCode: 200,
    data: rows,
  };
};


module.exports = {
  createVisitorLog,
  getAllVisitorLogs,
  getVisitorLogById,
  getMyVisitorLogs,
};