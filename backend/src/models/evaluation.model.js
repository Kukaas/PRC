import mongoose from "mongoose";

const evaluationSchema = new mongoose.Schema(
    {
        activityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Activity",
            required: true,
        },
        volunteerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        evaluatorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        ratings: {
            punctuality: {
                type: Number,
                min: 1,
                max: 5,
                required: true,
            },
            engagement: {
                type: Number,
                min: 1,
                max: 5,
                required: true,
            },
            teamwork: {
                type: Number,
                min: 1,
                max: 5,
                required: true,
            },
            skillsApplied: {
                type: Number,
                min: 1,
                max: 5,
                required: true,
            },
        },
        comments: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate evaluations for the same volunteer in the same activity
evaluationSchema.index({ activityId: 1, volunteerId: 1 }, { unique: true });

const Evaluation = mongoose.model("Evaluation", evaluationSchema);

export default Evaluation;
