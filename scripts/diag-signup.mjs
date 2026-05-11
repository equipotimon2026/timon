// Diagnóstico BUG-01: probar signup con admin client + capturar error real
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

// Load .env.local
const envFile = readFileSync('.env.local', 'utf8')
for (const line of envFile.split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Missing env')
  process.exit(1)
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } })

console.log('=== STEP 1: Inspect public.users state ===')
const { data: maxIdRow, error: maxErr } = await admin
  .from('users')
  .select('id')
  .order('id', { ascending: false })
  .limit(1)
console.log('Max id row:', maxIdRow, 'err:', maxErr)
const { count, error: countErr } = await admin
  .from('users')
  .select('*', { count: 'exact', head: true })
console.log('Total users:', count, 'err:', countErr)

console.log('\n=== STEP 2: Try admin.auth.admin.createUser ===')
const testEmail = `diag-${Date.now()}@timon-diag.app`
const { data: created, error: createErr } = await admin.auth.admin.createUser({
  email: testEmail,
  password: 'TestDiag1234!',
  email_confirm: true,
  user_metadata: { first_name: 'Diag', last_name: 'Test' },
})
console.log('Created user:', created?.user?.id, 'email:', created?.user?.email)
console.log('Error:', createErr)

if (created?.user?.id) {
  console.log('\n=== STEP 3: Check if public.users row was created by trigger ===')
  const { data: profile, error: profErr } = await admin
    .from('users')
    .select('*')
    .eq('auth_id', created.user.id)
    .maybeSingle()
  console.log('Profile row:', profile)
  console.log('Profile err:', profErr)

  console.log('\n=== STEP 4: Cleanup test user ===')
  const { error: delErr } = await admin.auth.admin.deleteUser(created.user.id)
  console.log('Delete err:', delErr)
}

console.log('\n=== STEP 5: Try standard signUp flow (replicates UI bug) ===')
const signUpEmail = `signup-${Date.now()}@timon-diag.app`
const anonClient = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || serviceKey, { auth: { persistSession: false } })
const { data: signUpData, error: signUpErr } = await anonClient.auth.signUp({
  email: signUpEmail,
  password: 'TestDiag1234!',
  options: { data: { first_name: 'Diag', last_name: 'Test' } },
})
console.log('signUp data.user:', signUpData?.user?.id)
console.log('signUp error:', signUpErr)
if (signUpData?.user?.id) {
  // cleanup
  await admin.auth.admin.deleteUser(signUpData.user.id)
}
