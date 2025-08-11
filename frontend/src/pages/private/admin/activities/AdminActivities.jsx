import PrivateLayout from '@/layout/PrivateLayout'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import QRScanner from '@/components/QRScanner'
import EventSelector from './components/EventSelector'
import EventDisplay from './components/EventDisplay'
import AttendanceSection from './components/AttendanceSection'
import EventLog from './components/EventLog'
import EmptyStates from './components/EmptyStates'

const AdminActivities = () => {
  const navigate = useNavigate()
  const [activities, setActivities] = useState({ active: [], archived: [] })
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [attendanceData, setAttendanceData] = useState([])
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [scanningAction, setScanningAction] = useState('timeIn') // 'timeIn' or 'timeOut'

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
      const allActivities = response.data || []

      // Separate active and archived activities
      const activeActivities = allActivities.filter(activity =>
        !['completed', 'cancelled'].includes(activity.status)
      )
      const archivedActivities = allActivities.filter(activity =>
        ['completed', 'cancelled'].includes(activity.status)
      )

      setActivities({
        active: activeActivities,
        archived: archivedActivities
      })

      // Check if currently selected activity is now archived
      if (selectedActivity) {
        const isSelectedActivityArchived = archivedActivities.some(a => a._id === selectedActivity)
        if (isSelectedActivityArchived) {
          setSelectedActivity(null)
        }
      }

      // Don't auto-select any event - let user choose
    } catch (error) {
      toast.error('Failed to load activities')
      console.error('Error loading activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAttendanceReport = async (activityId) => {
    try {
      console.log('Loading attendance report for activity:', activityId)
      const response = await api.activities.getAttendanceReport(activityId)
      console.log('Attendance report response:', response)
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

  const handleRecordAttendance = async (qrData, action) => {
    try {
      console.log('Recording attendance:', { activityId: selectedActivity, qrData, action })

      const response = await api.activities.recordAttendance(selectedActivity, {
        activityId: selectedActivity,
        qrData: qrData,
        action: action
      })

      console.log('Attendance recorded successfully:', response)

      // Reload attendance data to show the update
      await loadAttendanceReport(selectedActivity)

      return response
    } catch (error) {
      console.error('Error recording attendance:', error)
      toast.error(error.message || `Failed to record ${action === 'timeIn' ? 'time in' : 'time out'}`)
      return null
    }
  }

  const handleQRScan = async (qrData) => {
    try {
      console.log('QR Data received:', qrData)
      console.log('Selected activity:', selectedActivity)
      console.log('Scanning action:', scanningAction)

      // Parse QR data to validate it
      let parsedData
      try {
        parsedData = JSON.parse(qrData)
        console.log('Parsed QR data:', parsedData)
      } catch (parseError) {
        console.error('QR parse error:', parseError)
        toast.error('Invalid QR code format. Please try again.')
        return
      }

      // Check if it's the format from JoinedActivities (has name, contactNumber, etc.)
      if (!parsedData.userId || !parsedData.activityId) {
        console.error('Missing required fields:', { userId: parsedData.userId, activityId: parsedData.activityId })
        toast.error('Invalid QR code format. Expected userId and activityId.')
        return
      }

      if (parsedData.activityId !== selectedActivity) {
        console.error('Activity ID mismatch:', { qrActivityId: parsedData.activityId, selectedActivity })
        toast.error('QR code is for a different activity')
        return
      }

      console.log('QR validation passed, recording attendance...')

      // Show processing toast
      const processingToast = toast.loading(`Recording ${scanningAction === 'timeIn' ? 'Time In' : 'Time Out'}...`)

      // Record attendance
      const response = await handleRecordAttendance(qrData, scanningAction)

      // Dismiss processing toast and show success
      toast.dismiss(processingToast)

      if (response) {
        toast.success(`${scanningAction === 'timeIn' ? 'Time In' : 'Time Out'} recorded successfully for ${parsedData.name}!`)
        setShowQRScanner(false)
      }
    } catch (error) {
      console.error('Error in handleQRScan:', error)
      toast.error('Invalid QR code data format. Please try again.')
    }
  }

  const openQRScanner = (action) => {
    setScanningAction(action)
    setShowQRScanner(true)
  }

  const handleSelectArchivedEvent = (activityId) => {
    setSelectedActivity(activityId)
    // Scroll to top to show the selected event
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

              {/* Event Selector */}
              <EventSelector
                selectedActivity={selectedActivity}
                onActivityChange={setSelectedActivity}
                activities={activities}
              />

              {/* Selected Event Display */}
              {selectedActivity && (() => {
                const activity = activities.active.find(a => a._id === selectedActivity) || activities.archived.find(a => a._id === selectedActivity)
                if (!activity) return null

                return (
                  <EventDisplay
                    activity={activity}
                    onStatusChange={handleStatusChange}
                    onEdit={handleEditActivity}
                    onDelete={handleDeleteActivity}
                    formatDate={formatDate}
                    formatTime={formatTime}
                  />
                )
              })()}

              {/* Empty States */}
              <EmptyStates
                selectedActivity={selectedActivity}
                activities={activities}
                onCreateEvent={handleCreateEvent}
              />
            </div>

            {/* Attendance Section */}
            <div>
              <AttendanceSection
                selectedActivity={selectedActivity}
                attendanceData={attendanceData}
                onOpenQRScanner={openQRScanner}
                activity={selectedActivity ? (activities.active.find(a => a._id === selectedActivity) || activities.archived.find(a => a._id === selectedActivity)) : null}
              />
            </div>
          </div>

          {/* Event Log Section */}
          <EventLog
            activities={activities}
            onSelectArchivedEvent={handleSelectArchivedEvent}
            onEdit={handleEditActivity}
            onDelete={handleDeleteActivity}
            formatDate={formatDate}
            formatTime={formatTime}
          />
        </div>
      </div>

      {/* QR Scanner Dialog */}
      <AlertDialog open={showQRScanner} onOpenChange={setShowQRScanner}>
        <AlertDialogContent className="max-h-[80vh] overflow-y-auto">
          <AlertDialogDescription asChild>
            <QRScanner
              onScan={handleQRScan}
              onClose={() => setShowQRScanner(false)}
              scanningAction={scanningAction}
            />
          </AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>
    </PrivateLayout>
  )
}

export default AdminActivities

