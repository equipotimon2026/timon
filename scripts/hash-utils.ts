/**
 * hash-utils.ts
 *
 * Shared hash helpers for section versioning scripts.
 * Used by seed-section-v1.ts and publish-section.ts.
 */

import * as crypto from "node:crypto";

export function normalize(text: string): string {
  return text.toLowerCase().trim();
}

export function questionHash(text: string): string {
  return crypto.createHash("sha256").update(normalize(text)).digest("hex");
}

export function sectionHash(
  questions: Array<{ question_number: number; text: string }>
): string {
  const ordered = [...questions].sort(
    (a, b) => a.question_number - b.question_number
  );
  const concat = ordered.map((q) => questionHash(q.text)).join("|");
  return crypto.createHash("sha256").update(concat).digest("hex");
}
