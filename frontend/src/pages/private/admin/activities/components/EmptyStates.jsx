import React from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'

const EmptyStates = ({
  selectedActivity,
  activities,
  onCreateEvent
}) => {
  // No Active Event Selected Message
  if (!selectedActivity && activities.active.length > 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center mt-4">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h4 className="text-lg font-semibold text-gray-600 mb-2">Select an Active Event</h4>
        <p className="text-sm text-gray-500">Choose an event from the dropdown above to view details and manage attendance</p>
      </div>
    )
  }

  // No Active Events Available Message
  if (activities.active.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center mt-4">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h4 className="text-lg font-semibold text-gray-600 mb-2">No Active Events</h4>
        <p className="text-sm text-gray-500 mb-4">All events have been completed or cancelled. Check the Event Log below for archived events.</p>
        <Button
          onClick={onCreateEvent}
          className="bg-cyan-500 hover:bg-cyan-600 text-white"
        >
          Create New Event
        </Button>
      </div>
    )
  }

  return null
}

export default EmptyStates
