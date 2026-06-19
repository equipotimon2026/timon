import { requireAdminPage } from '@/lib/admin/guard';
import UsersTable from './_components/users-table';

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

const PAGE_SIZE = 20;
const VALID_STATUS = new Set(['completed', 'processing', 'error', 'none']);
const VALID_SORT = new Set(['created', 'output', 'school']);

// Estado "del perfil" de un usuario = estado del assessment mas reciente.
function mapProfileStatus(status: string | null | undefined): ProfileStatus {
  if (status === 'completed') return 'completed';
  if (status === 'processing') return 'processing';
  if (status === 'failed') return 'error';
  return 'none'; // sin assessments, o cancelled (sin perfil vigente)
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    page?: string;
    status?: string;
    sort?: string;
    dir?: string;
  }>;
}) {
  const { adminSupabase } = await requireAdminPage();
  const {
    search = '',
    page: pageStr = '1',
    status: statusParam = '',
    sort: sortParam = 'created',
    dir: dirParam = 'desc',
  } = await searchParams;

  const page = Math.max(1, Number(pageStr) || 1);
  const statusFilter = VALID_STATUS.has(statusParam) ? statusParam : '';
  const sort = VALID_SORT.has(sortParam) ? sortParam : 'created';
  const dir: 'asc' | 'desc' = dirParam === 'asc' ? 'asc' : 'desc';

  // 1. Usuarios que matchean la busqueda (sin paginar todavia: filtramos y
  //    ordenamos por datos de assessment en memoria, escala admin).
  let query = adminSupabase
    .from('users')
    .select('id, email, first_name, last_name, school, created_at');

  const term = search.trim();
  if (term) {
    const esc = term.replace(/[%_,]/g, (m) => `\\${m}`);
    query = query.or(
      `email.ilike.%${esc}%,first_name.ilike.%${esc}%,last_name.ilike.%${esc}%`
    );
  }

  const { data: users, error } = await query;

  if (error) {
    return <div className="text-red-600">Error cargando usuarios: {error.message}</div>;
  }

  const userIds = (users ?? []).map((u) => u.id);

  // 2. Batch: todos los assessments de esos usuarios (1 query) + responses (1 query).
  const [{ data: allAssessments }, { data: allResponses }] = await Promise.all([
    userIds.length
      ? adminSupabase
          .from('assessments')
          .select('user_id, status, is_active, completed_at, created_at')
          .in('user_id', userIds)
          .order('created_at', { ascending: false })
      : Promise.resolve({
          data: [] as {
            user_id: number;
            status: string;
            is_active: boolean;
            completed_at: string | null;
            created_at: string;
          }[],
        }),
    userIds.length
      ? adminSupabase.from('responses').select('user_id, section_id').in('user_id', userIds)
      : Promise.resolve({ data: [] as { user_id: number; section_id: number }[] }),
  ]);

  // Latest assessment (por created_at desc), activo y ultima fecha de output por usuario.
  const latestByUser = new Map<number, { status: string }>();
  const activeByUser = new Set<number>();
  const outputDateByUser = new Map<number, string>();
  for (const a of allAssessments ?? []) {
    if (!latestByUser.has(a.user_id)) latestByUser.set(a.user_id, { status: a.status });
    if (a.is_active) activeByUser.add(a.user_id);
    if (a.status === 'completed' && a.completed_at && !outputDateByUser.has(a.user_id)) {
      outputDateByUser.set(a.user_id, a.completed_at);
    }
  }

  // Distinct responses por usuario.
  const responsesByUser = new Map<number, Set<number>>();
  for (const r of allResponses ?? []) {
    if (!responsesByUser.has(r.user_id)) responsesByUser.set(r.user_id, new Set());
    responsesByUser.get(r.user_id)!.add(r.section_id);
  }

  let enriched: UserRow[] = (users ?? []).map((user) => ({
    ...user,
    responses_count: responsesByUser.get(user.id)?.size ?? 0,
    has_active_assessment: activeByUser.has(user.id),
    profile_status: mapProfileStatus(latestByUser.get(user.id)?.status),
    output_date: outputDateByUser.get(user.id) ?? null,
  }));

  // 3. Filtro por estado del perfil.
  if (statusFilter) {
    enriched = enriched.filter((u) => u.profile_status === statusFilter);
  }

  // 4. Orden.
  const mul = dir === 'asc' ? 1 : -1;
  enriched.sort((a, b) => {
    if (sort === 'school') {
      const av = (a.school ?? '').toLowerCase();
      const bv = (b.school ?? '').toLowerCase();
      return av.localeCompare(bv) * mul;
    }
    if (sort === 'output') {
      // Nulls al final independientemente de la direccion.
      const at = a.output_date ? new Date(a.output_date).getTime() : null;
      const bt = b.output_date ? new Date(b.output_date).getTime() : null;
      if (at === null && bt === null) return 0;
      if (at === null) return 1;
      if (bt === null) return -1;
      return (at - bt) * mul;
    }
    // created
    return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * mul;
  });

  // 5. Paginacion en memoria.
  const total = enriched.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageRows = enriched.slice(start, start + PAGE_SIZE);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Usuarios</h1>
      <UsersTable
        users={pageRows}
        total={total}
        page={safePage}
        totalPages={totalPages}
        search={search}
        status={statusFilter}
        sort={sort}
        dir={dir}
      />
    </div>
  );
}
