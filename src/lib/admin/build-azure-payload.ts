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

/**
 * Build the Azure assessment payload for a given user (by public.users.id BIGINT).
 * adminSupabase must be a service-role client to access questions table.
 */
export async function buildAzurePayload(
  adminSupabase: SupabaseClient,
  userId: number
): Promise<AzurePayload> {
  // Fetch user profile
  const { data: profile, error: profileError } = await adminSupabase
    .from('users')
    .select('id, first_name, last_name, age, school, school_year, email, phone_number')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    throw new Error(`Profile not found for userId=${userId}: ${profileError?.message ?? 'no data'}`);
  }

  // Fetch all responses for this user
  const { data: responses, error: responsesError } = await adminSupabase
    .from('responses')
    .select(
      'section_id, question_number, question, response_boolean, response_integer, response_text, response_array'
    )
    .eq('user_id', profile.id)
    .order('question_number', { ascending: true });

  if (responsesError) {
    throw new Error(`Failed to fetch responses: ${responsesError.message}`);
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

  // Build responses payload
  const responsesPayload: Record<string, { name: string; responses: unknown[] }> = {};
  for (const [sectionId, meta] of Object.entries(SECTION_NAMES)) {
    const sectionRows = grouped[Number(sectionId)] ?? [];
    responsesPayload[meta.key] = {
      name: meta.name,
      responses: sectionRows.map((row) => {
        const { answer, response_type } = getResponseType(row);
        const questionData = questionsMap.get(`${Number(sectionId)}_${row.question_number}`);
        return {
          question_number: row.question_number,
          question_text: row.question ?? '',
          answer,
          response_type,
          ...(questionData?.options ? { options: questionData.options } : {}),
          ...(questionData?.metadata ? { metadata: questionData.metadata } : {}),
        };
      }),
    };
  }

  return {
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
  };
}
