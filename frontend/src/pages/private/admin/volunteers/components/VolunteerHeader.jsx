import React from 'react'
import { Plus, Download, BarChart3 } from 'lucide-react'

const VolunteerHeader = () => {
  return (
    <div className=" px-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Volunteer Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage volunteer applications and profiles</p>
        </div>
      </div>
    </div>
  )
}

export default VolunteerHeader
