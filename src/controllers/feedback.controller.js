const feedbackService = require("../services/feedback.service");


// CREATE FEEDBACK
const createFeedback = async (req, res) => {
  try {

    const data = {
      ...req.body,
      userId: req.user.userId,
    };

    const result = await feedbackService.createFeedback(data);

    res.status(result.statusCode || 201).json(result);

  } catch (error) {

    console.error("Create Feedback Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// GET ALL FEEDBACK
const getAllFeedback = async (req, res) => {
  try {

    const result = await feedbackService.getAllFeedback();

    res.status(result.statusCode || 200).json(result);

  } catch (error) {

    console.error("Get All Feedback Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// GET FEEDBACK BY ID
const getFeedbackById = async (req, res) => {
  try {

    const result = await feedbackService.getFeedbackById(
      req.params.id
    );

    res.status(result.statusCode || 200).json(result);

  } catch (error) {

    console.error("Get Feedback By ID Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// DELETE FEEDBACK
const deleteFeedback = async (req, res) => {
  try {

    const result = await feedbackService.deleteFeedback(
      req.params.id
    );

    res.status(result.statusCode || 200).json(result);

  } catch (error) {

    console.error("Delete Feedback Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


module.exports = {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  deleteFeedback,
};