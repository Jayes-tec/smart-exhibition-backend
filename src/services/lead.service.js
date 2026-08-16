const db = require("../config/db");


// CREATE LEAD
const createLead = async (data) => {
  const {
    exhibition_exhibitor_id,
    product_id,
    interest_level,
    remarks,
    userId,
  } = data;

  // 1. Validation
  if (!exhibition_exhibitor_id) {
    return {
      success: false,
      statusCode: 400,
      message: "Exhibition Exhibitor ID is required",
    };
  }

  // Validate Interest Level if provided
  const allowedInterestLevels = [
    "Low",
    "Medium",
    "High",
  ];

  if (
    interest_level &&
    !allowedInterestLevels.includes(interest_level)
  ) {
    return {
      success: false,
      statusCode: 400,
      message: "Invalid interest level",
    };
  }

  // 2. Find Visitor belonging to logged-in user
  const [visitor] = await db.query(
    `SELECT visitor_id
     FROM visitors
     WHERE user_id = ?`,
    [userId]
  );

  if (visitor.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Visitor profile not found",
    };
  }

  const visitorId = visitor[0].visitor_id;

  // 3. Check Exhibition-Exhibitor Exists
  const [exhibitionExhibitor] = await db.query(
    `SELECT
       exhibition_exhibitor_id,
       exhibition_id,
       exhibitor_id,
       status
     FROM exhibition_exhibitors
     WHERE exhibition_exhibitor_id = ?`,
    [exhibition_exhibitor_id]
  );

  if (exhibitionExhibitor.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Exhibition exhibitor record not found",
    };
  }

  // Lead can only be created for approved exhibition registration
  if (exhibitionExhibitor[0].status !== "Approved") {
    return {
      success: false,
      statusCode: 400,
      message:
        "Lead can only be created for an approved exhibition exhibitor",
    };
  }

  // 4. If Product ID is provided,
  // check that product belongs to same exhibition-exhibitor
  if (product_id) {
    const [product] = await db.query(
      `SELECT product_id
       FROM products
       WHERE product_id = ?
       AND exhibition_exhibitor_id = ?`,
      [product_id, exhibition_exhibitor_id]
    );

    if (product.length === 0) {
      return {
        success: false,
        statusCode: 400,
        message:
          "Product does not belong to the selected exhibition exhibitor",
      };
    }
  }

  // 5. Check whether visitor actually visited this exhibitor's booth
  const [visitorLog] = await db.query(
    `SELECT
       vl.log_id
     FROM visitor_logs vl
     JOIN exhibition_exhibitors ee
       ON vl.booth_id = ee.booth_id
     WHERE vl.visitor_id = ?
     AND ee.exhibition_exhibitor_id = ?
     AND ee.status = 'Approved'
     LIMIT 1`,
    [visitorId, exhibition_exhibitor_id]
  );

  if (visitorLog.length === 0) {
    return {
      success: false,
      statusCode: 400,
      message:
        "Visitor must have a visit record for this exhibitor before creating a lead",
    };
  }

  // 6. Prevent duplicate lead for same visitor + exhibitor + product
  const [existingLead] = await db.query(
    `SELECT lead_id
     FROM leads
     WHERE visitor_id = ?
     AND exhibition_exhibitor_id = ?
     AND (
       (product_id = ?)
       OR (product_id IS NULL AND ? IS NULL)
     )`,
    [
      visitorId,
      exhibition_exhibitor_id,
      product_id || null,
      product_id || null,
    ]
  );

  if (existingLead.length > 0) {
    return {
      success: false,
      statusCode: 409,
      message: "Lead already exists for this visitor",
    };
  }

  // 7. Create Lead
  const [result] = await db.query(
    `INSERT INTO leads
    (
      visitor_id,
      exhibition_exhibitor_id,
      product_id,
      interest_level,
      remarks
    )
    VALUES (?, ?, ?, ?, ?)`,
    [
      visitorId,
      exhibition_exhibitor_id,
      product_id || null,
      interest_level || null,
      remarks || null,
    ]
  );

  return {
    success: true,
    statusCode: 201,
    message: "Lead created successfully",
    leadId: result.insertId,
  };
};


// GET ALL LEADS
const getAllLeads = async () => {
  const [rows] = await db.query(
    `SELECT
       l.*,
       v.user_id AS visitor_user_id,
       u.name AS visitor_name,
       u.email AS visitor_email,
       e.company_name,
       p.product_name,
       ex.title AS exhibition_name
     FROM leads l
     JOIN visitors v
       ON l.visitor_id = v.visitor_id
     JOIN users u
       ON v.user_id = u.user_id
     JOIN exhibition_exhibitors ee
       ON l.exhibition_exhibitor_id = ee.exhibition_exhibitor_id
     JOIN exhibitors e
       ON ee.exhibitor_id = e.exhibitor_id
     JOIN exhibitions ex
       ON ee.exhibition_id = ex.exhibition_id
     LEFT JOIN products p
       ON l.product_id = p.product_id
     ORDER BY l.created_at DESC`
  );

  return {
    success: true,
    statusCode: 200,
    data: rows,
  };
};


// GET LEAD BY ID
const getLeadById = async (id, user) => {
  const [rows] = await db.query(
    `SELECT
       l.*,
       v.user_id AS visitor_user_id,
       u.name AS visitor_name,
       u.email AS visitor_email,
       e.company_name,
       e.user_id AS exhibitor_user_id,
       p.product_name,
       ex.title AS exhibition_name,
       ee.exhibitor_id
     FROM leads l
     JOIN visitors v
       ON l.visitor_id = v.visitor_id
     JOIN users u
       ON v.user_id = u.user_id
     JOIN exhibition_exhibitors ee
       ON l.exhibition_exhibitor_id = ee.exhibition_exhibitor_id
     JOIN exhibitors e
       ON ee.exhibitor_id = e.exhibitor_id
     JOIN exhibitions ex
       ON ee.exhibition_id = ex.exhibition_id
     LEFT JOIN products p
       ON l.product_id = p.product_id
     WHERE l.lead_id = ?`,
    [id]
  );

  if (rows.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Lead not found",
    };
  }

  // Admin / Organizer can view any lead
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

  // Exhibitor can view only their own leads
  if (user.roleId === 3) {
    if (rows[0].exhibitor_user_id !== user.userId) {
      return {
        success: false,
        statusCode: 403,
        message: "You can only view your own leads",
      };
    }

    return {
      success: true,
      statusCode: 200,
      data: rows[0],
    };
  }

  // Visitor can view only their own leads
  if (user.roleId === 4) {
    if (rows[0].visitor_user_id !== user.userId) {
      return {
        success: false,
        statusCode: 403,
        message: "You can only view your own leads",
      };
    }

    return {
      success: true,
      statusCode: 200,
      data: rows[0],
    };
  }

  return {
    success: false,
    statusCode: 403,
    message: "You are not authorized to view this lead",
  };
};


// UPDATE LEAD STATUS
const updateLeadStatus = async (id, status, user) => {
  const allowedStatuses = [
    "New",
    "Contacted",
    "Qualified",
    "Closed",
  ];

  // 1. Validate Status
  if (!allowedStatuses.includes(status)) {
    return {
      success: false,
      statusCode: 400,
      message: "Invalid lead status",
    };
  }

  // 2. Find Lead + Exhibitor
  const [lead] = await db.query(
    `SELECT
       l.lead_id,
       ee.exhibitor_id
     FROM leads l
     JOIN exhibition_exhibitors ee
       ON l.exhibition_exhibitor_id = ee.exhibition_exhibitor_id
     WHERE l.lead_id = ?`,
    [id]
  );

  if (lead.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Lead not found",
    };
  }

  // 3. Check logged-in Exhibitor
  const [exhibitor] = await db.query(
    `SELECT exhibitor_id
     FROM exhibitors
     WHERE user_id = ?`,
    [user.userId]
  );

  if (
    exhibitor.length === 0 ||
    exhibitor[0].exhibitor_id !== lead[0].exhibitor_id
  ) {
    return {
      success: false,
      statusCode: 403,
      message: "You can only update your own leads",
    };
  }

  // 4. Update Status
  await db.query(
    `UPDATE leads
     SET status = ?
     WHERE lead_id = ?`,
    [status, id]
  );

  return {
    success: true,
    statusCode: 200,
    message: "Lead status updated successfully",
  };
};


// UPDATE LEAD DETAILS
const updateLead = async (id, data, user) => {
  const {
    interest_level,
    remarks,
  } = data;

  const allowedInterestLevels = [
    "Low",
    "Medium",
    "High",
  ];

  // 1. Validate Interest Level
  if (
    interest_level &&
    !allowedInterestLevels.includes(interest_level)
  ) {
    return {
      success: false,
      statusCode: 400,
      message: "Invalid interest level",
    };
  }

  // 2. Find Lead + Exhibitor
  const [lead] = await db.query(
    `SELECT
       l.lead_id,
       ee.exhibitor_id
     FROM leads l
     JOIN exhibition_exhibitors ee
       ON l.exhibition_exhibitor_id = ee.exhibition_exhibitor_id
     WHERE l.lead_id = ?`,
    [id]
  );

  if (lead.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Lead not found",
    };
  }

  // 3. Check ownership
  const [exhibitor] = await db.query(
    `SELECT exhibitor_id
     FROM exhibitors
     WHERE user_id = ?`,
    [user.userId]
  );

  if (
    exhibitor.length === 0 ||
    exhibitor[0].exhibitor_id !== lead[0].exhibitor_id
  ) {
    return {
      success: false,
      statusCode: 403,
      message: "You can only update your own leads",
    };
  }

  // 4. Update Lead
  await db.query(
    `UPDATE leads
     SET
       interest_level = ?,
       remarks = ?
     WHERE lead_id = ?`,
    [
      interest_level ?? null,
      remarks ?? null,
      id,
    ]
  );

  return {
    success: true,
    statusCode: 200,
    message: "Lead updated successfully",
  };
};


module.exports = {
  createLead,
  getAllLeads,
  getLeadById,
  updateLeadStatus,
  updateLead,
};