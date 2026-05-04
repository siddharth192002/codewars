const mongoose = require('mongoose');
const { Schema } = mongoose;

const problemSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },

    // Tags: enum removed to allow growth (tree, stack, trie, etc.)
    // Validate in controller if you need to restrict values
    tags: {
        type: [String],
        required: true
    },

    visibleTestCases: [
        {
            input: { type: String, required: true },
            output: { type: String, required: true },
            explanation: { type: String }
        }
    ],

    hiddenTestCases: [
        {
            input: { type: String, required: true },
            output: { type: String, required: true }
        }
    ],

    // starterCode — consistent name used everywhere (was startCode in controller — now fixed)
    starterCode: [
        {
            language: { type: String, required: true },
            initialCode: { type: String, required: true }
        }
    ],

    referenceSolution: [
        {
            language: { type: String, required: true },
            completeCode: { type: String, required: true }
        }
    ],

    wrapperCode: [
        {
            language: { type: String, required: true },
            code: { type: String, required: true }
        }
    ],

    problemCreator: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
}, { timestamps: true });

const Problem = mongoose.model('problem', problemSchema);
module.exports = Problem;
