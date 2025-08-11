import React from 'react';
import { Award, Building, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CustomInput from '@/components/CustomInput';

const SkillsServicesTab = ({ user, isEditing = false, formData, setFormData }) => {
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
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
                  ].map((skill) => {
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
              </div>
              <div>
                <h4 className="font-medium mb-2 text-sm sm:text-base">Services</h4>
                <div className="space-y-3">
                  {['Welfare Services', 'Safety Services', 'Health Services', 'Youth Services', 'Blood Services', 'Wash Services'].map((service) => {
                    const checked = (formData?.services || []).includes(service);
                    return (
                      <label key={service} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setFormData((prev) => ({
                              ...prev,
                              services: isChecked ? [...(prev.services || []), service] : (prev.services || []).filter((s) => s !== service),
                            }));
                          }}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <span className="text-gray-700">{service}</span>
                      </label>
                    );
                  })}
                </div>
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
