const Problem = require("../models/problem");
const Submission = require("../models/submission");
const { getLanguageById, submitBatch, submitToken } = require("../utils/ProblemUtility");
 
/**
 * Normalise language name from frontend to what Judge0 / schema expects.
 * Frontend may send 'cpp'; Judge0 needs 'c++'; schema accepts 'c++'.
 */
const normaliseLanguage = (lang) => {
    if (lang === 'cpp') return 'c++';
    return lang;
};
 
/**
 * Shared result evaluation — same logic used by both submit and run.
 * Returns { status, testCasesPassed, runtime, memory, errorMessage }
 */
const evaluateResults = (testResults) => {
    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = 'accepted';
    let errorMessage = null;
 
    for (const test of testResults) {
        if (test.status_id === 3) {
            testCasesPassed++;
            runtime += parseFloat(test.time || 0);
            memory = Math.max(memory, test.memory || 0);
        } else {
            // 4 = Runtime Error, anything else = Wrong Answer / other
            status = test.status_id === 4 ? 'error' : 'wrong';
            errorMessage = test.stderr || test.compile_output || null;
        }
    }
 
    return { status, testCasesPassed, runtime, memory, errorMessage };
};
 
// ─── Submit Code (runs against hidden test cases, saves to DB) ───────────────
const submitCode = async (req, res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.id;
        let { code, language } = req.body;
 
        if (!code || !language) {
            return res.status(400).json({ error: "code and language are required" });
        }
 
        language = normaliseLanguage(language);
 
        const problem = await Problem.findById(problemId);
        if (!problem) return res.status(404).json({ error: "Problem not found" });
 
        const languageId = getLanguageById(language);
 
        // Save a pending submission immediately so we have a record even if Judge0 is slow
        const submission = await Submission.create({
            userId,
            problemId,
            code,
            language,
            testCasesPassed: 0,
            status: 'pending',
            testCasesTotal: problem.hiddenTestCases.length
        });
 
        const submissions = problem.hiddenTestCases.map((tc) => ({
            source_code: code,
            language_id: languageId,
            stdin: tc.input,
            expected_output: tc.output
        }));
 
        const submitResult = await submitBatch(submissions);
        const tokens = submitResult.map((v) => v.token);
        const testResults = await submitToken(tokens);
 
        const { status, testCasesPassed, runtime, memory, errorMessage } = evaluateResults(testResults);
 
        // Update submission record
        submission.status = status;
        submission.testCasesPassed = testCasesPassed;
        submission.errorMessage = errorMessage;
        submission.runtime = runtime;
        submission.memory = memory;
        await submission.save();
 
        // Only mark problem as solved if ALL test cases passed
        if (status === 'accepted' && !req.result.problemSolved.includes(problemId)) {
            req.result.problemSolved.push(problemId);
            await req.result.save();
        }
 
        return res.status(201).json({
            accepted: status === 'accepted',
            totalTestCases: submission.testCasesTotal,
            passedTestCases: testCasesPassed,
            runtime,
            memory,
            errorMessage
        });
    } catch (err) {
        console.error("SubmitCode error:", err.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};
 
// ─── Run Code (runs against visible test cases only, does not save to DB) ─────
const runCode = async (req, res) => {
    try {
        const problemId = req.params.id;
        let { code, language } = req.body;
 
        if (!code || !language) {
            return res.status(400).json({ error: "code and language are required" });
        }
 
        // Same normalisation as submitCode — fixed missing cpp→c++ conversion
        language = normaliseLanguage(language);
 
        const problem = await Problem.findById(problemId);
        if (!problem) return res.status(404).json({ error: "Problem not found" });
 
        const languageId = getLanguageById(language);
 
        const submissions = problem.visibleTestCases.map((tc) => ({
            source_code: code,
            language_id: languageId,
            stdin: tc.input,
            expected_output: tc.output
        }));
 
        const submitResult = await submitBatch(submissions);
        const tokens = submitResult.map((v) => v.token);
        const testResults = await submitToken(tokens);
 
        const { status, testCasesPassed, runtime, memory, errorMessage } = evaluateResults(testResults);
 
        return res.status(200).json({
            success: status === 'accepted',
            status,
            testCases: testResults,
            testCasesPassed,
            totalTestCases: problem.visibleTestCases.length,
            runtime,
            memory,
            errorMessage
        });
    } catch (err) {
        console.error("RunCode error:", err.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};
 
module.exports = { submitCode, runCode };
