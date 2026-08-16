const exhibitionExhibitorService = require("../services/exhibitionExhibitor.service");

// CREATE EXHIBITION EXHIBITOR
const createExhibitionExhibitor = async (req, res) => {
  try {
    const result =
      await exhibitionExhibitorService.createExhibitionExhibitor(req.body);

    res.status(result.statusCode || 201).json(result);
  } catch (error) {
    console.error("Create Exhibition Exhibitor Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET ALL EXHIBITION EXHIBITORS
const getAllExhibitionExhibitors = async (req, res) => {
  try {
    const result =
      await exhibitionExhibitorService.getAllExhibitionExhibitors();

    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Get All Exhibition Exhibitors Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET EXHIBITION EXHIBITOR BY ID
const getExhibitionExhibitorById = async (req, res) => {
  try {
    const result =
      await exhibitionExhibitorService.getExhibitionExhibitorById(
        req.params.id,
        req.user
      );

    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Get Exhibition Exhibitor By ID Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// UPDATE STATUS
const updateStatus = async (req, res) => {
  try {
    const result =
      await exhibitionExhibitorService.updateStatus(
        req.params.id,
        req.body.status
      );

    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Update Exhibition Exhibitor Status Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// DELETE EXHIBITION EXHIBITOR
const deleteExhibitionExhibitor = async (req, res) => {
  try {
    const result =
      await exhibitionExhibitorService.deleteExhibitionExhibitor(
        req.params.id
      );

    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Delete Exhibition Exhibitor Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  createExhibitionExhibitor,
  getAllExhibitionExhibitors,
  getExhibitionExhibitorById,
  updateStatus,
  deleteExhibitionExhibitor,
};