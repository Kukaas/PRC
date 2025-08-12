import Leader from "../models/leaders.model.js";
import User from "../models/user.model.js";
import { sendLeaderNotificationEmail } from "../services/email.service.js";
import { sendWhatsAppText } from "../services/sms.service.js";
import { ENV } from "../connections/env.js";

// Create a leader
export const createLeader = async (req, res) => {
  try {
    const adminId = req.user?.userId;
    const payload = req.body || {};

    const leaderDoc = await Leader.create({
      lastName: payload.lastName,
      firstName: payload.firstName,
      middleName: payload.middleName,
      dateOfBirth: payload.dateOfBirth,
      email: payload.email,
      contactNumber: payload.contactNumber,
      photo: payload.photo,
      sex: payload.sex,
      address: payload.address,
      createdBy: adminId,
      updatedBy: adminId,
    });

    return res.status(201).json({ success: true, data: leaderDoc });
  } catch (error) {
    console.error("Create leader error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Get all leaders with pagination and search
export const getLeaders = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = {};
    if (search) {
      query.$or = [
        { lastName: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      Leader.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Leader.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: items,
      pagination: {
        currentPage: Number(page),
        itemsPerPage: Number(limit),
        totalItems: total,
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    });
  } catch (error) {
    console.error("Get leaders error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

export const getLeaderById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Leader.findById(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: "Leader not found" });
    }
    return res.status(200).json({ success: true, data: doc });
  } catch (error) {
    console.error("Get leader error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

export const updateLeader = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.userId;
    const payload = { ...req.body, updatedBy: adminId };

    const updated = await Leader.findOneAndUpdate({ _id: id }, payload, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Leader not found" });
    }
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Update leader error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

export const deleteLeader = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Leader.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Leader not found" });
    }
    return res.status(200).json({ success: true, message: "Leader deleted" });
  } catch (error) {
    console.error("Delete leader error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Notify a single leader via Email and WhatsApp
export const notifyLeader = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const leader = await Leader.findById(id);
    if (!leader) {
      return res.status(404).json({ success: false, message: "Leader not found" });
    }

    // Fetch admin/sender name
    let senderName = "PRC Admin";
    try {
      const admin = await User.findById(req.user?.userId).select("givenName familyName");
      if (admin) senderName = `${admin.givenName} ${admin.familyName}`.trim();
    } catch {}

    const leaderName = `${leader.firstName} ${leader.lastName}`.trim();
    const composedText = `Dear ${leaderName}\n\n${message}\n\nBest regards,\n${senderName}`;

    // Email
    let emailOk = false;
    try {
      emailOk = await sendLeaderNotificationEmail({
        toEmail: leader.email,
        leaderName,
        messageBody: message,
        senderName,
      });
    } catch (e) {
      console.error("Leader email notify error:", e);
    }

    // WhatsApp (best-effort; requires Twilio sandbox/number and opt-in)
    let whatsappOk = false;
    try {
      if (ENV.TWILIO_ACCOUNT_SID && ENV.TWILIO_AUTH_TOKEN) {
        const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM || "+14155238886";
        whatsappOk = await sendWhatsAppText({
          toPhoneNumber: leader.contactNumber,
          body: composedText,
          accountSid: ENV.TWILIO_ACCOUNT_SID,
          authToken: ENV.TWILIO_AUTH_TOKEN,
          whatsappFrom,
        });
      }
    } catch (e) {
      console.error("Leader WhatsApp notify error:", e);
    }

    return res.status(200).json({
      success: true,
      message: "Notification processed",
      channels: { email: emailOk, whatsapp: whatsappOk },
    });
  } catch (error) {
    console.error("Notify leader error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Bulk notify leaders
export const bulkNotifyLeaders = async (req, res) => {
  try {
    const { leaderIds = [], message } = req.body;
    if (!Array.isArray(leaderIds) || leaderIds.length === 0) {
      return res.status(400).json({ success: false, message: "leaderIds must be a non-empty array" });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    let senderName = "PRC Admin";
    try {
      const admin = await User.findById(req.user?.userId).select("givenName familyName");
      if (admin) senderName = `${admin.givenName} ${admin.familyName}`.trim();
    } catch {}

    const results = { success: [], failed: [] };

    for (const id of leaderIds) {
      try {
        const leader = await Leader.findById(id);
        if (!leader) {
          results.failed.push({ id, reason: "Leader not found" });
          continue;
        }

        const leaderName = `${leader.firstName} ${leader.lastName}`.trim();
        const composedText = `Dear ${leaderName}\n\n${message}\n\nBest regards,\n${senderName}`;

        const emailOk = await sendLeaderNotificationEmail({
          toEmail: leader.email,
          leaderName,
          messageBody: message,
          senderName,
        });
        if (!emailOk) {
          results.failed.push({ id, reason: "Email failed" });
          continue;
        }

        try {
          if (ENV.TWILIO_ACCOUNT_SID && ENV.TWILIO_AUTH_TOKEN) {
            const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM || "+14155238886";
            sendWhatsAppText({
              toPhoneNumber: leader.contactNumber,
              body: composedText,
              accountSid: ENV.TWILIO_ACCOUNT_SID,
              authToken: ENV.TWILIO_AUTH_TOKEN,
              whatsappFrom,
            }).catch(() => {});
          }
        } catch {}

        results.success.push({ id });
      } catch (err) {
        console.error("Bulk notify leader error:", err);
        results.failed.push({ id, reason: "Unexpected error" });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Bulk leader notifications processed",
      summary: { total: leaderIds.length, success: results.success.length, failed: results.failed.length },
      results,
    });
  } catch (error) {
    console.error("Bulk notify leaders error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};


