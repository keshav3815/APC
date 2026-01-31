// Quick verification script
// Run with: node verify-admin.js

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://szddxrihwwpnhaqmhafu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6ZGR4cmlod3dwbmhhcW1oYWZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODIxMjYsImV4cCI6MjA4NTQ1ODEyNn0.4w2havR2S7dS3baLvyxJFOPy5J23-MJdHS-tC0MyUQ4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verify() {
  console.log('\n🔍 Verifying Supabase Setup...\n')
  
  // Check admin user
  const { data: admin, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', '3dc4f7b7-846a-4e19-9ddf-cb30e9959a56')
    .single()
  
  if (error) {
    console.error('❌ Error fetching admin profile:', error.message)
    console.log('\n⚠️  RLS Policy Issue: Run the SQL in Supabase Dashboard')
    console.log('   URL: https://supabase.com/dashboard/project/szddxrihwwpnhaqmhafu/sql/new')
  } else {
    console.log('✅ Admin profile found!')
    console.log(`   ID: ${admin.id}`)
    console.log(`   Email: ${admin.email}`)
    console.log(`   Role: ${admin.role} ${admin.role === 'admin' ? '✅' : '❌'}`)
    console.log(`   Name: ${admin.full_name}`)
  }
  
  // Test public read access
  console.log('\n📖 Testing public read access...')
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('id, title')
    .limit(1)
  
  if (eventsError) {
    console.error('❌ Events read failed:', eventsError.message)
  } else {
    console.log(`✅ Events table accessible (${events?.length || 0} events)`)
  }
  
  // Test contact form insert (anonymous)
  console.log('\n📝 Testing contact form (anonymous insert)...')
  const { error: contactError } = await supabase
    .from('contact_inquiries')
    .insert({
      name: 'Test User',
      email: 'test@test.com',
      subject: 'Test',
      message: 'Test message',
      status: 'new'
    })
  
  if (contactError) {
    console.error('❌ Contact form blocked:', contactError.message)
    console.log('   This means the SQL hasn\'t been run or RLS is still blocking')
  } else {
    console.log('✅ Contact form working!')
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('Next steps:')
  console.log('1. Go to http://localhost:3001')
  console.log('2. Sign out and sign back in')
  console.log('3. Check if role shows as "admin"')
  console.log('='.repeat(50) + '\n')
}

verify().catch(console.error)
