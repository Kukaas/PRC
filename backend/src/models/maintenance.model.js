import mongoose from "mongoose";

const skillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
});

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
});

// Pre-save middleware to update timestamps
skillSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

serviceSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

// Static methods for Skill
skillSchema.statics.getActiveSkills = function () {
    return this.find({ isActive: true }).sort({ name: 1 });
};

skillSchema.statics.getAllSkills = function () {
    return this.find().sort({ name: 1 });
};

// Static methods for Service
serviceSchema.statics.getActiveServices = function () {
    return this.find({ isActive: true }).sort({ name: 1 });
};

serviceSchema.statics.getAllServices = function () {
    return this.find().sort({ name: 1 });
};

const Skill = mongoose.model("Skill", skillSchema);
const Service = mongoose.model("Service", serviceSchema);

export { Skill, Service };
