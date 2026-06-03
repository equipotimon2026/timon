/**
 * Create an admin user: signup via Auth Admin API + add to admin_whitelist.
 * Run: npx tsx scripts/create-admin.ts <email> <password>
 */
import { createClient } from '@supabase/supabase-js';
import * as fs from 'node:fs';
import * as path from 'node:path';

function loadEnv() {
  const p = path.resolve(process.cwd(), '.env.local');
  const raw = fs.readFileSync(p, 'utf8');
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv();

async function main() {
  const [, , email, password] = process.argv;
  if (!email || !password) {
    console.error('Usage: npx tsx scripts/create-admin.ts <email> <password>');
    process.exit(1);
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  // 1. Create auth user (email_confirm true so no verification needed)
  const { data: createData, error: createErr } = await sb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createErr) {
    if (createErr.message.includes('already')) {
      console.log(`[info] auth user ${email} already exists, continuing`);
    } else {
      console.error('[error] createUser:', createErr.message);
      process.exit(1);
    }
  } else {
    console.log(`[ok] auth user created: id=${createData.user?.id}`);
  }

  // 2. Add to admin_whitelist
  const { error: wlErr } = await sb
    .from('admin_whitelist')
    .upsert({ email, notes: 'created via scripts/create-admin.ts' }, { onConflict: 'email' });

  if (wlErr) {
    console.error('[error] whitelist upsert:', wlErr.message);
    process.exit(1);
  }
  console.log(`[ok] ${email} added to admin_whitelist`);

  // 3. Verify
  const { data: row } = await sb.from('admin_whitelist').select('*').eq('email', email).maybeSingle();
  console.log('[verify]', row);
}

main().catch((e) => { console.error(e); process.exit(1); });
