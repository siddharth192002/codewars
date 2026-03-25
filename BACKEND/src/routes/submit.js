const express = require('express');
const submitRouter = express.Router();

const userMiddleware = require('../middleware/userMiddleware');
const { submitCode, runCode } = require("../controllers/userSubmission");
const { submitCodeRateLimiter, runCodeRateLimiter } = require("../middleware/RateLimiter");

// submit: authenticate → rate limit (10s) → execute against hidden test cases
submitRouter.post("/submit/:id", userMiddleware, submitCodeRateLimiter, submitCode);

// run: authenticate → rate limit (5s) → execute against visible test cases only
submitRouter.post("/run/:id", userMiddleware, runCodeRateLimiter, runCode);

module.exports = submitRouter;