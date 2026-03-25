const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const submissionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    problemId: {
        type: Schema.Types.ObjectId,
        ref: 'problem',
        required: true
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true,
        enum: ['javascript', 'c++', 'java']
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'wrong', 'error'],
        default: 'pending'
    },
    runtime: {
        type: Number, // seconds (Judge0 returns seconds)
        default: 0
    },
    memory: {
        type: Number, // KB
        default: 0
    },
    errorMessage: {
        type: String,
        default: null
    },
    // Fixed typo: testCasesPassesd → testCasesPassed
    testCasesPassed: {
        type: Number,
        default: 0
    },
    testCasesTotal: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Compound indexes for common query patterns
submissionSchema.index({ userId: 1, problemId: 1 });                    // base lookup
submissionSchema.index({ userId: 1, problemId: 1, createdAt: -1 });     // fixed: was {userId, problem} — problem field doesn't exist
submissionSchema.index({ userId: 1, createdAt: -1 });                   // all submissions by user, newest first
submissionSchema.index({ problemId: 1, status: 1 });                    // problem statistics

const Submission = mongoose.model('submission', submissionSchema);
module.exports = Submission;