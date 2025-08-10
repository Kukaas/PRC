import PrivateLayout from '@/layout/PrivateLayout'
import React from 'react'
import VolunteerHeader from './components/VolunteerHeader'
import VolunteerTable from './components/VolunteerTable'

const AdminVolunteers = () => {
  return (
    <PrivateLayout>
      <div className="flex flex-col gap-6">
        <VolunteerHeader />
        <VolunteerTable />
      </div>
    </PrivateLayout>
  )
}

export default AdminVolunteers
