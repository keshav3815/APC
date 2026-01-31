'use client'

import { useEffect, useState } from 'react'
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface Patron {
  id: string
  patron_id: string
  name: string
  email: string
  phone: string | null
  address: string | null
  membership_type: string
  membership_start: string
  membership_end: string | null
  max_books_allowed: number
  is_active: boolean
  created_at: string
  books_issued?: number
}

export default function Patrons() {
  const [patrons, setPatrons] = useState<Patron[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editPatron, setEditPatron] = useState<Patron | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const supabase = createClient()

  // Form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    membership_type: 'regular',
    max_books_allowed: 3,
    is_active: true,
  })

  useEffect(() => {
    fetchPatrons()
  }, [])

  const fetchPatrons = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('library_patrons')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      // Fetch issued books count for each patron
      const patronsWithCount = await Promise.all(
        data.map(async (patron) => {
          const { count } = await supabase
            .from('book_issues')
            .select('*', { count: 'exact', head: true })
            .eq('patron_id', patron.id)
            .is('return_date', null)

          return { ...patron, books_issued: count || 0 }
        })
      )
      setPatrons(patronsWithCount)
    }
    setLoading(false)
  }

  const openAddModal = () => {
    setEditPatron(null)
    setForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      membership_type: 'regular',
      max_books_allowed: 3,
      is_active: true,
    })
    setShowModal(true)
  }

  const openEditModal = (patron: Patron) => {
    setEditPatron(patron)
    setForm({
      name: patron.name,
      email: patron.email,
      phone: patron.phone || '',
      address: patron.address || '',
      membership_type: patron.membership_type,
      max_books_allowed: patron.max_books_allowed,
      is_active: patron.is_active,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (editPatron) {
        const { error } = await supabase
          .from('library_patrons')
          .update({
            name: form.name,
            email: form.email,
            phone: form.phone || null,
            address: form.address || null,
            membership_type: form.membership_type,
            max_books_allowed: form.max_books_allowed,
            is_active: form.is_active,
          })
          .eq('id', editPatron.id)

        if (error) throw error
        toast.success('Patron updated successfully')
      } else {
        // Generate patron ID
        const patronId = `PAT${Date.now().toString().slice(-6)}`
        
        const { error } = await supabase.from('library_patrons').insert({
          patron_id: patronId,
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          address: form.address || null,
          membership_type: form.membership_type,
          membership_start: new Date().toISOString(),
          max_books_allowed: form.max_books_allowed,
          is_active: form.is_active,
        })

        if (error) throw error
        toast.success('Patron added successfully')
      }

      setShowModal(false)
      fetchPatrons()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save patron')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (patron: Patron) => {
    if (!confirm(`Are you sure you want to delete ${patron.name}?`)) return
    
    setDeleting(patron.id)

    try {
      // Check if patron has any active issues
      const { count } = await supabase
        .from('book_issues')
        .select('*', { count: 'exact', head: true })
        .eq('patron_id', patron.id)
        .is('return_date', null)

      if ((count || 0) > 0) {
        toast.error('Cannot delete patron with active book issues')
        return
      }

      const { error } = await supabase
        .from('library_patrons')
        .delete()
        .eq('id', patron.id)

      if (error) throw error

      toast.success('Patron deleted successfully')
      setPatrons(patrons.filter((p) => p.id !== patron.id))
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete patron')
    } finally {
      setDeleting(null)
    }
  }

  const toggleActive = async (patron: Patron) => {
    try {
      const { error } = await supabase
        .from('library_patrons')
        .update({ is_active: !patron.is_active })
        .eq('id', patron.id)

      if (error) throw error

      toast.success(`Patron ${patron.is_active ? 'deactivated' : 'activated'} successfully`)
      setPatrons(
        patrons.map((p) =>
          p.id === patron.id ? { ...p, is_active: !p.is_active } : p
        )
      )
    } catch (error: any) {
      toast.error(error.message || 'Failed to update patron')
    }
  }

  const filteredPatrons = patrons.filter((patron) => {
    const matchesSearch =
      patron.name.toLowerCase().includes(search.toLowerCase()) ||
      patron.patron_id.toLowerCase().includes(search.toLowerCase()) ||
      patron.email.toLowerCase().includes(search.toLowerCase())

    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && patron.is_active) ||
      (filter === 'inactive' && !patron.is_active)

    return matchesSearch && matchesFilter
  })

  const activeCount = patrons.filter((p) => p.is_active).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Users className="w-8 h-8 mr-3 text-purple-600" />
            Patrons Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage library members</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Patron
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-3">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Patrons</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{patrons.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3">
              <ToggleRight className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
              <p className="text-xl font-bold text-green-600">{activeCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-3">
              <ToggleLeft className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Inactive</p>
              <p className="text-xl font-bold text-gray-600">{patrons.length - activeCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Books Issued</p>
              <p className="text-xl font-bold text-blue-600">
                {patrons.reduce((sum, p) => sum + (p.books_issued || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, ID, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Patrons Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : filteredPatrons.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm border border-gray-100 dark:border-gray-700">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No patrons found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Patron</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Contact</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Membership</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Books</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredPatrons.map((patron) => (
                  <tr key={patron.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">{patron.name}</p>
                      <p className="text-sm text-gray-500">ID: {patron.patron_id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4 mr-1" />
                        {patron.email}
                      </div>
                      {patron.phone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="w-4 h-4 mr-1" />
                          {patron.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 capitalize">
                        {patron.membership_type}
                      </span>
                      <p className="text-xs text-gray-500 mt-1 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Since {format(new Date(patron.membership_start), 'MMM yyyy')}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-medium ${
                        (patron.books_issued || 0) >= patron.max_books_allowed
                          ? 'text-red-600'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {patron.books_issued || 0}/{patron.max_books_allowed}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActive(patron)}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          patron.is_active
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {patron.is_active ? (
                          <>
                            <ToggleRight className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(patron)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(patron)}
                          disabled={deleting === patron.id}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deleting === patron.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editPatron ? 'Edit Patron' : 'Add New Patron'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Membership Type
                  </label>
                  <select
                    value={form.membership_type}
                    onChange={(e) => setForm({ ...form, membership_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="regular">Regular</option>
                    <option value="student">Student</option>
                    <option value="senior">Senior</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Books
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={form.max_books_allowed}
                    onChange={(e) => setForm({ ...form, max_books_allowed: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Active membership
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Patron'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
