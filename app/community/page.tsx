'use client'

import { useState } from 'react'
import { Users, UserCheck, Filter, Search, Clock, MapPin, Award, Heart, Sparkles } from 'lucide-react'

interface Member {
  id: number
  name: string
  role: string
  photo: string
  contribution: string
  village: string
  type: 'volunteer' | 'donor' | 'mentor' | 'student'
}

const members: Member[] = [
  { id: 1, name: 'Abhay Shankar Jha', role: 'Mentor', photo: '👨‍💼', contribution: 'Teaching, Event Organization', village: 'Delhi', type: 'mentor' },
  { id: 2, name: 'Keshav Singh', role: 'Mentor', photo: '👨‍🏫', contribution: 'Teaching, Development, Events', village: 'Chandigarh', type: 'mentor' },
  { id: 3, name: 'Sumit Singh', role: 'Mentor & Volunteer', photo: '👨‍💼', contribution: 'Teaching, Event Management', village: 'Darbhanga', type: 'mentor' },
  { id: 4, name: 'Rohan Mishra', role: 'Volunteer', photo: '👨‍🎓', contribution: 'Teaching Support', village: 'Darbhanga', type: 'volunteer' },
  { id: 5, name: 'Golden Kumar Yadav', role: 'Volunteer', photo: '👨‍💼', contribution: 'Event Management', village: 'Madhepur', type: 'volunteer' },
  { id: 6, name: 'Shankar Kumar', role: 'Mentor', photo: '👨‍🏫', contribution: 'Teaching, Event Management', village: 'Madhepur', type: 'mentor' },
  { id: 7, name: 'Abhishek Mishra', role: 'Volunteer', photo: '👨‍💼', contribution: 'Event Management', village: 'Madhepur', type: 'volunteer' },
  { id: 8, name: 'Deepak Kumar', role: 'Volunteer', photo: '👨‍💼', contribution: 'Event Management', village: 'Madhepur', type: 'volunteer' },
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
    village: '',
    skills: '',
    interests: '',
    availability: '',
    type: 'volunteer',
  })

  const filteredMembers = members.filter(member => {
    const matchesFilter = activeFilter === 'all' || member.type === activeFilter
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.village.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const stats = {
    totalMembers: 1500,
    hoursServed: 15000,
    villages: 25,
    activeVolunteers: 10,
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Thank you for joining APC! We will contact you soon.')
    setShowJoinForm(false)
    setFormData({
      name: '', email: '', phone: '', village: '', skills: '', interests: '', availability: '', type: 'volunteer'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Hero Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-600/10">
              <Heart className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-700">
            Our Community
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join passionate individuals from villages across the nation making a real difference in education
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
          <div className="group relative bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-primary-500/0 group-hover:from-blue-500/5 group-hover:to-primary-500/10 rounded-2xl transition-all duration-300"></div>
            <Users className="w-10 h-10 mb-3 text-primary-600 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{stats.totalMembers.toLocaleString()}</div>
            <div className="text-gray-600 dark:text-gray-400 font-medium">Total Members</div>
          </div>
          <div className="group relative bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-primary-500/0 group-hover:from-green-500/5 group-hover:to-primary-500/10 rounded-2xl transition-all duration-300"></div>
            <Clock className="w-10 h-10 mb-3 text-primary-600 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{stats.hoursServed.toLocaleString()}</div>
            <div className="text-gray-600 dark:text-gray-400 font-medium">Hours Served</div>
          </div>
          <div className="group relative bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-primary-500/0 group-hover:from-orange-500/5 group-hover:to-primary-500/10 rounded-2xl transition-all duration-300"></div>
            <MapPin className="w-10 h-10 mb-3 text-primary-600 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{stats.villages}</div>
            <div className="text-gray-600 dark:text-gray-400 font-medium">Villages</div>
          </div>
          <div className="group relative bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-primary-500/0 group-hover:from-purple-500/5 group-hover:to-primary-500/10 rounded-2xl transition-all duration-300"></div>
            <Award className="w-10 h-10 mb-3 text-primary-600 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{stats.activeVolunteers}</div>
            <div className="text-gray-600 dark:text-gray-400 font-medium">Active Volunteers</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or village..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap justify-center md:justify-start">
              {['all', 'volunteer', 'mentor', 'student'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-5 py-2 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                    activeFilter === filter
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30 scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Join Button */}
        <div className="text-center mb-12">
          <button
            onClick={() => setShowJoinForm(true)}
            className="group relative bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 md:px-12 py-4 rounded-xl font-semibold hover:shadow-2xl hover:shadow-primary-600/40 transition-all duration-300 inline-flex items-center gap-2 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            <span className="relative flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Join APC Community
            </span>
          </button>
        </div>

        {/* Active Members */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold mb-12 text-gray-900 dark:text-white flex items-center">
            <UserCheck className="w-10 h-10 mr-3 text-primary-600" />
            Active Members
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="group relative h-full"
              >
                <div className="glass-card p-8 rounded-2xl backdrop-blur-lg border border-white/30 dark:border-white/10 h-full flex flex-col overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 bg-white/50 dark:bg-gray-800/50">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-primary-500/5 to-primary-600/10 group-hover:from-primary-500/20 group-hover:via-primary-500/15 group-hover:to-primary-600/20 transition-all duration-500 rounded-2xl -z-10"></div>
                  
                  <div className="text-7xl mb-6 text-center transform group-hover:scale-110 transition-transform duration-500 drop-shadow-lg">
                    {member.photo}
                  </div>
                  
                  <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white text-center group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                    {member.name}
                  </h3>
                  
                  <p className="text-primary-600 dark:text-primary-400 mb-3 text-center font-semibold text-sm group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors duration-300">
                    {member.role}
                  </p>
                  
                  <div className="flex items-center justify-center text-gray-600 dark:text-gray-400 mb-4 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm font-medium">{member.village}</span>
                  </div>
                  
                  <div className="h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent my-4"></div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 flex-grow group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                    <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400">Skills & Interests</span>
                    {member.contribution}
                  </p>
                  
                  <span className={`inline-block px-4 py-2 rounded-full text-xs font-bold mt-auto text-center transition-all duration-300 ${
                    member.type === 'mentor'
                      ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/50 group-hover:from-blue-500/40 group-hover:to-cyan-500/40 group-hover:shadow-lg group-hover:shadow-blue-500/25'
                      : member.type === 'volunteer'
                      ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-300 border border-green-500/50 group-hover:from-green-500/40 group-hover:to-emerald-500/40 group-hover:shadow-lg group-hover:shadow-green-500/25'
                      : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/50 group-hover:from-purple-500/40 group-hover:to-pink-500/40 group-hover:shadow-lg group-hover:shadow-purple-500/25'
                  }`}>
                    {member.type.charAt(0).toUpperCase() + member.type.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Past Contributors */}
        <section>
          <h2 className="text-3xl font-bold mb-12 text-gray-900 dark:text-white flex items-center">
            <Award className="w-8 h-8 mr-3 text-primary-600" />
            Past Contributors
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {pastContributors.map((contributor) => (
              <div
                key={contributor.id}
                className="group relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border-l-4 border-primary-600 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-500/0 group-hover:from-primary-500/5 group-hover:to-primary-500/10 rounded-2xl transition-all duration-300 -z-10"></div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{contributor.name}</h3>
                <p className="text-primary-600 dark:text-primary-400 mb-2 font-semibold">{contributor.role}</p>
                <p className="text-gray-600 dark:text-gray-400 mb-2">{contributor.years}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">{contributor.contribution}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Join Form Modal */}
        {showJoinForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border border-gray-100 dark:border-gray-700">
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Join APC Community</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Village *</label>
                  <input
                    type="text"
                    required
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">I want to join as *</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    <option value="volunteer">Volunteer</option>
                    <option value="mentor">Mentor</option>
                    <option value="student">Student</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Skills</label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="e.g., Teaching, Event Management, Web Development"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Interests</label>
                  <input
                    type="text"
                    value={formData.interests}
                    onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                    placeholder="e.g., Education, Community Service, Technology"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Availability</label>
                  <input
                    type="text"
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    placeholder="e.g., Weekends, 5-8 PM on weekdays"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-600/30 transition-all duration-300"
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
