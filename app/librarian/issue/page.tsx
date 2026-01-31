'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  ClipboardList,
  Search,
  BookOpen,
  User,
  Calendar,
  Loader2,
  CheckCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { addDays, format } from 'date-fns'

export default function IssueBook() {
  const { profile } = useAuth()
  const [books, setBooks] = useState<any[]>([])
  const [patrons, setPatrons] = useState<any[]>([])
  const [searchBook, setSearchBook] = useState('')
  const [searchPatron, setSearchPatron] = useState('')
  const [selectedBook, setSelectedBook] = useState<any>(null)
  const [selectedPatron, setSelectedPatron] = useState<any>(null)
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 14), 'yyyy-MM-dd'))
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [issued, setIssued] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (searchBook.length >= 2) {
      searchBooks()
    } else {
      setBooks([])
    }
  }, [searchBook])

  useEffect(() => {
    if (searchPatron.length >= 2) {
      searchPatrons()
    } else {
      setPatrons([])
    }
  }, [searchPatron])

  const searchBooks = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('status', 'available')
      .or(`title.ilike.%${searchBook}%,accession_number.ilike.%${searchBook}%,author.ilike.%${searchBook}%`)
      .limit(10)

    if (!error) {
      setBooks(data || [])
    }
    setLoading(false)
  }

  const searchPatrons = async () => {
    const { data, error } = await supabase
      .from('library_patrons')
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.%${searchPatron}%,patron_id.ilike.%${searchPatron}%`)
      .limit(10)

    if (!error) {
      setPatrons(data || [])
    }
  }

  const handleIssue = async () => {
    if (!selectedBook || !selectedPatron) {
      toast.error('Please select both a book and a patron')
      return
    }

    setSubmitting(true)

    try {
      // Check if patron has reached max books limit
      const { count } = await supabase
        .from('book_issues')
        .select('*', { count: 'exact', head: true })
        .eq('patron_id', selectedPatron.id)
        .is('return_date', null)

      if ((count || 0) >= selectedPatron.max_books_allowed) {
        toast.error(`Patron has reached maximum limit of ${selectedPatron.max_books_allowed} books`)
        setSubmitting(false)
        return
      }

      // Issue the book
      const { error } = await supabase.from('book_issues').insert({
        book_id: selectedBook.id,
        patron_id: selectedPatron.id,
        issued_by: profile?.id,
        due_date: new Date(dueDate).toISOString(),
      })

      if (error) throw error

      toast.success('Book issued successfully!')
      setIssued(true)
      
      // Reset after 3 seconds
      setTimeout(() => {
        setSelectedBook(null)
        setSelectedPatron(null)
        setSearchBook('')
        setSearchPatron('')
        setIssued(false)
        setDueDate(format(addDays(new Date(), 14), 'yyyy-MM-dd'))
      }, 3000)
    } catch (error: any) {
      toast.error(error.message || 'Failed to issue book')
    } finally {
      setSubmitting(false)
    }
  }

  if (issued) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-8 text-center border border-green-200 dark:border-green-800">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-2">
            Book Issued Successfully!
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mt-4 text-left">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Book</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedBook?.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Accession No.</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedBook?.accession_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Patron</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedPatron?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Due Date</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {format(new Date(dueDate), 'dd MMM yyyy')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <ClipboardList className="w-8 h-8 mr-3 text-green-600" />
          Issue Book
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Select a book and patron to issue</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Book Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
            Select Book
          </h2>

          {selectedBook ? (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedBook.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedBook.author}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Acc. No: {selectedBook.accession_number}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBook(null)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Change
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, author, or accession no..."
                  value={searchBook}
                  onChange={(e) => setSearchBook(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {loading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              )}

              {books.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {books.map((book) => (
                    <button
                      key={book.id}
                      onClick={() => {
                        setSelectedBook(book)
                        setBooks([])
                        setSearchBook('')
                      }}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors"
                    >
                      <p className="font-medium text-gray-900 dark:text-white">{book.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {book.author} • {book.accession_number}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {searchBook.length >= 2 && !loading && books.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No available books found
                </p>
              )}
            </>
          )}
        </div>

        {/* Patron Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-purple-600" />
            Select Patron
          </h2>

          {selectedPatron ? (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedPatron.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ID: {selectedPatron.patron_id}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Max Books: {selectedPatron.max_books_allowed}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPatron(null)}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  Change
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or patron ID..."
                  value={searchPatron}
                  onChange={(e) => setSearchPatron(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {patrons.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {patrons.map((patron) => (
                    <button
                      key={patron.id}
                      onClick={() => {
                        setSelectedPatron(patron)
                        setPatrons([])
                        setSearchPatron('')
                      }}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors"
                    >
                      <p className="font-medium text-gray-900 dark:text-white">{patron.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ID: {patron.patron_id} • {patron.email}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {searchPatron.length >= 2 && patrons.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No patrons found
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Due Date & Submit */}
      {selectedBook && selectedPatron && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              onClick={handleIssue}
              disabled={submitting}
              className="px-8 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Issuing...
                </>
              ) : (
                <>
                  <ClipboardList className="w-5 h-5 mr-2" />
                  Issue Book
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
