import React from 'react'
import { Users } from 'lucide-react'
import { useAuth } from '@/components/AuthContext'

const DashboardOverview = () => {
  const { user } = useAuth()
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

          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-gray-800">100</span>
              <span className="text-sm text-green-600 font-medium">+ 2%</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-sm text-gray-600 mb-1">Approved</div>
              <div className="text-lg font-semibold text-blue-600">100</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="text-sm text-gray-600 mb-1">Pending</div>
              <div className="text-lg font-semibold text-yellow-600">10</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-sm text-gray-600 mb-1">Oriented</div>
              <div className="text-lg font-semibold text-green-600">2</div>
            </div>
          </div>
        </div>

        {/* Total Volunteers Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Total Volunteers</h3>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-gray-800">100</span>
              <span className="text-sm text-green-600 font-medium">+ 2%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-sm text-gray-600 mb-1">Active</div>
              <div className="text-lg font-semibold text-green-600">90</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <div className="text-sm text-gray-600 mb-1">Inactive</div>
              <div className="text-lg font-semibold text-red-600">4</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview
