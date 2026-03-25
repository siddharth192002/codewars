const axios = require("axios");

/**
 * Get Judge0 language ID from a human-readable name.
 */
const getLanguageById = (lang) => {
    const language = {
        "c++": 54,
        java: 62,
        javascript: 63,
    };

    const id = language[lang.toLowerCase()];
    if (!id) {
        throw new Error(`Unsupported language: ${lang}`);
    }
    return id;
};

/**
 * Submit a batch of code submissions to Judge0.
 * Returns an array of { token } objects.
 */
const submitBatch = async (submissions) => {
    if (!process.env.RAPIDAPI_KEY) {
        throw new Error("RAPIDAPI_KEY is not set in environment variables.");
    }

    const options = {
        method: "POST",
        url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
        params: { base64_encoded: "false" },
        headers: {
            "x-rapidapi-key": process.env.RAPIDAPI_KEY,
            "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
            "Content-Type": "application/json",
        },
        data: { submissions },
    };

    try {
        const response = await axios.request(options);
        return response.data; // array of { token }
    } catch (error) {
        const status = error.response?.status;
        const detail = error.response?.data || error.message;
        console.error("Judge0 submitBatch error:", status, detail);
        throw new Error(`Judge0 batch submission failed (${status}): ${JSON.stringify(detail)}`);
    }
};

/**
 * Simple async wait helper.
 */
const waiting = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Poll Judge0 until all tokens finish (status_id > 2), or timeout.
 * Uses mild exponential backoff: 1s, 1.5s, 2s, 2s, 2s ...
 */
const submitToken = async (resultTokens) => {
    if (!Array.isArray(resultTokens) || resultTokens.length === 0) {
        throw new Error("submitToken expects a non-empty array of tokens");
    }

    const options = {
        method: "GET",
        url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
        params: {
            tokens: resultTokens.join(","),
            base64_encoded: "false",
            fields: "*",
        },
        headers: {
            "x-rapidapi-key": process.env.RAPIDAPI_KEY,
            "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
        },
    };

    const maxAttempts = 30;
    let delay = 1000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        let result;
        try {
            const response = await axios.request(options);
            result = response.data;
        } catch (error) {
            const status = error.response?.status;
            const detail = error.response?.data || error.message;
            console.error("Judge0 polling error:", status, detail);
            throw new Error(`Judge0 polling failed (${status}): ${JSON.stringify(detail)}`);
        }

        const allDone = result.submissions.every((r) => r.status_id > 2);
        if (allDone) {
            return result.submissions;
        }

        await waiting(delay);
        // Backoff: 1s → 1.5s → 2s (cap)
        delay = Math.min(delay * 1.5, 2000);
    }

    throw new Error("Timeout: submissions did not complete within the expected time.");
};

module.exports = { getLanguageById, submitBatch, submitToken };