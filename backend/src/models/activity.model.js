import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    // Basic activity information
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },

    // Date and time
    date: {
      type: Date,
      required: true,
    },
    timeFrom: {
      type: String,
      required: true,
      trim: true,
    },
    timeTo: {
      type: String,
      required: true,
      trim: true,
    },

    // Location
    location: {
      exactLocation: {
        type: String,
        trim: true,
      },
      barangay: {
        type: String,
        required: true,
        trim: true,
      },
      municipality: {
        type: String,
        required: true,
        trim: true,
      },
      province: {
        type: String,
        required: true,
        trim: true,
      },
    },

    // Required skills and services
    requiredSkills: {
      type: [String],
      required: true,
      enum: [
        "Strong Communication skills",
        "First Aid and CPR/BLS Certification",
        "Swimming and Lifesaving Skills",
        "Fire Safety Knowledge",
        "Disaster Preparedness Training",
        "Public Speaking and Teaching Skills",
        "Physical Fitness",
        "Leadership and Organizing",
        "First Aid and Disaster Preparedness",
        "Communication and Advocacy",
        "Creativity and Event Planning"
      ],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: 'At least one skill is required'
      }
    },

    requiredServices: {
      type: [String],
      required: true,
      enum: [
        "Welfare Services",
        "Safety Services",
        "Health Services",
        "Youth Services",
        "Blood Services",
        "Wash Services",
      ],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: 'At least one service type is required'
      }
    },

    // Activity status and management
    status: {
      type: String,
      enum: ["draft", "published", "ongoing", "completed", "cancelled"],
      default: "published",
    },

    // Capacity and participants
    maxParticipants: {
      type: Number,
      min: 1,
      default: 50,
    },
    currentParticipants: {
      type: Number,
      default: 0,
    },

    // Created by (admin/staff)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Participants who joined
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["registered", "attended", "absent"],
          default: "registered",
        },
        timeIn: {
          type: Date,
          default: null,
        },
        timeOut: {
          type: Date,
          default: null,
        },
        totalHours: {
          type: Number,
          default: 0,
        },
      },
    ],

    // Additional fields
    isUrgent: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    notes: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for better query performance
activitySchema.index({ date: 1, status: 1 });
activitySchema.index({ location: 1 });
activitySchema.index({ requiredSkills: 1 });
activitySchema.index({ requiredServices: 1 });

// Virtual for checking if activity is full
activitySchema.virtual('isFull').get(function () {
  return this.currentParticipants >= this.maxParticipants;
});

// Virtual for checking if activity is in the past
activitySchema.virtual('isPast').get(function () {
  return new Date() > this.date;
});

// Virtual for checking if activity is today
activitySchema.virtual('isToday').get(function () {
  const today = new Date();
  const activityDate = new Date(this.date);
  return today.toDateString() === activityDate.toDateString();
});

// Virtual for getting the activity date in Philippines timezone
activitySchema.virtual('philippinesDate').get(function () {
  // Convert UTC date to Philippines timezone (UTC+8)
  return new Date(this.date.getTime() + (8 * 60 * 60 * 1000));
});

// Method to add participant
activitySchema.methods.addParticipant = function (userId) {
  if (this.currentParticipants >= this.maxParticipants) {
    throw new Error('Activity is already full');
  }

  if (this.participants.some(p => p.userId.toString() === userId.toString())) {
    throw new Error('User is already registered for this activity');
  }

  this.participants.push({ userId });
  this.currentParticipants += 1;
  return this.save();
};

// Method to remove participant
activitySchema.methods.removeParticipant = function (userId) {
  const participantIndex = this.participants.findIndex(
    p => p.userId.toString() === userId.toString()
  );

  if (participantIndex === -1) {
    throw new Error('User is not registered for this activity');
  }

  this.participants.splice(participantIndex, 1);
  this.currentParticipants = Math.max(0, this.currentParticipants - 1);
  return this.save();
};

// Method to update participant status
activitySchema.methods.updateParticipantStatus = function (userId, status) {
  const participant = this.participants.find(
    p => p.userId.toString() === userId.toString()
  );

  if (!participant) {
    throw new Error('User is not registered for this activity');
  }

  participant.status = status;
  return this.save();
};

// Method to record time in for a participant
activitySchema.methods.recordTimeIn = function (userId, customTime = null) {
  const participant = this.participants.find(
    p => p.userId.toString() === userId.toString()
  );

  if (!participant) {
    throw new Error('User is not registered for this activity');
  }

  if (participant.timeIn) {
    throw new Error('Time in already recorded for this participant');
  }

  // Use custom time if provided, otherwise use current time
  if (customTime) {
    participant.timeIn = new Date(customTime);
  } else {
    // Store current time as-is
    participant.timeIn = new Date();
  }
  participant.status = 'attended';
  return this.save();
};

// Method to record time out for a participant
activitySchema.methods.recordTimeOut = function (userId, customTime = null) {
  const participant = this.participants.find(
    p => p.userId.toString() === userId.toString()
  );

  if (!participant) {
    throw new Error('User is not registered for this activity');
  }

  if (!participant.timeIn) {
    throw new Error('Time in must be recorded before time out');
  }

  if (participant.timeOut) {
    throw new Error('Time out already recorded for this participant');
  }

  // Use custom time if provided, otherwise use current time
  if (customTime) {
    participant.timeOut = new Date(customTime);
  } else {
    // Store current time as-is
    participant.timeOut = new Date();
  }

  // Calculate total hours
  const timeIn = new Date(participant.timeIn);
  const timeOut = new Date(participant.timeOut);
  const diffMs = timeOut - timeIn;
  const diffHours = diffMs / (1000 * 60 * 60);
  participant.totalHours = Math.round(diffHours * 100) / 100; // Round to 2 decimal places

  return this.save();
};

// Method to get participant's time tracking info
activitySchema.methods.getParticipantTimeInfo = function (userId) {
  const participant = this.participants.find(
    p => p.userId.toString() === userId.toString()
  );

  if (!participant) {
    throw new Error('User is not registered for this activity');
  }

  return {
    timeIn: participant.timeIn,
    timeOut: participant.timeOut,
    totalHours: participant.totalHours,
    status: participant.status
  };
};

// Method to finalize attendance when event is completed
activitySchema.methods.finalizeAttendance = function () {
  // Compute event end time in Philippines timezone
  // Convert stored UTC date to Philippines timezone
  const activityDate = new Date(this.date.getTime() + (8 * 60 * 60 * 1000));
  const eventEnd = new Date(activityDate);
  if (this.timeTo) {
    const [h, m] = String(this.timeTo).split(':').map(Number);
    if (!Number.isNaN(h)) {
      eventEnd.setHours(h, Number.isNaN(m) ? 0 : m, 0, 0);

      // Handle case where end time is on the next day (e.g., 4:00 AM)
      const [startH] = String(this.timeFrom).split(':').map(Number);
      if (h < startH) {
        eventEnd.setDate(eventEnd.getDate() + 1);
      }
    }
  } else {
    eventEnd.setHours(23, 59, 59, 999);
  }

  this.participants.forEach(participant => {
    // If no timeIn and no timeOut, mark as absent
    if (!participant.timeIn && !participant.timeOut) {
      participant.status = 'absent';
    }
    // If timeIn exists but no timeOut, set timeOut to event end time
    else if (participant.timeIn && !participant.timeOut) {
      participant.timeOut = eventEnd;
      // Calculate total hours
      const timeIn = new Date(participant.timeIn);
      const timeOut = new Date(participant.timeOut);
      const diffMs = timeOut - timeIn;
      const diffHours = diffMs / (1000 * 60 * 60);
      participant.totalHours = Math.round(diffHours * 100) / 100;
      participant.status = 'attended'; // still attended
    }
  });
  return this.save();
};

// Utility function to get current time in Philippines timezone
activitySchema.statics.getPhilippinesTime = function () {
  const now = new Date();
  return new Date(now.getTime() + (8 * 60 * 60 * 1000));
};

// Utility function to create a date with specific time in Philippines timezone
activitySchema.statics.createPhilippinesDateTime = function (date, timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  // Convert stored UTC date to Philippines timezone
  const activityDate = new Date(date.getTime() + (8 * 60 * 60 * 1000));
  const dateTime = new Date(activityDate);
  dateTime.setHours(hours, minutes, 0, 0);
  return dateTime;
};

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;
