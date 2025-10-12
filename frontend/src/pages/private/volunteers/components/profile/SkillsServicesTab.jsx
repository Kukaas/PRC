import React, { useState, useEffect } from 'react';
import { Award, Building, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CustomInput from '@/components/CustomInput';
import { api } from '@/services/api';

const SkillsServicesTab = ({ user, isEditing = false, formData, setFormData }) => {
  const [availableSkills, setAvailableSkills] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);

  // Fetch skills and services from maintenance API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch skills
        setLoadingSkills(true);
        const skillsResponse = await api.maintenance.getActiveSkills();
        // Support multiple API shapes: { success, data } or { data: { data: [...] } }
        if (skillsResponse) {
          if (skillsResponse.success && Array.isArray(skillsResponse.data)) {
            setAvailableSkills(skillsResponse.data.map((s) => s.name));
          } else if (skillsResponse.data && Array.isArray(skillsResponse.data.data)) {
            setAvailableSkills(skillsResponse.data.data.map((s) => s.name));
          } else if (Array.isArray(skillsResponse.data)) {
            setAvailableSkills(skillsResponse.data.map((s) => s.name));
          }
        }

        // Fetch services
        setLoadingServices(true);
        const servicesResponse = await api.maintenance.getActiveServices();
        if (servicesResponse) {
          if (servicesResponse.success && Array.isArray(servicesResponse.data)) {
            setAvailableServices(servicesResponse.data.map((s) => s.name));
          } else if (servicesResponse.data && Array.isArray(servicesResponse.data.data)) {
            setAvailableServices(servicesResponse.data.data.map((s) => s.name));
          } else if (Array.isArray(servicesResponse.data)) {
            setAvailableServices(servicesResponse.data.map((s) => s.name));
          }
        }
      } catch (error) {
        console.error('Error fetching skills and services:', error);
        // Fallback to predefined values if API fails
        setAvailableSkills([
          'Strong Communication skills',
          'First Aid and CPR/BLS Certification',
          'Swimming and Lifesaving Skills',
          'Fire Safety Knowledge',
          'Disaster Preparedness Training',
          'Public Speaking and Teaching Skills',
          'Physical Fitness',
          'Leadership and Organizing',
          'First Aid and Disaster Preparedness',
          'Communication and Advocacy',
          'Creativity and Event Planning',
        ]);
        setAvailableServices([
          'Welfare Services',
          'Safety Services',
          'Health Services',
          'Youth Services',
          'Blood Services',
          'Wash Services',
        ]);
      } finally {
        setLoadingSkills(false);
        setLoadingServices(false);
      }
    };

    fetchData();
  }, []);
  const getServiceDisplayName = (service) => {
    const serviceNameMap = {
      "Welfare Services": "Welfare Services",
      "Safety Services": "Safety Services",
      "Health Services": "Health Services",
      "Youth Services": "Youth Services",
      "Blood Services": "Blood Services",
      "Wash Services": "Water, Sanitation and Hygiene (WASH) Services"
    };

    if (typeof service === 'string') {
      return serviceNameMap[service] || service;
    } else if (service?.type) {
      return serviceNameMap[service.type] || service.type;
    } else if (typeof service === 'object' && service !== null) {
      if (service['0'] !== undefined) {
        const chars = [];
        let i = 0;
        while (service[i] !== undefined) {
          chars.push(service[i]);
          i++;
        }
        const reconstructedService = chars.join('');
        return serviceNameMap[reconstructedService] || reconstructedService;
      } else {
        const firstValue = Object.values(service)[0];
        return serviceNameMap[firstValue] || firstValue || 'Unknown Service';
      }
    }
    return 'Unknown Service';
  };

  // Service recommendations map (copied/compatible with ServicesStep)
  const serviceRecommendations = {
    'Strong Communication skills': ['Welfare Services', 'Youth Services', 'Health Services', 'Blood Services'],
    'First Aid and CPR/BLS Certification': ['Health Services', 'Safety Services', 'Blood Services', 'Welfare Services'],
    'Swimming and Lifesaving Skills': ['Safety Services', 'Wash Services', 'Health Services'],
    'Fire Safety Knowledge': ['Safety Services', 'Health Services', 'Welfare Services'],
    'Disaster Preparedness Training': ['Safety Services', 'Welfare Services', 'Health Services', 'Wash Services'],
    'Public Speaking and Teaching Skills': ['Youth Services', 'Health Services', 'Welfare Services', 'Blood Services'],
    'Physical Fitness': ['Safety Services', 'Youth Services', 'Health Services'],
    'Leadership and Organizing': ['Youth Services', 'Welfare Services', 'Health Services', 'Safety Services'],
    'First Aid and Disaster Preparedness': ['Health Services', 'Safety Services', 'Welfare Services', 'Blood Services'],
    'Communication and Advocacy': ['Welfare Services', 'Youth Services', 'Health Services', 'Blood Services'],
    'Creativity and Event Planning': ['Youth Services', 'Welfare Services', 'Health Services'],
    'Medical Knowledge': ['Health Services', 'Blood Services', 'Safety Services', 'Welfare Services'],
    'Teaching and Training': ['Youth Services', 'Health Services', 'Welfare Services', 'Safety Services'],
    'Counseling Skills': ['Welfare Services', 'Youth Services', 'Health Services'],
    'Emergency Response': ['Safety Services', 'Health Services', 'Welfare Services', 'Blood Services'],
    'Community Outreach': ['Welfare Services', 'Youth Services', 'Health Services', 'Blood Services'],
    'Event Management': ['Youth Services', 'Welfare Services', 'Health Services', 'Blood Services'],
    'Technical Skills': ['Safety Services', 'Health Services', 'Wash Services'],
    'Language Skills': ['Welfare Services', 'Youth Services', 'Health Services', 'Blood Services'],
    'Computer Skills': ['Youth Services', 'Welfare Services', 'Health Services', 'Blood Services'],
  };

  const getRecommendedServices = () => {
    const recommended = new Set();
    (formData?.skills || []).forEach((skill) => {
      if (serviceRecommendations[skill]) {
        serviceRecommendations[skill].forEach((s) => recommended.add(s));
      }
    });
    return Array.from(recommended);
  };

  const recommendedServices = getRecommendedServices();

  const handleServiceChange = (service, checked) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        services: [...(prev.services || []), service],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        services: (prev.services || []).filter((s) => s !== service),
      }));
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
            <Award className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Skills & Services</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 text-sm sm:text-base">Skills</h4>
                {loadingSkills ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                    <span className="ml-2 text-gray-600">Loading skills...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableSkills.map((skill) => {
                      const checked = (formData?.skills || []).includes(skill);
                      return (
                        <label key={skill} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setFormData((prev) => ({
                                ...prev,
                                skills: isChecked ? [...(prev.skills || []), skill] : (prev.skills || []).filter((s) => s !== skill),
                              }));
                            }}
                            className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                          />
                          <span className="text-sm text-gray-700">{skill}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-medium mb-2 text-sm sm:text-base">Services</h4>
                {loadingServices ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                    <span className="ml-2 text-gray-600">Loading services...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    { /* Recommended services block (based on selected skills) */ }
                    {recommendedServices.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <h5 className="font-medium text-blue-800 mb-2 text-sm">Recommended Services</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {recommendedServices.map((service) => (
                            <label key={service} className="flex items-center space-x-3 cursor-pointer p-2 bg-white rounded border border-blue-100">
                              <input
                                type="checkbox"
                                checked={(formData?.services || []).includes(service)}
                                onChange={(e) => handleServiceChange(service, e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-blue-300 rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <span className="text-blue-800 text-sm">{service}</span>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full inline-block ml-2">Recommended</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {availableServices.map((service) => {
                      const checked = (formData?.services || []).includes(service);
                      return (
                        <label key={service} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => handleServiceChange(service, e.target.checked)}
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                          />
                          <span className="text-gray-700">{service}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div>
                <h4 className="font-medium mb-2 text-sm sm:text-base">Skills</h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {user?.skills && user.skills.length > 0 ? (
                    user.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5">{skill}</Badge>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm sm:text-base">No skills selected</p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-sm sm:text-base">Services</h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 items-start">
                  {user?.services && user.services.length > 0 ? (
                    user.services.map((service, index) => (
                      <span key={index} className="inline-block bg-cyan-100 text-cyan-800 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-md font-medium">
                        {getServiceDisplayName(service)}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm sm:text-base">No services selected</p>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Socio-Civic Involvements */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
            <Building className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Socio-Civic & Cultural Religious Involvements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-3">
              {(formData?.socioCivicInvolvements || []).map((involvement, index) => (
                <div key={index} className="border rounded-lg p-3 sm:p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <CustomInput label="Organization" name={`socioCivicInvolvements.${index}.organization`} type="text" value={involvement.organization || ''} onChange={(e) => {
                      const value = e.target.value;
                      setFormData((prev) => {
                        const next = { ...prev };
                        const list = [...(next.socioCivicInvolvements || [])];
                        list[index] = { ...list[index], organization: value };
                        next.socioCivicInvolvements = list;
                        return next;
                      });
                    }} />
                    <CustomInput label="Position" name={`socioCivicInvolvements.${index}.position`} type="text" value={involvement.position || ''} onChange={(e) => {
                      const value = e.target.value;
                      setFormData((prev) => {
                        const next = { ...prev };
                        const list = [...(next.socioCivicInvolvements || [])];
                        list[index] = { ...list[index], position: value };
                        next.socioCivicInvolvements = list;
                        return next;
                      });
                    }} />
                    <CustomInput label="Year" name={`socioCivicInvolvements.${index}.year`} type="number" value={involvement.year ?? ''} onChange={(e) => {
                      const value = e.target.value;
                      setFormData((prev) => {
                        const next = { ...prev };
                        const list = [...(next.socioCivicInvolvements || [])];
                        list[index] = { ...list[index], year: value === '' ? '' : Number(value) };
                        next.socioCivicInvolvements = list;
                        return next;
                      });
                    }} />
                  </div>
                  <button type="button" className="text-red-600 hover:text-red-800 text-sm" onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      socioCivicInvolvements: (prev.socioCivicInvolvements || []).filter((_, i) => i !== index),
                    }));
                  }}>Remove</button>
                </div>
              ))}
              <button type="button" className="text-blue-600 hover:text-blue-800 text-sm border border-blue-300 rounded px-3 py-1" onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  socioCivicInvolvements: [...(prev.socioCivicInvolvements || []), { organization: '', position: '', year: '' }],
                }));
              }}>+ Add Involvement</button>
            </div>
          ) : (
            (user?.socioCivicInvolvements && user.socioCivicInvolvements.length > 0) ? (
              <div className="space-y-2 sm:space-y-3">
                {user.socioCivicInvolvements.map((involvement, index) => (
                  <div key={index} className="border rounded-lg p-3 sm:p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                      <p className="text-gray-600 text-sm sm:text-base">
                        <span className="font-medium">Organization:</span> {involvement.organization}
                      </p>
                      <p className="text-gray-600 text-sm sm:text-base">
                        <span className="font-medium">Position:</span> {involvement.position}
                      </p>
                      <p className="text-gray-600 text-sm sm:text-base">
                        <span className="font-medium">Year:</span> {involvement.year}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm sm:text-base">No socio-civic involvements recorded</p>
            )
          )}
        </CardContent>
      </Card>

      {/* Work Experience */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
            <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Work Experience</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-3">
              {(formData?.workExperience || []).map((work, index) => (
                <div key={index} className="border rounded-lg p-3 sm:p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <CustomInput label="Organization" name={`workExperience.${index}.organization`} type="text" value={work.organization || ''} onChange={(e) => {
                      const value = e.target.value;
                      setFormData((prev) => {
                        const next = { ...prev };
                        const list = [...(next.workExperience || [])];
                        list[index] = { ...list[index], organization: value };
                        next.workExperience = list;
                        return next;
                      });
                    }} />
                    <CustomInput label="Position" name={`workExperience.${index}.position`} type="text" value={work.position || ''} onChange={(e) => {
                      const value = e.target.value;
                      setFormData((prev) => {
                        const next = { ...prev };
                        const list = [...(next.workExperience || [])];
                        list[index] = { ...list[index], position: value };
                        next.workExperience = list;
                        return next;
                      });
                    }} />
                    <CustomInput label="Year" name={`workExperience.${index}.year`} type="number" value={work.year ?? ''} onChange={(e) => {
                      const value = e.target.value;
                      setFormData((prev) => {
                        const next = { ...prev };
                        const list = [...(next.workExperience || [])];
                        list[index] = { ...list[index], year: value === '' ? '' : Number(value) };
                        next.workExperience = list;
                        return next;
                      });
                    }} />
                  </div>
                  <button type="button" className="text-red-600 hover:text-red-800 text-sm" onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      workExperience: (prev.workExperience || []).filter((_, i) => i !== index),
                    }));
                  }}>Remove</button>
                </div>
              ))}
              <button type="button" className="text-blue-600 hover:text-blue-800 text-sm border border-blue-300 rounded px-3 py-1" onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  workExperience: [...(prev.workExperience || []), { organization: '', position: '', year: '' }],
                }));
              }}>+ Add Work Experience</button>
            </div>
          ) : (
            (user?.workExperience && user.workExperience.length > 0) ? (
              <div className="space-y-2 sm:space-y-3">
                {user.workExperience.map((work, index) => (
                  <div key={index} className="border rounded-lg p-3 sm:p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                      <p className="text-gray-600 text-sm sm:text-base">
                        <span className="font-medium">Organization:</span> {work.organization}
                      </p>
                      <p className="text-gray-600 text-sm sm:text-base">
                        <span className="font-medium">Position:</span> {work.position}
                      </p>
                      <p className="text-gray-600 text-sm sm:text-base">
                        <span className="font-medium">Year:</span> {work.year}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm sm:text-base">No work experience recorded</p>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SkillsServicesTab;
