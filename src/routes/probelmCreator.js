/* This JavaScript code snippet is setting up a router using Express.js for handling different API
endpoints related to a problem-solving application. Here's a breakdown of what the code is doing: */
const express=require('express');

const problemRouter=express.Router();

const adminMiddleware=require("../middleware/adminMiddleware")
const {CreateProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedProblemByUser,submittedProblem}=require("../controllers/userProblem");
const userMiddleware = require('../middleware/userMiddleware');


// problem 
// create 


// admin ka middleware se
problemRouter.post("/create",adminMiddleware,CreateProblem);
problemRouter.put("/update/:id",adminMiddleware,updateProblem);
problemRouter.delete("/delete/:id",adminMiddleware,deleteProblem);

// user 
problemRouter.get("/getProblemById/:id",userMiddleware,getProblemById);
problemRouter.get("/getAllProblem",userMiddleware,getAllProblem);
problemRouter.get("/problemSolvedByUser",userMiddleware,solvedProblemByUser);
problemRouter.get("/submittedProblem/:pid",userMiddleware,submittedProblem)


module.exports=problemRouter;
// fetch
// update
// delete


