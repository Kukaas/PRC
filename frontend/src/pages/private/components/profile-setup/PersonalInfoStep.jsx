import React from "react";
import CustomInput from "../../../../components/CustomInput";
import { useAuth } from "@/components/AuthContext";

const PersonalInfoStep = ({ formData, handleChange, errors }) => {
  const { user } = useAuth();

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

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        Personal Information
      </h3>

      {/* Name Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <CustomInput
           label="First Name"
           name="givenName"
           type="text"
           placeholder="Enter your first name"
           value={formData.givenName || user?.givenName || ""}
           onChange={handleChange}
           required
           error={errors.givenName}
         />
                   <CustomInput
            label="Last Name"
            name="familyName"
            type="text"
            placeholder="Enter your last name"
            value={formData.familyName || user?.familyName || ""}
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
           value={formData.middleName || user?.middleName || ""}
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
          label="Sex"
          name="sex"
          type="select"
          value={formData.sex}
          onChange={handleChange}
          required
          error={errors.sex}
        >
          <option value="">Select sex</option>
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
          label="Birth Place"
          name="birthPlace"
          type="text"
          placeholder="Enter your birth place"
          value={formData.birthPlace}
          onChange={handleChange}
          required
          error={errors.birthPlace}
        />
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CustomInput
          label="Mobile Number"
          name="mobileNumber"
          type="tel"
          placeholder="Enter your mobile number"
          value={formData.mobileNumber}
          onChange={handleChange}
          required
          error={errors.mobileNumber}
        />
        <CustomInput
          label="Contact Number"
          name="contactNumber"
          type="tel"
          placeholder="Enter contact number (optional)"
          value={formData.contactNumber}
          onChange={handleChange}
          error={errors.contactNumber}
        />
      </div>

      <CustomInput
        label="Landline Number"
        name="landlineNumber"
        type="tel"
        placeholder="Enter landline number (optional)"
        value={formData.landlineNumber}
        onChange={handleChange}
        error={errors.landlineNumber}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CustomInput
          label="Spouse Name"
          name="spouseName"
          type="text"
          placeholder="Enter spouse name (if applicable)"
          value={formData.spouseName}
          onChange={handleChange}
          error={errors.spouseName}
        />
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

      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">Address</h4>
        <p className="text-sm text-gray-500 mb-4">
          For optional fields like house number or street, you can enter
          "N/A" if not applicable.
        </p>
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
            label="District/Barangay/Village"
            name="address.districtBarangayVillage"
            type="text"
            placeholder="Enter district/barangay/village"
            value={formData.address.districtBarangayVillage}
            onChange={handleChange}
            required
            error={errors["address.districtBarangayVillage"]}
          />
          <CustomInput
            label="Municipality/City"
            name="address.municipalityCity"
            type="text"
            placeholder="Enter municipality/city"
            value={formData.address.municipalityCity}
            onChange={handleChange}
            required
            error={errors["address.municipalityCity"]}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CustomInput
            label="Province"
            name="address.province"
            type="text"
            placeholder="Enter province"
            value={formData.address.province}
            onChange={handleChange}
            required
            error={errors["address.province"]}
          />
          <CustomInput
            label="Zip Code"
            name="address.zipcode"
            type="text"
            placeholder="Enter zip code"
            value={formData.address.zipcode}
            onChange={handleChange}
            required
            error={errors["address.zipcode"]}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoStep;
