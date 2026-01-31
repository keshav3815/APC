'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  RotateCcw,
  Search,
  BookOpen,
  User,
  Calendar,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { format, differenceInDays } from 'date-fns'

interface BookIssue {
  id: string
  issue_date: string
  due_date: string
  book: {
    id: string
    title: string
    author: string
    accession_number: string
  }
  patron: {
    id: string
    name: string
    patron_id: string
    email: string
  }
}

export default function Returns() {
  const { profile } = useAuth()
  const [issues, setIssues] = useState<BookIssue[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [returning, setReturning] = useState<string | null>(null)
  const [returned, setReturned] = useState<BookIssue | null>(null)
  const [fineAmount, setFineAmount] = useState(0)

  const supabase = createClient()
  const FINE_PER_DAY = 5 // ₹5 per day fine

  useEffect(() => {
    fetchIssuedBooks()
  }, [])

  const fetchIssuedBooks = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('book_issues')
      .select(`
        id,
        issue_date,
        due_date,
        book:books(id, title, author, accession_number),
        patron:library_patrons(id, name, patron_id, email)
      `)
      .is('return_date', null)
      .order('due_date', { ascending: true })

    if (!error && data) {
      setIssues(data as unknown as BookIssue[])
    }
    setLoading(false)
  }

  const calculateFine = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const daysOverdue = differenceInDays(today, due)
    return daysOverdue > 0 ? daysOverdue * FINE_PER_DAY : 0
  }

  const handleReturn = async (issue: BookIssue) => {
    setReturning(issue.id)
    const fine = calculateFine(issue.due_date)

    try {
      const { error } = await supabase
        .from('book_issues')
        .update({
          return_date: new Date().toISOString(),
          fine_amount: fine,
          fine_paid: false,
        })
        .eq('id', issue.id)

      if (error) throw error

      setFineAmount(fine)
      setReturned(issue)
      toast.success('Book returned successfully!')
      
      // Remove from list
      setIssues(issues.filter((i) => i.id !== issue.id))
      
      // Reset after 5 seconds
      setTimeout(() => {
        setReturned(null)
        setFineAmount(0)
      }, 5000)
    } catch (error: any) {
      toast.error(error.message || 'Failed to return book')
    } finally {
      setReturning(null)
    }
  }

  const filteredIssues = issues.filter(
    (issue) =>
      issue.book?.title?.toLowerCase().includes(search.toLowerCase()) ||
      issue.book?.accession_number?.toLowerCase().includes(search.toLowerCase()) ||
      issue.patron?.name?.toLowerCase().includes(search.toLowerCase()) ||
      issue.patron?.patron_id?.toLowerCase().includes(search.toLowerCase())
  )

  const overdueIssues = filteredIssues.filter(
    (issue) => new Date(issue.due_date) < new Date()
  )
  const activeIssues = filteredIssues.filter(
    (issue) => new Date(issue.due_date) >= new Date()
  )

  if (returned) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-8 text-center border border-green-200 dark:border-green-800">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-2">
            Book Returned Successfully!
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mt-4 text-left">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Book</p>
                <p className="font-medium text-gray-900 dark:text-white">{returned.book?.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Accession No.</p>
                <p className="font-medium text-gray-900 dark:text-white">{returned.book?.accession_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Patron</p>
                <p className="font-medium text-gray-900 dark:text-white">{returned.patron?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Return Date</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {format(new Date(), 'dd MMM yyyy')}
                </p>
              </div>
            </div>
            {fineAmount > 0 && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-amber-800 dark:text-amber-300 font-medium">
                  Fine Amount: ₹{fineAmount}
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Book was {Math.floor(fineAmount / FINE_PER_DAY)} days overdue
                </p>
              </div>
            )}
          </div>
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
            <RotateCcw className="w-8 h-8 mr-3 text-blue-600" />
            Book Returns
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Process book returns and calculate fines</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by book, patron..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 w-64"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Issued</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{issues.length}</p>
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
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">On Time</p>
              <p className="text-xl font-bold text-green-600">{activeIssues.length}</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm border border-gray-100 dark:border-gray-700">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No books currently issued</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overdue Books */}
          {overdueIssues.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-red-600 mb-3 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Overdue Books ({overdueIssues.length})
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-200 dark:border-red-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-red-50 dark:bg-red-900/20">
                      <tr>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Book</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Patron</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Due Date</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Fine</th>
                        <th className="text-right px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {overdueIssues.map((issue) => {
                        const fine = calculateFine(issue.due_date)
                        const daysOverdue = differenceInDays(new Date(), new Date(issue.due_date))
                        return (
                          <tr key={issue.id} className="hover:bg-red-50/50 dark:hover:bg-red-900/10">
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-900 dark:text-white">{issue.book?.title}</p>
                              <p className="text-sm text-gray-500">{issue.book?.accession_number}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-gray-900 dark:text-white">{issue.patron?.name}</p>
                              <p className="text-sm text-gray-500">{issue.patron?.patron_id}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-red-600 font-medium">
                                {format(new Date(issue.due_date), 'dd MMM yyyy')}
                              </p>
                              <p className="text-sm text-red-500">{daysOverdue} days overdue</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-red-600 font-bold">₹{fine}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleReturn(issue)}
                                disabled={returning === issue.id}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center"
                              >
                                {returning === issue.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <RotateCcw className="w-4 h-4 mr-1" />
                                    Return
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Active Issues */}
          {activeIssues.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                Active Issues ({activeIssues.length})
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Book</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Patron</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Issue Date</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Due Date</th>
                        <th className="text-right px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {activeIssues.map((issue) => {
                        const daysRemaining = differenceInDays(new Date(issue.due_date), new Date())
                        return (
                          <tr key={issue.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-900 dark:text-white">{issue.book?.title}</p>
                              <p className="text-sm text-gray-500">{issue.book?.accession_number}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-gray-900 dark:text-white">{issue.patron?.name}</p>
                              <p className="text-sm text-gray-500">{issue.patron?.patron_id}</p>
                            </td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                              {format(new Date(issue.issue_date), 'dd MMM yyyy')}
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-gray-900 dark:text-white">
                                {format(new Date(issue.due_date), 'dd MMM yyyy')}
                              </p>
                              <p className={`text-sm ${daysRemaining <= 3 ? 'text-amber-600' : 'text-green-600'}`}>
                                {daysRemaining} days remaining
                              </p>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleReturn(issue)}
                                disabled={returning === issue.id}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center"
                              >
                                {returning === issue.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <RotateCcw className="w-4 h-4 mr-1" />
                                    Return
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
