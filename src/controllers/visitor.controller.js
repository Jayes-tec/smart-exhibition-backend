const visitorService = require("../services/visitor.service");

// CREATE VISITOR PROFILE
const createVisitor = async (req, res) => {
  try {
    // user_id body se nahi, JWT se aayega
    const user_id = req.user.userId;

    const result = await visitorService.createVisitor(
      user_id,
      req.body
    );

    res.status(result.statusCode || 201).json(result);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET ALL VISITORS
const getAllVisitors = async (req, res) => {
  try {

    const result = await visitorService.getAllVisitors();

    res.status(result.statusCode || 200).json(result);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET OWN VISITOR PROFILE
const getVisitorProfile = async (req, res) => {
  try {
    // Logged-in user ki ID JWT se
    const user_id = req.user.userId;

    const result = await visitorService.getVisitorProfile(user_id);

    res.status(result.statusCode || 200).json(result);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// UPDATE OWN VISITOR PROFILE
const updateVisitor = async (req, res) => {
  try {
    // Kisi aur visitor ki ID body se nahi lenge
    const user_id = req.user.userId;

    const result = await visitorService.updateVisitor(
      user_id,
      req.body
    );

    res.status(result.statusCode || 200).json(result);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  createVisitor,
  getAllVisitors,
  getVisitorProfile,
  updateVisitor,
};