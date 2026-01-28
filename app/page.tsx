'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, BookOpen, Calendar, Heart, ArrowRight, TrendingUp, Star, Target, Users2, Zap } from 'lucide-react'
import ScrollIndicator from '@/components/ScrollIndicator'
import Badge from '@/components/Badge'

export default function Home() {
  const [stats, setStats] = useState({
    members: 0,
    books: 0,
    events: 0,
    donations: 0,
  })

  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    // Animate counters
    const targets = { members: 1500, books: 500, events: 50, donations: 50000 }
    const duration = 2000
    const steps = 60
    const increment = duration / steps

    let current = { members: 0, books: 0, events: 0, donations: 0 }
    const timer = setInterval(() => {
      current.members = Math.min(current.members + targets.members / steps, targets.members)
      current.books = Math.min(current.books + targets.books / steps, targets.books)
      current.events = Math.min(current.events + targets.events / steps, targets.events)
      current.donations = Math.min(current.donations + targets.donations / steps, targets.donations)
      
      setStats({
        members: Math.floor(current.members),
        books: Math.floor(current.books),
        events: Math.floor(current.events),
        donations: Math.floor(current.donations),
      })

      if (current.members >= targets.members) {
        clearInterval(timer)
      }
    }, increment)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <section className="relative min-h-screen text-white overflow-hidden flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/images/hero.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
            }}
          />
          {/* Dark Overlay for Text Readability - Reduced opacity for better image visibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/50 to-black/60"></div>
        </div>

        {/* Animated Gradient Overlay - Reduced for clarity */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-10 left-10 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-float"></div>
          <div className="absolute -bottom-8 right-10 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-float-slow"></div>
          <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-float"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <div className="flex justify-center mb-6 animate-fade-in-down">
              <Badge icon={Star} text="Welcome to APC Community" variant="primary" animated />
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl md:text-7xl font-bold mb-6 text-center animate-fade-in-up leading-tight drop-shadow-lg">
              <span className="gradient-text-animated">Building a Stronger</span>
              <span className="block">Community Together</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-100 text-center mb-8 animate-fade-in-up delay-100 max-w-2xl mx-auto drop-shadow-md">
              Empowering lives through education, connection, and collaboration. Join thousands transforming their future.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up delay-200">
              <Link
                href="/community"
                className="glass px-8 py-4 rounded-lg font-semibold hover-lift inline-flex items-center justify-center text-gray-900 dark:text-white group shadow-lg"
              >
                <Users2 className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                Join Community
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/donations"
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover-lift inline-flex items-center justify-center group shadow-lg"
              >
                <Heart className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                Support Us
                <Zap className="ml-2 w-5 h-5 group-hover:animate-pulse" />
              </Link>
            </div>

            {/* Stats Preview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 stagger-item">
              <div className="glass p-4 rounded-lg text-center hover-lift shadow-lg">
                <div className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">{stats.members}+</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Members</div>
              </div>
              <div className="glass p-4 rounded-lg text-center hover-lift shadow-lg stagger-item">
                <div className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">{stats.books}+</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Books</div>
              </div>
              <div className="glass p-4 rounded-lg text-center hover-lift shadow-lg stagger-item">
                <div className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">{stats.events}+</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Events</div>
              </div>
              <div className="glass p-4 rounded-lg text-center hover-lift shadow-lg stagger-item">
                <div className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">₹{(stats.donations / 1000).toFixed(0)}K+</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Raised</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <ScrollIndicator />
      </section>

      {/* Impact Stats */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100 dark:bg-primary-900 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-fade-in-down">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              <span className="gradient-text">Our Impact in Numbers</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Transforming communities one step at a time</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Active Members Card */}
            <div className="glass card-hover p-8 rounded-2xl text-center stagger-item group">
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2 animate-pulse-glow">
                1000+
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Active Members</div>
            </div>

            {/* Books Distributed Card */}
            <div className="glass card-hover p-8 rounded-2xl text-center stagger-item group delay-100">
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg group-hover:scale-110 transition-transform">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2 animate-pulse-glow">
                350+
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Books Distributed</div>
            </div>

            {/* Events Organized Card */}
            <div className="glass card-hover p-8 rounded-2xl text-center stagger-item group delay-200">
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2 animate-pulse-glow">
                50+
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Events Organized</div>
            </div>

            {/* Fund Raised Card */}
            <div className="glass card-hover p-8 rounded-2xl text-center stagger-item group delay-300">
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg group-hover:scale-110 transition-transform">
                  <Heart className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2 animate-pulse-glow">
                ₹50K+
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Fund Raised</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-white dark:bg-gray-950 relative overflow-hidden">
        <div className="absolute left-0 top-1/2 w-96 h-96 bg-blue-100 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Section Title */}
            <div className="text-center mb-16 animate-fade-in-down">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                <span className="gradient-text">Our Mission & Vision</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Empowering communities through education and collaboration
              </p>
            </div>

            {/* Mission Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-16 animate-fade-in-up">
              {/* Education */}
              <div className="glass card-hover p-8 rounded-2xl group">
                <div className="mb-4 p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg w-fit group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                  Education First
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Providing access to quality books and learning resources that inspire growth and knowledge sharing.
                </p>
              </div>

              {/* Community */}
              <div className="glass card-hover p-8 rounded-2xl group delay-100 animate-fade-in-up">
                <div className="mb-4 p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg w-fit group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                  Strong Communities
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Building meaningful connections and networks that create lasting impact and support.
                </p>
              </div>

              {/* Impact */}
              <div className="glass card-hover p-8 rounded-2xl group delay-200 animate-fade-in-up">
                <div className="mb-4 p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg w-fit group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                  Real Impact
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Creating measurable change that transforms lives and strengthens entire communities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900"></div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-slow"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Main CTA Heading */}
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in-down leading-tight">
              Ready to Make a <span className="text-primary-200">Real Difference?</span>
            </h2>

            {/* Subtitle */}
            <p className="text-xl text-primary-100 mb-10 animate-fade-in-up delay-100 max-w-2xl mx-auto">
              Join our thriving community of changemakers. Whether you want to learn, volunteer, or donate—there's a place for you at APC.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-200">
              <Link
                href="/community"
                className="group glass px-8 py-4 rounded-lg font-semibold inline-flex items-center justify-center text-primary-600 dark:text-white hover-lift"
              >
                <Users2 className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                Join Community
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/volunteer"
                className="group bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold inline-flex items-center justify-center hover-lift"
              >
                <Zap className="mr-2 w-5 h-5 group-hover:animate-pulse" />
                Volunteer Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Trust Section */}
            <div className="mt-16 pt-12 border-t border-white border-opacity-20">
              <p className="text-primary-100 mb-6 animate-fade-in-up delay-300">Trusted by community members worldwide</p>
              <div className="flex justify-center gap-8 flex-wrap animate-fade-in-up delay-400">
                <Badge text="1500+ Members" variant="primary" />
                <Badge text="500+ Books" variant="primary" />
                <Badge text="50+ Events" variant="primary" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
