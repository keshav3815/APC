'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import ExamCard, { Exam } from '@/components/exams/ExamCard'
import {
  Search,
  Filter,
  BookOpen,
  SlidersHorizontal,
  X,
  Loader2,
  GraduationCap,
  Trophy,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
]

const QUALIFICATIONS = [
  '10th Pass', '12th Pass', 'Diploma', 'Any Graduate', 'B.E./B.Tech',
  'B.Sc', 'B.Com', 'B.A', 'MBBS', 'LLB', 'MBA', 'M.Sc', 'M.Tech',
  'Any Post Graduate',
]

interface Filters {
  search: string
  level: string
  state: string
  qualification: string
  status: string
}

const DEFAULT_FILTERS: Filters = {
  search: '', level: '', state: '', qualification: '', status: '',
}

export default function ExamsPage() {
  const { user } = useAuth()
  const supabase = createClient()

  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [showFilters, setShowFilters] = useState(false)

  const [savedExamIds, setSavedExamIds] = useState<Set<string>>(new Set())
  const [reminderExamIds, setReminderExamIds] = useState<Set<string>>(new Set())

  const [stats, setStats] = useState({ total: 0, open: 0, central: 0, state: 0 })

  // Fetch exams
  const fetchExams = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('exams')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (filters.level) query = query.eq('level', filters.level)
      if (filters.state) query = query.eq('state', filters.state)
      if (filters.status) query = query.eq('status', filters.status)
      if (filters.search) query = query.ilike('exam_name', `%${filters.search}%`)
      if (filters.qualification) query = query.ilike('qualification', `%${filters.qualification}%`)

      const { data, error } = await query
      if (error) throw error

      const list = (data || []) as Exam[]
      setExams(list)
      setStats({
        total: list.length,
        open: list.filter(e => e.status === 'Open').length,
        central: list.filter(e => e.level === 'Central').length,
        state: list.filter(e => e.level === 'State').length,
      })
    } catch (err) {
      console.error('Error fetching exams:', err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Fetch user saved/reminder data
  const fetchUserData = useCallback(async () => {
    if (!user?.id) return
    const [savedRes, reminderRes] = await Promise.all([
      supabase.from('saved_exams').select('exam_id').eq('student_id', user.id),
      supabase.from('exam_reminders').select('exam_id').eq('student_id', user.id),
    ])
    if (savedRes.data) setSavedExamIds(new Set(savedRes.data.map((r: any) => r.exam_id)))
    if (reminderRes.data) setReminderExamIds(new Set(reminderRes.data.map((r: any) => r.exam_id)))
  }, [user?.id])

  useEffect(() => { fetchExams() }, [filters])
  useEffect(() => { fetchUserData() }, [user?.id])

  const handleSaveToggle = (examId: string, saved: boolean) => {
    setSavedExamIds(prev => {
      const next = new Set(prev)
      if (saved) next.add(examId); else next.delete(examId)
      return next
    })
  }

  const handleReminderToggle = (examId: string, set: boolean) => {
    setReminderExamIds(prev => {
      const next = new Set(prev)
      if (set) next.add(examId); else next.delete(examId)
      return next
    })
  }

  const clearFilters = () => setFilters(DEFAULT_FILTERS)
  const activeFilterCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-orange-600 via-red-600 to-pink-700 text-white">
        <div className="container mx-auto px-4 py-14">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-7 h-7 text-yellow-300" />
              <span className="text-yellow-200 font-semibold text-sm uppercase tracking-wider">Competitive Exam Hub</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
              Your Exam Journey<br />
              <span className="text-yellow-300">Starts Here</span>
            </h1>
            <p className="text-lg text-red-100 mb-8 max-w-xl">
              Discover Central &amp; State government exams. Save exams, set reminders, and apply directly via official portals.
            </p>

            {/* Search bar */}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search exams — UPSC, SSC, BPSC, GATE…"
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 border border-white/20 shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 text-base"
              />
              {filters.search && (
                <button onClick={() => setFilters(f => ({ ...f, search: '' }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Quick stat pills */}
          <div className="flex flex-wrap gap-3 mt-10">
            {[
              { label: 'Total Exams', value: stats.total, color: 'bg-white/20' },
              { label: 'Open Now', value: stats.open, color: 'bg-green-500/30' },
              { label: 'Central', value: stats.central, color: 'bg-blue-500/30' },
              { label: 'State', value: stats.state, color: 'bg-purple-500/30' },
            ].map(s => (
              <div key={s.label} className={`${s.color} backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2`}>
                <span className="text-white font-bold text-lg">{s.value}</span>
                <span className="text-white/80 text-sm">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filter bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 flex-1">
              {/* Level filter */}
              <select
                value={filters.level}
                onChange={e => setFilters(f => ({ ...f, level: e.target.value, state: '' }))}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="">All Levels</option>
                <option value="Central">Central</option>
                <option value="State">State</option>
              </select>

              {/* State filter — shown when State level selected */}
              {(filters.level === 'State' || !filters.level) && (
                <select
                  value={filters.state}
                  onChange={e => setFilters(f => ({ ...f, state: e.target.value, level: e.target.value ? 'State' : f.level }))}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="">All States</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              )}

              {/* Qualification filter */}
              <select
                value={filters.qualification}
                onChange={e => setFilters(f => ({ ...f, qualification: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="">All Qualifications</option>
                {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
              </select>

              {/* Status filter */}
              <select
                value={filters.status}
                onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="">All Status</option>
                <option value="Open">🟢 Open</option>
                <option value="Coming Soon">🟡 Coming Soon</option>
                <option value="Closed">🔴 Closed</option>
              </select>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>

          {/* Quick filter tabs */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {[
              { label: 'All Exams', level: '', status: '' },
              { label: '🟢 Open Now', level: '', status: 'Open' },
              { label: '🏛 Central Only', level: 'Central', status: '' },
              { label: '🗺 State Only', level: 'State', status: '' },
              { label: '🕐 Coming Soon', level: '', status: 'Coming Soon' },
            ].map(tab => (
              <button
                key={tab.label}
                onClick={() => setFilters(f => ({ ...f, level: tab.level, status: tab.status, state: '' }))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filters.level === tab.level && filters.status === tab.status
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/20 hover:text-orange-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {loading ? 'Loading…' : `Showing ${exams.length} exam${exams.length !== 1 ? 's' : ''}`}
            {activeFilterCount > 0 && <span className="text-orange-500 ml-1">(filtered)</span>}
          </p>
          <button onClick={fetchExams} className="text-sm text-gray-500 hover:text-orange-500 flex items-center gap-1 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {/* Exam grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">Loading exams…</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <GraduationCap className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No exams found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {activeFilterCount > 0 ? 'Try adjusting your filters.' : 'No exams are available right now. Check back soon!'}
            </p>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {exams.map(exam => (
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

        {/* Login CTA */}
        {!user && exams.length > 0 && (
          <div className="mt-10 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-6 text-center">
            <GraduationCap className="w-10 h-10 text-orange-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Sign in to unlock all features</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Save exams, set reminders, and get notified before deadlines.</p>
            <div className="flex gap-3 justify-center">
              <a href="/auth/signin" className="px-5 py-2.5 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors text-sm">
                Sign In
              </a>
              <a href="/auth/signup" className="px-5 py-2.5 border border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 rounded-lg font-semibold hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors text-sm">
                Create Account
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
