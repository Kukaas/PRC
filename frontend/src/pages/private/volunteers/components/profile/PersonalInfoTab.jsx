import React from 'react';
import { User, Phone, Home } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PersonalInfoTab = ({ user, age }) => {
  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const userAge = calculateAge(user?.dateOfBirth);

  return (
    <div className="space-y-6">
      {/* Full Name Display */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {user?.givenName} {user?.middleName} {user?.familyName}
          </h2>
          <div className="flex justify-center items-center space-x-6 text-gray-600">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Date of Birth:</span>
              <span>{user?.dateOfBirth ? formatDate(user.dateOfBirth) : 'Not provided'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Age:</span>
              <span>{userAge ? `${userAge} years old` : 'Not provided'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Identification */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Personal Identification</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Last Name</label>
              <p className="text-gray-900 font-medium">{user?.familyName || 'Not provided'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">First Name</label>
              <p className="text-gray-900 font-medium">{user?.givenName || 'Not provided'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Middle Name</label>
              <p className="text-gray-900 font-medium">{user?.middleName || 'Not provided'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Nickname</label>
              <p className="text-gray-900 font-medium">{user?.personalInfo?.nickname || 'Not provided'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Personal Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Gender</label>
              <p className="text-gray-900 font-medium capitalize">{user?.personalInfo?.sex || 'Not provided'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Date of Birth / Age</label>
              <p className="text-gray-900 font-medium">
                {user?.dateOfBirth ? formatDate(user.dateOfBirth) : 'Not provided'}
                {age && ` (${age} years old)`}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Place of Birth</label>
              <p className="text-gray-900 font-medium">{user?.personalInfo?.birthPlace || 'Not provided'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Civil Status</label>
              <p className="text-gray-900 font-medium">{user?.personalInfo?.civilStatus || 'Not provided'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Spouse Name</label>
              <p className="text-gray-900 font-medium">{user?.personalInfo?.spouseName || 'Not provided'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Number of Children</label>
              <p className="text-gray-900 font-medium">{user?.personalInfo?.numberOfChildren || 'Not provided'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Height (cm)</label>
              <p className="text-gray-900 font-medium">{user?.personalInfo?.height ? `${user.personalInfo.height}cm` : 'Not provided'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Weight (kg)</label>
              <p className="text-gray-900 font-medium">{user?.personalInfo?.weight ? `${user.personalInfo.weight}kg` : 'Not provided'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Blood Type</label>
              <p className="text-gray-900 font-medium">{user?.medicalHistory?.bloodType || 'Not provided'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Phone className="w-5 h-5" />
            <span>Contact Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-gray-900 font-medium">{user?.email || 'Not provided'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Mobile Number</label>
              <p className="text-gray-900 font-medium">{user?.personalInfo?.mobileNumber || 'Not provided'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Landline Number</label>
              <p className="text-gray-900 font-medium">{user?.personalInfo?.landlineNumber || 'Not provided'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Contact Number</label>
              <p className="text-gray-900 font-medium">{user?.personalInfo?.contactNumber || 'Not provided'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Residential Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Home className="w-5 h-5" />
            <span>Residential Address</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">House Number</label>
              <p className="text-gray-900 font-medium">{user?.personalInfo?.address?.houseNo || 'Not provided'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Street/Block/Lot</label>
              <p className="text-gray-900 font-medium">{user?.personalInfo?.address?.streetBlockLot || 'Not provided'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">District/Barangay/Village</label>
              <p className="text-gray-900 font-medium">{user?.personalInfo?.address?.districtBarangayVillage || 'Not provided'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Municipality/City</label>
              <p className="text-gray-900 font-medium">{user?.personalInfo?.address?.municipalityCity || 'Not provided'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Province</label>
              <p className="text-gray-900 font-medium">{user?.personalInfo?.address?.province || 'Not provided'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Zip Code</label>
              <p className="text-gray-900 font-medium">{user?.personalInfo?.address?.zipcode || 'Not provided'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalInfoTab;
