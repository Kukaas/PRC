import React from 'react'

const VolunteerStats = () => {
  const stats = [
    {
      title: 'Total Volunteers',
      value: '156',
      change: '+12',
      changeType: 'positive',
      description: 'From last month'
    },
    {
      title: 'Pending Applications',
      value: '23',
      change: '+5',
      changeType: 'negative',
      description: 'Require review'
    },
    {
      title: 'Active Volunteers',
      value: '98',
      change: '+8',
      changeType: 'positive',
      description: 'Currently active'
    },
    {
      title: 'New This Month',
      value: '34',
      change: '+15',
      changeType: 'positive',
      description: 'Recent registrations'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`flex items-center ${
              stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              <span className="text-sm font-medium">{stat.change}</span>
              <svg 
                className={`w-4 h-4 ml-1 ${
                  stat.changeType === 'positive' ? 'rotate-0' : 'rotate-180'
                }`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{stat.description}</p>
        </div>
      ))}
    </div>
  )
}

export default VolunteerStats
