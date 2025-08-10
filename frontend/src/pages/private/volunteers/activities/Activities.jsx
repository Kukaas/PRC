import PrivateLayout from '@/layout/PrivateLayout'
import React, { useState, useEffect } from 'react'
// import { useAuth } from '@/components/AuthContext'
import { api } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, QrCode, Calendar, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Activities = () => {
  // const { user } = useAuth()
  const navigate = useNavigate()
  const [hasApplication, setHasApplication] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkVolunteerApplication()
  }, [])

  const checkVolunteerApplication = async () => {
    try {
      const response = await api.volunteerApplication.getMyApplication()
      setHasApplication(true)
      setApplicationStatus(response.data.status)
    } catch (error) {
      if (error.message.includes('No application found')) {
        setHasApplication(false)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleApplyNow = () => {
    navigate('/volunteer-application')
  }

  const handleViewApplication = () => {
    navigate('/volunteer-application')
  }

  if (loading) {
    return (
      <PrivateLayout>
        <div className="min-h-screen bg-blue-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PrivateLayout>
    )
  }

  // Show apply button if user hasn't applied
  if (!hasApplication) {
    return (
      <PrivateLayout>
        <div className="min-h-screen bg-blue-50">
          {/* Main Content */}
          <div className="p-6 space-y-6">
            {/* Activities Header */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Activities</h2>
            </div>

            {/* Apply First Message */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="mb-6">
                  <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Become a Volunteer First
                  </h3>
                  <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                    To access activities and events, you need to apply as a volunteer first.
                    Complete your volunteer application to get started.
                  </p>
                </div>
                <Button
                  onClick={handleApplyNow}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2"
                >
                  Apply as Volunteer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PrivateLayout>
    )
  }

  // Show pending application message
  if (applicationStatus === 'pending') {
    return (
      <PrivateLayout>
        <div className="min-h-screen bg-blue-50">
          {/* Main Content */}
          <div className="p-6 space-y-6">
            {/* Activities Header */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Activities</h2>
            </div>

            {/* Pending Application Message */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="mb-6">
                  <FileText className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Application Under Review
                  </h3>
                  <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                    Your volunteer application is currently being reviewed.
                    You'll be able to access activities once your application is approved.
                  </p>
                </div>
                <Button
                  onClick={handleViewApplication}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2"
                >
                  View Application Status
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PrivateLayout>
    )
  }

  // Show rejected application message
  if (applicationStatus === 'rejected') {
    return (
      <PrivateLayout>
        <div className="min-h-screen bg-blue-50">
          {/* Main Content */}
          <div className="p-6 space-y-6">
            {/* Activities Header */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Activities</h2>
            </div>

            {/* Rejected Application Message */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="mb-6">
                  <FileText className="w-16 h-16 text-red-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Application Not Approved
                  </h3>
                  <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                    Your volunteer application was not approved.
                    Please contact the admin for more information or submit a new application.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={handleApplyNow}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2"
                  >
                    Apply Again
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PrivateLayout>
    )
  }

  // Show activities for approved volunteers
  return (
    <PrivateLayout>
      <div className="min-h-screen bg-blue-50">
        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Activities Header */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Activities</h2>
          </div>

          {/* Current Event Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Event</h3>

            {/* Current Event Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* JOIN NOW Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-center overflow-hidden">
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full bg-white transform rotate-12 scale-150"></div>
                  </div>

                  {/* Main text */}
                  <div className="relative z-10">
                    <div className="text-6xl font-bold text-white mb-2">JOIN</div>
                    <div className="text-2xl font-semibold text-blue-200">NOW</div>
                  </div>

                  {/* See Details Button */}
                  <Button
                    className="relative z-10 mt-6 bg-white text-blue-600 hover:bg-blue-50 px-6 py-2"
                  >
                    See Details
                  </Button>
                </div>
              </div>

              {/* QR Code Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <QrCode className="w-32 h-32 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-500">QR Code</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* History Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">History</h3>

            {/* History Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start space-x-4">
                {/* Mini JOIN NOW Icon */}
                <div className="bg-cyan-500 rounded-lg p-3 flex-shrink-0">
                  <div className="text-center">
                    <div className="text-sm font-bold text-white">JOIN</div>
                    <div className="text-xs font-semibold text-cyan-200">NOW</div>
                  </div>
                </div>

                {/* Empty History Area */}
                <div className="flex-1">
                  <div className="text-gray-500 text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">No activity history yet</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PrivateLayout>
  )
}

export default Activities

