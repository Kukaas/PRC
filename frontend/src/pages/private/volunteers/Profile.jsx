import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../components/AuthContext';
import PrivateLayout from '../../../layout/PrivateLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import TabRenderer from './components/profile/TabRenderer';

// Custom CSS for hiding scrollbar
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

const Profile = () => {
  const { user } = useAuth();
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState('personal');

  // Check if the logged-in user is viewing their own profile
  const isOwnProfile = user?.id === id || user?._id === id;

  // Calculate age from dateOfBirth if not already available
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

  const age = user?.personalInfo?.age || calculateAge(user?.dateOfBirth);

  if (!isOwnProfile) {
  return (
      <PrivateLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600">You can only view your own profile.</p>
          </div>
        </div>
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout>
      <style>{scrollbarHideStyles}</style>
      <div className="space-y-6">

        {/* Tabs Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 bg-transparent h-auto p-0 gap-1">
                <TabsTrigger value="personal" className="data-[state=active]:bg-cyan-300 data-[state=active]:text-black py-2 px-3 text-xs sm:text-sm font-medium rounded-xl transition-all hover:bg-cyan-50 hover:text-cyan-700">Personal Info</TabsTrigger>
                <TabsTrigger value="medical" className="data-[state=active]:bg-cyan-300 data-[state=active]:text-black py-2 px-3 text-xs sm:text-sm font-medium rounded-xl transition-all hover:bg-cyan-50 hover:text-cyan-700">Medical History</TabsTrigger>
                <TabsTrigger value="family" className="data-[state=active]:bg-cyan-300 data-[state=active]:text-black py-2 px-3 text-xs sm:text-sm font-medium rounded-xl transition-all hover:bg-cyan-50 hover:text-cyan-700">Family Background</TabsTrigger>
                <TabsTrigger value="education" className="data-[state=active]:bg-cyan-300 data-[state=active]:text-black py-2 px-3 text-xs sm:text-sm font-medium rounded-xl transition-all hover:bg-cyan-50 hover:text-cyan-700">Education</TabsTrigger>
                <TabsTrigger value="skills" className="data-[state=active]:bg-cyan-300 data-[state=active]:text-black py-2 px-3 text-xs sm:text-sm font-medium rounded-xl transition-all hover:bg-cyan-50 hover:text-cyan-700">Skills & Services</TabsTrigger>
              </TabsList>

              <TabsContent value="personal">
                <TabRenderer activeTab="personal" user={user} age={age} />
              </TabsContent>

              <TabsContent value="medical">
                <TabRenderer activeTab="medical" user={user} age={age} />
              </TabsContent>

              <TabsContent value="family">
                <TabRenderer activeTab="family" user={user} age={age} />
              </TabsContent>

              <TabsContent value="education">
                <TabRenderer activeTab="education" user={user} age={age} />
              </TabsContent>

              <TabsContent value="skills">
                <TabRenderer activeTab="skills" user={user} age={age} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PrivateLayout>
  );
};

export default Profile;

