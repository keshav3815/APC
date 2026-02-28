'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  BarChart3, Users, BookOpen, Calendar, TrendingUp,
  TrendingDown, Loader2, ArrowUp, ArrowDown, DollarSign,
  UserPlus, FileText, Activity
} from 'lucide-react'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'

interface AnalyticsData {
  users: {
    total: number
    thisMonth: number
    admins: number
    librarians: number
  }
  events: {
    total: number
    upcoming: number
    completed: number
    registrations: number
  }
  library: {
    totalBooks: number
    borrowed: number
    patrons: number
    issues: number
  }
  volunteers: {
    total: number
    approved: number
    pending: number
  }
  contacts: {
    total: number
    new: number
    resolved: number
  }
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    users: { total: 0, thisMonth: 0, admins: 0, librarians: 0 },
    events: { total: 0, upcoming: 0, completed: 0, registrations: 0 },
    library: { totalBooks: 0, borrowed: 0, patrons: 0, issues: 0 },
    volunteers: { total: 0, approved: 0, pending: 0 },
    contacts: { total: 0, new: 0, resolved: 0 }
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const startDate = subDays(new Date(), parseInt(dateRange)).toISOString()
      const monthStart = startOfMonth(new Date()).toISOString()
      const monthEnd = endOfMonth(new Date()).toISOString()

      // Fetch all data in parallel
      const [
        usersData,
        eventsData,
        booksData,
        patronsData,
        issuesData,
        volunteersData,
        contactsData,
        registrationsData
      ] = await Promise.all([
        supabase.from('profiles').select('id, role, created_at'),
        supabase.from('events').select('id, status'),
        supabase.from('books').select('id, status'),
        supabase.from('library_patrons').select('id'),
        supabase.from('book_issues').select('id, status'),
        supabase.from('volunteer_applications').select('id, status'),
        supabase.from('contact_inquiries').select('id, status, created_at'),
        supabase.from('event_registrations').select('id')
      ])

      // Process users data
      const users = (usersData.data || []) as Array<{ id: string; role: string; created_at: string }>
      const thisMonthUsers = users.filter(u => 
        new Date(u.created_at) >= new Date(monthStart) && 
        new Date(u.created_at) <= new Date(monthEnd)
      )

      // Process events data
      const events = (eventsData.data || []) as Array<{ id: string; status: string }>

      // Process library data
      const books = (booksData.data || []) as Array<{ id: string; status: string }>
      const patrons = (patronsData.data || []) as Array<{ id: string }>
      const issues = (issuesData.data || []) as Array<{ id: string; status: string }>

      // Process volunteers data
      const volunteers = (volunteersData.data || []) as Array<{ id: string; status: string }>

      // Process contacts data
      const contacts = (contactsData.data || []) as Array<{ id: string; status: string; created_at: string }>
      const recentContacts = contacts.filter(c =>
        new Date(c.created_at) >= new Date(startDate)
      )

      // Set analytics
      setAnalytics({
        users: {
          total: users.length,
          thisMonth: thisMonthUsers.length,
          admins: users.filter(u => u.role === 'admin').length,
          librarians: users.filter(u => u.role === 'librarian').length
        },
        events: {
          total: events.length,
          upcoming: events.filter(e => e.status === 'upcoming').length,
          completed: events.filter(e => e.status === 'completed').length,
          registrations: registrationsData.data?.length || 0
        },
        library: {
          totalBooks: books.length,
          borrowed: issues.filter(i => i.status === 'issued').length,
          patrons: patrons.length,
          issues: issues.length
        },
        volunteers: {
          total: volunteers.length,
          approved: volunteers.filter(v => v.status === 'approved').length,
          pending: volunteers.filter(v => v.status === 'pending').length
        },
        contacts: {
          total: contacts.length,
          new: recentContacts.filter(c => c.status === 'new').length,
          resolved: contacts.filter(c => c.status === 'resolved').length
        }
      })

      // Build recent activity
      const activity = [
        ...users.slice(0, 5).map(u => ({
          type: 'user',
          message: 'New user registered',
          date: u.created_at,
          icon: UserPlus
        })),
        ...contacts.slice(0, 5).map(c => ({
          type: 'contact',
          message: 'New contact inquiry',
          date: c.created_at,
          icon: FileText
        }))
      ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)

      setRecentActivity(activity)

    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Overview of platform metrics</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUp className="w-4 h-4" />
              {analytics.users.thisMonth}
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.users.total}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
              <Users className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <span className="flex items-center gap-1 text-sm text-teal-600">
              <ArrowUp className="w-4 h-4" />
              {analytics.volunteers.pending} pending
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.volunteers.total}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Volunteers</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm text-purple-600">
              {analytics.events.upcoming} upcoming
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.events.total}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Events</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <BookOpen className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-sm text-orange-600">
              {analytics.library.borrowed} borrowed
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.library.totalBooks}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Library Books</p>
        </div>
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Users Breakdown */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Users Breakdown
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Regular Users</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {analytics.users.total - analytics.users.admins - analytics.users.librarians}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Admins</span>
              <span className="font-medium text-gray-900 dark:text-white">{analytics.users.admins}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Librarians</span>
              <span className="font-medium text-gray-900 dark:text-white">{analytics.users.librarians}</span>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">New this month</span>
                <span className="font-medium text-green-600">{analytics.users.thisMonth}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Events Breakdown */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Events Breakdown
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Events</span>
              <span className="font-medium text-gray-900 dark:text-white">{analytics.events.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Upcoming</span>
              <span className="font-medium text-purple-600">{analytics.events.upcoming}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Completed</span>
              <span className="font-medium text-green-600">{analytics.events.completed}</span>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total Registrations</span>
                <span className="font-medium text-primary-600">{analytics.events.registrations}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Library Stats */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-600" />
            Library Stats
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Books</span>
              <span className="font-medium text-gray-900 dark:text-white">{analytics.library.totalBooks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Currently Borrowed</span>
              <span className="font-medium text-orange-600">{analytics.library.borrowed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Library Patrons</span>
              <span className="font-medium text-gray-900 dark:text-white">{analytics.library.patrons}</span>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total Issues</span>
                <span className="font-medium text-primary-600">{analytics.library.issues}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Volunteers Stats */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-600" />
            Volunteers
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Applications</span>
              <span className="font-medium text-gray-900 dark:text-white">{analytics.volunteers.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Approved</span>
              <span className="font-medium text-green-600">{analytics.volunteers.approved}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Pending Review</span>
              <span className="font-medium text-yellow-600">{analytics.volunteers.pending}</span>
            </div>
          </div>
        </div>

        {/* Contact Inquiries Stats */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-600" />
            Contact Inquiries
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Inquiries</span>
              <span className="font-medium text-gray-900 dark:text-white">{analytics.contacts.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">New/Unread</span>
              <span className="font-medium text-red-600">{analytics.contacts.new}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Resolved</span>
              <span className="font-medium text-green-600">{analytics.contacts.resolved}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary-600" />
          Recent Activity
        </h3>
        {recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'user' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  activity.type === 'donation' ? 'bg-green-100 dark:bg-green-900/30' :
                  'bg-purple-100 dark:bg-purple-900/30'
                }`}>
                  <activity.icon className={`w-4 h-4 ${
                    activity.type === 'user' ? 'text-blue-600' :
                    activity.type === 'donation' ? 'text-green-600' :
                    'text-purple-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(activity.date), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No recent activity</p>
        )}
      </div>
    </div>
  )
}
