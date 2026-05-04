const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

const main = require('./config/db');
const redisClient = require('./config/redis');
const authRouter = require("./routes/userAuth");
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit");

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(helmet());  // sets secure HTTP headers (XSS, HSTS, no-sniff, etc.)
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        return callback(null, true); // Allow all origins for dev
    },
    credentials: true
}));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/user', authRouter);
app.use('/problem', problemRouter);
app.use('/submission', submitRouter);

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Catches any error passed via next(err) or thrown inside async route handlers
// that weren't caught locally. Prevents stack traces leaking to the client.
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.stack || err.message);
    res.status(500).json({ error: "Internal server error" });
});

// ─── Startup ──────────────────────────────────────────────────────────────────
const InitializeConnection = async () => {
    try {
        // Connect DB and Redis in parallel — server only starts if both succeed
        await Promise.all([main(), redisClient.connect()]);
        console.log("MongoDB and Redis connected");

        app.listen(process.env.PORT, () => {
            console.log(`Server listening on port ${process.env.PORT}`);
        });
    } catch (err) {
        console.error("Startup failed:", err.message);
        process.exit(1);
    }
};

InitializeConnection();

// main()
//   .then(() => {
//     app.listen(process.env.PORT, () => {
//       console.log("Server listening at port number: " + process.env.PORT);
//     });
//   })
//   .catch(err => console.log("Error occurred: " + err));