const express = require('express');
const problemRouter = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const userMiddleware  = require('../middleware/userMiddleware');
const {
    CreateProblem,
    updateProblem,
    deleteProblem,
    getProblemById,
    getAllProblem,
    solvedProblemByUser,
    submittedProblem
} = require("../controllers/userProblem");

// Admin routes (create / modify problems)
problemRouter.post("/create", adminMiddleware, CreateProblem);
problemRouter.put("/update/:id", adminMiddleware, updateProblem);
problemRouter.delete("/delete/:id", adminMiddleware, deleteProblem);

// User routes (read problems, view own progress)
problemRouter.get("/getProblemById/:id", userMiddleware, getProblemById);
problemRouter.get("/getAllProblem", userMiddleware, getAllProblem);
problemRouter.get("/problemSolvedByUser", userMiddleware, solvedProblemByUser);
problemRouter.get("/submittedProblem/:pid", userMiddleware, submittedProblem);

module.exports = problemRouter;
