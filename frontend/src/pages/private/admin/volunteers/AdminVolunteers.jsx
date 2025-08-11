import PrivateLayout from '@/layout/PrivateLayout'
import React, { useState } from 'react'
import VolunteerHeader from './components/VolunteerHeader'
import VolunteerStats from './components/VolunteerStats'
import VolunteerTable from './components/VolunteerTable'

const AdminVolunteers = () => {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleDataChange = () => {
    // Trigger a refresh of the stats by updating the key
    setRefreshKey(prev => prev + 1)
  }

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-blue-50">
        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Header */}
          <VolunteerHeader />

          {/* Stats Section */}
          <VolunteerStats key={refreshKey} />

          {/* Volunteer Table */}
          <VolunteerTable onDataChange={handleDataChange} />
        </div>
      </div>
    </PrivateLayout>
  )
}

export default AdminVolunteers
