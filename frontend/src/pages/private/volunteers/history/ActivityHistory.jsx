import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/services/api'

import PrivateLayout from '@/layout/PrivateLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { formatDate } from '@/lib/utils'
import { Search, Clock, Calendar, MapPin, Users, FileText, Eye } from 'lucide-react'

const ActivityHistory = () => {
  const navigate = useNavigate()
  const [activities, setActivities] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [services, setServices] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasApplication, setHasApplication] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState(null)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const checkVolunteerApplication = async () => {
    try {
      const response = await api.volunteerApplication.getMyApplication()
      setHasApplication(true)
      setApplicationStatus(response.data.status)
    } catch (error) {
      if (error.message.includes('No application found')) {
        setHasApplication(false)
      }
    }
  }

  const loadActivities = async () => {
    setLoading(true)
    try {
      const response = await api.activities.getMyActivities({
        status: 'completed'
      })

      if (response?.data) {
        // Sort activities by date (newer events on top)
        const sortedActivities = response.data.sort((a, b) => {
          const dateA = new Date(a.date)
          const dateB = new Date(b.date)
          return dateB - dateA // Descending order (newest first)
        })

        setActivities(sortedActivities)
      } else {
        setError(response.message || 'Failed to load activities')
        setActivities([])
      }
    } catch (err) {
      console.error('Error loading activities:', err)
      setError(err.message || 'Failed to load activities')
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  const handleApplyNow = () => {
    navigate('/volunteer-application')
  }

  const loadServices = async () => {
    try {
      const response = await api.maintenance.getAll()
      if (response?.data) {
        setServices(response.data)
      }
    } catch (error) {
      console.error('Error loading services:', error)
    }
  }

  useEffect(() => {
    const initialize = async () => {
      await checkVolunteerApplication()
      await Promise.all([loadActivities(), loadServices()])
    }
    initialize()
  }, [])



  // Filter activities based on search term and service
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesService = serviceFilter === 'all' ||
      (activity.service && activity.service === serviceFilter)

    return matchesSearch && matchesService
  })

  const totalFilteredPages = Math.max(1, Math.ceil(filteredActivities.length / 10))

  useEffect(() => {
    if (currentPage > totalFilteredPages) {
      setCurrentPage(totalFilteredPages)
    }
  }, [currentPage, totalFilteredPages])

  // Get paginated activities
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * 10,
    currentPage * 10
  )

  const formatTimeString = (timeString) => {
    if (!timeString) return 'Not recorded'
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    } catch {
      return timeString
    }
  }

  const formatDateTime = (value) => {
    if (!value) return 'Not recorded'
    try {
      return new Date(value).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    } catch {
      return value
    }
  }

  const formatHoursServed = (hours) => {
    if (typeof hours !== 'number' || Number.isNaN(hours) || hours <= 0) {
      return null
    }

    const totalMinutes = Math.round(hours * 60)
    const hrs = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60

    const parts = []
    if (hrs > 0) {
      parts.push(`${hrs}hr${hrs === 1 ? '' : 's'}`)
    }
    if (mins > 0) {
      parts.push(`${mins}min${mins === 1 ? '' : 's'}`)
    }

    return parts.length > 0 ? parts.join(', ') : '0min'
  }

  const handlePrintReport = () => {
    const reportWindow = window.open('', '', 'width=1000,height=800')
    if (!reportWindow) {
      return
    }

    const totalHoursAccumulated = filteredActivities.reduce((acc, activity) => {
      const hours = activity.userParticipant?.totalHours
      return typeof hours === 'number' && hours > 0 ? acc + hours : acc
    }, 0)

    const reportRows = filteredActivities.map((activity, index) => {
      const participant = activity.userParticipant
      const totalHoursText = formatHoursServed(participant?.totalHours) ?? 'Not recorded'

      return `
        <tr>
          <td style="padding:8px;border:1px solid #d1d5db;">${index + 1}</td>
          <td style="padding:8px;border:1px solid #d1d5db;">
            <strong>${activity.title}</strong><br/>
            <small>${activity.description || 'No description provided'}</small>
          </td>
          <td style="padding:8px;border:1px solid #d1d5db;">
            ${formatDate(activity.date)}<br/>
            ${formatTimeString(activity.timeFrom)} - ${formatTimeString(activity.timeTo)}
          </td>
          <td style="padding:8px;border:1px solid #d1d5db;">
            ${activity.location
          ? [
            activity.location.exactLocation,
            activity.location.barangay,
            activity.location.municipality,
            activity.location.province
          ]
            .filter(Boolean)
            .join(', ')
          : 'No location provided'}
          </td>
          <td style="padding:8px;border:1px solid #d1d5db;">
            ${participant?.status ? participant.status.charAt(0).toUpperCase() + participant.status.slice(1) : 'N/A'}
          </td>
          <td style="padding:8px;border:1px solid #d1d5db;">${totalHoursText}</td>
          <td style="padding:8px;border:1px solid #d1d5db;">
            In: ${formatDateTime(participant?.timeIn)}<br/>
            Out: ${formatDateTime(participant?.timeOut)}
          </td>
        </tr>
      `
    })

    reportWindow.document.write(`
      <html>
        <head>
          <title>Volunteer Activity Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            h1 { font-size: 20px; margin-bottom: 8px; }
            h2 { font-size: 16px; margin: 16px 0 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
            thead { background: #f3f4f6; }
            .meta { font-size: 12px; color: #4b5563; margin-bottom: 16px; }
            .summary { margin-top: 16px; padding: 16px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; }
            .summary strong { display: inline-block; min-width: 140px; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align:right;">
            <button onclick="window.print()" style="padding:8px 16px;background:#1d4ed8;color:#fff;border:none;border-radius:4px;cursor:pointer;">Print</button>
          </div>
          <h1>Volunteer Activity Report</h1>
          <div class="meta">
            Generated on: ${new Date().toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })}<br/>
            Total activities: ${filteredActivities.length}<br/>
            Applied filters: ${searchTerm ? `Search = "${searchTerm}"` : 'None'}; Service = ${serviceFilter}
          </div>
          <div class="summary">
            <h2>Summary</h2>
            <p><strong>Total Hours Served:</strong> ${formatHoursServed(totalHoursAccumulated) ?? '0min'}</p>
            <p><strong>Activities Attended:</strong> ${filteredActivities.filter(act => act.userParticipant?.status === 'attended').length
      }</p>
            <p><strong>Activities Registered:</strong> ${filteredActivities.filter(act => act.userParticipant?.status === 'registered').length
      }</p>
            <p><strong>Marked Absent:</strong> ${filteredActivities.filter(act => act.userParticipant?.status === 'absent').length
      }</p>
          </div>
          <table>
            <thead>
              <tr>
                <th style="padding:8px;border:1px solid #d1d5db;">#</th>
                <th style="padding:8px;border:1px solid #d1d5db;text-align:left;">Activity</th>
                <th style="padding:8px;border:1px solid #d1d5db;text-align:left;">Date & Time</th>
                <th style="padding:8px;border:1px solid #d1d5db;text-align:left;">Location</th>
                <th style="padding:8px;border:1px solid #d1d5db;text-align:left;">Status</th>
                <th style="padding:8px;border:1px solid #d1d5db;text-align:left;">Hours Served</th>
                <th style="padding:8px;border:1px solid #d1d5db;text-align:left;">Attendance</th>
              </tr>
            </thead>
            <tbody>
              ${reportRows.join('')}
            </tbody>
          </table>
        </body>
      </html>
    `)

    reportWindow.document.close()
    reportWindow.focus()
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
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Activity History</h2>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="mb-6">
                    <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Become a Volunteer First
                    </h3>
                    <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                      To view activity history, you need to apply as a volunteer first.
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
              </CardContent>
            </Card>
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
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Activity History</h2>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="mb-6">
                    <FileText className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Application Under Review
                    </h3>
                    <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                      Your volunteer application is currently being reviewed.
                      You'll be able to view activity history once your application is approved.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Activity History</h2>
            </div>

            <Card>
              <CardContent className="pt-6">
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
                  <Button
                    onClick={handleApplyNow}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2"
                  >
                    Apply Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PrivateLayout>
    )
  }

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-blue-50">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Activity History</h2>
              <p className="text-gray-600 mt-1">View your past and ongoing volunteer activities</p>
            </div>
            {filteredActivities.length > 0 && (
              <Button
                onClick={handlePrintReport}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Print Report
              </Button>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Past Activities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={serviceFilter} onValueChange={setServiceFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {services.map(service => (
                      <SelectItem key={service._id} value={service.name}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Activities List */}
              <div className="space-y-4">
                {error ? (
                  <div className="text-center py-8 text-red-600">{error}</div>
                ) : paginatedActivities.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                      {searchTerm ? 'No Matching Activities' : 'No Activities Found'}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      {searchTerm
                        ? `No activities match your search "${searchTerm}". Try different keywords or clear your search.`
                        : "You haven't participated in any activities yet."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {paginatedActivities.map((activity) => (
                      <Card key={activity._id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
                          <div className="flex justify-between items-start mb-2">
                            <CardTitle className="text-sm sm:text-lg line-clamp-2 leading-tight">
                              {activity.title}
                            </CardTitle>
                            <div className="flex flex-col items-end gap-2">
                              <Badge variant={activity.status === 'ongoing' ? 'default' : 'secondary'} className="flex-shrink-0 text-xs">
                                {activity.status}
                              </Badge>
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
                            <span>
                              {new Date(`2000-01-01T${activity.timeFrom}`).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })} - {new Date(`2000-01-01T${activity.timeTo}`).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </span>
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

                          {/* Description */}
                          {activity.description && (
                            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                              {activity.description}
                            </p>
                          )}

                          {/* View Details Button */}
                          <Button
                            onClick={() => {
                              setSelectedActivity(activity)
                              setShowDetailsDialog(true)
                            }}
                            className="w-full bg-cyan-600 hover:bg-cyan-700 text-sm sm:text-base"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {filteredActivities.length > 0 && (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4">
                  <p className="text-sm text-gray-600">
                    Showing {Math.min(filteredActivities.length, (currentPage - 1) * 10 + 1)} to{' '}
                    {Math.min(filteredActivities.length, currentPage * 10)} of {filteredActivities.length} results
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalFilteredPages, p + 1))}
                      disabled={currentPage >= totalFilteredPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activity Details Dialog */}
      <AlertDialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <AlertDialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedActivity && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl font-bold">
                  {selectedActivity.title}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  <div className="space-y-6 pt-4">
                    {/* Status and Attendance */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={selectedActivity.status === 'ongoing' ? 'default' : 'secondary'} className="text-sm">
                        {selectedActivity.status}
                      </Badge>
                      {selectedActivity.userParticipant && (
                        <Badge
                          variant={selectedActivity.userParticipant.status === 'attended' ? 'default' : 'outline'}
                          className={`text-sm ${selectedActivity.userParticipant.status === 'attended'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : selectedActivity.userParticipant.status === 'registered'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-gray-100 text-gray-800 border-gray-200'
                            }`}
                        >
                          {selectedActivity.userParticipant.status === 'attended' ? '✓ Attended' : '📝 Registered'}
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    {selectedActivity.description && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                        <p className="text-sm text-gray-600">{selectedActivity.description}</p>
                      </div>
                    )}

                    {/* Date, Time and Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Date & Time</h3>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {formatDate(selectedActivity.date)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            {new Date(`2000-01-01T${selectedActivity.timeFrom}`).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })} - {new Date(`2000-01-01T${selectedActivity.timeTo}`).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </div>
                        </div>
                      </div>

                      {selectedActivity.location && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-2">Location</h3>
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mt-0.5" />
                            <div>
                              {selectedActivity.location.exactLocation && (
                                <p>{selectedActivity.location.exactLocation}</p>
                              )}
                              <p>{selectedActivity.location.barangay}, {selectedActivity.location.municipality}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Participants */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Participants</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>
                          {selectedActivity.participants?.length || 0} out of {selectedActivity.maxParticipants || '∞'} participants
                        </span>
                      </div>
                    </div>

                    {/* Required Skills and Services */}
                    <div className="space-y-4">
                      {selectedActivity.requiredSkills && selectedActivity.requiredSkills.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-2">Required Skills</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedActivity.requiredSkills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedActivity.requiredServices && selectedActivity.requiredServices.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-2">Required Services</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedActivity.requiredServices.map((service, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Attendance Details */}
                    {selectedActivity.userParticipant && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Your Attendance Record</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-green-600" />
                            <span>
                              Time In: {selectedActivity.userParticipant.timeIn
                                ? new Date(selectedActivity.userParticipant.timeIn).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                })
                                : 'Not recorded yet'
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span>
                              Time Out: {selectedActivity.userParticipant.timeOut
                                ? new Date(selectedActivity.userParticipant.timeOut).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                })
                                : 'Not recorded yet'
                              }
                            </span>
                          </div>
                          {selectedActivity.userParticipant.totalHours > 0 && (
                            <div className="flex items-center gap-2 text-sm font-medium text-purple-600">
                              <Clock className="w-4 h-4" />
                              <span>Total Hours: {selectedActivity.userParticipant.totalHours} hours</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button onClick={() => setShowDetailsDialog(false)} className="w-full">
                  Close
                </Button>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </PrivateLayout>
  )
}

export default ActivityHistory
