'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, MessageSquare, GraduationCap, Users, Loader2 } from 'lucide-react'

interface CommunityUser {
  id: string
  name: string
  type: 'student' | 'member'
  role?: string
  college?: string
  profession?: string
  unread?: number
}

interface MemberListProps {
  profile: { id: string; type: 'student' | 'member'; name: string }
  onSelectUser: (user: CommunityUser) => void
  selectedUserId?: string
}

export default function MemberList({ profile, onSelectUser, selectedUserId }: MemberListProps) {
  const [members, setMembers] = useState<CommunityUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const supabase = createClient()

  useEffect(() => {
    fetchMembers()
    fetchUnreadCounts()

    // Listen for new DMs to update unread count
    const channel = supabase
      .channel('dm-unread')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_dm' },
        (payload: any) => {
          const msg = payload.new as any
          if (msg.receiver_id === profile.id && !msg.is_read) {
            setUnreadCounts(prev => ({
              ...prev,
              [msg.sender_id]: (prev[msg.sender_id] || 0) + 1,
            }))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [profile.id])

  const fetchMembers = async () => {
    try {
      // Fetch students
      const { data: students } = await supabase
        .from('students')
        .select('id, name, college')
        .eq('status', 'approved')

      // Fetch members
      const { data: communityMembers } = await supabase
        .from('community_members')
        .select('id, name, role, profession')
        .eq('status', 'approved')

      const all: CommunityUser[] = [
        ...(students || []).map((s: any) => ({
          id: s.id,
          name: s.name,
          type: 'student' as const,
          college: s.college,
        })),
        ...(communityMembers || []).map((m: any) => ({
          id: m.id,
          name: m.name,
          type: 'member' as const,
          role: m.role,
          profession: m.profession,
        })),
      ].filter(u => u.id !== profile.id) // exclude self

      setMembers(all)
    } catch (err) {
      console.error('Failed to fetch members:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCounts = async () => {
    try {
      const { data } = await supabase
        .from('community_dm')
        .select('sender_id')
        .eq('receiver_id', profile.id)
        .eq('is_read', false)

      if (data) {
        const counts: Record<string, number> = {}
        data.forEach((d: any) => {
          counts[d.sender_id] = (counts[d.sender_id] || 0) + 1
        })
        setUnreadCounts(counts)
      }
    } catch { }
  }

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.role || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.college || '').toLowerCase().includes(search.toLowerCase())
  )

  // Sort: unread first, then alphabetical
  const sorted = [...filtered].sort((a, b) => {
    const ua = unreadCounts[a.id] || 0
    const ub = unreadCounts[b.id] || 0
    if (ua !== ub) return ub - ua
    return a.name.localeCompare(b.name)
  })

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500', 'from-indigo-500 to-violet-500', 'from-teal-500 to-green-500',
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] min-h-[400px]">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-800 rounded-t-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Direct Messages</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{members.length} community members</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search members..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Member List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-2" />
            <p className="text-sm">{search ? 'No members found' : 'No other members yet'}</p>
          </div>
        ) : (
          sorted.map(user => {
            const unread = unreadCounts[user.id] || 0
            const isSelected = selectedUserId === user.id
            return (
              <button
                key={user.id}
                onClick={() => {
                  onSelectUser(user)
                  // Clear unread for this user
                  setUnreadCounts(prev => ({ ...prev, [user.id]: 0 }))
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left border-b border-gray-100 dark:border-gray-800 ${
                  isSelected ? 'bg-purple-50 dark:bg-purple-900/20 border-l-2 border-l-purple-500' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(user.name)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white text-sm truncate">{user.name}</span>
                    {unread > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
                        {unread}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {user.type === 'member' ? (
                      <Users className="w-3 h-3 text-purple-500" />
                    ) : (
                      <GraduationCap className="w-3 h-3 text-blue-500" />
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.type === 'member'
                        ? `${user.role || 'Member'}${user.profession ? ` · ${user.profession}` : ''}`
                        : `Student${user.college ? ` · ${user.college}` : ''}`
                      }
                    </span>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
