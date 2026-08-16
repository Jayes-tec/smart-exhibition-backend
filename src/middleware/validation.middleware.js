const { body, validationResult } = require("express-validator");

// here i learn method chaining        body("email")
// .notEmpty()
// .isEmail()

const signupValidation = [
  body("name")
    .trim() //if name:"   " to ye pehele hi white spaces trime kar dega and then notEmpty pe jaayega
    .notEmpty()
    .withMessage("Name is reqiured")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is reqiured")
    .isEmail()
    .withMessage("Please enter a valid Email")
    .normalizeEmail(), // THIS CONVERT EMAIL INTO STANDARD FORMATE

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone("en-IN")
    .withMessage("Please enter a valid Indian phone number"),
];

// LOGIN VALIDATION
// login route pehle sirf "req.body missing" check karta tha,
// isliye agar email/password na bheje jaayen to mysql2
// "Bind parameters must not contain undefined" throw karke
// 500 de deta tha instead of clean 400
const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid Email")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
//   if all works fine then next() moves to the next middleware ,controller ,etc;
  next();
};

module.exports={
    signupValidation,
    loginValidation,
    validate
}