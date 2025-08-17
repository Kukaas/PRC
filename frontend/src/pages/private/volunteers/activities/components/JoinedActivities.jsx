import React, { useState, useEffect } from 'react'
import { api } from '@/services/api'
import { useAuth } from '@/components/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Calendar, Users, MapPin, Clock, Eye, QrCode, Loader2, Search } from 'lucide-react'
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
  const [filteredActivities, setFilteredActivities] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingActivities, setLoadingActivities] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [showQRDialog, setShowQRDialog] = useState(false)
  const [leavingActivities, setLeavingActivities] = useState(new Set())

  useEffect(() => {
    loadJoinedActivities()
  }, [])

  useEffect(() => {
    // Filter activities based on search term
    if (searchTerm.trim() === '') {
      setFilteredActivities(activities)
    } else {
      const filtered = activities.filter(activity =>
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activity.location?.barangay && activity.location.barangay.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (activity.location?.municipality && activity.location.municipality.toLowerCase().includes(searchTerm.toLowerCase())) ||
        formatDate(activity.date).toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredActivities(filtered)
    }
  }, [searchTerm, activities])

  const loadJoinedActivities = async () => {
    setLoadingActivities(true)
    try {
      const response = await api.activities.getMyActivities({
        page: 1,
        limit: 50,
        status: 'all'
      })

      if (response?.data) {
        // Sort activities by date (newer events on top)
        const sortedActivities = response.data.sort((a, b) => {
          const dateA = new Date(a.date)
          const dateB = new Date(b.date)
          return dateB - dateA // Descending order (newest first)
        })

        setActivities(sortedActivities)
        setFilteredActivities(sortedActivities)
      } else {
        setActivities([])
        setFilteredActivities([])
      }
    } catch (error) {
      console.error('Error loading joined activities:', error)
      setActivities([])
      setFilteredActivities([])
    } finally {
      setLoadingActivities(false)
    }
  }

  const handleLeaveActivity = async (activityId) => {
    try {
      // Set loading state for this specific activity
      setLeavingActivities(prev => new Set(prev).add(activityId))

      await api.activities.leave(activityId)
      // Reload activities to update join status
      await loadJoinedActivities()
      // Notify parent component
      if (onActivityLeave) {
        onActivityLeave()
      }
    } catch (error) {
      console.error('Error leaving activity:', error)
    } finally {
      // Clear loading state for this specific activity
      setLeavingActivities(prev => {
        const newSet = new Set(prev)
        newSet.delete(activityId)
        return newSet
      })
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

  const getLeaveButtonProps = (activity) => {
    const isLeaving = leavingActivities.has(activity._id)
    const isDisabled = ['ongoing', 'completed', 'cancelled'].includes(activity.status)

    return {
      disabled: isDisabled || isLeaving,
      className: `w-full text-sm sm:text-base ${isDisabled
        ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
        : isLeaving
          ? 'border-blue-200 text-blue-400 cursor-not-allowed bg-blue-50'
          : 'border-red-200 text-red-600 hover:bg-red-50'
        }`,
      children: isLeaving ? (
        <>
          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
          <span className="hidden sm:inline">Leaving...</span>
          <span className="sm:hidden">Leaving</span>
        </>
      ) : (
        "Leave Activity"
      )
    }
  }

  const getLeaveButtonTooltip = (activity) => {
    switch (activity.status) {
      case 'ongoing':
        return "Cannot leave an ongoing activity"
      case 'completed':
        return "Cannot leave a completed activity"
      case 'cancelled':
        return "Cannot leave a cancelled activity"
      default:
        return "Leave this activity"
    }
  }

  const clearSearch = () => {
    setSearchTerm('')
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Status Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
        <h4 className="text-xs sm:text-sm font-medium text-blue-800 mb-2">Activity Status Guide:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs text-blue-700">
          <div>• <strong>Published:</strong> Can leave activity</div>
          <div>• <strong>Ongoing:</strong> Cannot leave (in progress)</div>
          <div>• <strong>Completed:</strong> Cannot leave (finished, QR expired)</div>
          <div>• <strong>Cancelled:</strong> Cannot leave (cancelled, QR expired)</div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search your joined activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm sm:text-base"
              />
            </div>
          </div>
          {searchTerm && (
            <Button
              variant="outline"
              onClick={clearSearch}
              className="text-xs sm:text-sm px-3 py-2"
            >
              Clear Search
            </Button>
          )}
        </div>

        {/* Search Results Summary */}
        {searchTerm && (
          <div className="mt-3 text-xs sm:text-sm text-gray-600">
            Found {filteredActivities.length} activity{filteredActivities.length !== 1 ? 'ies' : 'y'} matching "{searchTerm}"
          </div>
        )}
      </div>

      {/* Joined Activities Grid */}
      {loadingActivities ? (
        <div className="flex justify-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
          <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
            {searchTerm ? 'No Matching Activities' : 'No Joined Activities'}
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            {searchTerm
              ? `No activities match your search "${searchTerm}". Try different keywords or clear your search.`
              : "You haven't joined any activities yet. Check the Available Activities tab to find opportunities."
            }
          </p>
          {searchTerm && (
            <Button
              variant="outline"
              onClick={clearSearch}
              className="mt-4 text-sm"
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredActivities.map((activity) => (
            <Card key={activity._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-sm sm:text-lg line-clamp-2 leading-tight">{activity.title}</CardTitle>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant={activity.status === 'ongoing' ? 'default' : 'secondary'}
                      className="flex-shrink-0 text-xs"
                    >
                      {activity.status}
                    </Badge>
                    {/* Attendance Status Badge */}
                    {activity.userParticipant && (
                      <Badge
                        variant={activity.userParticipant.status === 'attended' ? 'default' : 'outline'}
                        className={`text-xs ${activity.userParticipant.status === 'attended'
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : activity.userParticipant.status === 'registered'
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : activity.userParticipant.status === 'absent' && activity.status === 'completed'
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-gray-100 text-gray-800 border-gray-200'
                          }`}
                        title={activity.userParticipant.status === 'absent' && activity.status === 'completed' ? 'Marked as absent (no attendance recorded)' : ''}
                      >
                        {activity.userParticipant.status === 'attended' ? '✓ Attended' :
                          activity.userParticipant.status === 'registered' ? '📝 Registered' :
                            activity.userParticipant.status === 'absent' && activity.status === 'completed' ? '⛔ Absent' :
                              '📝 Registered'}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Skills and Services */}
                <div className="space-y-2">
                  {activity.requiredSkills && activity.requiredSkills.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Required Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {activity.requiredSkills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {activity.requiredSkills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{activity.requiredSkills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  {activity.requiredServices && activity.requiredServices.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Required Services:</p>
                      <div className="flex flex-wrap gap-1">
                        {activity.requiredServices.slice(0, 2).map((service, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        {activity.requiredServices.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{activity.requiredServices.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-6">
                {/* Date and Time */}
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="line-clamp-1">{formatDate(activity.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>{formatTime(activity.timeFrom)} - {formatTime(activity.timeTo)}</span>
                </div>

                {/* Location */}
                {activity.location && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="line-clamp-1">
                      {activity.location.exactLocation ? `${activity.location.exactLocation}, ` : ''}
                      {activity.location.barangay}, {activity.location.municipality}
                    </span>
                  </div>
                )}

                {/* Participants */}
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>
                    {activity.participants?.length || 0} / {activity.maxParticipants || '∞'} participants
                  </span>
                </div>

                {/* Time Tracking Information */}
                {activity.userParticipant && (
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3 space-y-2">
                    <h4 className="text-xs font-medium text-gray-700">Your Attendance</h4>
                    <div className="space-y-1">
                      {activity.userParticipant.timeIn ? (
                        <div className="flex items-center gap-2 text-xs text-green-600">
                          <Clock className="w-3 h-3" />
                          <span>Time In: {new Date(activity.userParticipant.timeIn).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                            timeZone: 'Asia/Manila'
                          })}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>Time In: Not recorded</span>
                        </div>
                      )}

                      {activity.userParticipant.timeOut ? (
                        <div className="flex items-center gap-2 text-xs text-blue-600">
                          <Clock className="w-3 h-3" />
                          <span>Time Out: {new Date(activity.userParticipant.timeOut).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                            timeZone: 'Asia/Manila'
                          })}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>Time Out: Not recorded</span>
                        </div>
                      )}

                      {activity.userParticipant.totalHours > 0 && (
                        <div className="flex items-center gap-2 text-xs text-purple-600 font-medium">
                          <Clock className="w-3 h-3" />
                          <span>Total Hours: {activity.userParticipant.totalHours} hours</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${activity.userParticipant.status === 'attended'
                          ? 'bg-green-100 text-green-800'
                          : activity.userParticipant.status === 'registered'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}>
                          {activity.userParticipant.status === 'attended' ? 'Attended' :
                            activity.userParticipant.status === 'registered' ? 'Registered' :
                              activity.userParticipant.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                {activity.description && (
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-3">{activity.description}</p>
                )}

                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  <Button
                    onClick={() => handleViewDetails(activity)}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-sm sm:text-base"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">View Details & QR Code</span>
                    <span className="sm:hidden">View Details</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleLeaveActivity(activity._id)}
                    {...getLeaveButtonProps(activity)}
                    title={getLeaveButtonTooltip(activity)}
                  >
                    {getLeaveButtonProps(activity).children}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Activity Details & QR Code AlertDialog */}
      <AlertDialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <AlertDialogContent className="max-w-sm sm:max-w-md max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-sm sm:text-base">
              {selectedActivity?.title}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 sm:space-y-4">
                {/* Activity Details */}
                <div className="text-left space-y-2">
                  <p className="text-xs sm:text-sm text-gray-600">
                    <strong>Date:</strong> {selectedActivity && formatDate(selectedActivity.date)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    <strong>Time:</strong> {selectedActivity && formatTime(selectedActivity.timeFrom)} - {selectedActivity && formatTime(selectedActivity.timeTo)}
                  </p>
                  {selectedActivity?.location && (
                    <p className="text-xs sm:text-sm text-gray-600">
                      <strong>Location:</strong> {selectedActivity.location.barangay}, {selectedActivity.location.municipality}
                    </p>
                  )}
                  <p className="text-xs sm:text-sm text-gray-600">
                    <strong>Status:</strong> {selectedActivity?.status}
                  </p>

                  {/* Time Tracking Details */}
                  {selectedActivity?.userParticipant && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Your Attendance Record:</p>
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm text-gray-600">
                          <strong>Time In:</strong> {selectedActivity.userParticipant.timeIn
                            ? new Date(selectedActivity.userParticipant.timeIn).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                              timeZone: 'Asia/Manila'
                            })
                            : 'Not recorded yet'
                          }
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          <strong>Time Out:</strong> {selectedActivity.userParticipant.timeOut
                            ? new Date(selectedActivity.userParticipant.timeOut).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                              timeZone: 'Asia/Manila'
                            })
                            : 'Not recorded yet'
                          }
                        </p>
                        {selectedActivity.userParticipant.totalHours > 0 && (
                          <p className="text-xs sm:text-sm text-gray-600">
                            <strong>Total Hours:</strong> {selectedActivity.userParticipant.totalHours} hours
                          </p>
                        )}
                        <p className="text-xs sm:text-sm text-gray-600">
                          <strong>Status:</strong>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${selectedActivity.userParticipant.status === 'attended'
                            ? 'bg-green-100 text-green-800'
                            : selectedActivity.userParticipant.status === 'registered'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                            }`}>
                            {selectedActivity.userParticipant.status === 'attended' ? 'Attended' :
                              selectedActivity.userParticipant.status === 'registered' ? 'Registered' :
                                selectedActivity.userParticipant.status}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* QR Code */}
                <div className="text-center">
                  <h4 className="text-sm sm:text-md font-medium mb-3">Attendance QR Code</h4>
                  <div className="flex justify-center">
                    <div className="relative inline-block">
                                             {(() => {
                         // Only show expired if activity status is completed or cancelled
                         const expired = selectedActivity && ['completed', 'cancelled'].includes(selectedActivity.status)
                         return (
                           <>
                             <QRCode
                               value={selectedActivity ? generateActivityQR(selectedActivity) : ''}
                               size={160}
                               level="M"
                               className={`w-40 h-40 sm:w-48 sm:h-48 ${expired ? 'opacity-40' : ''}`}
                             />
                             {expired && (
                               <div className="absolute inset-0 flex items-center justify-center">
                                 <span className="bg-cyan-500 text-white px-3 py-1 rounded-md text-xs sm:text-sm shadow-md">
                                   EXPIRED
                                 </span>
                               </div>
                             )}
                           </>
                         )
                       })()}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-3">
                    Show this QR code for attendance tracking at this specific activity
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => setShowQRDialog(false)} className="w-full text-sm sm:text-base">
              Close
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default JoinedActivities
