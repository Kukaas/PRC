import PrivateLayout from '@/layout/PrivateLayout'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '@/services/api'
import { Calendar, Filter, Printer, Users, Search, MapPin } from 'lucide-react'
import CustomInput from '@/components/CustomInput'
import { printVolunteerHoursReport } from './utils/printVolunteerHours'

const Reports = () => {
  const [year, setYear] = useState(new Date().getFullYear())
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const printRef = useRef(null)
  // Client-side filters like AdminMemberStatus
  const [search, setSearch] = useState('')
  const [barangay, setBarangay] = useState('')
  const [municipality, setMunicipality] = useState('')
  const [service, setService] = useState('')
  const [status, setStatus] = useState('')

  const fetchReport = async (y) => {
    try {
      setLoading(true)
      setError('')
      const res = await api.reports.getVolunteerHours(y)
      if (res.success) {
        setData(res.data || [])
      } else {
        setData([])
        setError(res.message || 'Failed to load report')
      }
    } catch (e) {
      setError(e.message || 'Failed to load report')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport(year)
  }, [year])

  const years = useMemo(() => {
    const thisYear = new Date().getFullYear()
    const start = thisYear - 5
    return Array.from({ length: 7 }, (_, i) => start + i)
  }, [])

  const handleClear = () => {
    const y = new Date().getFullYear()
    setYear(y)
    setSearch(''); setBarangay(''); setMunicipality(''); setService(''); setStatus('')
  }

  const handlePrint = () => {
    const filters = { search, barangay, municipality, service, status }
    printVolunteerHoursReport({ year, rows: filteredData, filters })
  }

  const totalHours = useMemo(() => {
    return data.reduce((sum, r) => sum + (Number(r.hours) || 0), 0)
  }, [data])

  const uniqueBarangays = useMemo(() => [...new Set(data.map(d => d.address?.barangay).filter(Boolean))], [data])
  const uniqueMunicipalities = useMemo(() => [...new Set(data.map(d => d.address?.municipality).filter(Boolean))], [data])
  const uniqueServices = useMemo(() => [...new Set(data.flatMap(d => d.services || []).filter(Boolean))], [data])

  const filteredData = useMemo(() => {
    let list = data
    const norm = (v) => (v || '').toString().trim().toLowerCase()
    const term = norm(search)
    if (term) {
      list = list.filter(m => norm(m.name).includes(term))
    }
    if (barangay) {
      const b = norm(barangay)
      list = list.filter(m => norm(m.address?.barangay) === b)
    }
    if (municipality) {
      const mu = norm(municipality)
      list = list.filter(m => norm(m.address?.municipality) === mu)
    }
    if (service) {
      const sv = norm(service)
      list = list.filter(m => Array.isArray(m.services) && m.services.some(s => norm(s) === sv))
    }
    if (status) {
      const st = norm(status)
      list = list.filter(m => norm(m.status) === st)
    }
    return list
  }, [data, search, barangay, municipality, service, status])

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-blue-50">
        <div className="px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Volunteer Hours Report</h1>
            <button onClick={handlePrint} className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2">
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>

          {/* Filters */}
          <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="lg:col-span-2">
                <CustomInput
                  label={<span><Search className="w-4 h-4 inline mr-1" />Search</span>}
                  placeholder="Search name"
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
              <div>
                <CustomInput
                  type="select"
                  label={<span>Status</span>}
                  value={status}
                  onChange={(e)=>setStatus(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </CustomInput>
              </div>
              <div>
                <CustomInput
                  type="select"
                  label={<span><Calendar className="w-4 h-4 inline mr-1" />Year</span>}
                  value={year}
                  onChange={(e)=>setYear(Number(e.target.value))}
                >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </CustomInput>
              </div>
              <div className="flex items-end">
                <button onClick={handleClear} className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors text-sm">Clear</button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" ref={printRef}>
            <div className="bg-cyan-500 text-white px-6 py-4">
              <div className="grid grid-cols-6 gap-4 font-medium text-sm">
                <div>Name</div>
                <div>Address</div>
                <div>Services</div>
                <div>Hours ({year})</div>
                <div>Contact</div>
                <div>Notes</div>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="px-6 py-8 text-center text-gray-500">Loading...</div>
              ) : error ? (
                <div className="px-6 py-8 text-center text-red-600">{error}</div>
              ) : filteredData.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  No data found for {year}
                </div>
              ) : (
                filteredData.map((m) => (
                  <div key={m.userId} className="px-6 py-4 hover:bg-gray-50">
                    <div className="grid grid-cols-6 gap-4 text-sm items-center">
                      <div className="font-medium text-gray-900">{m.name}</div>
                      <div className="text-gray-700">{m.address?.barangay || '-'}, {m.address?.municipality || '-'}</div>
                      <div className="text-gray-700 truncate" title={(m.services||[]).join(', ')}>
                        {(m.services||[]).length ? (m.services||[]).join(', ') : '—'}
                      </div>
                      <div className="text-gray-700">{Math.round(m.hours || 0)}</div>
                      <div className="text-gray-700">{m.contactNumber || '—'}</div>
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${m.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {m.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {!loading && filteredData.length > 0 && (
              <div className="bg-gray-50 px-6 py-3 border-t text-sm text-gray-700 flex justify-between">
                <span>Total Volunteers: {filteredData.length}</span>
                <span>Total Hours: {Math.round(totalHours)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </PrivateLayout>
  )
}

export default Reports
