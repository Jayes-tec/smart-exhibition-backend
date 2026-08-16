const db = require("../config/db");

const createExhibition = async (data, userId) => {
  const { title, description, venue, start_date, end_date, banner } = data;

  if (!title || !start_date || !end_date) {
    return { success: false, statusCode: 400, message: "Title, start date and end date are required" };
  }

  const start = new Date(start_date);
  const end = new Date(end_date);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { success: false, statusCode: 400, message: "Invalid exhibition dates" };
  }
  if (end < start) {
    return { success: false, statusCode: 400, message: "End date cannot be before start date" };
  }

  const [organizer] = await db.query(
    `SELECT organizer_id
     FROM organizers
     WHERE user_id = ?`,
    [userId]
  );

  if (organizer.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Organizer profile not found",
    };
  }

  const organizerId = organizer[0].organizer_id;

  const [result] = await db.query(
    `INSERT INTO exhibitions
    (
      organizer_id,
      title,
      description,
      venue,
      start_date,
      end_date,
      banner
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [organizerId, title, description, venue, start_date, end_date, banner || null]
  );

  return {
    success: true,
    statusCode: 201,
    message: "Exhibition created successfully",
    exhibitionId: result.insertId,
  };
};


// GET ALL EXHIBITIONS
const getAllExhibitions = async () => {
  const [rows] = await db.query(
    `SELECT
       e.exhibition_id,
       e.title,
       e.description,
       e.venue,
       e.start_date,
       e.end_date,
       e.status,
       e.banner,
       o.organization_name
     FROM exhibitions e
     JOIN organizers o
       ON e.organizer_id = o.organizer_id
     ORDER BY e.created_at DESC`
  );

  return {
    success: true,
    statusCode: 200,
    data: rows,
  };
};


// GET EXHIBITION BY ID
const getExhibitionById = async (id) => {
  const [rows] = await db.query(
    `SELECT
       e.*,
       o.organization_name
     FROM exhibitions e
     JOIN organizers o
       ON e.organizer_id = o.organizer_id
     WHERE e.exhibition_id = ?`,
    [id]
  );

  if (rows.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Exhibition not found",
    };
  }

  return {
    success: true,
    statusCode: 200,
    data: rows[0],
  };
};


// UPDATE EXHIBITION
const updateExhibition = async (id, data, userId) => {
  const {
    title,
    description,
    venue,
    start_date,
    end_date,
    status,
    banner,
  } = data;

  // Step 1: Find Organizer of Logged-in User
  const [organizer] = await db.query(
    `SELECT organizer_id
     FROM organizers
     WHERE user_id = ?`,
    [userId]
  );

  if (organizer.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Organizer profile not found",
    };
  }

  const organizerId = organizer[0].organizer_id;

  // Step 2: Check Exhibition Exists and Ownership
  const [existing] = await db.query(
    `SELECT exhibition_id
     FROM exhibitions
     WHERE exhibition_id = ?
     AND organizer_id = ?`,
    [id, organizerId]
  );

  if (existing.length === 0) {
    return {
      success: false,
      statusCode: 403,
      message: "You are not allowed to update this exhibition",
    };
  }

  // Step 3: Validate Dates when supplied
  if (start_date || end_date) {
    if (!start_date || !end_date) {
      return { success: false, statusCode: 400, message: "Both start date and end date are required when updating dates" };
    }
    const start = new Date(start_date);
    const end = new Date(end_date);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return { success: false, statusCode: 400, message: "Invalid exhibition dates" };
    }
    if (end < start) {
      return { success: false, statusCode: 400, message: "End date cannot be before start date" };
    }
  }

  // Step 4: Update Exhibition
  await db.query(
    `UPDATE exhibitions
     SET
       title = COALESCE(?, title),
       description = COALESCE(?, description),
       venue = COALESCE(?, venue),
       start_date = COALESCE(?, start_date),
       end_date = COALESCE(?, end_date),
       status = COALESCE(?, status),
       banner = COALESCE(?, banner)
     WHERE exhibition_id = ?`,
    [
      title,
      description,
      venue,
      start_date,
      end_date,
      status,
      banner || null,
      id,
    ]
  );

  return {
    success: true,
    statusCode: 200,
    message: "Exhibition updated successfully",
  };
};


// DELETE EXHIBITION
const deleteExhibition = async (id, userId) => {
  const [organizer] = await db.query(
    `SELECT organizer_id
     FROM organizers
     WHERE user_id = ?`,
    [userId]
  );

  if (organizer.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Organizer profile not found",
    };
  }

  const organizerId = organizer[0].organizer_id;

  const [existing] = await db.query(
    `SELECT exhibition_id
     FROM exhibitions
     WHERE exhibition_id = ?
     AND organizer_id = ?`,
    [id, organizerId]
  );

  if (existing.length === 0) {
    return {
      success: false,
      statusCode: 403,
      message: "You are not allowed to delete this exhibition",
    };
  }

  await db.query(
    `DELETE FROM exhibitions
     WHERE exhibition_id = ?`,
    [id]
  );

  return {
    success: true,
    statusCode: 200,
    message: "Exhibition deleted successfully",
  };
};


module.exports = {
  createExhibition,
  getAllExhibitions,
  getExhibitionById,
  updateExhibition,
  deleteExhibition,
};