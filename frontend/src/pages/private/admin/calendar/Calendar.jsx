import PrivateLayout from '@/layout/PrivateLayout'
import React, { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Filter,
  Search,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { api } from '@/services/api'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import CustomInput from '@/components/CustomInput'

const Calendar = () => {
  const navigate = useNavigate()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    location: ''
  })

  useEffect(() => {
    loadActivities()
  }, []) // Only load once on component mount

  const loadActivities = async () => {
    try {
      setLoading(true)
      const response = await api.activities.getAll()
      setActivities(response.data || [])
    } catch (error) {
      console.error('Error loading activities:', error)
      toast.error('Failed to load activities')
    } finally {
      setLoading(false)
    }
  }

  // Filter activities (used for filtering the activities displayed on calendar)
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchesSearch = !filters.search ||
        activity.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        activity.description.toLowerCase().includes(filters.search.toLowerCase())

      const matchesStatus = filters.status === 'all' || activity.status === filters.status

      const matchesLocation = !filters.location ||
        activity.location?.barangay?.toLowerCase().includes(filters.location.toLowerCase()) ||
        activity.location?.municipality?.toLowerCase().includes(filters.location.toLowerCase())

      return matchesSearch && matchesStatus && matchesLocation
    })
  }, [activities, filters])

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentDate])

  // Group activities by date
  const activitiesByDate = useMemo(() => {
    const grouped = {}
    filteredActivities.forEach(activity => {
      try {
        const activityDate = new Date(activity.date)
        if (isNaN(activityDate.getTime())) {
          console.warn('Invalid date for activity:', activity._id, activity.date)
          return
        }
        const dateKey = format(activityDate, 'yyyy-MM-dd')
        if (!grouped[dateKey]) {
          grouped[dateKey] = []
        }
        grouped[dateKey].push(activity)
      } catch (error) {
        console.error('Error processing activity date:', error, activity)
      }
    })
    return grouped
  }, [filteredActivities])

  // Get activities for a specific date
  const getActivitiesForDate = (date) => {
    try {
      if (!date || isNaN(date.getTime())) {
        return []
      }
      const dateKey = format(date, 'yyyy-MM-dd')
      return activitiesByDate[dateKey] || []
    } catch (error) {
      console.error('Error getting activities for date:', error, date)
      return []
    }
  }

  // Handle date click
  const handleDateClick = (date) => {
    const activitiesForDate = getActivitiesForDate(date)
    if (activitiesForDate.length > 0) {
      setSelectedActivity(activitiesForDate[0])
      setShowEventDialog(true)
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Invalid Date'
      }
      return format(date, 'EEEE, MMMM d, yyyy')
    } catch (error) {
      console.error('Error formatting date:', error, dateString)
      return 'Invalid Date'
    }
  }

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return ''
    try {
      const [hours, minutes] = timeString.split(':').map(Number)
      const period = hours >= 12 ? 'PM' : 'AM'
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
      const displayMinutes = minutes.toString().padStart(2, '0')
      return `${displayHours}:${displayMinutes} ${period}`
    } catch {
      return timeString
    }
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'ongoing': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-purple-100 text-purple-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get status dot color
  const getStatusDotColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-500'
      case 'ongoing': return 'bg-blue-500'
      case 'completed': return 'bg-purple-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  // Handle create new activity
  const handleCreateActivity = () => {
    navigate('/admin/activities/create')
  }

  // Handle edit activity
  const handleEditActivity = (activityId) => {
    navigate(`/admin/activities/edit/${activityId}`)
  }

  // Handle view activity details
  const handleViewActivity = (activityId) => {
    navigate(`/admin/activities/${activityId}`)
  }

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Handle year change
  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value)
    setCurrentDate(new Date(newYear, currentDate.getMonth(), 1))
  }

  // Handle month change
  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value)
    setCurrentDate(new Date(currentDate.getFullYear(), newMonth, 1))
  }

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-blue-50">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Event Calendar</h1>
              <p className="text-gray-600 mt-1">View all activities in a monthly calendar format</p>
            </div>
            <Button
              onClick={handleCreateActivity}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Search className="w-4 h-4 inline mr-1" />
                    Search
                  </label>
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Filter className="w-4 h-4 inline mr-1" />
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="all">All Statuses</option>
                    <option value="published">Published</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Filter by location..."
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  {format(currentDate, 'MMMM yyyy')}
                </CardTitle>
                                 <div className="flex items-center gap-3">
                   {/* Year Selector */}
                   <div className="w-32">
                     <CustomInput
                       type="select"
                       value={currentDate.getFullYear()}
                       onChange={handleYearChange}
                       className="mb-0"
                     >
                       {Array.from({ length: 10 }, (_, i) => {
                         const year = new Date().getFullYear() - 5 + i
                         return (
                           <option key={year} value={year}>
                             {year}
                           </option>
                         )
                       })}
                     </CustomInput>
                   </div>

                   {/* Month Selector */}
                   <div className="w-40">
                     <CustomInput
                       type="select"
                       value={currentDate.getMonth()}
                       onChange={handleMonthChange}
                       className="mb-0"
                     >
                       {[
                         'January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'
                       ].map((month, index) => (
                         <option key={index} value={index}>
                           {month}
                         </option>
                       ))}
                     </CustomInput>
                   </div>

                   {/* Navigation Buttons */}
                   <div className="flex items-center gap-1">
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={goToPreviousMonth}
                       className="px-2"
                     >
                       <ChevronLeft className="w-4 h-4" />
                     </Button>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={goToToday}
                       className="px-3"
                     >
                       Today
                     </Button>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={goToNextMonth}
                       className="px-2"
                     >
                       <ChevronRight className="w-4 h-4" />
                     </Button>
                   </div>
                 </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-96">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                </div>
              ) : (
                <div className="calendar-grid">
                  {/* Calendar Header */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="p-3 text-center font-semibold text-gray-700 bg-gray-100 rounded-lg">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, index) => {
                      const activitiesForDay = getActivitiesForDate(day)
                      const isCurrentMonth = isSameMonth(day, currentDate)
                      const isToday = isSameDay(day, new Date())
                      const hasEvents = activitiesForDay.length > 0

                      return (
                        <div
                          key={index}
                          className={`min-h-[120px] p-2 border border-gray-200 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                            !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                          } ${isToday ? 'ring-2 ring-cyan-500' : ''}`}
                          onClick={() => handleDateClick(day)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm font-medium ${isToday ? 'text-cyan-600' : ''}`}>
                              {format(day, 'd')}
                            </span>
                            {hasEvents && (
                              <div className="flex gap-1">
                                {activitiesForDay.slice(0, 3).map((activity) => (
                                  <div
                                    key={activity._id}
                                    className={`w-2 h-2 rounded-full ${getStatusDotColor(activity.status)}`}
                                    title={`${activity.title} (${activity.status})`}
                                  />
                                ))}
                                {activitiesForDay.length > 3 && (
                                  <div className="w-2 h-2 rounded-full bg-gray-400" title={`+${activitiesForDay.length - 3} more events`} />
                                )}
                              </div>
                            )}
                          </div>

                                                     {/* Event List */}
                           <div className="space-y-1 max-h-16 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                             {activitiesForDay
                               .sort((a, b) => {
                                 // Sort by start time (earliest first)
                                 const timeA = a.timeFrom || '00:00'
                                 const timeB = b.timeFrom || '00:00'
                                 return timeA.localeCompare(timeB)
                               })
                               .map((activity) => (
                                 <div
                                   key={activity._id}
                                   className="text-xs p-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                                   title={activity.title}
                                 >
                                   <div className="font-medium truncate">{activity.title}</div>
                                   <div className="text-gray-500 truncate">
                                     {formatTime(activity.timeFrom)} - {formatTime(activity.timeTo)}
                                   </div>
                                 </div>
                               ))}
                           </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Status Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Published</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Ongoing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-sm">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm">Cancelled</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

                 {/* Event Details Dialog */}
         <AlertDialog open={showEventDialog} onOpenChange={setShowEventDialog}>
           <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
             {selectedActivity && (
               <div className="flex flex-col h-full">
                 {/* Header */}
                 <AlertDialogHeader className="pb-4 border-b border-gray-200">
                   <div className="flex items-start justify-between">
                     <div className="flex-1">
                       <AlertDialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                         {selectedActivity.title}
                       </AlertDialogTitle>
                       <div className="flex items-center gap-4 flex-wrap">
                         <Badge className={`${getStatusColor(selectedActivity.status)} text-xs font-medium px-3 py-1`}>
                           {selectedActivity.status.charAt(0).toUpperCase() + selectedActivity.status.slice(1)}
                         </Badge>
                         <div className="flex items-center gap-1 text-sm text-gray-600">
                           <Users className="w-4 h-4" />
                           <span>{selectedActivity.currentParticipants || 0} / {selectedActivity.maxParticipants} participants</span>
                         </div>
                       </div>
                     </div>
                     <AlertDialogCancel className="h-8 w-8 p-0 rounded-full hover:bg-gray-100">
                       <span className="sr-only">Close</span>
                       <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                       </svg>
                     </AlertDialogCancel>
                   </div>
                 </AlertDialogHeader>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                    <div className="space-y-6">
                     {/* Description */}
                     <div>
                       <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                       <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                         {selectedActivity.description}
                       </p>
                     </div>

                                           {/* Event Details in Rows */}
                      <div className="space-y-4">
                        {/* Date */}
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <CalendarIcon className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Event Date</p>
                            <p className="text-lg text-gray-700 font-semibold">{formatDate(selectedActivity.date)}</p>
                          </div>
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                          <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <Clock className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Event Time</p>
                            <p className="text-lg text-gray-700 font-semibold">
                              {formatTime(selectedActivity.timeFrom)} - {formatTime(selectedActivity.timeTo)}
                            </p>
                          </div>
                        </div>

                        {/* Location */}
                        {selectedActivity.location && (
                          <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                              <MapPin className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">Event Location</p>
                              <div className="text-lg text-gray-700 font-semibold space-y-1">
                                {selectedActivity.location.exactLocation && (
                                  <p className="font-medium">{selectedActivity.location.exactLocation}</p>
                                )}
                                <p>
                                  {selectedActivity.location.barangay}, {selectedActivity.location.municipality}, {selectedActivity.location.province}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Required Skills */}
                        {selectedActivity.requiredSkills && selectedActivity.requiredSkills.length > 0 && (
                          <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                            <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mt-1">
                              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 mb-2">Required Skills</p>
                              <div className="flex flex-wrap gap-2">
                                {selectedActivity.requiredSkills.map((skill, index) => (
                                  <Badge key={index} variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200 px-3 py-1">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Required Services */}
                        {selectedActivity.requiredServices && selectedActivity.requiredServices.length > 0 && (
                          <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-lg">
                            <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mt-1">
                              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 mb-2">Required Services</p>
                              <div className="flex flex-wrap gap-2">
                                {selectedActivity.requiredServices.map((service, index) => (
                                  <Badge key={index} variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-300 hover:bg-indigo-200 px-3 py-1">
                                    {service}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Additional Notes */}
                        {selectedActivity.notes && (
                          <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                            <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mt-1">
                              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 mb-2">Additional Notes</p>
                              <p className="text-gray-700 leading-relaxed">{selectedActivity.notes}</p>
                            </div>
                          </div>
                        )}
                      </div>
                   </div>
                 </div>

                 {/* Footer */}
                 <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200 bg-gray-50">
                   <div className="flex gap-3 w-full sm:w-auto">
                     <Button
                       variant="outline"
                       onClick={() => handleViewActivity(selectedActivity._id)}
                       className="flex-1 sm:flex-none"
                     >
                       View Full Details
                     </Button>
                     {['draft', 'published'].includes(selectedActivity.status) && (
                       <Button
                         onClick={() => handleEditActivity(selectedActivity._id)}
                         className="flex-1 sm:flex-none bg-cyan-500 hover:bg-cyan-600"
                       >
                         Edit Event
                       </Button>
                     )}
                   </div>
                   <Button
                     variant="outline"
                     onClick={() => setShowEventDialog(false)}
                     className="w-full sm:w-auto"
                   >
                     Close
                   </Button>
                 </AlertDialogFooter>
               </div>
             )}
           </AlertDialogContent>
         </AlertDialog>
      </div>
    </PrivateLayout>
  )
}

export default Calendar

