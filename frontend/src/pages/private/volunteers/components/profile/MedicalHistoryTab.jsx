import React from 'react';
import { Heart, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MedicalHistoryTab = ({ user }) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Medical Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm sm:text-base">Blood Type:</span>
              <span className="font-medium text-sm sm:text-base">{user?.medicalHistory?.bloodType || 'Not provided'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm sm:text-base">Pre-existing Conditions:</span>
              <span className="font-medium text-sm sm:text-base">{user?.medicalHistory?.preExistingConditions || 'None'}</span>
            </div>
            <div className="flex justify-between items-center sm:col-span-2">
              <span className="text-gray-600 text-sm sm:text-base">Current Medications:</span>
              <span className="font-medium text-sm sm:text-base">{user?.medicalHistory?.currentMedications || 'None'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
            <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Emergency Contacts</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <div className="border rounded-lg p-3 sm:p-4">
              <h4 className="font-medium mb-2 text-sm sm:text-base">Immediate Family Contact</h4>
              <div className="space-y-1.5 sm:space-y-2">
                <p className="text-gray-600 text-sm sm:text-base">
                  <span className="font-medium">Name:</span> {user?.medicalHistory?.emergencyContact?.immediateFamily?.name || 'Not provided'}
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  <span className="font-medium">Relationship:</span> {user?.medicalHistory?.emergencyContact?.immediateFamily?.relationship || 'Not provided'}
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  <span className="font-medium">Mobile:</span> {user?.medicalHistory?.emergencyContact?.immediateFamily?.mobileNumber || 'Not provided'}
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  <span className="font-medium">Landline:</span> {user?.medicalHistory?.emergencyContact?.immediateFamily?.landlineNumber || 'Not provided'}
                </p>
              </div>
            </div>
            <div className="border rounded-lg p-3 sm:p-4">
              <h4 className="font-medium mb-2 text-sm sm:text-base">Other Emergency Contact</h4>
              <div className="space-y-1.5 sm:space-y-2">
                <p className="text-gray-600 text-sm sm:text-base">
                  <span className="font-medium">Name:</span> {user?.medicalHistory?.emergencyContact?.other?.name || 'Not provided'}
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  <span className="font-medium">Relationship:</span> {user?.medicalHistory?.emergencyContact?.other?.relationship || 'Not provided'}
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  <span className="font-medium">Mobile:</span> {user?.medicalHistory?.emergencyContact?.other?.mobileNumber || 'Not provided'}
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  <span className="font-medium">Landline:</span> {user?.medicalHistory?.emergencyContact?.other?.landlineNumber || 'Not provided'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicalHistoryTab;
