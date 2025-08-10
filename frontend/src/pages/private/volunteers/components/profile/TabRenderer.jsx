import React from 'react';
import PersonalInfoTab from './PersonalInfoTab';
import MedicalHistoryTab from './MedicalHistoryTab';
import FamilyBackgroundTab from './FamilyBackgroundTab';
import EducationTab from './EducationTab';
import SkillsServicesTab from './SkillsServicesTab';

const TabRenderer = ({ activeTab, user, age }) => {
  switch (activeTab) {
    case 'personal':
      return <PersonalInfoTab user={user} age={age} />;
    case 'medical':
      return <MedicalHistoryTab user={user} />;
    case 'family':
      return <FamilyBackgroundTab user={user} />;
    case 'education':
      return <EducationTab user={user} />;
    case 'skills':
      return <SkillsServicesTab user={user} />;
    default:
      return <PersonalInfoTab user={user} age={age} />;
  }
};

export default TabRenderer;
