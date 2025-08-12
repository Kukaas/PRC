import PrivateLayout from '@/layout/PrivateLayout'
import React, { useEffect, useMemo, useState } from 'react'
import { api } from '@/services/api'
import { Search, MapPin, Filter, Phone, Users } from 'lucide-react'
import CustomInput from '@/components/CustomInput'

const AdminMemberStatus = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [search, setSearch] = useState('')
  const [barangay, setBarangay] = useState('')
  const [municipality, setMunicipality] = useState('')
  const [service, setService] = useState('')
  const [status, setStatus] = useState('')

  // Track initial fetch so we don't refetch on filter changes
  const [hasFetched, setHasFetched] = useState(false)
  const PAGE_SIZE = 15
  const [currentPage, setCurrentPage] = useState(1)

  const fetchData = async () => {
    try {
      if (hasFetched) return
      setLoading(true)
      setError(null)
      const res = await api.volunteerApplication.getAll({ status: 'accepted' })
      if (res.success) {
        // Transform the data to match the expected format
        const transformedData = (res.data || []).map(application => ({
          userId: application.applicant?._id || application.applicant?.id,
          name: `${application.applicant?.givenName || ''} ${application.applicant?.familyName || ''}`.trim(),
          email: application.applicant?.email || '',
          contactNumber: application.applicant?.mobileNumber || application.applicant?.personalInfo?.mobileNumber || application.applicant?.personalInfo?.contactNumber || '',
          address: {
            barangay: application.applicant?.personalInfo?.address?.districtBarangayVillage || '',
            municipality: application.applicant?.personalInfo?.address?.municipalityCity || '',
            province: application.applicant?.personalInfo?.address?.province || ''
          },
          services: application.applicant?.services?.map(service => service.type) || [],
          skills: application.applicant?.skills || [],
          status: application.status,
          isTrained: application.isTrained,
          hoursServedThisYear: application.hoursServedThisYear || 0,
          submittedAt: application.submittedAt,
          reviewedAt: application.reviewedAt
        }))
        setData(transformedData)
      } else {
        setError(res.message || 'Failed to load accepted volunteers')
      }
    } catch (e) {
      setError(e.message || 'Failed to load accepted volunteers')
    } finally {
      setLoading(false)
      setHasFetched(true)
    }
  }

  // Initial fetch only once
  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clearFilters = async () => {
    setSearch(''); setBarangay(''); setMunicipality(''); setService(''); setStatus('')
  }

  const uniqueBarangays = useMemo(() => [...new Set(data.map(d => d.address?.barangay).filter(Boolean))], [data])
  const uniqueMunicipalities = useMemo(() => [...new Set(data.map(d => d.address?.municipality).filter(Boolean))], [data])
  const uniqueServices = useMemo(() => [...new Set(data.flatMap(d => d.services || []).filter(Boolean))], [data])

  // Client-side filtering from the initially fetched dataset
  const filteredData = useMemo(() => {
    let list = data

    const term = (search || '').trim().toLowerCase()
    if (term) {
      list = list.filter((m) => {
        const name = (m.name || '').toLowerCase()
        const email = (m.email || '').toLowerCase()
        return name.includes(term) || email.includes(term)
      })
    }
    const norm = (v) => (v || '').toString().trim().toLowerCase()
    if (barangay) {
      const b = norm(barangay)
      list = list.filter((m) => norm(m.address?.barangay) === b)
    }
    if (municipality) {
      const mu = norm(municipality)
      list = list.filter((m) => norm(m.address?.municipality) === mu)
    }
    if (service) {
      const sv = norm(service)
      list = list.filter((m) => Array.isArray(m.services) && m.services.some((s) => norm(s) === sv))
    }
    if (status) {
      const st = norm(status)
      if (st === 'trained') {
        list = list.filter((m) => m.isTrained === true)
      } else if (st === 'not_trained') {
        list = list.filter((m) => m.isTrained === false)
      }
    }

    return list
  }, [data, search, barangay, municipality, service, status])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, barangay, municipality, service, status])

  const totalPages = useMemo(() => {
    const pages = Math.ceil((filteredData?.length || 0) / PAGE_SIZE)
    return pages > 0 ? pages : 1
  }, [filteredData?.length])

  // Clamp current page if it exceeds totalPages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredData.slice(start, start + PAGE_SIZE)
  }, [filteredData, currentPage])

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-blue-50">
        <div className="px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Accepted Volunteers</h1>
            <p className="text-gray-600 mt-1">Showing only accepted volunteers</p>
          </div>

          {/* Filters */}
          <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="lg:col-span-2">
                <CustomInput
                  label={<span><Search className="w-4 h-4 inline mr-1" />Search</span>}
                  placeholder="Search name or email"
                  value={search}
                  onChange={(e)=>setSearch(e.target.value)}
                />
              </div>
              <div>
                <CustomInput
                  type="select"
                  label={<span><MapPin className="w-4 h-4 inline mr-1" />Barangay</span>}
                  value={barangay}
                  onChange={(e)=>setBarangay(e.target.value)}
                >
                  <option value="">All</option>
                  {uniqueBarangays.map(b => <option key={b} value={b}>{b}</option>)}
                </CustomInput>
              </div>
              <div>
                <CustomInput
                  type="select"
                  label={<span><MapPin className="w-4 h-4 inline mr-1" />Municipality</span>}
                  value={municipality}
                  onChange={(e)=>setMunicipality(e.target.value)}
                >
                  <option value="">All</option>
                  {uniqueMunicipalities.map(m => <option key={m} value={m}>{m}</option>)}
                </CustomInput>
              </div>
              <div>
                <CustomInput
                  type="select"
                  label={<span><Filter className="w-4 h-4 inline mr-1" />Service</span>}
                  value={service}
                  onChange={(e)=>setService(e.target.value)}
                >
                  <option value="">All</option>
                  {uniqueServices.map(s => <option key={s} value={s}>{s}</option>)}
                </CustomInput>
              </div>
              <div className="flex items-end">
                <button onClick={clearFilters} className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors text-sm">Clear</button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-cyan-500 text-white px-6 py-4">
              <div className="grid grid-cols-6 gap-4 font-medium text-sm">
                <div>Name</div>
                <div>Address</div>
                <div>Services</div>
                <div>Hours Served</div>
                <div>Contact</div>
                <div>Training Status</div>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className='flex items-center justify-center p-10'>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : error ? (
                <div className="px-6 py-8 text-center text-red-600">{error}</div>
              ) : filteredData.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  No members found
                </div>
              ) : (
                paginatedData.map((m) => (
                  <div key={m.userId} className="px-6 py-4 hover:bg-gray-50">
                    <div className="grid grid-cols-6 gap-4 text-sm items-center">
                      <div className="font-medium text-gray-900">{m.name}</div>
                      <div className="text-gray-700">{m.address?.barangay || '-'}, {m.address?.municipality || '-'}</div>
                      <div className="text-gray-700 truncate" title={(m.services||[]).join(', ')}>
                        {(m.services||[]).length ? (m.services||[]).join(', ') : '—'}
                      </div>
                      <div className="text-gray-700">{Math.round(m.hoursServedThisYear || 0)}</div>
                      <div className="text-gray-700 flex items-center gap-2"><Phone className="w-4 h-4" /> {m.contactNumber || '—'}</div>
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${m.isTrained ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                          {m.isTrained ? 'Trained' : 'Not Trained'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Pagination */}
            {filteredData.length > PAGE_SIZE && (
              <div className="px-6 py-4 flex items-center justify-between border-t bg-white">
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}
                  {' '}to {Math.min(currentPage * PAGE_SIZE, filteredData.length)} of {filteredData.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1 text-sm rounded border disabled:opacity-50"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      className={`px-3 py-1 text-sm rounded border ${currentPage === i + 1 ? 'bg-cyan-600 text-white border-cyan-600' : ''}`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="px-3 py-1 text-sm rounded border disabled:opacity-50"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PrivateLayout>
  )
}

export default AdminMemberStatus
