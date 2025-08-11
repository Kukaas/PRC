import React, { useEffect, useState } from 'react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate } from '@/lib/utils'
import PersonalInfoTab from '@/pages/private/volunteers/components/profile/PersonalInfoTab'
import EducationTab from '@/pages/private/volunteers/components/profile/EducationTab'
import FamilyBackgroundTab from '@/pages/private/volunteers/components/profile/FamilyBackgroundTab'
import MedicalHistoryTab from '@/pages/private/volunteers/components/profile/MedicalHistoryTab'
import SkillsServicesTab from '@/pages/private/volunteers/components/profile/SkillsServicesTab'

const VolunteerProfileDialog = ({ open, volunteer, onClose }) => {
  const [showFullProfile, setShowFullProfile] = useState(false)

  useEffect(() => {
    if (!open) {
      setShowFullProfile(false)
    }
  }, [open])

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setShowFullProfile(false)
          onClose?.()
        }
      }}
    >
      <AlertDialogContent
        className="w-[96vw] max-w-[1200px] sm:min-w-[1200px] max-h-[100vh] sm:max-h-[92vh]"
        style={{ width: '100%' }}
      >
        <AlertDialogHeader className="flex flex-row justify-between">
          <AlertDialogTitle className="text-lg font-semibold text-gray-900">
            Volunteer Profile
          </AlertDialogTitle>
          <div className="flex gap-2">
            <AlertDialogCancel>
              Close
            </AlertDialogCancel>
            {!showFullProfile && (
              <button
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                onClick={() => setShowFullProfile(true)}
              >
                View Full Profile
              </button>
            )}
            {showFullProfile && (
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                onClick={() => setShowFullProfile(false)}
              >
                Back to Application
              </button>
            )}
          </div>
        </AlertDialogHeader>

        {volunteer && (
          <div
            className={`max-h-[80vh] overflow-y-auto space-y-6 p-2 sm:p-4 transition-all duration-300 ${showFullProfile ? 'opacity-0 pointer-events-none absolute' : 'opacity-100 relative'}`}
            style={{ display: showFullProfile ? 'none' : 'block' }}
          >
            {/* Top Section: Application Details, Waiver, Certification */}
            <div className="space-y-4">
              {/* Application Details */}
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                <h4 className="font-semibold text-cyan-800 mb-3 text-sm">Application Details</h4>
                <div className="space-y-3 text-xs sm:text-sm text-gray-700">
                  {/* Status */}
                  <div className="space-y-1">
                    <div className="text-gray-600">Status</div>
                    <div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${(() => {
                          const s = (volunteer.status || 'pending').toString().toLowerCase()
                          if (s === 'approved' || s === 'accepted') return 'bg-green-100 text-green-800'
                          if (s === 'rejected') return 'bg-red-100 text-red-800'
                          return 'bg-yellow-100 text-yellow-800'
                        })()}`}
                      >
                        {(() => {
                          const s = (volunteer.status || 'pending').toString()
                          return s.charAt(0).toUpperCase() + s.slice(1)
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* Booleans rendered as badges */}
                  <div className="space-y-1">
                    <div className="text-gray-600">Red Cross Volunteer</div>
                    <div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${(['yes','true','1'].includes(String(volunteer.isRedCrossVolunteer).toLowerCase()) || volunteer.isRedCrossVolunteer === true) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {(['yes','true','1'].includes(String(volunteer.isRedCrossVolunteer).toLowerCase()) || volunteer.isRedCrossVolunteer === true) ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-600">Accident Assistance Benefits</div>
                    <div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${(['yes','true','1'].includes(String(volunteer.hasMembershipWithAccidentAssistanceBenefits).toLowerCase()) || volunteer.hasMembershipWithAccidentAssistanceBenefits === true) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {(['yes','true','1'].includes(String(volunteer.hasMembershipWithAccidentAssistanceBenefits).toLowerCase()) || volunteer.hasMembershipWithAccidentAssistanceBenefits === true) ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-600">Basic Volunteer Orientation</div>
                    <div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${(['yes','true','1'].includes(String(volunteer.underwentBasicVolunteerOrientation).toLowerCase()) || volunteer.underwentBasicVolunteerOrientation === true) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {(['yes','true','1'].includes(String(volunteer.underwentBasicVolunteerOrientation).toLowerCase()) || volunteer.underwentBasicVolunteerOrientation === true) ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-600">RC143 Orientation Training</div>
                    <div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${(['yes','true','1'].includes(String(volunteer.underwentBasicRC143OrientationTraining).toLowerCase()) || volunteer.underwentBasicRC143OrientationTraining === true) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {(['yes','true','1'].includes(String(volunteer.underwentBasicRC143OrientationTraining).toLowerCase()) || volunteer.underwentBasicRC143OrientationTraining === true) ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-600">Signup Agreement</div>
                    <div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${(['yes','true','1','agree','agreed','i agree'].includes(String(volunteer.signupAgreement).toLowerCase()) || volunteer.signupAgreement === true) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {(['yes','true','1','agree','agreed','i agree'].includes(String(volunteer.signupAgreement).toLowerCase()) || volunteer.signupAgreement === true) ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="border-t border-cyan-200 my-2" />
                  <div className="space-y-1">
                    <div className="text-gray-600">Submitted</div>
                    <div className="text-gray-900">
                      {volunteer.submittedAt
                        ? `${formatDate(volunteer.submittedAt)} • ${new Date(volunteer.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : 'N/A'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-600">Reviewed</div>
                    <div className="text-gray-900">
                      {volunteer.reviewedAt
                        ? `${formatDate(volunteer.reviewedAt)} • ${new Date(volunteer.reviewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
              {/* Waiver */}
              <div className="space-y-4">
                {volunteer.volunteerWaiver && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4 h-full flex flex-col">
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">Volunteer Waiver</h4>
                    <div className="text-xs sm:text-sm text-gray-700 space-y-2 flex-1">
                      <div>
                        <div className="text-gray-600">Complete Name</div>
                        <div className="text-gray-900">{volunteer.volunteerWaiver.completeName}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Signature</div>
                        <div className="text-gray-900">{volunteer.volunteerWaiver.signature}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Date & Place</div>
                        <div className="text-gray-900">{volunteer.volunteerWaiver.dateAndPlace}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Certification */}
              <div className="space-y-4">
                {volunteer.certificationAndConfidentiality && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4 h-full flex flex-col">
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">Certification & Confidentiality</h4>
                    <div className="text-xs sm:text-sm text-gray-700 space-y-2 flex-1">
                      <div>
                        <div className="text-gray-600">Signature</div>
                        <div className="text-gray-900">{volunteer.certificationAndConfidentiality.signature}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Date & Place</div>
                        <div className="text-gray-900">{volunteer.certificationAndConfidentiality.dateAndPlace}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* References */}
            {volunteer.references && volunteer.references.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2 text-sm">References</h4>
                <div className="space-y-3">
                  {volunteer.references.map((ref, idx) => (
                    <div key={ref._id || idx} className="text-xs sm:text-sm text-gray-700 border-b last:border-b-0 border-gray-100 pb-3 mb-3 last:pb-0 last:mb-0">
                      <div className="space-y-1">
                        <div className="text-gray-600">Name</div>
                        <div className="text-gray-900">{ref.completeName}</div>
                      </div>
                      <div className="space-y-1 mt-2">
                        <div className="text-gray-600">Contact Number</div>
                        <div className="text-gray-900">{ref.contactNumber}</div>
                      </div>
                      <div className="space-y-1 mt-2">
                        <div className="text-gray-600">Company/Institution</div>
                        <div className="text-gray-900">{ref.companyInstitution}</div>
                      </div>
                      <div className="space-y-1 mt-2">
                        <div className="text-gray-600">Position</div>
                        <div className="text-gray-900">{ref.position}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {/* Full Profile Panel */}
        {volunteer && (
          <div
            className={`max-h-[80vh] overflow-y-auto space-y-6 p-2 sm:p-4 transition-all duration-300 ${showFullProfile ? 'opacity-100 relative' : 'opacity-0 pointer-events-none absolute'}`}
            style={{ display: showFullProfile ? 'block' : 'none' }}
          >
            <div className="grid grid-cols-3 items-center mb-4">
              <div />
              <div className="flex justify-center">
                <Avatar className="h-24 w-24 sm:h-28 sm:w-28">
                  <AvatarImage
                    src={volunteer?.applicant?.photo || volunteer?.photo || volunteer?.applicant?.avatarUrl || volunteer?.avatarUrl}
                    alt="Volunteer Avatar"
                  />
                  <AvatarFallback>
                    {(volunteer?.applicant?.givenName || volunteer?.givenName || 'V')
                      .toString()
                      .charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div className="space-y-4">
              <PersonalInfoTab user={volunteer.applicant || volunteer} />
              <EducationTab user={volunteer.applicant || volunteer} />
              <FamilyBackgroundTab user={volunteer.applicant || volunteer} />
              <MedicalHistoryTab user={volunteer.applicant || volunteer} />
              <SkillsServicesTab user={volunteer.applicant || volunteer} />
            </div>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default VolunteerProfileDialog


