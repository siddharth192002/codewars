const jwt  = require("jsonwebtoken");
const redisClient = require("../config/redis");
const User=require("../models/user");

const adminMiddleware=async(req,res,next)=>{

    try{

        // get token from cookies 
        const {token} = req.cookies;
        if(!token)
        {
            throw new Error("token is not present ")
        }

        const payload = jwt.verify(token,process.env.JWT_KEY);
        

        // veify token 
        const {_id} =payload ;
        if(!_id)
        {
            throw new Error("INVALID TOKEN");
        }

        // check if user exists
        const  result  = await User.findById(_id);
        if(!result )
        {
            throw new Error("user doesnot exist");
        }

        // checking if it is admin 
        if(payload.role!='admin')
        {
            throw new Error("invalid Token");
        }

        // redis ke blocklist mei to present nahi ha

        const IsBlocked =await redisClient.exists(`token:${token}`)

        if(IsBlocked)
        {
            throw new Error("invalid token");
        }
        //attach user info to request object 
        req.result = result;


        // move to next middleware /route
        next();
   }
   catch (err) 
   {
    res.status(401).send("error"+err.message);
  }
};

module.exports = adminMiddleware;