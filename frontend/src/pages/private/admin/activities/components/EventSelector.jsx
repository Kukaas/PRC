import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const EventSelector = ({ selectedActivity, onActivityChange, activities }) => {
  // Find the selected activity (could be active or archived)
  const selectedActivityData = selectedActivity
    ? (activities.active.find(a => a._id === selectedActivity) ||
       activities.archived.find(a => a._id === selectedActivity))
    : null

  return (
    <Select value={selectedActivity || ""} onValueChange={onActivityChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select an Event">
          {selectedActivityData ? selectedActivityData.title : "Select an Event"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {/* Only show active events in the dropdown */}
        {activities.active.length > 0 ? (
          <>
            <div className="px-2 py-1.5 text-sm font-semibold text-gray-500 bg-gray-100">Active Events</div>
            {activities.active.map((activity) => (
              <SelectItem key={activity._id} value={activity._id}>
                {activity.title}
              </SelectItem>
            ))}
          </>
        ) : (
          <div className="px-2 py-3 text-center text-gray-500 text-sm">
            No active events available
          </div>
        )}
      </SelectContent>
    </Select>
  )
}

export default EventSelector
