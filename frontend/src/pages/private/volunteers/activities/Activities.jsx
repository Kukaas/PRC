import PrivateLayout from '@/layout/PrivateLayout'
import React, { useState, useEffect } from 'react'
import { api } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AvailableActivities from './components/AvailableActivities'
import JoinedActivities from './components/JoinedActivities'

const Activities = () => {
  const navigate = useNavigate()
  const [hasApplication, setHasApplication] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('available')

  useEffect(() => {
    checkVolunteerApplication()
  }, [])

  const checkVolunteerApplication = async () => {
    try {
      console.log('Checking volunteer application...')
      const response = await api.volunteerApplication.getMyApplication()
      console.log('Volunteer application response:', response)
      setHasApplication(true)
      setApplicationStatus(response.data.status)
      console.log('Set application status to:', response.data.status)
    } catch (error) {
      console.log('Error checking volunteer application:', error.message)
      if (error.message.includes('No application found')) {
        setHasApplication(false)
        console.log('No application found, set hasApplication to false')
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

  const handleActivityJoin = () => {
    // Refresh joined activities when user joins a new activity
    console.log('Activity joined, refreshing tabs...')
  }

  const handleActivityLeave = () => {
    // Refresh available activities when user leaves an activity
    console.log('Activity left, refreshing tabs...')
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

  // Show activities for approved volunteers with tabbed interface
  return (
    <PrivateLayout>
      <div className="min-h-screen bg-blue-50">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Activities</h2>
            <p className="text-gray-600 mt-1">Find and manage your volunteer activities</p>
          </div>

          {/* Tabs Section */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0 gap-1">
                  <TabsTrigger
                    value="available"
                    className="data-[state=active]:bg-cyan-300 data-[state=active]:text-black py-2 px-3 text-xs sm:text-sm font-medium rounded-xl transition-all hover:bg-cyan-50 hover:text-cyan-700"
                  >
                    Available Activities
                  </TabsTrigger>
                  <TabsTrigger
                    value="joined"
                    className="data-[state=active]:bg-cyan-300 data-[state=active]:text-black py-2 px-3 text-xs sm:text-sm font-medium rounded-xl transition-all hover:bg-cyan-50 hover:text-cyan-700"
                  >
                    Joined Activities
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="available" className="mt-6">
                  <AvailableActivities onActivityJoin={handleActivityJoin} />
                </TabsContent>

                <TabsContent value="joined" className="mt-6">
                  <JoinedActivities onActivityLeave={handleActivityLeave} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </PrivateLayout>
  )
}

export default Activities

