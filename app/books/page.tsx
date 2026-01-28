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
    booksDonated: 3500,
    booksDistributed: 2800,
    activeUsers: 450,
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Book Sharing & Donation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Share knowledge, transform lives
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
            <BookOpen className="w-10 h-10 mx-auto mb-2 text-primary-600" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.booksDonated.toLocaleString()}</div>
            <div className="text-gray-600 dark:text-gray-400">Books Donated</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
            <TrendingUp className="w-10 h-10 mx-auto mb-2 text-primary-600" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.booksDistributed.toLocaleString()}</div>
            <div className="text-gray-600 dark:text-gray-400">Books Distributed</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
            <Users className="w-10 h-10 mx-auto mb-2 text-primary-600" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeUsers}</div>
            <div className="text-gray-600 dark:text-gray-400">Active Users</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
            <Heart className="w-10 h-10 mx-auto mb-2 text-primary-600" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.impactCounter.toLocaleString()}+</div>
            <div className="text-gray-600 dark:text-gray-400">Lives Impacted</div>
          </div>
        </div>

        {/* Donate Button */}
        <div className="text-center mb-12">
          <button
            onClick={() => setShowDonateForm(true)}
            className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors inline-flex items-center"
          >
            <Heart className="w-5 h-5 mr-2" />
            Donate Books
          </button>
        </div>

        {/* Book Categories */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Book Categories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'School', icon: '📚', count: 1200, desc: 'Textbooks and reference materials' },
              { name: 'Competitive Exams', icon: '📖', count: 800, desc: 'Exam preparation books' },
              { name: 'Skill Development', icon: '💼', count: 900, desc: 'Professional and technical skills' },
              { name: 'Self-Help', icon: '🌟', count: 600, desc: 'Personal growth and motivation' },
            ].map((category) => (
              <div
                key={category.name}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
              >
                <div className="text-5xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{category.name}</h3>
                <p className="text-2xl font-bold text-primary-600 mb-2">{category.count}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{category.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Active Users */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
            <Users className="w-8 h-8 mr-3 text-primary-600" />
            Active Users
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activeUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center"
              >
                <div className="text-5xl mb-4">{user.photo}</div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{user.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {user.booksBorrowed} books borrowed
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
            <Quote className="w-8 h-8 mr-3 text-primary-600" />
            Book Readers' Testimonials
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4 italic">"{testimonial.text}"</p>
                <p className="font-semibold text-gray-900 dark:text-white">- {testimonial.name}</p>
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
                <div className="glass-card p-6 rounded-xl backdrop-blur-lg border border-white/20 h-full flex flex-col overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 via-primary-500/0 to-primary-500/0 group-hover:from-primary-500/10 group-hover:via-primary-500/5 group-hover:to-primary-600/10 transition-all duration-500 rounded-xl -z-10"></div>
                  
                  <div className="text-5xl mb-4 text-center">📖</div>
                  
                  <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white text-center group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                    {patron.name}
                  </h3>
                  
                  <div className="h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent my-3"></div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2 flex-grow">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Patron ID:</span>
                      <span className="text-primary-600 dark:text-primary-400 font-mono">{patron.patronId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Issue Date:</span>
                      <span className="text-gray-700 dark:text-gray-300">{patron.issueDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Books Issued:</span>
                      <span className="font-bold text-green-600 dark:text-green-400">{patron.booksIssued}</span>
                    </div>
                  </div>
                  
                  <div className="h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent my-3"></div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                    <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400">Accession Numbers:</span>
                    <div className="flex flex-wrap gap-1">
                      {patron.accNos.split(',').map((acc, i) => (
                        <span key={i} className="bg-primary-100/50 dark:bg-primary-900/50 px-2 py-1 rounded text-primary-700 dark:text-primary-300 font-mono text-xs">
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
