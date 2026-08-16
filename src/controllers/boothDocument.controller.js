const boothDocumentService = require("../services/boothDocument.service");

// CREATE DOCUMENT
const createDocument = async (req, res) => {
  try {
    const data = {
      ...req.body,
      userId: req.user.userId,
    };

    const result = await boothDocumentService.createDocument(data);

    res.status(result.statusCode || 201).json(result);
  } catch (error) {
    console.error("Create Document Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET ALL DOCUMENTS
const getAllDocuments = async (req, res) => {
  try {
    const result = await boothDocumentService.getAllDocuments();

    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Get All Documents Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET DOCUMENT BY ID
const getDocumentById = async (req, res) => {
  try {
    const result = await boothDocumentService.getDocumentById(
      req.params.id
    );

    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Get Document By ID Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// DELETE DOCUMENT
const deleteDocument = async (req, res) => {
  try {
    const result = await boothDocumentService.deleteDocument(
      req.params.id,
      req.user
    );

    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Delete Document Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createDocument,
  getAllDocuments,
  getDocumentById,
  deleteDocument,
};