import PrivateLayout from '@/layout/PrivateLayout'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import CustomInput from '@/components/CustomInput'
import axios from 'axios'
import { PSGC_API_URL, api } from '@/services/api'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

const EditLeader = () => {
  const navigate = useNavigate()
  const { leaderId } = useParams()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    dateOfBirth: '',
    email: '',
    contactNumber: '',
    photo: '',
    sex: '',
    address: {
      houseNumber: '',
      streetBlockLot: '',
      districtBarangayVillage: '',
      municipalityCity: '',
      province: '',
      zipcode: '',
    },
  })

  // PSGC
  const [provinces, setProvinces] = useState([])
  const [municipalities, setMunicipalities] = useState([])
  const [barangays, setBarangays] = useState([])
  const [selectedProvince, setSelectedProvince] = useState("")
  const [selectedMunicipality, setSelectedMunicipality] = useState("")
  const [selectedBarangay, setSelectedBarangay] = useState("")
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false)
  const [isLoadingMunicipalities, setIsLoadingMunicipalities] = useState(false)
  const [isLoadingBarangays, setIsLoadingBarangays] = useState(false)

  const fetchProvinces = async () => {
    setIsLoadingProvinces(true)
    try {
      const response = await axios.get(`${PSGC_API_URL}/provinces/`)
      setProvinces(response.data)
      return response.data
    } catch (e) {
      console.error('Failed to load provinces', e)
      return []
    } finally {
      setIsLoadingProvinces(false)
    }
  }

  const fetchMunicipalities = async (provinceCode) => {
    if (!provinceCode) return []
    setIsLoadingMunicipalities(true)
    try {
      const response = await axios.get(`${PSGC_API_URL}/provinces/${provinceCode}/municipalities/`)
      setMunicipalities(response.data)
      return response.data
    } catch (e) {
      console.error('Failed to load municipalities', e)
      return []
    } finally {
      setIsLoadingMunicipalities(false)
    }
  }

  const fetchBarangays = async (municipalityCode) => {
    if (!municipalityCode) return []
    setIsLoadingBarangays(true)
    try {
      const response = await axios.get(`${PSGC_API_URL}/municipalities/${municipalityCode}/barangays/`)
      setBarangays(response.data)
      return response.data
    } catch (e) {
      console.error('Failed to load barangays', e)
      return []
    } finally {
      setIsLoadingBarangays(false)
    }
  }

  useEffect(() => { fetchProvinces() }, [])

  useEffect(() => {
    const load = async () => {
      try {
        setInitialLoading(true)
        const res = await api.leaders.getById(leaderId)
        const l = res.data
        setFormData({
          lastName: l.lastName || '',
          firstName: l.firstName || '',
          middleName: l.middleName || '',
          dateOfBirth: l.dateOfBirth ? new Date(l.dateOfBirth).toISOString().split('T')[0] : '',
          email: l.email || '',
          contactNumber: l.contactNumber || '',
          photo: l.photo || '',
          sex: l.sex || '',
          address: {
            houseNumber: l.address?.houseNumber || '',
            streetBlockLot: l.address?.streetBlockLot || '',
            districtBarangayVillage: l.address?.districtBarangayVillage || '',
            municipalityCity: l.address?.municipalityCity || '',
            province: l.address?.province || '',
            zipcode: l.address?.zipcode || '',
          },
        })

        // Set PSGC dropdowns after form data is loaded
        if (l.address?.province) {
          const provinceObj = provinces.find(p => p.name === l.address.province)
          if (provinceObj) {
            setSelectedProvince(provinceObj.code)
            const municipalitiesList = await fetchMunicipalities(provinceObj.code)
            if (l.address?.municipalityCity) {
              const municipalityObj = municipalitiesList.find(m => m.name === l.address.municipalityCity)
              if (municipalityObj) {
                setSelectedMunicipality(municipalityObj.code)
                const barangaysList = await fetchBarangays(municipalityObj.code)
                if (l.address?.districtBarangayVillage) {
                  const barangayObj = barangaysList.find(b => b.name === l.address.districtBarangayVillage)
                  if (barangayObj) {
                    setSelectedBarangay(barangayObj.code)
                  }
                }
              }
            }
          }
        }
      } catch (e) {
        console.error('Failed to load leader', e)
        toast.error('Failed to load leader')
        navigate(-1)
      } finally {
        setInitialLoading(false)
      }
    }
    if (leaderId && provinces.length > 0) load()
  }, [leaderId, provinces, navigate])

  // loadLeader removed (inlined into effect)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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

  const handleProvinceChange = (e) => {
    const provinceCode = e.target.value
    setSelectedProvince(provinceCode)
    setSelectedMunicipality("")
    setSelectedBarangay("")
    setMunicipalities([])
    setBarangays([])
    handleNestedChange('address', 'province', provinces.find(p => p.code === provinceCode)?.name || "")
    if (provinceCode) fetchMunicipalities(provinceCode)
  }

  const handleMunicipalityChange = (e) => {
    const municipalityCode = e.target.value
    setSelectedMunicipality(municipalityCode)
    setSelectedBarangay("")
    setBarangays([])
    handleNestedChange('address', 'municipalityCity', municipalities.find(m => m.code === municipalityCode)?.name || "")
    if (municipalityCode) fetchBarangays(municipalityCode)
  }

  const handleBarangayChange = (e) => {
    const barangayCode = e.target.value
    setSelectedBarangay(barangayCode)
    handleNestedChange('address', 'districtBarangayVillage', barangays.find(b => b.code === barangayCode)?.name || "")
  }

  const convertToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
  })

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const base64 = await convertToBase64(file)
      handleInputChange('photo', base64)
    } catch (e) {
      console.error('Failed to convert image', e)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.lastName || !formData.firstName || !formData.dateOfBirth || !formData.email || !formData.contactNumber || !formData.sex || !formData.address.province || !formData.address.municipalityCity || !formData.address.districtBarangayVillage || !formData.address.zipcode) {
      toast.error('Please fill in all required fields')
      return
    }
    try {
      setLoading(true)
      await api.leaders.update(leaderId, formData)
      toast.success('Leader updated successfully!')
      navigate(-1)
    } catch (e) {
      toast.error(e.message || 'Failed to update leader')
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
            <span className="text-gray-600">Loading leader...</span>
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
              <h1 className="text-2xl font-bold text-gray-800">Edit Leader</h1>
              <p className="text-sm text-gray-600">Fill in the details below to edit the leader</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Leader Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CustomInput label="Last Name" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} required />
                <CustomInput label="First Name" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} required />
                <CustomInput label="Middle Name" value={formData.middleName} onChange={(e) => handleInputChange('middleName', e.target.value)} />
                <CustomInput label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} required />
                <CustomInput label="Sex" type="select" value={formData.sex} onChange={(e) => handleInputChange('sex', e.target.value)} required>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </CustomInput>
                <CustomInput label="Email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} required />
                <CustomInput label="Contact Number" value={formData.contactNumber} onChange={(e) => handleInputChange('contactNumber', e.target.value)} required />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CustomInput label="Province" type="select" value={selectedProvince} onChange={handleProvinceChange} required disabled={isLoadingProvinces}>
                  <option value="">Province</option>
                  {isLoadingProvinces ? (
                    <option value="">Loading Provinces...</option>
                  ) : (
                    provinces.map(p => (<option key={p.code} value={p.code}>{p.name}</option>))
                  )}
                </CustomInput>
                <CustomInput label="Municipality/City" type="select" value={selectedMunicipality} onChange={handleMunicipalityChange} required disabled={!selectedProvince || isLoadingMunicipalities}>
                  <option value="">Municipality/City</option>
                  {isLoadingMunicipalities ? (
                    <option value="">Loading Municipalities...</option>
                  ) : (
                    municipalities.map(m => (<option key={m.code} value={m.code}>{m.name}</option>))
                  )}
                </CustomInput>
                <CustomInput label="Barangay" type="select" value={selectedBarangay} onChange={handleBarangayChange} required disabled={!selectedMunicipality || isLoadingBarangays}>
                  <option value="">Barangay</option>
                  {isLoadingBarangays ? (
                    <option value="">Loading Barangays...</option>
                  ) : (
                    barangays.map(b => (<option key={b.code} value={b.code}>{b.name}</option>))
                  )}
                </CustomInput>
                <CustomInput label="House Number" value={formData.address.houseNumber} onChange={(e) => handleNestedChange('address', 'houseNumber', e.target.value)} />
                <CustomInput label="Street/Block/Lot" value={formData.address.streetBlockLot} onChange={(e) => handleNestedChange('address', 'streetBlockLot', e.target.value)} />
                <CustomInput label="Zip Code" value={formData.address.zipcode} onChange={(e) => handleNestedChange('address', 'zipcode', e.target.value)} required />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">{loading ? 'Updating…' : 'Update Leader'}</Button>
            </div>
          </form>
        </div>
      </div>
    </PrivateLayout>
  )
}

export default EditLeader


