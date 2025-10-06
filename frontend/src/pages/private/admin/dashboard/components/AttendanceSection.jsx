import React, { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import { api } from '@/services/api'

const AttendanceSection = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ongoing, setOngoing] = useState(null)

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.activities.getOngoingWithAttendance()
        if (res.success) {
          setOngoing(res.data)
        } else {
          setOngoing(null)
        }
      } catch (e) {
        setError(e.message || 'Failed to load attendance')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const attendanceData = ongoing?.attendance || []

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Attendance</h3>
        {ongoing?.activity?.title && (
          <p className="text-sm text-gray-500 mt-1">Current event: {ongoing.activity.title}</p>
        )}
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-9 w-full bg-gray-200 rounded" />
          <div className="h-40 w-full bg-gray-200 rounded" />
          <div className="h-8 w-full bg-gray-100 rounded" />
        </div>
      ) : error ? (
        <div className="text-red-600 text-sm">{error}</div>
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
                      <div className="font-medium text-gray-900">{participant.name}</div>
                      <div className="text-gray-600 text-xs">{participant.contactNumber || '--'}</div>
                      <div className="text-gray-600">{participant.timeIn ? new Date(participant.timeIn).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      }) : '--'}</div>
                      <div className="text-gray-600">{participant.timeOut ? new Date(participant.timeOut).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      }) : '--'}</div>
                      <div>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${participant.status === 'attended' ? 'bg-green-100 text-green-800' : participant.status === 'absent' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-800'}`}
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
