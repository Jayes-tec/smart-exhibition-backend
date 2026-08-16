const visitorLogService = require("../services/visitorLog.service");

// CREATE VISITOR LOG
const createVisitorLog = async (req, res) => {
  try {

    const data = {
      ...req.body,
      userId: req.user.userId,
      roleId: req.user.roleId,
    };

    const result = await visitorLogService.createVisitorLog(data);

    res.status(result.statusCode || 201).json(result);

  } catch (error) {

    console.error("Create Visitor Log Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// GET ALL VISITOR LOGS
const getAllVisitorLogs = async (req, res) => {
  try {

    const result = await visitorLogService.getAllVisitorLogs();

    res.status(result.statusCode || 200).json(result);

  } catch (error) {

    console.error("Get All Visitor Logs Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// GET VISITOR LOG BY ID
const getVisitorLogById = async (req, res) => {
  try {

    const result = await visitorLogService.getVisitorLogById(
      req.params.id,
      req.user
    );

    res.status(result.statusCode || 200).json(result);

  } catch (error) {

    console.error("Get Visitor Log By ID Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// GET MY VISITOR LOGS
const getMyVisitorLogs = async (req, res) => {
  try {

    // Logged-in visitor ki ID JWT se
    const userId = req.user.userId;

    const result = await visitorLogService.getMyVisitorLogs(userId);

    res.status(result.statusCode || 200).json(result);

  } catch (error) {

    console.error("Get My Visitor Logs Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


module.exports = {
  createVisitorLog,
  getAllVisitorLogs,
  getVisitorLogById,
  getMyVisitorLogs,
};