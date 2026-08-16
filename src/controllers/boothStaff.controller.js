const boothStaffService = require("../services/boothStaff.service");

// CREATE STAFF
const createStaff = async (req, res) => {
  try {

    const data = {
      ...req.body,
      userId: req.user.userId,
    };

    const result = await boothStaffService.createStaff(data);

    res.status(result.statusCode || 201).json(result);

  } catch (error) {

    console.error("Create Staff Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// GET ALL STAFF
const getAllStaff = async (req, res) => {
  try {
    const result = await boothStaffService.getAllStaff();

    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Get All Staff Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET STAFF BY ID
const getStaffById = async (req, res) => {
  try {
    const result = await boothStaffService.getStaffById(
      req.params.id,
      req.user
    );

    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Get Staff By ID Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// UPDATE STAFF
const updateStaff = async (req, res) => {
  try {

    const data = {
      ...req.body,
      userId: req.user.userId,
    };

    const result = await boothStaffService.updateStaff(
      req.params.id,
      data
    );

    res.status(result.statusCode || 200).json(result);

  } catch (error) {

    console.error("Update Staff Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// DELETE STAFF
const deleteStaff = async (req, res) => {
  try {
    const result = await boothStaffService.deleteStaff(
      req.params.id,
      req.user
    );

    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Delete Staff Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
};