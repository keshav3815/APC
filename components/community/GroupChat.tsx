'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Loader2, MessageCircle, Users } from 'lucide-react'
import toast from 'react-hot-toast'

interface Message {
  id: string
  sender_id: string
  sender_type: 'student' | 'member'
  sender_name: string
  content: string
  created_at: string
}

interface GroupChatProps {
  profile: { id: string; type: 'student' | 'member'; name: string }
}

export default function GroupChat({ profile }: GroupChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from('community_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(200)

    if (data) setMessages(data)
    setLoading(false)
    setTimeout(scrollToBottom, 100)
  }, [])

  useEffect(() => {
    fetchMessages()

    const channel = supabase
      .channel('group-chat')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_messages' },
        (payload: any) => {
          setMessages(prev => [...prev, payload.new as Message])
          setTimeout(scrollToBottom, 100)
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
      const { error } = await supabase.from('community_messages').insert({
        sender_id: profile.id,
        sender_type: profile.type,
        sender_name: profile.name,
        content: newMsg.trim(),
      })
      if (error) throw error
      setNewMsg('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message')
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
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 rounded-t-xl">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">Group Chat</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Everyone in the community can chat here</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-green-700 dark:text-green-400">Live</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-600">
            <MessageCircle className="w-12 h-12 mb-3" />
            <p className="font-medium">No messages yet</p>
            <p className="text-sm">Be the first to say hello!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isOwn = msg.sender_id === profile.id
            const showAvatar = i === 0 || messages[i - 1].sender_id !== msg.sender_id
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-4' : 'mt-0.5'}`}>
                {!isOwn && showAvatar && (
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(msg.sender_name)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mr-2 mt-auto`}>
                    {msg.sender_name.charAt(0).toUpperCase()}
                  </div>
                )}
                {!isOwn && !showAvatar && <div className="w-8 mr-2 flex-shrink-0" />}
                <div className={`max-w-[75%] ${isOwn ? 'order-1' : ''}`}>
                  {showAvatar && !isOwn && (
                    <div className="flex items-center gap-2 mb-0.5 ml-1">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{msg.sender_name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        msg.sender_type === 'member'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {msg.sender_type}
                      </span>
                    </div>
                  )}
                  <div className={`px-4 py-2.5 rounded-2xl ${
                    isOwn
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-md'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                  <p className={`text-[10px] mt-0.5 ${isOwn ? 'text-right' : 'text-left'} text-gray-400 mx-1`}>
                    {timeStr(msg.created_at)}
                  </p>
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
            placeholder="Type a message..."
            maxLength={2000}
            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            type="submit"
            disabled={sending || !newMsg.trim()}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </form>
    </div>
  )
}
