const createAuthMiddleware = require("./authbase");

// Admin only — returns 403 if role !== 'admin'
const adminMiddleware = createAuthMiddleware('admin');

module.exports = adminMiddleware;