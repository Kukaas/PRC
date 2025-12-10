import React, { useState, useEffect, useRef } from "react";
import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "axios";
import CustomInput from "../../../../components/CustomInput";
import { useAuth } from "@/components/AuthContext";
import { PSGC_API_URL } from "@/services/api";

// Zip code mapping by municipality
const getZipCodeByMunicipality = (municipalityName) => {
  const zipCodeMap = {
    "Boac": "4900",
    "Mogpog": "4901",
    "Santa Cruz": "4902",
    "Torrijos": "4903",
    "Buenavista": "4904",
    "Gasan": "4905"
  };

  // Return zip code if municipality exists in map
  return zipCodeMap[municipalityName] || null;
};

const PersonalInfoStep = ({ formData, handleChange, errors }) => {
  const { user } = useAuth();

  // PSGC API state
  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState("");
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingMunicipalities, setIsLoadingMunicipalities] = useState(false);
  const [isLoadingBarangays, setIsLoadingBarangays] = useState(false);

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

  // Format date for HTML date input (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split('T')[0];
  };

  const userAge = calculateAge(formData.dateOfBirth || user?.dateOfBirth);
  const defaultDateOfBirth = formatDateForInput(formData.dateOfBirth || user?.dateOfBirth);

  // PSGC API functions
  const fetchProvinces = async () => {
    setIsLoadingProvinces(true);
    try {
      const response = await axios.get(`${PSGC_API_URL}/provinces/`);
      setProvinces(response.data);
    } catch (error) {
      console.error('Error fetching provinces:', error);
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
    } catch (error) {
      console.error('Error fetching municipalities:', error);
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
    } catch (error) {
      console.error('Error fetching barangays:', error);
    } finally {
      setIsLoadingBarangays(false);
    }
  };

  // Handle province selection
  const handleProvinceChange = (e) => {
    const provinceCode = e.target.value;
    setSelectedProvince(provinceCode);
    setSelectedMunicipality("");
    setSelectedBarangay("");
    setMunicipalities([]);
    setBarangays([]);

    // Update form data
    const event = {
      target: {
        name: "address.province",
        value: provinces.find(p => p.code === provinceCode)?.name || ""
      }
    };
    handleChange(event);

    if (provinceCode) {
      fetchMunicipalities(provinceCode);
    }
  };

  // Handle municipality selection
  const handleMunicipalityChange = (e) => {
    const municipalityCode = e.target.value;
    setSelectedMunicipality(municipalityCode);
    setSelectedBarangay("");
    setBarangays([]);

    // Update form data
    const event = {
      target: {
        name: "address.municipalityCity",
        value: municipalities.find(m => m.code === municipalityCode)?.name || ""
      }
    };
    handleChange(event);

    // Auto-fill zip code based on selected municipality
    const selectedMunicipalityData = municipalities.find(m => m.code === municipalityCode);
    if (selectedMunicipalityData) {
      const zipCode = getZipCodeByMunicipality(selectedMunicipalityData.name);
      if (zipCode) {
        const zipEvent = {
          target: {
            name: "address.zipcode",
            value: zipCode
          }
        };
        handleChange(zipEvent);
      }
    }

    if (municipalityCode) {
      fetchBarangays(municipalityCode);
    }
  };

  // Handle barangay selection
  const handleBarangayChange = (e) => {
    const barangayCode = e.target.value;
    setSelectedBarangay(barangayCode);

    // Update form data
    const event = {
      target: {
        name: "address.districtBarangayVillage",
        value: barangays.find(b => b.code === barangayCode)?.name || ""
      }
    };
    handleChange(event);

    // Auto-fill zip code based on selected municipality
    const selectedMunicipalityData = municipalities.find(m => m.code === selectedMunicipality);
    if (selectedMunicipalityData) {
      const zipCode = getZipCodeByMunicipality(selectedMunicipalityData.name);
      if (zipCode) {
        const zipEvent = {
          target: {
            name: "address.zipcode",
            value: zipCode
          }
        };
        handleChange(zipEvent);
      }
    }
  };

  // Load provinces on component mount
  useEffect(() => {
    fetchProvinces();
  }, []);

  const fileInputRef = useRef(null);
  const idPhotoInputRef = useRef(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleIdPhotoClick = () => {
    idPhotoInputRef.current?.click();
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (3MB)
    if (file.size > 3 * 1024 * 1024) {
      alert('File size exceeds 3MB');
      return;
    }

    try {
      const base64Photo = await convertToBase64(file);

      // Update form data
      handleChange({
        target: {
          name: 'photo',
          value: base64Photo
        }
      });
    } catch (error) {
      console.error('Error processing photo:', error);
      alert('Failed to process photo. Please try again.');
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleIdPhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (3MB)
    if (file.size > 3 * 1024 * 1024) {
      alert('File size exceeds 3MB');
      return;
    }

    try {
      const base64Photo = await convertToBase64(file);

      // Update form data
      handleChange({
        target: {
          name: 'idPhoto',
          value: base64Photo
        }
      });
    } catch (error) {
      console.error('Error processing ID photo:', error);
      alert('Failed to process ID photo. Please try again.');
    } finally {
      // Reset file input
      if (idPhotoInputRef.current) {
        idPhotoInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        Personal Information
      </h3>

      {/* Photo Upload Section */}
      <div className="flex justify-center gap-8 mb-8">
        {/* Profile Photo */}
        <div className="relative group">
          <button
            onClick={handleAvatarClick}
            className="relative cursor-pointer transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 rounded-full"
            type="button"
          >
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              <AvatarImage
                src={formData.photo}
                alt="Profile Photo"
                className="object-cover"
              />
              <AvatarFallback className="text-2xl bg-gray-100 text-gray-400">
                {(formData.givenName?.charAt(0) || "") + (formData.familyName?.charAt(0) || "")}
              </AvatarFallback>
            </Avatar>

            {/* Upload overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </button>

          {/* File input (hidden) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />

          <p className="text-xs text-center text-gray-500 mt-2 font-medium">
            Profile Photo
          </p>
          <p className="text-xs text-center text-gray-400 mt-1">
            (Max 3MB)
          </p>
        </div>

        {/* 2x2 ID Photo */}
        <div className="relative group">
          <button
            onClick={handleIdPhotoClick}
            className="relative cursor-pointer transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-md overflow-hidden"
            type="button"
          >
            <div className="h-32 w-32 border-4 border-white shadow-lg bg-gray-50 flex items-center justify-center">
              {formData.idPhoto ? (
                <img
                  src={formData.idPhoto}
                  alt="2x2 ID Photo"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center p-2">
                  <Camera className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">2x2 ID</p>
                </div>
              )}
            </div>

            {/* Upload overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </button>

          {/* File input (hidden) */}
          <input
            ref={idPhotoInputRef}
            type="file"
            accept="image/*"
            onChange={handleIdPhotoUpload}
            className="hidden"
          />

          <p className="text-xs text-center text-gray-500 mt-2 font-medium">
            2x2 ID Photo
          </p>
          <p className="text-xs text-center text-gray-400 mt-1">
            (Max 3MB)
          </p>
        </div>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CustomInput
          label="First Name"
          name="givenName"
          type="text"
          placeholder="Enter your first name"
          value={formData.givenName || ""}
          onChange={handleChange}
          required
          error={errors.givenName}
        />
        <CustomInput
          label="Last Name"
          name="familyName"
          type="text"
          placeholder="Enter your last name"
          value={formData.familyName || ""}
          onChange={handleChange}
          required
          error={errors.familyName}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CustomInput
          label="Middle Name"
          name="middleName"
          type="text"
          placeholder="Enter your middle name (optional)"
          value={formData.middleName || ""}
          onChange={handleChange}
          error={errors.middleName}
        />
        <CustomInput
          label="Nickname"
          name="nickname"
          type="text"
          placeholder="Enter your nickname"
          value={formData.nickname}
          onChange={handleChange}
          required
          error={errors.nickname}
        />
      </div>

      {/* Birth Date and Age */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CustomInput
          label="Date of Birth"
          name="dateOfBirth"
          type="date"
          placeholder="Select your birth date"
          value={defaultDateOfBirth}
          onChange={handleChange}
          required
          error={errors.dateOfBirth}
          disabled={true}
        />
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">Age</label>
          <div className="h-10 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900">
            {userAge ? `${userAge} years old` : 'Enter birth date to calculate age'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CustomInput
          label="Gender"
          name="sex"
          type="select"
          value={formData.sex}
          onChange={handleChange}
          required
          error={errors.sex}
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </CustomInput>
        <CustomInput
          label="Birth Place"
          name="birthPlace"
          type="text"
          placeholder="Enter your birth place"
          value={formData.birthPlace}
          onChange={handleChange}
          required
          error={errors.birthPlace}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CustomInput
          label="Civil Status"
          name="civilStatus"
          type="select"
          value={formData.civilStatus}
          onChange={handleChange}
          required
          error={errors.civilStatus}
        >
          <option value="">Select civil status</option>
          <option value="Single">Single</option>
          <option value="Married">Married</option>
          <option value="Widowed">Widowed</option>
          <option value="Separated">Separated</option>
        </CustomInput>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CustomInput
          label="Height (cm)"
          name="height"
          type="number"
          placeholder="Enter your height in cm"
          value={formData.height}
          onChange={handleChange}
          required
          error={errors.height}
        />
        <CustomInput
          label="Weight (kg)"
          name="weight"
          type="number"
          placeholder="Enter your weight in kg"
          value={formData.weight}
          onChange={handleChange}
          required
          error={errors.weight}
        />
      </div>

      <CustomInput
        label="Mobile Number"
        name="mobileNumber"
        type="tel"
        placeholder="Enter your mobile number (11 digits)"
        value={formData.mobileNumber}
        onChange={handleChange}
        required
        error={errors.mobileNumber}
        maxLength={11}
        pattern="[0-9]{11}"
      />

      <CustomInput
        label="Landline Number"
        name="landlineNumber"
        type="tel"
        placeholder="Enter landline number (optional)"
        value={formData.landlineNumber}
        onChange={handleChange}
        error={errors.landlineNumber}
      />

      {formData.civilStatus === "Married" && (
        <div className="space-y-4 border-t pt-4 mt-4">
          <h4 className="font-medium text-gray-700">Spouse Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CustomInput
              label="Spouse Name"
              name="spouseName"
              type="text"
              placeholder="Enter spouse name"
              value={formData.spouseName}
              onChange={handleChange}
              required
              error={errors.spouseName}
            />
            <CustomInput
              label="Contact Number (Spouse)"
              name="contactNumber"
              type="tel"
              placeholder="Enter spouse contact number (11 digits)"
              value={formData.contactNumber}
              onChange={handleChange}
              required
              error={errors.contactNumber}
              maxLength={11}
              pattern="[0-9]{11}"
            />
          </div>
          <CustomInput
            label="Number of Children"
            name="numberOfChildren"
            type="number"
            placeholder="Enter number of children"
            value={formData.numberOfChildren}
            onChange={handleChange}
            error={errors.numberOfChildren}
          />
        </div>
      )}

      <div className="space-y-2">
        <h4 className="font-medium text-gray-700">Address</h4>
        <p className="text-sm text-gray-500 mb-4">
          Select your location from the dropdowns below, then enter additional details.
        </p>

        {/* PSGC Location Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CustomInput
            label="Province"
            name="province"
            type="select"
            value={selectedProvince}
            onChange={handleProvinceChange}
            required
            error={errors.province}
          >
            <option value="">Province</option>
            {provinces.map((province) => (
              <option key={province.code} value={province.code}>
                {province.name}
              </option>
            ))}
          </CustomInput>

          <CustomInput
            label="Municipality/City"
            name="municipality"
            type="select"
            value={selectedMunicipality}
            onChange={handleMunicipalityChange}
            required
            error={errors.municipality}
            disabled={!selectedProvince}
          >
            <option value="">Municipality/City</option>
            {municipalities.map((municipality) => (
              <option key={municipality.code} value={municipality.code}>
                {municipality.name}
              </option>
            ))}
          </CustomInput>

          <CustomInput
            label="Barangay"
            name="barangay"
            type="select"
            value={selectedBarangay}
            onChange={handleBarangayChange}
            required
            error={errors.barangay}
            disabled={!selectedMunicipality}
          >
            <option value="">Barangay</option>
            {barangays.map((barangay) => (
              <option key={barangay.code} value={barangay.code}>
                {barangay.name}
              </option>
            ))}
          </CustomInput>
        </div>

        {/* Loading States */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {isLoadingProvinces && (
            <p className="text-xs text-gray-500">Loading provinces...</p>
          )}
          {isLoadingMunicipalities && (
            <p className="text-xs text-gray-500">Loading municipalities...</p>
          )}
          {isLoadingBarangays && (
            <p className="text-xs text-gray-500">Loading barangays...</p>
          )}
        </div>

        {/* Additional Address Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CustomInput
            label="House No."
            name="address.houseNo"
            type="text"
            placeholder="Enter house number (optional)"
            value={formData.address.houseNo}
            onChange={handleChange}
            error={errors["address.houseNo"]}
          />
          <CustomInput
            label="Street/Block/Lot"
            name="address.streetBlockLot"
            type="text"
            placeholder="Enter street/block/lot (optional)"
            value={formData.address.streetBlockLot}
            onChange={handleChange}
            error={errors["address.streetBlockLot"]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CustomInput
            label="Postal Code"
            name="address.zipcode"
            type="text"
            placeholder="Enter postal code"
            value={formData.address.zipcode}
            onChange={handleChange}
            disabled={true}
            required
            error={errors["address.zipcode"]}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoStep;
