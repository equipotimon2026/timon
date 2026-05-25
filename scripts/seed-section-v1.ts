/**
 * seed-section-v1.ts
 *
 * Seeds version 1 for all sections into section_versions_log and updates
 * sections.current_version + sections.questions_hash.
 *
 * Run: npx tsx scripts/seed-section-v1.ts
 * Run once, after applying migration 009.
 * Safe to run multiple times (idempotent: skips sections that already have version=1).
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "node:fs";
import * as path from "node:path";
import { questionHash, sectionHash } from "./hash-utils";

// ─────────────────────────────────────────────
// 1. Load env vars from .env.local
// ─────────────────────────────────────────────
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    throw new Error(`.env.local not found at ${envPath}`);
  }
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing env vars: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ─────────────────────────────────────────────
// 2. Main (hash helpers imported from hash-utils.ts)
// ─────────────────────────────────────────────
async function main() {
  // Import definitions after env is loaded
  // tsx resolves .ts files directly; no .js extension needed
  const { V1_SECTIONS } = await import("./section-v1-definitions");

  // Fetch all section IDs from the DB to know what to iterate
  const { data: sections, error: sectionsError } = await supabase
    .from("sections")
    .select("id, code, name");

  if (sectionsError) {
    console.error("Failed to fetch sections:", sectionsError.message);
    process.exit(1);
  }

  console.log(`Found ${sections.length} sections in DB.\n`);

  let seeded = 0;
  let skipped = 0;
  let empty = 0;

  for (const section of sections) {
    const questions = V1_SECTIONS[section.id];

    if (!questions || questions.length === 0) {
      console.log(
        `  [SKIP-EMPTY] section_id=${section.id} (${section.code}) — no questions defined. Skipping versions_log insert; sections row not updated.`
      );
      empty++;
      continue;
    }

    // Check idempotency: does version=1 already exist for this section?
    const { data: existing, error: existError } = await supabase
      .from("section_versions_log")
      .select("id")
      .eq("section_id", section.id)
      .eq("version", 1)
      .maybeSingle();

    if (existError) {
      console.error(
        `  [ERROR] section_id=${section.id}: ${existError.message}`
      );
      continue;
    }

    if (existing) {
      console.log(
        `  [SKIP-EXISTS] section_id=${section.id} (${section.code}) — version 1 already exists.`
      );
      skipped++;
      continue;
    }

    // Build snapshot
    const questionsSnapshotHash = sectionHash(questions);
    const questionsSnapshot = questions.map((q) => ({
      question_number: q.question_number,
      question_hash: questionHash(q.text),
      text: q.text,
      type: q.type,
      options: q.options ?? null,
    }));

    // Insert into section_versions_log
    const { error: insertError } = await supabase
      .from("section_versions_log")
      .insert({
        section_id: section.id,
        version: 1,
        questions_hash: questionsSnapshotHash,
        questions_snapshot: questionsSnapshot,
        published_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error(
        `  [ERROR] section_id=${section.id} insert failed: ${insertError.message}`
      );
      continue;
    }

    // Update sections row
    const { error: updateError } = await supabase
      .from("sections")
      .update({
        current_version: 1,
        questions_hash: questionsSnapshotHash,
        published_at: new Date().toISOString(),
      })
      .eq("id", section.id);

    if (updateError) {
      console.error(
        `  [ERROR] section_id=${section.id} update failed: ${updateError.message}`
      );
      continue;
    }

    console.log(
      `  [SEEDED] section_id=${section.id} (${section.code}) — ${questions.length} questions, hash=${questionsSnapshotHash.slice(0, 12)}...`
    );
    seeded++;
  }

  console.log(`\nDone. Seeded: ${seeded} | Skipped (exists): ${skipped} | Skipped (no questions): ${empty}`);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
