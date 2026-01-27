'use client'

import { useState } from 'react'
import { TrendingDown, Filter, Download, BarChart3 } from 'lucide-react'

interface Expense {
  id: number
  description: string
  amount: number
  category: 'education' | 'events' | 'operations' | 'assessment' | 'infrastructure' | 'miscellaneous'
  date: string
}

const expenses: Expense[] = [
  { id: 1, description: 'NMMSS Sept 2022 (Chalk, Attend. Prize)', amount: 110, category: 'education', date: 'Sept 2022' },
  { id: 2, description: 'NMMSS Oct 2022 (Attend. Prize, Class Test)', amount: 350, category: 'education', date: 'Oct 2022' },
  { id: 3, description: 'NMMSS Nov 2022 (Application, Attendance, Chalk)', amount: 684, category: 'education', date: 'Nov 2022' },
  { id: 4, description: 'NMMSS January 2023 (Test, Admit card, Attend. Prize)', amount: 756, category: 'education', date: 'Jan 2023' },
  { id: 5, description: 'NMMSS Dec 2022 (Test, Attendance, Chalk)', amount: 465, category: 'education', date: 'Dec 2022' },
  { id: 6, description: 'NMMSS Aug. 2022 (Test, Register, Chalk)', amount: 550, category: 'education', date: 'Aug 2022' },
  { id: 7, description: 'Medal & Certificate (4) Jan 2026', amount: 140, category: 'events', date: 'Jan 2026' },
  { id: 8, description: 'Lucent GK Book (10) Prize Jan 2026', amount: 2160, category: 'education', date: 'Jan 2026' },
  { id: 9, description: 'Lucent Book 1p 10th topper 2021', amount: 130, category: 'education', date: '2021' },
  { id: 10, description: 'Jild Book 10p', amount: 750, category: 'education', date: 'Unknown' },
  { id: 11, description: 'Gadi Bhada Mithilesh ji', amount: 400, category: 'infrastructure', date: 'Unknown' },
  { id: 12, description: 'Flipkart Sociology Book UGC NET Paper1', amount: 322, category: 'education', date: 'Unknown' },
  { id: 13, description: 'Dopta 21p', amount: 4830, category: 'miscellaneous', date: 'Unknown' },
  { id: 14, description: 'Chair, Mat Param ji', amount: 700, category: 'infrastructure', date: 'Unknown' },
  { id: 15, description: 'Cash Prize & Envelope (04) Jan 2026', amount: 3144, category: 'events', date: 'Jan 2026' },
  { id: 16, description: 'Test Question, Answer Sheets, Prize, HM Sir Felicitation (5/1/2025)', amount: 4097, category: 'assessment', date: 'Jan 2025' },
  { id: 17, description: '33 Books of 10th syllabus and one stamp of APC Made by Sumit', amount: 3500, category: 'education', date: 'Unknown' },
  { id: 18, description: '15 Aug 2022 (Test, Prize, Program)', amount: 1435, category: 'events', date: 'Aug 2022' },
  { id: 19, description: '12 Books History, Geography, Economic, Polity 11 May 2025', amount: 430, category: 'education', date: 'May 2025' },
]

const categoryColors: Record<string, { bg: string; text: string; icon: string }> = {
  education: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200', icon: '📚' },
  events: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-800 dark:text-purple-200', icon: '🎉' },
  operations: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200', icon: '⚙️' },
  assessment: { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-800 dark:text-orange-200', icon: '📝' },
  infrastructure: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-200', icon: '🏗️' },
  miscellaneous: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-200', icon: '📦' },
}

export default function Expenses() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredExpenses = expenses.filter((expense) => {
    const matchesCategory = !selectedCategory || expense.category === selectedCategory
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const filteredTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

  const categoryTotals = Object.fromEntries(
    Object.keys(categoryColors).map((cat) => [
      cat,
      expenses.filter((e) => e.category === cat).reduce((sum, e) => sum + e.amount, 0),
    ])
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white">Expense Management</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Complete transparency in how we utilize donor contributions
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="glass-card p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Expenses</h3>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">₹{totalExpenses.toLocaleString()}</div>
            <p className="text-gray-600 dark:text-gray-400">Across {expenses.length} transactions</p>
          </div>

          <div className="glass-card p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Avg. Transaction</h3>
              <BarChart3 className="w-8 h-8 text-primary-600" />
            </div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">₹{Math.round(totalExpenses / expenses.length).toLocaleString()}</div>
            <p className="text-gray-600 dark:text-gray-400">{(totalExpenses / expenses.length).toFixed(2)} per transaction</p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Expense by Category</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(categoryColors).map(([category, colors]) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                className={`p-4 rounded-lg transition-all ${
                  selectedCategory === category
                    ? `${colors.bg} ring-2 ring-primary-600`
                    : `${colors.bg} hover:ring-2 hover:ring-primary-300`
                }`}
              >
                <div className="text-3xl mb-2">{categoryColors[category].icon}</div>
                <div className={`font-semibold text-sm capitalize mb-2 ${colors.text}`}>{category}</div>
                <div className={`text-lg font-bold ${colors.text}`}>₹{categoryTotals[category as keyof typeof categoryTotals]?.toLocaleString()}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:border-primary-600"
          />
        </div>

        {/* Expense List */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              All Expenses {selectedCategory && `(${filteredExpenses.length})`}
            </h2>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-semibold"
              >
                Clear Filter
              </button>
            )}
          </div>

          <div className="space-y-4">
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense, index) => {
                const colors = categoryColors[expense.category]
                return (
                  <div
                    key={expense.id}
                    className="glass-card p-6 rounded-lg flex items-center justify-between hover:shadow-lg transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{colors.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{expense.description}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{expense.date}</p>
                        </div>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-lg ${colors.bg} text-right`}>
                      <div className={`text-xl font-bold ${colors.text}`}>₹{expense.amount.toLocaleString()}</div>
                      <div className={`text-xs capitalize ${colors.text}`}>{expense.category}</div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 text-lg">No expenses found matching your search.</p>
              </div>
            )}
          </div>

          {filteredExpenses.length > 0 && (
            <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg border-t-4 border-primary-600">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                <span className="text-3xl font-bold text-primary-600">₹{filteredTotal.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Category Distribution Chart */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Distribution</h2>
          <div className="space-y-4">
            {Object.entries(categoryTotals)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => {
                const colors = categoryColors[category]
                const percentage = (amount / totalExpenses) * 100
                return (
                  <div key={category} className="glass-card p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="capitalize font-semibold text-gray-900 dark:text-white">
                        {categoryColors[category].icon} {category}
                      </span>
                      <span className="text-sm font-bold text-gray-600 dark:text-gray-400">₹{amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          category === 'education'
                            ? 'bg-blue-500'
                            : category === 'events'
                              ? 'bg-purple-500'
                              : category === 'assessment'
                                ? 'bg-orange-500'
                                : category === 'infrastructure'
                                  ? 'bg-yellow-500'
                                  : 'bg-gray-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-right text-sm text-gray-600 dark:text-gray-400 mt-1">{percentage.toFixed(1)}%</div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}
