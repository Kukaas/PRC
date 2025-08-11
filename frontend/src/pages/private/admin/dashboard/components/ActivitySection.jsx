import React, { useEffect, useState } from 'react'
import { api } from '@/services/api'

const ActivitySection = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activity, setActivity] = useState(null)

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.activities.getOngoingWithAttendance()
        if (res.success && res.data?.activity) {
          setActivity(res.data.activity)
        } else {
          setActivity(null)
        }
      } catch (e) {
        setError(e.message || 'Failed to load current activity')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Activity</h3>
        <p className="text-sm text-gray-600">Current Event</p>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-10 w-48 bg-gray-200 rounded" />
          <div className="h-28 w-full bg-blue-200/50 rounded" />
          <div className="h-8 w-64 bg-gray-200 rounded" />
        </div>
      ) : error ? (
        <div className="text-red-600 text-sm">{error}</div>
      ) : !activity ? (
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-center overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-white transform rotate-12 scale-150"></div>
          </div>
          <div className="relative z-10">
            <h4 className="text-xl font-bold text-white mb-2">No ongoing activity</h4>
            <p className="text-blue-100 text-sm">Create or publish an activity to see it here.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-0">
          <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-center overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-white transform rotate-12 scale-150"></div>
            </div>

            <div className="relative z-10">
              <h4 className="text-xl font-bold text-white mb-2">{activity.title}</h4>
              <p className="text-blue-100 text-sm mb-4">{activity.description}</p>

              <div className="grid grid-cols-2 gap-4 text-left text-white text-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> {new Date(activity.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> {activity.timeFrom} - {activity.timeTo}</span>
                </div>
                {activity.location?.exactLocation && (
                  <div className="flex items-center gap-2 col-span-2">
                    <span className="inline-flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg> <span className="italic">{activity.location.exactLocation}</span></span>
                  </div>
                )}
                <div className="flex items-center gap-2 col-span-2">
                  <span className="inline-flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg> {activity.location?.barangay}, {activity.location?.municipality}, {activity.location?.province}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-blue-100">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><path d="M20 8v6"></path><path d="M23 11h-6"></path></svg>
                <span>{activity.currentParticipants || 0} / {activity.maxParticipants} participants</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActivitySection
