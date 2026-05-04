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

/**
 * Auto-generate wrapper code from starter code.
 * Parses the function name from JS/Java/C++ starter templates and builds
 * stdin → function → stdout wrappers so Judge0 can execute them.
 */
const generateWrapperCode = (starterCode) => {
    const wrappers = [];

    for (const sc of starterCode) {
        const lang = sc.language.toLowerCase();
        const code = sc.initialCode || '';

        if (lang === 'javascript' || lang === 'js') {
            // Match: var funcName = function(...)  OR  function funcName(...)
            const match = code.match(/(?:var|let|const)\s+(\w+)\s*=\s*function/) ||
                          code.match(/function\s+(\w+)\s*\(/);
            const funcName = match ? match[1] : 'solve';

            wrappers.push({
                language: 'javascript',
                code: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
let lines = [];
rl.on('line', l => lines.push(l));
rl.on('close', () => {
    const s = lines[0] || "";

    // USER_CODE_HERE

    console.log(${funcName}(s));
});`
            });
        }

        if (lang === 'java') {
            // Match: public TYPE funcName(
            const match = code.match(/public\s+\w+\s+(\w+)\s*\(/);
            const funcName = match ? match[1] : 'solve';
            // Detect return type for bool handling
            const retMatch = code.match(/public\s+(\w+)\s+\w+\s*\(/);
            const retType = retMatch ? retMatch[1] : 'int';

            wrappers.push({
                language: 'java',
                code: `import java.util.*;
import java.io.*;

// USER_CODE_HERE

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String s = br.readLine();
        if (s == null) s = "";
        Solution sol = new Solution();
        System.out.print(sol.${funcName}(s));
    }
}`
            });
        }

        if (lang === 'c++' || lang === 'cpp') {
            // Match: TYPE funcName(
            const match = code.match(/(?:int|bool|string|void|double|float|long)\s+(\w+)\s*\(/);
            const funcName = match ? match[1] : 'solve';
            const retMatch = code.match(/(int|bool|string|void|double|float|long)\s+\w+\s*\(/);
            const retType = retMatch ? retMatch[1] : 'int';

            const printExpr = retType === 'bool'
                ? `cout << (sol.${funcName}(s) ? "true" : "false");`
                : `cout << sol.${funcName}(s);`;

            wrappers.push({
                language: 'c++',
                code: `#include <iostream>
#include <string>
#include <unordered_map>
#include <algorithm>
#include <cctype>
using namespace std;

// USER_CODE_HERE

int main() {
    string s;
    getline(cin, s);
    Solution sol;
    ${printExpr}
    return 0;
}`
            });
        }
    }

    return wrappers;
};

// ─── Create Problem ──────────────────────────────────────────────────────────
const CreateProblem = async (req, res) => {
    try {
        const { referenceSolution, visibleTestCases, starterCode, wrapperCode } = req.body;

        await validateReferenceSolutions(referenceSolution, visibleTestCases);

        // Auto-generate wrapper code if not provided or empty
        let finalWrapperCode = wrapperCode;
        if (!finalWrapperCode || finalWrapperCode.length === 0) {
            finalWrapperCode = generateWrapperCode(starterCode || []);
            console.log(`Auto-generated wrapper code for ${finalWrapperCode.length} languages`);
        }

        const userProblem = await Problem.create({
            ...req.body,
            wrapperCode: finalWrapperCode,
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