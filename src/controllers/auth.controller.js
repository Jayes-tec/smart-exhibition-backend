// ONLY FOR TESTING


// const signup = (req,res)=>{
//     res.status(200).json({success:true , message:"Signup successfully"});

// }
// module.exports = {
//     signup
// }


// THIS IS BECAUSE WE DON'T WRITE BUSINESS LOGIC IN THE CONTROLLER OR ROUTE 
// CONTROLLER IS JUST FOR ONLY HANDLING THE HTTP REQUEST AND resonse handle karta hai

const authService = require("../services/auth.service");


const signup = async (req,res) =>{
    if(!req.body){
        return res.status(400).json({success:false,message:"Request body is required"})
    }
    try{
           
           console.log("Request Body:", req.body);
        const result = await authService.signup(req.body);
        
        res.status(result.statusCode || 200).json(result);
      

    }
    catch(e){
        console.error("signup Error:",e);
        res.status(500).json({success:false,message:e.message});
        
    }
}


const login = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({
      success: false,
      message: "Request body is required",
    });
  }

  try {
    console.log("Request Body:", req.body);

    const loginResult = await authService.login(req.body);

    res.status(loginResult.statusCode || 200).json(loginResult);

  } catch (e) {
    console.error("login Error:", e);

    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};
module.exports={
    signup,
    login
}
