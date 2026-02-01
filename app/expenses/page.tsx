'use client'

import { useState, useEffect } from 'react'
import { TrendingDown, Filter, Download, BarChart3, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Expense {
  id: string
  description: string
  amount: number
  category: 'education' | 'events' | 'operations' | 'assessment' | 'infrastructure' | 'miscellaneous'
  date: string
}

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
  const [loading, setLoading] = useState(true)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', 'expense')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data && data.length > 0) {
        setExpenses(data.map((e: any) => ({
          id: e.id,
          description: e.description,
          amount: e.amount,
          category: e.category || 'miscellaneous',
          date: e.date || new Date(e.created_at).toLocaleDateString()
        })))
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setLoading(false)
    }
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

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
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">₹{expenses.length > 0 ? Math.round(totalExpenses / expenses.length).toLocaleString() : 0}</div>
            <p className="text-gray-600 dark:text-gray-400">{expenses.length > 0 ? (totalExpenses / expenses.length).toFixed(2) : '0.00'} per transaction</p>
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
