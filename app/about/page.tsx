'use client'

import { Users, Target, Award, Heart, Zap, TrendingUp } from 'lucide-react'

export default function About() {
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
              About <span className="gradient-text">APC</span>
            </h1>
            <p className="text-xl text-primary-100 animate-fade-in-up delay-100">
              Empowering communities, transforming lives
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Story Section */}
            <div className="glass card-hover p-12 rounded-2xl mb-16 stagger-item">
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                <span className="font-bold text-primary-600 dark:text-primary-400">APC (Association for Progressive Community)</span> is a non-profit organization dedicated to empowering communities through education, collaboration, and social impact. Founded with a vision to create positive change, we work tirelessly to bridge gaps and create opportunities for all.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                Our organization brings together volunteers, donors, mentors, and students from across the country to work towards common goals. Through our various programs including book sharing, educational events, and community initiatives, we've touched thousands of lives.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                We believe in transparency, accountability, and the power of collective action. Every donation, every volunteer hour, and every book shared contributes to building a stronger, more educated, and more connected community.
              </p>
            </div>

            {/* Values Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {/* Community */}
              <div className="glass card-hover p-8 rounded-2xl stagger-item group">
                <div className="mb-4 p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg w-fit group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">Our Community</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Over 1,250 active members working together to create impact across 25+ cities in India.
                </p>
              </div>

              {/* Goals */}
              <div className="glass card-hover p-8 rounded-2xl stagger-item delay-100 group">
                <div className="mb-4 p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg w-fit group-hover:scale-110 transition-transform">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">Our Goals</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  To make education accessible, foster community connections, and create measurable social impact.
                </p>
              </div>

              {/* Recognition */}
              <div className="glass card-hover p-8 rounded-2xl stagger-item delay-200 group">
                <div className="mb-4 p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg w-fit group-hover:scale-110 transition-transform">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">Recognition</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Recognized for excellence in community service and educational initiatives by various organizations.
                </p>
              </div>

              {/* Values */}
              <div className="glass card-hover p-8 rounded-2xl stagger-item delay-300 group">
                <div className="mb-4 p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg w-fit group-hover:scale-110 transition-transform">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">Our Values</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Integrity, transparency, inclusivity, and commitment to creating lasting positive change.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">
            <span className="gradient-text">Our Impact</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="glass card-hover p-6 rounded-2xl text-center stagger-item">
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">1,250+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Members</div>
            </div>

            <div className="glass card-hover p-6 rounded-2xl text-center stagger-item delay-100">
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">25+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Cities</div>
            </div>

            <div className="glass card-hover p-6 rounded-2xl text-center stagger-item delay-200">
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">15,000+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Hours Served</div>
            </div>

            <div className="glass card-hover p-6 rounded-2xl text-center stagger-item delay-300">
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">3,500+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Books Shared</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
