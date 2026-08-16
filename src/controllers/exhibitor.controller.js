const exhibitorService = require("../services/exhibitor.service");


// CREATE EXHIBITOR
const createExhibitor = async (req, res) => {
  try {

    const data = {
      ...req.body,
      user_id: req.user.userId,
    };

    const result = await exhibitorService.createExhibitor(data);

    res.status(result.statusCode || 201).json(result);

  } catch (error) {

    console.error("Create Exhibitor Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// GET ALL EXHIBITORS
const getAllExhibitors = async (req, res) => {
  try {

    const result = await exhibitorService.getAllExhibitors();

    res.status(result.statusCode || 200).json(result);

  } catch (error) {

    console.error("Get All Exhibitors Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// GET EXHIBITOR BY ID
const getExhibitorById = async (req, res) => {
  try {

    const result = await exhibitorService.getExhibitorById(
      req.params.id,
      req.user
    );

    res.status(result.statusCode || 200).json(result);

  } catch (error) {

    console.error("Get Exhibitor By ID Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// UPDATE EXHIBITOR
const updateExhibitor = async (req, res) => {
  try {

    const result = await exhibitorService.updateExhibitor(
      req.params.id,
      req.body,
      req.user
    );

    res.status(result.statusCode || 200).json(result);

  } catch (error) {

    console.error("Update Exhibitor Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// DELETE EXHIBITOR
const deleteExhibitor = async (req, res) => {
  try {

    const result = await exhibitorService.deleteExhibitor(
      req.params.id,
      req.user
    );

    res.status(result.statusCode || 200).json(result);

  } catch (error) {

    console.error("Delete Exhibitor Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


module.exports = {
  createExhibitor,
  getAllExhibitors,
  getExhibitorById,
  updateExhibitor,
  deleteExhibitor,
};