'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, X, Loader2, Users, Clock } from 'lucide-react'
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
  const [loading, setLoading] = useStateGET https://apc.freequademy.com/ 404 (Not Found)
Navigated to https://apc.freequademy.com/
apc.freequademy.com/:1  GET https://apc.freequademy.com/ 404 (Not Found)
Navigated to https://apc.freequademy.com/(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchPendingMembers()
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
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Clock className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">{pendingMembers.length} Pending</span>
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
    </div>
  )
}
