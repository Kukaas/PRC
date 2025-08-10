import PrivateLayout from '@/layout/PrivateLayout'
import React from 'react'
import TopBar from './components/TopBar'
import DashboardOverview from './components/DashboardOverview'
import ActivitySection from './components/ActivitySection'
import AttendanceSection from './components/AttendanceSection'

const Dashboard = () => {
  return (
    <PrivateLayout>
      <div className="min-h-screen bg-blue-50">
        {/* Top Bar */}
        <TopBar />

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Dashboard Overview */}
          <DashboardOverview />

          {/* Activity and Attendance Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActivitySection />
            <AttendanceSection />
          </div>
        </div>
      </div>
    </PrivateLayout>
  )
}

export default Dashboard
