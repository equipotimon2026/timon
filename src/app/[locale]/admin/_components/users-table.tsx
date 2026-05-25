'use client';

import { useEffect, useState, useTransition } from 'react';
import { Link, useRouter } from '@/i18n/routing';

interface UserRow {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  responses_count: number;
  has_active_assessment: boolean;
}

interface UsersTableProps {
  users: UserRow[];
  total: number;
  page: number;
  totalPages: number;
  search: string;
}

function buildHref(search: string, page: number) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return `/admin${qs ? `?${qs}` : ''}`;
}

export default function UsersTable({ users, total, page, totalPages, search }: UsersTableProps) {
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
        router.push(buildHref(term, 1));
      });
    }, 300);
    return () => clearTimeout(handle);
  }, [term, search, router]);

  const from = total === 0 ? 0 : (page - 1) * 20 + 1;
  const to = Math.min(page * 20, total);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <input
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Buscar por email o nombre..."
          className="w-80 max-w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Respuestas</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perfil activo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                  No hay usuarios para mostrar.
                </td>
              </tr>
            )}
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {[user.first_name, user.last_name].filter(Boolean).join(' ') || '—'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{user.responses_count} / 13</td>
                <td className="px-4 py-3 text-sm">
                  {user.has_active_assessment ? (
                    <span className="text-green-600 font-medium">✓</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
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
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Página {page} de {totalPages}
          </div>
          <div className="flex gap-2">
            <PageLink search={search} page={page - 1} disabled={page <= 1} label="← Anterior" />
            <PageLink search={search} page={page + 1} disabled={page >= totalPages} label="Siguiente →" />
          </div>
        </div>
      )}
    </div>
  );
}

function PageLink({ search, page, disabled, label }: { search: string; page: number; disabled: boolean; label: string }) {
  if (disabled) {
    return (
      <span className="px-3 py-1.5 text-sm rounded-md border border-gray-200 text-gray-400 cursor-not-allowed">
        {label}
      </span>
    );
  }
  return (
    <Link
      href={buildHref(search, page)}
      className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
    >
      {label}
    </Link>
  );
}
