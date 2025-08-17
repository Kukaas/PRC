import PrivateLayout from '@/layout/PrivateLayout'
import React, { useState, useEffect } from 'react'
import { api } from '@/services/api'
import { Button } from '@/components/ui/button'
import CustomInput from '@/components/CustomInput'
import { YesNoRadioGroup } from '@/components/ui/radio-group'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { useAuth } from '@/components/AuthContext'
import { toast } from 'sonner'

const VolunteerApplication = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user.userId
  const [loading, setLoading] = useState(false)
  const [isResubmission, setIsResubmission] = useState(false)
  const [canResubmit, setCanResubmit] = useState(false)

  // Function to get current date and place
  const getCurrentDateAndPlace = () => {
    const now = new Date()
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
    const formattedDate = now.toLocaleDateString('en-US', options)
    const city = user.personalInfo?.address?.municipalityCity || 'N/A'
    const province = user.personalInfo?.address?.province || 'N/A'
    return `${formattedDate}, ${city}, ${province}`
  }
  const [formData, setFormData] = useState({
    applicant: userId,
    isRedCrossVolunteer: '',
    monthYearStarted: '',
    hasMembershipWithAccidentAssistanceBenefits: '',
    maabSerialNo: '',
    validityPeriod: '',
    underwentBasicVolunteerOrientation: '',
    basicVolunteerOrientationYear: '',
    underwentBasicRC143OrientationTraining: '',
    basicRC143OrientationTrainingYear: '',
    otherRedCrossTrainingCourses: '',
    exclusiveDates: '',
    references: [{ completeName: '', contactNumber: '', companyInstitution: '', position: '' }],
    signupAgreement: '',
    signupAgreementReason: '',
          volunteerWaiver: {
        completeName: `${user.givenName} ${user.familyName}`,
        signature: `${user.givenName} ${user.familyName}`.toUpperCase(),
        dateAndPlace: getCurrentDateAndPlace()
      },
      certificationAndConfidentiality: {
        signature: `${user.givenName} ${user.familyName}`.toUpperCase(),
        dateAndPlace: getCurrentDateAndPlace()
      }
  })

  // Check for existing application and load data on component mount
  useEffect(() => {
    const loadExistingApplication = async () => {
      try {
        // Try to get the user's existing application
        const response = await api.volunteerApplication.getMyApplication()
        if (response.success && response.data) {
          const existingApp = response.data

          // If application exists and is rejected, treat it as a resubmission
          if (existingApp.status === 'rejected') {
            setCanResubmit(true)
            setIsResubmission(true)

            // Pre-fill form with previous application data (excluding status and dates)
            setFormData(prev => ({
              ...prev,
              isRedCrossVolunteer: existingApp.isRedCrossVolunteer || '',
              monthYearStarted: existingApp.monthYearStarted || '',
              hasMembershipWithAccidentAssistanceBenefits: existingApp.hasMembershipWithAccidentAssistanceBenefits || '',
              maabSerialNo: existingApp.maabSerialNo || '',
              validityPeriod: existingApp.validityPeriod || '',
              underwentBasicVolunteerOrientation: existingApp.underwentBasicVolunteerOrientation || '',
              basicVolunteerOrientationYear: existingApp.basicVolunteerOrientationYear || '',
              underwentBasicRC143OrientationTraining: existingApp.underwentBasicRC143OrientationTraining || '',
              basicRC143OrientationTrainingYear: existingApp.basicRC143OrientationTrainingYear || '',
              otherRedCrossTrainingCourses: existingApp.otherRedCrossTrainingCourses || '',
              exclusiveDates: existingApp.exclusiveDates || '',
              references: existingApp.references && existingApp.references.length > 0
                ? existingApp.references.map(ref => ({
                    completeName: ref.completeName || '',
                    contactNumber: ref.contactNumber || '',
                    companyInstitution: ref.companyInstitution || '',
                    position: ref.position || ''
                  }))
                : [{ completeName: '', contactNumber: '', companyInstitution: '', position: '' }],
              signupAgreement: existingApp.signupAgreement || '',
              signupAgreementReason: existingApp.signupAgreementReason || '',
              volunteerWaiver: {
                completeName: existingApp.volunteerWaiver?.completeName || `${user?.givenName || ''} ${user?.familyName || ''}`.trim() || 'N/A',
                signature: existingApp.volunteerWaiver?.signature || `${user?.givenName || ''} ${user?.familyName || ''}`.trim().toUpperCase() || 'N/A',
                dateAndPlace: existingApp.volunteerWaiver?.dateAndPlace || getCurrentDateAndPlace()
              },
              certificationAndConfidentiality: {
                signature: existingApp.volunteerWaiver?.signature || `${user?.givenName || ''} ${user?.familyName || ''}`.trim().toUpperCase() || 'N/A',
                dateAndPlace: existingApp.volunteerWaiver?.dateAndPlace || getCurrentDateAndPlace()
              }
            }))
          } else if (existingApp.status === 'pending') {
            // If application is pending, navigate back to activities
            navigate('/activities')
          }
        }
              } catch {
          // If no application found, it's a new application
        }
    }

    loadExistingApplication()
  }, [navigate, user?.givenName, user?.familyName, user?.personalInfo?.address?.municipalityCity, user?.personalInfo?.address?.province])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedChange = (parentField, childField, value) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value
      }
    }))
  }

  const handleReferenceChange = (index, field, value) => {
    const newReferences = [...formData.references]
    newReferences[index][field] = value
    setFormData(prev => ({
      ...prev,
      references: newReferences
    }))
  }

  const addReference = () => {
    if (formData.references.length < 2) {
      setFormData(prev => ({
        ...prev,
        references: [...prev.references, { completeName: '', contactNumber: '', companyInstitution: '', position: '' }]
      }))
    }
  }

  const removeReference = (index) => {
    if (formData.references.length > 1) {
      const newReferences = formData.references.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        references: newReferences
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Use resubmit endpoint if it's a resubmission, otherwise use submit
      if (isResubmission) {
        await api.volunteerApplication.resubmit(formData)
        toast.success('Application resubmitted successfully')
      } else {
        await api.volunteerApplication.submit(formData)
        toast.success('Application submitted successfully')
      }
      navigate(`/activities/${userId}`)
    } catch (error) {
      console.error('Error submitting application:', error)
      toast.error('Error submitting application')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-blue-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Volunteer Application</h1>
              {isResubmission && (
                <p className="text-sm text-orange-600 font-medium mt-1">
                  Resubmitting your application
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="w-full space-y-6 sm:space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Basic Information</h2>

              <div className="space-y-6">
                <div>
                  <YesNoRadioGroup
                    label="Are you a Red Cross volunteer?"
                    value={formData.isRedCrossVolunteer}
                    onValueChange={(value) => handleInputChange('isRedCrossVolunteer', value)}
                    required
                  />
                </div>

                {formData.isRedCrossVolunteer === 'yes' && (
                  <div>
                    <CustomInput
                      label="Month and year started"
                      type="text"
                      placeholder="e.g., January 2020"
                      value={formData.monthYearStarted}
                      onChange={(e) => handleInputChange('monthYearStarted', e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <YesNoRadioGroup
                    label="Do you have membership with accident assistance benefits?"
                    value={formData.hasMembershipWithAccidentAssistanceBenefits}
                    onValueChange={(value) => handleInputChange('hasMembershipWithAccidentAssistanceBenefits', value)}
                    required
                  />
                </div>

                {formData.hasMembershipWithAccidentAssistanceBenefits === 'yes' && (
                  <>
                    <div>
                      <CustomInput
                        label="MAAB Serial No."
                        type="text"
                        placeholder="Enter MAAB Serial No."
                        value={formData.maabSerialNo}
                        onChange={(e) => handleInputChange('maabSerialNo', e.target.value)}
                      />
                    </div>
                    <div>
                      <CustomInput
                        label="Validity Period"
                        type="text"
                        placeholder="Enter validity period"
                        value={formData.validityPeriod}
                        onChange={(e) => handleInputChange('validityPeriod', e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Training Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Training Information</h2>

              <div className="space-y-6">
                <div>
                  <YesNoRadioGroup
                    label="Underwent Basic Volunteer Orientation?"
                    value={formData.underwentBasicVolunteerOrientation}
                    onValueChange={(value) => handleInputChange('underwentBasicVolunteerOrientation', value)}
                    required
                  />
                </div>

                {formData.underwentBasicVolunteerOrientation === 'yes' && (
                  <div>
                    <CustomInput
                      label="What year?"
                      type="number"
                      placeholder="e.g., 2020"
                      value={formData.basicVolunteerOrientationYear}
                      onChange={(e) => handleInputChange('basicVolunteerOrientationYear', e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <YesNoRadioGroup
                    label="Underwent Basic RC143 Orientation Training?"
                    value={formData.underwentBasicRC143OrientationTraining}
                    onValueChange={(value) => handleInputChange('underwentBasicRC143OrientationTraining', value)}
                    required
                  />
                </div>

                {formData.underwentBasicRC143OrientationTraining === 'yes' && (
                  <div>
                    <CustomInput
                      label="What year?"
                      type="number"
                      placeholder="e.g., 2020"
                      value={formData.basicRC143OrientationTrainingYear}
                      onChange={(e) => handleInputChange('basicRC143OrientationTrainingYear', e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <CustomInput
                      label="Other Red Cross training/courses acquired"
                      type="textarea"
                      placeholder="List other training courses..."
                      value={formData.otherRedCrossTrainingCourses}
                      onChange={(e) => handleInputChange('otherRedCrossTrainingCourses', e.target.value)}
                    />
                  </div>

                  <div>
                    <CustomInput
                      label="Exclusive dates"
                      type="text"
                      placeholder="Enter exclusive dates"
                      value={formData.exclusiveDates}
                      onChange={(e) => handleInputChange('exclusiveDates', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* References */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">References</h2>
                {formData.references.length < 2 && (
                  <Button type="button" onClick={addReference} variant="outline" size="sm" className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Reference
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {formData.references.map((reference, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                      <h3 className="font-medium text-gray-700">Reference {index + 1}</h3>
                      {formData.references.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeReference(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 w-full sm:w-auto"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <CustomInput
                          label="Complete Name"
                          type="text"
                          placeholder="Enter complete name"
                          value={reference.completeName}
                          onChange={(e) => handleReferenceChange(index, 'completeName', e.target.value)}
                        />
                      </div>
                      <div>
                        <CustomInput
                          label="Contact Number"
                          type="text"
                          placeholder="Enter contact number"
                          value={reference.contactNumber}
                          onChange={(e) => handleReferenceChange(index, 'contactNumber', e.target.value)}
                        />
                      </div>
                      <div>
                        <CustomInput
                          label="Company/Institution/Organization"
                          type="text"
                          placeholder="Enter company/institution"
                          value={reference.companyInstitution}
                          onChange={(e) => handleReferenceChange(index, 'companyInstitution', e.target.value)}
                        />
                      </div>
                      <div>
                        <CustomInput
                          label="Position"
                          type="text"
                          placeholder="Enter position"
                          value={reference.position}
                          onChange={(e) => handleReferenceChange(index, 'position', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sign Up Agreement */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">IX. SIGN UP AGREEMENT</h2>

              <div className="mb-6">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Sign me up! By checking this box below, I agree I want to receive news, offers, tips, and other promotional materials from and about the Philippines Red Cross, including by email, phone, and mail to the contact information I am submitting. I consent to the Philippine Red Cross, its affiliates, and service providers processing my personal data for these purposes, and as described in the Privacy Policy. I understand that I can withdraw my consent at any time.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CustomInput
                    label=""
                    type="checkbox"
                    value={formData.signupAgreement === 'yes_i_agree'}
                    onChange={(e) => handleInputChange('signupAgreement', e.target.checked ? 'yes_i_agree' : '')}
                  />
                  <span className="font-medium">YES, I Agree Please Sign Me Up</span>
                </div>

                <div className="flex items-center space-x-3">
                  <CustomInput
                    label=""
                    type="checkbox"
                    value={formData.signupAgreement === 'no_i_dont_agree'}
                    onChange={(e) => handleInputChange('signupAgreement', e.target.checked ? 'no_i_dont_agree' : '')}
                  />
                  <span className="font-medium">NO, I Don't Agree</span>
                </div>

                {formData.signupAgreement === 'no_i_dont_agree' && (
                  <div>
                    <CustomInput
                      label="Why?"
                      type="textarea"
                      placeholder="Please explain why you don't agree..."
                      value={formData.signupAgreementReason}
                      onChange={(e) => handleInputChange('signupAgreementReason', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Volunteer Waiver */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">X. VOLUNTEER WAIVER</h2>

              <div className="mb-6 space-y-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                  I am aware that by joining the volunteering activities with Philippine Red Cross, I am expected to conduct myself properly and be responsible for my actions and I am obliged to follow all the rules and regulations implemented by the Philippines Red Cross. I also agree to serve on a voluntary basis, without remuneration, and to hold the PRC free from any and all claims which may arise in connection with my volunteer work with the Red Cross.
                </p>

                <p className="text-sm text-gray-600 leading-relaxed">
                  I hereby therefore release, waive, discharge, hold harmless and indemnify Philippine Red Cross, its officers, employees, faculties, board members, and agents from all liability to myself for any loss or damage, and any claim or demands therefore on the account of injury to my person or property due to my own negligence, imprudent demeanor, reckless conduct and/or irresponsible actions.
                </p>

                <p className="text-sm text-gray-600 leading-relaxed">
                  Nonetheless, I appeal to & trust that PRC Volunteer supervisors, managers and supervising staff on their part will exercise the due diligence and prudence required for the over-all conduct, safety and security of my well-being to the best of their abilities at all times. This diligence would include oral and written instructions, whether given before or during the activity that if followed, would ensure my general safety.
                </p>

                <p className="text-sm text-gray-600 leading-relaxed">
                  This waiver is made freely and willingly without reservation whatsoever and do so with full knowledge of the possible risks involved.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <CustomInput
                    label="Complete Name"
                    type="text"
                    placeholder="Enter your complete name"
                    value={formData.volunteerWaiver.completeName}
                    onChange={(e) => handleNestedChange('volunteerWaiver', 'completeName', e.target.value)}
                  />
                </div>
                <div>
                  <CustomInput
                    label="Signature (Complete name in CAPITAL letters)"
                    type="text"
                    placeholder="Enter your name in CAPITAL letters"
                    value={formData.volunteerWaiver.signature}
                    onChange={(e) => handleNestedChange('volunteerWaiver', 'signature', e.target.value)}
                  />
                </div>
                <div>
                  <CustomInput
                    label="Date and Place"
                    type="text"
                    placeholder="e.g., January 1, 2025, Manila"
                    value={formData.volunteerWaiver.dateAndPlace}
                    onChange={(e) => handleNestedChange('volunteerWaiver', 'dateAndPlace', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Certification & Confidentiality */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">XI. CERTIFICATION & CONFIDENTIALITY</h2>

              <div className="mb-6">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Please read the following carefully before signing this form
                </p>
                <p className="text-sm text-gray-600 leading-relaxed mt-4">
                  I hereby certify that the information provided by me in this registration form is true, correct and complete to the best of my knowledge. I further certify that I have and will answer all questions to the best of my ability and have not and will not withhold any information that would unfavorably affect my volunteering application. I understand that the information contained on my application will be verified by Philippine Red Cross and that it may require a reference check and/or criminal check and hereby authorize such a check to be conducted. As well as giving consent to use the given information for the screening & selection process with the guidance of the Data Privacy Act (RA10173). I hereby agree to abide by all the Seven (7) Fundamental Principles of the International Red Cross & Red Crescent Movement, policies and guidelines of the organization and the rules and regulations of the training program. As well as giving consent to use the given information for training purposes with the guidance of the Data Privacy Act (RA10173). I understand that false information, misrepresentations or omissions may be a justification for my immediate dismissal from the volunteer program.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <CustomInput
                    label="Signature over printed name"
                    type="text"
                    placeholder="Enter your signature"
                    value={formData.certificationAndConfidentiality.signature}
                    onChange={(e) => handleNestedChange('certificationAndConfidentiality', 'signature', e.target.value)}
                  />
                </div>
                <div>
                  <CustomInput
                    label="Date/Place"
                    type="text"
                    placeholder="e.g., January 1, 2025, Manila"
                    value={formData.certificationAndConfidentiality.dateAndPlace}
                    onChange={(e) => handleNestedChange('certificationAndConfidentiality', 'dateAndPlace', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/activities')}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              {canResubmit && (
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto"
                >
                  {loading ? 'Resubmitting...' : 'Resubmit Application'}
                </Button>
              )}
              {!canResubmit && (
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </PrivateLayout>
  )
}

export default VolunteerApplication
