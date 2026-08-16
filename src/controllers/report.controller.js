const reportService = require("../services/report.service");

// CREATE REPORT
const createReport = async (req, res) => {
  try {

    const data = {
      ...req.body,
      generated_by: req.user.userId,
      file_path: req.file ? `/uploads/reports/${req.file.filename}` : req.body.file_path
    };

    const result = await reportService.createReport(data);

    res.status(result.statusCode || 201).json(result);

  } catch (error) {

    console.error("Create Report Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


// GET ALL REPORTS
const getAllReports = async (req, res) => {
  try {
    const result = await reportService.getAllReports();

    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Get All Reports Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET REPORT BY ID
const getReportById = async (req, res) => {
  try {
    const result = await reportService.getReportById(
      req.params.id
    );

    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Get Report By ID Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// DELETE REPORT
const deleteReport = async (req, res) => {
  try {
    const result = await reportService.deleteReport(
      req.params.id
    );

    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Delete Report Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  createReport,
  getAllReports,
  getReportById,
  deleteReport,
};