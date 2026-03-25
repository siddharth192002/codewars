const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 20
        },
        lastName: {
            type: String,
            minlength: 3,
            maxlength: 20
        },
        emailId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            immutable: true
        },
        age: {
            type: Number,
            min: 6,
            max: 80
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },
        problemSolved: {
            // Removed unique:true — it has no effect on array fields
            // Deduplication is handled in userSubmission.js via .includes() check
            type: [{
                type: Schema.Types.ObjectId,
                ref: 'problem'
            }]
        },
        password: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

/**
 * Cascade delete: when a user is deleted via findByIdAndDelete (which calls findOneAndDelete),
 * automatically remove all their submissions.
 * NOTE: this hook does NOT fire for deleteOne() or deleteMany() — always use findByIdAndDelete.
 */
userSchema.post('findOneAndDelete', async function (userInfo) {
    if (userInfo) {
        await mongoose.model('submission').deleteMany({ userId: userInfo._id });
    }
});

const User = mongoose.model("user", userSchema);
module.exports = User;