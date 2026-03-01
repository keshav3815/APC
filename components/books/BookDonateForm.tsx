'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  BookOpen, User, CheckCircle, X, Loader2, Upload, ArrowRight,
  ArrowLeft, MapPin, Phone, Mail, Truck, Building, ImageIcon,
  Sparkles, Heart,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface BookDonateFormProps {
  onClose: () => void
  onSuccess?: () => void
}

type Step = 1 | 2 | 3

const STEPS = [
  { num: 1, label: 'Book Details', icon: BookOpen },
  { num: 2, label: 'Your Details', icon: User },
  { num: 3, label: 'Review & Submit', icon: CheckCircle },
]

export default function BookDonateForm({ onClose, onSuccess }: BookDonateFormProps) {
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [coverUrl, setCoverUrl] = useState('')
  const [coverPreview, setCoverPreview] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const [form, setForm] = useState({
    bookTitle: '',
    author: '',
    category: 'school',
    type: 'physical',
    condition: 'good',
    quantity: 1,
    language: 'Hindi',
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    deliveryMethod: 'drop-off',
  })

  const update = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    setCoverPreview(URL.createObjectURL(file))
    setUploading(true)

    try {
      const ext = file.name.split('.').pop()
      const fileName = `cover_${Date.now()}.${ext}`
      const { data, error } = await supabase.storage
        .from('book-covers')
        .upload(fileName, file, { cacheControl: '3600', upsert: false })

      if (error) throw error

      const { data: urlData } = supabase.storage
        .from('book-covers')
        .getPublicUrl(data.path)

      setCoverUrl(urlData.publicUrl)
      toast.success('Cover uploaded!')
    } catch (err: any) {
      toast.error('Failed to upload cover image')
      setCoverPreview('')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const validateStep1 = () => {
    if (!form.bookTitle.trim()) { toast.error('Book title is required'); return false }
    if (!form.category) { toast.error('Category is required'); return false }
    return true
  }

  const validateStep2 = () => {
    if (!form.name.trim()) { toast.error('Name is required'); return false }
    if (!form.email.trim()) { toast.error('Email is required'); return false }
    if (!form.phone.trim()) { toast.error('Phone is required'); return false }
    if (form.deliveryMethod === 'pickup' && !form.address.trim()) {
      toast.error('Address is required for pickup')
      return false
    }
    return true
  }

  const next = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    setStep((step + 1) as Step)
  }

  const prev = () => setStep((step - 1) as Step)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.from('book_donations').insert({
        donor_name: form.name.trim(),
        donor_email: form.email.trim(),
        donor_phone: form.phone.trim(),
        book_title: form.bookTitle.trim(),
        author: form.author.trim() || null,
        category: form.category,
        book_type: form.type,
        condition: form.condition,
        quantity: form.quantity,
        language: form.language,
        cover_url: coverUrl || null,
        donor_address: form.address.trim() || null,
        donor_city: form.city.trim() || null,
        donor_state: form.state.trim() || null,
        delivery_method: form.deliveryMethod,
        status: 'pending',
      })

      if (error) throw error
      setSuccess(true)
      onSuccess?.()
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit donation')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm'
  const labelClass = 'block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5'

  // Success animation
  if (success) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-8 shadow-2xl border border-gray-200 dark:border-gray-700 text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-green-100 dark:bg-green-900/30 rounded-full animate-ping opacity-30" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Thank You!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Your book donation has been submitted successfully.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            We will contact you at <strong>{form.email}</strong> to arrange {form.deliveryMethod === 'pickup' ? 'a pickup' : 'the drop-off'}.
          </p>
          <div className="flex items-center justify-center gap-2 mb-6">
            <Heart className="w-5 h-5 text-red-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Your generosity makes a difference!
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Donate Books
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const isActive = step >= s.num
            const isCurrent = step === s.num
            return (
              <div key={s.num} className="flex-1 flex items-center">
                <div className="flex items-center gap-2 flex-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                  } ${isCurrent ? 'ring-2 ring-blue-300 ring-offset-2 dark:ring-offset-gray-800' : ''}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-semibold hidden sm:inline ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${step > s.num ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Step 1: Book Details */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Book Title *</label>
                <input
                  type="text"
                  required
                  value={form.bookTitle}
                  onChange={e => update('bookTitle', e.target.value)}
                  placeholder="e.g., NCERT Class 10 Science"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Author</label>
                <input
                  type="text"
                  value={form.author}
                  onChange={e => update('author', e.target.value)}
                  placeholder="Author name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Language</label>
                <select value={form.language} onChange={e => update('language', e.target.value)} className={inputClass}>
                  <option value="Hindi">Hindi</option>
                  <option value="English">English</option>
                  <option value="Both">Bilingual</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Category *</label>
                <select value={form.category} onChange={e => update('category', e.target.value)} className={inputClass}>
                  <option value="school">School / Textbook</option>
                  <option value="competitive">Competitive Exams</option>
                  <option value="skill">Skill Development</option>
                  <option value="self-help">Self-Help</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Book Type *</label>
                <select value={form.type} onChange={e => update('type', e.target.value)} className={inputClass}>
                  <option value="physical">Physical Book</option>
                  <option value="digital">Digital / eBook</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Condition</label>
                <select value={form.condition} onChange={e => update('condition', e.target.value)} className={inputClass}>
                  <option value="new">Like New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="worn">Worn but usable</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Quantity</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={form.quantity}
                  onChange={e => update('quantity', parseInt(e.target.value) || 1)}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Cover Upload */}
            <div>
              <label className={labelClass}>Book Cover Photo (optional)</label>
              <div className="flex items-start gap-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-28 h-36 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 flex flex-col items-center justify-center cursor-pointer bg-gray-50 dark:bg-gray-700/50 transition-all overflow-hidden"
                >
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                  ) : uploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  ) : (
                    <>
                      <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-400">Upload</span>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Upload a photo of the book cover. Max 5MB, JPG/PNG.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Donor Details */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  <User className="w-3.5 h-3.5 inline mr-1" />
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  placeholder="Full name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  <Mail className="w-3.5 h-3.5 inline mr-1" />
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  <Phone className="w-3.5 h-3.5 inline mr-1" />
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={e => update('phone', e.target.value)}
                  placeholder="+91 9876543210"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
              <label className={labelClass}>
                <Truck className="w-3.5 h-3.5 inline mr-1" />
                Delivery Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                {[
                  { value: 'drop-off', label: 'Drop Off', desc: 'You bring the books to us', icon: Building },
                  { value: 'pickup', label: 'Pickup', desc: 'We will collect from you', icon: Truck },
                  { value: 'courier', label: 'Courier', desc: 'Ship via postal service', icon: Mail },
                ].map(opt => {
                  const Icon = opt.icon
                  const isSelected = form.deliveryMethod === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update('deliveryMethod', opt.value)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                      <p className={`font-semibold text-sm ${isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {opt.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{opt.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Address (shown for pickup/courier) */}
            {(form.deliveryMethod === 'pickup' || form.deliveryMethod === 'courier') && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className={labelClass}>
                    <MapPin className="w-3.5 h-3.5 inline mr-1" />
                    Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.address}
                    onChange={e => update('address', e.target.value)}
                    placeholder="Street address"
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>City</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={e => update('city', e.target.value)}
                      placeholder="City"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>State</label>
                    <input
                      type="text"
                      value={form.state}
                      onChange={e => update('state', e.target.value)}
                      placeholder="State"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-5">
            {/* Book Info */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Book Details
              </h3>
              <div className="flex gap-4">
                {coverPreview && (
                  <img src={coverPreview} alt="Cover" className="w-16 h-20 object-cover rounded-lg shadow" />
                )}
                <div className="flex-1 space-y-1.5">
                  <p className="font-bold text-gray-900 dark:text-white">{form.bookTitle}</p>
                  {form.author && <p className="text-sm text-gray-600 dark:text-gray-400">by {form.author}</p>}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                      {form.category}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      {form.condition}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      {form.language}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                      Qty: {form.quantity}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                      {form.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Donor Info */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <User className="w-4 h-4" /> Donor Details
              </h3>
              <div className="space-y-2 text-sm">
                <p className="font-bold text-gray-900 dark:text-white">{form.name}</p>
                <p className="text-gray-600 dark:text-gray-400">
                  <Mail className="w-3.5 h-3.5 inline mr-1" />{form.email}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <Phone className="w-3.5 h-3.5 inline mr-1" />{form.phone}
                </p>
              </div>
            </div>

            {/* Delivery */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4" /> Delivery
              </h3>
              <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{form.deliveryMethod}</p>
              {form.address && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 inline mr-1" />
                  {form.address}{form.city ? `, ${form.city}` : ''}{form.state ? `, ${form.state}` : ''}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
          {step > 1 && (
            <button
              type="button"
              onClick={prev}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
          <div className="flex-1" />
          {step < 3 ? (
            <button
              type="button"
              onClick={next}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 transition-all"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Heart className="w-4 h-4" /> Submit Donation
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
