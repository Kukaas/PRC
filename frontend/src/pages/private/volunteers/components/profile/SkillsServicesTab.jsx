import React from 'react';
import { Award, Building, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SkillsServicesTab = ({ user }) => {
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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span>Skills & Services</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {user?.skills && user.skills.length > 0 ? (
                user.skills.map((skill, index) => (
                  <Badge key={index} variant="outline">{skill}</Badge>
                ))
              ) : (
                <p className="text-gray-500">No skills selected</p>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Services</h4>
            <div className="flex flex-wrap gap-2 items-start">
              {user?.services && user.services.length > 0 ? (
                user.services.map((service, index) => (
                  <span key={index} className="inline-block bg-cyan-100 text-cyan-800 text-sm px-3 py-1 rounded-md font-medium">
                    {getServiceDisplayName(service)}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No services selected</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Socio-Civic Involvements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Building className="w-5 h-5" />
            <span>Socio-Civic & Cultural Religious Involvements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user?.socioCivicInvolvements && user.socioCivicInvolvements.length > 0 ? (
            <div className="space-y-3">
              {user.socioCivicInvolvements.map((involvement, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <p className="text-gray-600">
                      <span className="font-medium">Organization:</span> {involvement.organization}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Position:</span> {involvement.position}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Year:</span> {involvement.year}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No socio-civic involvements recorded</p>
          )}
        </CardContent>
      </Card>

      {/* Work Experience */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Briefcase className="w-5 h-5" />
            <span>Work Experience</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user?.workExperience && user.workExperience.length > 0 ? (
            <div className="space-y-3">
              {user.workExperience.map((work, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <p className="text-gray-600">
                      <span className="font-medium">Organization:</span> {work.organization}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Position:</span> {work.position}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Year:</span> {work.year}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No work experience recorded</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SkillsServicesTab;
