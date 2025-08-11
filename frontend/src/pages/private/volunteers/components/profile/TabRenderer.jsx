import React from 'react';
import PersonalInfoTab from './PersonalInfoTab';
import MedicalHistoryTab from './MedicalHistoryTab';
import FamilyBackgroundTab from './FamilyBackgroundTab';
import EducationTab from './EducationTab';
import SkillsServicesTab from './SkillsServicesTab';

const TabRenderer = ({ activeTab, user, age, isEditing = false, formData, handleChange, setFormData }) => {
  switch (activeTab) {
    case 'personal':
      return <PersonalInfoTab user={user} age={age} isEditing={isEditing} formData={formData} handleChange={handleChange} />;
    case 'medical':
      return <MedicalHistoryTab user={user} isEditing={isEditing} formData={formData} handleChange={handleChange} />;
    case 'family':
      return <FamilyBackgroundTab user={user} isEditing={isEditing} formData={formData} handleChange={handleChange} />;
    case 'education':
      return <EducationTab user={user} isEditing={isEditing} formData={formData} handleChange={handleChange} />;
    case 'skills':
      return <SkillsServicesTab user={user} isEditing={isEditing} formData={formData} handleChange={handleChange} setFormData={setFormData} />;
    default:
      return <PersonalInfoTab user={user} age={age} isEditing={isEditing} formData={formData} handleChange={handleChange} />;
  }
};

export default TabRenderer;
