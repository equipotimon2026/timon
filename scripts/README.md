# Scripts

## seed-section-v1.ts

Seeds version 1 for all sections into `section_versions_log` and updates
`sections.current_version` + `sections.questions_hash`.

### When to run

Once, after applying migration `009_section_versioning.sql`. Do not run before
the migration — `section_versions_log` won't exist yet.

### How to run

```bash
npx tsx scripts/seed-section-v1.ts
```

Requires `.env.local` in the project root with:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The script is idempotent: if version 1 already exists for a section, it skips
that section without error.

### How to apply migration 009

**Option A — Supabase CLI (recommended for local + CI):**
```bash
supabase db push
```

**Option B — Manual (production SQL editor):**
Copy/paste the contents of `supabase/migrations/009_section_versioning.sql`
into the Supabase SQL editor and run.
