import { requireAdminPage } from '@/lib/admin/guard';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { sectionLabel } from '@/lib/admin/section-labels';

interface ResponseRow {
  section_id: number;
  question_number: number;
  question: string | null;
  response_boolean: boolean | null;
  response_integer: number | null;
  response_text: string | null;
  response_array: unknown | null;
}

function renderAnswer(r: ResponseRow): string {
  if (r.response_text !== null && r.response_text !== undefined && r.response_text !== '') {
    return r.response_text;
  }
  if (r.response_array !== null && r.response_array !== undefined) {
    if (Array.isArray(r.response_array)) {
      return r.response_array.map((x) => String(x)).join(', ') || '—';
    }
    return JSON.stringify(r.response_array);
  }
  if (r.response_boolean !== null && r.response_boolean !== undefined) {
    return r.response_boolean ? 'Sí' : 'No';
  }
  if (r.response_integer !== null && r.response_integer !== undefined) {
    return String(r.response_integer);
  }
  return '—';
}

export default async function UserInputPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { adminSupabase } = await requireAdminPage();
  const { id } = await params;
  const userId = Number(id);
  if (isNaN(userId)) notFound();

  const [{ data: user, error: userError }, { data: responses }] = await Promise.all([
    adminSupabase
      .from('users')
      .select('id, first_name, last_name, email')
      .eq('id', userId)
      .single(),
    adminSupabase
      .from('responses')
      .select('section_id, question_number, question, response_boolean, response_integer, response_text, response_array')
      .eq('user_id', userId)
      .order('section_id', { ascending: true })
      .order('question_number', { ascending: true }),
  ]);

  if (userError || !user) notFound();

  // Agrupar por seccion preservando orden.
  const bySection = new Map<number, ResponseRow[]>();
  for (const row of (responses ?? []) as ResponseRow[]) {
    if (!bySection.has(row.section_id)) bySection.set(row.section_id, []);
    bySection.get(row.section_id)!.push(row);
  }
  const sectionIds = Array.from(bySection.keys()).sort((a, b) => a - b);

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Respuestas de {fullName}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <Link
          href={`/admin/users/${userId}`}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ← Volver al detalle
        </Link>
      </div>

      {sectionIds.length === 0 ? (
        <p className="text-gray-500">Este usuario no tiene respuestas registradas.</p>
      ) : (
        <div className="space-y-6">
          {sectionIds.map((sid) => {
            const rows = bySection.get(sid)!;
            return (
              <section key={sid} className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  {sectionLabel(sid)}{' '}
                  <span className="text-sm font-normal text-gray-400">({rows.length} resp.)</span>
                </h2>
                <ol className="space-y-4">
                  {rows.map((r, i) => (
                    <li key={`${sid}-${r.question_number}-${i}`} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                      <p className="text-sm font-medium text-gray-700">
                        {r.question || `Pregunta ${r.question_number}`}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-gray-900">
                        {renderAnswer(r)}
                      </p>
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
