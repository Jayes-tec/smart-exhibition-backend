const authorize = (...allowedRoles) => {

    return  (req,res,next) => {
        const userRole = req.user.roleId;
        // suppose userRole = [1,2] then 
        //1.. userRole.includes(2) -> true
        //2.. userRole.includes(4) ->false 
    //     console.log("USER ROLE:", userRole);
    // console.log("ALLOWED ROLES:", allowedRoles);

        if(!allowedRoles.includes(userRole)){
            return res.status(403).json({
                success:false,
                message:"Access Forbidden"  
            })


        }

        next();
    }

};
module.exports = authorize;