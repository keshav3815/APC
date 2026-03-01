'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { 
  GraduationCap, Users, ArrowLeft, ArrowRight, Sparkles,
  BookOpen, Award, MessageCircle, Lightbulb
} from 'lucide-react'
import StudentForm from './StudentForm'
import MemberForm from './MemberForm'

type Step = 'select' | 'student' | 'member'

export default function JoinCommunity() {
  const [step, setStep] = useState<Step>('select')
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back Link */}
        <Link
          href="/community"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Community
        </Link>

        {step === 'select' && (
          <div className="animate-fadeIn">
            {/* Hero */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 mb-6 shadow-lg shadow-primary-500/30">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600">
                Join APC Community
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Be a part of something meaningful. Choose how you&apos;d like to contribute and grow with us.
              </p>
            </div>

            {/* Selection Cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {/* Student Card */}
              <button
                onClick={() => setStep('student')}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border-2 border-transparent hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    I am a Student
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Join to access study resources, exam prep, community discussions, and get mentorship from experts.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <BookOpen className="w-4 h-4 mr-2 text-blue-500" />
                      Access study resources & books
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <MessageCircle className="w-4 h-4 mr-2 text-blue-500" />
                      Ask doubts & join discussions
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Lightbulb className="w-4 h-4 mr-2 text-blue-500" />
                      Get mentored by professionals
                    </div>
                  </div>
                  <div className="mt-6 flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    Get Started <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                  <div className="mt-3">
                    <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">
                      Auto Approved
                    </span>
                  </div>
                </div>
              </button>

              {/* Member Card */}
              <button
                onClick={() => setStep('member')}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border-2 border-transparent hover:border-purple-500 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    I am a Member
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Join as a Mentor, Teacher, Contributor, or Volunteer to guide students and help the community grow.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Award className="w-4 h-4 mr-2 text-purple-500" />
                      Mentor & teach students
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <MessageCircle className="w-4 h-4 mr-2 text-purple-500" />
                      Answer doubts & create posts
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                      Build your professional profile
                    </div>
                  </div>
                  <div className="mt-6 flex items-center text-purple-600 dark:text-purple-400 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    Get Started <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                  <div className="mt-3">
                    <span className="inline-block px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold rounded-full">
                      Requires Admin Approval
                    </span>
                  </div>
                </div>
              </button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">500+</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">50+</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Mentors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">100+</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Discussions</div>
              </div>
            </div>
          </div>
        )}

        {step === 'student' && (
          <StudentForm onBack={() => setStep('select')} />
        )}

        {step === 'member' && (
          <MemberForm onBack={() => setStep('select')} />
        )}
      </div>
    </div>
  )
}
