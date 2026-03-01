'use client'

import { useEffect, useState } from 'react'
import { Users, Target, Award, Heart, Zap, TrendingUp, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ContentBlock {
  section: string
  title: string
  body: string
}

export default function About() {
  const [loading, setLoading] = useState(true)
  const [story, setStory] = useState<ContentBlock | null>(null)
  const [valueCards, setValueCards] = useState<ContentBlock[]>([])
  const [stats, setStats] = useState<{key: string, label: string, value: number}[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    const [contentRes, statsRes] = await Promise.all([
      supabase.from('site_content').select('*').eq('page', 'about').eq('is_visible', true).order('display_order'),
      supabase.from('stats').select('*').eq('is_visible', true).order('display_order'),
    ])

    if (contentRes.data) {
      const storyBlock = contentRes.data.find((c: any) => c.section === 'story')
      if (storyBlock) setStory(storyBlock)
      setValueCards(contentRes.data.filter((c: any) => c.section.startsWith('value_')))
    }

    if (statsRes.data) {
      setStats(statsRes.data.map((s: any) => ({ key: s.key, label: s.label, value: s.value })))
    }

    setLoading(false)
  }

  const getStatValue = (key: string) => {
    const s = stats.find(st => st.key === key)
    return s ? s.value.toLocaleString('en-IN') : '0'
  }

  const getStatLabel = (key: string, fallback: string) => {
    const s = stats.find(st => st.key === key)
    return s ? s.label : fallback
  }

  const valueIcons: Record<string, any> = {
    value_community: Users,
    value_goals: Target,
    value_recognition: Award,
    value_values: Heart,
  }

  const valueColors = ['blue', 'green', 'purple', 'pink']

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
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
            {story && (
              <div className="glass card-hover p-12 rounded-2xl mb-16 stagger-item">
                {story.body.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className={`text-lg text-gray-700 dark:text-gray-300 leading-relaxed ${idx > 0 ? 'mt-6' : ''}`}>
                    {idx === 0 && (
                      <span className="font-bold text-primary-600 dark:text-primary-400">APC (Association for Progressive Community)</span>
                    )}
                    {idx === 0 ? paragraph.replace('APC (Association for Progressive Community)', '') : paragraph}
                  </p>
                ))}
              </div>
            )}

            {/* Values Grid */}
            {valueCards.length > 0 && (
              <div className="grid md:grid-cols-2 gap-8 mb-16">
                {valueCards.map((card, idx) => {
                  const Icon = valueIcons[card.section] || Heart
                  const color = valueColors[idx % valueColors.length]
                  return (
                    <div key={card.section} className={`glass card-hover p-8 rounded-2xl stagger-item group ${idx > 0 ? `delay-${idx * 100}` : ''}`}>
                      <div className={`mb-4 p-3 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-lg w-fit group-hover:scale-110 transition-transform`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{card.title}</h2>
                      <p className="text-gray-700 dark:text-gray-300">{card.body}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {stats.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-950">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">
              <span className="gradient-text">Our Impact</span>
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.slice(0, 4).map((stat, idx) => {
                const icons = [Users, TrendingUp, Award, Zap]
                const colors = ['blue', 'green', 'purple', 'pink']
                const Icon = icons[idx % icons.length]
                const color = colors[idx % colors.length]
                return (
                  <div key={stat.key} className={`glass card-hover p-6 rounded-2xl text-center stagger-item ${idx > 0 ? `delay-${idx * 100}` : ''}`}>
                    <div className="mb-4 flex justify-center">
                      <div className={`p-3 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.value.toLocaleString('en-IN')}+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
