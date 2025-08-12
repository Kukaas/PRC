import React from 'react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate } from '@/lib/utils'
import { MapPin, Mail, Phone, Calendar, User, Building } from 'lucide-react'

const LeaderProfileDialog = ({ open, leader, onClose }) => {
  if (!leader) return null

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose?.()
        }
      }}
    >
      <AlertDialogContent className="w-[96vw] max-w-[1200px] sm:min-w-[1200px] max-h-[100vh] sm:max-h-[92vh]"
        style={{ width: '100%' }}>
        <AlertDialogHeader className="flex flex-row justify-between">
          <AlertDialogTitle className="text-lg font-semibold text-gray-900">
            Leader Profile
          </AlertDialogTitle>
          <div className="flex gap-2">
            <AlertDialogCancel>
              Close
            </AlertDialogCancel>
          </div>
        </AlertDialogHeader>

        <div className="max-h-[80vh] overflow-y-auto space-y-6 p-2 sm:p-4">
          {/* Header with Avatar and Basic Info */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={leader.photo || leader.avatarUrl}
                  alt="Leader Avatar"
                />
                <AvatarFallback className="bg-cyan-100 text-cyan-800 text-xl font-semibold">
                  {`${leader.firstName || ''} ${leader.lastName || ''}`.trim().charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {`${leader.firstName || ''} ${leader.middleName ? leader.middleName + ' ' : ''}${leader.lastName || ''}`}
                </h2>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <User className="w-4 h-4 mr-1" />
                  <span>Leader ID: {leader._id?.slice(-8) || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-cyan-600" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                  <div className="flex items-center text-gray-900">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    {leader.email || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Contact Number</label>
                  <div className="flex items-center text-gray-900">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {leader.contactNumber || 'Not provided'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-cyan-600" />
              Address Information
            </h3>
            <div className="space-y-3">
              {leader.address ? (
                <>
                  {leader.address.streetAddress && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Street Address</label>
                      <div className="text-gray-900">{leader.address.streetAddress}</div>
                    </div>
                  )}
                  {leader.address.districtBarangayVillage && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Barangay/District</label>
                      <div className="text-gray-900">{leader.address.districtBarangayVillage}</div>
                    </div>
                  )}
                  {leader.address.municipalityCity && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Municipality/City</label>
                      <div className="text-gray-900">{leader.address.municipalityCity}</div>
                    </div>
                  )}
                  {leader.address.province && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Province</label>
                      <div className="text-gray-900">{leader.address.province}</div>
                    </div>
                  )}
                  {leader.address.postalCode && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Postal Code</label>
                      <div className="text-gray-900">{leader.address.postalCode}</div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-gray-500 italic">No address information available</div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-cyan-600" />
              Additional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Date Added</label>
                <div className="text-gray-900">
                  {leader.createdAt ? formatDate(leader.createdAt) : 'Not available'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Last Updated</label>
                <div className="text-gray-900">
                  {leader.updatedAt ? formatDate(leader.updatedAt) : 'Not available'}
                </div>
              </div>
            </div>
            {leader.notes && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">Notes</label>
                <div className="text-gray-900 bg-gray-50 p-3 rounded-md">
                  {leader.notes}
                </div>
              </div>
            )}
          </div>

          {/* System Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Leader ID</label>
                <div className="text-gray-900 font-mono">{leader._id || 'N/A'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                <div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default LeaderProfileDialog
