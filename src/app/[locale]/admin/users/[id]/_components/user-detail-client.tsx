'use client';

import { useState, useCallback } from 'react';
import { Link } from '@/i18n/routing';
import PasswordModal from './password-modal';

interface User {
  id: number;
  auth_id: string;
  first_name: string | null;
  last_name: string | null;
  age: number | null;
  school: string | null;
  school_year: string | null;
  email: string;
  phone_number: string | null;
  persona: string | null;
  onboarding_completed: boolean | null;
  created_at: string;
}

interface Response {
  section_id: number;
  question_number: number;
  question: string | null;
  response_boolean: boolean | null;
  response_integer: number | null;
  response_text: string | null;
  response_array: unknown | null;
}

interface Assessment {
  id: string;
  assessment_id: string;
  status: string;
  is_active: boolean;
  generated_by: string;
  created_at: string;
  completed_at: string | null;
  released_at: string | null;
  error: string | null;
}

interface UserDetailClientProps {
  user: User;
  responsesBySection: Record<number, Response[]>;
  assessments: Assessment[];
  userId: number;
}

const PRD_SECTIONS: { prd: number; label: string }[] = [
  { prd: 1, label: 'Personalidad (MIPS/Millon)' },
  { prd: 2, label: 'Intereses (RIASEC)' },
  { prd: 3, label: 'Dominancia Cerebral (Herrmann)' },
  { prd: 4, label: 'Inteligencias Múltiples (Gardner)' },
  { prd: 5, label: 'Técnicas Proyectivas' },
  { prd: 6, label: 'Autodescubrimiento' },
  { prd: 7, label: 'Estilo de Vida' },
  { prd: 8, label: 'Visión Futuro' },
  { prd: 9, label: 'Árbol Genealógico' },
  { prd: 10, label: 'Universidad' },
  { prd: 11, label: 'Identificación de Perfil' },
  { prd: 12, label: 'Vos y el Colegio' },
  { prd: 13, label: 'Perspectiva Familiar' },
];

export default function UserDetailClient({
  user,
  responsesBySection,
  assessments: initialAssessments,
  userId,
}: UserDetailClientProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [assessments, setAssessments] = useState<Assessment[]>(initialAssessments);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [pollingId, setPollingId] = useState<string | null>(null);

  const totalSections = Object.keys(responsesBySection).length;

  // Download payload
  async function handleDownloadPayload() {
    const res = await fetch(`/api/admin/users/${userId}/payload`);
    if (!res.ok) {
      alert('Error al descargar payload.');
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payload-user-${userId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Poll assessment status
  const pollAssessment = useCallback(
    async (assessmentId: string) => {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/admin/users/${userId}`);
          if (!res.ok) return;
          const data = await res.json();
          const updated = data.assessments as Assessment[];
          setAssessments(updated);
          const found = updated.find((a) => a.assessment_id === assessmentId);
          if (
            found &&
            (found.status === 'completed' ||
              found.status === 'failed' ||
              found.status === 'cancelled')
          ) {
            clearInterval(interval);
            setPollingId(null);
            setGenerating(false);
          }
        } catch {
          // ignore
        }
      }, 5000);
    },
    [userId]
  );

  // Generate new profile
  async function handleGenerate() {
    setGenerateError(null);
    setGenerating(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/generate`, { method: 'POST' });
      const body = await res.json();
      if (!res.ok) {
        setGenerateError(body.error ?? 'Error al generar perfil.');
        setGenerating(false);
        return;
      }
      setPollingId(body.assessment_id);
      // Add optimistic pending row
      setAssessments((prev) => [
        {
          id: '', // se completa con el id real (uuid) en el primer poll
          assessment_id: body.assessment_id,
          status: 'processing',
          is_active: false,
          generated_by: 'admin',
          created_at: new Date().toISOString(),
          completed_at: null,
          released_at: null,
          error: null,
        },
        // "Pisamos" cualquier processing previo en la UI (el server lo cancela).
        ...prev.map((a) =>
          a.status === 'processing' ? { ...a, status: 'cancelled' } : a
        ),
      ]);
      pollAssessment(body.assessment_id);
    } catch {
      setGenerateError('Error de red.');
      setGenerating(false);
    }
  }

  // Activate assessment
  async function handleActivate(assessmentId: string) {
    const res = await fetch(`/api/admin/assessments/${assessmentId}/activate`, { method: 'POST' });
    if (!res.ok) {
      const body = await res.json();
      alert(body.error ?? 'Error al activar.');
      return;
    }
    setAssessments((prev) =>
      prev.map((a) => ({ ...a, is_active: a.id === assessmentId }))
    );
  }

  // Cancel a stuck "processing" assessment (Mejora #3)
  async function handleCancel(assessmentId: string) {
    if (!assessmentId) {
      alert('Esperá unos segundos a que cargue el assessment y reintentá.');
      return;
    }
    if (!confirm('¿Cancelar este assessment en proceso? Pasará a "cancelled".')) return;
    const res = await fetch(`/api/admin/assessments/${assessmentId}/cancel`, { method: 'POST' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      alert(body.error ?? 'Error al cancelar.');
      return;
    }
    // Si estabamos polleando ese id, cortamos.
    setPollingId(null);
    setGenerating(false);
    setAssessments((prev) =>
      prev.map((a) =>
        a.id === assessmentId ? { ...a, status: 'cancelled' } : a
      )
    );
  }

  // Release a completed result to the user (Mejora #2)
  async function handleRelease(assessmentId: string) {
    const res = await fetch(`/api/admin/assessments/${assessmentId}/release`, { method: 'POST' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      alert(body.error ?? 'Error al liberar resultado.');
      return;
    }
    const body = await res.json().catch(() => ({}));
    setAssessments((prev) =>
      prev.map((a) =>
        a.id === assessmentId
          ? { ...a, released_at: body.released_at ?? new Date().toISOString() }
          : a
      )
    );
  }

  // Download results
  async function handleDownloadResults(assessmentId: string, dbId: string) {
    const res = await fetch(`/api/admin/assessments/${dbId}/results`);
    if (!res.ok) {
      alert('Error al descargar resultados.');
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `results-${assessmentId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      {/* Section 5.1: Info */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Información</h2>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Editar contraseña
          </button>
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="font-medium text-gray-500">Email</dt>
            <dd className="text-gray-900">{user.email}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Nombre</dt>
            <dd className="text-gray-900">
              {[user.first_name, user.last_name].filter(Boolean).join(' ') || '—'}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Edad</dt>
            <dd className="text-gray-900">{user.age ?? '—'}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Colegio</dt>
            <dd className="text-gray-900">{user.school ?? '—'}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Año escolar</dt>
            <dd className="text-gray-900">{user.school_year ?? '—'}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Persona</dt>
            <dd className="text-gray-900">{user.persona ?? '—'}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Teléfono</dt>
            <dd className="text-gray-900">{user.phone_number ?? '—'}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Registrado</dt>
            <dd className="text-gray-900">{new Date(user.created_at).toLocaleDateString('es-AR')}</dd>
          </div>
        </dl>
      </section>

      {/* Section 5.2: Progreso */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Progreso ({totalSections} / 13)
        </h2>
        <ul className="space-y-2">
          {PRD_SECTIONS.map(({ prd, label }) => {
            // Map PRD 1-13 to section_ids based on SECTION_NAMES in build-azure-payload
            // The sections tracked: MILLON=2, RIASEC=3, HERRMANN=4, GARDNER=5, PROYECTIVA=6, AUTODESC=7,
            // LIFESTYLE=9, FUTURO=10, FAMILIA=11, UNIVERSIDAD=12, VIBECHECK=13, VOSCOLEGIO=14, PADRES=15
            const PRD_TO_SECTION_ID: Record<number, number> = {
              1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 9, 8: 10, 9: 11, 10: 12, 11: 13, 12: 14, 13: 15,
            };
            const sectionId = PRD_TO_SECTION_ID[prd];
            const sectionResponses = responsesBySection[sectionId] ?? [];
            const count = sectionResponses.length;
            const status = count === 0 ? 'empty' : 'completed';

            return (
              <li key={prd} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">
                  {prd}. {label}
                </span>
                <span
                  className={
                    status === 'completed'
                      ? 'text-green-600 font-medium'
                      : 'text-gray-400'
                  }
                >
                  {status === 'completed' ? `${count} resp.` : 'Sin respuestas'}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Section 5.3: Debug */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Debug</h2>
        <button
          onClick={handleDownloadPayload}
          className="px-4 py-2 text-sm text-white bg-gray-700 rounded-md hover:bg-gray-800"
        >
          Descargar payload .json
        </button>
      </section>

      {/* Section 5.4: Assessments */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Perfiles generados</h2>
          <button
            onClick={handleGenerate}
            disabled={generating || pollingId !== null}
            className="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {generating ? 'Generando...' : 'Generar nuevo perfil'}
          </button>
        </div>
        {generateError && <p className="text-red-600 text-sm mb-4">{generateError}</p>}
        {pollingId && (
          <p className="text-blue-600 text-sm mb-4">
            Procesando assessment {pollingId}... (actualizando cada 5s)
          </p>
        )}
        {assessments.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay assessments para este usuario.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Creado
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Generado por
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Activo
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assessments.map((a) => (
                  <tr key={a.assessment_id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-700">
                      {new Date(a.created_at).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-3 py-2 text-gray-700">{a.generated_by}</td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          a.status === 'completed'
                            ? 'text-green-600'
                            : a.status === 'failed'
                            ? 'text-red-600'
                            : a.status === 'cancelled'
                            ? 'text-gray-500'
                            : 'text-yellow-600'
                        }
                      >
                        {a.status === 'failed' ? 'error' : a.status}
                      </span>
                      {(a.status === 'failed' || a.status === 'cancelled') && a.error && (
                        <p className="mt-1 max-w-xs text-xs text-gray-500 break-words">
                          {a.error}
                        </p>
                      )}
                      {a.status === 'completed' && (
                        <p className="mt-1 text-xs font-medium">
                          {a.released_at ? (
                            <span className="text-green-600">Liberado ✓</span>
                          ) : (
                            <span className="text-amber-600">Sin liberar</span>
                          )}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {a.is_active ? (
                        <span className="text-green-600 font-medium">Activo</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 flex gap-2 flex-wrap">
                      {a.status === 'processing' && a.id && (
                        <button
                          onClick={() => handleCancel(a.id)}
                          className="text-red-600 hover:text-red-800 text-xs font-medium"
                        >
                          Cancelar
                        </button>
                      )}
                      {a.status === 'completed' && !a.released_at && (
                        <button
                          onClick={() => handleRelease(a.id)}
                          className="text-emerald-600 hover:text-emerald-800 text-xs font-medium"
                        >
                          Liberar resultado
                        </button>
                      )}
                      {!a.is_active && a.status === 'completed' && (
                        <button
                          onClick={() => handleActivate(a.id)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          Activar
                        </button>
                      )}
                      {a.status === 'completed' && (
                        <>
                          <Link
                            href={`/admin/users/${userId}/results/${a.id}`}
                            className="text-purple-600 hover:text-purple-800 text-xs font-medium"
                          >
                            Ver preview / PDF
                          </Link>
                          <button
                            onClick={() => handleDownloadResults(a.assessment_id, a.id)}
                            className="text-gray-600 hover:text-gray-800 text-xs font-medium"
                          >
                            Descargar .json
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showPasswordModal && (
        <PasswordModal userId={userId} onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
}
