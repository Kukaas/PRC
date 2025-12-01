import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

import { api } from '@/services/api'
import { toast } from 'sonner'
import { Star, User, Search } from 'lucide-react'

const EvaluationModal = ({ isOpen, onClose, activity }) => {
    const [participants, setParticipants] = useState([])
    const [selectedVolunteer, setSelectedVolunteer] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [ratings, setRatings] = useState({
        punctuality: 0,
        engagement: 0,
        teamwork: 0,
        skillsApplied: 0,
    })
    const [comments, setComments] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [existingEvaluations, setExistingEvaluations] = useState([])
    const [activeTab, setActiveTab] = useState('pending') // 'pending' or 'completed'
    const [viewingEvaluation, setViewingEvaluation] = useState(null)

    useEffect(() => {
        if (isOpen && activity) {
            // Filter for attended participants
            const attended = activity.participants.filter(
                p => p.status === 'attended' && p.userId
            )
            setParticipants(attended)
            loadExistingEvaluations(activity._id)

            // Reset form
            setSelectedVolunteer('')
            setRatings({
                punctuality: 0,
                engagement: 0,
                teamwork: 0,
                skillsApplied: 0,
            })
            setComments('')
        }
    }, [isOpen, activity])

    const loadExistingEvaluations = async (activityId) => {
        try {
            const response = await api.evaluations.getByActivity(activityId)
            if (response.data) {
                setExistingEvaluations(response.data)
            }
        } catch (error) {
            console.error('Error loading existing evaluations:', error)
        }
    }

    const handleRatingChange = (category, value) => {
        setRatings(prev => ({
            ...prev,
            [category]: value
        }))
    }

    const handleSubmit = async () => {
        if (!selectedVolunteer) {
            toast.error('Please select a volunteer to evaluate')
            return
        }

        // Validate ratings
        const missingRatings = Object.entries(ratings).filter(([_, value]) => value === 0)
        if (missingRatings.length > 0) {
            toast.error('Please provide ratings for all categories')
            return
        }

        try {
            setIsSubmitting(true)
            await api.evaluations.create({
                activityId: activity._id,
                volunteerId: selectedVolunteer,
                ratings,
                comments
            })

            toast.success('Evaluation submitted successfully')

            // Refresh existing evaluations list
            loadExistingEvaluations(activity._id)

            // Reset form for next evaluation
            setSelectedVolunteer('')
            setRatings({
                punctuality: 0,
                engagement: 0,
                teamwork: 0,
                skillsApplied: 0,
            })
            setComments('')

        } catch (error) {
            console.error('Error submitting evaluation:', error)
            toast.error(error.response?.data?.message || 'Failed to submit evaluation')
        } finally {
            setIsSubmitting(false)
        }
    }

    const renderStars = (category, currentRating) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(category, star)}
                        className={`focus:outline-none transition-colors ${star <= currentRating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                    >
                        <Star className="w-6 h-6 fill-current" />
                    </button>
                ))}
            </div>
        )
    }

    // Filter out volunteers who have already been evaluated
    const availableVolunteers = participants.filter(
        p => !existingEvaluations.some(e => e.volunteerId?._id === p.userId._id || e.volunteerId === p.userId._id)
    )

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Evaluate Volunteer</DialogTitle>
                    <DialogDescription>
                        Manage evaluations for {activity?.title}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex border-b mb-4">
                    <button
                        className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'pending'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => {
                            setActiveTab('pending')
                            setViewingEvaluation(null)
                        }}
                    >
                        Pending Evaluation
                    </button>
                    <button
                        className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'completed'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => {
                            setActiveTab('completed')
                            setSelectedVolunteer('')
                        }}
                    >
                        Completed ({existingEvaluations.length})
                    </button>
                </div>

                {activeTab === 'pending' ? (
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label>Select Volunteer</Label>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search volunteer..."
                                    className="w-full pl-8 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="mt-2 border rounded-md max-h-48 overflow-y-auto">
                                {availableVolunteers.length === 0 ? (
                                    <div className="p-4 text-sm text-gray-500 text-center">
                                        {searchTerm ? 'No volunteers found matching search' : 'No pending evaluations'}
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {availableVolunteers
                                            .filter(p => {
                                                const fullName = `${p.userId.givenName} ${p.userId.familyName}`.toLowerCase()
                                                return fullName.includes(searchTerm.toLowerCase())
                                            })
                                            .map((participant) => (
                                                <button
                                                    key={participant.userId._id}
                                                    onClick={() => setSelectedVolunteer(participant.userId._id)}
                                                    className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left ${selectedVolunteer === participant.userId._id ? 'bg-blue-50 ring-1 ring-blue-500' : ''
                                                        }`}
                                                >
                                                    {participant.userId.photo ? (
                                                        <img
                                                            src={participant.userId.photo}
                                                            alt="Avatar"
                                                            className="w-8 h-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <User className="w-8 h-8 p-1.5 bg-gray-100 rounded-full text-gray-500" />
                                                    )}
                                                    <div>
                                                        <div className="font-medium text-sm text-gray-900">
                                                            {participant.userId.givenName} {participant.userId.familyName}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {participant.userId.email}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                    </div>
                                )}
                            </div>

                            {participants.length > 0 && availableVolunteers.length === 0 && !searchTerm && (
                                <p className="text-sm text-green-600 mt-1">
                                    All attended volunteers have been evaluated!
                                </p>
                            )}
                        </div>

                        {selectedVolunteer && (
                            <>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Punctuality</Label>
                                        {renderStars('punctuality', ratings.punctuality)}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Engagement</Label>
                                        {renderStars('engagement', ratings.engagement)}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Teamwork</Label>
                                        {renderStars('teamwork', ratings.teamwork)}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Skills Applied</Label>
                                        {renderStars('skillsApplied', ratings.skillsApplied)}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Comments (Optional)</Label>
                                    <Textarea
                                        placeholder="Additional feedback..."
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                        rows={4}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6 py-4">
                        {viewingEvaluation ? (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 pb-4 border-b">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setViewingEvaluation(null)}
                                        className="mr-2"
                                    >
                                        ← Back
                                    </Button>
                                    {viewingEvaluation.volunteerId.photo ? (
                                        <img
                                            src={viewingEvaluation.volunteerId.photo}
                                            alt="Avatar"
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-10 h-10 p-2 bg-gray-100 rounded-full text-gray-500" />
                                    )}
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {viewingEvaluation.volunteerId.givenName} {viewingEvaluation.volunteerId.familyName}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Evaluated on {new Date(viewingEvaluation.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Punctuality</Label>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`w-5 h-5 ${star <= viewingEvaluation.ratings.punctuality ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Engagement</Label>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`w-5 h-5 ${star <= viewingEvaluation.ratings.engagement ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Teamwork</Label>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`w-5 h-5 ${star <= viewingEvaluation.ratings.teamwork ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Skills Applied</Label>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`w-5 h-5 ${star <= viewingEvaluation.ratings.skillsApplied ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {viewingEvaluation.comments && (
                                    <div className="space-y-2">
                                        <Label>Comments</Label>
                                        <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-700">
                                            {viewingEvaluation.comments}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Search evaluated volunteer..."
                                        className="w-full pl-8 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="mt-2 border rounded-md max-h-[60vh] overflow-y-auto divide-y">
                                    {existingEvaluations.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500">
                                            No evaluations completed yet
                                        </div>
                                    ) : (
                                        existingEvaluations
                                            .filter(e => {
                                                const fullName = `${e.volunteerId.givenName} ${e.volunteerId.familyName}`.toLowerCase()
                                                return fullName.includes(searchTerm.toLowerCase())
                                            })
                                            .map((evaluation) => (
                                                <button
                                                    key={evaluation._id}
                                                    onClick={() => setViewingEvaluation(evaluation)}
                                                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors text-left"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {evaluation.volunteerId.photo ? (
                                                            <img
                                                                src={evaluation.volunteerId.photo}
                                                                alt="Avatar"
                                                                className="w-8 h-8 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <User className="w-8 h-8 p-1.5 bg-gray-100 rounded-full text-gray-500" />
                                                        )}
                                                        <div>
                                                            <div className="font-medium text-sm text-gray-900">
                                                                {evaluation.volunteerId.givenName} {evaluation.volunteerId.familyName}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {new Date(evaluation.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-yellow-500">
                                                        <span className="text-sm font-medium">
                                                            {((evaluation.ratings.punctuality +
                                                                evaluation.ratings.engagement +
                                                                evaluation.ratings.teamwork +
                                                                evaluation.ratings.skillsApplied) / 4).toFixed(1)}
                                                        </span>
                                                        <Star className="w-4 h-4 fill-current" />
                                                    </div>
                                                </button>
                                            ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    {activeTab === 'pending' && (
                        <Button
                            onClick={handleSubmit}
                            disabled={!selectedVolunteer || isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Evaluation'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default EvaluationModal
