import CustomInput from "@/components/CustomInput";
import React from "react";

const AdditionalInfoStep = ({ formData, setFormData }) => {
  const addInvolvement = () => {
    setFormData(prev => ({
      ...prev,
      socioCivicInvolvements: [...prev.socioCivicInvolvements, { organization: '', position: '', year: '' }]
    }));
  };

  const removeInvolvement = (index) => {
    setFormData(prev => ({
      ...prev,
      socioCivicInvolvements: prev.socioCivicInvolvements.filter((_, i) => i !== index)
    }));
  };

  const updateInvolvement = (index, field, value) => {
    const newInvolvements = [...formData.socioCivicInvolvements];
    newInvolvements[index][field] = value;
    setFormData(prev => ({
      ...prev,
      socioCivicInvolvements: newInvolvements
    }));
  };

  const addWorkExperience = () => {
    setFormData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, { organization: '', position: '', year: '' }]
    }));
  };

  const removeWorkExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index)
    }));
  };

  const updateWorkExperience = (index, field, value) => {
    const newWork = [...formData.workExperience];
    newWork[index][field] = value;
    setFormData(prev => ({
      ...prev,
      workExperience: newWork
    }));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        Additional Information
      </h3>

      <div className="space-y-6">
        {/* Socio-Civic Involvements */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">
            Socio-Civic & Cultural Religious Involvements
          </h4>
          <p className="text-sm text-gray-500">
            Add any organizations, positions, and years of involvement
          </p>
          <div className="space-y-3">
            {formData.socioCivicInvolvements.map((involvement, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <CustomInput
                    label="Organization"
                    name={`socioCivicInvolvements.${index}.organization`}
                    type="text"
                    placeholder="Enter organization name"
                    value={involvement.organization}
                    onChange={(e) => updateInvolvement(index, 'organization', e.target.value)}
                  />
                  <CustomInput
                    label="Position"
                    name={`socioCivicInvolvements.${index}.position`}
                    type="text"
                    placeholder="Enter position/role"
                    value={involvement.position}
                    onChange={(e) => updateInvolvement(index, 'position', e.target.value)}
                  />
                  <CustomInput
                    label="Year"
                    name={`socioCivicInvolvements.${index}.year`}
                    type="number"
                    placeholder="Enter year"
                    value={involvement.year}
                    onChange={(e) => updateInvolvement(index, 'year', e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeInvolvement(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addInvolvement}
              className="text-blue-600 hover:text-blue-800 text-sm border border-blue-300 rounded px-3 py-1"
            >
              + Add Involvement
            </button>
          </div>
        </div>

        {/* Work Experience */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">
            Work Experience
          </h4>
          <p className="text-sm text-gray-500">
            Add any work experience with organization, position, and year
          </p>
          <div className="space-y-3">
            {formData.workExperience.map((work, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <CustomInput
                    label="Organization"
                    name={`workExperience.${index}.organization`}
                    type="text"
                    placeholder="Enter organization name"
                    value={work.organization}
                    onChange={(e) => updateWorkExperience(index, 'organization', e.target.value)}
                  />
                  <CustomInput
                    label="Position"
                    name={`workExperience.${index}.position`}
                    type="text"
                    placeholder="Enter position/role"
                    value={work.position}
                    onChange={(e) => updateWorkExperience(index, 'position', e.target.value)}
                  />
                  <CustomInput
                    label="Year"
                    name={`workExperience.${index}.year`}
                    type="number"
                    placeholder="Enter year"
                    value={work.year}
                    onChange={(e) => updateWorkExperience(index, 'year', e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeWorkExperience(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addWorkExperience}
              className="text-blue-600 hover:text-blue-800 text-sm border border-blue-300 rounded px-3 py-1"
            >
              + Add Work Experience
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdditionalInfoStep;
