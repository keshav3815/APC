'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { 
  MessageSquare, Search, Eye, Trash2, Mail, Phone, Clock,
  X, Loader2, CheckCircle, AlertCircle, Reply, Archive
} from 'lucide-react'

interface ContactInquiry {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: string
  admin_notes?: string
  created_at: string
  updated_at: string
}

export default function AdminContactPage() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchInquiries()
  }, [])

  const fetchInquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_inquiries')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setInquiries(data || [])
    } catch (error: any) {
      toast.error('Failed to fetch inquiries')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: string, notes?: string) => {
    try {
      const updateData: any = { status }
      if (notes !== undefined) {
        updateData.admin_notes = notes
      }

      const { error } = await supabase
        .from('contact_inquiries')
        .update(updateData)
        .eq('id', id)

      if (error) throw error
      toast.success('Status updated')
      fetchInquiries()
      
      if (showDetailsModal && selectedInquiry?.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status, admin_notes: notes || selectedInquiry.admin_notes })
      }
    } catch (error: any) {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return

    try {
      const { error } = await supabase
        .from('contact_inquiries')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Inquiry deleted')
      setShowDetailsModal(false)
      fetchInquiries()
    } catch (error: any) {
      toast.error('Failed to delete inquiry')
    }
  }

  const openDetailsModal = (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry)
    setAdminNotes(inquiry.admin_notes || '')
    setShowDetailsModal(true)
    
    // Mark as read if new
    if (inquiry.status === 'new') {
      handleUpdateStatus(inquiry.id, 'read')
    }
  }

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || inquiry.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: inquiries.length,
    new: inquiries.filter(i => i.status === 'new').length,
    read: inquiries.filter(i => i.status === 'read').length,
    replied: inquiries.filter(i => i.status === 'replied').length,
    resolved: inquiries.filter(i => i.status === 'resolved').length,
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      read: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      replied: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    }
    return styles[status] || styles.new
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Inquiries</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage and respond to contact form submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-gray-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.new}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">New</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.read}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Read</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Reply className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.replied}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Replied</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.resolved}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="resolved">Resolved</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Inquiries List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {filteredInquiries.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No inquiries found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredInquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                  inquiry.status === 'new' ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                }`}
                onClick={() => openDetailsModal(inquiry)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 dark:text-white">{inquiry.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(inquiry.status)}`}>
                        {inquiry.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{inquiry.email}</p>
                    <p className="font-medium text-gray-900 dark:text-white mt-2">{inquiry.subject}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">{inquiry.message}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(inquiry.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(inquiry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Inquiry Details</h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedInquiry.status)}`}>
                  {selectedInquiry.status}
                </span>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Contact Info */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{selectedInquiry.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${selectedInquiry.email}`} className="text-primary-600 hover:underline">
                      {selectedInquiry.email}
                    </a>
                  </div>
                  {selectedInquiry.phone && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${selectedInquiry.phone}`} className="text-primary-600 hover:underline">
                        {selectedInquiry.phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                    <Clock className="w-4 h-4" />
                    {new Date(selectedInquiry.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Subject</h3>
                <p className="text-gray-900 dark:text-white font-medium">{selectedInquiry.subject}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Message</h3>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{selectedInquiry.message}</p>
              </div>

              {/* Admin Notes */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Admin Notes</h3>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => window.open(`mailto:${selectedInquiry.email}?subject=Re: ${selectedInquiry.subject}`)}
                  className="inline-flex items-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                >
                  <Reply className="w-4 h-4 mr-2" />
                  Reply via Email
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedInquiry.id, 'replied', adminNotes)}
                  className="inline-flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Replied
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedInquiry.id, 'resolved', adminNotes)}
                  className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Resolved
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedInquiry.id, 'archived', adminNotes)}
                  className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </button>
                <button
                  onClick={() => handleDelete(selectedInquiry.id)}
                  className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm ml-auto"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
