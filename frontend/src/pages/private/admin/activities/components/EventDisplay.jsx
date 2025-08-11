import React from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Calendar, MapPin, Clock, Edit, Trash2 } from 'lucide-react'

const EventDisplay = ({
  activity,
  onStatusChange,
  onEdit,
  onDelete,
  formatDate,
  formatTime
}) => {
  if (!activity) return null

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-4">
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-center overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-white transform rotate-12 scale-150"></div>
        </div>

        {/* Main content */}
        <div className="relative z-10">
          <h4 className="text-xl font-bold text-white mb-2">{activity.title}</h4>
          {['completed', 'cancelled'].includes(activity.status) && (
            <div className="mb-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                activity.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                'bg-red-100 text-red-800'
              }`}>
                {activity.status === 'completed' ? '📁 Archived - Completed' : '📁 Archived - Cancelled'}
              </span>
            </div>
          )}
          <p className="text-blue-100 text-sm mb-4">{activity.description}</p>

          {/* Event Details */}
          <div className="grid grid-cols-2 gap-4 text-left text-white text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(activity.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatTime(activity.timeFrom)} - {formatTime(activity.timeTo)}</span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <MapPin className="w-4 h-4" />
              <span>{activity.location?.barangay}, {activity.location?.municipality}, {activity.location?.province}</span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mt-4 flex items-center gap-2">
            <Select
              value={activity.status}
              onValueChange={(value) => onStatusChange(activity._id, value)}
            >
              <SelectTrigger className={`w-auto h-7 px-3 py-1 text-xs font-medium rounded-full border-0 ${
                activity.status === 'published' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                activity.status === 'draft' ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' :
                activity.status === 'ongoing' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                activity.status === 'completed' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
                activity.status === 'cancelled' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
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

          {/* Participants Count */}
          <div className="mt-4 flex items-center justify-center gap-2 text-blue-100">
            <Users className="w-4 h-4" />
            <span>{activity.currentParticipants || 0} / {activity.maxParticipants} participants</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDisplay
