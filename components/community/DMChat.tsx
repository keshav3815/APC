'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Loader2, ArrowLeft, MessageSquare, Check, CheckCheck } from 'lucide-react'
import toast from 'react-hot-toast'

interface DM {
  id: string
  sender_id: string
  sender_type: string
  sender_name: string
  receiver_id: string
  receiver_type: string
  receiver_name: string
  content: string
  is_read: boolean
  created_at: string
}

interface DMChatProps {
  profile: { id: string; type: 'student' | 'member'; name: string }
  peer: { id: string; name: string; type: 'student' | 'member' }
  onBack: () => void
}

export default function DMChat({ profile, peer, onBack }: DMChatProps) {
  const [messages, setMessages] = useState<DM[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = useCallback(async () => {
    // Fetch all DMs between profile and peer
    const { data } = await supabase
      .from('community_dm')
      .select('*')
      .or(
        `and(sender_id.eq.${profile.id},receiver_id.eq.${peer.id}),and(sender_id.eq.${peer.id},receiver_id.eq.${profile.id})`
      )
      .order('created_at', { ascending: true })
      .limit(500)

    if (data) {
      setMessages(data)

      // Mark unread messages from peer as read
      const unread = data.filter((m: any) => m.receiver_id === profile.id && !m.is_read)
      if (unread.length > 0) {
        await supabase
          .from('community_dm')
          .update({ is_read: true })
          .eq('sender_id', peer.id)
          .eq('receiver_id', profile.id)
          .eq('is_read', false)
      }
    }
    setLoading(false)
    setTimeout(scrollToBottom, 100)
  }, [profile.id, peer.id])

  useEffect(() => {
    fetchMessages()

    const channel = supabase
      .channel(`dm-${[profile.id, peer.id].sort().join('-')}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_dm' },
        (payload: any) => {
          const msg = payload.new as DM
          // Only show messages for this conversation
          if (
            (msg.sender_id === profile.id && msg.receiver_id === peer.id) ||
            (msg.sender_id === peer.id && msg.receiver_id === profile.id)
          ) {
            setMessages(prev => [...prev, msg])
            setTimeout(scrollToBottom, 100)

            // Mark as read if received
            if (msg.receiver_id === profile.id && !msg.is_read) {
              supabase
                .from('community_dm')
                .update({ is_read: true })
                .eq('id', msg.id)
                .then()
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'community_dm' },
        (payload: any) => {
          const updated = payload.new as DM
          setMessages(prev => prev.map(m => m.id === updated.id ? updated : m))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchMessages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMsg.trim() || sending) return
    setSending(true)

    try {
      const { error } = await supabase.from('community_dm').insert({
        sender_id: profile.id,
        sender_type: profile.type,
        sender_name: profile.name,
        receiver_id: peer.id,
        receiver_type: peer.type,
        receiver_name: peer.name,
        content: newMsg.trim(),
      })
      if (error) throw error
      setNewMsg('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  const timeStr = (d: string) => {
    const date = new Date(d)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    if (isToday) return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) + ' ' +
      date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

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
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-800 rounded-t-xl">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/50 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(peer.name)} flex items-center justify-center text-white font-bold text-sm`}>
          {peer.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">{peer.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{peer.type}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50 dark:bg-gray-900/50">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <MessageSquare className="w-12 h-12 mb-3" />
            <p className="font-medium">Start a conversation</p>
            <p className="text-sm">Say hello to {peer.name}!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isOwn = msg.sender_id === profile.id
            const showAvatar = i === 0 || messages[i - 1].sender_id !== msg.sender_id
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-3' : 'mt-0.5'}`}>
                {!isOwn && showAvatar && (
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getAvatarColor(msg.sender_name)} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mr-2 mt-auto`}>
                    {msg.sender_name.charAt(0).toUpperCase()}
                  </div>
                )}
                {!isOwn && !showAvatar && <div className="w-7 mr-2 flex-shrink-0" />}
                <div className="max-w-[75%]">
                  <div className={`px-4 py-2.5 rounded-2xl ${
                    isOwn
                      ? 'bg-purple-600 text-white rounded-br-md'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-md'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                  <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'justify-end' : 'justify-start'} mx-1`}>
                    <span className="text-[10px] text-gray-400">{timeStr(msg.created_at)}</span>
                    {isOwn && (
                      msg.is_read
                        ? <CheckCheck className="w-3 h-3 text-blue-400" />
                        : <Check className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-xl">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            placeholder={`Message ${peer.name}...`}
            maxLength={2000}
            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
          <button
            type="submit"
            disabled={sending || !newMsg.trim()}
            className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </form>
    </div>
  )
}
