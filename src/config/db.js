const mysql = require("mysql2");
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0,
});
// pool.promise() isliye use kiya because mysql2 callback-based API deta hai, aur async/await ke saath clean asynchronous code likhne ke liye Promise wrapper use kiya."
module.exports = pool.promise();
