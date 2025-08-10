import React from 'react';
import { GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const EducationTab = ({ user }) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Educational Background</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {user?.educationalBackground && Object.entries(user.educationalBackground).map(([level, data]) => (
              <div key={level} className="border rounded-lg p-3 sm:p-4">
                <h4 className="font-medium capitalize mb-2 text-sm sm:text-base">{level}</h4>
                <div className="space-y-1.5 sm:space-y-2">
                  <p className="text-gray-600 text-sm sm:text-base">
                    <span className="font-medium">School:</span> {data?.school || 'Not provided'}
                  </p>
                  {level === 'college' && data?.course && (
                    <p className="text-gray-600 text-sm sm:text-base">
                      <span className="font-medium">Course:</span> {data.course}
                    </p>
                  )}
                  <p className="text-gray-600 text-sm sm:text-base">
                    <span className="font-medium">Year Graduated:</span> {data?.yearGraduated || 'Not provided'}
                  </p>
                  <p className="text-gray-600 text-sm sm:text-base">
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
