import React from 'react';
import { Heart, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CustomInput from '@/components/CustomInput';

const MedicalHistoryTab = ({ user, isEditing = false, formData, handleChange }) => {
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
          {isEditing ? (
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <CustomInput label="Blood Type" name="medicalHistory.bloodType" type="select" value={formData?.medicalHistory?.bloodType || ''} onChange={handleChange}>
                <option value="">Not Applicable</option>
                <option value="A-">A-</option>
                <option value="A+">A+</option>
                <option value="AB-">AB-</option>
                <option value="AB+">AB+</option>
                <option value="B-">B-</option>
                <option value="B+">B+</option>
                <option value="O-">O-</option>
                <option value="O+">O+</option>
              </CustomInput>
              <CustomInput label="Pre-existing Conditions" name="medicalHistory.preExistingConditions" type="textarea" value={formData?.medicalHistory?.preExistingConditions || ''} onChange={handleChange} />
              <CustomInput label="Current Medications" name="medicalHistory.currentMedications" type="textarea" value={formData?.medicalHistory?.currentMedications || ''} onChange={handleChange} />
            </div>
          ) : (
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
          )}
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
          {isEditing ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <div className="border rounded-lg p-3 sm:p-4">
                <h4 className="font-medium mb-2 text-sm sm:text-base">Immediate Family Contact</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <CustomInput label="Name" name="medicalHistory.emergencyContact.immediateFamily.name" type="text" value={formData?.medicalHistory?.emergencyContact?.immediateFamily?.name || ''} onChange={handleChange} />
                  <CustomInput label="Relationship" name="medicalHistory.emergencyContact.immediateFamily.relationship" type="select" value={formData?.medicalHistory?.emergencyContact?.immediateFamily?.relationship || ''} onChange={handleChange}>
                    <option value="">Select relationship</option>
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Sister">Sister</option>
                    <option value="Brother">Brother</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Grandmother">Grandmother</option>
                    <option value="Grandfather">Grandfather</option>
                    <option value="Aunt">Aunt</option>
                    <option value="Uncle">Uncle</option>
                    <option value="Cousin">Cousin</option>
                    <option value="Other">Other</option>
                  </CustomInput>
                  <CustomInput label="Mobile" name="medicalHistory.emergencyContact.immediateFamily.mobileNumber" type="tel" value={formData?.medicalHistory?.emergencyContact?.immediateFamily?.mobileNumber || ''} onChange={handleChange} />
                  <CustomInput label="Landline" name="medicalHistory.emergencyContact.immediateFamily.landlineNumber" type="tel" value={formData?.medicalHistory?.emergencyContact?.immediateFamily?.landlineNumber || ''} onChange={handleChange} />
                </div>
              </div>
              <div className="border rounded-lg p-3 sm:p-4">
                <h4 className="font-medium mb-2 text-sm sm:text-base">Other Emergency Contact</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <CustomInput label="Name" name="medicalHistory.emergencyContact.other.name" type="text" value={formData?.medicalHistory?.emergencyContact?.other?.name || ''} onChange={handleChange} />
                  <CustomInput label="Relationship" name="medicalHistory.emergencyContact.other.relationship" type="select" value={formData?.medicalHistory?.emergencyContact?.other?.relationship || ''} onChange={handleChange}>
                    <option value="">Select relationship</option>
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Sister">Sister</option>
                    <option value="Brother">Brother</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Grandmother">Grandmother</option>
                    <option value="Grandfather">Grandfather</option>
                    <option value="Aunt">Aunt</option>
                    <option value="Uncle">Uncle</option>
                    <option value="Cousin">Cousin</option>
                    <option value="Friend">Friend</option>
                    <option value="Colleague">Colleague</option>
                    <option value="Neighbor">Neighbor</option>
                    <option value="Other">Other</option>
                  </CustomInput>
                  <CustomInput label="Mobile" name="medicalHistory.emergencyContact.other.mobileNumber" type="tel" value={formData?.medicalHistory?.emergencyContact?.other?.mobileNumber || ''} onChange={handleChange} />
                  <CustomInput label="Landline" name="medicalHistory.emergencyContact.other.landlineNumber" type="tel" value={formData?.medicalHistory?.emergencyContact?.other?.landlineNumber || ''} onChange={handleChange} />
                </div>
              </div>
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicalHistoryTab;
