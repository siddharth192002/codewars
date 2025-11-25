const express =require('express');
const userMiddleware = require('../middleware/userMiddleware');
const submitRouter=express.Router();
const {submitCode,runCode}=require("../controllers/userSubmission");
const submitCoderateLimiter=require("../middleware/RateLimiter");



submitRouter.post("/submit/:id",userMiddleware,submitCoderateLimiter,submitCode);
submitRouter.post("/run/:id",userMiddleware,runCode);



module.exports=submitRouter;