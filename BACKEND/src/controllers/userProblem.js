const Problem = require("../models/problem");
const Submission = require("../models/submission");
const User = require("../models/user");
const { getLanguageById, submitBatch, submitToken } = require("../utils/ProblemUtility");

/**
 * Validates all reference solutions against visible test cases using Judge0.
 * Throws if any solution fails any test case.
 */
const validateReferenceSolutions = async (referenceSolution, visibleTestCases) => {
    for (const { language, completeCode } of referenceSolution) {
        const languageId = getLanguageById(language);

        const submissions = visibleTestCases.map((testcase) => ({
            source_code: completeCode,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));

        const submitResult = await submitBatch(submissions);
        const tokens = submitResult.map((v) => v.token);
        const testResults = await submitToken(tokens);

        for (const test of testResults) {
            if (test.status_id !== 3) {
                throw new Error(
                    `Reference solution for "${language}" failed a test case. Status: ${test.status?.description}`
                );
            }
        }
    }
};

// ─── Create Problem ──────────────────────────────────────────────────────────
const CreateProblem = async (req, res) => {
    try {
        const { referenceSolution, visibleTestCases } = req.body;

        await validateReferenceSolutions(referenceSolution, visibleTestCases);

        const userProblem = await Problem.create({
            ...req.body,
            problemCreator: req.result._id
        });

        return res.status(201).json({
            message: "Problem created successfully",
            problem: userProblem
        });
    } catch (err) {
        console.error("CreateProblem error:", err.message);
        return res.status(400).json({ error: err.message });
    }
};

// ─── Update Problem ──────────────────────────────────────────────────────────
const updateProblem = async (req, res) => {
    const { id } = req.params;

    try {
        if (!id) {
            return res.status(400).json({ error: "Problem ID is required" });
        }

        const existing = await Problem.findById(id);
        if (!existing) {
            return res.status(404).json({ error: "Problem not found" });
        }

        const { referenceSolution, visibleTestCases } = req.body;
        await validateReferenceSolutions(referenceSolution, visibleTestCases);

        const updated = await Problem.findByIdAndUpdate(
            id,
            { ...req.body },
            { runValidators: true, new: true }
        );

        return res.status(200).json({ message: "Problem updated successfully", problem: updated });
    } catch (err) {
        console.error("UpdateProblem error:", err.message);
        return res.status(400).json({ error: err.message });
    }
};

// ─── Delete Problem ──────────────────────────────────────────────────────────
const deleteProblem = async (req, res) => {
    const { id } = req.params;

    try {
        if (!id) {
            return res.status(400).json({ error: "Problem ID is required" });
        }

        const deleted = await Problem.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ error: "Problem not found" });
        }

        return res.status(200).json({ message: "Problem deleted successfully" });
    } catch (err) {
        console.error("DeleteProblem error:", err.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// ─── Get Problem By ID ───────────────────────────────────────────────────────
const getProblemById = async (req, res) => {
    const { id } = req.params;

    try {
        if (!id) {
            return res.status(400).json({ error: "Problem ID is required" });
        }

        // starterCode (not startCode) — matches the schema field name
        const problem = await Problem.findById(id)
            .select('_id title description difficulty tags visibleTestCases starterCode referenceSolution');

        if (!problem) {
            return res.status(404).json({ error: "Problem not found" });
        }

        return res.status(200).json(problem);
    } catch (err) {
        console.error("GetProblemById error:", err.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// ─── Get All Problems ────────────────────────────────────────────────────────
const getAllProblem = async (req, res) => {
    try {
        const problems = await Problem.find({}).select('_id title difficulty tags');

        if (problems.length === 0) {
            return res.status(200).json({ message: "No problems found", problems: [] });
        }

        return res.status(200).json(problems);
    } catch (err) {
        console.error("GetAllProblem error:", err.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// ─── Solved Problems By User ─────────────────────────────────────────────────
const solvedProblemByUser = async (req, res) => {
    try {
        const userId = req.result._id;

        const user = await User.findById(userId).populate({
            path: "problemSolved",
            select: "_id title difficulty tags"
        });

        return res.status(200).json(user.problemSolved);
    } catch (err) {
        console.error("SolvedProblemByUser error:", err.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// ─── Submissions For A Problem By Current User ───────────────────────────────
const submittedProblem = async (req, res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.pid;

        const submissions = await Submission.find({ userId, problemId });

        if (submissions.length === 0) {
            return res.status(200).json({ message: "No submissions found", submissions: [] });
        }

        return res.status(200).json(submissions);  // single return — no double-response bug
    } catch (err) {
        console.error("SubmittedProblem error:", err.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    CreateProblem,
    updateProblem,
    deleteProblem,
    getProblemById,
    getAllProblem,
    solvedProblemByUser,
    submittedProblem
};