import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type Stats = Database['public']['Tables']['stats']['Row']
type HeroContent = Database['public']['Tables']['hero_content']['Row']
type Member = Database['public']['Tables']['members']['Row']
type Event = Database['public']['Tables']['events']['Row']
type Campaign = Database['public']['Tables']['campaigns']['Row']
type Donation = Database['public']['Tables']['donations']['Row']
type Book = Database['public']['Tables']['books']['Row']
type Testimonial = Database['public']['Tables']['testimonials']['Row']

const supabase = createClient()

// ============================================
// Stats
// ============================================

export async function getStats() {
  const { data, error } = await supabase
    .from('stats')
    .select('*')
    .eq('is_visible', true)
    .order('display_order')
  
  return { data, error }
}

export async function updateStat(id: string, value: number) {
  const { data, error } = await supabase
    .from('stats')
    .update({ value })
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

// ============================================
// Hero Content
// ============================================

export async function getHeroContent() {
  const { data, error } = await supabase
    .from('hero_content')
    .select('*')
    .eq('is_active', true)
    .single()
  
  return { data, error }
}

export async function updateHeroContent(id: string, content: Partial<HeroContent>) {
  const { data, error } = await supabase
    .from('hero_content')
    .update(content)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

// ============================================
// Members
// ============================================

export async function getMembers(filter?: { type?: string; search?: string }) {
  let query = supabase.from('members').select('*').eq('is_active', true)
  
  if (filter?.type && filter.type !== 'all') {
    query = query.eq('member_type', filter.type)
  }
  
  if (filter?.search) {
    query = query.or(`name.ilike.%${filter.search}%,village.ilike.%${filter.search}%`)
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  return { data, error }
}

export async function createMember(member: Database['public']['Tables']['members']['Insert']) {
  const { data, error } = await supabase
    .from('members')
    .insert(member)
    .select()
    .single()
  
  return { data, error }
}

export async function updateMember(id: string, member: Partial<Member>) {
  const { data, error } = await supabase
    .from('members')
    .update(member)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

export async function deleteMember(id: string) {
  const { error } = await supabase
    .from('members')
    .update({ is_active: false })
    .eq('id', id)
  
  return { error }
}

// ============================================
// Events
// ============================================

export async function getEvents(filter?: { status?: string }) {
  let query = supabase.from('events').select('*').eq('is_published', true)
  
  if (filter?.status) {
    query = query.eq('status', filter.status)
  }
  
  const { data, error } = await query.order('start_date', { ascending: true })
  return { data, error }
}

export async function getEventById(id: string) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()
  
  return { data, error }
}

export async function createEvent(event: Database['public']['Tables']['events']['Insert']) {
  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single()
  
  return { data, error }
}

export async function updateEvent(id: string, event: Partial<Event>) {
  const { data, error } = await supabase
    .from('events')
    .update(event)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

export async function registerForEvent(
  eventId: string,
  registration: {
    user_id?: string
    name: string
    email: string
    phone?: string
  }
) {
  const { data, error } = await supabase
    .from('event_registrations')
    .insert({
      event_id: eventId,
      ...registration,
    })
    .select()
    .single()
  
  return { data, error }
}

export async function getEventRegistrations(eventId: string) {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', eventId)
    .order('registered_at', { ascending: false })
  
  return { data, error }
}

// ============================================
// Campaigns & Donations
// ============================================

export async function getCampaigns() {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export async function getCampaignById(id: string) {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single()
  
  return { data, error }
}

export async function createCampaign(campaign: Database['public']['Tables']['campaigns']['Insert']) {
  const { data, error } = await supabase
    .from('campaigns')
    .insert(campaign)
    .select()
    .single()
  
  return { data, error }
}

export async function updateCampaign(id: string, campaign: Partial<Campaign>) {
  const { data, error } = await supabase
    .from('campaigns')
    .update(campaign)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

export async function getDonations(filter?: { campaign_id?: string; user_id?: string }) {
  let query = supabase.from('donations').select('*')
  
  if (filter?.campaign_id) {
    query = query.eq('campaign_id', filter.campaign_id)
  }
  
  if (filter?.user_id) {
    query = query.eq('user_id', filter.user_id)
  }
  
  const { data, error } = await query.order('donated_at', { ascending: false })
  return { data, error }
}

export async function createDonation(donation: Database['public']['Tables']['donations']['Insert']) {
  const { data, error } = await supabase
    .from('donations')
    .insert(donation)
    .select()
    .single()
  
  return { data, error }
}

export async function getDonationStats() {
  const { data: donations, error } = await supabase
    .from('donations')
    .select('amount, payment_status')
    .eq('payment_status', 'completed')
  
  if (error) return { data: null, error }
  
  const totalRaised = donations?.reduce((sum: number, d: any) => sum + Number(d.amount), 0) || 0
  const totalDonors = donations?.length || 0
  
  return {
    data: { totalRaised, totalDonors },
    error: null,
  }
}

// ============================================
// Books
// ============================================

export async function getBooks(filter?: { category?: string; status?: string; search?: string }) {
  let query = supabase.from('books').select('*')
  
  if (filter?.category && filter.category !== 'all') {
    query = query.eq('category', filter.category)
  }
  
  if (filter?.status) {
    query = query.eq('status', filter.status)
  }
  
  if (filter?.search) {
    query = query.or(`title.ilike.%${filter.search}%,author.ilike.%${filter.search}%`)
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  return { data, error }
}

export async function getBookById(id: string) {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single()
  
  return { data, error }
}

export async function createBook(book: Database['public']['Tables']['books']['Insert']) {
  const { data, error } = await supabase
    .from('books')
    .insert(book)
    .select()
    .single()
  
  return { data, error }
}

export async function updateBook(id: string, book: Partial<Book>) {
  const { data, error } = await supabase
    .from('books')
    .update(book)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

export async function deleteBook(id: string) {
  const { error } = await supabase.from('books').delete().eq('id', id)
  return { error }
}

export async function getBookStats() {
  const { data: books, error } = await supabase.from('books').select('status, category')
  
  if (error) return { data: null, error }
  
  const totalBooks = books?.length || 0
  const availableBooks = books?.filter((b: any) => b.status === 'available').length || 0
  const borrowedBooks = books?.filter((b: any) => b.status === 'borrowed').length || 0
  
  const categoryCount: Record<string, number> = {}
  books?.forEach((b: any) => {
    categoryCount[b.category] = (categoryCount[b.category] || 0) + 1
  })
  
  return {
    data: { totalBooks, availableBooks, borrowedBooks, categoryCount },
    error: null,
  }
}

// ============================================
// Library Patrons
// ============================================

export async function getPatrons(search?: string) {
  let query = supabase.from('library_patrons').select('*').eq('is_active', true)
  
  if (search) {
    query = query.or(`name.ilike.%${search}%,patron_id.ilike.%${search}%`)
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  return { data, error }
}

export async function getPatronById(id: string) {
  const { data, error } = await supabase
    .from('library_patrons')
    .select('*')
    .eq('id', id)
    .single()
  
  return { data, error }
}

export async function createPatron(patron: Database['public']['Tables']['library_patrons']['Insert']) {
  const { data, error } = await supabase
    .from('library_patrons')
    .insert(patron)
    .select()
    .single()
  
  return { data, error }
}

export async function updatePatron(id: string, patron: Partial<Database['public']['Tables']['library_patrons']['Row']>) {
  const { data, error } = await supabase
    .from('library_patrons')
    .update(patron)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

// ============================================
// Book Issues
// ============================================

export async function getBookIssues(filter?: { patron_id?: string; book_id?: string; status?: string }) {
  let query = supabase
    .from('book_issues')
    .select(`
      *,
      books:book_id(id, title, accession_number),
      patrons:patron_id(id, name, patron_id)
    `)
  
  if (filter?.patron_id) {
    query = query.eq('patron_id', filter.patron_id)
  }
  
  if (filter?.book_id) {
    query = query.eq('book_id', filter.book_id)
  }
  
  if (filter?.status) {
    query = query.eq('status', filter.status)
  }
  
  const { data, error } = await query.order('issue_date', { ascending: false })
  return { data, error }
}

export async function issueBook(issue: Database['public']['Tables']['book_issues']['Insert']) {
  const { data, error } = await supabase
    .from('book_issues')
    .insert(issue)
    .select()
    .single()
  
  return { data, error }
}

export async function returnBook(issueId: string, returnedBy: string) {
  const { data, error } = await supabase
    .from('book_issues')
    .update({
      return_date: new Date().toISOString(),
      returned_by: returnedBy,
      status: 'returned',
    })
    .eq('id', issueId)
    .select()
    .single()
  
  return { data, error }
}

// ============================================
// Testimonials
// ============================================

export async function getTestimonials(approved?: boolean) {
  let query = supabase.from('testimonials').select('*')
  
  if (approved !== undefined) {
    query = query.eq('is_approved', approved)
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  return { data, error }
}

export async function createTestimonial(testimonial: Database['public']['Tables']['testimonials']['Insert']) {
  const { data, error } = await supabase
    .from('testimonials')
    .insert(testimonial)
    .select()
    .single()
  
  return { data, error }
}

export async function approveTestimonial(id: string) {
  const { data, error } = await supabase
    .from('testimonials')
    .update({ is_approved: true })
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

// ============================================
// Transactions
// ============================================

export async function getTransactions(filter?: { type?: string; startDate?: string; endDate?: string }) {
  let query = supabase.from('transactions').select('*')
  
  if (filter?.type) {
    query = query.eq('transaction_type', filter.type)
  }
  
  if (filter?.startDate) {
    query = query.gte('transaction_date', filter.startDate)
  }
  
  if (filter?.endDate) {
    query = query.lte('transaction_date', filter.endDate)
  }
  
  const { data, error } = await query.order('transaction_date', { ascending: false })
  return { data, error }
}

export async function createTransaction(transaction: Database['public']['Tables']['transactions']['Insert']) {
  const { data, error } = await supabase
    .from('transactions')
    .insert(transaction)
    .select()
    .single()
  
  return { data, error }
}

export async function getFinancialSummary() {
  const { data: transactions, error } = await supabase.from('transactions').select('*')
  
  if (error) return { data: null, error }
  
  const totalIncome = transactions?.filter((t: any) => t.transaction_type === 'income').reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0
  const totalExpense = transactions?.filter((t: any) => t.transaction_type === 'expense').reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0
  const balance = totalIncome - totalExpense
  
  return {
    data: { totalIncome, totalExpense, balance },
    error: null,
  }
}

// ============================================
// Volunteer Applications
// ============================================

export async function getVolunteerApplications(status?: string) {
  let query = supabase.from('volunteer_applications').select('*')
  
  if (status) {
    query = query.eq('status', status)
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  return { data, error }
}

export async function createVolunteerApplication(
  application: Database['public']['Tables']['volunteer_applications']['Insert']
) {
  const { data, error } = await supabase
    .from('volunteer_applications')
    .insert(application)
    .select()
    .single()
  
  return { data, error }
}

export async function updateVolunteerApplication(
  id: string,
  update: { status: string; reviewed_by?: string; notes?: string }
) {
  const { data, error } = await supabase
    .from('volunteer_applications')
    .update({
      ...update,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

// ============================================
// Site Settings
// ============================================

export async function getSiteSettings() {
  const { data, error } = await supabase.from('site_settings').select('*')
  
  if (error) return { data: null, error }
  
  const settings: Record<string, any> = {}
  data?.forEach((s: any) => {
    settings[s.key] = s.value
  })
  
  return { data: settings, error: null }
}

export async function updateSiteSetting(key: string, value: any, updatedBy: string) {
  const { data, error } = await supabase
    .from('site_settings')
    .upsert({
      key,
      value,
      updated_by: updatedBy,
    })
    .select()
    .single()
  
  return { data, error }
}
