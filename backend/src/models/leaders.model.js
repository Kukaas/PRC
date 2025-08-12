import mongoose from "mongoose";

const { Schema } = mongoose;

const AddressSchema = new Schema(
  {
    houseNumber: { type: String, trim: true },
    streetBlockLot: { type: String, trim: true },
    districtBarangayVillage: { type: String, required: true, trim: true },
    municipalityCity: { type: String, required: true, trim: true },
    province: { type: String, required: true, trim: true },
    zipcode: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const LeaderSchema = new Schema(
  {
    lastName: { type: String, required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true },
    dateOfBirth: { type: Date, required: true },
    age: { type: Number },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    photo: { type: String }, // base64 string
    sex: { type: String, enum: ["male", "female"], required: true },
    address: { type: AddressSchema, required: true },
    // audit
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

function calculateAgeFromDOB(dateOfBirth) {
  if (!dateOfBirth) return undefined;
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

LeaderSchema.pre("save", function preSave(next) {
  if (this.isModified("dateOfBirth") || this.isNew) {
    this.age = calculateAgeFromDOB(this.dateOfBirth);
  }
  next();
});

LeaderSchema.pre("findOneAndUpdate", function preF1U(next) {
  const update = this.getUpdate() || {};
  if (update.dateOfBirth || (update.$set && update.$set.dateOfBirth)) {
    const newDob = update.dateOfBirth || (update.$set && update.$set.dateOfBirth);
    const newAge = calculateAgeFromDOB(newDob);
    if (update.$set) {
      update.$set.age = newAge;
    } else {
      update.age = newAge;
    }
    this.setUpdate(update);
  }
  next();
});

LeaderSchema.virtual("fullName").get(function getFullName() {
  return [this.firstName, this.middleName, this.lastName].filter(Boolean).join(" ");
});

LeaderSchema.index({ lastName: 1, firstName: 1 });

const Leader = mongoose.models.Leader || mongoose.model("Leader", LeaderSchema);
export default Leader;


