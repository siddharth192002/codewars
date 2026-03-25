const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");
const User = require("../models/user");

/**
 * Factory that returns an auth middleware.
 * Pass requiredRole='admin' for admin-only routes, leave empty for any logged-in user.
 */
const createAuthMiddleware = (requiredRole = null) => async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({ error: "Not authenticated: token missing" });
        }

        // verify also checks expiry — unlike jwt.decode which does not
        const payload = jwt.verify(token, process.env.JWT_KEY);

        if (!payload._id) {
            return res.status(401).json({ error: "Invalid token" });
        }

        // Role guard (only active when requiredRole is passed)
        if (requiredRole && payload.role !== requiredRole) {
            return res.status(403).json({ error: "Forbidden: insufficient permissions" });
        }

        // Check token is not blocklisted (logged out)
        const isBlocked = await redisClient.exists(`token:${token}`);
        if (isBlocked) {
            return res.status(401).json({ error: "Token has been invalidated. Please log in again." });
        }

        // Confirm user still exists in DB
        const result = await User.findById(payload._id);
        if (!result) {
            return res.status(401).json({ error: "User not found" });
        }

        req.result = result;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Session expired. Please log in again." });
        }
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token" });
        }
        console.error("Auth middleware error:", err.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = createAuthMiddleware;