'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import {
  ArrowLeft, Users, Loader2, CheckCircle2, Clock,
  User, Mail, Phone, Briefcase, Building2, Award,
  Wrench, Linkedin, Camera, FileText, X
} from 'lucide-react'
import toast from 'react-hot-toast'

const ROLES = ['Mentor', 'Teacher', 'Contributor', 'Volunteer'] as const
const SKILL_SUGGESTIONS = [
  'Java', 'Python', 'JavaScript', 'Web Development', 'Data Science',
  'UPSC Coaching', 'Banking Prep', 'Mathematics', 'English', 'Science',
  'Public Speaking', 'Career Counseling', 'Content Writing', 'Graphic Design',
  'Event Management', 'Social Media', 'AI/ML', 'Mobile Development'
]

interface MemberFormProps {
  onBack: () => void
}

export default function MemberForm({ onBack }: MemberFormProps) {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [customSkill, setCustomSkill] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '' as typeof ROLES[number] | '',
    profession: '',
    organization: '',
    experience: '',
    linkedin: '',
    reason: '',
  })
  const supabase = createClient()
  const { user } = useAuth()
  const router = useRouter()

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    )
  }

  const addCustomSkill = () => {
    const skill = customSkill.trim()
    if (skill && !selectedSkills.includes(skill)) {
      setSelectedSkills(prev => [...prev, skill])
      setCustomSkill('')
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Photo must be under 2MB')
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.role) {
      toast.error('Please select a role')
      return
    }
    if (selectedSkills.length === 0) {
      toast.error('Please select at least one skill')
      return
    }
    setLoading(true)

    try {
      let photoUrl: string | null = null

      // Upload photo if provided
      if (photoFile) {
        const ext = photoFile.name.split('.').pop()
        const fileName = `member_${Date.now()}.${ext}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('community-photos')
          .upload(fileName, photoFile)

        if (uploadError) {
          console.error('Photo upload error:', uploadError)
          // Continue without photo instead of failing
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('community-photos')
            .getPublicUrl(fileName)
          photoUrl = publicUrl
        }
      }

      const { error } = await supabase.from('community_members').insert({
        user_id: user?.id || null,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        role: formData.role,
        profession: formData.profession.trim(),
        organization: formData.organization.trim(),
        experience: parseInt(formData.experience) || 0,
        skills: selectedSkills.join(', '),
        linkedin: formData.linkedin.trim() || null,
        reason: formData.reason.trim() || null,
        photo_url: photoUrl,
        status: 'pending',
      })

      if (error) {
        if (error.code === '23505') {
          toast.error('This email is already registered as a member!')
        } else {
          throw error
        }
        return
      }

      setSubmitted(true)
      toast.success('Application submitted successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="animate-fadeIn max-w-lg mx-auto text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-6">
          <Clock className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Application Submitted! 📝
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Your application is <strong className="text-yellow-600">pending admin approval</strong>.
        </p>
        <p className="text-gray-500 dark:text-gray-500 mb-8">
          You&apos;ll get full access to answer doubts, create posts, and help students once approved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/community')}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Go to Community
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors mr-4"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Member Registration</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Join as Mentor, Teacher, Contributor, or Volunteer</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 md:p-8 space-y-6">
        {/* Photo Upload */}
        <div className="flex justify-center">
          <div className="relative">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors overflow-hidden bg-gray-50 dark:bg-gray-700"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-8 h-8 text-gray-400" />
              )}
            </div>
            {photoPreview && (
              <button
                type="button"
                onClick={removePhoto}
                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <p className="text-xs text-gray-400 text-center mt-2">Profile Photo <span className="text-gray-300">(optional)</span></p>
          </div>
        </div>

        {/* Name & Email */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <User className="w-4 h-4 mr-2 text-gray-400" /> Full Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="w-4 h-4 mr-2 text-gray-400" /> Email *
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Phone & Role */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <Phone className="w-4 h-4 mr-2 text-gray-400" /> Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 9876543210"
              pattern="[0-9+\s\-]{10,15}"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <Award className="w-4 h-4 mr-2 text-gray-400" /> Role *
            </label>
            <select
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="">Select your role</option>
              {ROLES.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Profession & Organization */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <Briefcase className="w-4 h-4 mr-2 text-gray-400" /> Profession *
            </label>
            <input
              type="text"
              name="profession"
              required
              value={formData.profession}
              onChange={handleChange}
              placeholder="e.g., Software Engineer, Teacher"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <Building2 className="w-4 h-4 mr-2 text-gray-400" /> Organization / College *
            </label>
            <input
              type="text"
              name="organization"
              required
              value={formData.organization}
              onChange={handleChange}
              placeholder="Your current organization"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Experience & LinkedIn */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="w-4 h-4 mr-2 text-gray-400" /> Experience (years) *
            </label>
            <input
              type="number"
              name="experience"
              required
              min="0"
              max="50"
              value={formData.experience}
              onChange={handleChange}
              placeholder="e.g., 3"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <Linkedin className="w-4 h-4 mr-2 text-gray-400" /> LinkedIn Profile
            </label>
            <input
              type="url"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/yourname"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            <Wrench className="w-4 h-4 mr-2 text-gray-400" /> Skills * <span className="ml-2 text-xs font-normal text-gray-400">(select or add your own)</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {SKILL_SUGGESTIONS.map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedSkills.includes(skill)
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30 scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
              placeholder="Add a custom skill..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
            <button
              type="button"
              onClick={addCustomSkill}
              className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl text-sm font-semibold hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            >
              Add
            </button>
          </div>
          {selectedSkills.filter(s => !SKILL_SUGGESTIONS.includes(s)).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedSkills.filter(s => !SKILL_SUGGESTIONS.includes(s)).map(skill => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-full text-sm font-medium"
                >
                  {skill}
                  <button type="button" onClick={() => toggleSkill(skill)} className="hover:bg-purple-700 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Why do you want to join APC? *
          </label>
          <textarea
            name="reason"
            required
            value={formData.reason}
            onChange={handleChange}
            rows={4}
            placeholder="Tell us about your motivation and how you'd like to contribute..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Users className="w-5 h-5 mr-2" />
                Submit Application
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Info */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> Your application will be reviewed by an admin. You&apos;ll receive full community access once approved.
          </p>
        </div>
      </form>
    </div>
  )
}
