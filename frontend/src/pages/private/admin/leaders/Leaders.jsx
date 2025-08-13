import PrivateLayout from '@/layout/PrivateLayout'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import LeaderTable from './components/LeaderTable'
import { Plus } from 'lucide-react'

const Leaders = () => {
  const navigate = useNavigate()

  const handleCreate = () => {
    navigate('/admin/leaders/create')
  }

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-blue-50">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
            <h1 className="text-2xl font-bold text-gray-900">Barangay Leaders</h1>
            <p className="text-gray-600 mt-1">View and manage leaders of each barangay</p>
            </div>
            <Button onClick={handleCreate} className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg">
              <Plus className="w-4 h-4 mr-2" /> Add Leader
            </Button>
          </div>

          <LeaderTable />
        </div>
      </div>
    </PrivateLayout>
  )
}

export default Leaders
