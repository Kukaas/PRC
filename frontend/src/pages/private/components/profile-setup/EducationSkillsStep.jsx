import React from "react";
import CustomInput from "../../../../components/CustomInput";

const EducationSkillsStep = ({ formData, handleChange, errors, setFormData }) => {
  // Predefined skills list from the user model
  const predefinedSkills = [
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
    "Creativity and Event Planning",
  ];

  const handleSkillChange = (skill, checked) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        skills: prev.skills.filter((s) => s !== skill),
      }));
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        Education & Skills
      </h3>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">
          Educational Background
        </h4>

        {/* Elementary */}
        <div className="space-y-3">
          <h5 className="font-medium text-gray-600">Elementary</h5>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CustomInput
              label="School"
              name="educationalBackground.elementary.school"
              type="text"
              placeholder="Enter elementary school name"
              value={formData.educationalBackground.elementary.school}
              onChange={handleChange}
              required
              error={errors["educationalBackground.elementary.school"]}
            />
            <CustomInput
              label="Year Graduated"
              name="educationalBackground.elementary.yearGraduated"
              type="number"
              placeholder="Enter year graduated"
              value={
                formData.educationalBackground.elementary.yearGraduated
              }
              onChange={handleChange}
            />
            <CustomInput
              label="Honors/Awards"
              name="educationalBackground.elementary.honorsAwards"
              type="text"
              placeholder="Enter honors/awards (optional)"
              value={formData.educationalBackground.elementary.honorsAwards}
              onChange={handleChange}
              error={errors["educationalBackground.elementary.honorsAwards"]}
            />
          </div>
        </div>

        {/* High School */}
        <div className="space-y-3">
          <h5 className="font-medium text-gray-600">High School</h5>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CustomInput
              label="School"
              name="educationalBackground.highSchool.school"
              type="text"
              placeholder="Enter high school name"
              value={formData.educationalBackground.highSchool.school}
              onChange={handleChange}
            />
            <CustomInput
              label="Year Graduated"
              name="educationalBackground.highSchool.yearGraduated"
              type="number"
              placeholder="Enter year graduated"
              value={
                formData.educationalBackground.highSchool.yearGraduated
              }
              onChange={handleChange}
            />
            <CustomInput
              label="Honors/Awards"
              name="educationalBackground.highSchool.honorsAwards"
              type="text"
              placeholder="Enter honors/awards (optional)"
              value={formData.educationalBackground.highSchool.honorsAwards}
              onChange={handleChange}
              error={errors["educationalBackground.highSchool.honorsAwards"]}
            />
          </div>
        </div>

        {/* Vocational */}
        <div className="space-y-3">
          <h5 className="font-medium text-gray-600">Vocational</h5>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CustomInput
              label="School"
              name="educationalBackground.vocational.school"
              type="text"
              placeholder="Enter vocational school name"
              value={formData.educationalBackground.vocational.school}
              onChange={handleChange}
            />
            <CustomInput
              label="Year Graduated"
              name="educationalBackground.vocational.yearGraduated"
              type="number"
              placeholder="Enter year graduated"
              value={
                formData.educationalBackground.vocational.yearGraduated
              }
              onChange={handleChange}
            />
            <CustomInput
              label="Honors/Awards"
              name="educationalBackground.vocational.honorsAwards"
              type="text"
              placeholder="Enter honors/awards (optional)"
              value={formData.educationalBackground.vocational.honorsAwards}
              onChange={handleChange}
              error={errors["educationalBackground.vocational.honorsAwards"]}
            />
          </div>
        </div>

        {/* Higher Studies */}
        <div className="space-y-3">
          <h5 className="font-medium text-gray-600">Higher Studies</h5>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CustomInput
              label="School"
              name="educationalBackground.higherStudies.school"
              type="text"
              placeholder="Enter higher studies school name"
              value={formData.educationalBackground.higherStudies.school}
              onChange={handleChange}
            />
            <CustomInput
              label="Year Graduated"
              name="educationalBackground.higherStudies.yearGraduated"
              type="number"
              placeholder="Enter year graduated"
              value={
                formData.educationalBackground.higherStudies.yearGraduated
              }
              onChange={handleChange}
            />
            <CustomInput
              label="Honors/Awards"
              name="educationalBackground.higherStudies.honorsAwards"
              type="text"
              placeholder="Enter honors/awards (optional)"
              value={formData.educationalBackground.higherStudies.honorsAwards}
              onChange={handleChange}
              error={errors["educationalBackground.higherStudies.honorsAwards"]}
            />
          </div>
        </div>

        {/* College */}
        <div className="space-y-3">
          <h5 className="font-medium text-gray-600">College</h5>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <CustomInput
              label="School"
              name="educationalBackground.college.school"
              type="text"
              placeholder="Enter college/university name"
              value={formData.educationalBackground.college.school}
              onChange={handleChange}
            />
            <CustomInput
              label="Course"
              name="educationalBackground.college.course"
              type="text"
              placeholder="Enter course/degree"
              value={formData.educationalBackground.college.course}
              onChange={handleChange}
            />
            <CustomInput
              label="Year Graduated"
              name="educationalBackground.college.yearGraduated"
              type="number"
              placeholder="Enter year graduated"
              value={
                formData.educationalBackground.college.yearGraduated
              }
              onChange={handleChange}
            />
            <CustomInput
              label="Honors/Awards"
              name="educationalBackground.college.honorsAwards"
              type="text"
              placeholder="Enter honors/awards (optional)"
              value={formData.educationalBackground.college.honorsAwards}
              onChange={handleChange}
              error={errors["educationalBackground.college.honorsAwards"]}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">Skills</h4>
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">
            What are some skill(s) you possess?
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {predefinedSkills.map((skill) => (
              <label key={skill} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.skills.includes(skill)}
                  onChange={(e) => handleSkillChange(skill, e.target.checked)}
                  className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700">{skill}</span>
              </label>
            ))}
          </div>
          {errors.skills && (
            <p className="text-red-500 text-sm mt-1">{errors.skills}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EducationSkillsStep;
