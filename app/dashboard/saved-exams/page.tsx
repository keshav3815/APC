'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import ExamCard, { Exam } from '@/components/exams/ExamCard'
import Link from 'next/link'
import {
  BookmarkCheck,
  Search,
  Loader2,
  GraduationCap,
  Bell,
  BellRing,
  Trash2,
  Trophy,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function SavedExamsPage() {
  const { user } = useAuth()
  const supabase = createClient()

  const [savedExams, setSavedExams] = useState<Exam[]>([])
  const [savedExamIds, setSavedExamIds] = useState<Set<string>>(new Set())
  const [reminderExamIds, setReminderExamIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { if (user?.id) fetchSavedExams() }, [user?.id])

  const fetchSavedExams = async () => {
    setLoading(true)
    try {
      const [savedRes, reminderRes] = await Promise.all([
        supabase
          .from('saved_exams')
          .select('exam_id, created_at, exams(*)')
          .eq('student_id', user!.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('exam_reminders')
          .select('exam_id')
          .eq('student_id', user!.id),
      ])

      if (savedRes.error) throw savedRes.error

      const exams = (savedRes.data || [])
        .map((r: any) => r.exams)
        .filter(Boolean) as Exam[]
      setSavedExams(exams)
      setSavedExamIds(new Set(exams.map(e => e.id)))
      setReminderExamIds(new Set((reminderRes.data || []).map((r: any) => r.exam_id)))
    } catch (err) {
      console.error('Error fetching saved exams:', err)
      toast.error('Failed to load saved exams')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveToggle = (examId: string, saved: boolean) => {
    if (!saved) {
      // Removed from saved — animate out
      setSavedExams(prev => prev.filter(e => e.id !== examId))
      setSavedExamIds(prev => { const n = new Set(prev); n.delete(examId); return n })
    }
  }

  const handleReminderToggle = (examId: string, set: boolean) => {
    setReminderExamIds(prev => {
      const n = new Set(prev)
      if (set) n.add(examId); else n.delete(examId)
      return n
    })
  }

  const handleClearAll = async () => {
    if (!user?.id) return
    if (!confirm('Remove all saved exams?')) return
    try {
      await supabase.from('saved_exams').delete().eq('student_id', user.id)
      setSavedExams([])
      setSavedExamIds(new Set())
      toast.success('All saved exams cleared')
    } catch { toast.error('Failed to clear saved exams') }
  }

  const filtered = savedExams.filter(e =>
    e.exam_name.toLowerCase().includes(search.toLowerCase()) ||
    e.organization.toLowerCase().includes(search.toLowerCase())
  )

  const openCount = savedExams.filter(e => e.status === 'Open').length
  const reminderCount = reminderExamIds.size

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <BookmarkCheck className="w-7 h-7 text-blue-200" />
          <h1 className="text-2xl font-bold">My Saved Exams</h1>
        </div>
        <p className="text-blue-100 text-sm">Track your bookmarked competitive exams in one place.</p>

        {/* Quick stats */}
        <div className="flex gap-4 mt-5 flex-wrap">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5 flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 text-blue-200" />
            <span className="font-bold">{savedExams.length}</span>
            <span className="text-blue-100 text-sm">Saved</span>
          </div>
          <div className="bg-green-500/30 backdrop-blur-sm rounded-xl px-4 py-2.5 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-green-200" />
            <span className="font-bold">{openCount}</span>
            <span className="text-blue-100 text-sm">Applications Open</span>
          </div>
          <div className="bg-orange-400/30 backdrop-blur-sm rounded-xl px-4 py-2.5 flex items-center gap-2">
            <BellRing className="w-4 h-4 text-orange-200" />
            <span className="font-bold">{reminderCount}</span>
            <span className="text-blue-100 text-sm">Reminders Active</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      {savedExams.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search saved exams…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>
      )}

      {/* Reminder info banner */}
      {reminderCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
          <BellRing className="w-5 h-5 text-orange-500 flex-shrink-0" />
          <p className="text-sm text-orange-700 dark:text-orange-300">
            You have <strong>{reminderCount}</strong> active reminder{reminderCount !== 1 ? 's' : ''}.
            You will be notified via email before application deadlines and exam dates.
          </p>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-3" />
          <p className="text-gray-500">Loading your saved exams…</p>
        </div>
      ) : savedExams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookmarkCheck className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No saved exams yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
            Browse the Exam Hub and click the bookmark icon on any exam to save it here.
          </p>
          <Link
            href="/exams"
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <GraduationCap className="w-4 h-4" />
            Browse Exam Hub
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No saved exams match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(exam => (
            <ExamCard
              key={exam.id}
              exam={exam}
              userId={user?.id ?? null}
              savedExamIds={savedExamIds}
              reminderExamIds={reminderExamIds}
              onSaveToggle={handleSaveToggle}
              onReminderToggle={handleReminderToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}
