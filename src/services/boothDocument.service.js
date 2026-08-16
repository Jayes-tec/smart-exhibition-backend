const db = require("../config/db");

// CREATE DOCUMENT
const createDocument = async (data) => {
  const {
    exhibition_exhibitor_id,
    title,
    file_type,
    file_url,
    userId,
  } = data;

  // 1. Validation
  if (!exhibition_exhibitor_id || !title || !file_url) {
    return {
      success: false,
      statusCode: 400,
      message: "Exhibition exhibitor ID, title and file URL are required",
    };
  }

  // 2. Check Exhibition-Exhibitor belongs to logged-in Exhibitor
  const [exhibitionExhibitor] = await db.query(
    `SELECT ee.exhibition_exhibitor_id
     FROM exhibition_exhibitors ee
     JOIN exhibitors e
       ON ee.exhibitor_id = e.exhibitor_id
     WHERE ee.exhibition_exhibitor_id = ?
     AND e.user_id = ?`,
    [exhibition_exhibitor_id, userId]
  );

  if (exhibitionExhibitor.length === 0) {
    return {
      success: false,
      statusCode: 403,
      message:
        "You can only upload documents for your own exhibitor account",
    };
  }

  // 3. Create Document
  const [result] = await db.query(
    `INSERT INTO booth_documents
    (
      exhibition_exhibitor_id,
      title,
      file_type,
      file_url
    )
    VALUES (?, ?, ?, ?)`,
    [
      exhibition_exhibitor_id,
      title,
      file_type || null,
      file_url,
    ]
  );

  return {
    success: true,
    statusCode: 201,
    message: "Document uploaded successfully",
    documentId: result.insertId,
  };
};


// GET ALL DOCUMENTS
const getAllDocuments = async () => {
  const [rows] = await db.query(
    `SELECT
       bd.*,
       ee.exhibition_id,
       ee.exhibitor_id,
       e.company_name,
       ex.title AS exhibition_name
     FROM booth_documents bd
     JOIN exhibition_exhibitors ee
       ON bd.exhibition_exhibitor_id = ee.exhibition_exhibitor_id
     JOIN exhibitors e
       ON ee.exhibitor_id = e.exhibitor_id
     JOIN exhibitions ex
       ON ee.exhibition_id = ex.exhibition_id
     ORDER BY bd.uploaded_at DESC`
  );

  return {
    success: true,
    statusCode: 200,
    data: rows,
  };
};


// GET DOCUMENT BY ID
const getDocumentById = async (id) => {
  const [rows] = await db.query(
    `SELECT
       bd.*,
       ee.exhibition_id,
       ee.exhibitor_id,
       e.company_name,
       ex.title AS exhibition_name
     FROM booth_documents bd
     JOIN exhibition_exhibitors ee
       ON bd.exhibition_exhibitor_id = ee.exhibition_exhibitor_id
     JOIN exhibitors e
       ON ee.exhibitor_id = e.exhibitor_id
     JOIN exhibitions ex
       ON ee.exhibition_id = ex.exhibition_id
     WHERE bd.document_id = ?`,
    [id]
  );

  if (rows.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Document not found",
    };
  }

  return {
    success: true,
    statusCode: 200,
    data: rows[0],
  };
};


// DELETE DOCUMENT
const deleteDocument = async (id, user) => {

  // 1. Check Document Exists
  const [document] = await db.query(
    `SELECT
       bd.document_id,
       ee.exhibitor_id
     FROM booth_documents bd
     JOIN exhibition_exhibitors ee
       ON bd.exhibition_exhibitor_id = ee.exhibition_exhibitor_id
     WHERE bd.document_id = ?`,
    [id]
  );

  if (document.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Document not found",
    };
  }

  // 2. Exhibitor can delete only their own document
  if (user.roleId === 3) {

    const [exhibitor] = await db.query(
      `SELECT exhibitor_id
       FROM exhibitors
       WHERE user_id = ?`,
      [user.userId]
    );

    if (
      exhibitor.length === 0 ||
      exhibitor[0].exhibitor_id !== document[0].exhibitor_id
    ) {
      return {
        success: false,
        statusCode: 403,
        message: "You can only delete your own document",
      };
    }
  }

  // 3. Delete Document
  await db.query(
    `DELETE FROM booth_documents
     WHERE document_id = ?`,
    [id]
  );

  return {
    success: true,
    statusCode: 200,
    message: "Document deleted successfully",
  };
};


module.exports = {
  createDocument,
  getAllDocuments,
  getDocumentById,
  deleteDocument,
};