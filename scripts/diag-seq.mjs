import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const envFile = readFileSync('.env.local', 'utf8')
for (const line of envFile.split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

// Insert a row in public.users WITHOUT explicit id (force sequence to assign one)
// Use a fake auth_id UUID so it doesn't collide with anything
const fakeAuthId = crypto.randomUUID()
const { data, error } = await admin
  .from('users')
  .insert({
    auth_id: fakeAuthId,
    email: `seq-test-${Date.now()}@diag.app`,
    first_name: 'SeqTest',
    last_name: 'Diag',
  })
  .select('id')
  .single()

console.log('Insert result — id assigned by sequence:', data?.id)
console.log('Error:', error)

// Cleanup
if (data?.id) {
  const { error: delErr } = await admin.from('users').delete().eq('id', data.id)
  console.log('Cleanup err:', delErr)
}
