'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Check, X, Loader2, Users, GraduationCap, Clock, Search,
  Eye, CheckCircle2, XCircle, Filter, ChevronDown, Mail,
  Phone, Building2, Briefcase, Award, MapPin, Linkedin,
  Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Student {
  id: string
  name: string
  email: string
  phone: string
  college: string
  course: string
  state: string
  city: string
  interest: string
  reason: string | null
  status: string
  created_at: string
}

interface CommunityMember {
  id: string
  name: string
  email: string
  phone: string
  role: string
  profession: string
  organization: string
  experience: number
  skills: string
  linkedin: string | null
  reason: string | null
  photo_url: string | null
  status: string
  created_at: string
}

type Tab = 'pending' | 'students' | 'members'

export default function AdminCommunity() {
  const [tab, setTab] = useState<Tab>('pending')
  const [students, setStudents] = useState<Student[]>([])
  const [members, setMembers] = useState<CommunityMember[]>([])
  const [pendingMembers, setPendingMembers] = useState<CommunityMember[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<Student | CommunityMember | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchAll()
    const sub = supabase
      .channel('community-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_members' }, () => fetchAll())
      .subscribe()
    return () => { sub.unsubscribe() }
  }, [])

  const fetchAll = async () => {
    try {
      const [studentsRes, membersRes] = await Promise.all([
        supabase.from('students').select('*').order('created_at', { ascending: false }),
        supabase.from('community_members').select('*').order('created_at', { ascending: false }),
      ])

      if (studentsRes.data) setStudents(studentsRes.data)
      if (membersRes.data) {
        setMembers(membersRes.data.filter((m: any) => m.status === 'approved'))
        setPendingMembers(membersRes.data.filter((m: any) => m.status === 'pending'))
      }
    } catch (err) {
      console.error('Error fetching community data:', err)
    } finally {
      setLoading(false)
    }
  }

  const approveMember = async (id: string) => {
    setProcessing(id)
    try {
      const { error } = await supabase
        .from('community_members')
        .update({ status: 'approved' })
        .eq('id', id)
      if (error) throw error
      toast.success('Member approved!')
      fetchAll()
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve')
    } finally {
      setProcessing(null)
    }
  }

  const rejectMember = async (id: string) => {
    setProcessing(id)
    try {
      const { error } = await supabase
        .from('community_members')
        .update({ status: 'rejected' })
        .eq('id', id)
      if (error) throw error
      toast.success('Member rejected')
      fetchAll()
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject')
    } finally {
      setProcessing(null)
    }
  }

  const deleteStudent = async (id: string) => {
    if (!confirm('Remove this student?')) return
    setProcessing(id)
    try {
      const { error } = await supabase.from('students').delete().eq('id', id)
      if (error) throw error
      toast.success('Student removed')
      fetchAll()
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove')
    } finally {
      setProcessing(null)
    }
  }

  const deleteMember = async (id: string) => {
    if (!confirm('Remove this member?')) return
    setProcessing(id)
    try {
      const { error } = await supabase.from('community_members').delete().eq('id', id)
      if (error) throw error
      toast.success('Member removed')
      fetchAll()
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove')
    } finally {
      setProcessing(null)
    }
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.college.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Community Management</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage students, members & approval requests</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl">
            <span className="text-2xl font-bold text-blue-600">{students.length}</span>
            <span className="text-xs text-blue-600 ml-1">Students</span>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-xl">
            <span className="text-2xl font-bold text-purple-600">{members.length}</span>
            <span className="text-xs text-purple-600 ml-1">Members</span>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 rounded-xl">
            <span className="text-2xl font-bold text-yellow-600">{pendingMembers.length}</span>
            <span className="text-xs text-yellow-600 ml-1">Pending</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[
          { key: 'pending', label: 'Pending Approvals', icon: Clock, count: pendingMembers.length },
          { key: 'students', label: 'Students', icon: GraduationCap, count: students.length },
          { key: 'members', label: 'Approved Members', icon: Users, count: members.length },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as Tab)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              tab === t.key ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      {tab !== 'pending' && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      )}

      {/* Pending Approvals Tab */}
      {tab === 'pending' && (
        <div className="space-y-4">
          {pendingMembers.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">All caught up! No pending approvals.</p>
            </div>
          ) : (
            pendingMembers.map(member => (
              <div key={member.id} className="bg-white dark:bg-gray-800 rounded-xl border border-yellow-200 dark:border-yellow-900 p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {member.photo_url ? (
                      <img src={member.photo_url} alt={member.name} className="w-14 h-14 rounded-full object-cover border-2 border-purple-200" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold text-lg">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{member.name}</h3>
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">{member.role}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{member.email}</span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{member.phone}</span>
                        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{member.profession}</span>
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{member.organization}</span>
                        <span className="flex items-center gap-1"><Award className="w-3 h-3" />{member.experience} yrs exp</span>
                      </div>
                      {member.skills && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {member.skills.split(',').slice(0, 5).map((s, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400">
                              {s.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                      {member.reason && (
                        <p className="text-xs text-gray-400 mt-2 italic">&quot;{member.reason}&quot;</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">Applied: {formatDate(member.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => approveMember(member.id)}
                      disabled={processing === member.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {processing === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Approve
                    </button>
                    <button
                      onClick={() => rejectMember(member.id)}
                      disabled={processing === member.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Students Tab */}
      {tab === 'students' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 hidden md:table-cell">College</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 hidden lg:table-cell">Interest</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 hidden md:table-cell">Location</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Joined</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell">{student.college}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-gray-500">{student.interest}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell">{student.city}, {student.state}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(student.created_at)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteStudent(student.id)}
                        disabled={processing === student.id}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStudents.length === 0 && (
              <div className="text-center py-12 text-gray-400">No students found</div>
            )}
          </div>
        </div>
      )}

      {/* Members Tab */}
      {tab === 'members' && (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredMembers.length === 0 ? (
            <div className="md:col-span-2 text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400">No approved members yet</p>
            </div>
          ) : (
            filteredMembers.map(member => (
              <div key={member.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  {member.photo_url ? (
                    <img src={member.photo_url} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold">
                      {member.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">{member.name}</h3>
                      <button
                        onClick={() => deleteMember(member.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="inline-block px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-bold mt-1">
                      {member.role}
                    </span>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
                      <span>{member.email}</span>
                      <span>{member.profession}</span>
                      <span>{member.experience} yrs</span>
                    </div>
                    {member.linkedin && (
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-500 mt-1 hover:underline">
                        <Linkedin className="w-3 h-3" /> LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
