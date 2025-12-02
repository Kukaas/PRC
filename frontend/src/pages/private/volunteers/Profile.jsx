import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../components/AuthContext';
import PrivateLayout from '../../../layout/PrivateLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import TabRenderer from './components/profile/TabRenderer';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';
import { Edit, Save } from 'lucide-react';

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
  const { user, updateProfile } = useAuth();
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const initialFormData = useMemo(() => ({
    // Top-level
    givenName: user?.givenName || '',
    familyName: user?.familyName || '',
    middleName: user?.middleName || '',
    dateOfBirth: user?.dateOfBirth || '',
    photo: user?.photo || '',
    idPhoto: user?.idPhoto || '',
    // Personal info
    nickname: user?.personalInfo?.nickname || '',
    sex: user?.personalInfo?.sex || '',
    birthPlace: user?.personalInfo?.birthPlace || '',
    height: user?.personalInfo?.height ?? '',
    weight: user?.personalInfo?.weight ?? '',
    civilStatus: user?.personalInfo?.civilStatus || '',
    spouseName: user?.personalInfo?.spouseName || '',
    contactNumber: user?.personalInfo?.contactNumber || '',
    numberOfChildren: user?.personalInfo?.numberOfChildren ?? '',
    mobileNumber: user?.personalInfo?.mobileNumber || '',
    landlineNumber: user?.personalInfo?.landlineNumber || '',
    address: {
      houseNo: user?.personalInfo?.address?.houseNo || '',
      streetBlockLot: user?.personalInfo?.address?.streetBlockLot || '',
      districtBarangayVillage: user?.personalInfo?.address?.districtBarangayVillage || '',
      municipalityCity: user?.personalInfo?.address?.municipalityCity || '',
      province: user?.personalInfo?.address?.province || '',
      zipcode: user?.personalInfo?.address?.zipcode || '',
    },
    // Medical history
    medicalHistory: {
      preExistingConditions: user?.medicalHistory?.preExistingConditions || '',
      currentMedications: user?.medicalHistory?.currentMedications || '',
      bloodType: user?.medicalHistory?.bloodType || '',
      emergencyContact: {
        immediateFamily: {
          name: user?.medicalHistory?.emergencyContact?.immediateFamily?.name || '',
          relationship: user?.medicalHistory?.emergencyContact?.immediateFamily?.relationship || '',
          landlineNumber: user?.medicalHistory?.emergencyContact?.immediateFamily?.landlineNumber || '',
          mobileNumber: user?.medicalHistory?.emergencyContact?.immediateFamily?.mobileNumber || '',
        },
        other: {
          name: user?.medicalHistory?.emergencyContact?.other?.name || '',
          relationship: user?.medicalHistory?.emergencyContact?.other?.relationship || '',
          landlineNumber: user?.medicalHistory?.emergencyContact?.other?.landlineNumber || '',
          mobileNumber: user?.medicalHistory?.emergencyContact?.other?.mobileNumber || '',
        }
      }
    },
    // Family background
    familyBackground: {
      father: {
        name: user?.familyBackground?.father?.name || '',
        age: user?.familyBackground?.father?.age ?? '',
        occupation: user?.familyBackground?.father?.occupation || '',
      },
      mother: {
        name: user?.familyBackground?.mother?.name || '',
        age: user?.familyBackground?.mother?.age ?? '',
        occupation: user?.familyBackground?.mother?.occupation || '',
      },
      numberOfSiblings: user?.familyBackground?.numberOfSiblings ?? '',
      positionInFamily: user?.familyBackground?.positionInFamily || '',
    },
    // Educational background
    educationalBackground: {
      elementary: {
        school: user?.educationalBackground?.elementary?.school || '',
        yearGraduated: user?.educationalBackground?.elementary?.yearGraduated ?? '',
        honorsAwards: user?.educationalBackground?.elementary?.honorsAwards || '',
      },
      highSchool: {
        school: user?.educationalBackground?.highSchool?.school || '',
        yearGraduated: user?.educationalBackground?.highSchool?.yearGraduated ?? '',
        honorsAwards: user?.educationalBackground?.highSchool?.honorsAwards || '',
      },
      vocational: {
        school: user?.educationalBackground?.vocational?.school || '',
        yearGraduated: user?.educationalBackground?.vocational?.yearGraduated ?? '',
        honorsAwards: user?.educationalBackground?.vocational?.honorsAwards || '',
      },
      higherStudies: {
        school: user?.educationalBackground?.higherStudies?.school || '',
        yearGraduated: user?.educationalBackground?.higherStudies?.yearGraduated ?? '',
        honorsAwards: user?.educationalBackground?.higherStudies?.honorsAwards || '',
      },
      college: {
        school: user?.educationalBackground?.college?.school || '',
        course: user?.educationalBackground?.college?.course || '',
        yearGraduated: user?.educationalBackground?.college?.yearGraduated ?? '',
        honorsAwards: user?.educationalBackground?.college?.honorsAwards || '',
      },
    },
    // Skills & Services
    skills: Array.isArray(user?.skills) ? [...user.skills] : [],
    services: Array.isArray(user?.services)
      ? user.services.map((s) => (typeof s === 'string' ? s : s?.type)).filter(Boolean)
      : [],
    // Additional info
    socioCivicInvolvements: Array.isArray(user?.socioCivicInvolvements) ? user.socioCivicInvolvements.map((i) => ({ ...i })) : [],
    workExperience: Array.isArray(user?.workExperience) ? user.workExperience.map((w) => ({ ...w })) : [],
  }), [user]);

  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => {
      // Helper to set deep path values like a.b.c
      const setDeep = (obj, path, val) => {
        const keys = path.split('.');
        const newObj = { ...obj };
        let cursor = newObj;
        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];
          cursor[key] = typeof cursor[key] === 'object' && cursor[key] !== null ? { ...cursor[key] } : {};
          cursor = cursor[key];
        }
        const lastKey = keys[keys.length - 1];
        cursor[lastKey] = type === 'number' ? Number(val) : val;
        return newObj;
      };

      if (name.includes('.')) {
        return setDeep(prev, name, value);
      }

      return { ...prev, [name]: type === 'number' ? Number(value) : value };
    });
  };

  const handleEdit = () => {
    setFormData(initialFormData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        givenName: formData.givenName,
        familyName: formData.familyName,
        middleName: formData.middleName,
        dateOfBirth: formData.dateOfBirth,
        photo: formData.photo,
        idPhoto: formData.idPhoto,
        personalInfo: {
          nickname: formData.nickname,
          sex: formData.sex,
          birthPlace: formData.birthPlace,
          height: formData.height === '' ? undefined : Number(formData.height),
          weight: formData.weight === '' ? undefined : Number(formData.weight),
          civilStatus: formData.civilStatus,
          spouseName: formData.spouseName,
          contactNumber: formData.contactNumber,
          numberOfChildren: formData.numberOfChildren === '' ? undefined : Number(formData.numberOfChildren),
          mobileNumber: formData.mobileNumber,
          landlineNumber: formData.landlineNumber,
          address: {
            houseNo: formData.address.houseNo,
            streetBlockLot: formData.address.streetBlockLot,
            districtBarangayVillage: formData.address.districtBarangayVillage,
            municipalityCity: formData.address.municipalityCity,
            province: formData.address.province,
            zipcode: formData.address.zipcode,
          },
        },
        medicalHistory: formData.medicalHistory,
        familyBackground: {
          ...formData.familyBackground,
          father: {
            ...formData.familyBackground.father,
            age: formData.familyBackground.father.age === '' ? undefined : Number(formData.familyBackground.father.age),
          },
          mother: {
            ...formData.familyBackground.mother,
            age: formData.familyBackground.mother.age === '' ? undefined : Number(formData.familyBackground.mother.age),
          },
          numberOfSiblings: formData.familyBackground.numberOfSiblings === '' ? undefined : Number(formData.familyBackground.numberOfSiblings),
        },
        educationalBackground: formData.educationalBackground,
        skills: formData.skills,
        services: formData.services,
      };
      await updateProfile(payload);
      setIsEditing(false);
      toast.success("Profile updated successfully")
    } catch (err) {
      // Errors are surfaced via toast at a higher level typically; keep UX simple here
      console.error(err);
      toast.error("Error updating profile, please try again later.")
    } finally {
      setSaving(false);
    }
  };

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

  const age = isEditing
    ? (formData?.dateOfBirth ? calculateAge(formData.dateOfBirth) : null)
    : (user?.personalInfo?.age || calculateAge(user?.dateOfBirth));

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
      <div className="min-h-screen bg-blue-50">
        <div className="px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
          <div className='flex flex-row justify-between'>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600 mt-1">View and manage your profile</p>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="secondary" onClick={handleCancel} disabled={saving}>Cancel</Button>
                  <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2" disabled={saving}> <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}</Button>
                </>
              ) : (
                <Button onClick={handleEdit} className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2">
                  <Edit className="w-4 h-4" /> Edit Profile
                </Button>
              )}
            </div>
          </div>



          {/* Tabs Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
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
                  <TabRenderer activeTab="personal" user={user} age={age} isEditing={isEditing} formData={formData} handleChange={handleChange} setFormData={setFormData} />
                </TabsContent>

                <TabsContent value="medical">
                  <TabRenderer activeTab="medical" user={user} age={age} isEditing={isEditing} formData={formData} handleChange={handleChange} setFormData={setFormData} />
                </TabsContent>

                <TabsContent value="family">
                  <TabRenderer activeTab="family" user={user} age={age} isEditing={isEditing} formData={formData} handleChange={handleChange} setFormData={setFormData} />
                </TabsContent>

                <TabsContent value="education">
                  <TabRenderer activeTab="education" user={user} age={age} isEditing={isEditing} formData={formData} handleChange={handleChange} setFormData={setFormData} />
                </TabsContent>

                <TabsContent value="skills">
                  <TabRenderer activeTab="skills" user={user} age={age} isEditing={isEditing} formData={formData} handleChange={handleChange} setFormData={setFormData} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </PrivateLayout>
  );
};

export default Profile;

