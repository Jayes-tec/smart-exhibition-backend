// ONLY HERE WE WRITE OUR BUSINESS LOGIC
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// const signup = async () => {
//     // Only for testing
//     return{
//         success:true,
//         message:"Signup successfully working"
//     }
// }

// mysql2 promise return karta hai
// [rows, fields] in this we want rows that's why we destructured

const signup = async (userData) => {
  const { role_id, name, email, password, phone } = userData;

  // ONLY EXHIBITOR AND VISITOR CAN SIGNUP THROUGH THIS API
  // ADMIN AND ORGANIZER ACCOUNTS SHOULD NOT BE CREATED THROUGH PUBLIC SIGNUP
  if (![3, 4].includes(Number(role_id))) {
    return {
      success: false,
      statusCode: 400,
      message: "Invalid role for signup",
    };
  }

  // Checking if user already exist or not
  const [existingUser] = await db.query(
    "SELECT user_id FROM users WHERE email = ?",
    [email]
  );

  if (existingUser.length > 0) {
    return {
      success: false,
      statusCode: 409,
      message: "User already exist",
    };
  }

  // HASH PASSWORD
  const hasedPassword = await bcrypt.hash(password, 10);

  console.log(hasedPassword);

  // INSERT USER INTO DATABASE
  const [result] = await db.query(
    `INSERT INTO users(role_id, name, email, password, phone)
     VALUES(?,?,?,?,?)`,
    [
      role_id,
      name,
      email,
      hasedPassword,
      phone,
    ]
  );

  console.log(result);

  // DATABASE ME KITNI ROWS CHANGE HUI MATLAB 1 ONLY
  if (result.affectedRows === 1) {
    return {
      success: true,
      statusCode: 201,
      message: "User registered successfully",
      userId: result.insertId,
    };
  }

  return {
    success: false,
    statusCode: 500,
    message: "User registration failed",
  };
};


// LOGIN
const login = async (userData) => {
  const { email, password } = userData;

  // FIND USER USING EMAIL
  const [user] = await db.query(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  // CHECK USER EXISTS OR NOT
  if (user.length === 0) {
    return {
      success: false,
      statusCode: 401,
      message: "Invalid email or password",
    };
  }

  // by using bcrypt.compare it compare entered password with hashed password
  const isMatch = await bcrypt.compare(
    password,
    user[0].password
  );

  // CHECK PASSWORD IS CORRECT OR NOT
  if (!isMatch) {
    return {
      success: false,
      statusCode: 401,
      message: "Invalid email or password",
    };
  }

  // TOKEN SYSTEM
  const token = jwt.sign(
    {
      userId: user[0].user_id,
      roleId: user[0].role_id,
      email: user[0].email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

  return {
    success: true,
    statusCode: 200,
    message: "Login successful",
    token,
    user: {
      userId: user[0].user_id,
      name: user[0].name,
      email: user[0].email,
      roleId: user[0].role_id,
    },
  };
};


module.exports = {
  signup,
  login,
};