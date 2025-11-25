const redisClient = require("../config/redis");
const User= require("../models/user")

// it check if request body contain all the required  data or filed present 
// and check email id and password are valid or not 
const validate= require('../utils/validator');


//hashing the passsword 
const bcrypt =require ("bcrypt");


const jwt = require ('jsonwebtoken');

const Submission =require("../models/submission")

const register =async(req,res)=>{

    try
    {
        // Validate request body

        if (!req.body) {
            return res.status(400).send("error: Request body is missing");
        }

        // // Custom validator
        validate(req.body);
        const {firstName,emailId,password}=req.body;

        //Check if user already exists
        const existingUser = await User.findOne({ emailId });
        if (existingUser) 
        {
        return res.status(409).json({ error: "Email already registered" });
        }


        // hash the password 
        req.body.password =await bcrypt.hash(password,10)

        req.body.role='user';
        
        // ye email id already exist to nahi karti mere system mei 
        // const ans = User.exist({emailId});

        // if email id already exist it will throw error
        //Check if user already exists
        //Create new user
        const user = await User.create(req.body);

       // Generate JWT
        const token = jwt.sign(
        {_id: user._id, emailId: emailId, role: user.role}, 
        process.env.JWT_KEY, 
        { expiresIn: '24h' }  
        );

// Also update cookie maxAge
    res.cookie('token', token, { maxAge: 24 * 60 * 60 * 1000 }); // 24 hours in ms
        res.status(201).send("user created sucessfully");
    }
    catch(err)
    {
        // 400 Bad request : Invalid request syntax or parameters.
        res.status(400).send("error:"+err);
    }
}

const login = async(req,res)=>{

    try{
        const {emailId,password}=req.body;

        if(!emailId)
        {
            throw new Error("Invalid credentaial");
        }
        if(!password)
        {
            throw new Error("Invalid credential");
        }
        const user = await User.findOne({emailId});

        const match = await bcrypt.compare(password,user.password);

        if(!match)
        {
            throw new Error("Invalid Credential");
        }

        const token = jwt.sign(
        {_id: user._id, emailId: emailId, role: user.role}, 
        process.env.JWT_KEY, 
        { expiresIn: '24h' } 
        );

    // Also update cookie maxAge
    res.cookie('token', token, { maxAge: 24 * 60 * 60 * 1000 }); // 24 hours in ms
        res.status(200).send("Logged in successfully");
    }
    catch(err)
    {
        res.status(401).send("error :"+err);
    }

}


const logout =async(req,res)=>{

    try{ 
        const {token}=req.cookies;

        const payload = jwt.decode(token);
        if (!payload || !payload.exp) 
        {
            return res.status(400).json({ error: "Invalid token" });
        }

                // token add kar dunga redis ke blocklist mei 
        await redisClient.set(`token:${token}`,'Blocked')
        await redisClient.expireAt(`token:${token}`,payload.exp);

        // Cookies ko clear kar dena
        res.cookie("token",null,{expires:new Date(Date.now())});
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch(err){
            res.status(503).send("error"+err);
    }
}


const adminRegister=async(req,res)=>{
        try
    {
        // Validate request body

        if (!req.body) {
            return res.status(400).send("error: Request body is missing");
        }

        // // Custom validator
        validate(req.body);
        const {firstName,emailId,password}=req.body;

        //Check if user already exists
        const existingUser = await User.findOne({ emailId });
        if (existingUser) 
        {
        return res.status(409).json({ error: "Email already registered" });
        }


        // hash the password 
        req.body.password =await bcrypt.hash(password,10)

        // req.body.role='admin';
        
        // ye email id already exist to nahi karti mere system mei 
        // const ans = User.exist({emailId});

        // if email id already exist it will throw error
        //Check if user already exists
        //Create new user
        const user = await User.create(req.body);

       // Generate JWT
        const token = jwt.sign(
        {_id: user._id, emailId: emailId, role: user.role}, 
        process.env.JWT_KEY, 
        { expiresIn: '24h' }  
        );

        // Also update cookie maxAge
        res.cookie('token', token, { maxAge: 24 * 60 * 60 * 1000 }); // 24 hours in ms
        res.status(201).send("user created sucessfully");
    }
    catch(err)
    {
        // 400 Bad request : Invalid request syntax or parameters.
        res.status(400).send("error:"+err);
    }
}


const deleteProfile=async(req,res)=>{
    try{
        const userId=req.result._id;
        // userSchema delete
        await User.findByIdAndDelete(userId);

        // //Submisssion se bhi delete karo
        // await Submission.deleteMany({userId});

        res.status(200).send("deleted successfully");
        
    }
    catch(err){
        res.status(500).send("internal server error");
    }
}




module.exports= {register,login,logout,adminRegister,deleteProfile};