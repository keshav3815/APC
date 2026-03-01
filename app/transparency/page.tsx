'use client'

import { useEffect, useState } from 'react'
import { FileText, TrendingUp, Users, BookOpen, DollarSign, ArrowRight, PieChart, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface FAQ {
  id: string
  question: string
  answer: string
  display_order: number
}

interface ContentBlock {
  id: string
  section: string
  title: string
  body: string
}

export default function Transparency() {
  const [loading, setLoading] = useState(true)
  const [totalDonations, setTotalDonations] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [transactionCount, setTransactionCount] = useState(0)
  const [donorCount, setDonorCount] = useState(0)
  const [expenseBreakdown, setExpenseBreakdown] = useState<{category: string, amount: number, percentage: number}[]>([])
  const [incomeBreakdown, setIncomeBreakdown] = useState<{category: string, amount: number, percentage: number}[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [commitmentCards, setCommitmentCards] = useState<ContentBlock[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchAll()
    const sub = supabase
      .channel('transparency-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => fetchFinancials())
      .subscribe()
    return () => { sub.unsubscribe() }
  }, [])

  const fetchAll = async () => {
    await Promise.all([fetchFinancials(), fetchFAQs(), fetchCommitmentCards()])
    setLoading(false)
  }

  const fetchFinancials = async () => {
    try {
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })

      if (transactions && transactions.length > 0) {
        let income = 0
        let expense = 0
        const incomeByCategory: Record<string, number> = {}
        const expenseByCategory: Record<string, number> = {}
        const donorNames = new Set<string>()

        transactions.forEach((t: any) => {
          if (t.type === 'income') {
            income += Number(t.amount)
            const cat = t.category || 'General'
            incomeByCategory[cat] = (incomeByCategory[cat] || 0) + Number(t.amount)
            if (t.description) donorNames.add(t.description.split(' - ')[0])
          } else {
            expense += Number(t.amount)
            const cat = t.category || 'Miscellaneous'
            expenseByCategory[cat] = (expenseByCategory[cat] || 0) + Number(t.amount)
          }
        })

        setTotalDonations(income)
        setTotalExpenses(expense)
        setTransactionCount(transactions.filter((t: any) => t.type === 'expense').length)
        setDonorCount(donorNames.size || transactions.filter((t: any) => t.type === 'income').length)

        const incomeArr = Object.entries(incomeByCategory).map(([category, amount]) => ({
          category, amount,
          percentage: income > 0 ? Math.round((amount / income) * 100) : 0,
        })).sort((a, b) => b.amount - a.amount)

        const expenseArr = Object.entries(expenseByCategory).map(([category, amount]) => ({
          category, amount,
          percentage: expense > 0 ? Math.round((amount / expense) * 100) : 0,
        })).sort((a, b) => b.amount - a.amount)

        setIncomeBreakdown(incomeArr)
        setExpenseBreakdown(expenseArr)
      }
    } catch (err) {
      console.error('Error fetching financials:', err)
    }
  }

  const fetchFAQs = async () => {
    const { data } = await supabase
      .from('faqs')
      .select('*')
      .eq('page', 'transparency')
      .eq('is_visible', true)
      .order('display_order')
    if (data) setFaqs(data)
  }

  const fetchCommitmentCards = async () => {
    const { data } = await supabase
      .from('site_content')
      .select('*')
      .eq('page', 'transparency')
      .like('section', 'commit_%')
      .eq('is_visible', true)
      .order('display_order')
    if (data) setCommitmentCards(data)
  }

  const currentBalance = totalDonations - totalExpenses
  const utilization = totalDonations > 0 ? Math.round((totalExpenses / totalDonations) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Transparency & Financial Reports
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            We believe in complete accountability. Here&apos;s how we use every rupee of your contributions
          </p>
        </div>

        {/* Financial Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="glass-card p-6 rounded-lg text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Raised</h3>
            <div className="text-4xl font-bold text-green-600 mb-2">₹{totalDonations.toLocaleString('en-IN')}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">From {donorCount} donors</p>
          </div>

          <div className="glass-card p-6 rounded-lg text-center">
            <DollarSign className="w-12 h-12 mx-auto mb-3 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Spent</h3>
            <div className="text-4xl font-bold text-red-600 mb-2">₹{totalExpenses.toLocaleString('en-IN')}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Across {transactionCount} transactions</p>
          </div>

          <div className="glass-card p-6 rounded-lg text-center">
            <PieChart className="w-12 h-12 mx-auto mb-3 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Utilization Rate</h3>
            <div className="text-4xl font-bold text-primary-600 mb-2">{utilization}%</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Remaining: ₹{currentBalance.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Financial Summary Chart */}
        <div className="glass-card p-8 rounded-lg mb-12">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Financial Flow</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Income */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Income Breakdown</h3>
              {incomeBreakdown.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No income data available yet.</p>
              ) : (
                <div className="space-y-3">
                  {incomeBreakdown.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white">{item.category}</span>
                        <span className="text-gray-600 dark:text-gray-400">₹{item.amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500" style={{ width: `${item.percentage}%` }} />
                      </div>
                      <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">{item.percentage}%</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Expenses */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Expense Breakdown</h3>
              {expenseBreakdown.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No expense data available yet.</p>
              ) : (
                <div className="space-y-3">
                  {expenseBreakdown.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white">{item.category}</span>
                        <span className="text-gray-600 dark:text-gray-400">₹{item.amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-orange-400 to-red-600 h-2 rounded-full transition-all duration-500" style={{ width: `${item.percentage}%` }} />
                      </div>
                      <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">{item.percentage}%</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Expenses Link */}
        <Link href="/expenses">
          <div className="glass-card p-8 rounded-lg mb-12 hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <FileText className="w-8 h-8 text-primary-600" />
                  View Detailed Expense Report
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Browse all {transactionCount} expense transactions with categories, dates, and full breakdown
                </p>
              </div>
              <ArrowRight className="w-8 h-8 text-primary-600 group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Our Commitment */}
        {commitmentCards.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Our Commitment to Transparency</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {commitmentCards.map((card, idx) => {
                const iconMap = [BookOpen, TrendingUp, Users]
                const colorMap = ['blue', 'green', 'purple']
                const Icon = iconMap[idx] || BookOpen
                const color = colorMap[idx] || 'blue'
                return (
                  <div key={card.id} className="glass-card p-6 rounded-lg">
                    <div className={`w-12 h-12 bg-${color}-100 dark:bg-${color}-900 rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 text-${color}-600`} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{card.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{card.body}</p>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* FAQs */}
        {faqs.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <details key={faq.id} className="glass-card p-6 rounded-lg">
                  <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer flex items-center gap-2">
                    {faq.question}
                  </summary>
                  <p className="text-gray-600 dark:text-gray-400 mt-4">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
