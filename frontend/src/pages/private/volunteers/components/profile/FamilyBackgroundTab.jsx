import React from 'react';
import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CustomInput from '@/components/CustomInput';

const FamilyBackgroundTab = ({ user, isEditing = false, formData, handleChange }) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Family Background</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div className="border rounded-lg p-3 sm:p-4">
                  <h4 className="font-medium mb-2 text-sm sm:text-base">Father</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <CustomInput label="Name" name="familyBackground.father.name" type="text" value={formData?.familyBackground?.father?.name || ''} onChange={handleChange} />
                    <CustomInput label="Age" name="familyBackground.father.age" type="number" value={formData?.familyBackground?.father?.age ?? ''} onChange={handleChange} />
                    <CustomInput label="Occupation" name="familyBackground.father.occupation" type="text" value={formData?.familyBackground?.father?.occupation || ''} onChange={handleChange} />
                  </div>
                </div>
                <div className="border rounded-lg p-3 sm:p-4">
                  <h4 className="font-medium mb-2 text-sm sm:text-base">Mother</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <CustomInput label="Name" name="familyBackground.mother.name" type="text" value={formData?.familyBackground?.mother?.name || ''} onChange={handleChange} />
                    <CustomInput label="Age" name="familyBackground.mother.age" type="number" value={formData?.familyBackground?.mother?.age ?? ''} onChange={handleChange} />
                    <CustomInput label="Occupation" name="familyBackground.mother.occupation" type="text" value={formData?.familyBackground?.mother?.occupation || ''} onChange={handleChange} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <CustomInput label="Number of Siblings" name="familyBackground.numberOfSiblings" type="number" value={formData?.familyBackground?.numberOfSiblings ?? ''} onChange={handleChange} />
                <CustomInput label="Position in Family" name="familyBackground.positionInFamily" type="text" value={formData?.familyBackground?.positionInFamily || ''} onChange={handleChange} />
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div className="border rounded-lg p-3 sm:p-4">
                  <h4 className="font-medium mb-2 text-sm sm:text-base">Father</h4>
                  <div className="space-y-1.5 sm:space-y-2">
                    <p className="text-gray-600 text-sm sm:text-base">
                      <span className="font-medium">Name:</span> {user?.familyBackground?.father?.name || 'Not provided'}
                    </p>
                    <p className="text-gray-600 text-sm sm:text-base">
                      <span className="font-medium">Age:</span> {user?.familyBackground?.father?.age || 'Not provided'}
                    </p>
                    <p className="text-gray-600 text-sm sm:text-base">
                      <span className="font-medium">Occupation:</span> {user?.familyBackground?.father?.occupation || 'Not provided'}
                    </p>
                  </div>
                </div>
                <div className="border rounded-lg p-3 sm:p-4">
                  <h4 className="font-medium mb-2 text-sm sm:text-base">Mother</h4>
                  <div className="space-y-1.5 sm:space-y-2">
                    <p className="text-gray-600 text-sm sm:text-base">
                      <span className="font-medium">Name:</span> {user?.familyBackground?.mother?.name || 'Not provided'}
                    </p>
                    <p className="text-gray-600 text-sm sm:text-base">
                      <span className="font-medium">Age:</span> {user?.familyBackground?.mother?.age || 'Not provided'}
                    </p>
                    <p className="text-gray-600 text-sm sm:text-base">
                      <span className="font-medium">Occupation:</span> {user?.familyBackground?.mother?.occupation || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-600">Number of Siblings</label>
                  <p className="text-sm sm:text-base text-gray-900 font-medium">{user?.familyBackground?.numberOfSiblings || 'Not provided'}</p>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-600">Position in Family</label>
                  <p className="text-sm sm:text-base text-gray-900 font-medium">{user?.familyBackground?.positionInFamily || 'Not provided'}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FamilyBackgroundTab;
