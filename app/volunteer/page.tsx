'use client'

import { useState } from 'react'
import { Users, Clock, MapPin, Heart, CheckCircle, ArrowRight } from 'lucide-react'

export default function Volunteer() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    skills: '',
    interests: '',
    availability: '',
    experience: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Thank you for your interest in volunteering! We will contact you soon.')
    setFormData({
      name: '', email: '', phone: '', city: '', skills: '', interests: '', availability: '', experience: ''
    })
  }

  const opportunities = [
    {
      title: 'Event Organization',
      description: 'Help organize and manage community events',
      time: '5-10 hours/week',
      skills: 'Event management, Communication',
    },
    {
      title: 'Book Distribution',
      description: 'Coordinate book donations and distributions',
      time: '3-5 hours/week',
      skills: 'Logistics, Community outreach',
    },
    {
      title: 'Teaching & Mentoring',
      description: 'Teach or mentor students in various subjects',
      time: '4-8 hours/week',
      skills: 'Teaching, Subject expertise',
    },
    {
      title: 'Digital Support',
      description: 'Help with website, social media, and digital initiatives',
      time: '5-10 hours/week',
      skills: 'Digital skills, Content creation',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Volunteer with APC
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Make a difference in your community
            </p>
          </div>

          {/* Why Volunteer */}
          <section className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mb-12">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Why Volunteer?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <Heart className="w-12 h-12 mx-auto mb-3 text-primary-600" />
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Make Impact</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Contribute to meaningful causes and see real change
                </p>
              </div>
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-3 text-primary-600" />
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Build Community</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Connect with like-minded individuals and expand your network
                </p>
              </div>
              <div className="text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-primary-600" />
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Grow Skills</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Develop new skills and gain valuable experience
                </p>
              </div>
            </div>
          </section>

          {/* Volunteer Opportunities */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Volunteer Opportunities</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {opportunities.map((opp, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
                >
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{opp.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{opp.description}</p>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <Clock className="w-4 h-4 mr-2" />
                    {opp.time}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Skills needed:</strong> {opp.skills}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Volunteer Form */}
          <section className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Join as a Volunteer</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
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
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Skills *</label>
                <input
                  type="text"
                  required
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g., Teaching, Event Management, Web Development"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Interests *</label>
                <input
                  type="text"
                  required
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  placeholder="e.g., Education, Community Service, Technology"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Availability *</label>
                <input
                  type="text"
                  required
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  placeholder="e.g., Weekends, 5-8 PM on weekdays"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Previous Volunteer Experience</label>
                <textarea
                  rows={3}
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="Tell us about your previous volunteer experience (optional)"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors inline-flex items-center justify-center"
              >
                Submit Application <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}
