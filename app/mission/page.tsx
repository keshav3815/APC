'use client'

import { useEffect, useState } from 'react'
import { Target, Eye, Lightbulb, Heart, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ContentBlock {
  section: string
  title: string
  body: string
}

export default function Mission() {
  const [loading, setLoading] = useState(true)
  const [missionText, setMissionText] = useState<ContentBlock | null>(null)
  const [visionText, setVisionText] = useState<ContentBlock | null>(null)
  const [values, setValues] = useState<ContentBlock[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    const { data } = await supabase
      .from('site_content')
      .select('*')
      .eq('page', 'mission')
      .eq('is_visible', true)
      .order('display_order')

    if (data) {
      setMissionText(data.find((c: any) => c.section === 'mission_text') || null)
      setVisionText(data.find((c: any) => c.section === 'vision_text') || null)
      setValues(data.filter((c: any) => c.section.startsWith('value_')))
    }
    setLoading(false)
  }

  const valueIcons: Record<string, any> = {
    value_innovation: Lightbulb,
    value_compassion: Heart,
    value_accountability: Target,
    value_inclusivity: Eye,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Mission */}
          {missionText && (
            <section className="mb-16">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                <div className="flex items-center mb-6">
                  <Target className="w-12 h-12 text-primary-600 mr-4" />
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{missionText.title}</h1>
                </div>
                {missionText.body.split('\n\n').map((p, i) => (
                  <p key={i} className={`text-lg text-gray-700 dark:text-gray-300 leading-relaxed ${i > 0 ? 'mt-4' : ''}`}>
                    {p}
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* Vision */}
          {visionText && (
            <section className="mb-16">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                <div className="flex items-center mb-6">
                  <Eye className="w-12 h-12 text-primary-600 mr-4" />
                  <h2 className="text-4xl font-bold text-gray-900 dark:text-white">{visionText.title}</h2>
                </div>
                {visionText.body.split('\n\n').map((p, i) => (
                  <p key={i} className={`text-lg text-gray-700 dark:text-gray-300 leading-relaxed ${i > 0 ? 'mt-4' : ''}`}>
                    {p}
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* Core Values */}
          {values.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Core Values</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {values.map((value) => {
                  const Icon = valueIcons[value.section] || Lightbulb
                  return (
                    <div key={value.section} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                      <Icon className="w-10 h-10 text-primary-600 mb-4" />
                      <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{value.title}</h3>
                      <p className="text-gray-700 dark:text-gray-300">{value.body}</p>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
