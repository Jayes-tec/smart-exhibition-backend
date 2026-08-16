const db = require("../config/db");

// CREATE EXHIBITION EXHIBITOR
const createExhibitionExhibitor = async (data) => {
  const {
    exhibition_id,
    exhibitor_id,
    booth_id,
    registration_date,
  } = data;

  // 1. Validation
  if (!exhibition_id || !exhibitor_id || !booth_id) {
    return {
      success: false,
      statusCode: 400,
      message: "Exhibition ID, Exhibitor ID and Booth ID are required",
    };
  }

  // 2. Check Exhibition Exists
  const [exhibition] = await db.query(
    `SELECT exhibition_id
     FROM exhibitions
     WHERE exhibition_id = ?`,
    [exhibition_id]
  );

  if (exhibition.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Exhibition not found",
    };
  }

  // 3. Check Exhibitor Exists
  const [exhibitor] = await db.query(
    `SELECT exhibitor_id
     FROM exhibitors
     WHERE exhibitor_id = ?`,
    [exhibitor_id]
  );

  if (exhibitor.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Exhibitor not found",
    };
  }

  // 4. Check Booth Exists
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

  // Check Booth belongs to selected Exhibition
  if (booth[0].exhibition_id !== exhibition_id) {
    return {
      success: false,
      statusCode: 400,
      message: "Booth does not belong to this exhibition",
    };
  }

  // 5. Check Booth Availability
  if (booth[0].status !== "Available") {
    return {
      success: false,
      statusCode: 400,
      message: "Booth is not available",
    };
  }

  // 6. Check Duplicate Exhibition Exhibitor
  const [check] = await db.query(
    `SELECT exhibition_exhibitor_id, status
     FROM exhibition_exhibitors
     WHERE exhibition_id = ?
     AND exhibitor_id = ?`,
    [exhibition_id, exhibitor_id]
  );

  // Only Approved / Pending registration is considered active
  if (
    check.length > 0 &&
    (check[0].status === "Approved" ||
      check[0].status === "Pending")
  ) {
    return {
      success: false,
      statusCode: 409,
      message: "Exhibitor is already registered for this exhibition",
    };
  }

  // 7. Check Booth Already Assigned
  const [boothCheck] = await db.query(
    `SELECT exhibition_exhibitor_id
     FROM exhibition_exhibitors
     WHERE booth_id = ?
     AND status IN ('Pending', 'Approved')`,
    [booth_id]
  );

  if (boothCheck.length > 0) {
    return {
      success: false,
      statusCode: 409,
      message: "Booth is already assigned",
    };
  }

  // 8. Create Exhibition Exhibitor Mapping
  const [result] = await db.query(
    `INSERT INTO exhibition_exhibitors
    (
      exhibition_id,
      exhibitor_id,
      booth_id,
      registration_date,
      status
    )
    VALUES (?, ?, ?, ?, 'Pending')`,
    [
      exhibition_id,
      exhibitor_id,
      booth_id,
      registration_date || new Date(),
    ]
  );

  return {
    success: true,
    statusCode: 201,
    message: "Exhibitor registered for exhibition successfully",
    exhibitionExhibitorId: result.insertId,
  };
};


// GET ALL EXHIBITION EXHIBITORS
const getAllExhibitionExhibitors = async () => {
  const [rows] = await db.query(
    `SELECT
       ee.*,
       ex.title AS exhibition_name,
       e.company_name,
       b.booth_number,
       h.hall_name
     FROM exhibition_exhibitors ee
     JOIN exhibitions ex
       ON ee.exhibition_id = ex.exhibition_id
     JOIN exhibitors e
       ON ee.exhibitor_id = e.exhibitor_id
     JOIN booths b
       ON ee.booth_id = b.booth_id
     JOIN halls h
       ON b.hall_id = h.hall_id
     ORDER BY ee.exhibition_exhibitor_id DESC`
  );

  return {
    success: true,
    statusCode: 200,
    data: rows,
  };
};


// GET EXHIBITION EXHIBITOR BY ID
const getExhibitionExhibitorById = async (id, user) => {
  const [rows] = await db.query(
    `SELECT
       ee.*,
       ex.title AS exhibition_name,
       e.company_name,
       e.user_id AS exhibitor_user_id,
       b.booth_number,
       h.hall_name
     FROM exhibition_exhibitors ee
     JOIN exhibitions ex
       ON ee.exhibition_id = ex.exhibition_id
     JOIN exhibitors e
       ON ee.exhibitor_id = e.exhibitor_id
     JOIN booths b
       ON ee.booth_id = b.booth_id
     JOIN halls h
       ON b.hall_id = h.hall_id
     WHERE ee.exhibition_exhibitor_id = ?`,
    [id]
  );

  if (rows.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Exhibition exhibitor record not found",
    };
  }

  // Admin / Organizer can view any record
  if (user.roleId === 1 || user.roleId === 2) {
    return {
      success: true,
      statusCode: 200,
      data: rows[0],
    };
  }

  // Exhibitor can view only their own record
  if (rows[0].exhibitor_user_id !== user.userId) {
    return {
      success: false,
      statusCode: 403,
      message: "You can only view your own exhibition registration",
    };
  }

  return {
    success: true,
    statusCode: 200,
    data: rows[0],
  };
};


// UPDATE STATUS
const updateStatus = async (id, status) => {
  const allowedStatuses = [
    "Pending",
    "Approved",
    "Rejected",
  ];

  // 1. Validate Status
  if (!allowedStatuses.includes(status)) {
    return {
      success: false,
      statusCode: 400,
      message: "Invalid exhibition exhibitor status",
    };
  }

  const connection = await db.getConnection();

  try {

    // 2. Check Record Exists
    const [record] = await connection.query(
      `SELECT *
       FROM exhibition_exhibitors
       WHERE exhibition_exhibitor_id = ?`,
      [id]
    );

    if (record.length === 0) {
      return {
        success: false,
        statusCode: 404,
        message: "Exhibition exhibitor record not found",
      };
    }

    // Only Pending registration can be approved or rejected
    if (record[0].status !== "Pending") {
      return {
        success: false,
        statusCode: 400,
        message: `Cannot update a ${record[0].status.toLowerCase()} exhibition exhibitor`,
      };
    }

    // START TRANSACTION
    await connection.beginTransaction();

    // Approved or Pending registration cannot be approved
    // if booth is no longer available
    if (status === "Approved") {

      const [booth] = await connection.query(
        `SELECT
           b.booth_id,
           b.status,
           h.exhibition_id
         FROM booths b
         JOIN halls h
           ON b.hall_id = h.hall_id
         WHERE b.booth_id = ?`,
        [record[0].booth_id]
      );

      if (booth.length === 0) {
        await connection.rollback();

        return {
          success: false,
          statusCode: 404,
          message: "Booth not found",
        };
      }

      if (booth[0].exhibition_id !== record[0].exhibition_id) {
        await connection.rollback();

        return {
          success: false,
          statusCode: 400,
          message: "Booth does not belong to this exhibition",
        };
      }

      if (booth[0].status !== "Available") {
        await connection.rollback();

        return {
          success: false,
          statusCode: 400,
          message: "Booth is not available",
        };
      }

      // Check Booth Already Assigned
      const [boothCheck] = await connection.query(
        `SELECT exhibition_exhibitor_id
         FROM exhibition_exhibitors
         WHERE booth_id = ?
         AND status = 'Approved'
         AND exhibition_exhibitor_id != ?`,
        [
          record[0].booth_id,
          id,
        ]
      );

      if (boothCheck.length > 0) {
        await connection.rollback();

        return {
          success: false,
          statusCode: 409,
          message: "Booth is already assigned",
        };
      }

      // Update Exhibition Exhibitor Status
      await connection.query(
        `UPDATE exhibition_exhibitors
         SET status = 'Approved'
         WHERE exhibition_exhibitor_id = ?`,
        [id]
      );

      // Allocate Booth
      await connection.query(
        `UPDATE booths
         SET status = 'Allocated'
         WHERE booth_id = ?`,
        [record[0].booth_id]
      );
    }

    if (status === "Rejected") {

      // Update Exhibition Exhibitor Status
      await connection.query(
        `UPDATE exhibition_exhibitors
         SET status = 'Rejected'
         WHERE exhibition_exhibitor_id = ?`,
        [id]
      );

      // Rejected registration releases the booth
      await connection.query(
        `UPDATE booths
         SET status = 'Available'
         WHERE booth_id = ?`,
        [record[0].booth_id]
      );
    }

    // Pending should not be used to change an existing record
    if (status === "Pending") {
      await connection.rollback();

      return {
        success: false,
        statusCode: 400,
        message: "Existing exhibition exhibitor cannot be changed to Pending",
      };
    }

    // COMMIT TRANSACTION
    await connection.commit();

    return {
      success: true,
      statusCode: 200,
      message: "Exhibition exhibitor status updated successfully",
    };

  } catch (error) {

    // If anything fails, undo all database changes
    await connection.rollback();

    throw error;

  } finally {

    // Release connection back to pool
    connection.release();

  }
};


// DELETE EXHIBITION EXHIBITOR
const deleteExhibitionExhibitor = async (id) => {
  // 1. Check Record Exists
  const [record] = await db.query(
    `SELECT
       exhibition_exhibitor_id,
       booth_id,
       status
     FROM exhibition_exhibitors
     WHERE exhibition_exhibitor_id = ?`,
    [id]
  );

  if (record.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Exhibition exhibitor record not found",
    };
  }

  // Do not delete approved registration without releasing booth
  if (record[0].status === "Approved") {
    await db.query(
      `UPDATE booths
       SET status = "Available"
       WHERE booth_id = ?`,
      [record[0].booth_id]
    );
  }

  // 2. Delete Record
  await db.query(
    `DELETE FROM exhibition_exhibitors
     WHERE exhibition_exhibitor_id = ?`,
    [id]
  );

  return {
    success: true,
    statusCode: 200,
    message: "Exhibition exhibitor deleted successfully",
  };
};


module.exports = {
  createExhibitionExhibitor,
  getAllExhibitionExhibitors,
  getExhibitionExhibitorById,
  updateStatus,
  deleteExhibitionExhibitor,
};