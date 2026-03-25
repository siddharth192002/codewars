const redisClient = require('../config/redis');

/**
 * Prevents a user from submitting code more than once every 10 seconds.
 * Uses a single atomic SET NX EX operation — no race condition.
 */
const submitCodeRateLimiter = async (req, res, next) => {
    const userId = req.result._id;
    const redisKey = `submit_cooldown:${userId}`;

    try {
        // SET NX returns 'OK' if the key was newly created, null if it already existed
        const wasSet = await redisClient.set(redisKey, 'cooldown_active', {
            EX: 10,  // 10-second cooldown
            NX: true // only set if key does not already exist
        });

        if (!wasSet) {
            return res.status(429).json({
                error: "Please wait 10 seconds before submitting again."
            });
        }

        next();
    } catch (err) {
        console.error('Rate limiter error:', err.message);
        // Fail open — let the request through rather than blocking the user
        // if Redis is temporarily unavailable
        next();
    }
};

/**
 * Prevents a user from running code more than once every 5 seconds.
 * Separate limiter so run and submit have independent cooldowns.
 */
const runCodeRateLimiter = async (req, res, next) => {
    const userId = req.result._id;
    const redisKey = `run_cooldown:${userId}`;

    try {
        const wasSet = await redisClient.set(redisKey, 'cooldown_active', {
            EX: 5,
            NX: true
        });

        if (!wasSet) {
            return res.status(429).json({
                error: "Please wait 5 seconds before running again."
            });
        }

        next();
    } catch (err) {
        console.error('Run rate limiter error:', err.message);
        next();
    }
};

/**
 * Limits login attempts per IP: max 10 attempts per 15 minutes.
 * Keyed by IP because the user is not yet authenticated.
 */
const loginRateLimiter = async (req, res, next) => {
    const ip = req.ip;
    const redisKey = `login_attempt:${ip}`;

    try {
        const attempts = await redisClient.incr(redisKey);
        if (attempts === 1) {
            // Set expiry only on first attempt to start the 15-min window
            await redisClient.expire(redisKey, 900);
        }
        if (attempts > 10) {
            return res.status(429).json({
                error: "Too many login attempts. Please try again in 15 minutes."
            });
        }
        next();
    } catch (err) {
        console.error('Login rate limiter error:', err.message);
        next();
    }
};

module.exports = { submitCodeRateLimiter, runCodeRateLimiter, loginRateLimiter };