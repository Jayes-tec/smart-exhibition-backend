const jwt = require("jsonwebtoken");
const authenticate = (req,res,next)=>{
    const authHeader = req.headers.authorization;
    if(!authHeader){
          return res.status(401).json({
        success: false,
        message: "Access denied. Token missing."
    });
    }
    // because   Authorization header have ["bearer","<JWT_TOKEN>"]
    // that's why we split JWT token seperate 
    const token = authHeader.split(" ")[1];
    try{
    const decoded = jwt.verify(token,process.env.JWT_SECRET)
        req.user = decoded;
        next();

    }
    catch(e){
         return res.status(401).json({
        success:false,
        message:"Invalid or expired token"
    }); 

    }                           

}
module.exports = authenticate