import PrivateLayout from '@/layout/PrivateLayout'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Users, Calendar, MapPin, Clock, Tag, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const AdminActivities = () => {
  const navigate = useNavigate()
  const [activities, setActivities] = useState([])
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [attendanceData, setAttendanceData] = useState([])

  useEffect(() => {
    loadActivities()
  }, [])

  useEffect(() => {
    if (selectedActivity) {
      loadAttendanceReport(selectedActivity)
    }
  }, [selectedActivity])

  const loadActivities = async () => {
    try {
      setLoading(true)
      const response = await api.activities.getCreated()
      setActivities(response.data || [])
      if (response.data && response.data.length > 0) {
        setSelectedActivity(response.data[0]._id)
      }
    } catch (error) {
      toast.error('Failed to load activities')
      console.error('Error loading activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAttendanceReport = async (activityId) => {
    try {
      const response = await api.activities.getAttendanceReport(activityId)
      setAttendanceData(response.data?.attendance || [])
    } catch (error) {
      console.error('Error loading attendance report:', error)
      setAttendanceData([])
    }
  }

  const handleCreateEvent = () => {
    navigate('/admin/activities/create')
  }

  const handleEditActivity = (activityId) => {
    navigate(`/admin/activities/edit/${activityId}`)
  }

  const handleDeleteActivity = async (activityId) => {
    if (window.confirm('Are you sure you want to delete this activity? This action cannot be undone.')) {
      try {
        await api.activities.delete(activityId)
        toast.success('Activity deleted successfully!')
        loadActivities() // Reload the activities list
      } catch (error) {
        toast.error(error.message || 'Failed to delete activity')
        console.error('Error deleting activity:', error)
      }
    }
  }

  const handleStatusChange = async (activityId, newStatus) => {
    try {
      await api.activities.updateStatus(activityId, { status: newStatus })
      toast.success('Activity status updated successfully!')
      loadActivities() // Reload the activities list
    } catch (error) {
      toast.error(error.message || 'Failed to update activity status')
      console.error('Error updating activity status:', error)
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
    if (!timeString) return ''

    try {
      // Parse the time string (assuming it's in HH:mm format)
      const [hours, minutes] = timeString.split(':').map(Number)

      // Convert to 12-hour format
      const period = hours >= 12 ? 'pm' : 'am'
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours

      // Format with leading zero for minutes if needed
      const displayMinutes = minutes.toString().padStart(2, '0')

      return `${displayHours}:${displayMinutes} ${period}`
    } catch {
      // Fallback to original string if parsing fails
      return timeString
    }
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

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-blue-50">
        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">Activity Management</h1>
            <Button
              onClick={handleCreateEvent}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add new event
            </Button>
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Event Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Event</h3>

              {activities.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-600 mb-2">No Events Created</h4>
                  <p className="text-sm text-gray-500 mb-4">Create your first event to get started</p>
                  <Button
                    onClick={handleCreateEvent}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white"
                  >
                    Create Event
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Event Selector */}
                  <Select value={selectedActivity} onValueChange={setSelectedActivity}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an event" />
                    </SelectTrigger>
                    <SelectContent>
                      {activities.map((activity) => (
                        <SelectItem key={activity._id} value={activity._id}>
                          {activity.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Selected Event Display */}
                  {selectedActivity && (() => {
                    const activity = activities.find(a => a._id === selectedActivity)
                    if (!activity) return null

                    return (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-center overflow-hidden">
                          {/* Background pattern */}
                          <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 w-full h-full bg-white transform rotate-12 scale-150"></div>
                          </div>

                          {/* Main content */}
                          <div className="relative z-10">
                            <h4 className="text-xl font-bold text-white mb-2">{activity.title}</h4>
                            <p className="text-blue-100 text-sm mb-4">{activity.description}</p>

                            {/* Event Details */}
                            <div className="grid grid-cols-2 gap-4 text-left text-white text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(activity.date)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{formatTime(activity.timeFrom)} - {formatTime(activity.timeTo)}</span>
                              </div>
                              <div className="flex items-center gap-2 col-span-2">
                                <MapPin className="w-4 h-4" />
                                <span>{activity.location?.barangay}, {activity.location?.municipality}, {activity.location?.province}</span>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div className="mt-4 flex items-center gap-2">
                              <Select
                                value={activity.status}
                                onValueChange={(value) => handleStatusChange(activity._id, value)}
                              >
                                <SelectTrigger className={`w-auto h-7 px-3 py-1 text-xs font-medium rounded-full border-0 ${
                                  activity.status === 'published' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                                  activity.status === 'draft' ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' :
                                  activity.status === 'ongoing' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                                  activity.status === 'completed' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
                                  activity.status === 'cancelled' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                                  'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="draft">Draft</SelectItem>
                                  <SelectItem value="published">Published</SelectItem>
                                  <SelectItem value="ongoing">Ongoing</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                onClick={() => handleEditActivity(activity._id)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded-md text-xs"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteActivity(activity._id)}
                                className="bg-red-200 hover:bg-red-300 text-red-800 px-2 py-1 rounded-md text-xs"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>

                            {/* Participants Count */}
                            <div className="mt-4 flex items-center justify-center gap-2 text-blue-100">
                              <Users className="w-4 h-4" />
                              <span>{activity.currentParticipants || 0} / {activity.maxParticipants} participants</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>

            {/* Attendance Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance</h3>

              {!selectedActivity ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm text-gray-500">Select an event to view attendance</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  {/* Table Header */}
                  <div className="bg-cyan-500 text-white px-4 py-3 rounded-t-lg">
                    <div className="grid grid-cols-4 gap-4 font-medium text-sm">
                      <div>Name</div>
                      <div>Time In</div>
                      <div>Time Out</div>
                      <div>Status</div>
                    </div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-gray-200">
                    {attendanceData.length === 0 ? (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No participants registered yet</p>
                      </div>
                    ) : (
                      attendanceData.map((participant) => (
                        <div key={participant.userId} className="px-4 py-3">
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div className="font-medium text-gray-900">
                              {participant.name}
                            </div>
                            <div className="text-gray-600">
                              {participant.timeIn ? new Date(participant.timeIn).toLocaleTimeString() : '-'}
                            </div>
                            <div className="text-gray-600">
                              {participant.timeOut ? new Date(participant.timeOut).toLocaleTimeString() : '-'}
                            </div>
                            <div>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                participant.status === 'attended' ? 'bg-green-100 text-green-800' :
                                participant.status === 'absent' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {participant.status || 'registered'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Event Log Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Event logged</h3>
            <div className="bg-cyan-500 rounded-lg p-6">
              <div className="text-center text-white">
                <p className="text-lg font-medium">Event logging and monitoring system</p>
                <p className="text-cyan-100 text-sm mt-2">Track events, manage participants, and monitor attendance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PrivateLayout>
  )
}

export default AdminActivities

