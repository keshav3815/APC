'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, X, Loader2, Users, Clock, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

interface PendingMember {
  id: string
  name: string
  email: string
  phone: string
  village: string
  member_type: string
  skills: string[]
  interests: string[]
  availability: string
  created_at: string
}

export default function MembersApproval() {
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    village: '',
    member_type: 'volunteer',
    skills: '',
    interests: '',
    availability: ''
  })
  const supabase = createClient()

  useEffect(() => {
    fetchPendingMembers()

    // Set up real-time subscription for members
    const membersSubscription = supabase
      .channel('members-changes-admin')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'members' },
        (payload: any) => {
          console.log('Members changed in admin:', payload)
          fetchPendingMembers() // Refetch pending members when table changes
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      membersSubscription.unsubscribe()
    }
  }, [])

  const fetchPendingMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('is_approved', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPendingMembers(data || [])
    } catch (error) {
      console.error('Error fetching pending members:', error)
      toast.error('Failed to load pending members')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    setProcessing(id)
    try {
      const { error } = await supabase
        .from('members')
        .update({ is_approved: true })
        .eq('id', id)

      if (error) throw error

      toast.success('Member approved successfully!')
      setPendingMembers(prev => prev.filter(m => m.id !== id))
    } catch (error) {
      console.error('Error approving member:', error)
      toast.error('Failed to approve member')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (id: string) => {
    setProcessing(id)
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Member request rejected')
      setPendingMembers(prev => prev.filter(m => m.id !== id))
    } catch (error) {
      console.error('Error rejecting member:', error)
      toast.error('Failed to reject member')
    } finally {
      setProcessing(null)
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing('add')
    try {
      const { error } = await supabase
        .from('members')
        .insert({
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone || null,
          village: formData.village || null,
          member_type: formData.member_type,
          skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : null,
          interests: formData.interests ? formData.interests.split(',').map(s => s.trim()) : null,
          availability: formData.availability || null,
          role: 'member',
          is_active: false
        })

      if (error) throw error

      toast.success('Member request added successfully!')
      setShowModal(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        village: '',
        member_type: 'volunteer',
        skills: '',
        interests: '',
        availability: ''
      })
      fetchPendingMembers()
    } catch (error) {
      console.error('Error adding member:', error)
      toast.error('Failed to add member')
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Community Member Requests</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and approve new member applications
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">{pendingMembers.length} Pending</span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Member
          </button>
        </div>
      </div>

      {/* Pending Members List */}
      {pendingMembers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No pending member requests</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {member.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Type</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {member.member_type}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.phone || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Village</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.village || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Applied</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(member.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {member.skills && member.skills.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {member.skills.map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded-md"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {member.interests && member.interests.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Interests</p>
                      <div className="flex flex-wrap gap-2">
                        {member.interests.map((interest: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs rounded-md"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {member.availability && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Availability</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {member.availability}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleApprove(member.id)}
                    disabled={processing === member.id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing === member.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(member.id)}
                    disabled={processing === member.id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Member Request</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
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
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Village/City
                  </label>
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Member Type *
                  </label>
                  <select
                    required
                    value={formData.member_type}
                    onChange={(e) => setFormData({ ...formData, member_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="volunteer">Volunteer</option>
                    <option value="donor">Donor</option>
                    <option value="mentor">Mentor</option>
                    <option value="student">Student</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="e.g. Teaching, Counseling"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Interests (comma-separated)
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
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
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
                  disabled={processing === 'add'}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing === 'add' ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</>
                  ) : (
                    <>Add Member</>
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
