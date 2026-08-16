const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const {signupValidation,loginValidation,validate} = require("../middleware/validation.middleware");
 
// SignUp complete  
// Left to Right execute
router.post('/signup',signupValidation,validate,authController.signup);
router.post('/login',loginValidation,validate,authController.login);
   
module.exports = router;
