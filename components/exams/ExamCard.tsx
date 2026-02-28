'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Calendar,
  Building2,
  MapPin,
  Clock,
  ChevronRight,
  Bell,
  BellRing,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

export interface Exam {
  id: string
  exam_name: string
  organization: string
  level: 'Central' | 'State'
  state: string | null
  description: string | null
  eligibility: string | null
  qualification: string | null
  age_limit: string | null
  application_start_date: string | null
  application_last_date: string | null
  exam_date: string | null
  official_website: string | null
  notification_pdf: string | null
  application_fee: string | null
  selection_process: string | null
  status: 'Open' | 'Closed' | 'Coming Soon'
  created_at: string
}

interface ExamCardProps {
  exam: Exam
  userId: string | null
  savedExamIds: Set<string>
  reminderExamIds: Set<string>
  onSaveToggle: (examId: string, saved: boolean) => void
  onReminderToggle: (examId: string, set: boolean) => void
}

const STATUS_CONFIG = {
  'Open': {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    dot: 'bg-green-500',
    border: 'border-green-200 dark:border-green-800',
  },
  'Closed': {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
    border: 'border-red-200 dark:border-red-800',
  },
  'Coming Soon': {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-400',
    dot: 'bg-yellow-500',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
}

const LEVEL_CONFIG = {
  'Central': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  'State': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'TBA'
  try { return format(new Date(dateStr), 'dd MMM yyyy') } catch { return dateStr }
}

export default function ExamCard({
  exam,
  userId,
  savedExamIds,
  reminderExamIds,
  onSaveToggle,
  onReminderToggle,
}: ExamCardProps) {
  const [savingState, setSavingState] = useState(false)
  const [reminderState, setReminderState] = useState(false)
  const supabase = createClient()
  const isSaved = savedExamIds.has(exam.id)
  const hasReminder = reminderExamIds.has(exam.id)
  const statusCfg = STATUS_CONFIG[exam.status]
  const levelCfg = LEVEL_CONFIG[exam.level]

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!userId) { toast.error('Please sign in to save exams'); return }
    setSavingState(true)
    try {
      if (isSaved) {
        await supabase.from('saved_exams').delete()
          .eq('student_id', userId).eq('exam_id', exam.id)
        onSaveToggle(exam.id, false)
        toast.success('Exam removed from saved')
      } else {
        await supabase.from('saved_exams').insert({ student_id: userId, exam_id: exam.id })
        onSaveToggle(exam.id, true)
        toast.success('Exam saved!')
      }
    } catch { toast.error('Failed to update saved exam') } finally { setSavingState(false) }
  }

  const handleReminder = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!userId) { toast.error('Please sign in to set reminders'); return }
    setReminderState(true)
    try {
      if (hasReminder) {
        await supabase.from('exam_reminders').delete()
          .eq('student_id', userId).eq('exam_id', exam.id)
        onReminderToggle(exam.id, false)
        toast.success('Reminder removed')
      } else {
        await supabase.from('exam_reminders').insert({
          student_id: userId, exam_id: exam.id, reminder_type: 'both'
        })
        onReminderToggle(exam.id, true)
        toast.success('Reminder set! You will be notified before deadlines.')
      }
    } catch { toast.error('Failed to update reminder') } finally { setReminderState(false) }
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border ${statusCfg.border} shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden group`}>
      {/* Top colour strip */}
      <div className={`h-1.5 w-full ${exam.status === 'Open' ? 'bg-green-500' : exam.status === 'Closed' ? 'bg-red-500' : 'bg-yellow-400'}`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              {exam.exam_name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{exam.organization}</span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={handleReminder}
              disabled={reminderState}
              title={hasReminder ? 'Remove reminder' : 'Set reminder'}
              className={`p-2 rounded-lg transition-all ${
                hasReminder
                  ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-500'
              }`}
            >
              {hasReminder ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            </button>
            <button
              onClick={handleSave}
              disabled={savingState}
              title={isSaved ? 'Remove from saved' : 'Save exam'}
              className={`p-2 rounded-lg transition-all ${
                isSaved
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-500'
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} animate-pulse`} />
            {exam.status}
          </span>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${levelCfg.bg} ${levelCfg.text}`}>
            {exam.level}
          </span>
          {exam.state && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              <MapPin className="w-3 h-3" />
              {exam.state}
            </span>
          )}
        </div>

        {/* Date info */}
        <div className="grid grid-cols-1 gap-1.5 mb-4 text-sm">
          {exam.application_start_date && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Calendar className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              <span className="text-gray-400 dark:text-gray-500 text-xs">Application Opens:</span>
              <span className="font-medium">{formatDate(exam.application_start_date)}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Clock className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            <span className="text-gray-400 dark:text-gray-500 text-xs">Last Date:</span>
            <span className="font-semibold text-red-600 dark:text-red-400">{formatDate(exam.application_last_date)}</span>
          </div>
          {exam.exam_date && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Calendar className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
              <span className="text-gray-400 dark:text-gray-500 text-xs">Exam Date:</span>
              <span className="font-medium">{formatDate(exam.exam_date)}</span>
            </div>
          )}
        </div>

        {/* Eligibility snippet */}
        {exam.eligibility && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
            <span className="font-semibold text-gray-700 dark:text-gray-300">Eligibility: </span>
            {exam.eligibility}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-auto">
          <Link
            href={`/exams/${exam.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            View Details
            <ChevronRight className="w-4 h-4" />
          </Link>
          {exam.official_website && exam.status !== 'Closed' && (
            <a
              href={exam.official_website}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${
                exam.status === 'Open'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              Apply Now
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {exam.status === 'Closed' && (
            <span className="flex-1 flex items-center justify-center py-2 px-3 bg-gray-200 dark:bg-gray-700 text-gray-400 rounded-lg text-sm cursor-not-allowed">
              Closed
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
