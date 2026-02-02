'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { 
  Users, Search, Eye, Trash2, Mail, Phone, MapPin, Clock,
  X, Loader2, CheckCircle, XCircle, UserCheck, Download, Calendar
} from 'lucide-react'

interface VolunteerApplication {
  id: string
  name: string
  email: string
  phone: string
  city: string
  skills: string[]
  interests: string[]
  availability: string
  experience: string | null
  status: string
  admin_notes?: string
  created_at: string
}

export default function AdminVolunteersPage() {
  const [applications, setApplications] = useState<VolunteerApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedApp, setSelectedApp] = useState<VolunteerApplication | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    skills: '',
    interests: '',
    availability: '',
    experience: ''
  })
  const supabase = createClient()

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('volunteer_applications')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setApplications(data || [])
    } catch (error: any) {
      toast.error('Failed to fetch applications')
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
        .from('volunteer_applications')
        .update(updateData)
        .eq('id', id)

      if (error) throw error
      toast.success('Application updated')
      fetchApplications()
      
      if (showDetailsModal && selectedApp?.id === id) {
        setSelectedApp({ ...selectedApp, status, admin_notes: notes || selectedApp.admin_notes })
      }
    } catch (error: any) {
      toast.error('Failed to update application')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return

    try {
      const { error } = await supabase
        .from('volunteer_applications')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Application deleted')
      setShowDetailsModal(false)
      fetchApplications()
    } catch (error: any) {
      toast.error('Failed to delete application')
    }
  }

  const handleAddVolunteer = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('volunteer_applications')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          city: formData.city || null,
          skills: formData.skills || null,
          interests: formData.interests || null,
          availability: formData.availability || null,
          experience: formData.experience || null,
          status: 'pending'
        })

      if (error) throw error
      
      toast.success('Volunteer application added successfully')
      setShowAddModal(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        city: '',
        skills: '',
        interests: '',
        availability: '',
        experience: ''
      })
      fetchApplications()
    } catch (error: any) {
      toast.error('Failed to add application')
    }
  }

  const openDetailsModal = (app: VolunteerApplication) => {
    setSelectedApp(app)
    setAdminNotes(app.admin_notes || '')
    setShowDetailsModal(true)
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.city.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      reviewing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      onboarded: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    }
    return styles[status] || styles.pending
  }

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'City', 'Skills', 'Interests', 'Availability', 'Status', 'Applied On']
    const rows = filteredApplications.map(a => [
      a.name,
      a.email,
      a.phone,
      a.city,
      Array.isArray(a.skills) ? a.skills.join('; ') : a.skills,
      Array.isArray(a.interests) ? a.interests.join('; ') : a.interests,
      a.availability,
      a.status,
      new Date(a.created_at).toLocaleDateString()
    ])
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `volunteers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Volunteer Applications</h1>
          <p className="text-gray-600 dark:text-gray-400">Review and manage volunteer applications</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <UserCheck className="w-5 h-5 mr-2" />
            Add Volunteer
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-gray-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Applications</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Review</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.approved}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.rejected}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Rejected</p>
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
            placeholder="Search by name, email, or city..."
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
          <option value="pending">Pending</option>
          <option value="reviewing">Reviewing</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="onboarded">Onboarded</option>
        </select>
      </div>

      {/* Applications Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Skills</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Availability</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Applied</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredApplications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{app.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{app.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-1" />
                      {app.city}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(app.skills) ? app.skills : [app.skills]).slice(0, 2).map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                      {Array.isArray(app.skills) && app.skills.length > 2 && (
                        <span className="text-xs text-gray-500">+{app.skills.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {app.availability}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(app.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openDetailsModal(app)}
                        className="p-1 text-gray-600 hover:text-primary-600 dark:text-gray-400"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {app.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'approved')}
                            className="p-1 text-gray-600 hover:text-green-600 dark:text-gray-400"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'rejected')}
                            className="p-1 text-gray-600 hover:text-red-600 dark:text-gray-400"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="p-1 text-gray-600 hover:text-red-600 dark:text-gray-400"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredApplications.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No applications found
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Application Details</h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedApp.status)}`}>
                  {selectedApp.status}
                </span>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Personal Info */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedApp.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">City</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedApp.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <a href={`mailto:${selectedApp.email}`} className="text-primary-600 hover:underline">
                      {selectedApp.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                    <a href={`tel:${selectedApp.phone}`} className="text-primary-600 hover:underline">
                      {selectedApp.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Skills & Interests */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(selectedApp.skills) ? selectedApp.skills : [selectedApp.skills]).map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(selectedApp.interests) ? selectedApp.interests : [selectedApp.interests]).map((interest, i) => (
                      <span key={i} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded text-sm">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Availability</h3>
                <p className="text-gray-600 dark:text-gray-400">{selectedApp.availability}</p>
              </div>

              {/* Experience */}
              {selectedApp.experience && (
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Previous Experience</h3>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{selectedApp.experience}</p>
                </div>
              )}

              {/* Applied On */}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                Applied on {new Date(selectedApp.created_at).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
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
                  onClick={() => window.open(`mailto:${selectedApp.email}?subject=Your Volunteer Application at APC`)}
                  className="inline-flex items-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Applicant
                </button>
                {selectedApp.status !== 'approved' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedApp.id, 'approved', adminNotes)}
                    className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </button>
                )}
                {selectedApp.status === 'approved' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedApp.id, 'onboarded', adminNotes)}
                    className="inline-flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Mark Onboarded
                  </button>
                )}
                {selectedApp.status !== 'rejected' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedApp.id, 'rejected', adminNotes)}
                    className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedApp.id)}
                  className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm ml-auto"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Volunteer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Volunteer Application</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddVolunteer} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Skills
                </label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g. Teaching, Counseling"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Interests
                </label>
                <input
                  type="text"
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  placeholder="e.g. Education, Community Service"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Availability
                </label>
                <textarea
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  placeholder="e.g. Weekends, Evenings"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Experience
                </label>
                <textarea
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="Previous volunteer or relevant experience"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  Add Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
