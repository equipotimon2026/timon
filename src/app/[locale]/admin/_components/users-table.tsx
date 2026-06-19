'use client';

import { useEffect, useState, useTransition } from 'react';
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

  useEffect(() => {
    setTerm(search);
  }, [search]);

  useEffect(() => {
    if (term === search) return;
    const handle = setTimeout(() => {
      startTransition(() => {
        router.push(buildHref({ search: term, status, sort, dir, page: 1 }));
      });
    }, 300);
    return () => clearTimeout(handle);
  }, [term, search, status, sort, dir, router]);

  const from = total === 0 ? 0 : (page - 1) * 20 + 1;
  const to = Math.min(page * 20, total);

  function navigate(next: Partial<{ status: string; sort: string; dir: string }>) {
    startTransition(() => {
      router.push(
        buildHref({ search, status, sort, dir, ...next, page: 1 })
      );
    });
  }

  // Click en header ordenable: alterna direccion si ya esta activo.
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
          </select>
        </div>
        <span className="text-sm text-gray-500">
          {total === 0 ? 'Sin resultados' : `${from}-${to} de ${total}`}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <SortableTh label="Colegio" active={sort === 'school'} arrow={sortArrow('school')} onClick={() => toggleSort('school')} />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Respuestas</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <SortableTh label="Output" active={sort === 'output'} arrow={sortArrow('output')} onClick={() => toggleSort('output')} />
              <SortableTh label="Registrado" active={sort === 'created'} arrow={sortArrow('created')} onClick={() => toggleSort('created')} />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-sm text-gray-500">
                  No hay usuarios para mostrar.
                </td>
              </tr>
            )}
            {users.map((user) => {
              const st = STATUS_LABELS[user.profile_status];
              return (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {[user.first_name, user.last_name].filter(Boolean).join(' ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{user.school || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{user.responses_count} / 13</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`font-medium ${st.className}`}>{st.label}</span>
                    {user.has_active_assessment && (
                      <span className="ml-2 text-xs text-green-600">• activo</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {user.output_date
                      ? new Date(user.output_date).toLocaleDateString('es-AR')
                      : '—'}
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
