import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import PrivateLayout from '@/layout/PrivateLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatToPhilippinesTime, formatDate } from '@/lib/utils'
import { Search, FileText, Printer } from 'lucide-react'

const Reports = () => {
    const [activities, setActivities] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [serviceFilter, setServiceFilter] = useState('all')
    const [startDate, setStartDate] = useState(() => {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        return `${year}-${month}-01`
    })
    const [endDate, setEndDate] = useState(() => {
        const now = new Date()
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        const year = lastDay.getFullYear()
        const month = String(lastDay.getMonth() + 1).padStart(2, '0')
        const day = String(lastDay.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    })
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

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

    const loadServices = async () => {
        try {
            const response = await api.maintenance.getServices()
            if (response?.data) {
                setServices(response.data)
            }
        } catch (error) {
            console.error('Error loading services:', error)
        }
    }

    useEffect(() => {
        const initialize = async () => {
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

        const activityDate = new Date(activity.date)
        const matchesDateRange = (!startDate || activityDate >= new Date(startDate)) &&
            (!endDate || activityDate <= new Date(endDate))

        return matchesSearch && matchesService && matchesDateRange
    })

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
            In: ${participant?.timeIn ? formatToPhilippinesTime(participant.timeIn) : 'Not recorded'}<br/>
            Out: ${participant?.timeOut ? formatToPhilippinesTime(participant.timeOut) : 'Not recorded'}
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
            Applied filters: ${searchTerm ? `Search = "${searchTerm}"` : 'None'}; Date Range = ${startDate || 'Start'} to ${endDate || 'End'}
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

    return (
        <PrivateLayout>
            <div className="min-h-screen bg-blue-50">
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Activity Reports</h2>
                            <p className="text-gray-600 mt-1">Generate and print reports of your volunteer activities</p>
                        </div>
                        <Button
                            onClick={handlePrintReport}
                            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            Print Report
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Report Preview</CardTitle>
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
                                <div className="w-[150px]">
                                    <Input
                                        type="date"
                                        placeholder="Start Date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="w-[150px]">
                                    <Input
                                        type="date"
                                        placeholder="End Date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Activities List (Table View for Report) */}
                            <div className="rounded-md border">
                                <div className="relative w-full overflow-auto">
                                    <table className="w-full caption-bottom text-sm">
                                        <thead className="[&_tr]:border-b">
                                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Activity</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Hours</th>
                                            </tr>
                                        </thead>
                                        <tbody className="[&_tr:last-child]:border-0">
                                            {error ? (
                                                <tr>
                                                    <td colSpan={4} className="p-4 text-center text-red-600">{error}</td>
                                                </tr>
                                            ) : filteredActivities.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="p-4 text-center text-gray-500">
                                                        {searchTerm ? 'No matching activities found' : 'No activities found'}
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredActivities.map((activity) => (
                                                    <tr key={activity._id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                        <td className="p-4 align-middle font-medium">{activity.title}</td>
                                                        <td className="p-4 align-middle">{formatDate(activity.date)}</td>
                                                        <td className="p-4 align-middle">
                                                            {activity.userParticipant?.status ? (
                                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${activity.userParticipant.status === 'attended'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : activity.userParticipant.status === 'registered'
                                                                        ? 'bg-blue-100 text-blue-800'
                                                                        : 'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                    {activity.userParticipant.status.charAt(0).toUpperCase() + activity.userParticipant.status.slice(1)}
                                                                </span>
                                                            ) : 'N/A'}
                                                        </td>
                                                        <td className="p-4 align-middle">
                                                            {formatHoursServed(activity.userParticipant?.totalHours) || '-'}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PrivateLayout>
    )
}

export default Reports
