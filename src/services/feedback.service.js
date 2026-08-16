const db = require("../config/db");


// CREATE FEEDBACK
const createFeedback = async (data) => {
  const {
    exhibition_id,
    rating,
    review,
    userId,
  } = data;

  // 1. Validation
  if (!exhibition_id || rating === undefined || rating === null) {
    return {
      success: false,
      statusCode: 400,
      message: "Exhibition ID and rating are required",
    };
  }

  // Rating should be a number
  const numericRating = Number(rating);

  if (
    !Number.isInteger(numericRating) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    return {
      success: false,
      statusCode: 400,
      message: "Rating must be a whole number between 1 and 5",
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

  // 3. Check Exhibition Exists
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

  // 4. Check Visitor actually visited this Exhibition
  // Booth -> Hall -> Exhibition
  const [visit] = await db.query(
    `SELECT vl.log_id
     FROM visitor_logs vl
     JOIN booths b
       ON vl.booth_id = b.booth_id
     JOIN halls h
       ON b.hall_id = h.hall_id
     WHERE vl.visitor_id = ?
     AND h.exhibition_id = ?
     LIMIT 1`,
    [visitorId, exhibition_id]
  );

  if (visit.length === 0) {
    return {
      success: false,
      statusCode: 403,
      message:
        "You can only submit feedback for an exhibition you have visited",
    };
  }

  // 5. Check Duplicate Feedback
  const [existingFeedback] = await db.query(
    `SELECT feedback_id
     FROM feedback
     WHERE visitor_id = ?
     AND exhibition_id = ?`,
    [visitorId, exhibition_id]
  );

  if (existingFeedback.length > 0) {
    return {
      success: false,
      statusCode: 409,
      message: "You have already submitted feedback for this exhibition",
    };
  }

  // 6. Create Feedback
  const [result] = await db.query(
    `INSERT INTO feedback
    (
      visitor_id,
      exhibition_id,
      rating,
      review
    )
    VALUES (?, ?, ?, ?)`,
    [
      visitorId,
      exhibition_id,
      numericRating,
      review || null,
    ]
  );

  return {
    success: true,
    statusCode: 201,
    message: "Feedback submitted successfully",
    feedbackId: result.insertId,
  };
};


// GET ALL FEEDBACK
const getAllFeedback = async () => {
  const [rows] = await db.query(
    `SELECT
       f.*,
       u.name AS visitor_name,
       u.email AS visitor_email,
       e.title AS exhibition_name
     FROM feedback f
     JOIN visitors v
       ON f.visitor_id = v.visitor_id
     JOIN users u
       ON v.user_id = u.user_id
     JOIN exhibitions e
       ON f.exhibition_id = e.exhibition_id
     ORDER BY f.created_at DESC`
  );

  return {
    success: true,
    statusCode: 200,
    data: rows,
  };
};


// GET FEEDBACK BY ID
const getFeedbackById = async (id) => {
  const [rows] = await db.query(
    `SELECT
       f.*,
       u.name AS visitor_name,
       u.email AS visitor_email,
       e.title AS exhibition_name
     FROM feedback f
     JOIN visitors v
       ON f.visitor_id = v.visitor_id
     JOIN users u
       ON v.user_id = u.user_id
     JOIN exhibitions e
       ON f.exhibition_id = e.exhibition_id
     WHERE f.feedback_id = ?`,
    [id]
  );

  if (rows.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Feedback not found",
    };
  }

  return {
    success: true,
    statusCode: 200,
    data: rows[0],
  };
};


// DELETE FEEDBACK
const deleteFeedback = async (id) => {

  // 1. Check Feedback Exists
  const [feedback] = await db.query(
    `SELECT feedback_id
     FROM feedback
     WHERE feedback_id = ?`,
    [id]
  );

  if (feedback.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Feedback not found",
    };
  }

  // 2. Delete Feedback
  await db.query(
    `DELETE FROM feedback
     WHERE feedback_id = ?`,
    [id]
  );

  return {
    success: true,
    statusCode: 200,
    message: "Feedback deleted successfully",
  };
};


module.exports = {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  deleteFeedback,
};