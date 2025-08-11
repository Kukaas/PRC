import React, { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import { useAuth } from '@/components/AuthContext'
import { api } from '@/services/api'

const DashboardOverview = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.dashboard.getOverview()
        if (res.success) {
          setStats(res.data)
        } else {
          setStats(null)
        }
      } catch (e) {
        setError(e.message || 'Failed to load dashboard overview')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
      <p className="text-gray-600 mb-6">Welcome back, {user.role}!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Applicants Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Applicants</h3>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-24 bg-gray-200 rounded" />
              <div className="grid grid-cols-3 gap-3">
                <div className="h-16 bg-gray-200 rounded" />
                <div className="h-16 bg-gray-200 rounded" />
                <div className="h-16 bg-gray-200 rounded" />
              </div>
            </div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : (
            <>
              <div className="mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold text-gray-800">{stats?.applicants?.total ?? 0}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600 mb-1">Accepted</div>
                  <div className="text-lg font-semibold text-blue-600">{stats?.applicants?.accepted ?? 0}</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600 mb-1">Pending</div>
                  <div className="text-lg font-semibold text-yellow-600">{stats?.applicants?.pending ?? 0}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600 mb-1">Under Review</div>
                  <div className="text-lg font-semibold text-gray-600">{stats?.applicants?.underReview ?? 0}</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Total Volunteers Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Total Volunteers</h3>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-24 bg-gray-200 rounded" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 bg-gray-200 rounded" />
                <div className="h-16 bg-gray-200 rounded" />
              </div>
            </div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : (
            <>
              <div className="mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold text-gray-800">{stats?.volunteers?.total ?? 0}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600 mb-1">Active (last {stats?.volunteers?.windowMonths ?? 6} months)</div>
                  <div className="text-lg font-semibold text-green-600">{stats?.volunteers?.active ?? 0}</div>
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600 mb-1">Inactive</div>
                  <div className="text-lg font-semibold text-red-600">{stats?.volunteers?.inactive ?? 0}</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview
