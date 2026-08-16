const db = require("../config/db");
const createBooth = async (data) => {
  const { hall_id, booth_number, category, price, size, location, status } =
    data;
  const [result] = await db.query(
    `INSERT INTO booths
(
hall_id,
booth_number,
category,
price,
size,
location,
status
)
VALUES(?,?,?,?,?,?,?)`,
    [hall_id, booth_number, category, price, size, location, status],
  );
  return {
    success: true,
    statusCode: 201,
    message: "Booth Created Successfully",
    boothId: result.insertId,
  };
};
const getAllBooths = async () => {
  const [rows] = await db.query(
    `SELECT b.*,h.hall_name FROM booths b 
    JOIN halls h 
    ON b.hall_id=h.hall_id 
    ORDER BY b.booth_number`,
  );
  return {
    success: true,
    statusCode: 200,
    data: rows,
  };
};

const getBoothById = async (id) => {
  const [rows] = await db.query(
    `SELECT
b.*,
h.hall_name
FROM booths b
JOIN halls h
ON b.hall_id = h.hall_id
WHERE b.booth_id = ?;
`,
    [id],
  );
  if (rows.length === 0) {
    return {
      success: false,

      statusCode: 404,

      message: "Booth not found",
    };
  }
  return {
    success: true,
    data: rows[0],
  };
};

const updateBooth = async (id, data) => {
  const { hall_id, booth_number, category, price, size, location, status } = data;

 const [result]  = await db.query(
    `UPDATE booths
SET
hall_id=?,
booth_number=?,
category=?,
price=?,
size=?,
location=?,
status=?
WHERE booth_id=?;`,
    [hall_id, booth_number, category, price, size, location, status, id],
  );
  if (result.affectedRows === 0) {
    return {
        success: false,
        statusCode: 404,
        message: "Booth not found",
    };
}
  return {
    success: true,
    statusCode: 200,
    message: "Booth updated successfully",
  };
};

const deleteBooth = async (id) => {
  const [result] = await db.query(`delete  from booths where booth_id = ?`, [
    id,
  ]);
if (result.affectedRows === 0) {
    return {
        success: false,
        statusCode: 404,
        message: "Booth not found",
    };
}
  return {
    success: true,
    statusCode: 200,
    message: "Booth deleted successfully",
  };
};
module.exports = {
  createBooth,
  getAllBooths,
  getBoothById,
  updateBooth,
  deleteBooth,
};
