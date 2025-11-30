import React from 'react'
import { Button } from '@/components/ui/button'
import { Users, Scan, Printer } from 'lucide-react'
import { printAttendanceReport } from '../utils/printAttendance'
import { formatToPhilippinesTime } from '@/lib/utils'

const AttendanceSection = ({
  selectedActivity,
  attendanceData,
  onOpenQRScanner,
  activity
}) => {
  const isCompleted = activity?.status === 'completed'
  const isCancelled = activity?.status === 'cancelled'
  const isOngoing = activity?.status === 'ongoing'

  // const hasEndedByTime = useMemo(() => {
  //   if (!activity?.date) return false
  //   try {
  //     const end = new Date(activity.date)
  //     if (activity?.timeTo) {
  //       const [h, m] = String(activity.timeTo).split(':').map(Number)
  //       if (!Number.isNaN(h)) end.setHours(h, Number.isNaN(m) ? 0 : m, 0, 0)
  //     } else {
  //       // If no end time, assume the event ends at end of the day
  //       end.setHours(23, 59, 59, 999)
  //     }
  //     return Date.now() > end.getTime()
  //   } catch {
  //     return false
  //   }
  // }, [activity])

  const handlePrint = () => {
    printAttendanceReport(activity, attendanceData)
  }
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Attendance</h3>
          {selectedActivity && activity && ['completed', 'cancelled'].includes(activity.status) && (
            <p className="text-sm text-gray-500 mt-1 max-w-md truncate" title={activity.title}>
              Viewing archived event: {activity.title}
            </p>
          )}
        </div>
        {selectedActivity && (
          <div className="flex gap-2">
            {isCompleted ? (
              <Button
                onClick={handlePrint}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 text-sm"
              >
                <Printer className="w-4 h-4 mr-1" />
                Print
              </Button>
            ) : isCancelled ? null : isOngoing ? (
              <>
                <Button
                  onClick={() => onOpenQRScanner('timeIn')}
                  className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 text-sm"
                >
                  <Scan className="w-4 h-4 mr-1" />
                  Time In
                </Button>
                <Button
                  onClick={() => onOpenQRScanner('timeOut')}
                  className="bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 text-sm"
                >
                  <Scan className="w-4 h-4 mr-1" />
                  Time Out
                </Button>
              </>
            ) : null}
          </div>
        )}
      </div>

      {!selectedActivity ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-sm text-gray-500">Select an event to view attendance</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Table Header */}
          <div className="bg-cyan-500 text-white px-4 py-3 rounded-t-lg flex-shrink-0">
            <div className="grid grid-cols-5 gap-4 font-medium text-sm">
              <div>Name</div>
              <div>Contact</div>
              <div>Time In</div>
              <div>Time Out</div>
              <div>Status</div>
            </div>
          </div>

          {/* Table Body - Scrollable */}
          <div className="max-h-80 overflow-y-auto">
            {attendanceData.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No participants registered yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {attendanceData.map((participant) => (
                  <div key={participant.userId} className="px-4 py-3">
                    <div className="grid grid-cols-5 gap-4 text-sm">
                      <div className="font-medium text-gray-900">
                        {participant.name}
                      </div>
                      <div className="text-gray-600 text-xs">
                        {participant.contactNumber || '--'}
                      </div>
                      <div className="text-gray-600">
                        {participant.timeIn ? (
                          <div>
                            <div>{formatToPhilippinesTime(participant.timeIn)}</div>
                            {participant.automaticAdjustment && participant.action === 'timeIn' && (
                              <div className="text-xs text-blue-600">(Auto-adjusted)</div>
                            )}
                          </div>
                        ) : '--'}
                      </div>
                      <div className="text-gray-600">
                        {participant.timeOut ? (
                          <div>
                            <div>{formatToPhilippinesTime(participant.timeOut)}</div>
                            {participant.automaticAdjustment && participant.action === 'timeOut' && (
                              <div className="text-xs text-blue-600">(Auto-adjusted)</div>
                            )}
                          </div>
                        ) : '--'}
                      </div>
                      <div>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${participant.status === 'attended' ? 'bg-green-100 text-green-800' :
                            participant.status === 'absent' ? 'bg-red-600 text-white' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          title={participant.status === 'absent' ? 'Marked as absent (no attendance recorded)' : ''}
                        >
                          {participant.status || 'registered'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attendance Summary - Fixed at bottom */}
          {attendanceData.length > 0 && (
            <div className="bg-gray-50 px-4 py-3 border-t flex-shrink-0">
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Total:</span> {attendanceData.length}
                </div>
                <div>
                  <span className="font-medium text-green-700">Present:</span> {attendanceData.filter(p => p.status === 'attended').length}
                </div>
                <div>
                  <span className="font-medium text-red-700">Absent:</span> {attendanceData.filter(p => p.status === 'absent').length}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Registered:</span> {attendanceData.filter(p => !p.status || p.status === 'registered').length}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AttendanceSection
