import React, { useState, useEffect } from 'react'
import { api } from '@/services/api'
import axios from 'axios'
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
import { PSGC_API_URL } from '@/services/api'
import CustomInput from '@/components/CustomInput'
import { toast } from 'sonner'
import { formatTime } from '@/lib/utils'

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
  const [notifyDialog, setNotifyDialog] = useState({ open: false, volunteer: null })
  const [profileDialog, setProfileDialog] = useState({ open: false, volunteer: null })
  const [markTrainedDialog, setMarkTrainedDialog] = useState({ open: false, volunteer: null })

  // Training notification form state
  const [trainingForm, setTrainingForm] = useState({
    trainingDate: '',
    trainingTime: '',
    trainingLocation: '',
    exactLocation: ''
  })

  // PSGC API state for training location
  const [provinces, setProvinces] = useState([])
  const [municipalities, setMunicipalities] = useState([])
  const [barangays, setBarangays] = useState([])
  const [selectedTrainingProvince, setSelectedTrainingProvince] = useState("")
  const [selectedTrainingMunicipality, setSelectedTrainingMunicipality] = useState("")
  const [selectedTrainingBarangay, setSelectedTrainingBarangay] = useState("")
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false)
  const [isLoadingMunicipalities, setIsLoadingMunicipalities] = useState(false)
  const [isLoadingBarangays, setIsLoadingBarangays] = useState(false)

  // Loading states for operations
  const [approveLoading, setApproveLoading] = useState(false)
  const [rejectLoading, setRejectLoading] = useState(false)
  const [notifyLoading, setNotifyLoading] = useState(false)
  const [trainingStatusLoading, setTrainingStatusLoading] = useState(false)

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
    if (!provinceCode) return [];
    setIsLoadingMunicipalities(true);
    try {
      const response = await axios.get(`${PSGC_API_URL}/provinces/${provinceCode}/municipalities/`);
      setMunicipalities(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching municipalities:', error);
      return [];
    } finally {
      setIsLoadingMunicipalities(false);
    }
  };

  const fetchBarangays = async (municipalityCode) => {
    if (!municipalityCode) return [];
    setIsLoadingBarangays(true);
    try {
      const response = await axios.get(`${PSGC_API_URL}/municipalities/${municipalityCode}/barangays/`);
      setBarangays(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching barangays:', error);
      return [];
    } finally {
      setIsLoadingBarangays(false);
    }
  };

  // Handle province selection for training location
  const handleProvinceChange = (e) => {
    const provinceCode = e.target.value;
    setSelectedTrainingProvince(provinceCode);
    setSelectedTrainingMunicipality("");
    setSelectedTrainingBarangay("");
    setMunicipalities([]);
    setBarangays([]);

    // Clear training location when province changes
    setTrainingForm(prev => ({
      ...prev,
      trainingLocation: ""
    }));

    if (provinceCode) {
      fetchMunicipalities(provinceCode);
    }
  };

  // Handle municipality selection for training location
  const handleMunicipalityChange = (e) => {
    const municipalityCode = e.target.value;
    setSelectedTrainingMunicipality(municipalityCode);
    setSelectedTrainingBarangay("");
    setBarangays([]);

    // Clear training location when municipality changes
    setTrainingForm(prev => ({
      ...prev,
      trainingLocation: ""
    }));

    if (municipalityCode) {
      fetchBarangays(municipalityCode);
    }
  };

  // Handle barangay selection for training location
  const handleBarangayChange = (e) => {
    const barangayCode = e.target.value;
    setSelectedTrainingBarangay(barangayCode);

    // Update form data - build location in format: barangay, municipality, province
    const provinceName = provinces.find(p => p.code === selectedTrainingProvince)?.name || "";
    const municipalityName = municipalities.find(m => m.code === selectedTrainingMunicipality)?.name || "";
    const barangayName = barangays.find(b => b.code === barangayCode)?.name || "";

    // Only set trainingLocation if we have all three values
    if (barangayName && municipalityName && provinceName) {
      setTrainingForm(prev => ({
        ...prev,
        trainingLocation: `${barangayName}, ${municipalityName}, ${provinceName}`
      }));
    }
  };

  // Handle exact location change
  const handleExactLocationChange = (e) => {
    const exactLocation = e.target.value;
    setTrainingForm(prev => ({
      ...prev,
      exactLocation
      // Don't modify trainingLocation here - it will be combined in the backend
    }));
  };

  // Load provinces on component mount
  useEffect(() => {
    fetchProvinces();
  }, []);

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
        toast.success('Volunteer approved successfully')
      } else {
        toast.error('Failed to approve volunteer: ' + response.message)
      }
    } catch (err) {
      console.error('Error approving volunteer:', err)
      toast.error('Failed to approve volunteer: ' + err.message)
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
        toast.success('Volunteer rejected successfully')
      } else {
        toast.error('Failed to reject volunteer: ' + response.message)
      }
    } catch (err) {
      console.error('Error rejecting volunteer:', err)
      toast.error('Failed to reject volunteer: ' + err.message)
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

  const openMarkTrainedDialog = (volunteer) => {
    setMarkTrainedDialog({ open: true, volunteer })
  }

  const handleNotify = async () => {
    if (!notifyDialog.volunteer || !trainingForm.trainingDate || !trainingForm.trainingTime || !selectedTrainingProvince || !selectedTrainingMunicipality || !selectedTrainingBarangay) {
      toast.error('Please fill in all required training details (date, time, province, municipality, and barangay)')
      return
    }

    try {
      setNotifyLoading(true)
      const response = await api.volunteerApplication.sendTrainingNotification(
        notifyDialog.volunteer._id || notifyDialog.volunteer.id,
        {
          ...trainingForm,
          provinceCode: selectedTrainingProvince,
          municipalityCode: selectedTrainingMunicipality,
          barangayCode: selectedTrainingBarangay
        }
      )

      if (response.success) {
        const isUpdate = notifyDialog.volunteer?.trainingNotification?.trainingDate;
        toast.success(isUpdate ? 'Training notification updated successfully!' : 'Training notification sent successfully!')
        setNotifyDialog({ open: false, volunteer: null })
                           setTrainingForm({ trainingDate: '', trainingTime: '', trainingLocation: '', exactLocation: '' })
        setSelectedTrainingProvince("")
        setSelectedTrainingMunicipality("")
        setSelectedTrainingBarangay("")
        setMunicipalities([])
        setBarangays([])
        // Refresh data
        await fetchVolunteerData()
        if (onDataChange) {
          onDataChange()
        }
      } else {
        toast.error('Failed to send training notification: ' + response.message)
      }
    } catch (err) {
      console.error('Error sending training notification:', err)
      toast.error('Failed to send training notification: ' + err.message)
    } finally {
      setNotifyLoading(false)
    }
  }

    const openNotifyDialog = async (volunteer) => {
    // Pre-fill form with existing training details if available
    if (volunteer.trainingNotification?.trainingDate) {
      const existingDate = new Date(volunteer.trainingNotification.trainingDate).toISOString().split('T')[0];

      // For existing notifications, we need to reconstruct the location properly
      let generalLocation = '';
      let exactLocationText = volunteer.trainingNotification.exactLocation || '';

      // If we have the stored location codes, reconstruct the general location
      if (volunteer.trainingNotification.provinceCode &&
          volunteer.trainingNotification.municipalityCode &&
          volunteer.trainingNotification.barangayCode) {
        // We'll reconstruct this when we fetch the location names
      } else {
        // Fallback: try to extract general location from trainingLocation
        const locationParts = (volunteer.trainingNotification.trainingLocation || '').split(',');
        if (locationParts.length >= 3) {
          // Assume first 3 parts are barangay, municipality, province
          generalLocation = locationParts.slice(0, 3).join(', ');
          // Rest might be exact location
          if (locationParts.length > 3) {
            exactLocationText = locationParts.slice(3).join(', ').trim();
          }
        } else {
          generalLocation = volunteer.trainingNotification.trainingLocation || '';
        }
      }

      setTrainingForm({
        trainingDate: existingDate,
        trainingTime: volunteer.trainingNotification.trainingTime || '',
        trainingLocation: generalLocation,
        exactLocation: exactLocationText
      });

            // Set the stored location codes directly
      if (volunteer.trainingNotification.provinceCode) {
        setSelectedTrainingProvince(volunteer.trainingNotification.provinceCode);

        // Fetch municipalities for this province
        await fetchMunicipalities(volunteer.trainingNotification.provinceCode);

        if (volunteer.trainingNotification.municipalityCode) {
          setSelectedTrainingMunicipality(volunteer.trainingNotification.municipalityCode);

          // Fetch barangays for this municipality
          await fetchBarangays(volunteer.trainingNotification.municipalityCode);

          if (volunteer.trainingNotification.barangayCode) {
            setSelectedTrainingBarangay(volunteer.trainingNotification.barangayCode);

            // Now reconstruct the general location with the fetched names
            const provinceName = provinces.find(p => p.code === volunteer.trainingNotification.provinceCode)?.name || "";
            const municipalityName = municipalities.find(m => m.code === volunteer.trainingNotification.municipalityCode)?.name || "";
            const barangayName = barangays.find(b => b.code === volunteer.trainingNotification.barangayCode)?.name || "";

            if (provinceName && municipalityName && barangayName) {
              setTrainingForm(prev => ({
                ...prev,
                trainingLocation: `${barangayName}, ${municipalityName}, ${provinceName}`
              }));
            }
          }
        }
      }
    } else {
      // Reset form for new notification
      setTrainingForm({ trainingDate: '', trainingTime: '', trainingLocation: '', exactLocation: '' });
      setSelectedTrainingProvince("");
      setSelectedTrainingMunicipality("");
      setSelectedTrainingBarangay("");
      setMunicipalities([]);
      setBarangays([]);
    }

    setNotifyDialog({ open: true, volunteer })
  }

  const handleTrainingStatusToggle = async (volunteer) => {
    try {
      setTrainingStatusLoading(true)
      const newStatus = !volunteer.isTrained
      const response = await api.volunteerApplication.updateTrainingStatus(
        volunteer._id || volunteer.id,
        { isTrained: newStatus }
      )

      if (response.success) {
        toast.success(`Training status updated to ${newStatus ? 'trained' : 'not trained'}`)
        // Refresh data
        await fetchVolunteerData()
        if (onDataChange) {
          onDataChange()
        }
        // Close the dialog
        setMarkTrainedDialog({ open: false, volunteer: null })
      } else {
        toast.error('Failed to update training status: ' + response.message)
      }
    } catch (err) {
      console.error('Error updating training status:', err)
      toast.error('Failed to update training status: ' + err.message)
    } finally {
      setTrainingStatusLoading(false)
    }
  }

  const handleView = async (id) => {
    try {
      const response = await api.volunteerApplication.getById(id)
      if (response.success) {
        setProfileDialog({ open: true, volunteer: response.data })
      } else {
        toast.error('Failed to fetch volunteer details: ' + response.message)
      }
    } catch (err) {
      console.error('Error fetching volunteer details:', err)
      toast.error('Failed to fetch volunteer details: ' + err.message)
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
          <div className="grid grid-cols-8 gap-4 text-sm font-semibold text-white">
            <div>Name</div>
            <div>Date Applied</div>
            <div>Status</div>
            <div>Training</div>
            <div>Training Date</div>
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
                  <div className="grid grid-cols-8 gap-4 text-sm text-gray-600">
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
                    <div>
                      {status === 'pending' && volunteer.trainingNotification?.trainingDate ? (
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            volunteer.isTrained
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {volunteer.isTrained ? 'Trained' : 'Not Trained'}
                          </span>
                        </div>
                      ) : status === 'accepted' ? (
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            volunteer.isTrained
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {volunteer.isTrained ? 'Trained' : 'Not Trained'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">N/A</span>
                      )}
                    </div>
                                         <div>
                       {volunteer.trainingNotification?.trainingDate ? (
                         <div className="text-xs">
                           <div className="font-medium text-gray-800">
                             {new Date(volunteer.trainingNotification.trainingDate).toLocaleDateString()}
                           </div>
                           <div className="text-gray-500">
                             {formatTime(volunteer.trainingNotification.trainingTime)}
                           </div>
                         </div>
                       ) : (
                         <span className="text-gray-400 text-xs">Not Scheduled</span>
                       )}
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

                      {/* Show different buttons based on status and training state */}
                      {status === 'pending' && (
                        <>
                          {volunteer.isTrained ? (
                            // If trained, show Approve and Reject
                            <>
                              <Button
                                onClick={() => openApproveDialog(volunteer)}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-2 py-1 text-xs rounded font-medium transition-colors"
                                size="sm"
                              >
                                Approve
                              </Button>
                              <Button
                                onClick={() => openRejectDialog(volunteer)}
                                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-xs rounded font-medium transition-colors"
                                size="sm"
                              >
                                Reject
                              </Button>
                            </>
                                                     ) : (
                             // If not trained, show Notify Training and Mark as Trained (no reject button)
                             <>
                               <Button
                                 onClick={() => openNotifyDialog(volunteer)}
                                 className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 text-xs rounded font-medium transition-colors"
                                 size="sm"
                               >
                                 Notify Training
                               </Button>
                                                               {volunteer.trainingNotification?.trainingDate && (
                                  <Button
                                    onClick={() => openMarkTrainedDialog(volunteer)}
                                    disabled={trainingStatusLoading}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 text-xs rounded font-medium transition-colors disabled:opacity-50"
                                    size="sm"
                                  >
                                    Mark as Trained
                                  </Button>
                                )}
                             </>
                           )}
                        </>
                      )}

                      {/* If status is accepted, only show View button (already shown above) */}
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

      {/* Mark as Trained Dialog */}
      <AlertDialog open={markTrainedDialog.open} onOpenChange={(open) => {
        if (!open && !trainingStatusLoading) {
          setMarkTrainedDialog({ open: false, volunteer: null })
        }
      }}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-gray-900">
              Mark Volunteer as Trained
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600 mt-2">
              Are you sure you want to mark this volunteer as trained? This will allow them to be approved for volunteer work.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
            <AlertDialogCancel
              disabled={trainingStatusLoading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => markTrainedDialog.volunteer && handleTrainingStatusToggle(markTrainedDialog.volunteer)}
              disabled={trainingStatusLoading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {trainingStatusLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Marking as Trained...
                </div>
              ) : (
                'Mark as Trained'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Notify Training Dialog */}
      <AlertDialog open={notifyDialog.open} onOpenChange={(open) => {
        if (!open && !notifyLoading) {
          setNotifyDialog({ open: false, volunteer: null })
                     setTrainingForm({ trainingDate: '', trainingTime: '', trainingLocation: '', exactLocation: '' })
        }
      }}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-gray-900">
              {notifyDialog.volunteer?.trainingNotification?.trainingDate ? 'Update Training Notification' : 'Send Training Notification'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600 mt-2">
              {notifyDialog.volunteer?.trainingNotification?.trainingDate
                ? 'Update the training details and send a new notification to this volunteer.'
                : 'Send a training notification to this volunteer with the details below.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
                     <div className="mt-4">
             <CustomInput
               label="Training Date"
               name="trainingDate"
               type="date"
               value={trainingForm.trainingDate}
               onChange={(e) => setTrainingForm({ ...trainingForm, trainingDate: e.target.value })}
               required
             />
           </div>
           <div >
             <CustomInput
               label="Training Time"
               name="trainingTime"
               type="time"
               value={trainingForm.trainingTime}
               onChange={(e) => setTrainingForm({ ...trainingForm, trainingTime: e.target.value })}
               required
             />
           </div>
           <div >
             <CustomInput
               label="Province"
               name="province"
               type="select"
               value={selectedTrainingProvince}
               onChange={handleProvinceChange}
               required
               disabled={isLoadingProvinces}
             >
               <option value="">Select Province</option>
               {isLoadingProvinces ? (
                 <option value="">Loading Provinces...</option>
               ) : (
                 provinces.map(province => (
                   <option key={province.code} value={province.code}>{province.name}</option>
                 ))
               )}
             </CustomInput>
           </div>
           <div>
             <CustomInput
               label="Municipality"
               name="municipality"
               type="select"
               value={selectedTrainingMunicipality}
               onChange={handleMunicipalityChange}
               required
               disabled={!selectedTrainingProvince || isLoadingMunicipalities}
             >
               <option value="">Select Municipality</option>
               {isLoadingMunicipalities ? (
                 <option value="">Loading Municipalities...</option>
               ) : (
                 municipalities.map(municipality => (
                   <option key={municipality.code} value={municipality.code}>{municipality.name}</option>
                 ))
               )}
             </CustomInput>
           </div>
           <div>
             <CustomInput
               label="Barangay"
               name="barangay"
               type="select"
               value={selectedTrainingBarangay}
               onChange={handleBarangayChange}
               required
               disabled={!selectedTrainingMunicipality || isLoadingBarangays}
             >
               <option value="">Select Barangay</option>
               {isLoadingBarangays ? (
                 <option value="">Loading Barangays...</option>
               ) : (
                 barangays.map(barangay => (
                   <option key={barangay.code} value={barangay.code}>{barangay.name}</option>
                 ))
               )}
             </CustomInput>
           </div>
           <div>
             <CustomInput
               label="Exact Location (Optional)"
               name="exactLocation"
               type="text"
               placeholder="e.g., Street Name, Building Name"
               value={trainingForm.exactLocation}
               onChange={handleExactLocationChange}
             />
           </div>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
            <AlertDialogCancel
              disabled={notifyLoading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => notifyDialog.volunteer && handleNotify()}
              disabled={notifyLoading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {notifyLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {notifyDialog.volunteer?.trainingNotification?.trainingDate ? 'Updating...' : 'Sending...'}
                </div>
              ) : (
                notifyDialog.volunteer?.trainingNotification?.trainingDate ? 'Update Notification' : 'Send Notification'
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
