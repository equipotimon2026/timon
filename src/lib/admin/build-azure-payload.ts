import { SupabaseClient } from '@supabase/supabase-js';
import { SECTION_IDS } from '@/lib/constants';

const SECTION_NAMES: Record<number, { key: string; name: string }> = {
  [SECTION_IDS.MILLON]: { key: 'MILLON', name: 'MIPS/Millon' },
  [SECTION_IDS.RIASEC]: { key: 'RIASEC', name: 'Holland RIASEC' },
  [SECTION_IDS.HERRMANN]: { key: 'HERRMANN', name: 'Herrmann' },
  [SECTION_IDS.GARDNER]: { key: 'GARDNER', name: 'Inteligencias Múltiples' },
  [SECTION_IDS.PROYECTIVA]: { key: 'PROYECTIVA', name: 'Técnicas Proyectivas' },
  [SECTION_IDS.AUTODESC]: { key: 'AUTODESC', name: 'Autodescubrimiento' },
  [SECTION_IDS.LIFESTYLE]: { key: 'LIFESTYLE', name: 'Estilo de Vida' },
  [SECTION_IDS.FUTURO]: { key: 'FUTURO', name: 'Visión Futuro' },
  [SECTION_IDS.FAMILIA]: { key: 'FAMILIA', name: 'Árbol Genealógico' },
  [SECTION_IDS.UNIVERSIDAD]: { key: 'UNIVERSIDAD', name: 'Universidad' },
  [SECTION_IDS.VIBECHECK]: { key: 'VIBECHECK', name: 'Identificación de Perfil' },
  [SECTION_IDS.VOSCOLEGIO]: { key: 'VOSCOLEGIO', name: 'Vos y el Colegio' },
  [SECTION_IDS.PADRES]: { key: 'PADRES', name: 'Perspectiva Familiar' },
  [SECTION_IDS.PROFESIONALES]: { key: 'PROFESIONALES', name: 'Hablemos con Profesionales' },
};

function getResponseType(row: {
  response_boolean: boolean | null;
  response_integer: number | null;
  response_text: string | null;
  response_array: unknown | null;
}): { answer: unknown; response_type: string } {
  if (row.response_boolean !== null) {
    return { answer: row.response_boolean, response_type: 'boolean' };
  }
  if (row.response_integer !== null) {
    return { answer: row.response_integer, response_type: 'integer' };
  }
  if (row.response_array !== null) {
    return { answer: row.response_array, response_type: 'array' };
  }
  return { answer: row.response_text ?? '', response_type: 'text' };
}

export interface AzurePayload {
  personal_data: {
    first_name: string;
    last_name: string;
    age: number;
    school: string;
    school_year: string;
    email: string;
    phone_number: string;
  };
  responses: Record<string, { name: string; responses: unknown[] }>;
}

export interface BuildAzurePayloadResult {
  payload: AzurePayload;
  sectionVersions: Record<string, number>;
}

interface SectionVersionRow {
  section_id: number;
  current_version: number;
  questions_snapshot: Array<{ question_number: number; question_hash: string; text: string; type: string; options?: unknown }> | null;
}

/**
 * Build the Azure assessment payload for a given user (by public.users.id BIGINT).
 * adminSupabase must be a service-role client to access questions table.
 * Returns the payload and a map of section_id → version used (for assessments.section_versions).
 */
export async function buildAzurePayload(
  adminSupabase: SupabaseClient,
  userId: number
): Promise<BuildAzurePayloadResult> {
  // Fetch user profile
  const { data: profile, error: profileError } = await adminSupabase
    .from('users')
    .select('id, first_name, last_name, age, school, school_year, email, phone_number')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    throw new Error(`Profile not found for userId=${userId}: ${profileError?.message ?? 'no data'}`);
  }

  // Fetch all responses for this user (include question_hash for version filtering)
  const { data: responses, error: responsesError } = await adminSupabase
    .from('responses')
    .select(
      'section_id, question_number, question, question_hash, response_boolean, response_integer, response_text, response_array'
    )
    .eq('user_id', profile.id)
    .order('question_number', { ascending: true });

  if (responsesError) {
    throw new Error(`Failed to fetch responses: ${responsesError.message}`);
  }

  // Fetch section versions: sections + section_versions_log, join in memory
  const { data: sectionsData, error: svError } = await adminSupabase
    .from('sections')
    .select('id, current_version');

  const sectionVersionMap = new Map<number, SectionVersionRow>();

  if (sectionsData && !svError) {
    // For each section, fetch its current version snapshot from section_versions_log
    const sectionIds = sectionsData.map((s: { id: number; current_version: number }) => s.id);
    const { data: logRows } = await adminSupabase
      .from('section_versions_log')
      .select('section_id, version, questions_snapshot')
      .in('section_id', sectionIds);

    const sectionsMap = new Map<number, number>();
    for (const s of sectionsData) {
      sectionsMap.set(s.id, s.current_version);
    }

    for (const logRow of logRows ?? []) {
      const currentVersion = sectionsMap.get(logRow.section_id);
      if (currentVersion !== undefined && logRow.version === currentVersion) {
        sectionVersionMap.set(logRow.section_id, {
          section_id: logRow.section_id,
          current_version: currentVersion,
          questions_snapshot: logRow.questions_snapshot ?? null,
        });
      }
    }

    // Warn for sections that have no log row
    for (const [sectionId, version] of sectionsMap.entries()) {
      if (!sectionVersionMap.has(sectionId)) {
        console.warn(
          '[build-azure-payload] No section_versions_log row for section_id=%d (current_version=%d) — fallback: sending all responses',
          sectionId,
          version
        );
      }
    }
  }

  // Fetch questions metadata
  const { data: questions } = await adminSupabase
    .from('questions')
    .select('section_id, question_number, options, metadata');

  const questionsMap = new Map<string, { options?: unknown; metadata?: unknown }>();
  for (const q of questions ?? []) {
    questionsMap.set(`${q.section_id}_${q.question_number}`, q);
  }

  // Group responses by section_id
  const grouped: Record<number, typeof responses> = {};
  for (const row of responses ?? []) {
    if (!grouped[row.section_id]) grouped[row.section_id] = [];
    grouped[row.section_id].push(row);
  }

  // Track section versions used
  const sectionVersions: Record<string, number> = {};

  // Build responses payload
  const responsesPayload: Record<string, { name: string; responses: unknown[] }> = {};
  for (const [sectionId, meta] of Object.entries(SECTION_NAMES)) {
    const sectionIdNum = Number(sectionId);
    const allSectionRows = grouped[sectionIdNum] ?? [];
    const versionInfo = sectionVersionMap.get(sectionIdNum);

    // The assessment agent is STATELESS: each call must contain the user's full
    // current state. The rule for WHICH responses to include:
    //   send a response IFF its question is STILL in the form's current version.
    // We match by `question_number` (the question's identity), NOT by text/hash —
    // so rewording a question keeps its answer, while REMOVING a question drops
    // its answer (it's no longer in the form, so the agent must not see it).
    //   • add questions (10 → 12): new question_numbers in snapshot → answered → sent
    //   • remove a question: its question_number is gone from snapshot → dropped
    //   • reword a question: same question_number → kept (with current wording)
    let filteredRows = allSectionRows;
    // current question_number → snapshot text, for the active version
    const currentTextByNumber = new Map<number, string>();

    if (versionInfo) {
      const snapshot = versionInfo.questions_snapshot;

      if (!snapshot || snapshot.length === 0) {
        // No snapshot to define the current question set → fallback: send all.
        console.warn(
          '[build-azure-payload] Empty questions_snapshot for section_id=%d — fallback: sending all responses',
          sectionIdNum
        );
      } else {
        const currentNumbers = new Set<number>();
        for (const q of snapshot) {
          currentNumbers.add(q.question_number);
          if (q.text) currentTextByNumber.set(q.question_number, q.text);
        }
        // Keep only responses whose question is still part of the current form.
        filteredRows = allSectionRows.filter((row) => currentNumbers.has(row.question_number));
      }

      sectionVersions[String(sectionIdNum)] = versionInfo.current_version;
    }
    // If no versionInfo, section is not versioned yet → send all responses.

    responsesPayload[meta.key] = {
      name: meta.name,
      responses: filteredRows.map((row) => {
        const { answer, response_type } = getResponseType(row);
        const questionData = questionsMap.get(`${sectionIdNum}_${row.question_number}`);
        // Prefer the current form wording (snapshot) so the agent sees the
        // question as it stands now; fall back to the text saved with the answer.
        const questionText = currentTextByNumber.get(row.question_number) ?? row.question ?? '';
        return {
          question_number: row.question_number,
          question_text: questionText,
          answer,
          response_type,
          ...(questionData?.options ? { options: questionData.options } : {}),
          ...(questionData?.metadata ? { metadata: questionData.metadata } : {}),
        };
      }),
    };
  }

  return {
    payload: {
      personal_data: {
        first_name: profile.first_name ?? '',
        last_name: profile.last_name ?? '',
        age: profile.age ?? 0,
        school: profile.school ?? '',
        school_year: profile.school_year ?? '',
        email: profile.email ?? '',
        phone_number: profile.phone_number ?? '',
      },
      responses: responsesPayload,
    },
    sectionVersions,
  };
}
