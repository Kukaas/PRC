import React from 'react'

const ActivitySection = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Activity</h3>
        <p className="text-sm text-gray-600">Current Event</p>
      </div>

      {/* JOIN NOW Banner */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-center overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-white transform rotate-12 scale-150"></div>
        </div>

        {/* Main text */}
        <div className="relative z-10">
          <div className="text-6xl font-bold text-white mb-2">JOIN</div>
          <div className="text-2xl font-semibold text-blue-200">NOW</div>
        </div>

        {/* Call to action button */}
        <button className="relative z-10 mt-6 bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
          Register for Event
        </button>
      </div>
    </div>
  )
}

export default ActivitySection
