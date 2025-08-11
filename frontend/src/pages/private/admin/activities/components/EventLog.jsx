import React, { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Search, Calendar, MapPin, Filter } from 'lucide-react'

const EventLog = ({
  activities,
  onSelectArchivedEvent,
  onEdit,
  onDelete,
  formatDate,
  formatTime
}) => {
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedBarangay, setSelectedBarangay] = useState('')
  const [selectedMunicipality, setSelectedMunicipality] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Filtered activities based on all filters
  const filteredActivities = useMemo(() => {
    return activities.archived.filter(activity => {
      const title = activity.title?.toLowerCase() || ''
      const description = activity.description?.toLowerCase() || ''
      const barangay = activity.location?.barangay?.toLowerCase() || ''
      const municipality = activity.location?.municipality?.toLowerCase() || ''
      const status = activity.status?.toLowerCase() || ''

      // Search filter
      const matchesSearch = !searchTerm ||
        title.includes(searchTerm.toLowerCase()) ||
        description.includes(searchTerm.toLowerCase()) ||
        barangay.includes(searchTerm.toLowerCase()) ||
        municipality.includes(searchTerm.toLowerCase())

      // Status filter
      const matchesStatus = !selectedStatus || status === selectedStatus.toLowerCase()

      // Location filters
      const matchesBarangay = !selectedBarangay ||
        activity.location?.barangay === selectedBarangay
      const matchesMunicipality = !selectedMunicipality ||
        activity.location?.municipality === selectedMunicipality

      // Date range filters
      const activityDate = new Date(activity.date)
      const fromDate = dateFrom ? new Date(dateFrom) : null
      const toDate = dateTo ? new Date(dateTo) : null

      const matchesDateFrom = !fromDate || activityDate >= fromDate
      const matchesDateTo = !toDate || activityDate <= toDate

      return matchesSearch && matchesStatus && matchesBarangay &&
             matchesMunicipality && matchesDateFrom && matchesDateTo
    })
  }, [activities.archived, searchTerm, selectedStatus, selectedBarangay,
      selectedMunicipality, dateFrom, dateTo])

  // Get unique values for filter options
  const uniqueStatuses = [...new Set(activities.archived.map(a => a.status).filter(Boolean))]
  const uniqueBarangays = [...new Set(activities.archived.map(a => a.location?.barangay).filter(Boolean))]
  const uniqueMunicipalities = [...new Set(activities.archived.map(a => a.location?.municipality).filter(Boolean))]

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedStatus('')
    setSelectedBarangay('')
    setSelectedMunicipality('')
    setDateFrom('')
    setDateTo('')
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Event logged</h3>

      {/* Search and Filter Section */}
      <div className="mb-6 bg-cyan-50 rounded-lg p-4 border border-cyan-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Search className="w-4 h-4 inline mr-1" />
              Search
            </label>
            <input
              type="text"
              placeholder="Search events, locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Filter className="w-4 h-4 inline mr-1" />
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Barangay Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              Barangay
            </label>
            <select
              value={selectedBarangay}
              onChange={(e) => setSelectedBarangay(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">All Barangays</option>
              {uniqueBarangays.map(barangay => (
                <option key={barangay} value={barangay}>{barangay}</option>
              ))}
            </select>
          </div>

          {/* Municipality Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              Municipality
            </label>
            <select
              value={selectedMunicipality}
              onChange={(e) => setSelectedMunicipality(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">All Municipalities</option>
              {uniqueMunicipalities.map(municipality => (
                <option key={municipality} value={municipality}>{municipality}</option>
              ))}
            </select>
          </div>

          {/* Date Range Filters */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="From"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="To"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end gap-2">
            <button
              onClick={clearFilters}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="mt-3 pt-3 border-t border-cyan-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-cyan-700">
              Showing {filteredActivities.length} of {activities.archived.length} events
            </span>
            <div className="flex gap-2 text-xs">
              {searchTerm && <span className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded">Search: {searchTerm}</span>}
              {selectedStatus && <span className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded">Status: {selectedStatus}</span>}
              {selectedBarangay && <span className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded">Barangay: {selectedBarangay}</span>}
              {selectedMunicipality && <span className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded">Municipality: {selectedMunicipality}</span>}
              {(dateFrom || dateTo) && <span className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded">Date Range: {dateFrom || 'Any'} - {dateTo || 'Any'}</span>}
            </div>
          </div>
        </div>
      </div>

      {filteredActivities.length === 0 ? (
        <div className="bg-cyan-500 rounded-lg p-6">
          <div className="text-center text-white">
            <p className="text-lg font-medium">
              {activities.archived.length === 0
                ? 'No archived events found'
                : 'No events match your filters'
              }
            </p>
            <p className="text-cyan-100 text-sm mt-2">
              {activities.archived.length === 0
                ? 'Completed and cancelled events will appear here'
                : 'Try adjusting your search criteria or clearing filters'
              }
            </p>
            {activities.archived.length > 0 && (
              <button
                onClick={clearFilters}
                className="mt-3 bg-white text-cyan-600 px-4 py-2 rounded-md hover:bg-cyan-50 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-cyan-500 text-white px-6 py-4">
            <div className="grid grid-cols-6 gap-4 font-medium text-sm">
              <div>Event Title</div>
              <div>Date</div>
              <div>Time</div>
              <div>Location</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {filteredActivities.map((activity) => (
              <div key={activity._id} className="px-6 py-4 hover:bg-gray-50">
                <div className="grid grid-cols-6 gap-4 text-sm items-center">
                  <div className="font-medium text-gray-900">
                    {activity.title}
                  </div>
                  <div className="text-gray-600">
                    {formatDate(activity.date)}
                  </div>
                  <div className="text-gray-600">
                    {formatTime(activity.timeFrom)} - {formatTime(activity.timeTo)}
                  </div>
                  <div className="text-gray-600">
                    {activity.location?.barangay}, {activity.location?.municipality}
                  </div>
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      activity.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                      activity.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => onSelectArchivedEvent(activity._id)}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1 text-xs"
                    >
                      Select
                    </Button>
                    <Button
                      onClick={() => onEdit(activity._id)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded-md text-xs"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      onClick={() => onDelete(activity._id)}
                      className="bg-red-200 hover:bg-red-300 text-red-800 px-2 py-1 rounded-md text-xs"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Footer */}
          <div className="bg-gray-50 px-6 py-3 border-t">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Total Archived Events: {activities.archived.length}</span>
              <div className="flex gap-4">
                <span>Completed: {activities.archived.filter(a => a.status === 'completed').length}</span>
                <span>Cancelled: {activities.archived.filter(a => a.status === 'cancelled').length}</span>
                <span>Filtered: {filteredActivities.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventLog
