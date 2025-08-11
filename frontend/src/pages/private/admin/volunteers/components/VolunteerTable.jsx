import React, { useState, useEffect } from 'react'
import { api } from '@/services/api'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import VolunteerProfileDialog from '@/pages/private/admin/volunteers/components/VolunteerProfileDialog'

const VolunteerTable = ({ onDataChange }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBarangay, setSelectedBarangay] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [volunteerData, setVolunteerData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Dialog states
  const [approveDialog, setApproveDialog] = useState({ open: false, volunteer: null })
  const [rejectDialog, setRejectDialog] = useState({ open: false, volunteer: null })
  // Add state for profile modal
  const [profileDialog, setProfileDialog] = useState({ open: false, volunteer: null })
  // Profile dialog UI is handled by separate component

  // Loading states for operations
  const [approveLoading, setApproveLoading] = useState(false)
  const [rejectLoading, setRejectLoading] = useState(false)

  // Fetch volunteer applications data
  useEffect(() => {
    fetchVolunteerData()
  }, [])

  const fetchVolunteerData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get all volunteer applications with optional filters
      const params = {}
      if (searchTerm) params.search = searchTerm
      if (selectedBarangay) params.barangay = selectedBarangay
      if (selectedService) params.service = selectedService

      const response = await api.volunteerApplication.getAll(params)

      if (response.success) {
        setVolunteerData(response.data || [])
      } else {
        setError(response.message || 'Failed to fetch volunteer data')
      }
    } catch (err) {
      console.error('Error fetching volunteer data:', err)
      setError(err.message || 'Failed to fetch volunteer data')
    } finally {
      setLoading(false)
    }
  }

  // Filter volunteers based on search and filters
  const filteredVolunteers = volunteerData.filter(volunteer => {
    const firstName = volunteer.applicant?.givenName || ''
    const lastName = volunteer.applicant?.familyName || ''

    const matchesSearch = !searchTerm ||
                         firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         volunteer.applicant?.skills?.some(skill =>
                           skill.toLowerCase().includes(searchTerm.toLowerCase())
                         )
    const matchesBarangay = !selectedBarangay ||
                           volunteer.applicant?.personalInfo?.address?.districtBarangayVillage === selectedBarangay
    const matchesService = !selectedService ||
                          volunteer.applicant?.services?.some(service =>
                            service.type === selectedService
                          )

    return matchesSearch && matchesBarangay && matchesService
  })

  const handleApprove = async (id) => {
    try {
      setApproveLoading(true)
      const response = await api.volunteerApplication.updateStatus(id, { status: 'accepted' })
      if (response.success) {
        // Refresh data
        await fetchVolunteerData()
        // Notify parent component to refresh stats
        if (onDataChange) {
          onDataChange()
        }
        setApproveDialog({ open: false, volunteer: null })
      } else {
        alert('Failed to approve volunteer: ' + response.message)
      }
    } catch (err) {
      console.error('Error approving volunteer:', err)
      alert('Failed to approve volunteer: ' + err.message)
    } finally {
      setApproveLoading(false)
    }
  }

  const handleReject = async (id) => {
    try {
      setRejectLoading(true)
      const response = await api.volunteerApplication.updateStatus(id, { status: 'rejected' })
      if (response.success) {
        // Refresh data
        await fetchVolunteerData()
        // Notify parent component to refresh stats
        if (onDataChange) {
          onDataChange()
        }
        setRejectDialog({ open: false, volunteer: null })
      } else {
        alert('Failed to reject volunteer: ' + response.message)
      }
    } catch (err) {
      console.error('Error rejecting volunteer:', err)
      alert('Failed to reject volunteer: ' + err.message)
    } finally {
      setRejectLoading(false)
    }
  }

  const openApproveDialog = (volunteer) => {
    setApproveDialog({ open: true, volunteer })
  }

  const openRejectDialog = (volunteer) => {
    setRejectDialog({ open: true, volunteer })
  }

  const handleNotify = async (id) => {
    // Handle notify logic - you can implement email notification here
    console.log('Notifying volunteer:', id)
    alert('Notification feature coming soon!')
  }

  const handleView = async (id) => {
    try {
      const response = await api.volunteerApplication.getById(id)
      if (response.success) {
        setProfileDialog({ open: true, volunteer: response.data })
      } else {
        alert('Failed to fetch volunteer details: ' + response.message)
      }
    } catch (err) {
      console.error('Error fetching volunteer details:', err)
      alert('Failed to fetch volunteer details: ' + err.message)
    }
  }

  const handleSearch = () => {
    fetchVolunteerData()
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedBarangay('')
    setSelectedService('')
    fetchVolunteerData()
  }

  // Get unique barangays and services for filter options
  const uniqueBarangays = [...new Set(volunteerData.map(v => v.applicant?.personalInfo?.address?.districtBarangayVillage).filter(Boolean))]
  const uniqueServices = [...new Set(volunteerData.flatMap(v => v.applicant?.services?.map(service => service.type) || []).filter(Boolean))]

  if (loading && volunteerData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading volunteer data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <div className="text-red-600 text-lg font-medium mb-2">Error Loading Data</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchVolunteerData}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Volunteer Applicants</h3>
        <p className="text-sm text-gray-600">Manage and review volunteer applications</p>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 bg-cyan-50 rounded-lg p-4 border border-cyan-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by name or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Barangay Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
            <select
              value={selectedBarangay}
              onChange={(e) => setSelectedBarangay(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">All Barangays</option>
              {uniqueBarangays.map(barangay => (
                <option key={barangay} value={barangay}>{barangay}</option>
              ))}
            </select>
          </div>

          {/* Service Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">All Services</option>
              {uniqueServices.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end gap-2">
            <button
              onClick={handleSearch}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Search
            </button>
            <button
              onClick={clearFilters}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="mt-3 pt-3 border-t border-cyan-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-cyan-700">
              Showing {filteredVolunteers.length} of {volunteerData.length} volunteers
            </span>
            <div className="flex gap-2 text-xs">
              {searchTerm && <span className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded">Search: {searchTerm}</span>}
              {selectedBarangay && <span className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded">Barangay: {selectedBarangay}</span>}
              {selectedService && <span className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded">Service: {selectedService}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        {/* Table Header */}
        <div className="bg-cyan-500 px-4 py-3 border-b border-gray-200">
          <div className="grid grid-cols-6 gap-4 text-sm font-semibold text-white">
            <div>Name</div>
            <div>Date Applied</div>
            <div>Status</div>
            <div>Skills</div>
            <div>Barangay</div>
            <div>Actions</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {filteredVolunteers.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              {loading ? 'Loading...' : 'No volunteers found matching your criteria'}
            </div>
          ) : (
            filteredVolunteers.map((volunteer) => {
              // Handle different possible data structures
              const firstName = volunteer.applicant?.givenName || ''
              const lastName = volunteer.applicant?.familyName || ''
              const fullName = `${firstName} ${lastName}`.trim() || 'Name not provided'

              const skills = volunteer.applicant?.skills?.join(', ') || 'No skills listed'
              const barangay = volunteer.applicant?.personalInfo?.address?.districtBarangayVillage || 'Not specified'
              const status = volunteer.status || 'pending'
              const appliedDate = new Date(volunteer.submittedAt || volunteer.createdAt || volunteer.updatedAt).toLocaleDateString()

              return (
                <div key={volunteer._id || volunteer.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-6 gap-4 text-sm text-gray-600">
                    <div className="font-medium text-gray-800">{fullName || 'Name not provided'}</div>
                    <div>{appliedDate}</div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>
                    <div className="text-gray-700 truncate" title={skills}>{skills}</div>
                    <div className="text-gray-700">{barangay}</div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => handleView(volunteer._id || volunteer.id)}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 text-xs rounded font-medium transition-colors"
                        size="sm"
                      >
                        View
                      </Button>
                      {status === 'pending' && (
                        <>
                          <Button
                            onClick={() => openApproveDialog(volunteer)}
                            className="bg-teal-600 hover:bg-teal-700 text-white px-2 py-1 text-xs rounded font-medium transition-colors"
                            size="sm"
                          >
                            approve
                          </Button>
                          <Button
                            onClick={() => openRejectDialog(volunteer)}
                            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-xs rounded font-medium transition-colors"
                            size="sm"
                          >
                            reject
                          </Button>
                        </>
                      )}
                      <Button
                        onClick={() => handleNotify(volunteer._id || volunteer.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs rounded font-medium transition-colors"
                        size="sm"
                      >
                        Notify
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Table Footer */}
      <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
        <div>
          Showing {filteredVolunteers.length} of {volunteerData.length} volunteers
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="text-cyan-600 hover:text-cyan-700 font-medium"
          >
            Export Data
          </button>
          <button className="text-cyan-600 hover:text-cyan-700 font-medium">
            Bulk Actions
          </button>
        </div>
      </div>

      {/* Approve Dialog */}
      <AlertDialog open={approveDialog.open} onOpenChange={(open) => {
        if (!open && !approveLoading) {
          setApproveDialog({ open: false, volunteer: null })
        }
      }}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-gray-900">
              Approve Volunteer Application
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600 mt-2">
              Are you sure you want to approve this volunteer application? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
            <AlertDialogCancel
              disabled={approveLoading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => approveDialog.volunteer && handleApprove(approveDialog.volunteer._id || approveDialog.volunteer.id)}
              disabled={approveLoading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {approveLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Approving...
                </div>
              ) : (
                'Approve'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialog.open} onOpenChange={(open) => {
        if (!open && !rejectLoading) {
          setRejectDialog({ open: false, volunteer: null })
        }
      }}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-gray-900">
              Reject Volunteer Application
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600 mt-2">
              Are you sure you want to reject this volunteer application? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
            <AlertDialogCancel
              disabled={rejectLoading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => rejectDialog.volunteer && handleReject(rejectDialog.volunteer._id || rejectDialog.volunteer.id)}
              disabled={rejectLoading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {rejectLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Rejecting...
                </div>
              ) : (
                'Reject'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <VolunteerProfileDialog
        open={profileDialog.open}
        volunteer={profileDialog.volunteer}
        onClose={() => setProfileDialog({ open: false, volunteer: null })}
      />
    </div>
  )
}

export default VolunteerTable
