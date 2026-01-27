'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Send, Facebook, Twitter, Instagram, Linkedin, ArrowRight, Clock, MessageSquare } from 'lucide-react'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Thank you for your message! We will get back to you soon.')
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
          <div className="absolute -bottom-8 right-10 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-slow"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up leading-tight">
              Get in <span className="gradient-text-animated">Touch</span>
            </h1>
            <p className="text-xl text-primary-100 animate-fade-in-up delay-100">
              We'd love to hear from you. Reach out to us anytime
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div className="space-y-6 animate-fade-in-left">
                {/* Email */}
                <div className="glass card-hover p-8 rounded-2xl group">
                  <div className="mb-4 p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg w-fit group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Email</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">contact@apc.org</p>
                  <p className="text-gray-700 dark:text-gray-300">info@apc.org</p>
                </div>

                {/* Phone */}
                <div className="glass card-hover p-8 rounded-2xl group delay-100 stagger-item">
                  <div className="mb-4 p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg w-fit group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Phone</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">+91 1234567890</p>
                  <p className="text-gray-700 dark:text-gray-300">+91 9876543210</p>
                </div>

                {/* Address */}
                <div className="glass card-hover p-8 rounded-2xl group delay-200 stagger-item">
                  <div className="mb-4 p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg w-fit group-hover:scale-110 transition-transform">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Address</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    123 Community Street<br />
                    Mumbai, Maharashtra 400001<br />
                    India
                  </p>
                </div>

                {/* Social */}
                <div className="glass card-hover p-8 rounded-2xl delay-300 stagger-item">
                  <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Follow Us</h3>
                  <div className="flex space-x-4">
                    <a href="#" className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover-lift transition-all">
                      <Facebook className="w-5 h-5" />
                    </a>
                    <a href="#" className="p-3 bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-lg hover-lift transition-all">
                      <Twitter className="w-5 h-5" />
                    </a>
                    <a href="#" className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-lg hover-lift transition-all">
                      <Instagram className="w-5 h-5" />
                    </a>
                    <a href="#" className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg hover-lift transition-all">
                      <Linkedin className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="glass card-hover p-10 rounded-2xl animate-fade-in-right">
                <div className="flex items-center mb-6">
                  <MessageSquare className="w-6 h-6 text-primary-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Send us a Message</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div className="stagger-item">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600 transition-all"
                      placeholder="Your name"
                    />
                  </div>

                  {/* Email */}
                  <div className="stagger-item delay-100">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600 transition-all"
                      placeholder="your@email.com"
                    />
                  </div>

                  {/* Phone */}
                  <div className="stagger-item delay-200">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600 transition-all"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>

                  {/* Subject */}
                  <div className="stagger-item delay-300">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Subject *</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600 transition-all"
                      placeholder="How can we help?"
                    />
                  </div>

                  {/* Message */}
                  <div className="stagger-item delay-400">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600 transition-all resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover-lift transition-all inline-flex items-center justify-center group stagger-item delay-500"
                  >
                    Send Message 
                    <Send className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>

                <p className="mt-6 text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  We typically respond within 24 hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
