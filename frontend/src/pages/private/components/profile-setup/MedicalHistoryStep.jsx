import React from "react";
import CustomInput from "../../../../components/CustomInput";

const MedicalHistoryStep = ({ formData, handleChange, errors }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        Medical History
      </h3>

      <CustomInput
        label="Blood Type"
        name="bloodType"
        type="select"
        value={formData.bloodType}
        onChange={handleChange}
        required
        error={errors.bloodType}
      >
        <option value="">Select blood type</option>
        <option value="A-">A-</option>
        <option value="A+">A+</option>
        <option value="AB-">AB-</option>
        <option value="AB+">AB+</option>
        <option value="B-">B-</option>
        <option value="B+">B+</option>
        <option value="O-">O-</option>
        <option value="O+">O+</option>
        <option value="Not Applicable">Not Applicable</option>
      </CustomInput>

      <CustomInput
        label="Pre-existing Medical or Health Conditions/Disabilities/Allergies"
        name="preExistingConditions"
        type="textarea"
        placeholder="Enter any pre-existing medical conditions, disabilities, or allergies (if none, enter 'None')"
        value={formData.preExistingConditions}
        onChange={handleChange}
        error={errors.preExistingConditions}
      />

      <CustomInput
        label="Current Medications"
        name="currentMedications"
        type="textarea"
        placeholder="Enter any current medications you are taking (if none, enter 'None')"
        value={formData.currentMedications}
        onChange={handleChange}
        error={errors.currentMedications}
      />

      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">
          Emergency Contact (Immediate Family)
        </h4>
        <CustomInput
          label="Name"
          name="emergencyContact.immediateFamily.name"
          type="text"
          placeholder="Enter emergency contact name"
          value={formData.emergencyContact.immediateFamily.name}
          onChange={handleChange}
          required
          error={errors["emergencyContact.immediateFamily.name"]}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CustomInput
            label="Relationship to you"
            name="emergencyContact.immediateFamily.relationship"
            type="text"
            placeholder="Enter relationship"
            value={formData.emergencyContact.immediateFamily.relationship}
            onChange={handleChange}
            required
            error={errors["emergencyContact.immediateFamily.relationship"]}
          />
          <CustomInput
            label="Mobile Number"
            name="emergencyContact.immediateFamily.mobileNumber"
            type="tel"
            placeholder="Enter mobile number"
            value={formData.emergencyContact.immediateFamily.mobileNumber}
            onChange={handleChange}
            required
            error={errors["emergencyContact.immediateFamily.mobileNumber"]}
          />
        </div>
        <CustomInput
          label="Landline Number"
          name="emergencyContact.immediateFamily.landlineNumber"
          type="tel"
          placeholder="Enter landline number (optional)"
          value={formData.emergencyContact.immediateFamily.landlineNumber}
          onChange={handleChange}
          error={errors["emergencyContact.immediateFamily.landlineNumber"]}
        />
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">
          Emergency Contact (Other)
        </h4>
        <CustomInput
          label="Name"
          name="emergencyContact.other.name"
          type="text"
          placeholder="Enter emergency contact name"
          value={formData.emergencyContact.other.name}
          onChange={handleChange}
          error={errors["emergencyContact.other.name"]}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CustomInput
            label="Relationship to you"
            name="emergencyContact.other.relationship"
            type="text"
            placeholder="Enter relationship"
            value={formData.emergencyContact.other.relationship}
            onChange={handleChange}
            error={errors["emergencyContact.other.relationship"]}
          />
          <CustomInput
            label="Mobile Number"
            name="emergencyContact.other.mobileNumber"
            type="tel"
            placeholder="Enter mobile number"
            value={formData.emergencyContact.other.mobileNumber}
            onChange={handleChange}
            error={errors["emergencyContact.other.mobileNumber"]}
          />
        </div>
        <CustomInput
          label="Landline Number"
          name="emergencyContact.other.landlineNumber"
          type="tel"
          placeholder="Enter landline number (optional)"
          value={formData.emergencyContact.other.landlineNumber}
          onChange={handleChange}
          error={errors["emergencyContact.other.landlineNumber"]}
        />
      </div>
    </div>
  );
};

export default MedicalHistoryStep;
