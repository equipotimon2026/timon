/**
 * publish-section.ts
 *
 * CLI to publish a new version of a section.
 *
 * Usage:
 *   npx tsx scripts/publish-section.ts <section_id> <questions_json_path> [--dry-run]
 *
 * questions_json_path must point to a JSON file with shape:
 *   [{ "question_number": 1, "text": "...", "type": "boolean", "options": null }, ...]
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";
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
    "[publish] Missing env vars: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ─────────────────────────────────────────────
// 2. Types
// ─────────────────────────────────────────────
const VALID_TYPES = ["boolean", "integer", "text", "array"] as const;
type QuestionType = (typeof VALID_TYPES)[number];

interface InputQuestion {
  question_number: number;
  text: string;
  type: QuestionType;
  options?: string[] | null;
}

// ─────────────────────────────────────────────
// 3. Validation helpers
// ─────────────────────────────────────────────
function validateQuestions(raw: unknown): InputQuestion[] {
  if (!Array.isArray(raw)) {
    throw new Error("Questions JSON must be an array.");
  }
  if (raw.length === 0) {
    throw new Error("Questions array is empty.");
  }
  const errors: string[] = [];
  for (let i = 0; i < raw.length; i++) {
    const q = raw[i] as Record<string, unknown>;
    if (typeof q.question_number !== "number" || !Number.isInteger(q.question_number)) {
      errors.push(`[${i}] question_number must be an integer`);
    }
    if (typeof q.text !== "string" || q.text.trim() === "") {
      errors.push(`[${i}] text must be a non-empty string`);
    }
    if (!VALID_TYPES.includes(q.type as QuestionType)) {
      errors.push(`[${i}] type must be one of: ${VALID_TYPES.join(", ")} (got: ${q.type})`);
    }
  }
  if (errors.length > 0) {
    throw new Error(`Validation errors:\n${errors.map((e) => `  - ${e}`).join("\n")}`);
  }
  return raw as InputQuestion[];
}

// ─────────────────────────────────────────────
// 4. Prompt helper (TTY only)
// ─────────────────────────────────────────────
function promptConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "y");
    });
  });
}

// ─────────────────────────────────────────────
// 5. Main
// ─────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const positional = args.filter((a) => !a.startsWith("--"));

  if (positional.length < 2) {
    console.error(
      "[publish] Usage: npx tsx scripts/publish-section.ts <section_id> <questions_json_path> [--dry-run]"
    );
    process.exit(1);
  }

  // Parse section_id
  const sectionIdRaw = positional[0];
  const sectionId = parseInt(sectionIdRaw, 10);
  if (isNaN(sectionId) || sectionId <= 0 || String(sectionId) !== sectionIdRaw) {
    console.error(`[publish] Invalid section_id: "${sectionIdRaw}". Must be a positive integer.`);
    process.exit(1);
  }

  // Load and validate questions JSON
  const jsonPath = path.resolve(process.cwd(), positional[1]);
  if (!fs.existsSync(jsonPath)) {
    console.error(`[publish] File not found: ${jsonPath}`);
    process.exit(1);
  }

  let rawJson: unknown;
  try {
    rawJson = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  } catch (err) {
    console.error(`[publish] Failed to parse JSON: ${(err as Error).message}`);
    process.exit(1);
  }

  let questions: InputQuestion[];
  try {
    questions = validateQuestions(rawJson);
  } catch (err) {
    console.error(`[publish] ${(err as Error).message}`);
    process.exit(1);
  }

  console.log(`[publish] Loaded ${questions.length} questions from ${jsonPath}`);

  // Fetch current section from DB
  const { data: section, error: sectionError } = await supabase
    .from("sections")
    .select("id, code, current_version, questions_hash")
    .eq("id", sectionId)
    .maybeSingle();

  if (sectionError) {
    console.error(`[publish] Error fetching section: ${sectionError.message}`);
    process.exit(1);
  }

  if (!section) {
    console.error(`[publish] Section with id=${sectionId} not found in DB.`);
    process.exit(1);
  }

  console.log(
    `[publish] Found section id=${section.id} (${section.code}) — current_version=${section.current_version}`
  );

  // Compute new hash
  const newHash = sectionHash(questions);
  const currentHash = section.questions_hash;

  if (newHash === currentHash) {
    console.log(`[publish] [NO CHANGE] Hash matches current version. Nothing to publish.`);
    process.exit(0);
  }

  const nextVersion = (section.current_version ?? 0) + 1;

  console.log(
    `[publish] Hash changed: ${(currentHash ?? "null").slice(0, 12)}... → ${newHash.slice(0, 12)}...`
  );
  console.log(
    `[publish] Section ${sectionId} (${section.code}) will go from v${section.current_version ?? 0} → v${nextVersion}`
  );

  if (dryRun) {
    console.log(`[publish] [DRY RUN] Would publish v${nextVersion} with ${questions.length} questions. No changes made.`);
    process.exit(0);
  }

  // Prompt if TTY
  if (process.stdin.isTTY) {
    const confirmed = await promptConfirm(
      `[publish] Section ${sectionId} will go from v${section.current_version ?? 0} to v${nextVersion}. Confirm?`
    );
    if (!confirmed) {
      console.log("[publish] Aborted.");
      process.exit(0);
    }
  } else {
    console.log("[publish] Non-TTY stdin — skipping prompt, proceeding.");
  }

  // Build snapshot
  const questionsSnapshot = questions.map((q) => ({
    question_number: q.question_number,
    question_hash: questionHash(q.text),
    text: q.text,
    type: q.type,
    options: q.options ?? null,
  }));

  // INSERT into section_versions_log
  const { error: insertError } = await supabase
    .from("section_versions_log")
    .insert({
      section_id: sectionId,
      version: nextVersion,
      questions_hash: newHash,
      questions_snapshot: questionsSnapshot,
      published_at: new Date().toISOString(),
    });

  if (insertError) {
    console.error(`[publish] Failed to insert version log: ${insertError.message}`);
    process.exit(1);
  }

  // UPDATE sections
  const { error: updateError } = await supabase
    .from("sections")
    .update({
      current_version: nextVersion,
      questions_hash: newHash,
      published_at: new Date().toISOString(),
    })
    .eq("id", sectionId);

  if (updateError) {
    console.error(`[publish] Failed to update sections row: ${updateError.message}`);
    process.exit(1);
  }

  console.log(
    `[publish] [PUBLISHED] section ${sectionId} (${section.code}) v${nextVersion} — ${questions.length} questions, hash=${newHash.slice(0, 12)}...`
  );
}

main().catch((err) => {
  console.error("[publish] Unexpected error:", err);
  process.exit(1);
});
