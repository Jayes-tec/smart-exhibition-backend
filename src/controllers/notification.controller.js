const notificationService = require("../services/notification.service");

// CREATE NOTIFICATION
const createNotification = async (req, res) => {
  try {
    const result = await notificationService.createNotification(req.body);

    res.status(result.statusCode || 201).json(result);
  } catch (error) {
    console.error("Create Notification Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET ALL NOTIFICATIONS
const getAllNotifications = async (req, res) => {
  try {
    const result = await notificationService.getAllNotifications();

    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Get All Notifications Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET MY NOTIFICATION ( EX EXHIBITOR CAN SEE THEIR NOTIFICATION ONLY )

const getMyNotifications = async (req, res) => {
  try {

    const result = await notificationService.getMyNotifications(
      req.user.userId
    );

    res.status(result.statusCode || 200).json(result);

  } catch (error) {

    console.error("Get My Notifications Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// GET NOTIFICATION BY ID
const getNotificationById = async (req, res) => {
  try {
    const result = await notificationService.getNotificationById(
      req.params.id,
      req.user
    );

    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Get Notification By ID Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// MARK NOTIFICATION AS READ
const markAsRead = async (req, res) => {
  try {
    const result = await notificationService.markAsRead(
      req.params.id,
      req.user
    );

    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Mark Notification Read Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// DELETE NOTIFICATION
const deleteNotification = async (req, res) => {
  try {
    const result = await notificationService.deleteNotification(
      req.params.id
    );

    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Delete Notification Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  createNotification,
  getAllNotifications,
  getMyNotifications,
  getNotificationById,
  markAsRead,
  deleteNotification,
};