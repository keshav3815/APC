'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { Exam, formatDate } from '@/components/exams/ExamCard'
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Calendar,
  Building2,
  MapPin,
  GraduationCap,
  Users,
  IndianRupee,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Bell,
  BellRing,
  Loader2,
  AlertCircle,
  Globe,
  ListOrdered,
  Clock,
  Trophy,
} from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  'Open': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500' },
  'Closed': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
  'Coming Soon': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500' },
}

function InfoCard({ icon, label, value, valueClass = '' }: { icon: React.ReactNode; label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
      <div className="flex-shrink-0 mt-0.5 text-orange-500">{icon}</div>
      <div>
        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
        <p className={`text-sm font-semibold text-gray-800 dark:text-white ${valueClass}`}>{value}</p>
      </div>
    </div>
  )
}

export default function ExamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

  const [exam, setExam] = useState<Exam | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [hasReminder, setHasReminder] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settingReminder, setSettingReminder] = useState(false)

  useEffect(() => {
    if (id) fetchExam()
  }, [id])

  useEffect(() => {
    if (user?.id && exam?.id) fetchUserState()
  }, [user?.id, exam?.id])

  const fetchExam = async () => {
    const { data, error } = await supabase.from('exams').select('*').eq('id', id).single()
    if (error || !data) { setLoading(false); return }
    setExam(data as Exam)
    setLoading(false)
  }

  const fetchUserState = async () => {
    if (!user?.id || !exam?.id) return
    const [savedRes, reminderRes] = await Promise.all([
      supabase.from('saved_exams').select('id').eq('student_id', user.id).eq('exam_id', exam.id).maybeSingle(),
      supabase.from('exam_reminders').select('id').eq('student_id', user.id).eq('exam_id', exam.id).maybeSingle(),
    ])
    setIsSaved(!!savedRes.data)
    setHasReminder(!!reminderRes.data)
  }

  const handleSave = async () => {
    if (!user?.id) { toast.error('Please sign in to save exams'); return }
    setSaving(true)
    try {
      if (isSaved) {
        await supabase.from('saved_exams').delete().eq('student_id', user.id).eq('exam_id', exam!.id)
        setIsSaved(false); toast.success('Removed from saved exams')
      } else {
        await supabase.from('saved_exams').insert({ student_id: user.id, exam_id: exam!.id })
        setIsSaved(true); toast.success('Saved! View in My Exams.')
      }
    } catch { toast.error('Failed to update') } finally { setSaving(false) }
  }

  const handleReminder = async () => {
    if (!user?.id) { toast.error('Please sign in to set reminders'); return }
    setSettingReminder(true)
    try {
      if (hasReminder) {
        await supabase.from('exam_reminders').delete().eq('student_id', user.id).eq('exam_id', exam!.id)
        setHasReminder(false); toast.success('Reminder removed')
      } else {
        await supabase.from('exam_reminders').insert({ student_id: user.id, exam_id: exam!.id, reminder_type: 'both' })
        setHasReminder(true); toast.success('Reminder set! We will notify you before the application deadline and exam date.')
      }
    } catch { toast.error('Failed to update reminder') } finally { setSettingReminder(false) }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
    </div>
  )

  if (!exam) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <AlertCircle className="w-16 h-16 text-gray-300" />
      <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Exam Not Found</h2>
      <p className="text-gray-500">This exam may have been removed or the link is incorrect.</p>
      <Link href="/exams" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
        Back to Exam Hub
      </Link>
    </div>
  )

  const statusCfg = STATUS_CONFIG[exam.status]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <div className={`pt-8 pb-12 ${
        exam.status === 'Open'
          ? 'bg-gradient-to-br from-green-600 to-emerald-700'
          : exam.status === 'Closed'
          ? 'bg-gradient-to-br from-gray-600 to-gray-800'
          : 'bg-gradient-to-br from-orange-600 to-red-700'
      } text-white`}>
        <div className="container mx-auto px-4">
          <Link href="/exams" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Exam Hub
          </Link>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm`}>
                  <span className={`w-2 h-2 rounded-full ${statusCfg.dot} animate-pulse`} />
                  {exam.status}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm">
                  {exam.level}
                </span>
                {exam.state && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm">
                    <MapPin className="w-3.5 h-3.5" />
                    {exam.state}
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-black leading-tight mb-2">{exam.exam_name}</h1>
              <p className="text-white/80 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {exam.organization}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 md:items-end">
              {exam.official_website && exam.status !== 'Closed' && (
                <a
                  href={exam.official_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Apply Now
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isSaved
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                >
                  {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  {isSaved ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={handleReminder}
                  disabled={settingReminder}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    hasReminder
                      ? 'bg-orange-400 text-white hover:bg-orange-500'
                      : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                >
                  {hasReminder ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                  {hasReminder ? 'Reminders On' : 'Set Reminder'}
                </button>
              </div>
              {exam.notification_pdf && (
                <a
                  href={exam.notification_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium text-sm transition-all"
                >
                  <FileText className="w-4 h-4" />
                  Official Notification PDF
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content — left 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {exam.description && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-orange-500" />
                  About the Exam
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{exam.description}</p>
              </div>
            )}

            {/* Eligibility */}
            {(exam.eligibility || exam.qualification || exam.age_limit) && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Eligibility Criteria
                </h2>
                <div className="space-y-3">
                  {exam.eligibility && (
                    <div className="flex gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">General Eligibility</p>
                        <p className="text-sm text-gray-700 dark:text-gray-200">{exam.eligibility}</p>
                      </div>
                    </div>
                  )}
                  {exam.qualification && (
                    <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                      <GraduationCap className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Education Qualification</p>
                        <p className="text-sm text-gray-700 dark:text-gray-200">{exam.qualification}</p>
                      </div>
                    </div>
                  )}
                  {exam.age_limit && (
                    <div className="flex gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                      <Users className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">Age Limit</p>
                        <p className="text-sm text-gray-700 dark:text-gray-200">{exam.age_limit}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Selection Process */}
            {exam.selection_process && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ListOrdered className="w-5 h-5 text-orange-500" />
                  Selection Process
                </h2>
                <div className="space-y-2">
                  {exam.selection_process.split('\n').map((step, i) => {
                    const parts = step.split('→')
                    if (parts.length > 1) {
                      return (
                        <div key={i} className="flex flex-wrap items-center gap-2">
                          {parts.map((p, pi) => (
                            <span key={pi} className="flex items-center gap-2">
                              <span className="px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg text-sm text-orange-700 dark:text-orange-300 font-medium">
                                {p.trim()}
                              </span>
                              {pi < parts.length - 1 && <span className="text-gray-400">→</span>}
                            </span>
                          ))}
                        </div>
                      )
                    }
                    return <p key={i} className="text-sm text-gray-600 dark:text-gray-300">{step}</p>
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar — right 1/3 */}
          <div className="space-y-4">
            {/* Important Dates */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                Important Dates
              </h3>
              <div className="space-y-3">
                {exam.application_start_date && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Opens</span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">
                      {formatDate(exam.application_start_date)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Last Date</span>
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">
                    {formatDate(exam.application_last_date)}
                  </span>
                </div>
                {exam.exam_date && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Exam Date</span>
                    <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                      {formatDate(exam.exam_date)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                <AlertCircle className="w-5 h-5 text-blue-500" />
                Quick Info
              </h3>
              {exam.application_fee && (
                <InfoCard
                  icon={<IndianRupee className="w-4 h-4" />}
                  label="Application Fee"
                  value={exam.application_fee}
                />
              )}
              {exam.qualification && (
                <InfoCard
                  icon={<GraduationCap className="w-4 h-4" />}
                  label="Qualification"
                  value={exam.qualification}
                />
              )}
              {exam.age_limit && (
                <InfoCard
                  icon={<Clock className="w-4 h-4" />}
                  label="Age Limit"
                  value={exam.age_limit}
                />
              )}
            </div>

            {/* Official Links */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                Official Links
              </h3>
              {exam.official_website && (
                <a
                  href={exam.official_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-medium transition-colors"
                >
                  <Globe className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{exam.official_website}</span>
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 ml-auto" />
                </a>
              )}
              {exam.notification_pdf && (
                <a
                  href={exam.notification_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium transition-colors"
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  Official Notification (PDF)
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 ml-auto" />
                </a>
              )}
            </div>

            {/* Apply CTA */}
            {exam.official_website && (
              <div className={`rounded-2xl p-5 text-center ${
                exam.status === 'Open'
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                  : exam.status === 'Coming Soon'
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                {exam.status === 'Closed' ? (
                  <>
                    <p className="font-bold text-gray-600 dark:text-gray-300 mb-1">Applications Closed</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Check back for upcoming notification</p>
                  </>
                ) : (
                  <>
                    <p className="font-bold mb-1 text-sm">
                      {exam.status === 'Open' ? '✅ Applications are OPEN' : '⏳ Opening Soon'}
                    </p>
                    <p className="text-xs opacity-80 mb-3">
                      {exam.status === 'Open'
                        ? `Last date: ${formatDate(exam.application_last_date)}`
                        : `Opens: ${formatDate(exam.application_start_date)}`}
                    </p>
                    <a
                      href={exam.official_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors text-sm shadow"
                    >
                      Apply on Official Website
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
