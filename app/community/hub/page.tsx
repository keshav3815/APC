'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import {
  MessageCircle, Plus, Search, ArrowLeft, ThumbsUp,
  CheckCircle2, Send, Loader2, GraduationCap, Users,
  Sparkles, BookOpen, HelpCircle, Megaphone, FolderOpen, X,
  MessagesSquare, MessageSquare,
} from 'lucide-react'
import toast from 'react-hot-toast'
import GroupChat from '@/components/community/GroupChat'
import MemberList from '@/components/community/MemberList'
import DMChat from '@/components/community/DMChat'

interface Post {
  id: string
  author_id: string
  author_type: 'student' | 'member'
  author_name: string
  title: string
  content: string
  category: string
  is_answered: boolean
  upvotes: number
  created_at: string
  reply_count?: number
}

interface Reply {
  id: string
  post_id: string
  author_id: string
  author_type: 'student' | 'member'
  author_name: string
  content: string
  is_best_answer: boolean
  upvotes: number
  created_at: string
}

interface CommunityUser {
  id: string
  name: string
  type: 'student' | 'member'
  role?: string
  college?: string
  profession?: string
}

const CATEGORIES = [
  { value: 'all', label: 'All', icon: FolderOpen },
  { value: 'doubt', label: 'Doubts', icon: HelpCircle },
  { value: 'discussion', label: 'Discussion', icon: MessageCircle },
  { value: 'resource', label: 'Resources', icon: BookOpen },
  { value: 'announcement', label: 'Announcements', icon: Megaphone },
]

type ActiveTab = 'forum' | 'group-chat' | 'dms'

export default function CommunityHub() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewPost, setShowNewPost] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [communityProfile, setCommunityProfile] = useState<{ id: string; type: 'student' | 'member'; name: string } | null>(null)
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' })
  const [activeTab, setActiveTab] = useState<ActiveTab>('forum')
  const [dmPeer, setDmPeer] = useState<CommunityUser | null>(null)

  const supabase = createClient()
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    fetchPosts()
    if (user) checkCommunityProfile()
  }, [user])

  const checkCommunityProfile = async () => {
    if (!user?.email) return

    const { data: student } = await supabase
      .from('students')
      .select('id, name')
      .eq('email', user.email)
      .eq('status', 'approved')
      .maybeSingle()

    if (student) {
      setCommunityProfile({ id: student.id, type: 'student', name: student.name })
      return
    }

    const { data: member } = await supabase
      .from('community_members')
      .select('id, name')
      .eq('email', user.email)
      .eq('status', 'approved')
      .maybeSingle()

    if (member) {
      setCommunityProfile({ id: member.id, type: 'member', name: member.name })
    }
  }

  const fetchPosts = async () => {
    try {
      const { data } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) {
        const postsWithCounts = await Promise.all(
          data.map(async (post: any) => {
            const { count } = await supabase
              .from('community_replies')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id)
            return { ...post, reply_count: count || 0 }
          })
        )
        setPosts(postsWithCounts)
      }
    } catch (err) {
      console.error('Error fetching posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchReplies = async (postId: string) => {
    const { data } = await supabase
      .from('community_replies')
      .select('*')
      .eq('post_id', postId)
      .order('is_best_answer', { ascending: false })
      .order('upvotes', { ascending: false })
      .order('created_at', { ascending: true })

    if (data) setReplies(data)
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!communityProfile) {
      toast.error('Please join the community first')
      return
    }
    setSubmitting(true)
    try {
      const { error } = await supabase.from('community_posts').insert({
        author_id: communityProfile.id,
        author_type: communityProfile.type,
        author_name: communityProfile.name,
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        category: newPost.category,
      })
      if (error) throw error
      toast.success('Post created!')
      setShowNewPost(false)
      setNewPost({ title: '', content: '', category: 'general' })
      fetchPosts()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create post')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!communityProfile || !selectedPost) return
    setSubmitting(true)
    try {
      const { error } = await supabase.from('community_replies').insert({
        post_id: selectedPost.id,
        author_id: communityProfile.id,
        author_type: communityProfile.type,
        author_name: communityProfile.name,
        content: replyContent.trim(),
      })
      if (error) throw error
      toast.success('Reply posted!')
      setReplyContent('')
      fetchReplies(selectedPost.id)
      fetchPosts()
    } catch (error: any) {
      toast.error(error.message || 'Failed to post reply')
    } finally {
      setSubmitting(false)
    }
  }

  const openPost = (post: Post) => {
    setSelectedPost(post)
    fetchReplies(post.id)
  }

  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'doubt': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'discussion': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'resource': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'announcement': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
    }
  }

  const TABS = [
    { id: 'forum' as ActiveTab, label: 'Forum', icon: MessageCircle },
    { id: 'group-chat' as ActiveTab, label: 'Group Chat', icon: MessagesSquare },
    { id: 'dms' as ActiveTab, label: 'Direct Messages', icon: MessageSquare },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href="/community"
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-2 text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Community
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-primary-600" />
              Community Hub
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Chat, discuss & connect with fellow members</p>
          </div>
          {communityProfile && (
            <div className="hidden sm:flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-2 rounded-xl">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                {communityProfile.name}
              </span>
              <span className="text-xs text-green-600 dark:text-green-500 capitalize bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                {communityProfile.type}
              </span>
            </div>
          )}
        </div>

        {/* Auth/join banners */}
        {!user && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <Link href="/auth/signin" className="underline font-semibold">Sign in</Link> and join the community to chat and participate.
            </p>
          </div>
        )}
        {!communityProfile && user && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Join the community</strong> to access group chat, direct messages, and discussions.{' '}
              <Link href="/community/join" className="underline font-semibold">Join Now</Link>
            </p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6 shadow-sm">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setDmPeer(null) }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* === TAB: GROUP CHAT === */}
        {activeTab === 'group-chat' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            {communityProfile ? (
              <GroupChat profile={communityProfile} />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <MessagesSquare className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
                <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Join the community to chat</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">You need to be a member or student to use group chat.</p>
                <Link href="/community/join" className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors">
                  Join Now
                </Link>
              </div>
            )}
          </div>
        )}

        {/* === TAB: DMS === */}
        {activeTab === 'dms' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            {communityProfile ? (
              dmPeer ? (
                <DMChat
                  profile={communityProfile}
                  peer={dmPeer}
                  onBack={() => setDmPeer(null)}
                />
              ) : (
                <MemberList
                  profile={communityProfile}
                  onSelectUser={(user) => setDmPeer(user)}
                />
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <MessageSquare className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
                <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Join the community to send direct messages</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">You need to be a member or student to use DMs.</p>
                <Link href="/community/join" className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors">
                  Join Now
                </Link>
              </div>
            )}
          </div>
        )}

        {/* === TAB: FORUM === */}
        {activeTab === 'forum' && (
          <>
            {/* Search & Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search posts..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => setActiveCategory(cat.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        activeCategory === cat.value
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* New Post Button */}
            {communityProfile && (
              <button
                onClick={() => setShowNewPost(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all mb-6"
              >
                <Plus className="w-5 h-5" /> New Post
              </button>
            )}

            {/* Posts List */}
            {loading ? (
              <div className="text-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No posts yet. Be the first to start a discussion!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPosts.map(post => (
                  <button
                    key={post.id}
                    onClick={() => openPost(post)}
                    className="w-full text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getCategoryColor(post.category)}`}>
                            {post.category}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-xs ${post.author_type === 'member' ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'}`}>
                            {post.author_type === 'member' ? <Users className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                            {post.author_type}
                          </span>
                          {post.is_answered && (
                            <span className="text-green-600 dark:text-green-400 text-xs font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Answered
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">{post.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                          <span>{post.author_name}</span>
                          <span>{timeAgo(post.created_at)}</span>
                          <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {post.reply_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* New Post Modal */}
        {showNewPost && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Post</h2>
                <button onClick={() => setShowNewPost(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="general">General</option>
                    <option value="doubt">Doubt / Question</option>
                    <option value="discussion">Discussion</option>
                    <option value="resource">Resource</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="What's your question or topic?"
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Content *</label>
                  <textarea
                    required
                    rows={5}
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="Describe your question or share your thoughts..."
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 flex items-center justify-center"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Post'}
                  </button>
                  <button type="button" onClick={() => setShowNewPost(false)} className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Post Detail Modal */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getCategoryColor(selectedPost.category)}`}>
                    {selectedPost.category}
                  </span>
                  <span className="text-xs text-gray-400">{timeAgo(selectedPost.created_at)}</span>
                </div>
                <button onClick={() => setSelectedPost(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedPost.title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
                <span className={selectedPost.author_type === 'member' ? 'text-purple-600' : 'text-blue-600'}>
                  {selectedPost.author_type === 'member' ? '🎓' : '📚'} {selectedPost.author_name}
                </span>
                <span>·</span>
                <span className="capitalize">{selectedPost.author_type}</span>
              </p>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedPost.content}</p>
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" /> Replies ({replies.length})
              </h3>
              <div className="space-y-3 mb-6">
                {replies.map(reply => (
                  <div
                    key={reply.id}
                    className={`p-4 rounded-xl border ${
                      reply.is_best_answer
                        ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }`}
                  >
                    {reply.is_best_answer && (
                      <span className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1 mb-2">
                        <CheckCircle2 className="w-3 h-3" /> Best Answer
                      </span>
                    )}
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">{reply.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className={reply.author_type === 'member' ? 'text-purple-500' : 'text-blue-500'}>
                        {reply.author_name} ({reply.author_type})
                      </span>
                      <span>{timeAgo(reply.created_at)}</span>
                    </div>
                  </div>
                ))}
                {replies.length === 0 && (
                  <p className="text-center text-gray-400 py-6 text-sm">No replies yet. Be the first to respond!</p>
                )}
              </div>

              {communityProfile ? (
                <form onSubmit={handleReply} className="flex gap-3">
                  <input
                    type="text"
                    required
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your reply..."
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="submit"
                    disabled={submitting || !replyContent.trim()}
                    className="px-5 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              ) : (
                <p className="text-center text-sm text-gray-400 py-4">
                  <Link href="/community/join" className="text-primary-600 dark:text-primary-400 font-semibold underline">Join the community</Link> to reply
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
