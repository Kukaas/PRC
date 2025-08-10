import React, { useState, useEffect } from 'react'
import { api } from '@/services/api'
import { useAuth } from '@/components/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, MapPin, Clock, Eye, QrCode } from 'lucide-react'
import QRCode from 'react-qr-code'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const JoinedActivities = ({ onActivityLeave }) => {
  const { user } = useAuth()
  const [activities, setActivities] = useState([])
  const [loadingActivities, setLoadingActivities] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [showQRDialog, setShowQRDialog] = useState(false)

  useEffect(() => {
    loadJoinedActivities()
  }, [])

  const loadJoinedActivities = async () => {
    setLoadingActivities(true)
    try {
      console.log('Loading joined activities for user:', user?.email)
      const response = await api.activities.getMyActivities({
        page: 1,
        limit: 50,
        status: 'all'
      })
      console.log('Joined activities response:', response)

      if (response?.data) {
        setActivities(response.data)
        console.log('Joined activities loaded:', response.data.length)
      } else {
        console.error('Invalid response format:', response)
        setActivities([])
      }
    } catch (error) {
      console.error('Error loading joined activities:', error)
      setActivities([])
    } finally {
      setLoadingActivities(false)
    }
  }

  const handleLeaveActivity = async (activityId) => {
    try {
      await api.activities.leave(activityId)
      // Reload activities to update join status
      await loadJoinedActivities()
      // Notify parent component
      if (onActivityLeave) {
        onActivityLeave()
      }
    } catch (error) {
      console.error('Error leaving activity:', error)
    }
  }

  const handleViewDetails = (activity) => {
    setSelectedActivity(activity)
    setShowQRDialog(true)
  }

  const generateActivityQR = (activity) => {
    if (!activity || !user) return ''

    const given = user.givenName || ''
    const middle = user.middleName || ''
    const family = user.familyName || ''
    const fullName = [given, middle, family].filter(Boolean).join(' ')
    const contact = user.personalInfo?.mobileNumber || user.personalInfo?.contactNumber || ''
    const email = user.email || ''

    // Activity-specific QR payload
    return JSON.stringify({
      name: fullName,
      contactNumber: contact,
      email,
      userId: user._id,
      activityId: activity._id,
      activityTitle: activity.title,
      activityDate: activity.date,
      version: 1,
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="space-y-6">
      {/* Joined Activities Grid */}
      {loadingActivities ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : activities.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Joined Activities</h3>
          <p className="text-gray-600">You haven't joined any activities yet. Check the Available Activities tab to find opportunities.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <Card key={activity._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg line-clamp-2">{activity.title}</CardTitle>
                  <Badge
                    variant={activity.status === 'ongoing' ? 'default' : 'secondary'}
                    className="ml-2 flex-shrink-0"
                  >
                    {activity.status}
                  </Badge>
                </div>

                {/* Skills and Services */}
                <div className="space-y-2">
                  {activity.requiredSkills && activity.requiredSkills.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Required Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {activity.requiredSkills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {activity.requiredServices && activity.requiredServices.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Required Services:</p>
                      <div className="flex flex-wrap gap-1">
                        {activity.requiredServices.map((service, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Date and Time */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(activity.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(activity.timeFrom)} - {formatTime(activity.timeTo)}</span>
                </div>

                {/* Location */}
                {activity.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">
                      {activity.location.barangay}, {activity.location.municipality}, {activity.location.province}
                    </span>
                  </div>
                )}

                {/* Participants */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>
                    {activity.participants?.length || 0} / {activity.maxParticipants || '∞'} participants
                  </span>
                </div>

                {/* Description */}
                {activity.description && (
                  <p className="text-sm text-gray-600 line-clamp-3">{activity.description}</p>
                )}

                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  <Button
                    onClick={() => handleViewDetails(activity)}
                    className="w-full bg-cyan-600 hover:bg-cyan-700"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details & QR Code
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleLeaveActivity(activity._id)}
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Leave Activity
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Activity Details & QR Code AlertDialog */}
      <AlertDialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">
              {selectedActivity?.title}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                {/* Activity Details */}
                <div className="text-left space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Date:</strong> {selectedActivity && formatDate(selectedActivity.date)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Time:</strong> {selectedActivity && formatTime(selectedActivity.timeFrom)} - {selectedActivity && formatTime(selectedActivity.timeTo)}
                  </p>
                  {selectedActivity?.location && (
                    <p className="text-sm text-gray-600">
                      <strong>Location:</strong> {selectedActivity.location.barangay}, {selectedActivity.location.municipality}, {selectedActivity.location.province}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    <strong>Status:</strong> {selectedActivity?.status}
                  </p>
                </div>

                {/* QR Code */}
                <div className="text-center">
                  <h4 className="text-md font-medium mb-3">Attendance QR Code</h4>
                  <div className="flex justify-center">
                    <QRCode
                      value={selectedActivity ? generateActivityQR(selectedActivity) : ''}
                      size={200}
                      level="M"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    Show this QR code for attendance tracking at this specific activity
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => setShowQRDialog(false)} className="w-full">
              Close
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default JoinedActivities
