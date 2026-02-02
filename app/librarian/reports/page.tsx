'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileText, Download, Calendar, TrendingUp, BookOpen, Users, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface Stats {
  totalBooks: number
  totalPatrons: number
  activeIssues: number
  overdueBooks: number
  booksIssued: number
  booksReturned: number
}

export default function LibrarianReportsPage() {
  const [stats, setStats] = useState<Stats>({
    totalBooks: 0,
    totalPatrons: 0,
    activeIssues: 0,
    overdueBooks: 0,
    booksIssued: 0,
    booksReturned: 0,
  })
  const [loading, setLoading] = useState(true)
  const [reportType, setReportType] = useState('overview')
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [
        { data: books },
        { data: patrons },
        { data: activeIssues },
        { data: allIssues },
      ] = await Promise.all([
        supabase.from('books').select('*'),
        supabase.from('library_patrons').select('*'),
        supabase.from('book_issues').select('*').is('return_date', null),
        supabase.from('book_issues').select('*'),
      ])

      const today = new Date()
      const overdue = activeIssues?.filter((issue: any) => new Date(issue.due_date) < today) || []

      const thisMonth = new Date()
      thisMonth.setDate(1)
      const issued = allIssues?.filter((issue: any) => new Date(issue.issue_date) >= thisMonth) || []
      const returned = allIssues?.filter(
        (issue: any) => issue.return_date && new Date(issue.return_date) >= thisMonth
      ) || []

      setStats({
        totalBooks: books?.length || 0,
        totalPatrons: patrons?.length || 0,
        activeIssues: activeIssues?.length || 0,
        overdueBooks: overdue.length,
        booksIssued: issued.length,
        booksReturned: returned.length,
      })
    } catch (error: any) {
      toast.error('Failed to fetch statistics')
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    toast.success('Report export feature coming soon!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Library Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">View and export library statistics</p>
        </div>
        <button
          onClick={exportReport}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex space-x-2">
          <button
            onClick={() => setReportType('overview')}
            className={`px-4 py-2 rounded-lg ${
              reportType === 'overview'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setReportType('circulation')}
            className={`px-4 py-2 rounded-lg ${
              reportType === 'circulation'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}
          >
            Circulation
          </button>
          <button
            onClick={() => setReportType('inventory')}
            className={`px-4 py-2 rounded-lg ${
              reportType === 'inventory'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}
          >
            Inventory
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Books</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalBooks}</p>
            </div>
            <BookOpen className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Patrons</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalPatrons}</p>
            </div>
            <Users className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Issues</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeIssues}</p>
            </div>
            <FileText className="w-12 h-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overdue Books</p>
              <p className="text-3xl font-bold text-red-600">{stats.overdueBooks}</p>
            </div>
            <Calendar className="w-12 h-12 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Books Issued (This Month)</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.booksIssued}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Books Returned (This Month)</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.booksReturned}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-500" />
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {reportType === 'overview' && 'Library Overview'}
          {reportType === 'circulation' && 'Circulation Report'}
          {reportType === 'inventory' && 'Inventory Report'}
        </h2>

        <div className="space-y-4">
          {reportType === 'overview' && (
            <div className="text-gray-600 dark:text-gray-400">
              <p>
                The library currently has <strong>{stats.totalBooks}</strong> books in its collection with{' '}
                <strong>{stats.totalPatrons}</strong> registered patrons.
              </p>
              <p className="mt-2">
                There are <strong>{stats.activeIssues}</strong> active book issues, with{' '}
                <strong className="text-red-600">{stats.overdueBooks}</strong> books overdue for return.
              </p>
              <p className="mt-2">
                This month, <strong>{stats.booksIssued}</strong> books were issued and{' '}
                <strong>{stats.booksReturned}</strong> books were returned.
              </p>
            </div>
          )}

          {reportType === 'circulation' && (
            <div className="text-gray-600 dark:text-gray-400">
              <p>Circulation statistics for {format(new Date(), 'MMMM yyyy')}:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Books Issued: {stats.booksIssued}</li>
                <li>Books Returned: {stats.booksReturned}</li>
                <li>Currently Borrowed: {stats.activeIssues}</li>
                <li>Overdue: {stats.overdueBooks}</li>
              </ul>
            </div>
          )}

          {reportType === 'inventory' && (
            <div className="text-gray-600 dark:text-gray-400">
              <p>Current library inventory:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Total Books: {stats.totalBooks}</li>
                <li>Books Currently Borrowed: {stats.activeIssues}</li>
                <li>Available Books: {stats.totalBooks - stats.activeIssues}</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
