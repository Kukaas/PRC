import React from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ProfileHeader = ({ user }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              {user?.givenName} {user?.familyName}
            </h1>
            <p className="text-sm md:text-base text-gray-600">{user?.email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="secondary" className="capitalize text-xs">
                {user?.role || 'Volunteer'}
              </Badge>
              {user?.isProfileComplete && (
                <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                  Profile Complete
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 w-full md:w-auto">
          <User className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>
    </div>
  );
};

export default ProfileHeader;
