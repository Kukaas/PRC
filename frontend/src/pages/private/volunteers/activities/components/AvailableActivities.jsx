import React, { useState, useEffect, useCallback } from 'react'
import { api } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, MapPin, Clock, Star, Search, Filter, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const AvailableActivities = ({ onActivityJoin }) => {
  const [activities, setActivities] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [skillsMatchFilter, setSkillsMatchFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loadingActivities, setLoadingActivities] = useState(false)
  const [joiningActivities, setJoiningActivities] = useState(new Set())

  const loadActivities = useCallback(async () => {
    setLoadingActivities(true)
    try {
      const response = await api.activities.getVolunteerActivities({
        page: currentPage,
        limit: 12,
        status: statusFilter,
        search: searchTerm,
        skillsMatch: skillsMatchFilter
      })

      if (response?.data) {
        // Filter activities based on status and join eligibility
        const availableActivities = response.data.filter(activity => {
          // Handle different status filters
          if (statusFilter === 'published') {
            // Only show published activities that can be joined
            return activity.status === 'published' && !activity.isJoined
          } else if (statusFilter === 'ongoing') {
            // Show ongoing activities (view only)
            return activity.status === 'ongoing'
          } else if (statusFilter === 'completed') {
            // Show completed activities (view only)
            return activity.status === 'completed'
          } else if (statusFilter === 'cancelled') {
            // Show cancelled activities (view only)
            return activity.status === 'cancelled'
          } else {
            // Default: show all available activities (published and not joined)
            return activity.status === 'published' && !activity.isJoined
          }
        })

        setActivities(availableActivities)
        setTotalPages(response.pagination?.totalPages || 1)
      } else {
        setActivities([])
        setTotalPages(1)
      }
    } catch (error) {
      console.error('Error loading available activities:', error)
      setActivities([])
      setTotalPages(1)
    } finally {
      setLoadingActivities(false)
    }
  }, [currentPage, statusFilter, searchTerm, skillsMatchFilter])

  useEffect(() => {
    loadActivities()
  }, [loadActivities])

  const handleJoinActivity = async (activityId) => {
    try {
      // Set loading state for this specific activity
      setJoiningActivities(prev => new Set(prev).add(activityId))

      await api.activities.join(activityId)
      // Reload activities to update join status
      await loadActivities()
      // Notify parent component
      if (onActivityJoin) {
        onActivityJoin()
      }
      toast.success('Successfully joined the activity!')
    } catch (error) {
      console.error('Error joining activity:', error)
      // Show user-friendly error message
      const errorMessage = error.message || 'Unknown error occurred'
      toast.error(`Failed to join activity: ${errorMessage}`)
    } finally {
      // Clear loading state for this specific activity
      setJoiningActivities(prev => {
        const newSet = new Set(prev)
        newSet.delete(activityId)
        return newSet
      })
    }
  }

  const getActivityTimingInfo = (activity) => {
    const now = new Date()
    const activityDate = new Date(activity.date)
    const [startHours, startMinutes] = activity.timeFrom.split(':').map(Number)
    const [endHours, endMinutes] = activity.timeTo.split(':').map(Number)

    const activityStartTime = new Date(activityDate)
    activityStartTime.setHours(startHours, startMinutes, 0, 0)

    const activityEndTime = new Date(activityDate)
    activityEndTime.setHours(endHours, endMinutes, 0, 0)

    // Check if activity is today
    const isToday = now.toDateString() === activityDate.toDateString()

    if (now > activityEndTime) {
      return { status: 'ended', message: 'Activity has ended', color: 'text-red-600' }
    } else if (now > activityStartTime) {
      return { status: 'ongoing', message: 'Activity is in progress', color: 'text-orange-600' }
    } else if (isToday) {
      const timeUntilStart = Math.floor((activityStartTime - now) / (1000 * 60)) // minutes
      if (timeUntilStart <= 60) {
        return { status: 'starting-soon', message: `Starting in ${timeUntilStart} minutes`, color: 'text-yellow-600' }
      } else {
        return { status: 'today', message: `Starting today at ${activity.timeFrom}`, color: 'text-blue-600' }
      }
    } else {
      return { status: 'upcoming', message: `Starting ${formatDate(activity.date)} at ${activity.timeFrom}`, color: 'text-green-600' }
    }
  }

  const getJoinButtonProps = (activity) => {
    const isJoining = joiningActivities.has(activity._id)

    if (activity.isJoined) {
      return {
        disabled: true,
        className: "w-full bg-gray-400 cursor-not-allowed text-sm sm:text-base",
        children: "Already Joined"
      }
    }

    const timingInfo = getActivityTimingInfo(activity)

    switch (timingInfo.status) {
      case 'upcoming':
      case 'today':
        if (activity.status === 'published') {
          return {
            disabled: isJoining,
            className: `w-full text-sm sm:text-base ${isJoining ? 'bg-blue-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`,
            children: isJoining ? (
              <>
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                <span className="hidden sm:inline">Joining...</span>
                <span className="sm:hidden">Joining</span>
              </>
            ) : (
              "Join Activity"
            )
          }
        } else {
          return {
            disabled: true,
            className: "w-full bg-gray-400 cursor-not-allowed text-sm sm:text-base",
            children: "Not Available"
          }
        }
      case 'starting-soon':
        return {
          disabled: true,
          className: "w-full bg-yellow-400 cursor-not-allowed text-sm sm:text-base",
          children: "Starting Soon"
        }
      case 'ongoing':
        return {
          disabled: true,
          className: "w-full bg-orange-400 cursor-not-allowed text-sm sm:text-base",
          children: "Activity in Progress"
        }
      case 'ended':
        return {
          disabled: true,
          className: "w-full bg-red-400 cursor-not-allowed text-sm sm:text-base",
          children: "Activity Ended"
        }
      default:
        return {
          disabled: true,
          className: "w-full bg-gray-400 cursor-not-allowed text-sm sm:text-base",
          children: "Cannot Join"
        }
    }
  }

  const getStatusMessage = (activity) => {
    if (activity.isJoined) {
      return "You have already joined this activity"
    }

    const timingInfo = getActivityTimingInfo(activity)

    switch (timingInfo.status) {
      case 'upcoming':
      case 'today':
        if (activity.status === 'published') {
          return "This activity is open for volunteers to join"
        } else {
          return "This activity is not yet available for joining"
        }
      case 'starting-soon':
        return "This activity is starting very soon. Please contact the organizer for late registration."
      case 'ongoing':
        return "This activity is currently in progress and no longer accepting new participants"
      case 'ended':
        return "This activity has already ended"
      default:
        return "This activity is not available for joining"
    }
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

  const getMatchColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800'
    if (score >= 40) return 'bg-orange-100 text-orange-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getMatchText = (score) => {
    if (score >= 80) return 'Perfect Match!'
    if (score >= 60) return 'Good Match'
    if (score >= 40) return 'Partial Match'
    return 'No Match'
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Status Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
        <h4 className="text-xs sm:text-sm font-medium text-blue-800 mb-2">Activity Status Guide:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs text-blue-700">
          <div>• <strong>Published:</strong> Open for volunteers to join</div>
          <div>• <strong>Ongoing:</strong> In progress, no new participants</div>
          <div>• <strong>Completed:</strong> Activity finished</div>
          <div>• <strong>Cancelled:</strong> Activity cancelled</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm sm:text-base"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-2 sm:px-3 py-2 text-xs sm:text-sm"
            >
              <option value="all">All Available</option>
              <option value="published">Published (Can Join)</option>
              <option value="ongoing">Ongoing (View Only)</option>
              <option value="completed">Completed (View Only)</option>
              <option value="cancelled">Cancelled (View Only)</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={skillsMatchFilter}
              onChange={(e) => setSkillsMatchFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-2 sm:px-3 py-2 text-xs sm:text-sm"
            >
              <option value="all">All Skills</option>
              <option value="match">Skills Match</option>
              <option value="no-match">Skills Not Match</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      {loadingActivities ? (
        <div className="flex justify-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : activities.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
          <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">No Available Activities</h3>
          <p className="text-sm sm:text-base text-gray-600">No activities match your current filters or you've joined all available activities.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
          {activities.map((activity) => (
            <Card key={activity._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-sm sm:text-lg line-clamp-2 leading-tight">{activity.title}</CardTitle>
                  <Badge
                    variant={activity.status === 'ongoing' ? 'default' : 'secondary'}
                    className="ml-2 flex-shrink-0 text-xs"
                  >
                    {activity.status}
                  </Badge>
                </div>

                {/* Match Score */}
                {activity.totalScore > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-current" />
                    <Badge className={`text-xs ${getMatchColor(activity.totalScore)}`}>
                      <span className="hidden sm:inline">{getMatchText(activity.totalScore)}</span>
                      <span className="sm:hidden">{getMatchText(activity.totalScore).split(' ')[0]}</span>
                      <span className="hidden sm:inline"> ({activity.totalScore}%)</span>
                      <span className="sm:hidden"> {activity.totalScore}%</span>
                    </Badge>
                  </div>
                )}

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

                {/* Activity Timing Status */}
                <div className={`text-xs font-medium ${getActivityTimingInfo(activity).color}`}>
                  <span className="line-clamp-1">{getActivityTimingInfo(activity).message}</span>
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
                    {activity.participantCount} / {activity.maxParticipants || '∞'} participants
                  </span>
                </div>

                {/* Description */}
                {activity.description && (
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-3">{activity.description}</p>
                )}

                {/* Action Button */}
                <div className="pt-2">
                  <Button
                    onClick={() => handleJoinActivity(activity._id)}
                    {...getJoinButtonProps(activity)}
                  >
                    {getJoinButtonProps(activity).children}
                  </Button>

                  {/* Status Message */}
                  <div className="mt-2 text-xs text-gray-500 text-center line-clamp-2">
                    {getStatusMessage(activity)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 sm:mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
          >
            Previous
          </Button>
          <span className="text-xs sm:text-sm text-gray-600 px-2">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

export default AvailableActivities
