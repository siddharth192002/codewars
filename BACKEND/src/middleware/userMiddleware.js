const createAuthMiddleware = require("./authbase");

// Any logged-in user — no role restriction
const userMiddleware = createAuthMiddleware();

module.exports = userMiddleware;