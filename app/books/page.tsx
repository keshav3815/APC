'use client'

import { useState } from 'react'
import { BookOpen, Users, Heart, TrendingUp, Star, Quote } from 'lucide-react'

interface Book {
  id: number
  title: string
  category: 'school' | 'competitive' | 'skill' | 'self-help'
  donor: string
  status: 'available' | 'borrowed'
}

const activeUsers = [
  { id: 1, name: 'Rahul Mehta', booksBorrowed: 12, photo: '👨‍🎓' },
  { id: 2, name: 'Kavya Nair', booksBorrowed: 8, photo: '👩‍🎓' },
  { id: 3, name: 'Arjun Desai', booksBorrowed: 15, photo: '👨‍🎓' },
  { id: 4, name: 'Meera Patel', booksBorrowed: 10, photo: '👩‍🎓' },
]

const testimonials = [
  { id: 1, name: 'Priya Sharma', text: 'APC books helped me prepare for my competitive exams. The collection is amazing!', rating: 5 },
  { id: 2, name: 'Amit Kumar', text: 'I found the perfect self-help books here. Thank you APC for making knowledge accessible.', rating: 5 },
  { id: 3, name: 'Sneha Reddy', text: 'The skill development books have been a game-changer for my career growth.', rating: 5 },
]

export default function Books() {
  const [showDonateForm, setShowDonateForm] = useState(false)
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

  const stats = {
    booksDonated: 350,
    booksDistributed: 300,
    activeUsers: 500,
    impactCounter: 1200,
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Thank you for your donation! We will contact you soon to arrange pickup/delivery.')
    setShowDonateForm(false)
    setFormData({
      name: '', email: '', phone: '', bookTitle: '', author: '', category: 'school', type: 'physical', condition: ''
    })
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
        <section className="mb-16">
          <h2 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white flex items-center">
            <Users className="w-10 h-10 mr-3 text-primary-600" />
            Active Users
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activeUsers.map((user) => (
              <div
                key={user.id}
                className="group relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 text-center hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-500/0 group-hover:from-primary-500/5 group-hover:to-primary-500/15 rounded-2xl transition-all duration-300 -z-10"></div>
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">{user.photo}</div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{user.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                  <span className="font-bold text-primary-600 dark:text-primary-400">{user.booksBorrowed}</span> books borrowed
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
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
                <p className="text-gray-700 dark:text-gray-300 mb-4 italic group-hover:text-gray-900 dark:group-hover:text-white transition-colors">"{testimonial.text}"</p>
                <p className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">- {testimonial.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Book Issuance Records */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold mb-12 text-gray-900 dark:text-white flex items-center">
            <BookOpen className="w-10 h-10 mr-3 text-primary-600" />
            Book Issuance Records
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Keshav Kumar Mandal', patronId: 'APCLIB/08', issueDate: '01 March 2025', booksIssued: 8, accNos: 'APC 1,4,7,10,13,16,19,22' },
              { name: 'Jyoti Kumari', patronId: 'APCLIB/09', issueDate: '01 March 2025', booksIssued: 11, accNos: 'APC 2,5,8,11,14,17,20,23,26,29,32' },
              { name: 'Saraswati Kumari', patronId: 'APCLIB/10', issueDate: '01 March 2025', booksIssued: 11, accNos: 'APC 3,6,9,12,15,18,21,24,27,30,33' },
              { name: 'Ganga Kumari', patronId: 'APCLIB/12', issueDate: '16 May 2025', booksIssued: 4, accNos: 'APC 36,39,42,45' },
              { name: 'Santoshi Kumari', patronId: 'APCLIB/14', issueDate: '16 May 2025', booksIssued: 4, accNos: 'APC 37,40,43,46' },
              { name: 'Manisha Kumari', patronId: 'APCLIB/13', issueDate: '16 May 2025', booksIssued: 4, accNos: 'APC 35,38,41,44' },
              { name: 'Babita Kumari', patronId: 'APCLIB/11', issueDate: '16 May 2025', booksIssued: 2, accNos: 'APC 34,47' },
            ].map((patron, index) => (
              <div
                key={index}
                className="group relative h-full"
              >
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 h-full flex flex-col overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 via-primary-500/0 to-primary-500/0 group-hover:from-primary-500/10 group-hover:via-primary-500/5 group-hover:to-primary-600/10 transition-all duration-500 rounded-2xl -z-10"></div>
                  
                  <div className="text-6xl mb-6 text-center group-hover:scale-110 transition-transform duration-300">📖</div>
                  
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white text-center group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                    {patron.name}
                  </h3>
                  
                  <div className="h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent my-4"></div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-3 flex-grow">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Patron ID:</span>
                      <span className="text-primary-600 dark:text-primary-400 font-mono text-xs bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-lg">{patron.patronId}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Issue Date:</span>
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{patron.issueDate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Books Issued:</span>
                      <span className="font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-lg">{patron.booksIssued}</span>
                    </div>
                  </div>
                  
                  <div className="h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent my-4"></div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                    <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400">Accession Numbers:</span>
                    <div className="flex flex-wrap gap-2">
                      {patron.accNos.split(',').map((acc, i) => (
                        <span key={i} className="bg-primary-100 dark:bg-primary-900/40 px-3 py-2 rounded-lg text-primary-700 dark:text-primary-300 font-mono text-xs font-medium hover:bg-primary-200 dark:hover:bg-primary-900/60 transition-colors">
                          {acc.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        
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
