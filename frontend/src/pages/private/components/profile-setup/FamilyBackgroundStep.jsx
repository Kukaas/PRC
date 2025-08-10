import React from "react";
import CustomInput from "../../../../components/CustomInput";

const FamilyBackgroundStep = ({ formData, handleChange, errors }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        Family Background
      </h3>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">
          Father's Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CustomInput
            label="Name"
            name="familyBackground.father.name"
            type="text"
            placeholder="Enter father's name"
            value={formData.familyBackground.father.name}
            onChange={handleChange}
            required
            error={errors["familyBackground.father.name"]}
          />
          <CustomInput
            label="Age"
            name="familyBackground.father.age"
            type="number"
            placeholder="Enter age"
            value={formData.familyBackground.father.age}
            onChange={handleChange}
          />
          <CustomInput
            label="Occupation"
            name="familyBackground.father.occupation"
            type="text"
            placeholder="Enter occupation"
            value={formData.familyBackground.father.occupation}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">
          Mother's Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CustomInput
            label="Name"
            name="familyBackground.mother.name"
            type="text"
            placeholder="Enter mother's name"
            value={formData.familyBackground.mother.name}
            onChange={handleChange}
            required
            error={errors["familyBackground.mother.name"]}
          />
          <CustomInput
            label="Age"
            name="familyBackground.mother.age"
            type="number"
            placeholder="Enter age"
            value={formData.familyBackground.mother.age}
            onChange={handleChange}
          />
          <CustomInput
            label="Occupation"
            name="familyBackground.mother.occupation"
            type="text"
            placeholder="Enter occupation"
            value={formData.familyBackground.mother.occupation}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CustomInput
          label="Number of Siblings"
          name="familyBackground.numberOfSiblings"
          type="number"
          placeholder="Enter number of siblings"
          value={formData.familyBackground.numberOfSiblings}
          onChange={handleChange}
          error={errors["familyBackground.numberOfSiblings"]}
        />
        <CustomInput
          label="Position in Family"
          name="familyBackground.positionInFamily"
          type="text"
          placeholder="Enter position in family (e.g., eldest, youngest)"
          value={formData.familyBackground.positionInFamily}
          onChange={handleChange}
          error={errors["familyBackground.positionInFamily"]}
        />
      </div>
    </div>
  );
};

export default FamilyBackgroundStep;
