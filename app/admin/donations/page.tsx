'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { 
  Heart, Search, Filter, Eye, Download, TrendingUp, TrendingDown,
  X, Loader2, CheckCircle, Clock, XCircle, IndianRupee, Calendar
} from 'lucide-react'

interface Donation {
  id: string
  donor_name: string
  donor_email: string
  donor_phone: string
  amount: number
  donation_type: string
  purpose: string
  payment_method: string
  status: string
  transaction_id?: string
  created_at: string
}

interface Campaign {
  id: string
  title: string
  raised_amount: number
  target_amount: number
  status: string
}

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    donor_name: '',
    donor_email: '',
    donor_phone: '',
    amount: '',
    donation_type: 'one-time',
    purpose: 'education',
    payment_method: 'upi',
    transaction_id: ''
  })
  const supabase = createClient()

  useEffect(() => {
    fetchDonations()
    fetchCampaigns()
  }, [])

  const fetchDonations = async () => {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDonations(data || [])
    } catch (error: any) {
      toast.error('Failed to fetch donations')
    } finally {
      setLoading(false)
    }
  }

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, title, raised_amount, target_amount, status')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCampaigns(data || [])
    } catch (error: any) {
      console.error('Failed to fetch campaigns')
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('donations')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      toast.success('Donation status updated')
      fetchDonations()
      if (showDetailsModal && selectedDonation?.id === id) {
        setSelectedDonation({ ...selectedDonation, status })
      }
    } catch (error: any) {
      toast.error('Failed to update status')
    }
  }

  const handleAddDonation = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('donations')
        .insert({
          donor_name: formData.donor_name,
          donor_email: formData.donor_email,
          donor_phone: formData.donor_phone,
          amount: parseFloat(formData.amount),
          donation_type: formData.donation_type,
          purpose: formData.purpose,
          payment_method: formData.payment_method,
          transaction_id: formData.transaction_id || null,
          status: 'completed'
        })

      if (error) throw error
      
      toast.success('Donation added successfully')
      setShowAddModal(false)
      setFormData({
        donor_name: '',
        donor_email: '',
        donor_phone: '',
        amount: '',
        donation_type: 'one-time',
        purpose: 'education',
        payment_method: 'upi',
        transaction_id: ''
      })
      fetchDonations()
    } catch (error: any) {
      toast.error('Failed to add donation')
    }
  }

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = donation.donor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.donor_email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || donation.status === statusFilter
    
    let matchesDate = true
    if (dateFilter) {
      const donationDate = new Date(donation.created_at)
      const today = new Date()
      
      if (dateFilter === 'today') {
        matchesDate = donationDate.toDateString() === today.toDateString()
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(today.setDate(today.getDate() - 7))
        matchesDate = donationDate >= weekAgo
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(today.setMonth(today.getMonth() - 1))
        matchesDate = donationDate >= monthAgo
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const stats = {
    total: donations.reduce((sum, d) => sum + (d.status === 'completed' ? d.amount : 0), 0),
    pending: donations.filter(d => d.status === 'pending').reduce((sum, d) => sum + d.amount, 0),
    thisMonth: donations.filter(d => {
      const date = new Date(d.created_at)
      const now = new Date()
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear() && d.status === 'completed'
    }).reduce((sum, d) => sum + d.amount, 0),
    count: donations.filter(d => d.status === 'completed').length
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    }
    return styles[status] || styles.pending
  }

  const exportToCSV = () => {
    const headers = ['Date', 'Donor Name', 'Email', 'Phone', 'Amount', 'Type', 'Purpose', 'Status']
    const rows = filteredDonations.map(d => [
      new Date(d.created_at).toLocaleDateString(),
      d.donor_name,
      d.donor_email,
      d.donor_phone,
      d.amount,
      d.donation_type,
      d.purpose,
      d.status
    ])
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `donations-${new Date().toISOString().split('T')[0]}.csv`
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Donations Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage all donations</p>
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
            <Heart className="w-5 h-5 mr-2" />
            Add Donation
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{stats.total.toLocaleString()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Received</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{stats.pending.toLocaleString()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{stats.thisMonth.toLocaleString()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Heart className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.count}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Donors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Summary */}
      {campaigns.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Campaigns</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {campaigns.filter(c => c.status === 'active').map((campaign) => (
              <div key={campaign.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="font-medium text-gray-900 dark:text-white text-sm">{campaign.title}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>₹{(campaign.raised_amount || 0).toLocaleString()}</span>
                    <span>₹{(campaign.target_amount || 0).toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${Math.min(((campaign.raised_amount || 0) / (campaign.target_amount || 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or email..."
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
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Donations Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Donor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Purpose</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDonations.map((donation) => (
                <tr key={donation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(donation.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{donation.donor_name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{donation.donor_email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900 dark:text-white">₹{donation.amount.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {donation.donation_type}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {donation.purpose}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(donation.status)}`}>
                      {donation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setSelectedDonation(donation); setShowDetailsModal(true); }}
                        className="p-1 text-gray-600 hover:text-primary-600 dark:text-gray-400"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {donation.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(donation.id, 'completed')}
                            className="p-1 text-gray-600 hover:text-green-600 dark:text-gray-400"
                            title="Mark Completed"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(donation.id, 'failed')}
                            className="p-1 text-gray-600 hover:text-red-600 dark:text-gray-400"
                            title="Mark Failed"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredDonations.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No donations found
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedDonation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Donation Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Donor Name</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedDonation.donor_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Email</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedDonation.donor_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Phone</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedDonation.donor_phone}</span>
              </div>
              <hr className="border-gray-200 dark:border-gray-700" />
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Amount</span>
                <span className="font-bold text-2xl text-primary-600">₹{selectedDonation.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Type</span>
                <span className="font-medium text-gray-900 dark:text-white capitalize">{selectedDonation.donation_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Purpose</span>
                <span className="font-medium text-gray-900 dark:text-white capitalize">{selectedDonation.purpose}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Payment Method</span>
                <span className="font-medium text-gray-900 dark:text-white uppercase">{selectedDonation.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status</span>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedDonation.status}
                    onChange={(e) => handleUpdateStatus(selectedDonation.id, e.target.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${getStatusBadge(selectedDonation.status)}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Date</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(selectedDonation.created_at).toLocaleString()}
                </span>
              </div>
              {selectedDonation.transaction_id && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Transaction ID</span>
                  <span className="font-mono text-sm text-gray-900 dark:text-white">{selectedDonation.transaction_id}</span>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Donation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Donation</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddDonation} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Donor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.donor_name}
                    onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Donor Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.donor_email}
                    onChange={(e) => setFormData({ ...formData, donor_email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Donor Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.donor_phone}
                    onChange={(e) => setFormData({ ...formData, donor_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Donation Type *
                  </label>
                  <select
                    required
                    value={formData.donation_type}
                    onChange={(e) => setFormData({ ...formData, donation_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="one-time">One Time</option>
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Purpose *
                  </label>
                  <select
                    required
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="education">Education</option>
                    <option value="food">Food</option>
                    <option value="health">Health</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Method *
                  </label>
                  <select
                    required
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Transaction ID
                  </label>
                  <input
                    type="text"
                    value={formData.transaction_id}
                    onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
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
                  Add Donation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
