'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  BookOpen,
  Search,
  Loader2,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format, differenceInDays } from 'date-fns'
import Link from 'next/link'

interface BookIssue {
  id: string
  issue_date: string
  due_date: string
  return_date: string | null
  fine_amount: number
  fine_paid: boolean
  book: {
    id: string
    title: string
    author: string
    accession_number: string
    cover_image: string | null
    category: string
  }
}

export default function MyBooks() {
  const { profile } = useAuth()
  const [issues, setIssues] = useState<BookIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'returned'>('all')
  const [patronId, setPatronId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (profile?.email) {
      fetchPatronAndBooks()
    }
  }, [profile?.email])

  const fetchPatronAndBooks = async () => {
    setLoading(true)

    // First, find patron by email
    const { data: patron } = await supabase
      .from('library_patrons')
      .select('id')
      .eq('email', profile?.email)
      .single()

    if (!patron) {
      setLoading(false)
      return
    }

    setPatronId(patron.id)

    // Fetch book issues
    const { data, error } = await supabase
      .from('book_issues')
      .select(`
        id,
        issue_date,
        due_date,
        return_date,
        fine_amount,
        fine_paid,
        book:books(
          id,
          title,
          author,
          accession_number,
          cover_image,
          category
        )
      `)
      .eq('patron_id', patron.id)
      .order('issue_date', { ascending: false })

    if (!error && data) {
      setIssues(data as unknown as BookIssue[])
    }
    setLoading(false)
  }

  // Filter issues
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.book?.title?.toLowerCase().includes(search.toLowerCase()) ||
      issue.book?.author?.toLowerCase().includes(search.toLowerCase())

    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && !issue.return_date) ||
      (filter === 'returned' && issue.return_date)

    return matchesSearch && matchesFilter
  })

  const activeIssues = issues.filter((i) => !i.return_date)
  const overdueIssues = activeIssues.filter(
    (i) => new Date(i.due_date) < new Date()
  )
  const totalFines = issues
    .filter((i) => i.fine_amount > 0 && !i.fine_paid)
    .reduce((sum, i) => sum + i.fine_amount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!patronId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <BookOpen className="w-8 h-8 mr-3 text-amber-600" />
            My Books
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Track your borrowed books</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm border border-gray-100 dark:border-gray-700">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Not a Library Patron Yet
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            You need to register as a library patron to borrow books. Visit our library or contact us to get started!
          </p>
          <Link
            href="/books"
            className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Explore Library
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <BookOpen className="w-8 h-8 mr-3 text-amber-600" />
            My Books
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Track your borrowed books</p>
        </div>

        <Link
          href="/books"
          className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <BookOpen className="w-5 h-5 mr-2" />
          Browse Library
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mr-3">
              <BookOpen className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Currently Borrowed</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{activeIssues.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
              <p className="text-xl font-bold text-red-600">{overdueIssues.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Borrowed</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{issues.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mr-3">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Fines</p>
              <p className="text-xl font-bold text-orange-600">₹{totalFines}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Alert */}
      {overdueIssues.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-300">
                You have {overdueIssues.length} overdue book{overdueIssues.length > 1 ? 's' : ''}!
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                Please return them as soon as possible to avoid additional fines.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
          {(['all', 'active', 'returned'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-amber-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Books List */}
      {filteredIssues.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm border border-gray-100 dark:border-gray-700">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {issues.length === 0
              ? "You haven't borrowed any books yet"
              : 'No books match your filters'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIssues.map((issue) => {
            const isOverdue = !issue.return_date && new Date(issue.due_date) < new Date()
            const daysRemaining = !issue.return_date
              ? differenceInDays(new Date(issue.due_date), new Date())
              : null

            return (
              <div
                key={issue.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden ${
                  isOverdue
                    ? 'border-red-200 dark:border-red-800'
                    : 'border-gray-100 dark:border-gray-700'
                }`}
              >
                <div className="flex">
                  {/* Book Cover */}
                  <div className="w-24 h-32 bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                    {issue.book?.cover_image ? (
                      <img
                        src={issue.book.cover_image}
                        alt={issue.book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Book Info */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                          {issue.book?.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {issue.book?.author}
                        </p>
                      </div>
                      {issue.return_date ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Returned
                        </span>
                      ) : isOverdue ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          Overdue
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="mt-3 space-y-1 text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        Issued: {format(new Date(issue.issue_date), 'dd MMM yyyy')}
                      </div>
                      <div className={`flex items-center ${isOverdue ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'}`}>
                        <Clock className="w-4 h-4 mr-2" />
                        Due: {format(new Date(issue.due_date), 'dd MMM yyyy')}
                        {daysRemaining !== null && (
                          <span className={`ml-2 ${
                            isOverdue
                              ? 'text-red-600'
                              : daysRemaining <= 3
                              ? 'text-amber-600'
                              : 'text-green-600'
                          }`}>
                            ({isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`})
                          </span>
                        )}
                      </div>
                      {issue.return_date && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Returned: {format(new Date(issue.return_date), 'dd MMM yyyy')}
                        </div>
                      )}
                      {issue.fine_amount > 0 && (
                        <div className="flex items-center text-orange-600">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Fine: ₹{issue.fine_amount}
                          {!issue.fine_paid && (
                            <span className="ml-1 text-red-600">(Unpaid)</span>
                          )}
                        </div>
                      )}
                    </div>
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
