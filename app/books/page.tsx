'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Users, Heart, TrendingUp, Star, Quote, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Testimonial {
  id: string
  name: string
  content: string
  rating: number
}

interface BookIssue {
  id: string
  patron_name: string
  patron_id: string
  issue_date: string
  books_count: number
  accession_numbers: string[]
}

interface BookDonation {
  id: string
  donor_name: string
  book_title: string
  author: string
  category: string
  quantity: number
  created_at: string
}

export default function Books() {
  const [showDonateForm, setShowDonateForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bookTitle: '',
    author: '',
    category: 'school',
    type: 'physical',
    condition: '',
  })
  const [stats, setStats] = useState({
    booksDonated: 0,
    booksDistributed: 0,
    activeUsers: 0,
    impactCounter: 0,
  })
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [bookIssues, setBookIssues] = useState<BookIssue[]>([])
  const [bookDonations, setBookDonations] = useState<BookDonation[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchData()

    // Set up real-time subscriptions
    const statsSubscription = supabase
      .channel('stats-changes-books')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'stats' },
        (payload: any) => {
          console.log('Stats changed:', payload)
          fetchData()
        }
      )
      .subscribe()

    const testimonialsSubscription = supabase
      .channel('testimonials-changes-books')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'testimonials' },
        (payload: any) => {
          console.log('Testimonials changed:', payload)
          fetchData()
        }
      )
      .subscribe()

    const bookIssuesSubscription = supabase
      .channel('book-issues-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'book_issues' },
        (payload: any) => {
          console.log('Book issues changed:', payload)
          fetchData()
        }
      )
      .subscribe()

    // Cleanup subscriptions on unmount
    return () => {
      statsSubscription.unsubscribe()
      testimonialsSubscription.unsubscribe()
      bookIssuesSubscription.unsubscribe()
    }
  }, [])

  const fetchData = async () => {
    try {
      // Fetch stats
      const { data: statsData } = await supabase
        .from('stats')
        .select('*')
        .single()
      
      if (statsData) {
        setStats({
          booksDonated: statsData.books_donated || 0,
          booksDistributed: statsData.books_distributed || 0,
          activeUsers: statsData.active_users || 0,
          impactCounter: statsData.lives_impacted || 0,
        })
      }

      // Fetch testimonials
      const { data: testimonialsData } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_approved', true)
        .eq('is_featured', true)
        .limit(3)
      
      if (testimonialsData && testimonialsData.length > 0) {
        setTestimonials(testimonialsData)
      }

      // Fetch recent book issues
      const { data: issuesData } = await supabase
        .from('book_issues')
        .select(`
          id,
          issue_date,
          books:book_id (title, accession_number),
          library_patrons:patron_id (patron_id, name)
        `)
        .eq('status', 'issued')
        .order('issue_date', { ascending: false })
        .limit(20)
      
      // Process book issues data if available
      if (issuesData && issuesData.length > 0) {
        // Group by patron
        const issuesByPatron = issuesData.reduce((acc: any, issue: any) => {
          const patronId = issue.library_patrons?.patron_id
          if (!acc[patronId]) {
            acc[patronId] = {
              id: issue.id,
              patron_name: issue.library_patrons?.name || 'Unknown',
              patron_id: patronId || 'N/A',
              issue_date: issue.issue_date,
              books_count: 0,
              accession_numbers: []
            }
          }
          acc[patronId].books_count++
          acc[patronId].accession_numbers.push(issue.books?.accession_number || 'N/A')
          return acc
        }, {})
        
        setBookIssues(Object.values(issuesByPatron))
      }

      // Fetch approved book donations
      const { data: donationsData } = await supabase
        .from('book_donations')
        .select('id, donor_name, book_title, author, category, quantity, created_at')
        .eq('status', 'received')
        .order('created_at', { ascending: false })
        .limit(12)

      if (donationsData && donationsData.length > 0) {
        setBookDonations(donationsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setPageLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { error } = await supabase
        .from('book_donations')
        .insert({
          donor_name: formData.name,
          donor_email: formData.email,
          donor_phone: formData.phone,
          book_title: formData.bookTitle,
          author: formData.author,
          category: formData.category,
          book_type: formData.type,
          condition: formData.condition,
          status: 'pending'
        })
      
      if (error) throw error
      
      toast.success('Thank you for your donation! We will contact you soon to arrange pickup/delivery.')
      setShowDonateForm(false)
      setFormData({
        name: '', email: '', phone: '', bookTitle: '', author: '', category: 'school', type: 'physical', condition: ''
      })
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit donation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-blue-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Hero Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-600/10">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-primary-600">
            Book Sharing & Donation
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Share knowledge, transform lives through our community book library
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
          <div className="group relative bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-primary-500/0 group-hover:from-blue-500/5 group-hover:to-primary-500/10 rounded-2xl transition-all duration-300"></div>
            <BookOpen className="w-10 h-10 mb-3 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{stats.booksDonated}+</div>
            <div className="text-gray-600 dark:text-gray-400 font-medium">Books Donated</div>
          </div>
          <div className="group relative bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-primary-500/0 group-hover:from-green-500/5 group-hover:to-primary-500/10 rounded-2xl transition-all duration-300"></div>
            <TrendingUp className="w-10 h-10 mb-3 text-green-600 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{stats.booksDistributed}+</div>
            <div className="text-gray-600 dark:text-gray-400 font-medium">Books Distributed</div>
          </div>
          <div className="group relative bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-primary-500/0 group-hover:from-purple-500/5 group-hover:to-primary-500/10 rounded-2xl transition-all duration-300"></div>
            <Users className="w-10 h-10 mb-3 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{stats.activeUsers}+</div>
            <div className="text-gray-600 dark:text-gray-400 font-medium">Active Users</div>
          </div>
          <div className="group relative bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-primary-500/0 group-hover:from-red-500/5 group-hover:to-primary-500/10 rounded-2xl transition-all duration-300"></div>
            <Heart className="w-10 h-10 mb-3 text-red-600 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{stats.impactCounter.toLocaleString()}+</div>
            <div className="text-gray-600 dark:text-gray-400 font-medium">Lives Impacted</div>
          </div>
        </div>

        {/* Donate Button */}
        <div className="text-center mb-16">
          <button
            onClick={() => setShowDonateForm(true)}
            className="group relative bg-gradient-to-r from-blue-600 to-primary-600 text-white px-8 md:px-12 py-4 rounded-xl font-semibold hover:shadow-2xl hover:shadow-blue-600/40 transition-all duration-300 inline-flex items-center gap-2 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            <span className="relative flex items-center gap-2">
              <Heart className="w-5 h-5 group-hover:animate-pulse" />
              Donate Books
            </span>
          </button>
        </div>

        {/* Book Categories */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Book Categories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'School', icon: '📚', count: 100, desc: 'Textbooks and reference materials' },
              { name: 'Competitive Exams', icon: '📖', count: 200, desc: 'Exam preparation books' },
              { name: 'Skill Development', icon: '💼', count: 50, desc: 'Professional and technical skills' },
              { name: 'Self-Help', icon: '🌟', count: 50, desc: 'Personal growth and motivation' },
            ].map((category, index) => (
              <div
                key={category.name}
                className="group relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-500/0 group-hover:from-primary-500/5 group-hover:to-primary-500/15 rounded-2xl transition-all duration-300 -z-10"></div>
                <div className="text-6xl mb-6 text-center group-hover:scale-110 transition-transform duration-300">{category.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white text-center group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{category.name}</h3>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 text-center mb-3">{category.count}+</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">{category.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Active Users */}
        {bookIssues.length > 0 && (
          <section className="mb-16">
            <h2 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white flex items-center">
              <Users className="w-10 h-10 mr-3 text-primary-600" />
              Active Readers
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {bookIssues.slice(0, 4).map((issue) => (
                <div
                  key={issue.id}
                  className="group relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 text-center hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-500/0 group-hover:from-primary-500/5 group-hover:to-primary-500/15 rounded-2xl transition-all duration-300 -z-10"></div>
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">👤</div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{issue.patron_name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                    <span className="font-bold text-primary-600 dark:text-primary-400">{issue.books_count}</span> books borrowed
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <section className="mb-16">
            <h2 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white flex items-center">
              <Quote className="w-10 h-10 mr-3 text-primary-600" />
              Book Readers' Testimonials
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="group relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-700 hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-primary-500/0 group-hover:from-yellow-500/5 group-hover:to-primary-500/10 rounded-2xl transition-all duration-300 -z-10"></div>
                  <div className="flex mb-4 group-hover:scale-110 transition-transform duration-300 origin-left">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 italic group-hover:text-gray-900 dark:group-hover:text-white transition-colors">"{testimonial.content}"</p>
                  <p className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">- {testimonial.name}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Book Donations */}
        {bookDonations.length > 0 && (
          <section className="mb-16">
            <h2 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white flex items-center">
              <Heart className="w-10 h-10 mr-3 text-red-600" />
              Recent Book Donations
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookDonations.map((donation) => (
                <div
                  key={donation.id}
                  className="group relative bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/5 group-hover:to-red-500/10 rounded-2xl transition-all duration-300 -z-10"></div>
                  
                  {/* Donor Badge */}
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
                      {donation.donor_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        {donation.donor_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(donation.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Book Details */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                      {donation.book_title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      by <span className="font-medium text-gray-900 dark:text-white">{donation.author}</span>
                    </p>
                    <div className="flex items-center justify-between pt-3">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {donation.category}
                      </span>
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">
                        Qty: {donation.quantity}
                      </span>
                    </div>
                  </div>

                  {/* Thank you note */}
                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 italic">
                      🙏 Thank you for your generous donation!
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Book Issuance Records */}
        {bookIssues.length > 0 && (
          <section className="mb-16">
            <h2 className="text-4xl font-bold mb-12 text-gray-900 dark:text-white flex items-center">
              <BookOpen className="w-10 h-10 mr-3 text-primary-600" />
              Book Issuance Records
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookIssues.map((patron, index) => (
                <div
                  key={patron.id || index}
                  className="group relative h-full"
                >
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 h-full flex flex-col overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 via-primary-500/0 to-primary-500/0 group-hover:from-primary-500/10 group-hover:via-primary-500/5 group-hover:to-primary-600/10 transition-all duration-500 rounded-2xl -z-10"></div>
                    
                    <div className="text-6xl mb-6 text-center group-hover:scale-110 transition-transform duration-300">📖</div>
                    
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white text-center group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                      {patron.patron_name}
                    </h3>
                    
                    <div className="h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent my-4"></div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-3 flex-grow">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">🪪 Patron ID</span>
                        <span className="font-medium text-gray-900 dark:text-white">{patron.patron_id}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">📅 Issue Date</span>
                        <span className="font-medium text-gray-900 dark:text-white">{new Date(patron.issue_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">📚 Books Issued</span>
                        <span className="font-bold text-primary-600 dark:text-primary-400">{patron.books_count}</span>
                      </div>
                      <div>
                        <span className="flex items-center gap-2 mb-2">🔢 Acc. Nos</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300 text-xs leading-relaxed block">{patron.accession_numbers.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Donate Form Modal */}
        {showDonateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Donate Books</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Book Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.bookTitle}
                    onChange={(e) => setFormData({ ...formData, bookTitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Author</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="school">School</option>
                    <option value="competitive">Competitive Exams</option>
                    <option value="skill">Skill Development</option>
                    <option value="self-help">Self-Help</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Book Type *</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="physical">Physical Book</option>
                    <option value="digital">Digital Book</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Condition (for physical books)</label>
                  <input
                    type="text"
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    placeholder="e.g., Like new, Good, Fair"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                    Submit Donation
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDonateForm(false)}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
