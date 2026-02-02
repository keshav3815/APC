'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BookOpen, Search, Plus, Edit, Trash2, Eye, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Book {
  id: string
  accession_number: string
  title: string
  author: string
  isbn: string
  publisher: string
  category: string
  status: string
  condition: string
  total_copies: number
  available_copies: number
  created_at: string
}

export default function LibrarianBooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const supabase = createClient()

  useEffect(() => {
    fetchBooks()
  }, [categoryFilter, statusFilter])

  const fetchBooks = async () => {
    try {
      let query = supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false })

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter)
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setBooks(data || [])
    } catch (error: any) {
      toast.error('Failed to fetch books')
    } finally {
      setLoading(false)
    }
  }

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.accession_number.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'borrowed':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'reserved':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Book Catalog</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage library book inventory</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Books</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{books.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
          <p className="text-2xl font-bold text-green-600">
            {books.filter((b) => b.status === 'available').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 dark:text-gray-400">Borrowed</p>
          <p className="text-2xl font-bold text-yellow-600">
            {books.filter((b) => b.status === 'borrowed').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 dark:text-gray-400">Reserved</p>
          <p className="text-2xl font-bold text-blue-600">
            {books.filter((b) => b.status === 'reserved').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title, author, ISBN, or accession number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Categories</option>
            <option value="school">School</option>
            <option value="competitive">Competitive</option>
            <option value="skill">Skill</option>
            <option value="self-help">Self Help</option>
            <option value="other">Other</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="borrowed">Borrowed</option>
            <option value="reserved">Reserved</option>
            <option value="lost">Lost</option>
            <option value="damaged">Damaged</option>
          </select>
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Accession No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Copies
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {book.accession_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{book.title}</div>
                    {book.isbn && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">ISBN: {book.isbn}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {book.author || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {book.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(book.status)}`}>
                      {book.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {book.available_copies} / {book.total_copies}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No books found</p>
          </div>
        )}
      </div>
    </div>
  )
}
