'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import {
  Calendar,
  BookOpen,
  Bell,
  TrendingUp,
  Clock,
  ChevronRight,
  Loader2,
  Star,
  Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

interface DashboardStats {
  eventsAttended: number
  upcomingEvents: number
  booksIssued: number
  notifications: number
}

interface RecentActivity {
  id: string
  type: 'event' | 'book'
  title: string
  description: string
  date: string
  status?: string
}

export default function UserDashboard() {
  const { profile, user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    eventsAttended: 0,
    upcomingEvents: 0,
    booksIssued: 0,
    notifications: 0,
  })
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchDashboardData()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [authLoading, user?.id])

  const fetchDashboardData = async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }
    setLoading(true)

    try {
      // Fetch event registrations
      const { data: registrations } = await supabase
        .from('event_registrations')
        .select('*, events(*)')
        .eq('user_id', user.id)

      // Fetch patron info and book issues (with error handling)
      let bookIssues: any[] = []
      try {
        const { data: patron } = await supabase
          .from('library_patrons')
          .select('id')
          .eq('email', profile?.email || user?.email)
          .maybeSingle()

        if (patron) {
          const { data } = await supabase
            .from('book_issues')
            .select('*, books(title, author)')
            .eq('patron_id', patron.id)
            .is('return_date', null)

          bookIssues = data || []
        }
      } catch (patronError) {
        // Silently fail if patron doesn't exist or table has issues
        console.log('Patron lookup skipped:', patronError)
      }

      // Fetch notifications
      const { count: notificationCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      // Calculate stats
      const now = new Date()
      const pastEvents = registrations?.filter(
        (r: any) => r.events && new Date(r.events.start_date) < now
      ) || []
      const futureEvents = registrations?.filter(
        (r: any) => r.events && new Date(r.events.start_date) >= now
      ) || []

      setStats({
        eventsAttended: pastEvents.length,
        upcomingEvents: futureEvents.length,
        booksIssued: bookIssues.length,
        notifications: notificationCount || 0,
      })

      // Set upcoming events
      setUpcomingEvents(
        futureEvents
          .sort((a: any, b: any) => new Date(a.events?.start_date).getTime() - new Date(b.events?.start_date).getTime())
          .slice(0, 3)
      )

      // Build activity feed
      const activityList: RecentActivity[] = []

      registrations?.slice(0, 5).forEach((r: any) => {
        if (r.events) {
          activityList.push({
            id: r.id,
            type: 'event',
            title: `Registered for ${r.events?.title}`,
            description: `Event on ${r.events?.start_date ? format(new Date(r.events.start_date), 'dd MMM yyyy') : 'TBD'}`,
            date: r.created_at,
            status: r.status,
          })
        }
      })

      bookIssues.slice(0, 3).forEach((issue: any) => {
        activityList.push({
          id: issue.id,
          type: 'book',
          title: `Borrowed "${issue.books?.title || 'Unknown'}"`,
          description: `Due: ${issue.due_date ? format(new Date(issue.due_date), 'dd MMM yyyy') : 'N/A'}`,
          date: issue.issue_date,
        })
      })

      // Sort by date
      activityList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setActivities(activityList.slice(0, 5))
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar className="w-4 h-4 text-blue-500" />
      case 'book':
        return <BookOpen className="w-4 h-4 text-green-500" />
      default:
        return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-green-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Member'}! 👋
        </h1>
        <p className="text-white/90">
          Thank you for being part of our community. Your contributions make a difference!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.eventsAttended}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Events Attended</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcomingEvents}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.booksIssued}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Books Borrowed</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.notifications}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Notifications</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/events"
            className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-2 shadow">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Browse Events</span>
          </Link>

          <Link
            href="/books"
            className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-2 shadow">
              <BookOpen className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Explore Library</span>
          </Link>

          <Link
            href="/volunteer"
            className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-2 shadow">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Volunteer</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
            <Link
              href="/dashboard/activity"
              className="text-sm text-orange-600 hover:text-orange-700 flex items-center"
            >
              View all
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {activities.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No recent activity
            </p>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {format(new Date(activity.date), 'dd MMM')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Upcoming Events</h2>
            <Link
              href="/dashboard/events"
              className="text-sm text-orange-600 hover:text-orange-700 flex items-center"
            >
              View all
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 mb-3">
                No upcoming events
              </p>
              <Link
                href="/events"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Browse events →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((reg: any) => (
                <div
                  key={reg.id}
                  className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {reg.events?.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {reg.events?.start_date ? format(new Date(reg.events.start_date), 'EEEE, dd MMM yyyy') : 'Date TBD'}
                      </p>
                      {reg.events?.location && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          📍 {reg.events.location}
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      reg.status === 'confirmed'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {reg.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Impact Summary */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
        <div className="flex items-center mb-4">
          <Star className="w-6 h-6 text-green-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Impact</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.eventsAttended}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Events Participated</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.booksIssued}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Books Borrowed</p>
          </div>
        </div>
      </div>
    </div>
  )
}
