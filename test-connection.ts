// Run this with: npx tsx test-connection.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://szddxrihwwpnhaqmhafu.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

async function testConnection() {
  if (!supabaseAnonKey) {
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  console.log('Testing Supabase connection...')
  
  // Test 1: Check if we can connect
  const { data: healthCheck, error: healthError } = await supabase
    .from('profiles')
    .select('count')
    .limit(1)
  
  if (healthError) {
    console.error('❌ Connection failed:', healthError.message)
    console.error('Error code:', healthError.code)
    console.error('Full error:', healthError)
  } else {
    console.log('✅ Connection successful!')
  }
  
  // Test 2: Check profiles table
  console.log('\nChecking profiles table...')
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email, role')
    .limit(5)
  
  if (profilesError) {
    console.error('❌ Profiles query failed:', profilesError.message)
  } else {
    console.log('✅ Profiles found:', profiles?.length || 0)
    profiles?.forEach(p => console.log(`  - ${p.email} (${p.role})`))
  }
  
  // Test 3: Check admin user
  console.log('\nChecking for admin user...')
  const { data: admin, error: adminError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', '3dc4f7b7-846a-4e19-9ddf-cb30e9959a56')
    .single()
  
  if (adminError) {
    console.error('❌ Admin user not found:', adminError.message)
  } else if (admin) {
    console.log('✅ Admin user found:')
    console.log(`  - ID: ${admin.id}`)
    console.log(`  - Email: ${admin.email}`)
    console.log(`  - Role: ${admin.role}`)
    console.log(`  - Full Name: ${admin.full_name}`)
  }
  
  // Test 4: Check contact_inquiries insert (anonymous)
  console.log('\nTesting anonymous insert to contact_inquiries...')
  const testInquiry = {
    name: 'Test User',
    email: 'test@example.com',
    subject: 'Test Inquiry',
    message: 'This is a test message',
    status: 'new'
  }
  
  const { data: inquiry, error: inquiryError } = await supabase
    .from('contact_inquiries')
    .insert(testInquiry)
    .select()
    .single()
  
  if (inquiryError) {
    console.error('❌ Contact inquiry insert failed:', inquiryError.message)
    console.error('This means RLS is blocking anonymous inserts')
  } else {
    console.log('✅ Contact inquiry inserted successfully')
    // Clean up
    await supabase.from('contact_inquiries').delete().eq('id', inquiry.id)
    console.log('✅ Test inquiry cleaned up')
  }
}

testConnection().catch(console.error)
