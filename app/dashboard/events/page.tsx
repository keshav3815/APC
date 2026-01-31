'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Calendar,
  Search,
  MapPin,
  Clock,
  Loader2,
  CheckCircle,
  XCircle,
  Filter,
  ChevronDown,
  Users,
  ExternalLink,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format, isPast, isFuture } from 'date-fns'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface EventRegistration {
  id: string
  status: string
  tickets: number
  created_at: string
  event: {
    id: string
    title: string
    description: string
    event_date: string
    end_date: string | null
    location: string | null
    image_url: string | null
    event_type: string
    max_participants: number | null
    registration_count: number
  }
}

export default function MyEvents() {
  const { profile } = useAuth()
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [timeFilter, setTimeFilter] = useState<'all' | 'upcoming' | 'past'>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [cancelling, setCancelling] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (profile?.id) {
      fetchRegistrations()
    }
  }, [profile?.id])

  const fetchRegistrations = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('event_registrations')
      .select(`
        id,
        status,
        tickets,
        created_at,
        event:events(
          id,
          title,
          description,
          event_date,
          end_date,
          location,
          image_url,
          event_type,
          max_participants,
          registration_count
        )
      `)
      .eq('user_id', profile?.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setRegistrations(data as unknown as EventRegistration[])
    }
    setLoading(false)
  }

  const handleCancel = async (registration: EventRegistration) => {
    if (!confirm('Are you sure you want to cancel this registration?')) return

    setCancelling(registration.id)

    try {
      const { error } = await supabase
        .from('event_registrations')
        .update({ status: 'cancelled' })
        .eq('id', registration.id)

      if (error) throw error

      toast.success('Registration cancelled')
      setRegistrations(
        registrations.map((r) =>
          r.id === registration.id ? { ...r, status: 'cancelled' } : r
        )
      )
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel registration')
    } finally {
      setCancelling(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'pending':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'attended':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  // Filter registrations
  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch = reg.event?.title?.toLowerCase().includes(search.toLowerCase())

    const matchesTime =
      timeFilter === 'all' ||
      (timeFilter === 'upcoming' && isFuture(new Date(reg.event?.event_date))) ||
      (timeFilter === 'past' && isPast(new Date(reg.event?.event_date)))

    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter

    return matchesSearch && matchesTime && matchesStatus
  })

  // Stats
  const upcomingCount = registrations.filter(
    (r) => isFuture(new Date(r.event?.event_date)) && r.status !== 'cancelled'
  ).length
  const attendedCount = registrations.filter(
    (r) => isPast(new Date(r.event?.event_date)) && r.status === 'attended'
  ).length
  const cancelledCount = registrations.filter((r) => r.status === 'cancelled').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Calendar className="w-8 h-8 mr-3 text-blue-600" />
            My Events
          </h1>
          <p className="text-gray-600 dark:text-gray-400">View and manage your event registrations</p>
        </div>

        <Link
          href="/events"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Calendar className="w-5 h-5 mr-2" />
          Browse Events
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{registrations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming</p>
              <p className="text-xl font-bold text-green-600">{upcomingCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-3">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Attended</p>
              <p className="text-xl font-bold text-purple-600">{attendedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-3">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Cancelled</p>
              <p className="text-xl font-bold text-red-600">{cancelledCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Time Filter Tabs */}
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
            {(['all', 'upcoming', 'past'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  timeFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Filter className="w-5 h-5 mr-2" />
            Status
            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {['all', 'confirmed', 'pending', 'attended', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Events List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm border border-gray-100 dark:border-gray-700">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {registrations.length === 0
              ? "You haven't registered for any events yet"
              : 'No events match your filters'}
          </p>
          {registrations.length === 0 && (
            <Link
              href="/events"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Events
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRegistrations.map((reg) => {
            const isUpcoming = isFuture(new Date(reg.event?.event_date))
            const canCancel = isUpcoming && reg.status !== 'cancelled'

            return (
              <div
                key={reg.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                {reg.event?.image_url && (
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <img
                      src={reg.event.image_url}
                      alt={reg.event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                      {reg.event?.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reg.status)}`}>
                      {reg.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {format(new Date(reg.event?.event_date), 'EEEE, dd MMM yyyy')}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {format(new Date(reg.event?.event_date), 'hh:mm a')}
                    </div>
                    {reg.event?.location && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="line-clamp-1">{reg.event.location}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {reg.tickets} ticket{reg.tickets > 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Link
                      href={`/events/${reg.event?.id}`}
                      className="flex-1 text-center py-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center"
                    >
                      View Details
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </Link>
                    {canCancel && (
                      <button
                        onClick={() => handleCancel(reg)}
                        disabled={cancelling === reg.id}
                        className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {cancelling === reg.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Cancel'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
