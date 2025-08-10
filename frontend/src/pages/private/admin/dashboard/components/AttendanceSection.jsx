import React from 'react'

const AttendanceSection = () => {
  const attendanceData = [
    { name: 'ARVIN PERMEJO', timeIn: '', timeOut: '', status: '' },
    { name: 'Athea Mae Sales', timeIn: '', timeOut: '', status: '' },
    { name: 'Mark Joross Atienza', timeIn: '', timeOut: '', status: '' },
    { name: 'Lourd Zedrix Porlage', timeIn: '', timeOut: '', status: '' },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Attendance</h3>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        {/* Table Header */}
        <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
          <div className="grid grid-cols-4 gap-4 text-sm font-semibold text-gray-700">
            <div>Name</div>
            <div>Time In</div>
            <div>Time Out</div>
            <div>Status</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {attendanceData.map((person, index) => (
            <div key={index} className="px-4 py-3 hover:bg-gray-50 transition-colors">
              <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
                <div className="font-medium text-gray-800">{person.name}</div>
                <div className="text-gray-400">{person.timeIn || '--'}</div>
                <div className="text-gray-400">{person.timeOut || '--'}</div>
                <div className="text-gray-400">{person.status || '--'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View All Button */}
      <div className="mt-4 text-center">
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          View All Attendance
        </button>
      </div>
    </div>
  )
}

export default AttendanceSection
