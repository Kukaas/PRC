import React from 'react';
import { Heart, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MedicalHistoryTab = ({ user }) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Heart className="w-5 h-5" />
            <span>Medical Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Blood Type:</span>
              <span className="font-medium">{user?.medicalHistory?.bloodType || 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pre-existing Conditions:</span>
              <span className="font-medium">{user?.medicalHistory?.preExistingConditions || 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Current Medications:</span>
              <span className="font-medium">{user?.medicalHistory?.currentMedications || 'None'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Phone className="w-5 h-5" />
            <span>Emergency Contacts</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Immediate Family Contact</h4>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Name:</span> {user?.medicalHistory?.emergencyContact?.immediateFamily?.name || 'Not provided'}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Relationship:</span> {user?.medicalHistory?.emergencyContact?.immediateFamily?.relationship || 'Not provided'}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Mobile:</span> {user?.medicalHistory?.emergencyContact?.immediateFamily?.mobileNumber || 'Not provided'}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Landline:</span> {user?.medicalHistory?.emergencyContact?.immediateFamily?.landlineNumber || 'Not provided'}
                </p>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Other Emergency Contact</h4>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Name:</span> {user?.medicalHistory?.emergencyContact?.other?.name || 'Not provided'}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Relationship:</span> {user?.medicalHistory?.emergencyContact?.other?.relationship || 'Not provided'}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Mobile:</span> {user?.medicalHistory?.emergencyContact?.other?.mobileNumber || 'Not provided'}
                </p>
                <p className="text-gray-600">
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
