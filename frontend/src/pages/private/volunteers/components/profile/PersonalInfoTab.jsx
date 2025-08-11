import React, { useEffect, useState } from 'react';
import { User, Phone, Home } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CustomInput from '@/components/CustomInput';
import axios from 'axios';
import { PSGC_API_URL } from '@/services/api';

const PersonalInfoTab = ({ user, age, isEditing = false, formData, handleChange }) => {
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

  // PSGC editing state (only used when isEditing)
  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingMunicipalities, setIsLoadingMunicipalities] = useState(false);
  const [isLoadingBarangays, setIsLoadingBarangays] = useState(false);

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  // Prefill selectors based on existing address names by looking up codes (best-effort)
  useEffect(() => {
    if (!isEditing) return;
    const init = async () => {
      await fetchProvinces();
    };
    init();
  }, [isEditing]);

  // When provinces are loaded, try to preselect province based on formData.address.province (name)
  useEffect(() => {
    if (!isEditing) return;
    if (!provinces.length) return;
    if (!formData?.address?.province) return;
    if (selectedProvince) return;

    const match = provinces.find((p) => (p.name || '').toLowerCase() === (formData.address.province || '').toLowerCase());
    if (match) {
      setSelectedProvince(match.code);
      fetchMunicipalities(match.code);
    }
  }, [isEditing, provinces, formData?.address?.province, selectedProvince]);

  // When municipalities are loaded, try to preselect municipality/city based on formData.address.municipalityCity (name)
  useEffect(() => {
    if (!isEditing) return;
    if (!municipalities.length) return;
    if (!formData?.address?.municipalityCity) return;
    if (selectedMunicipality) return;

    const match = municipalities.find((m) => (m.name || '').toLowerCase() === (formData.address.municipalityCity || '').toLowerCase());
    if (match) {
      setSelectedMunicipality(match.code);
      fetchBarangays(match.code);
    }
  }, [isEditing, municipalities, formData?.address?.municipalityCity, selectedMunicipality]);

  // When barangays are loaded, try to preselect barangay based on formData.address.districtBarangayVillage (name)
  useEffect(() => {
    if (!isEditing) return;
    if (!barangays.length) return;
    if (!formData?.address?.districtBarangayVillage) return;
    if (selectedBarangay) return;

    const match = barangays.find((b) => (b.name || '').toLowerCase() === (formData.address.districtBarangayVillage || '').toLowerCase());
    if (match) {
      setSelectedBarangay(match.code);
    }
  }, [isEditing, barangays, formData?.address?.districtBarangayVillage, selectedBarangay]);

  const fetchProvinces = async () => {
    setIsLoadingProvinces(true);
    try {
      const response = await axios.get(`${PSGC_API_URL}/provinces/`);
      setProvinces(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingProvinces(false);
    }
  };

  const fetchMunicipalities = async (provinceCode) => {
    if (!provinceCode) return;
    setIsLoadingMunicipalities(true);
    try {
      const response = await axios.get(`${PSGC_API_URL}/provinces/${provinceCode}/municipalities/`);
      setMunicipalities(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingMunicipalities(false);
    }
  };

  const fetchBarangays = async (municipalityCode) => {
    if (!municipalityCode) return;
    setIsLoadingBarangays(true);
    try {
      const response = await axios.get(`${PSGC_API_URL}/municipalities/${municipalityCode}/barangays/`);
      setBarangays(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingBarangays(false);
    }
  };

  const handleProvinceChange = (e) => {
    const provinceCode = e.target.value;
    setSelectedProvince(provinceCode);
    setSelectedMunicipality('');
    setSelectedBarangay('');
    setMunicipalities([]);
    setBarangays([]);

    const event = {
      target: {
        name: 'address.province',
        value: provinces.find((p) => p.code === provinceCode)?.name || ''
      }
    };
    handleChange(event);
    if (provinceCode) fetchMunicipalities(provinceCode);
  };

  const handleMunicipalityChange = (e) => {
    const municipalityCode = e.target.value;
    setSelectedMunicipality(municipalityCode);
    setSelectedBarangay('');
    setBarangays([]);

    const event = {
      target: {
        name: 'address.municipalityCity',
        value: municipalities.find((m) => m.code === municipalityCode)?.name || ''
      }
    };
    handleChange(event);
    if (municipalityCode) fetchBarangays(municipalityCode);
  };

  const handleBarangayChange = (e) => {
    const barangayCode = e.target.value;
    setSelectedBarangay(barangayCode);
    const event = {
      target: {
        name: 'address.districtBarangayVillage',
        value: barangays.find((b) => b.code === barangayCode)?.name || ''
      }
    };
    handleChange(event);
  };

  if (isEditing) {
    const defaultDate = formatDateForInput(formData?.dateOfBirth || user?.dateOfBirth);
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Edit Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CustomInput label="First Name" name="givenName" type="text" value={formData.givenName} onChange={handleChange} required />
              <CustomInput label="Last Name" name="familyName" type="text" value={formData.familyName} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CustomInput label="Middle Name" name="middleName" type="text" value={formData.middleName} onChange={handleChange} />
              <CustomInput label="Nickname" name="nickname" type="text" value={formData.nickname} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CustomInput label="Date of Birth" name="dateOfBirth" type="date" value={defaultDate} onChange={handleChange} required />
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Age</label>
                <div className="h-10 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900">
                  {age ? `${age} years old` : 'Enter birth date to calculate age'}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CustomInput label="Sex" name="sex" type="select" value={formData.sex} onChange={handleChange} required>
                <option value="">Select sex</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </CustomInput>
              <CustomInput label="Birth Place" name="birthPlace" type="text" value={formData.birthPlace} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CustomInput label="Civil Status" name="civilStatus" type="select" value={formData.civilStatus} onChange={handleChange} required>
                <option value="">Select civil status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Separated">Separated</option>
              </CustomInput>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CustomInput label="Height (cm)" name="height" type="number" value={formData.height} onChange={handleChange} required />
              <CustomInput label="Weight (kg)" name="weight" type="number" value={formData.weight} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CustomInput label="Mobile Number" name="mobileNumber" type="tel" value={formData.mobileNumber} onChange={handleChange} required />
              <CustomInput label="Contact Number" name="contactNumber" type="tel" value={formData.contactNumber} onChange={handleChange} />
            </div>
            <CustomInput label="Landline Number" name="landlineNumber" type="tel" value={formData.landlineNumber} onChange={handleChange} />

            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Address</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <CustomInput label="Province" name="province" type="select" value={selectedProvince} onChange={handleProvinceChange} required>
                  <option value="">Province</option>
                  {provinces.map((province) => (
                    <option key={province.code} value={province.code}>{province.name}</option>
                  ))}
                </CustomInput>
                <CustomInput label="Municipality/City" name="municipality" type="select" value={selectedMunicipality} onChange={handleMunicipalityChange} required disabled={!selectedProvince}>
                  <option value="">Municipality/City</option>
                  {municipalities.map((municipality) => (
                    <option key={municipality.code} value={municipality.code}>{municipality.name}</option>
                  ))}
                </CustomInput>
                <CustomInput label="Barangay" name="barangay" type="select" value={selectedBarangay} onChange={handleBarangayChange} required disabled={!selectedMunicipality}>
                  <option value="">Barangay</option>
                  {barangays.map((barangay) => (
                    <option key={barangay.code} value={barangay.code}>{barangay.name}</option>
                  ))}
                </CustomInput>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {isLoadingProvinces && <p className="text-xs text-gray-500">Loading provinces...</p>}
                {isLoadingMunicipalities && <p className="text-xs text-gray-500">Loading municipalities...</p>}
                {isLoadingBarangays && <p className="text-xs text-gray-500">Loading barangays...</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomInput label="House No." name="address.houseNo" type="text" value={formData.address?.houseNo || ''} onChange={handleChange} />
                <CustomInput label="Street/Block/Lot" name="address.streetBlockLot" type="text" value={formData.address?.streetBlockLot || ''} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomInput label="Zip Code" name="address.zipcode" type="text" value={formData.address?.zipcode || ''} onChange={handleChange} required />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Full Name Display */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6 border border-blue-200">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
            {user?.givenName} {user?.middleName} {user?.familyName}
          </h2>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-gray-600 text-sm sm:text-base">
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
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Personal Identification</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-600">Last Name</label>
              <p className="text-sm sm:text-base text-gray-900 font-medium">{user?.familyName || 'Not provided'}</p>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-600">First Name</label>
              <p className="text-sm sm:text-base text-gray-900 font-medium">{user?.givenName || 'Not provided'}</p>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-600">Middle Name</label>
              <p className="text-sm sm:text-base text-gray-900 font-medium">{user?.middleName || 'Not provided'}</p>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-600">Nickname</label>
              <p className="text-sm sm:text-base text-gray-900 font-medium">{user?.personalInfo?.nickname || 'Not provided'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Details */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Personal Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-600">Gender</label>
              <p className="text-sm sm:text-base text-gray-900 font-medium capitalize">{user?.personalInfo?.sex || 'Not provided'}</p>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-600">Date of Birth / Age</label>
              <p className="text-sm sm:text-base text-gray-900 font-medium">
                {user?.dateOfBirth ? formatDate(user.dateOfBirth) : 'Not provided'}
                {age && ` (${age} years old)`}
              </p>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-600">Place of Birth</label>
              <p className="text-sm sm:text-base text-gray-900 font-medium">{user?.personalInfo?.birthPlace || 'Not provided'}</p>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-600">Civil Status</label>
              <p className="text-sm sm:text-base text-gray-900 font-medium">{user?.personalInfo?.civilStatus || 'Not provided'}</p>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-600">Spouse Name</label>
              <p className="text-sm sm:text-base text-gray-900 font-medium">{user?.personalInfo?.spouseName || 'Not provided'}</p>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-600">Number of Children</label>
              <p className="text-sm sm:text-base text-gray-900 font-medium">{user?.personalInfo?.numberOfChildren || 'Not provided'}</p>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-600">Height (cm)</label>
              <p className="text-sm sm:text-base text-gray-900 font-medium">{user?.personalInfo?.height ? `${user.personalInfo.height}cm` : 'Not provided'}</p>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-600">Weight (kg)</label>
              <p className="text-sm sm:text-base text-gray-900 font-medium">{user?.personalInfo?.weight ? `${user.personalInfo.weight}kg` : 'Not provided'}</p>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-600">Blood Type</label>
              <p className="text-sm sm:text-base text-gray-900 font-medium">{user?.medicalHistory?.bloodType || 'Not provided'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
            <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Contact Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-600">Email</label>
              <p className="text-sm sm:text-base text-gray-900 font-medium break-all">{user?.email || 'Not provided'}</p>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-600">Mobile Number</label>
              <p className="text-sm sm:text-base text-gray-900 font-medium">{user?.personalInfo?.mobileNumber || 'Not provided'}</p>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-600">Landline Number</label>
              <p className="text-sm sm:text-base text-gray-900 font-medium">{user?.personalInfo?.landlineNumber || 'Not provided'}</p>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-600">Contact Number</label>
              <p className="text-sm sm:text-base text-gray-900 font-medium">{user?.personalInfo?.contactNumber || 'Not provided'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Residential Address */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Residential Address</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-600">House Number</label>
              <p className="text-sm sm:text-base text-gray-900 font-medium">{user?.personalInfo?.address?.houseNo || 'Not provided'}</p>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-600">Street/Block/Lot</label>
              <p className="text-sm sm:text-base text-gray-900 font-medium">{user?.personalInfo?.address?.streetBlockLot || 'Not provided'}</p>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-600">District/Barangay/Village</label>
              <p className="text-sm sm:text-base text-gray-900 font-medium">{user?.personalInfo?.address?.districtBarangayVillage || 'Not provided'}</p>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-600">Municipality/City</label>
              <p className="text-sm sm:text-base text-gray-900 font-medium">{user?.personalInfo?.address?.municipalityCity || 'Not provided'}</p>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-600">Province</label>
              <p className="text-sm sm:text-base text-gray-900 font-medium">{user?.personalInfo?.address?.province || 'Not provided'}</p>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-600">Zip Code</label>
              <p className="text-sm sm:text-base text-gray-900 font-medium">{user?.personalInfo?.address?.zipcode || 'Not provided'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalInfoTab;
