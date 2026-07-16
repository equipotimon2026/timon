'use client';

import { useState, useCallback, useEffect, Fragment } from 'react';
import { Link } from '@/i18n/routing';
import PasswordModal from './password-modal';
import { RationaleView } from './rationale-view';

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
  payment_exempt: boolean;
  referral_code: string | null;
}

interface Payment {
  id: number;
  base_amount: number;
  amount: number;
  discount_pct: number;
  referral_code: string | null;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
  talo_payment_id: string | null;
  expires_at: string | null;
}

interface ReferralUser {
  user_id: number;
  code: string;
  created_at: string;
  name: string | null;
  email: string | null;
}

interface UsedReferral {
  code: string;
  owner_user_id: number;
  created_at: string;
  ownerName: string | null;
  ownerEmail: string | null;
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
  payments: Payment[];
  referralUses: ReferralUser[];
  usedReferral: UsedReferral | null;
  userId: number;
}

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  SUCCESS: 'bg-green-100 text-green-800',
  OVERPAID: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  UNDERPAID: 'bg-orange-100 text-orange-800',
  EXPIRED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

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
  payments,
  referralUses,
  usedReferral,
  userId,
}: UserDetailClientProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [assessments, setAssessments] = useState<Assessment[]>(initialAssessments);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [pollingId, setPollingId] = useState<string | null>(null);
  // Rationale (analisis del agente) expandible por fila, lazy-load.
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rationaleById, setRationaleById] = useState<Record<string, any>>({});
  const [rationaleLoading, setRationaleLoading] = useState(false);

  async function toggleRationale(assessmentId: string) {
    if (expandedId === assessmentId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(assessmentId);
    if (!(assessmentId in rationaleById)) {
      setRationaleLoading(true);
      try {
        const res = await fetch(`/api/admin/assessments/${assessmentId}/rationale`);
        const body = await res.json().catch(() => ({}));
        setRationaleById((prev) => ({ ...prev, [assessmentId]: body.rationale ?? null }));
      } catch {
        setRationaleById((prev) => ({ ...prev, [assessmentId]: null }));
      } finally {
        setRationaleLoading(false);
      }
    }
  }

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
          let updated = data.assessments as Assessment[];
          let found = updated.find((a) => a.assessment_id === assessmentId);

          // Clave del fix: el GET de arriba solo relee la DB. El estado real lo
          // tiene Azure. Mientras siga 'processing' y ya tengamos el db id,
          // disparamos el poll server-side que consulta Azure y persiste el
          // resultado; luego releemos para reflejar el estado nuevo.
          if (found?.id && found.status === 'processing') {
            const pollRes = await fetch(
              `/api/admin/assessments/${found.id}/poll`,
              { method: 'POST' }
            );
            if (pollRes.ok) {
              const pollData = await pollRes.json();
              if (pollData.status && pollData.status !== 'processing') {
                const res2 = await fetch(`/api/admin/users/${userId}`);
                if (res2.ok) {
                  updated = (await res2.json()).assessments as Assessment[];
                  found = updated.find((a) => a.assessment_id === assessmentId);
                }
              }
            }
          }

          setAssessments(updated);
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

  // Al montar: si hay assessments 'processing' (ej: generados antes y que
  // quedaron sin pollear, o tras un reload), arrancamos el poll a Azure para
  // traer el resultado. Sin esto, un processing solo se actualizaba mientras
  // estabas en la pantalla justo despues de generar.
  useEffect(() => {
    const processing = initialAssessments.filter((a) => a.status === 'processing');
    if (processing.length === 0) return;
    setPollingId(processing[0].assessment_id);
    processing.forEach((a) => pollAssessment(a.assessment_id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Unrelease: volver a ocultar el resultado al usuario (Mejora #2)
  async function handleUnrelease(assessmentId: string) {
    if (!confirm('¿Desliberar este resultado? El usuario dejará de verlo.')) return;
    const res = await fetch(`/api/admin/assessments/${assessmentId}/unrelease`, { method: 'POST' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      alert(body.error ?? 'Error al desliberar.');
      return;
    }
    setAssessments((prev) =>
      prev.map((a) => (a.id === assessmentId ? { ...a, released_at: null } : a))
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

  const hasSuccessfulPayment = payments.some((p) => p.status === 'SUCCESS' || p.status === 'OVERPAID');
  const paymentStatusBadge = user.payment_exempt
    ? { label: 'Exento', className: 'bg-blue-100 text-blue-800' }
    : hasSuccessfulPayment
    ? { label: 'Pagado', className: 'bg-green-100 text-green-800' }
    : { label: 'Sin pagar', className: 'bg-gray-100 text-gray-800' };

  return (
    <div className="space-y-8">
      {/* Section: Pago y referidos */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Pago y referidos</h2>
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full ${paymentStatusBadge.className}`}
          >
            {paymentStatusBadge.label}
          </span>
        </div>

        {/* Bloque pagos */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Pagos</h3>
          {payments.length === 0 ? (
            <p className="text-sm text-gray-500">Sin pagos registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Precio lista</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Desc.</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Código aplicado</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID Talo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-700">
                        {new Date(p.created_at).toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        {currencyFormatter.format(p.amount)}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        {p.base_amount !== p.amount ? currencyFormatter.format(p.base_amount) : '—'}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        {p.discount_pct ? `${p.discount_pct}%` : '—'}
                      </td>
                      <td className="px-3 py-2 text-gray-700 font-mono text-xs">
                        {p.referral_code ?? '—'}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            PAYMENT_STATUS_STYLES[p.status] ?? 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td
                        className="px-3 py-2 text-gray-700 font-mono text-xs max-w-[10rem] truncate"
                        title={p.talo_payment_id ?? undefined}
                      >
                        {p.talo_payment_id ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Bloque referidos */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Referidos</h3>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-medium text-gray-500">Su código</dt>
              <dd className="text-gray-900 font-mono">{user.referral_code ?? '—'}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">
                Personas que usaron su código: {referralUses.length}
              </dt>
              {referralUses.length > 0 && (
                <dd className="mt-1">
                  <ul className="space-y-1">
                    {referralUses.map((r) => (
                      <li key={r.user_id} className="text-gray-900">
                        {r.name || r.email || `Usuario #${r.user_id}`}
                        {r.name && r.email ? ` (${r.email})` : ''}
                        {' — '}
                        {new Date(r.created_at).toLocaleDateString('es-AR')}
                      </li>
                    ))}
                  </ul>
                </dd>
              )}
            </div>
            <div>
              <dt className="font-medium text-gray-500">Código que usó</dt>
              <dd className="text-gray-900">
                {usedReferral ? (
                  <>
                    <span className="font-mono">{usedReferral.code}</span>
                    {' de '}
                    {usedReferral.ownerName || usedReferral.ownerEmail || `Usuario #${usedReferral.owner_user_id}`}
                    {' '}
                    ({new Date(usedReferral.created_at).toLocaleDateString('es-AR')})
                  </>
                ) : (
                  'No usó ningún código.'
                )}
              </dd>
            </div>
          </dl>
        </div>
      </section>

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
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadPayload}
            className="px-4 py-2 text-sm text-white bg-gray-700 rounded-md hover:bg-gray-800"
          >
            Descargar payload .json
          </button>
          <Link
            href={`/admin/users/${userId}/input`}
            target="_blank"
            className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            View user input ↗
          </Link>
        </div>
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
                  <Fragment key={a.assessment_id}>
                  <tr className="hover:bg-gray-50">
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
                      {a.status === 'completed' && a.released_at && (
                        <button
                          onClick={() => handleUnrelease(a.id)}
                          className="text-amber-600 hover:text-amber-800 text-xs font-medium"
                        >
                          Desliberar
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
                          <button
                            onClick={() => toggleRationale(a.id)}
                            className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                          >
                            {expandedId === a.id ? 'Ocultar análisis' : 'Ver análisis del agente'}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                  {expandedId === a.id && (
                    <tr>
                      <td colSpan={5} className="bg-gray-50 px-4 py-4">
                        {rationaleLoading && !(a.id in rationaleById) ? (
                          <p className="text-sm text-gray-500">Cargando análisis...</p>
                        ) : (
                          <RationaleView rationale={rationaleById[a.id]} />
                        )}
                      </td>
                    </tr>
                  )}
                  </Fragment>
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
