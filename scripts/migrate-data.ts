/**
 * Migration script: Import data from Neon CSV exports into Supabase
 *
 * Usage: npx tsx scripts/migrate-data.ts
 *
 * Prerequisites:
 * - Supabase schema already applied (001_initial_schema.sql)
 * - CSV files in migration-data/ directory
 * - .env.local with NEXT_PUBLIC_SUPABASE_URL and a service role key
 */

import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  console.error('Add SUPABASE_SERVICE_ROLE_KEY to .env.local (find it in Supabase Dashboard > Settings > API)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const DATA_DIR = join(process.cwd(), 'migration-data');

function readCSV(filename: string): Record<string, string>[] {
  const content = readFileSync(join(DATA_DIR, filename), 'utf-8');
  return parse(content, { columns: true, skip_empty_lines: true, relax_column_count: true });
}

function cleanValue(val: string | undefined | null): string | null {
  if (val === undefined || val === null || val === '' || val === 'null') return null;
  return val;
}

function parseJSON(val: string | null): Record<string, unknown> | null {
  if (!val) return null;
  try {
    return JSON.parse(val);
  } catch {
    return null;
  }
}

async function migrateSections() {
  console.log('\n📋 Migrating sections...');
  const rows = readCSV('sections.csv');

  // Clear existing seed data first
  await supabase.from('sections').delete().gte('id', 0);

  const data = rows.map((r) => ({
    id: parseInt(r.id),
    code: r.code,
    name: r.name,
    order_index: parseInt(r.order_index),
  }));

  const { error } = await supabase.from('sections').upsert(data, { onConflict: 'id' });
  if (error) {
    console.error('  Error:', error.message);
  } else {
    console.log(`  Migrated ${data.length} sections`);
  }
}

async function migrateUniversity() {
  console.log('\n🎓 Migrating university catalog...');
  const rows = readCSV('university.csv');

  // Insert in batches of 500
  const BATCH_SIZE = 500;
  let total = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE).map((r) => ({
      id: parseInt(r.id),
      university: cleanValue(r.university),
      faculty: cleanValue(r.faculty),
      title: cleanValue(r.title),
      title_type: cleanValue(r.title_type),
      duration: cleanValue(r.duration),
      entry_conditions: cleanValue(r.entry_conditions),
      location: cleanValue(r.location),
      phone_number: cleanValue(r.phone_number),
      web: cleanValue(r.web),
      email: cleanValue(r.email),
    }));

    const { error } = await supabase.from('university').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`  Error batch ${i}-${i + BATCH_SIZE}:`, error.message);
    } else {
      total += batch.length;
      process.stdout.write(`\r  Migrated ${total}/${rows.length} universities`);
    }
  }
  console.log('');
}

async function migrateSurveyResponses() {
  console.log('\n📝 Migrating survey_responses...');
  const rows = readCSV('survey_responses.csv');

  // survey_responses in Neon uses session_id, but in Supabase we use user_id
  // Since we don't have user mapping yet (old users don't have auth_id),
  // we'll store session_id info in the meta field and set user_id to null
  const data = rows.map((r) => ({
    id: parseInt(r.id),
    survey_slug: r.survey_slug || 'timon',
    survey_version: parseInt(r.survey_version) || 1,
    user_id: null, // Will need to be mapped when users are migrated with auth
    answers: parseJSON(r.answers) || {},
    meta: {
      ...parseJSON(r.meta),
      legacy_session_id: cleanValue(r.session_id),
    },
    created_at: r.created_at,
  }));

  const { error } = await supabase.from('survey_responses').upsert(data, { onConflict: 'id' });
  if (error) {
    console.error('  Error:', error.message);
  } else {
    console.log(`  Migrated ${data.length} survey responses`);
  }
}

async function migrateResponses() {
  console.log('\n✏️  Migrating responses...');
  const rows = readCSV('responses.csv');

  const BATCH_SIZE = 500;
  let total = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE).map((r) => ({
      id: parseInt(r.id),
      user_id: parseInt(r.user_id),
      section_id: parseInt(r.section_id),
      question_number: parseInt(r.question_number),
      question: cleanValue(r.question),
      response_boolean: r.response_boolean === 'true' ? true : r.response_boolean === 'false' ? false : null,
      response_integer: r.response_integer ? parseInt(r.response_integer) : null,
      response_text: cleanValue(r.response_text),
      response_array: r.response_array ? parseJSON(r.response_array) : null,
      answered_at: r.answered_at,
    }));

    const { error } = await supabase.from('responses').upsert(batch, {
      onConflict: 'user_id,section_id,question_number',
    });
    if (error) {
      console.error(`  Error batch ${i}-${i + BATCH_SIZE}:`, error.message);
    } else {
      total += batch.length;
      process.stdout.write(`\r  Migrated ${total}/${rows.length} responses`);
    }
  }
  console.log('');
}

async function migrateSectionResults() {
  console.log('\n📊 Migrating section_results...');
  const rows = readCSV('section_results.csv');

  const data = rows.map((r) => ({
    id: parseInt(r.id),
    user_id: parseInt(r.user_id),
    section_id: parseInt(r.section_id),
    score_data: parseJSON(r.score_data),
    meta: parseJSON(r.meta),
    completed_at: r.completed_at,
  }));

  const { error } = await supabase.from('section_results').upsert(data, {
    onConflict: 'user_id,section_id',
  });
  if (error) {
    console.error('  Error:', error.message);
  } else {
    console.log(`  Migrated ${data.length} section results`);
  }
}

async function resetSequences() {
  console.log('\n🔄 Resetting ID sequences...');
  const tables = ['sections', 'university', 'survey_responses', 'responses', 'section_results'];
  for (const table of tables) {
    const { error } = await supabase.rpc('reset_sequence', { table_name: table });
    if (error) {
      // Fallback: just log, sequences will auto-fix on next insert if they conflict
      console.log(`  Note: Could not reset sequence for ${table} (will auto-fix on conflict)`);
    }
  }
}

async function main() {
  console.log('🚀 Starting data migration from Neon to Supabase...');
  console.log(`   Supabase URL: ${SUPABASE_URL}`);
  console.log(`   Data dir: ${DATA_DIR}`);

  // Order matters: sections first (referenced by others), then independent tables
  await migrateSections();
  await migrateUniversity();
  await migrateSurveyResponses();

  // These depend on users existing - they reference user_id
  // The old Neon DB had users, but we haven't exported them
  // These will only work if the users table has matching IDs
  console.log('\n⚠️  Note: responses and section_results reference user_id.');
  console.log('   If users table is empty, these inserts will fail due to FK constraints.');
  console.log('   You may need to migrate users first or temporarily disable FK checks.\n');

  try {
    await migrateResponses();
  } catch (e) {
    console.error('  Responses migration failed (likely FK constraint). Migrate users first.');
  }

  try {
    await migrateSectionResults();
  } catch (e) {
    console.error('  Section results migration failed (likely FK constraint). Migrate users first.');
  }

  console.log('\n✅ Migration complete!');
  console.log('\nNext steps:');
  console.log('  1. Verify data in Supabase Dashboard > Table Editor');
  console.log('  2. If responses/section_results failed, export users.csv from Neon and re-run');
  console.log('  3. Map old users to new Supabase Auth users (manual or via script)');
}

main().catch(console.error);
