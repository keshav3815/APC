'use client'

import { FileText, TrendingUp, Users, BookOpen, DollarSign, ArrowRight, PieChart } from 'lucide-react'
import Link from 'next/link'

export default function Transparency() {
  // Real donation and expense data
  const totalDonations = 55538
  const totalExpenses = 24452
  const currentBalance = totalDonations - totalExpenses

  const reports = [
    {
      year: '2025-2026 (Current)',
      donations: totalDonations,
      expenses: totalExpenses,
      balance: currentBalance,
      programs: 15,
      beneficiaries: 8000,
    },
    {
      year: '2023',
      donations: 2500000,
      expenses: 1800000,
      balance: 700000,
      programs: 12,
      beneficiaries: 5000,
    },
    {
      year: '2022',
      donations: 1800000,
      expenses: 1300000,
      balance: 500000,
      programs: 10,
      beneficiaries: 3500,
    },
  ]

  const expenseCategories = [
    { category: 'Education', percentage: 50, amount: 12215 },
    { category: 'Events & Recognition', percentage: 20, amount: 4884 },
    { category: 'Assessment & Testing', percentage: 17, amount: 4097 },
    { category: 'Infrastructure', percentage: 6, amount: 1100 },
    { category: 'Miscellaneous', percentage: 7, amount: 4830 },
  ]

  const donationBreakdown = [
    { category: 'Education Fund', percentage: 45, amount: 25000 },
    { category: 'Community Support', percentage: 32, amount: 18000 },
    { category: 'Health & Wellness', percentage: 23, amount: 12538 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Transparency & Financial Reports
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            We believe in complete accountability. Here's how we use every rupee of your contributions
          </p>
        </div>

        {/* Financial Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="glass-card p-6 rounded-lg text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Raised</h3>
            <div className="text-4xl font-bold text-green-600 mb-2">₹{totalDonations.toLocaleString()}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">From {reports[0].beneficiaries || 0} donors</p>
          </div>

          <div className="glass-card p-6 rounded-lg text-center">
            <DollarSign className="w-12 h-12 mx-auto mb-3 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Spent</h3>
            <div className="text-4xl font-bold text-red-600 mb-2">₹{totalExpenses.toLocaleString()}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Across 19 transactions</p>
          </div>

          <div className="glass-card p-6 rounded-lg text-center">
            <PieChart className="w-12 h-12 mx-auto mb-3 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Utilization Rate</h3>
            <div className="text-4xl font-bold text-primary-600 mb-2">{Math.round((totalExpenses / totalDonations) * 100)}%</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Remaining: ₹{currentBalance.toLocaleString()}</p>
          </div>
        </div>

        {/* Financial Summary Chart */}
        <div className="glass-card p-8 rounded-lg mb-12">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Financial Flow 2025-2026</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Donations */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Income Breakdown</h3>
              <div className="space-y-3">
                {donationBreakdown.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-gray-900 dark:text-white">{item.category}</span>
                      <span className="text-gray-600 dark:text-gray-400">₹{item.amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">{item.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expenses */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Expense Breakdown</h3>
              <div className="space-y-3">
                {expenseCategories.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-gray-900 dark:text-white">{item.category}</span>
                      <span className="text-gray-600 dark:text-gray-400">₹{item.amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-400 to-red-600 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">{item.percentage}%</div>
                  </div>
                ))}
              </div>
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
                  Browse all 19 expense transactions with categories, dates, and full breakdown
                </p>
              </div>
              <ArrowRight className="w-8 h-8 text-primary-600 group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Annual Reports */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary-600" />
            Annual Reports
          </h2>

          <div className="grid gap-6">
            {reports.map((report, index) => (
              <div key={index} className="glass-card p-6 rounded-lg">
                <div className="grid md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Year</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{report.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Donations</p>
                    <p className="text-2xl font-bold text-green-600">₹{report.donations.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Expenses</p>
                    <p className="text-2xl font-bold text-red-600">₹{report.expenses.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Balance</p>
                    <p className="text-2xl font-bold text-primary-600">₹{report.balance.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Beneficiaries</p>
                    <p className="text-2xl font-bold text-blue-600">{report.beneficiaries.toLocaleString()}+</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Our Commitment */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Our Commitment to Transparency</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Regular Audits</h3>
              <p className="text-gray-600 dark:text-gray-400">
                All financial records are audited quarterly by independent auditors to ensure accuracy and compliance.
              </p>
            </div>

            <div className="glass-card p-6 rounded-lg">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Public Reports</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Detailed financial reports are published annually and are available to all stakeholders and the public.
              </p>
            </div>

            <div className="glass-card p-6 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Donor Accountability</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Every donation is tracked and donors can see exactly how their contribution makes a difference.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Frequently Asked Questions</h2>

          <div className="space-y-4">
            {[
              {
                q: 'How much of my donation goes to programs?',
                a: `We allocate approximately 70-80% of all donations directly to our programs and initiatives. The remaining amount covers essential administrative and operational costs.`,
              },
              {
                q: 'Can I see detailed breakdowns of where my money goes?',
                a: `Yes! Every donation is tracked and categorized. You can view our Expense Report page for a detailed breakdown of all transactions, or contact us directly for donor-specific information.`,
              },
              {
                q: 'Are your financial statements audited?',
                a: `Yes, all our financial statements are audited quarterly by independent auditors to ensure complete transparency and compliance with regulations.`,
              },
              {
                q: 'How can I request additional financial information?',
                a: `You can contact us via our Contact page or email with specific questions about our finances. We're committed to being as transparent as possible.`,
              },
            ].map((faq, index) => (
              <details key={index} className="glass-card p-6 rounded-lg">
                <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer flex items-center gap-2">
                  {faq.q}
                </summary>
                <p className="text-gray-600 dark:text-gray-400 mt-4">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
