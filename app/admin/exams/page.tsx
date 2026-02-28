'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import {
  GraduationCap, Plus, Search, Edit2, Trash2, Eye, X, Loader2,
  Globe, FileText, MapPin, Calendar, Building2, ChevronDown, Save,
  ToggleLeft, ToggleRight, Download,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface Exam {
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
  is_active: boolean
  created_at: string
}

const EMPTY_FORM = {
  exam_name: '',
  organization: '',
  level: 'Central' as 'Central' | 'State',
  state: '',
  description: '',
  eligibility: '',
  qualification: '',
  age_limit: '',
  application_start_date: '',
  application_last_date: '',
  exam_date: '',
  official_website: '',
  notification_pdf: '',
  application_fee: '',
  selection_process: '',
  status: 'Open' as 'Open' | 'Closed' | 'Coming Soon',
  is_active: true,
}

const STATUS_CLASSES = {
  'Open': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Closed': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'Coming Soon': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
]

export default function AdminExamsPage() {
  const supabase = createClient()
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [formData, setFormData] = useState({ ...EMPTY_FORM })
  const [stats, setStats] = useState({ total: 0, open: 0, central: 0, state: 0 })

  useEffect(() => { fetchExams() }, [])

  const fetchExams = async () => {
    setLoading(true)
    try {
      let q = supabase.from('exams').select('*').order('created_at', { ascending: false })
      const { data, error } = await q
      if (error) throw error
      const list = (data || []) as Exam[]
      setExams(list)
      setStats({
        total: list.length,
        open: list.filter(e => e.status === 'Open' && e.is_active).length,
        central: list.filter(e => e.level === 'Central').length,
        state: list.filter(e => e.level === 'State').length,
      })
    } catch (err: any) {
      toast.error('Failed to fetch exams: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditingExam(null)
    setFormData({ ...EMPTY_FORM })
    setShowModal(true)
  }

  const openEdit = (exam: Exam) => {
    setEditingExam(exam)
    setFormData({
      exam_name: exam.exam_name,
      organization: exam.organization,
      level: exam.level,
      state: exam.state || '',
      description: exam.description || '',
      eligibility: exam.eligibility || '',
      qualification: exam.qualification || '',
      age_limit: exam.age_limit || '',
      application_start_date: exam.application_start_date || '',
      application_last_date: exam.application_last_date || '',
      exam_date: exam.exam_date || '',
      official_website: exam.official_website || '',
      notification_pdf: exam.notification_pdf || '',
      application_fee: exam.application_fee || '',
      selection_process: exam.selection_process || '',
      status: exam.status,
      is_active: exam.is_active,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.exam_name.trim() || !formData.organization.trim()) {
      toast.error('Exam name and organization are required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...formData,
        state: formData.level === 'State' ? formData.state : null,
        application_start_date: formData.application_start_date || null,
        application_last_date: formData.application_last_date || null,
        exam_date: formData.exam_date || null,
        description: formData.description || null,
        eligibility: formData.eligibility || null,
        qualification: formData.qualification || null,
        age_limit: formData.age_limit || null,
        official_website: formData.official_website || null,
        notification_pdf: formData.notification_pdf || null,
        application_fee: formData.application_fee || null,
        selection_process: formData.selection_process || null,
      }
      if (editingExam) {
        const { error } = await supabase.from('exams').update(payload).eq('id', editingExam.id)
        if (error) throw error
        toast.success('Exam updated successfully')
      } else {
        const { error } = await supabase.from('exams').insert(payload)
        if (error) throw error
        toast.success('Exam created successfully')
      }
      setShowModal(false)
      fetchExams()
    } catch (err: any) {
      toast.error('Failed to save exam: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (exam: Exam) => {
    if (!confirm(`Delete "${exam.exam_name}"? This cannot be undone.`)) return
    try {
      const { error } = await supabase.from('exams').delete().eq('id', exam.id)
      if (error) throw error
      toast.success('Exam deleted')
      fetchExams()
    } catch (err: any) {
      toast.error('Failed to delete: ' + err.message)
    }
  }

  const handleToggleActive = async (exam: Exam) => {
    try {
      const { error } = await supabase.from('exams').update({ is_active: !exam.is_active }).eq('id', exam.id)
      if (error) throw error
      toast.success(exam.is_active ? 'Exam hidden from students' : 'Exam visible to students')
      fetchExams()
    } catch { toast.error('Failed to toggle visibility') }
  }

  const handleStatusChange = async (exam: Exam, status: Exam['status']) => {
    try {
      const { error } = await supabase.from('exams').update({ status }).eq('id', exam.id)
      if (error) throw error
      toast.success(`Status updated to ${status}`)
      fetchExams()
    } catch { toast.error('Failed to update status') }
  }

  const field = (key: keyof typeof formData, value: any) =>
    setFormData(prev => ({ ...prev, [key]: value }))

  // Filtering
  const filtered = exams.filter(e => {
    const matchSearch = !searchTerm ||
      e.exam_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.organization.toLowerCase().includes(searchTerm.toLowerCase())
    const matchLevel = !levelFilter || e.level === levelFilter
    const matchStatus = !statusFilter || e.status === statusFilter
    return matchSearch && matchLevel && matchStatus
  })

  const formatDate = (d: string | null) => {
    if (!d) return '—'
    try { return format(new Date(d), 'dd MMM yyyy') } catch { return d }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-6 h-6 text-orange-200" />
              <h1 className="text-2xl font-bold">Competitive Exam Hub</h1>
            </div>
            <p className="text-orange-100 text-sm">Manage all competitive exams shown to students.</p>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-orange-700 rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-lg">
            <Plus className="w-5 h-5" />
            Add New Exam
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          {[
            { label: 'Total Exams', value: stats.total, color: 'bg-white/15' },
            { label: 'Applications Open', value: stats.open, color: 'bg-green-500/30' },
            { label: 'Central', value: stats.central, color: 'bg-blue-500/30' },
            { label: 'State', value: stats.state, color: 'bg-purple-500/30' },
          ].map(s => (
            <div key={s.label} className={`${s.color} backdrop-blur-sm rounded-xl p-3`}>
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-white/70 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search exams…"
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400">
          <option value="">All Levels</option>
          <option value="Central">Central</option>
          <option value="State">State</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400">
          <option value="">All Status</option>
          <option value="Open">Open</option>
          <option value="Coming Soon">Coming Soon</option>
          <option value="Closed">Closed</option>
        </select>
        {(searchTerm || levelFilter || statusFilter) && (
          <button onClick={() => { setSearchTerm(''); setLevelFilter(''); setStatusFilter('') }}
            className="flex items-center gap-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors">
            <X className="w-4 h-4" />Clear
          </button>
        )}
        <span className="text-sm text-gray-400 ml-auto">{filtered.length} exams</span>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <GraduationCap className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No exams found.</p>
            <button onClick={openCreate} className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors">
              Add First Exam
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  {['Exam', 'Level / State', 'Last Date', 'Exam Date', 'Status', 'Visible', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {filtered.map(exam => (
                  <tr key={exam.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-semibold text-gray-900 dark:text-white line-clamp-1">{exam.exam_name}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[220px]">{exam.organization}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full w-fit ${
                          exam.level === 'Central'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}>{exam.level}</span>
                        {exam.state && <span className="text-xs text-gray-400">{exam.state}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-red-600 dark:text-red-400 font-medium">
                      {formatDate(exam.application_last_date)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {formatDate(exam.exam_date)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={exam.status}
                        onChange={e => handleStatusChange(exam, e.target.value as Exam['status'])}
                        className={`px-2 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-400 ${STATUS_CLASSES[exam.status]}`}
                      >
                        <option value="Open">Open</option>
                        <option value="Coming Soon">Coming Soon</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggleActive(exam)}
                        className={`transition-colors ${exam.is_active ? 'text-green-500 hover:text-green-600' : 'text-gray-300 hover:text-gray-400'}`}
                        title={exam.is_active ? 'Click to hide from students' : 'Click to make visible'}>
                        {exam.is_active
                          ? <ToggleRight className="w-7 h-7" />
                          : <ToggleLeft className="w-7 h-7" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Link href={`/exams/${exam.id}`} target="_blank"
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Preview">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button onClick={() => openEdit(exam)}
                          className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(exam)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============== ADD / EDIT MODAL ============== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingExam ? 'Edit Exam' : 'Add New Exam'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {editingExam ? `Editing: ${editingExam.exam_name}` : 'Fill in all details for the new exam'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Section: Basic Info */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Exam Name *
                    </label>
                    <input value={formData.exam_name} onChange={e => field('exam_name', e.target.value)}
                      required placeholder="e.g. UPSC Civil Services Examination 2026"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Organization *
                    </label>
                    <input value={formData.organization} onChange={e => field('organization', e.target.value)}
                      required placeholder="e.g. Union Public Service Commission (UPSC)"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exam Level *</label>
                    <select value={formData.level} onChange={e => field('level', e.target.value as 'Central' | 'State')}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                      <option value="Central">Central</option>
                      <option value="State">State</option>
                    </select>
                  </div>
                  {formData.level === 'State' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State *</label>
                      <select value={formData.state} onChange={e => field('state', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                        <option value="">Select State</option>
                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status *</label>
                    <select value={formData.status} onChange={e => field('status', e.target.value as typeof formData.status)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                      <option value="Open">Open</option>
                      <option value="Coming Soon">Coming Soon</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section: Dates */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Important Dates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: 'application_start_date' as const, label: 'Application Start Date' },
                    { key: 'application_last_date' as const, label: 'Application Last Date' },
                    { key: 'exam_date' as const, label: 'Exam Date' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                      <input type="date" value={formData[key]} onChange={e => field(key, e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Section: Eligibility */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" /> Eligibility
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">General Eligibility</label>
                    <textarea value={formData.eligibility} onChange={e => field('eligibility', e.target.value)}
                      rows={2} placeholder="General eligibility criteria…"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Education Qualification</label>
                    <input value={formData.qualification} onChange={e => field('qualification', e.target.value)}
                      placeholder="e.g. Bachelor's Degree in Any Discipline"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age Limit</label>
                    <input value={formData.age_limit} onChange={e => field('age_limit', e.target.value)}
                      placeholder="e.g. 21–32 years (relaxation for SC/ST)"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application Fee</label>
                    <input value={formData.application_fee} onChange={e => field('application_fee', e.target.value)}
                      placeholder="e.g. ₹100 (Exempted for SC/ST/Female)"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Selection Process</label>
                    <input value={formData.selection_process} onChange={e => field('selection_process', e.target.value)}
                      placeholder="e.g. Prelims → Mains → Interview"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                </div>
              </div>

              {/* Section: Links */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Official Links
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Official Website</label>
                    <input value={formData.official_website} onChange={e => field('official_website', e.target.value)}
                      type="url" placeholder="https://upsc.gov.in"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Official Notification PDF URL</label>
                    <input value={formData.notification_pdf} onChange={e => field('notification_pdf', e.target.value)}
                      type="url" placeholder="https://upsc.gov.in/notifications/…pdf"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Description</label>
                <textarea value={formData.description} onChange={e => field('description', e.target.value)}
                  rows={4} placeholder="Full exam description shown on the detail page…"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
              </div>

              {/* Visible toggle */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <input type="checkbox" id="is_active" checked={formData.is_active}
                  onChange={e => field('is_active', e.target.checked)}
                  className="w-4 h-4 rounded text-orange-500 focus:ring-orange-400" />
                <label htmlFor="is_active" className="text-sm text-gray-700 dark:text-gray-300 font-medium cursor-pointer">
                  Visible to students (uncheck to hide without deleting)
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving…' : editingExam ? 'Update Exam' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
