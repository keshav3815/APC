'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { 
  Calendar, Plus, Search, Filter, Edit2, Trash2, Eye, Users, 
  MapPin, Clock, X, Loader2, CheckCircle, XCircle, AlertCircle
} from 'lucide-react'

interface Event {
  id: string
  title: string
  description: string
  event_type: string
  status: string
  start_date: string
  end_date: string
  location: string
  max_participants: number
  current_participants: number
  registration_deadline: string
  outcome?: string
  image_url?: string
  created_at: string
}

interface EventRegistration {
  id: string
  event_id: string
  name: string
  email: string
  phone: string
  status: string
  created_at: string
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'workshop',
    status: 'upcoming',
    start_date: '',
    end_date: '',
    location: '',
    max_participants: 50,
    registration_deadline: '',
    outcome: ''
  })
  const supabase = createClient()

  useEffect(() => {
    fetchEvents()

    // Set up real-time subscription for events
    const eventsSubscription = supabase
      .channel('events-changes-admin')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        (payload: any) => {
          console.log('Events changed in admin:', payload)
          fetchEvents() // Refetch events when table changes
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      eventsSubscription.unsubscribe()
    }
  }, [])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: false })

      if (error) throw error
      setEvents(data || [])
    } catch (error: any) {
      toast.error('Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }

  const fetchRegistrations = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRegistrations(data || [])
    } catch (error: any) {
      toast.error('Failed to fetch registrations')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (selectedEvent) {
        const { error } = await supabase
          .from('events')
          .update(formData)
          .eq('id', selectedEvent.id)

        if (error) throw error
        toast.success('Event updated successfully')
      } else {
        const { error } = await supabase
          .from('events')
          .insert(formData)

        if (error) throw error
        toast.success('Event created successfully')
      }
      
      setShowModal(false)
      resetForm()
      fetchEvents()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save event')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Event deleted successfully')
      fetchEvents()
    } catch (error: any) {
      toast.error('Failed to delete event')
    }
  }

  const handleUpdateRegistrationStatus = async (regId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('event_registrations')
        .update({ status })
        .eq('id', regId)

      if (error) throw error
      toast.success('Registration updated')
      if (selectedEvent) fetchRegistrations(selectedEvent.id)
    } catch (error: any) {
      toast.error('Failed to update registration')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_type: 'workshop',
      status: 'upcoming',
      start_date: '',
      end_date: '',
      location: '',
      max_participants: 50,
      registration_deadline: '',
      outcome: ''
    })
    setSelectedEvent(null)
  }

  const openEditModal = (event: Event) => {
    setSelectedEvent(event)
    setFormData({
      title: event.title,
      description: event.description,
      event_type: event.event_type,
      status: event.status,
      start_date: event.start_date?.split('T')[0] || '',
      end_date: event.end_date?.split('T')[0] || '',
      location: event.location,
      max_participants: event.max_participants,
      registration_deadline: event.registration_deadline?.split('T')[0] || '',
      outcome: event.outcome || ''
    })
    setShowModal(true)
  }

  const openRegistrationsModal = (event: Event) => {
    setSelectedEvent(event)
    fetchRegistrations(event.id)
    setShowRegistrationsModal(true)
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || event.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: events.length,
    upcoming: events.filter(e => e.status === 'upcoming').length,
    ongoing: events.filter(e => e.status === 'ongoing').length,
    completed: events.filter(e => e.status === 'completed').length,
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      ongoing: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    }
    return styles[status] || styles.upcoming
  }

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      workshop: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      seminar: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
      'donation-drive': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      meetup: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    }
    return styles[type] || styles.other
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Events Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage events and registrations</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Event
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcoming}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.ongoing}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ongoing</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-gray-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Events Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Registrations</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{event.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(event.event_type)}`}>
                      {event.event_type.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {new Date(event.start_date).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-1" />
                      {event.location}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => openRegistrationsModal(event)}
                      className="flex items-center text-sm text-primary-600 hover:underline"
                    >
                      <Users className="w-4 h-4 mr-1" />
                      {event.current_participants || 0}/{event.max_participants}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(event.status)}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(event)}
                        className="p-1 text-gray-600 hover:text-primary-600 dark:text-gray-400"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="p-1 text-gray-600 hover:text-red-600 dark:text-gray-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredEvents.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No events found
          </div>
        )}
      </div>

      {/* Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedEvent ? 'Edit Event' : 'Add New Event'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Type</label>
                  <select
                    value={formData.event_type}
                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="workshop">Workshop</option>
                    <option value="seminar">Seminar</option>
                    <option value="donation-drive">Donation Drive</option>
                    <option value="meetup">Meetup</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Participants</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Registration Deadline</label>
                  <input
                    type="datetime-local"
                    value={formData.registration_deadline}
                    onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              {selectedEvent?.status === 'completed' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Outcome</label>
                  <textarea
                    rows={2}
                    value={formData.outcome}
                    onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                    placeholder="Brief summary of event outcomes..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {selectedEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Registrations Modal */}
      {showRegistrationsModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Event Registrations</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedEvent.title}</p>
              </div>
              <button onClick={() => setShowRegistrationsModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              {registrations.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No registrations yet</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Contact</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Registered</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {registrations.map((reg) => (
                      <tr key={reg.id}>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{reg.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          <p>{reg.email}</p>
                          <p>{reg.phone}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            reg.status === 'registered' ? 'bg-blue-100 text-blue-800' :
                            reg.status === 'attended' ? 'bg-green-100 text-green-800' :
                            reg.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {reg.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(reg.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <select
                            value={reg.status}
                            onChange={(e) => handleUpdateRegistrationStatus(reg.id, e.target.value)}
                            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
                          >
                            <option value="registered">Registered</option>
                            <option value="attended">Attended</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="no-show">No Show</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
