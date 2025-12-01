import Evaluation from "../models/evaluation.model.js";
import Activity from "../models/activity.model.js";

// Create a new evaluation
export const createEvaluation = async (req, res) => {
    try {
        const { activityId, volunteerId, ratings, comments } = req.body;
        const evaluatorId = req.user.userId;

        // Check if activity exists
        const activity = await Activity.findById(activityId);
        if (!activity) {
            return res.status(404).json({ message: "Activity not found" });
        }

        // Check if volunteer participated in the activity
        const participant = activity.participants.find(
            (p) => p.userId.toString() === volunteerId
        );

        if (!participant) {
            return res.status(400).json({ message: "Volunteer did not participate in this activity" });
        }

        // Check if evaluation already exists
        const existingEvaluation = await Evaluation.findOne({ activityId, volunteerId });
        if (existingEvaluation) {
            return res.status(400).json({ message: "Evaluation already exists for this volunteer in this activity" });
        }

        const evaluation = new Evaluation({
            activityId,
            volunteerId,
            evaluatorId,
            ratings,
            comments,
        });

        await evaluation.save();

        res.status(201).json({ message: "Evaluation submitted successfully", data: evaluation });
    } catch (error) {
        console.error("Error creating evaluation:", error);
        res.status(500).json({ message: "Failed to create evaluation", error: error.message });
    }
};

// Get evaluations for a specific activity
export const getEvaluationsByActivity = async (req, res) => {
    try {
        const { activityId } = req.params;

        const evaluations = await Evaluation.find({ activityId })
            .populate("volunteerId", "givenName familyName email photo")
            .populate("evaluatorId", "givenName familyName");

        res.status(200).json({ data: evaluations });
    } catch (error) {
        console.error("Error fetching evaluations:", error);
        res.status(500).json({ message: "Failed to fetch evaluations", error: error.message });
    }
};

// Get evaluations for a specific volunteer
export const getEvaluationsByVolunteer = async (req, res) => {
    try {
        const { volunteerId } = req.params;

        const evaluations = await Evaluation.find({ volunteerId })
            .populate("activityId", "title date")
            .populate("evaluatorId", "givenName familyName");

        res.status(200).json({ data: evaluations });
    } catch (error) {
        console.error("Error fetching volunteer evaluations:", error);
        res.status(500).json({ message: "Failed to fetch evaluations", error: error.message });
    }
};
