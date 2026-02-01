'use client'

import { useState, useEffect } from 'react'
import { Calendar, MapPin, Users, Clock, CheckCircle, Image as ImageIcon, ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Event {
  id: string
  title: string
  description: string
  event_type: 'workshop' | 'donation-drive' | 'seminar' | 'meetup' | 'other'
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  start_date: string
  end_date: string
  location: string
  max_participants: number
  current_participants: number
  registration_deadline: string
  outcome?: string
  image_url?: string
}

export default function Events() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [registrationData, setRegistrationData] = useState({
    name: '',
    email: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [completedEvents, setCompletedEvents] = useState<Event[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      // Fetch upcoming events
      const { data: upcoming, error: upError } = await supabase
        .from('events')
        .select('*')
        .in('status', ['upcoming', 'ongoing'])
        .order('start_date', { ascending: true })

      if (upError) throw upError

      // Fetch completed events
      const { data: completed, error: compError } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'completed')
        .order('start_date', { ascending: false })
        .limit(6)

      if (compError) throw compError

      setUpcomingEvents(upcoming || [])
      setCompletedEvents(completed || [])
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setPageLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEvent) return

    setLoading(true)
    try {
      // Check if already registered
      const { data: existing } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', selectedEvent.id)
        .eq('email', registrationData.email)
        .single()

      if (existing) {
        toast.error('You are already registered for this event')
        return
      }

      // Create registration
      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: selectedEvent.id,
          name: registrationData.name,
          email: registrationData.email,
          phone: registrationData.phone,
          status: 'registered'
        })

      if (error) throw error

      // Update participant count
      await supabase
        .from('events')
        .update({ current_participants: (selectedEvent.current_participants || 0) + 1 })
        .eq('id', selectedEvent.id)

      toast.success(`Thank you for registering! We'll send confirmation details to ${registrationData.email}`)
      setSelectedEvent(null)
      setRegistrationData({ name: '', email: '', phone: '' })
      fetchEvents() // Refresh events
    } catch (error: any) {
      toast.error(error.message || 'Failed to register. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Events
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Join us for workshops, drives, and seminars
          </p>
        </div>

        {/* Upcoming Events */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
            <Calendar className="w-8 h-8 mr-3 text-primary-600" />
            Upcoming Events
          </h2>
          {upcomingEvents.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">No upcoming events at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      event.event_type === 'workshop' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      event.event_type === 'donation-drive' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    }`}>
                      {event.event_type.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {event.current_participants || 0}/{event.max_participants}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{event.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{event.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(event.start_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4 mr-2" />
                      {event.current_participants || 0} registered
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${((event.current_participants || 0) / event.max_participants) * 100}%` }}
                    />
                  </div>
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                    disabled={(event.current_participants || 0) >= event.max_participants}
                  >
                    {(event.current_participants || 0) >= event.max_participants ? 'Full' : 'Register Now'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Calendar View */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Calendar View</h2>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-semibold text-gray-700 dark:text-gray-300 py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }, (_, i) => {
                const date = i + 1
                const eventDate = upcomingEvents.find(e => {
                  const d = new Date(e.start_date).getDate()
                  return d === date
                })
                return (
                  <div
                    key={i}
                    className={`aspect-square p-2 border border-gray-200 dark:border-gray-700 rounded ${
                      eventDate ? 'bg-primary-100 dark:bg-primary-900 border-primary-300 dark:border-primary-700' : ''
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{date <= 31 ? date : ''}</div>
                    {eventDate && (
                      <div className="text-xs text-primary-600 dark:text-primary-400 mt-1 truncate">
                        {eventDate.title}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Completed Events */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
            <CheckCircle className="w-8 h-8 mr-3 text-primary-600" />
            Completed Events
          </h2>
          {completedEvents.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">No completed events yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {completedEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      event.event_type === 'workshop' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      event.event_type === 'donation-drive' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    }`}>
                      {event.event_type.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(event.start_date).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{event.title}</h3>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                  {event.outcome && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Outcome:</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{event.outcome}</p>
                    </div>
                  )}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Participants:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{event.current_participants || 0} attended</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Registration Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Register for Event</h2>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{selectedEvent.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(selectedEvent.start_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEvent.location}</p>
              </div>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Name *</label>
                  <input
                    type="text"
                    required
                    value={registrationData.name}
                    onChange={(e) => setRegistrationData({ ...registrationData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email *</label>
                  <input
                    type="email"
                    required
                    value={registrationData.email}
                    onChange={(e) => setRegistrationData({ ...registrationData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={registrationData.phone}
                    onChange={(e) => setRegistrationData({ ...registrationData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 inline-flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      'Confirm Registration'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(null)}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
