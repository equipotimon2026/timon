'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { Link, useRouter } from '@/i18n/routing';

type ProfileStatus = 'completed' | 'processing' | 'error' | 'none';

interface UserRow {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  school: string | null;
  created_at: string;
  responses_count: number;
  has_active_assessment: boolean;
  profile_status: ProfileStatus;
  output_date: string | null;
  output_assessment_id: string | null;
  released: boolean;
}

interface UsersTableProps {
  users: UserRow[];
  total: number;
  page: number;
  totalPages: number;
  search: string;
  status: string;
  sort: string;
  dir: 'asc' | 'desc';
}

const STATUS_LABELS: Record<ProfileStatus, { label: string; className: string }> = {
  completed: { label: 'Completado', className: 'text-green-600' },
  processing: { label: 'Procesando', className: 'text-yellow-600' },
  error: { label: 'Error', className: 'text-red-600' },
  none: { label: 'Sin perfil', className: 'text-gray-400' },
};

function buildHref(opts: {
  search?: string;
  page?: number;
  status?: string;
  sort?: string;
  dir?: string;
}) {
  const params = new URLSearchParams();
  if (opts.search) params.set('search', opts.search);
  if (opts.status) params.set('status', opts.status);
  if (opts.sort && opts.sort !== 'created') params.set('sort', opts.sort);
  if (opts.dir && opts.dir !== 'desc') params.set('dir', opts.dir);
  if (opts.page && opts.page > 1) params.set('page', String(opts.page));
  const qs = params.toString();
  return `/admin${qs ? `?${qs}` : ''}`;
}

// Una fila es "liberable" si tiene un output completado todavia sin liberar.
function isReleasable(u: UserRow): boolean {
  return !!u.output_assessment_id && !u.released;
}

export default function UsersTable({
  users,
  total,
  page,
  totalPages,
  search,
  status,
  sort,
  dir,
}: UsersTableProps) {
  const router = useRouter();
  const [term, setTerm] = useState(search);
  const [, startTransition] = useTransition();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  // Modal de confirmacion: lista de assessment ids a liberar.
  const [confirmIds, setConfirmIds] = useState<string[] | null>(null);
  const [releasing, setReleasing] = useState(false);

  useEffect(() => {
    setTerm(search);
  }, [search]);

  // Limpiar seleccion cuando cambian los datos visibles (paginar/filtrar).
  useEffect(() => {
    setSelected(new Set());
  }, [users]);

  useEffect(() => {
    if (term === search) return;
    const handle = setTimeout(() => {
      startTransition(() => {
        router.push(buildHref({ search: term, status, sort, dir, page: 1 }));
      });
    }, 300);
    return () => clearTimeout(handle);
  }, [term, search, status, sort, dir, router]);

  const releasableRows = useMemo(() => users.filter(isReleasable), [users]);
  const allReleasableSelected =
    releasableRows.length > 0 && releasableRows.every((u) => selected.has(u.output_assessment_id!));

  const from = total === 0 ? 0 : (page - 1) * 20 + 1;
  const to = Math.min(page * 20, total);

  function navigate(next: Partial<{ status: string; sort: string; dir: string }>) {
    startTransition(() => {
      router.push(buildHref({ search, status, sort, dir, ...next, page: 1 }));
    });
  }

  function toggleSort(field: string) {
    if (sort === field) {
      navigate({ sort: field, dir: dir === 'asc' ? 'desc' : 'asc' });
    } else {
      navigate({ sort: field, dir: 'asc' });
    }
  }

  function sortArrow(field: string) {
    if (sort !== field) return '';
    return dir === 'asc' ? ' ↑' : ' ↓';
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => {
      if (releasableRows.every((u) => prev.has(u.output_assessment_id!))) {
        return new Set();
      }
      return new Set(releasableRows.map((u) => u.output_assessment_id!));
    });
  }

  async function doRelease(ids: string[]) {
    setReleasing(true);
    try {
      const res = await fetch('/api/admin/assessments/release-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body.error ?? 'Error al liberar.');
        return;
      }
      setConfirmIds(null);
      setSelected(new Set());
      startTransition(() => router.refresh());
    } catch {
      alert('Error de red al liberar.');
    } finally {
      setReleasing(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Buscar por email o nombre..."
            className="w-72 max-w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <select
            value={status}
            onChange={(e) => navigate({ status: e.target.value })}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="completed">Completado</option>
            <option value="processing">Procesando</option>
            <option value="error">Error</option>
            <option value="none">Sin perfil generado</option>
            <option value="pending_release">Pendientes por liberar</option>
          </select>
        </div>
        <span className="text-sm text-gray-500">
          {total === 0 ? 'Sin resultados' : `${from}-${to} de ${total}`}
        </span>
      </div>

      {/* Barra de accion masiva */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2">
          <span className="text-sm text-emerald-800">
            {selected.size} seleccionado{selected.size > 1 ? 's' : ''} para liberar
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelected(new Set())}
              className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
            >
              Limpiar
            </button>
            <button
              onClick={() => setConfirmIds(Array.from(selected))}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Liberar seleccionados
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allReleasableSelected}
                  disabled={releasableRows.length === 0}
                  onChange={toggleAll}
                  aria-label="Seleccionar todos los liberables"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <SortableTh label="Colegio" active={sort === 'school'} arrow={sortArrow('school')} onClick={() => toggleSort('school')} />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Respuestas</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <SortableTh label="Output" active={sort === 'output'} arrow={sortArrow('output')} onClick={() => toggleSort('output')} />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Liberado</th>
              <SortableTh label="Registrado" active={sort === 'created'} arrow={sortArrow('created')} onClick={() => toggleSort('created')} />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-sm text-gray-500">
                  No hay usuarios para mostrar.
                </td>
              </tr>
            )}
            {users.map((user) => {
              const st = STATUS_LABELS[user.profile_status];
              const releasable = isReleasable(user);
              const aid = user.output_assessment_id;
              return (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {releasable && aid && (
                      <input
                        type="checkbox"
                        checked={selected.has(aid)}
                        onChange={() => toggleRow(aid)}
                        aria-label={`Seleccionar ${user.email}`}
                      />
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {[user.first_name, user.last_name].filter(Boolean).join(' ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{user.school || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{user.responses_count} / 13</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`font-medium ${st.className}`}>{st.label}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {user.output_date
                      ? new Date(user.output_date).toLocaleDateString('es-AR')
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {!user.output_assessment_id ? (
                      <span className="text-gray-400">—</span>
                    ) : user.released ? (
                      <span className="font-medium text-green-600">Sí ✓</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-amber-600">No</span>
                        <button
                          onClick={() => setConfirmIds([user.output_assessment_id!])}
                          className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                        >
                          Liberar
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(user.created_at).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Ver detalles
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Página {page} de {totalPages}
          </div>
          <div className="flex gap-2">
            <PageLink
              href={buildHref({ search, status, sort, dir, page: page - 1 })}
              disabled={page <= 1}
              label="← Anterior"
            />
            <PageLink
              href={buildHref({ search, status, sort, dir, page: page + 1 })}
              disabled={page >= totalPages}
              label="Siguiente →"
            />
          </div>
        </div>
      )}

      {/* Modal de confirmacion de liberacion */}
      {confirmIds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Liberar resultado{confirmIds.length > 1 ? 's' : ''}</h3>
            <p className="mt-2 text-sm text-gray-600">
              Vas a liberar {confirmIds.length} resultado{confirmIds.length > 1 ? 's' : ''}. Los
              usuarios van a poder ver su perfil. Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setConfirmIds(null)}
                disabled={releasing}
                className="rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => doRelease(confirmIds)}
                disabled={releasing}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {releasing ? 'Liberando...' : 'Confirmar liberación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SortableTh({
  label,
  active,
  arrow,
  onClick,
}: {
  label: string;
  active: boolean;
  arrow: string;
  onClick: () => void;
}) {
  return (
    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
      <button
        type="button"
        onClick={onClick}
        className={`uppercase tracking-wider hover:text-blue-600 ${active ? 'text-blue-600' : 'text-gray-500'}`}
      >
        {label}
        {arrow}
      </button>
    </th>
  );
}

function PageLink({ href, disabled, label }: { href: string; disabled: boolean; label: string }) {
  if (disabled) {
    return (
      <span className="px-3 py-1.5 text-sm rounded-md border border-gray-200 text-gray-400 cursor-not-allowed">
        {label}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
    >
      {label}
    </Link>
  );
}
