'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import {
  BookOpen,
  Users,
  ClipboardList,
  RotateCcw,
  AlertCircle,
  ArrowRight,
  Calendar,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface LibraryStats {
  totalBooks: number
  availableBooks: number
  borrowedBooks: number
  totalPatrons: number
  activeIssues: number
  overdueBooks: number
}

export default function LibrarianDashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<LibraryStats | null>(null)
  const [recentIssues, setRecentIssues] = useState<any[]>([])
  const [overdueIssues, setOverdueIssues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const supabase = createClient()

    try {
      // Fetch counts
      const [
        { data: books },
        { count: patronsCount },
        { data: activeIssues },
      ] = await Promise.all([
        supabase.from('books').select('status'),
        supabase.from('library_patrons').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('book_issues').select(`
          *,
          books:book_id(title, accession_number),
          patrons:patron_id(name, patron_id)
        `).is('return_date', null),
      ])

      const totalBooks = books?.length || 0
      const availableBooks = books?.filter((b: any) => b.status === 'available').length || 0
      const borrowedBooks = books?.filter((b: any) => b.status === 'borrowed').length || 0

      // Find overdue books
      const today = new Date()
      const overdue = activeIssues?.filter((issue: any) => new Date(issue.due_date) < today) || []

      setStats({
        totalBooks,
        availableBooks,
        borrowedBooks,
        totalPatrons: patronsCount || 0,
        activeIssues: activeIssues?.length || 0,
        overdueBooks: overdue.length,
      })

      setRecentIssues(activeIssues?.slice(0, 5) || [])
      setOverdueIssues(overdue.slice(0, 5))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    { href: '/librarian/issue', label: 'Issue Book', icon: ClipboardList, color: 'blue' },
    { href: '/librarian/returns', label: 'Return Book', icon: RotateCcw, color: 'green' },
    { href: '/librarian/books', label: 'Add Book', icon: BookOpen, color: 'purple' },
    { href: '/librarian/patrons', label: 'Add Patron', icon: Users, color: 'orange' },
  ]

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome, {profile?.full_name || 'Librarian'}!</h1>
        <p className="text-green-100">Manage your library efficiently. Here's today's overview.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`flex flex-col items-center p-4 rounded-xl transition-colors ${colorClasses[action.color]}`}
          >
            <action.icon className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Books</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalBooks || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
          <p className="text-2xl font-bold text-green-600">{stats?.availableBooks || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Borrowed</p>
          <p className="text-2xl font-bold text-yellow-600">{stats?.borrowedBooks || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Patrons</p>
          <p className="text-2xl font-bold text-blue-600">{stats?.totalPatrons || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Issues</p>
          <p className="text-2xl font-bold text-purple-600">{stats?.activeIssues || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
          <p className="text-2xl font-bold text-red-600">{stats?.overdueBooks || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Books Alert */}
        {overdueIssues.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Overdue Books ({overdueIssues.length})
            </h2>
            <div className="space-y-3">
              {overdueIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {issue.books?.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Borrowed by: {issue.patrons?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-red-600 font-medium">
                      Due: {new Date(issue.due_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/librarian/returns"
              className="mt-4 inline-flex items-center text-red-600 hover:text-red-700 font-medium"
            >
              View all overdue
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        )}

        {/* Recent Issues */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-green-600" />
            Recent Issues
          </h2>
          {recentIssues.length > 0 ? (
            <div className="space-y-3">
              {recentIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {issue.books?.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {issue.patrons?.name} • {issue.patrons?.patron_id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(issue.issue_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Due: {new Date(issue.due_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No active issues</p>
            </div>
          )}
        </div>

        {/* Empty state for overdue if none */}
        {overdueIssues.length === 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">All Clear!</h3>
            <p className="text-green-600 dark:text-green-400">No overdue books</p>
          </div>
        )}
      </div>
    </div>
  )
}
