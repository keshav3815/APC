import { Target, Eye, Lightbulb, Heart } from 'lucide-react'

export default function Mission() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Mission */}
          <section className="mb-16">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-6">
                <Target className="w-12 h-12 text-primary-600 mr-4" />
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Our Mission</h1>
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                To empower communities through accessible education, foster meaningful connections, 
                and create opportunities for growth and development. We strive to bridge the gap 
                between resources and those who need them, ensuring that knowledge, books, and 
                support reach every corner of our society.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                Through collaborative efforts, we aim to build a network of engaged citizens who 
                work together to address social challenges, support educational initiatives, and 
                create a more equitable and informed society.
              </p>
            </div>
          </section>

          {/* Vision */}
          <section className="mb-16">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-6">
                <Eye className="w-12 h-12 text-primary-600 mr-4" />
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Our Vision</h2>
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                To become a leading force in community development, where every individual has access 
                to quality education, resources, and opportunities. We envision a future where 
                communities are self-sustaining, well-informed, and actively working towards 
                collective progress.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                Our vision extends beyond immediate impact—we aim to create a legacy of empowered 
                communities that continue to grow, learn, and support each other for generations 
                to come.
              </p>
            </div>
          </section>

          {/* Core Values */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Core Values</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <Lightbulb className="w-10 h-10 text-primary-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Innovation</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We embrace creative solutions and innovative approaches to address community challenges.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <Heart className="w-10 h-10 text-primary-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Compassion</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We approach our work with empathy and a genuine desire to help others succeed.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <Target className="w-10 h-10 text-primary-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Accountability</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We maintain transparency and take responsibility for our actions and their impact.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <Eye className="w-10 h-10 text-primary-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Inclusivity</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We welcome and value diverse perspectives, backgrounds, and contributions.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
