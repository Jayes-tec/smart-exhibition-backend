const leadService = require("../services/lead.service");

// CREATE LEAD
// Visitor creates a lead for an exhibitor they visited
const createLead = async (req, res) => {
  try {
    const data = {
      ...req.body,
      userId: req.user.userId,
    };

    const result = await leadService.createLead(data);

    res.status(result.statusCode || 201).json(result);
  } catch (error) {
    console.error("Create Lead Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET ALL LEADS
// Admin / Organizer
const getAllLeads = async (req, res) => {
  try {
    const result = await leadService.getAllLeads();

    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Get All Leads Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET LEAD BY ID
const getLeadById = async (req, res) => {
  try {
    const result = await leadService.getLeadById(
      req.params.id,
      req.user
    );

    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Get Lead By ID Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// UPDATE LEAD STATUS
// Exhibitor
const updateLeadStatus = async (req, res) => {
  try {
    const result = await leadService.updateLeadStatus(
      req.params.id,
      req.body.status,
      req.user
    );

    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Update Lead Status Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// UPDATE LEAD DETAILS
// Exhibitor
const updateLead = async (req, res) => {
  try {
    const result = await leadService.updateLead(
      req.params.id,
      req.body,
      req.user
    );

    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Update Lead Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  createLead,
  getAllLeads,
  getLeadById,
  updateLeadStatus,
  updateLead,
};