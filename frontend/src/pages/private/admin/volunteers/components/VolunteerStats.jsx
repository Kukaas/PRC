import React, { useState, useEffect } from 'react'
import { Users, Clock, CheckCircle, TrendingUp, AlertCircle, Calendar } from 'lucide-react'
import { api } from '@/services/api'

const VolunteerStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    underReview: 0,
    thisMonth: 0,
    monthOverMonthChange: 0,
    pendingPercentage: 0,
    acceptedPercentage: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.volunteerApplication.getStats()

      if (response.success) {
        setStats(response.data)
      } else {
        setError(response.message || 'Failed to fetch statistics')
      }
    } catch (err) {
      console.error('Error fetching volunteer stats:', err)
      setError(err.message || 'Failed to fetch statistics')
    } finally {
      setLoading(false)
    }
  }

  const statsData = [
    {
      title: 'Total Volunteers',
      value: stats.total || 0,
      change: stats.monthOverMonthChange > 0 ? `+${stats.monthOverMonthChange}%` : `${stats.monthOverMonthChange}%`,
      changeType: stats.monthOverMonthChange >= 0 ? 'positive' : 'negative',
      description: 'Total applications',
      icon: Users,
      color: 'cyan'
    },
    {
      title: 'Pending Applications',
      value: stats.pending || 0,
      change: `${stats.pendingPercentage || 0}%`,
      changeType: 'neutral',
      description: 'Require review',
      icon: Clock,
      color: 'yellow'
    },
    {
      title: 'Active Volunteers',
      value: stats.accepted || 0,
      change: `${stats.acceptedPercentage || 0}%`,
      changeType: 'positive',
      description: 'Approved applications',
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: 'This Month',
      value: stats.thisMonth || 0,
      change: stats.monthOverMonthChange > 0 ? `+${stats.monthOverMonthChange}%` : `${stats.monthOverMonthChange}%`,
      changeType: stats.monthOverMonthChange >= 0 ? 'positive' : 'negative',
      description: 'New applications',
      icon: Calendar,
      color: 'purple'
    }
  ]

  const getColorClasses = (color, changeType) => {
    const colorMap = {
      cyan: 'bg-cyan-50 border-cyan-200',
      yellow: 'bg-yellow-50 border-yellow-200',
      green: 'bg-green-50 border-green-200',
      purple: 'bg-purple-50 border-purple-200'
    }

    const iconColorMap = {
      cyan: 'text-cyan-600',
      yellow: 'text-yellow-600',
      green: 'text-green-600',
      purple: 'text-purple-600'
    }

    const changeColorMap = {
      positive: 'text-green-600',
      negative: 'text-red-600',
      neutral: 'text-blue-600'
    }

    return {
      card: colorMap[color] || 'bg-cyan-50 border-cyan-200',
      icon: iconColorMap[color] || 'text-cyan-600',
      change: changeColorMap[changeType] || 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="w-24 h-3 bg-gray-200 rounded"></div>
                <div className="w-16 h-6 bg-gray-200 rounded"></div>
                <div className="w-32 h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">Error Loading Statistics</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => {
        const colors = getColorClasses(stat.color, stat.changeType)
        const IconComponent = stat.icon

        return (
          <div key={index} className={`rounded-lg shadow-sm border p-6 ${colors.card}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${colors.icon} bg-white/50`}>
                <IconComponent className="w-6 h-6" />
              </div>
              <div className={`flex items-center ${colors.change}`}>
                <span className="text-sm font-medium">{stat.change}</span>
                {stat.changeType !== 'neutral' && (
                  <svg
                    className={`w-4 h-4 ml-1 ${
                      stat.changeType === 'positive' ? 'rotate-0' : 'rotate-180'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{stat.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default VolunteerStats
