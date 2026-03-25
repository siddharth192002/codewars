const express = require('express');
const authRouter = express.Router();

const { register, login, logout, adminRegister, deleteProfile, check } = require('../controllers/userAuthent');
const userMiddleware  = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { loginRateLimiter } = require('../middleware/RateLimiter');

authRouter.post('/register', register);
authRouter.post('/login', loginRateLimiter, login);          // rate limited by IP
authRouter.post('/logout', userMiddleware, logout);
authRouter.post('/admin/register', adminMiddleware, adminRegister);  // existing admin only
authRouter.delete('/deleteProfile', userMiddleware, deleteProfile);
authRouter.get('/check', userMiddleware, check);

module.exports = authRouter;