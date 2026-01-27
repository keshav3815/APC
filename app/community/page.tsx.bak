'use client'

import { useState } from 'react'
import { Users, UserCheck, Filter, Search, Clock, MapPin, Award } from 'lucide-react'

interface Member {
  id: number
  name: string
  role: string
  photo: string
  contribution: string
  city: string
  type: 'volunteer' | 'donor' | 'mentor' | 'student'
}

const members: Member[] = [
  { id: 1, name: 'Rajesh Kumar', role: 'Volunteer Coordinator', photo: '👨‍💼', contribution: '500+ hours', city: 'Mumbai', type: 'volunteer' },
  { id: 2, name: 'Priya Sharma', role: 'Education Mentor', photo: '👩‍🏫', contribution: '300+ students', city: 'Delhi', type: 'mentor' },
  { id: 3, name: 'Amit Patel', role: 'Donor', photo: '👨‍💻', contribution: '₹50,000+', city: 'Bangalore', type: 'donor' },
  { id: 4, name: 'Sneha Reddy', role: 'Student Leader', photo: '👩‍🎓', contribution: '200+ hours', city: 'Hyderabad', type: 'student' },
  { id: 5, name: 'Vikram Singh', role: 'Event Organizer', photo: '👨‍💼', contribution: '25+ events', city: 'Pune', type: 'volunteer' },
  { id: 6, name: 'Anita Desai', role: 'Book Donor', photo: '👩‍💼', contribution: '500+ books', city: 'Chennai', type: 'donor' },
]

const pastContributors = [
  { id: 1, name: 'Dr. Meera Nair', role: 'Founding Member', years: '2015-2020', contribution: 'Led initial community building' },
  { id: 2, name: 'Karan Malhotra', role: 'Former Director', years: '2016-2021', contribution: 'Established book donation program' },
  { id: 3, name: 'Sunita Verma', role: 'Former Coordinator', years: '2017-2022', contribution: 'Organized 50+ events' },
]

export default function Community() {
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    skills: '',
    interests: '',
    availability: '',
    type: 'volunteer',
  })

  const filteredMembers = members.filter(member => {
    const matchesFilter = activeFilter === 'all' || member.type === activeFilter
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.city.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const stats = {
    totalMembers: 1250,
    hoursServed: 15000,
    cities: 25,
    activeVolunteers: 450,
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Thank you for joining APC! We will contact you soon.')
    setShowJoinForm(false)
    setFormData({
      name: '', email: '', phone: '', city: '', skills: '', interests: '', availability: '', type: 'volunteer'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Our Community
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Join passionate individuals making a difference
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
            <Users className="w-10 h-10 mx-auto mb-2 text-primary-600" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalMembers.toLocaleString()}</div>
            <div className="text-gray-600 dark:text-gray-400">Total Members</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
            <Clock className="w-10 h-10 mx-auto mb-2 text-primary-600" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.hoursServed.toLocaleString()}</div>
            <div className="text-gray-600 dark:text-gray-400">Hours Served</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
            <MapPin className="w-10 h-10 mx-auto mb-2 text-primary-600" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.cities}</div>
            <div className="text-gray-600 dark:text-gray-400">Cities</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
            <Award className="w-10 h-10 mx-auto mb-2 text-primary-600" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeVolunteers}</div>
            <div className="text-gray-600 dark:text-gray-400">Active Volunteers</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'volunteer', 'donor', 'mentor', 'student'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeFilter === filter
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Join Button */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowJoinForm(true)}
            className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Join APC Community
          </button>
        </div>

        {/* Active Members */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
            <UserCheck className="w-8 h-8 mr-3 text-primary-600" />
            Active Members
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-6xl mb-4 text-center">{member.photo}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{member.name}</h3>
                <p className="text-primary-600 dark:text-primary-400 mb-2">{member.role}</p>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {member.city}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Contribution: {member.contribution}
                </p>
                <span className="inline-block mt-3 px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-xs">
                  {member.type}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Past Contributors */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
            <Award className="w-8 h-8 mr-3 text-primary-600" />
            Past Contributors
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {pastContributors.map((contributor) => (
              <div
                key={contributor.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-primary-600"
              >
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{contributor.name}</h3>
                <p className="text-primary-600 dark:text-primary-400 mb-2">{contributor.role}</p>
                <p className="text-gray-600 dark:text-gray-400 mb-2">{contributor.years}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">{contributor.contribution}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Join Form Modal */}
        {showJoinForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Join APC Community</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Name *</label>
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
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">I want to join as *</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="volunteer">Volunteer</option>
                    <option value="donor">Donor</option>
                    <option value="mentor">Mentor</option>
                    <option value="student">Student</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Skills</label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="e.g., Teaching, Event Management, Web Development"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Interests</label>
                  <input
                    type="text"
                    value={formData.interests}
                    onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                    placeholder="e.g., Education, Community Service, Technology"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Availability</label>
                  <input
                    type="text"
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    placeholder="e.g., Weekends, 5-8 PM on weekdays"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowJoinForm(false)}
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
