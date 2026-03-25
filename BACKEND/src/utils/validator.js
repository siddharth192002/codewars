const validator = require("validator");

// Used only for registration — requires firstName, emailId, password
const validateRegistration = (data) => {
    const mandatoryFields = ['firstName', 'emailId', 'password'];

    const allPresent = mandatoryFields.every((k) => Object.keys(data).includes(k));
    if (!allPresent) {
        throw new Error("Required field missing (firstName, emailId, password)");
    }

    if (!validator.isEmail(data.emailId)) {
        throw new Error("Invalid email address");
    }

    // bcrypt silently truncates passwords beyond 72 bytes — reject early
    if (data.password.length > 72) {
        throw new Error("Password must be 72 characters or fewer");
    }

    if (!validator.isStrongPassword(data.password)) {
        throw new Error("Weak password: must include uppercase, lowercase, number, and symbol");
    }
};

module.exports = validateRegistration;