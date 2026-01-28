'use client'

import { useState } from 'react'
import { Heart, TrendingUp, TrendingDown, Target, Users, CheckCircle, CreditCard, Smartphone, Globe } from 'lucide-react'

interface Campaign {
  id: number
  title: string
  purpose: 'education' | 'food' | 'health'
  raised: number
  target: number
  description: string
}

interface Donor {
  name: string
  amount: number
}

const campaigns: Campaign[] = [
  {
    id: 1,
    title: 'Education for All',
    purpose: 'education',
    raised: 25000,
    target: 50000,
    description: 'Support underprivileged students with books and educational materials. Build 10 libraries in rural areas.',
  },
  {
    id: 2,
    title: 'Community Support Fund',
    purpose: 'food',
    raised: 18000,
    target: 40000,
    description: 'Provide nutritious meals and food security to families in need during emergencies.',
  },
  {
    id: 3,
    title: 'Health & Wellness Initiative',
    purpose: 'health',
    raised: 12538,
    target: 35000,
    description: 'Medical camps, health checkups, and assistance for low-income families in rural areas.',
  },
]

const donors: Donor[] = [
  { name: 'Mr & Mrs Ashish Kr Singh Ji', amount: 28508 },
  { name: 'Prem Shanker Jha ji', amount: 2502 },
  { name: 'NMMSS Shivir 2022 Stud. Reg.', amount: 2315 },
  { name: 'Shiv Kr Singh Ji', amount: 2100 },
  { name: 'S Kumar Singh Ji', amount: 2000 },
  { name: 'Vivek Kr Raut Ji', amount: 1500 },
  { name: 'Mintu kr jha ji', amount: 1500 },
  { name: 'Rajeev Kr Singh Ji', amount: 1500 },
  { name: 'APC Bal. Abhay', amount: 1204 },
  { name: 'Ashok kr Sah ji', amount: 1101 },
  { name: 'Priya Jha ji', amount: 1100 },
  { name: 'Ramesh Choudhry ji', amount: 1100 },
  { name: 'Kanhaiya Mandal Ji', amount: 1001 },
  { name: 'Durganand Mukhiya', amount: 1001 },
  { name: 'Keshav Choudhry Ji', amount: 1001 },
  { name: 'Alok Ranjan Jha ji', amount: 1000 },
  { name: 'APC Bal. Rajan', amount: 602 },
  { name: 'CA Rakesh Pathak Ji', amount: 501 },
  { name: 'R Kumar Ji', amount: 501 },
  { name: 'Satosh Yadav Ji', amount: 501 },
  { name: 'S Kumar Ji', amount: 501 },
  { name: 'Raja Kr Jha ji', amount: 500 },
  { name: 'Sanjay Singh Sir', amount: 500 },
  { name: 'Govind Mishra ji', amount: 500 },
  { name: 'Sanjay Mishra Ji', amount: 500 },
  { name: 'Ranjay Yadav Ji', amount: 251 },
  { name: 'NMMSS 3 Student Reg. September', amount: 150 },
  { name: 'Rajan Kumar Singh Ji', amount: 602 },
]

const impactStories = [
  {
    id: 1,
    name: 'Rahul\'s Story',
    text: 'Thanks to APC donations, I was able to complete my engineering degree. The scholarship and books made all the difference.',
    category: 'education',
  },
  {
    id: 2,
    name: 'Community Kitchen Success',
    text: 'Our food drive helped feed 500+ families during the pandemic. Your donations made this possible.',
    category: 'food',
  },
  {
    id: 3,
    name: 'Medical Camp Impact',
    text: 'Free health checkups for 300+ people in rural areas. Early detection saved many lives.',
    category: 'health',
  },
]

export default function Donations() {
  const [donationType, setDonationType] = useState<'one-time' | 'monthly'>('one-time')
  const [amount, setAmount] = useState(500)
  const [purpose, setPurpose] = useState('education')
  const [donorInfo, setDonorInfo] = useState({ name: '', email: '', phone: '' })
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'razorpay' | 'stripe'>('razorpay')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  const totalDonated = donors.reduce((sum, donor) => sum + donor.amount, 0)
  const activeDonors = donors.filter(d => d.amount > 0).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-blue-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-600/10">
              <Heart className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-primary-600">
            Your Donation Makes a Difference
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Join us in supporting education, community, and health initiatives across rural India
          </p>
        </div>

        {/* Financial Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="group relative bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-primary-500/0 group-hover:from-green-500/5 group-hover:to-primary-500/10 rounded-2xl transition-all duration-300"></div>
            <TrendingUp className="w-12 h-12 mb-3 text-green-600 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">₹55,538</div>
            <div className="text-gray-600 dark:text-gray-400 font-medium">Total Income</div>
          </div>
          <div className="group relative bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-primary-500/0 group-hover:from-red-500/5 group-hover:to-primary-500/10 rounded-2xl transition-all duration-300"></div>
            <TrendingDown className="w-12 h-12 mb-3 text-red-600 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">₹41,214</div>
            <div className="text-gray-600 dark:text-gray-400 font-medium">Total Expenses</div>
          </div>
          <div className="group relative bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-primary-500/0 group-hover:from-blue-500/5 group-hover:to-primary-500/10 rounded-2xl transition-all duration-300"></div>
            <Heart className="w-12 h-12 mb-3 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">₹1,915</div>
            <div className="text-gray-600 dark:text-gray-400 font-medium">Avg Income</div>
          </div>
          <div className="group relative bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-primary-500/0 group-hover:from-purple-500/5 group-hover:to-primary-500/10 rounded-2xl transition-all duration-300"></div>
            <Target className="w-12 h-12 mb-3 text-primary-600 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">₹14,324</div>
            <div className="text-gray-600 dark:text-gray-400 font-medium">Total Balance</div>
          </div>
        </div>

        {/* Impact Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="group relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-primary-500/10 group-hover:from-primary-500/10 group-hover:to-primary-500/20 rounded-2xl transition-all duration-300"></div>
            <div className="flex items-center justify-between">
              <div>
                <Users className="w-12 h-12 mb-3 text-primary-600 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">{activeDonors}</div>
                <div className="text-lg text-gray-600 dark:text-gray-400 font-medium mt-2">Generous Donors</div>
              </div>
              <div className="text-6xl opacity-10">👥</div>
            </div>
          </div>
          <div className="group relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-primary-500/10 group-hover:from-red-500/10 group-hover:to-primary-500/20 rounded-2xl transition-all duration-300"></div>
            <div className="flex items-center justify-between">
              <div>
                <Heart className="w-12 h-12 mb-3 text-red-600 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">₹{totalDonated.toLocaleString()}</div>
                <div className="text-lg text-gray-600 dark:text-gray-400 font-medium mt-2">Total Raised</div>
              </div>
              <div className="text-6xl opacity-10">💝</div>
            </div>
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Active Campaigns</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="group relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-500/0 group-hover:from-primary-500/5 group-hover:to-primary-500/15 rounded-2xl transition-all duration-300 -z-10"></div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{campaign.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{campaign.description}</p>
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-3">
                    <span className="font-bold text-gray-900 dark:text-white">₹{campaign.raised.toLocaleString()}</span>
                    <span className="text-gray-600 dark:text-gray-400">of ₹{campaign.target.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 h-3 rounded-full transition-all duration-500 shadow-lg shadow-primary-500/30"
                      style={{ width: `${(campaign.raised / campaign.target) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-primary-600 dark:text-primary-400 font-semibold mt-2">{Math.round((campaign.raised / campaign.target) * 100)}% funded</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Donation Form */}
        <section className="mb-16">
          {/* Eye-catching header */}
          <div className="mb-12 bg-gradient-to-br from-primary-600 via-red-500 to-primary-700 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full -mr-24 -mt-24"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
            <div className="relative z-10">
              <Heart className="w-20 h-20 mx-auto mb-6 animate-pulse text-red-200" />
              <h2 className="text-5xl md:text-6xl font-bold mb-6">Make Your Donation</h2>
              <p className="text-lg md:text-xl opacity-95 max-w-3xl mx-auto leading-relaxed">
                Your generosity directly impacts thousands of lives. Every rupee counts in our mission to build a better future for underprivileged communities.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 border border-gray-100 dark:border-gray-700">
            {submitted && (
              <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-2 border-green-300 dark:border-green-600/50 text-green-700 dark:text-green-300 rounded-2xl flex items-center gap-4 animate-bounce">
                <CheckCircle className="w-7 h-7 flex-shrink-0" />
                <span className="text-lg font-bold">✓ Thank you! Your donation has been recorded. We appreciate your support!</span>
              </div>
            )}

            {/* Donation Type Selection */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Choose Donation Type</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <button
                  type="button"
                  onClick={() => setDonationType('one-time')}
                  className={`group p-8 border-3 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    donationType === 'one-time'
                      ? 'border-primary-600 bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/30 dark:to-primary-800/20 shadow-xl'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 bg-gray-50 dark:bg-gray-700/50'
                  }`}
                >
                  <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">One-Time Donation</div>
                  <div className="text-base text-gray-600 dark:text-gray-400 mt-2">Make a single donation</div>
                </button>
                <button
                  type="button"
                  onClick={() => setDonationType('monthly')}
                  className={`group relative p-8 border-3 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    donationType === 'monthly'
                      ? 'border-primary-600 bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/30 dark:to-primary-800/20 shadow-xl'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 bg-gray-50 dark:bg-gray-700/50'
                  }`}
                >
                  <span className="absolute top-4 right-4 bg-gradient-to-r from-primary-600 to-red-600 text-white text-xs font-bold px-4 py-2 rounded-full animate-pulse">
                    MOST IMPACTFUL
                  </span>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Monthly Donation</div>
                  <div className="text-base text-gray-600 dark:text-gray-400 mt-2">Recurring monthly support</div>
                </button>
              </div>
            </div>

            {/* Amount Selection */}
            <div className="mb-12">
              <div className="flex items-baseline justify-between mb-6">
                <label className="text-2xl font-bold text-gray-900 dark:text-white">Select Amount</label>
                <span className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-red-600">₹{amount.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="100"
                max="100000"
                step="100"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-4 bg-gray-300 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-primary-600"
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
                {[500, 1000, 5000, 10000].map((presetAmount) => (
                  <button
                    key={presetAmount}
                    type="button"
                    onClick={() => setAmount(presetAmount)}
                    className={`group p-4 rounded-xl border-3 font-bold transition-all duration-200 transform hover:scale-110 ${
                      amount === presetAmount
                        ? 'border-primary-600 bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-xl shadow-primary-600/40'
                        : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:border-primary-400 dark:hover:border-primary-500'
                    }`}
                  >
                    ₹{presetAmount.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Donation Purpose - Hidden */}
            <div className="hidden mb-10">
              <label className="text-xl font-bold text-gray-900 dark:text-white mb-4 block">Donation Purpose</label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700/50 dark:text-white text-lg font-semibold focus:border-primary-600 focus:outline-none transition-colors"
              >
                <option value="education">🎓 Education - Books, Libraries & Scholarships</option>
                <option value="food">🍲 Food & Community - Meals & Support Programs</option>
                <option value="health">⚕️ Health & Wellness - Medical Camps & Care</option>
              </select>
            </div>
            <div className="mb-12 p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Information</h3>
              <div className="grid md:grid-cols-3 gap-5">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={donorInfo.name}
                  onChange={(e) => setDonorInfo({ ...donorInfo, name: e.target.value })}
                  className="px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700/50 dark:text-white text-base focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={donorInfo.email}
                  onChange={(e) => setDonorInfo({ ...donorInfo, email: e.target.value })}
                  className="px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700/50 dark:text-white text-base focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={donorInfo.phone}
                  onChange={(e) => setDonorInfo({ ...donorInfo, phone: e.target.value })}
                  className="px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700/50 dark:text-white text-base focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Choose Payment Method</h3>
              <div className="grid grid-cols-3 gap-5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`group p-6 border-3 rounded-2xl transition-all duration-300 transform hover:scale-105 text-center ${
                    paymentMethod === 'upi'
                      ? 'border-primary-600 bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/30 dark:to-primary-800/20 shadow-xl'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 bg-gray-50 dark:bg-gray-700/50'
                  }`}
                >
                  <Smartphone className="w-12 h-12 mx-auto mb-3 text-primary-600 group-hover:scale-110 transition-transform" />
                  <div className="font-bold text-gray-900 dark:text-white">UPI</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">Instant & Secure</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`group relative p-6 border-3 rounded-2xl transition-all duration-300 transform hover:scale-105 text-center ${
                    paymentMethod === 'razorpay'
                      ? 'border-primary-600 bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/30 dark:to-primary-800/20 shadow-xl'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 bg-gray-50 dark:bg-gray-700/50'
                  }`}
                >
                  <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-lg animate-pulse">POPULAR</span>
                  <CreditCard className="w-12 h-12 mx-auto mb-3 text-primary-600 group-hover:scale-110 transition-transform" />
                  <div className="font-bold text-gray-900 dark:text-white">Razorpay</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">Card & Wallet</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('stripe')}
                  className={`group p-6 border-3 rounded-2xl transition-all duration-300 transform hover:scale-105 text-center ${
                    paymentMethod === 'stripe'
                      ? 'border-primary-600 bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/30 dark:to-primary-800/20 shadow-xl'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 bg-gray-50 dark:bg-gray-700/50'
                  }`}
                >
                  <Globe className="w-12 h-12 mx-auto mb-3 text-primary-600 group-hover:scale-110 transition-transform" />
                  <div className="font-bold text-gray-900 dark:text-white">Stripe</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">International</div>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary-600 via-primary-500 to-red-600 hover:from-primary-700 hover:via-primary-600 hover:to-red-700 text-white px-8 py-6 rounded-2xl font-bold text-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-primary-600/40 active:scale-95 flex items-center justify-center gap-3 group"
            >
              <Heart className="w-8 h-8 group-hover:animate-pulse" />
              Donate ₹{amount.toLocaleString()}
            </button>

            {/* Trust Badge */}
            <div className="mt-10 p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl text-center border-2 border-blue-300 dark:border-blue-600/50">
              <p className="text-base text-blue-900 dark:text-blue-200">
                <span className="font-bold">✓ 100% Secure & Transparent</span> - Your donation is tax-deductible and goes directly to help our communities.
              </p>
            </div>
          </form>
        </section>

        {/* Our Generous Donors */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Our Generous Donors</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">We are grateful to <span className="font-bold text-primary-600">{activeDonors}</span> wonderful donors who have contributed <span className="font-bold text-primary-600">₹{totalDonated.toLocaleString()}</span> to support our mission</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {donors
              .filter(d => d.amount > 0)
              .sort((a, b) => b.amount - a.amount)
              .map((donor, index) => (
                <div
                  key={index}
                  className="group bg-white dark:bg-gray-800 p-5 rounded-xl border-l-4 border-primary-600 hover:shadow-lg hover:shadow-primary-600/20 transition-all duration-300 hover:-translate-y-1"
                >
                  <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{donor.name}</p>
                  <p className="text-lg font-bold text-primary-600 dark:text-primary-400 mt-2">₹{donor.amount.toLocaleString()}</p>
                </div>
              ))}
          </div>
        </section>

        {/* Impact Stories */}
        <section className="mt-16">
          <h2 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Impact Stories</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {impactStories.map((story) => (
              <div
                key={story.id}
                className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700"
              >
                <div className="flex items-center mb-4">
                  <CheckCircle className="w-6 h-6 text-primary-600 mr-3 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{story.name}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 italic mb-6 leading-relaxed">"{story.text}"</p>
                <span
                  className={`inline-block px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                    story.category === 'education'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      : story.category === 'food'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}
                >
                  {story.category.charAt(0).toUpperCase() + story.category.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
