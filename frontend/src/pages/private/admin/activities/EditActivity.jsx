import PrivateLayout from '@/layout/PrivateLayout'
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '@/services/api'
import { Button } from '@/components/ui/button'
import CustomInput from '@/components/CustomInput'
// removed status selector imports
import { ArrowLeft, Plus, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'
import { PSGC_API_URL } from '@/services/api'
import { useAuth } from '@/components/AuthContext'

const EditActivity = () => {
  const navigate = useNavigate()
  const { activityId } = useParams()
  const { user } = useAuth()
  const userId = user.userId
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // PSGC API state
  const [provinces, setProvinces] = useState([])
  const [municipalities, setMunicipalities] = useState([])
  const [barangays, setBarangays] = useState([])
  const [selectedProvince, setSelectedProvince] = useState("")
  const [selectedMunicipality, setSelectedMunicipality] = useState("")
  const [selectedBarangay, setSelectedBarangay] = useState("")
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false)
  const [isLoadingMunicipalities, setIsLoadingMunicipalities] = useState(false)
  const [isLoadingBarangays, setIsLoadingBarangays] = useState(false)

  // Predefined skills list from the user model
  const predefinedSkills = [
    "Strong Communication skills",
    "First Aid and CPR/BLS Certification",
    "Swimming and Lifesaving Skills",
    "Fire Safety Knowledge",
    "Disaster Preparedness Training",
    "Public Speaking and Teaching Skills",
    "Physical Fitness",
    "Leadership and Organizing",
    "First Aid and Disaster Preparedness",
    "Communication and Advocacy",
    "Creativity and Event Planning",
  ]

  // Predefined services list
  const predefinedServices = [
    "Welfare Services",
    "Safety Services",
    "Health Services",
    "Youth Services",
    "Blood Services",
    "Wash Services",
  ]

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    timeFrom: '',
    timeTo: '',
    location: {
      exactLocation: '',
      barangay: '',
      municipality: '',
      province: ''
    },
    requiredSkills: [],
    requiredServices: [],
    maxParticipants: 50,
    isUrgent: false,
    tags: [],
     notes: ''
  })

  const [newTag, setNewTag] = useState('')

  // Load existing activity data
  useEffect(() => {
    loadActivityData()
    fetchProvinces()
  }, [activityId])

  const loadActivityData = async () => {
    try {
      setInitialLoading(true)
      const response = await api.activities.getById(activityId)
      const activity = response.data

      // Set form data
      setFormData({
        title: activity.title || '',
        description: activity.description || '',
        date: activity.date ? new Date(activity.date).toISOString().split('T')[0] : '',
        timeFrom: activity.timeFrom || '',
        timeTo: activity.timeTo || '',
        location: {
          exactLocation: activity.location?.exactLocation || '',
          barangay: activity.location?.barangay || '',
          municipality: activity.location?.municipality || '',
          province: activity.location?.province || ''
        },
        requiredSkills: activity.requiredSkills || [],
        requiredServices: activity.requiredServices || [],
        maxParticipants: activity.maxParticipants || 50,
        isUrgent: activity.isUrgent || false,
        tags: activity.tags || [],
        notes: activity.notes || '',
         // status is controlled by backend; do not edit here
      })

      // Set location dropdowns
      if (activity.location?.province) {
        const province = provinces.find(p => p.name === activity.location.province)
        if (province) {
          setSelectedProvince(province.code)
          fetchMunicipalities(province.code)
        }
      }
      if (activity.location?.municipality) {
        const municipality = municipalities.find(m => m.name === activity.location.municipality)
        if (municipality) {
          setSelectedMunicipality(municipality.code)
          fetchBarangays(municipality.code)
        }
      }
      if (activity.location?.barangay) {
        const barangay = barangays.find(b => b.name === activity.location.barangay)
        if (barangay) {
          setSelectedBarangay(barangay.code)
        }
      }
    } catch (error) {
      toast.error('Failed to load activity data')
      console.error('Error loading activity:', error)
      navigate('/admin/activities')
    } finally {
      setInitialLoading(false)
    }
  }

  // PSGC API functions
  const fetchProvinces = async () => {
    setIsLoadingProvinces(true)
    try {
      const response = await axios.get(`${PSGC_API_URL}/provinces/`)
      setProvinces(response.data)
    } catch (error) {
      console.error('Error fetching provinces:', error)
    } finally {
      setIsLoadingProvinces(false)
    }
  }

  const fetchMunicipalities = async (provinceCode) => {
    if (!provinceCode) return
    setIsLoadingMunicipalities(true)
    try {
      const response = await axios.get(`${PSGC_API_URL}/provinces/${provinceCode}/municipalities/`)
      setMunicipalities(response.data)
    } catch (error) {
      console.error('Error fetching municipalities:', error)
    } finally {
      setIsLoadingMunicipalities(false)
    }
  }

  const fetchBarangays = async (municipalityCode) => {
    if (!municipalityCode) return
    setIsLoadingBarangays(true)
    try {
      const response = await axios.get(`${PSGC_API_URL}/municipalities/${municipalityCode}/barangays/`)
      setBarangays(response.data)
    } catch (error) {
      console.error('Error fetching barangays:', error)
    } finally {
      setIsLoadingBarangays(false)
    }
  }

  // Handle province selection
  const handleProvinceChange = (e) => {
    const provinceCode = e.target.value
    setSelectedProvince(provinceCode)
    setSelectedMunicipality("")
    setSelectedBarangay("")
    setMunicipalities([])
    setBarangays([])

    // Update form data
    handleNestedChange('location', 'province', provinces.find(p => p.code === provinceCode)?.name || "")

    if (provinceCode) {
      fetchMunicipalities(provinceCode)
    }
  }

  // Handle municipality selection
  const handleMunicipalityChange = (e) => {
    const municipalityCode = e.target.value
    setSelectedMunicipality(municipalityCode)
    setSelectedBarangay("")
    setBarangays([])

    // Update form data
    handleNestedChange('location', 'municipality', municipalities.find(m => m.code === municipalityCode)?.name || "")

    if (municipalityCode) {
      fetchBarangays(municipalityCode)
    }
  }

  // Handle barangay selection
  const handleBarangayChange = (e) => {
    const barangayCode = e.target.value
    setSelectedBarangay(barangayCode)

    // Update form data
    handleNestedChange('location', 'barangay', barangays.find(b => b.code === barangayCode)?.name || "")
  }

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

  const handleSkillChange = (skill, checked) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, skill],
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        requiredSkills: prev.requiredSkills.filter((s) => s !== skill),
      }))
    }
  }

  const handleServiceChange = (service, checked) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        requiredServices: [...prev.requiredServices, service],
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        requiredServices: prev.requiredServices.filter((s) => s !== service),
      }))
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.date ||
        !formData.timeFrom || !formData.timeTo ||
        !formData.location.barangay || !formData.location.municipality || !formData.location.province ||
        formData.requiredSkills.length === 0 || formData.requiredServices.length === 0) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      await api.activities.update(activityId, formData)
      toast.success('Activity updated successfully!')
      navigate(`/admin/activities/${userId}`)
    } catch (error) {
      toast.error(error.message || 'Failed to update activity')
      console.error('Error updating activity:', error)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <PrivateLayout>
        <div className="min-h-screen bg-blue-50 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <span className="text-gray-600">Loading activity...</span>
          </div>
        </div>
      </PrivateLayout>
    )
  }

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-blue-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Edit Activity</h1>
              <p className="text-sm text-gray-600">Update the details of your activity</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="w-full space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomInput
                  label="Activity Title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter activity title"
                  required
                />
                <CustomInput
                  label="Date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                />
                <CustomInput
                  label="Time From"
                  type="time"
                  value={formData.timeFrom}
                  onChange={(e) => handleInputChange('timeFrom', e.target.value)}
                  required
                />
                <CustomInput
                  label="Time To"
                  type="time"
                  value={formData.timeTo}
                  onChange={(e) => handleInputChange('timeTo', e.target.value)}
                  required
                />
                <div className="md:col-span-2">
                  <CustomInput
                    label="Description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the activity in detail"
                    multiline
                    rows={4}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Location</h2>
              <p className="text-sm text-gray-500 mb-4">
                Select your location from the dropdowns below.
              </p>

              {/* PSGC Location Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CustomInput
                  label="Province"
                  name="province"
                  type="select"
                  value={selectedProvince}
                  onChange={handleProvinceChange}
                  required
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
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

              {/* Display selected location names */}
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>Selected Location:</strong> {formData.location.barangay && formData.location.municipality && formData.location.province ?
                    `${formData.location.barangay}, ${formData.location.municipality}, ${formData.location.province}` :
                    'Please select location from dropdowns above'
                  }
                </p>
              </div>

              {/* Exact Location */}
              <div className="mt-4 grid grid-cols-1">
                <CustomInput
                  label="Exact Location (e.g., Multi-purpose Hall, Building)"
                  value={formData.location.exactLocation}
                  onChange={(e) => handleNestedChange('location', 'exactLocation', e.target.value)}
                  placeholder="Enter exact location details"
                />
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Requirements</h2>

              {/* Required Skills */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Skills
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {predefinedSkills.map((skill) => (
                    <label key={skill} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.requiredSkills.includes(skill)}
                        onChange={(e) => handleSkillChange(skill, e.target.checked)}
                        className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">{skill}</span>
                    </label>
                  ))}
                </div>
                {formData.requiredSkills.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">Please select at least one skill</p>
                )}
              </div>

              {/* Required Services */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Services
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {predefinedServices.map((service) => (
                    <label key={service} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.requiredServices.includes(service)}
                        onChange={(e) => handleServiceChange(service, e.target.checked)}
                        className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">{service}</span>
                    </label>
                  ))}
                </div>
                {formData.requiredServices.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">Please select at least one service</p>
                )}
              </div>

              {/* Other Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomInput
                  label="Max Participants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                  placeholder="50"
                />
              </div>
            </div>

            {/* Tags and Notes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h2>

              {/* Tags */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:bg-gray-200 rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <CustomInput
                label="Notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes or instructions"
                multiline
                rows={3}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="px-6 py-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                {loading ? 'Updating...' : 'Update Activity'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PrivateLayout>
  )
}

export default EditActivity
