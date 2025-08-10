import React from 'react';
import { GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const EducationTab = ({ user }) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <GraduationCap className="w-5 h-5" />
            <span>Educational Background</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user?.educationalBackground && Object.entries(user.educationalBackground).map(([level, data]) => (
              <div key={level} className="border rounded-lg p-4">
                <h4 className="font-medium capitalize mb-2">{level}</h4>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <span className="font-medium">School:</span> {data?.school || 'Not provided'}
                  </p>
                  {level === 'college' && data?.course && (
                    <p className="text-gray-600">
                      <span className="font-medium">Course:</span> {data.course}
                    </p>
                  )}
                  <p className="text-gray-600">
                    <span className="font-medium">Year Graduated:</span> {data?.yearGraduated || 'Not provided'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Honors/Awards:</span> {data?.honorsAwards || 'None'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EducationTab;
