const redisClient = require("../config/redis");
const User = require("../models/user");
const validateRegistration = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const COOKIE_OPTIONS = {
    httpOnly: true,   // not accessible via JS — blocks XSS token theft
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours in ms
};

const createToken = (user) => jwt.sign(
    { _id: user._id, emailId: user.emailId, role: user.role },
    process.env.JWT_KEY,
    { expiresIn: '24h' }
);

const safeUserReply = (user) => ({
    firstName: user.firstName,
    emailId: user.emailId,
    _id: user._id,
    role: user.role
});

// ─── Register (regular user) ────────────────────────────────────────────────
const register = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: "Request body is missing" });
        }

        validateRegistration(req.body);

        const { firstName, emailId, password } = req.body;

        const existingUser = await User.findOne({ emailId });
        if (existingUser) {
            return res.status(409).json({ error: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            ...req.body,
            password: hashedPassword,
            role: 'user'
        });

        const token = createToken(user);
        res.cookie('token', token, COOKIE_OPTIONS);

        return res.status(201).json({
            user: safeUserReply(user),
            message: "Registered successfully"
        });
    } catch (err) {
        console.error("Register error:", err.message);
        return res.status(400).json({ error: err.message });
    }
};

// ─── Login ───────────────────────────────────────────────────────────────────
const login = async (req, res) => {
    try {
        const { emailId, password } = req.body;

        if (!emailId || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await User.findOne({ emailId });

        // Check user exists before comparing — avoids TypeError crash
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = createToken(user);
        res.cookie('token', token, COOKIE_OPTIONS);

        return res.status(200).json({
            user: safeUserReply(user),
            message: "Logged in successfully"
        });
    } catch (err) {
        console.error("Login error:", err.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// ─── Logout ──────────────────────────────────────────────────────────────────
const logout = async (req, res) => {
    try {
        const { token } = req.cookies;

        // Use verify (not decode) so tampered tokens are rejected
        const payload = jwt.verify(token, process.env.JWT_KEY);

        // Blocklist token in Redis until its natural expiry
        await redisClient.set(`token:${token}`, 'blocked');
        await redisClient.expireAt(`token:${token}`, payload.exp);

        res.cookie("token", "", { expires: new Date(0), httpOnly: true });
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
        console.error("Logout error:", err.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// ─── Admin Register (existing admin only — guarded by adminMiddleware) ────────
const adminRegister = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: "Request body is missing" });
        }

        validateRegistration(req.body);

        const { emailId, password } = req.body;

        const existingUser = await User.findOne({ emailId });
        if (existingUser) {
            return res.status(409).json({ error: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            ...req.body,
            password: hashedPassword,
            role: 'admin'  // explicitly set — do not rely on req.body.role
        });

        const token = createToken(user);
        res.cookie('token', token, COOKIE_OPTIONS);

        return res.status(201).json({
            user: safeUserReply(user),
            message: "Admin registered successfully"
        });
    } catch (err) {
        console.error("AdminRegister error:", err.message);
        return res.status(400).json({ error: err.message });
    }
};

// ─── Delete Profile ──────────────────────────────────────────────────────────
const deleteProfile = async (req, res) => {
    try {
        const userId = req.result._id;

        // findByIdAndDelete triggers the post('findOneAndDelete') hook in user.js
        // which cascades to delete all submissions for this user
        const deleted = await User.findByIdAndDelete(userId);
        if (!deleted) {
            return res.status(404).json({ error: "User not found" });
        }

        res.cookie("token", "", { expires: new Date(0), httpOnly: true });
        return res.status(200).json({ message: "Profile deleted successfully" });
    } catch (err) {
        console.error("DeleteProfile error:", err.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// ─── Check (verify current session) ─────────────────────────────────────────
const check = async (req, res) => {
    try {
        return res.status(200).json({
            user: safeUserReply(req.result),
            message: "Valid user"
        });
    } catch (err) {
        console.error("Check error:", err.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { register, login, logout, adminRegister, deleteProfile, check };