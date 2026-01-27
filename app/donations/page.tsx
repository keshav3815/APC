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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white">Your Donation Makes a Difference</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Join us in supporting education, community, and health initiatives across rural India
          </p>
        </div>


        {/* Financial Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="glass-card p-6 rounded-lg text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-2 text-green-500" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white">₹55,538</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Income</div>
          </div>
          <div className="glass-card p-6 rounded-lg text-center">
            <TrendingDown className="w-12 h-12 mx-auto mb-2 text-red-500" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white">₹41,214</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</div>
          </div>
          <div className="glass-card p-6 rounded-lg text-center">
            <Heart className="w-12 h-12 mx-auto mb-2 text-blue-500" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white">₹1,915</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Income</div>
          </div>
          <div className="glass-card p-6 rounded-lg text-center">
            <Target className="w-12 h-12 mx-auto mb-2 text-primary-600" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white">₹14,324</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Balance</div>
          </div>
        </div>

        {/* Impact Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="glass-card p-6 rounded-lg text-center">
            <Users className="w-12 h-12 mx-auto mb-2 text-primary-600" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{activeDonors}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Generous Donors</div>
          </div>
          <div className="glass-card p-6 rounded-lg text-center">
            <Heart className="w-12 h-12 mx-auto mb-2 text-red-500" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white">₹{totalDonated.toLocaleString()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Raised</div>
          </div>
          <div className="glass-card p-6 rounded-lg text-center">
            <Target className="w-12 h-12 mx-auto mb-2 text-blue-500" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white">₹{(campaigns.reduce((sum, c) => sum + c.target, 0)).toLocaleString()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Our Goal</div>
          </div>
          <div className="glass-card p-6 rounded-lg text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-2 text-green-500" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{Math.round((totalDonated / campaigns.reduce((sum, c) => sum + c.target, 0)) * 100)}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Progress</div>
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Active Campaigns</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="glass-card p-6 rounded-lg overflow-hidden hover-lift transition-transform duration-300">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{campaign.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{campaign.description}</p>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">₹{campaign.raised.toLocaleString()}</span>
                    <span className="text-gray-600 dark:text-gray-400">of ₹{campaign.target.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
                      style={{ width: `${(campaign.raised / campaign.target) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Donation Form */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Make Your Donation</h2>
          <form onSubmit={handleSubmit} className="glass-card p-8 rounded-lg max-w-2xl">
            {submitted && (
              <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg">
                ✓ Thank you! Your donation details have been received.
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <button
                type="button"
                onClick={() => setDonationType('one-time')}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  donationType === 'one-time'
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700'
                }`}
              >
                <div className="text-lg font-semibold">One-Time Donation</div>
              </button>
              <button
                type="button"
                onClick={() => setDonationType('monthly')}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  donationType === 'monthly'
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700'
                }`}
              >
                <div className="text-lg font-semibold">Monthly Donation</div>
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Amount: ₹{amount}</label>
              <input
                type="range"
                min="100"
                max="100000"
                step="100"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="grid grid-cols-4 gap-2 mt-3">
                {[500, 1000, 5000, 10000].map((presetAmount) => (
                  <button
                    key={presetAmount}
                    type="button"
                    onClick={() => setAmount(presetAmount)}
                    className={`p-2 rounded border-2 font-semibold transition-colors ${
                      amount === presetAmount
                        ? 'border-primary-600 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700'
                    }`}
                  >
                    ₹{presetAmount}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Donation Purpose</label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
              >
                <option value="education">Education</option>
                <option value="food">Food & Community</option>
                <option value="health">Health & Wellness</option>
              </select>
            </div>

            <div className="mb-6 grid md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Your Name"
                value={donorInfo.name}
                onChange={(e) => setDonorInfo({ ...donorInfo, name: e.target.value })}
                className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={donorInfo.email}
                onChange={(e) => setDonorInfo({ ...donorInfo, email: e.target.value })}
                className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={donorInfo.phone}
                onChange={(e) => setDonorInfo({ ...donorInfo, phone: e.target.value })}
                className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Payment Method</label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    paymentMethod === 'upi'
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700'
                  }`}
                >
                  <Smartphone className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                  <div className="text-sm font-medium">UPI</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    paymentMethod === 'razorpay'
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700'
                  }`}
                >
                  <CreditCard className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                  <div className="text-sm font-medium">Razorpay</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('stripe')}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    paymentMethod === 'stripe'
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700'
                  }`}
                >
                  <Globe className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                  <div className="text-sm font-medium">Stripe</div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-lg"
            >
              Donate ₹{amount.toLocaleString()}
            </button>
          </form>
        </section>

        {/* Our Generous Donors */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Our Generous Donors</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">We are grateful to {activeDonors} wonderful donors who have contributed ₹{totalDonated.toLocaleString()} to support our mission</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {donors
              .filter(d => d.amount > 0)
              .sort((a, b) => b.amount - a.amount)
              .map((donor, index) => (
                <div
                  key={index}
                  className="glass-card p-4 rounded-lg border-l-4 border-primary-600 hover-lift transition-transform duration-300"
                >
                  <p className="font-semibold text-gray-900 dark:text-white">{donor.name}</p>
                  <p className="text-lg font-bold text-primary-600">₹{donor.amount.toLocaleString()}</p>
                </div>
              ))}
          </div>
        </section>

        {/* Impact Stories */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Impact Stories</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {impactStories.map((story) => (
              <div
                key={story.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
              >
                <div className="flex items-center mb-4">
                  <CheckCircle className="w-6 h-6 text-primary-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{story.name}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 italic">"{story.text}"</p>
                <span
                  className={`inline-block mt-4 px-3 py-1 rounded-full text-xs font-semibold ${
                    story.category === 'education'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : story.category === 'food'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}
                >
                  {story.category}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
