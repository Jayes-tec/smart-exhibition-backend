const db = require("../config/db");


// CREATE NOTIFICATION
// Admin / Organizer can send notification to any existing user
const createNotification = async (data) => {
  const {
    user_id,
    title,
    message,
  } = data;

  // 1. Validation
  if (!user_id || !title || !message) {
    return {
      success: false,
      statusCode: 400,
      message: "User ID, title and message are required",
    };
  }

  // 2. Check User Exists
  const [user] = await db.query(
    `SELECT user_id
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

  // 3. Create Notification
  // Status will use the database default value
  // (normally Unread)
  const [result] = await db.query(
    `INSERT INTO notifications
    (
      user_id,
      title,
      message
    )
    VALUES (?, ?, ?)`,
    [
      user_id,
      title.trim(),
      message.trim(),
    ]
  );

  return {
    success: true,
    statusCode: 201,
    message: "Notification created successfully",
    notificationId: result.insertId,
  };
};


// GET ALL NOTIFICATIONS
// Admin / Organizer only
const getAllNotifications = async () => {
  const [rows] = await db.query(
    `SELECT
       n.*,
       u.name AS user_name,
       u.email AS user_email
     FROM notifications n
     JOIN users u
       ON n.user_id = u.user_id
     ORDER BY n.created_at DESC`
  );

  return {
    success: true,
    statusCode: 200,
    data: rows,
  };
};


// GET MY NOTIFICATIONS
// Any logged-in user can see only their own notifications
const getMyNotifications = async (userId) => {
  const [rows] = await db.query(
    `SELECT
       notification_id,
       user_id,
       title,
       message,
       status,
       created_at
     FROM notifications
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );

  return {
    success: true,
    statusCode: 200,
    data: rows,
  };
};


// GET NOTIFICATION BY ID
const getNotificationById = async (id, user) => {
  const [rows] = await db.query(
    `SELECT
       n.*,
       u.name AS user_name,
       u.email AS user_email
     FROM notifications n
     JOIN users u
       ON n.user_id = u.user_id
     WHERE n.notification_id = ?`,
    [id]
  );

  // 1. Check Notification Exists
  if (rows.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Notification not found",
    };
  }

  // 2. Admin / Organizer can view any notification
  if (user.roleId === 1 || user.roleId === 2) {
    return {
      success: true,
      statusCode: 200,
      data: rows[0],
    };
  }

  // 3. Other users can view only their own notification
  if (rows[0].user_id !== user.userId) {
    return {
      success: false,
      statusCode: 403,
      message: "You can only view your own notifications",
    };
  }

  return {
    success: true,
    statusCode: 200,
    data: rows[0],
  };
};


// MARK NOTIFICATION AS READ
const markAsRead = async (id, user) => {

  // 1. Check Notification Exists
  const [notification] = await db.query(
    `SELECT
       notification_id,
       user_id,
       status
     FROM notifications
     WHERE notification_id = ?`,
    [id]
  );

  if (notification.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Notification not found",
    };
  }

  // 2. Admin / Organizer can mark any notification as read
  if (user.roleId !== 1 && user.roleId !== 2) {

    // Other users can mark only their own notification
    if (notification[0].user_id !== user.userId) {
      return {
        success: false,
        statusCode: 403,
        message: "You can only mark your own notification as read",
      };
    }
  }

  // 3. Already Read
  if (notification[0].status === "Read") {
    return {
      success: true,
      statusCode: 200,
      message: "Notification is already marked as read",
    };
  }

  // 4. Update Status
  await db.query(
    `UPDATE notifications
     SET status = 'Read'
     WHERE notification_id = ?`,
    [id]
  );

  return {
    success: true,
    statusCode: 200,
    message: "Notification marked as read",
  };
};


// DELETE NOTIFICATION
// Admin / Organizer only
const deleteNotification = async (id) => {

  // 1. Check Notification Exists
  const [notification] = await db.query(
    `SELECT notification_id
     FROM notifications
     WHERE notification_id = ?`,
    [id]
  );

  if (notification.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Notification not found",
    };
  }

  // 2. Delete Notification
  await db.query(
    `DELETE FROM notifications
     WHERE notification_id = ?`,
    [id]
  );

  return {
    success: true,
    statusCode: 200,
    message: "Notification deleted successfully",
  };
};


module.exports = {
  createNotification,
  getAllNotifications,
  getMyNotifications,
  getNotificationById,
  markAsRead,
  deleteNotification,
};