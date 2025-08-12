import React, { useEffect, useMemo, useState } from 'react'
import PrivateLayout from '@/layout/PrivateLayout'
import { api } from '@/services/api'
import { useAuth } from '@/components/AuthContext'
import { CheckCircle2, Activity as ActivityIcon, Phone, Clock, HeartHandshake } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const StatCard = ({ label, value, icon: Icon, emphasis = false, accent = 'cyan' }) => {
  const accentMap = {
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600' },
    green: { bg: 'bg-green-50', text: 'text-green-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600' },
  }
  const colors = accentMap[accent] || accentMap.cyan
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="text-gray-600 text-sm font-medium">{label}</div>
          {Icon && (
            <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>
        <div className={`${emphasis ? 'text-2xl' : 'text-xl'} font-bold text-gray-900`}>
          <span className="inline-block px-4 py-2 rounded-md bg-cyan-100">{value}</span>
        </div>
      </div>
    </div>
  )
}

const GradientCard = ({ label, value, icon: Icon }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
    <div className="p-5">
      <div className="text-gray-600 text-sm font-medium mb-2">{label}</div>
      <div className="px-4 py-3 rounded-md bg-gradient-to-r from-cyan-50 to-white text-gray-900 font-bold flex items-center justify-between">
        <div className="truncate">{value}</div>
        {Icon && <Icon className="w-5 h-5 text-cyan-600" />}
      </div>
    </div>
  </div>
)

const MemberStatus = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [summary, setSummary] = useState(null)

  const barangay = useMemo(
    () => user?.personalInfo?.address?.districtBarangayVillage || '—',
    [user]
  )

  const selectedServices = useMemo(() => {
    const raw = user?.services || []
    if (!Array.isArray(raw)) return []
    return raw.map(s => typeof s === 'string' ? s : s?.type).filter(Boolean)
  }, [user])

  // Skills no longer displayed in header table, but computed here if needed later

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await api.activities.getMyStatus()
        if (res.success) {
          setSummary(res.data)
        } else {
          setError(res.message || 'Failed to load status')
        }
      } catch (e) {
        setError(e.message || 'Failed to load status')
      } finally {
        setLoading(false)
      }
    }
    fetchStatus()
  }, [])

  const name = useMemo(() => `${user?.givenName || ''} ${user?.familyName || ''}`.trim() || '—', [user])

  const activeBadge = useMemo(() => {
    const isActive = summary?.activeStatus === 'Active'
    return (
      <div className="flex items-center gap-2">
        <span className={`inline-block w-2.5 h-2.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
        <span className="font-semibold text-gray-900">{summary?.activeStatus || '—'}</span>
      </div>
    )
  }, [summary])

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-blue-50">
        <div className="px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Status</h1>
            <p className="text-gray-600 mt-1">View your status as a volunteer</p>
          </div>

          {/* Header table on md+ screens */}
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <div className="min-w-[900px] rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="bg-gradient-to-r from-cyan-600 to-cyan-500 px-6 py-3">
                  <div className="grid grid-cols-5 gap-4 text-sm font-semibold text-white">
                    <div>Name</div>
                    <div>Barangay</div>
                    <div>Last activity</div>
                    <div>Hours Served</div>
                    <div>Status</div>
                  </div>
                </div>
                <div className="px-6 py-4 text-sm text-gray-700">
                  {loading ? (
                    <div className="py-2">Loading...</div>
                  ) : error ? (
                    <div className="py-2 text-red-600">{error}</div>
                  ) : (
                    <div className="grid grid-cols-5 gap-4">
                      <div className="font-medium text-gray-900 whitespace-nowrap">{name}</div>
                      <div className="whitespace-nowrap">{barangay}</div>
                      <div className="whitespace-nowrap">{formatDate(summary?.lastActivityDate) || '—'}</div>
                      <div className="whitespace-nowrap">{summary ? Math.round((summary.hoursServedThisYear || 0)) : 0}</div>
                      <div className="whitespace-nowrap">{summary ? (summary.activeStatus || '—') : '—'}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile summary list for readability */}
          <div className="md:hidden">
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
              {loading ? (
                <div className="text-sm text-gray-600">Loading...</div>
              ) : error ? (
                <div className="text-sm text-red-600">{error}</div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name</span>
                    <span className="font-medium text-gray-900">{name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Barangay</span>
                    <span className="text-gray-900">{barangay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last activity</span>
                    <span className="text-gray-900">{formatDate(summary?.lastActivityDate) || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Hours Served</span>
                    <span className="text-gray-900">{summary ? Math.round((summary.hoursServedThisYear || 0)) : 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className="text-gray-900">{summary ? (summary.activeStatus || '—') : '—'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse h-28" />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-5">
                  <div className="text-gray-600 text-sm font-medium mb-2">Training Status</div>
                  <div className="px-4 py-3 rounded-md bg-gradient-to-r from-cyan-50 to-white text-gray-900 font-bold flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                        summary?.trainedStatus === 'Trained' ? 'bg-green-500' : 'bg-orange-500'
                      }`} />
                      <span>{summary?.trainedStatus || '—'}</span>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-cyan-600" />
                  </div>
                </div>
              </div>
              <GradientCard label="Last activity" value={formatDate(summary?.lastActivityDate) || '—'} icon={ActivityIcon} />
              <GradientCard label="Contact number" value={summary?.contactNumber || '—'} icon={Phone} />

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-5">
                  <div className="text-gray-600 text-sm font-medium mb-2">Status</div>
                  <div className="px-4 py-3 rounded-md bg-gradient-to-r from-cyan-50 to-white text-gray-900 font-bold flex items-center justify-between">
                    {activeBadge}
                    <Clock className="w-5 h-5 text-cyan-600" />
                  </div>
                </div>
              </div>

              <GradientCard
                label="Hours Served"
                value={`${Math.round((summary?.hoursServedThisYear || 0))} Hours`}
                icon={Clock}
              />

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-5">
                  <div className="text-gray-600 text-sm font-medium mb-2">Service</div>
                  <div className="px-4 py-3 rounded-md bg-gradient-to-r from-cyan-50 to-white text-gray-900 font-bold flex items-center justify-between">
                    <div className="truncate mr-3" title={selectedServices.join(', ')}>
                      {selectedServices.length > 0 ? selectedServices.join(', ') : '—'}
                    </div>
                    <HeartHandshake className="w-5 h-5 text-cyan-600" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
    </PrivateLayout>
  )
}

export default MemberStatus
