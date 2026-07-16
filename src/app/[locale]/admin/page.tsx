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
  // Assessment "output" (ultimo completado) para liberar desde la tabla.
  output_assessment_id: string | null;
  released: boolean;
  payment_exempt: boolean;
  payment_status: 'exempt' | 'paid' | 'paid_discount' | 'unpaid';
}

const PAGE_SIZE = 20;
const VALID_STATUS = new Set(['completed', 'processing', 'error', 'none', 'pending_release']);
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
    .select('id, email, first_name, last_name, school, created_at, payment_exempt');

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

  // 2. Batch: todos los assessments + responses de esos usuarios.
  //    OJO: PostgREST limita cada respuesta a 1000 filas. `responses` tiene
  //    miles de filas, asi que paginamos con .range() hasta traerlas todas;
  //    si no, la mayoria de usuarios mostraban 0/13.
  async function fetchAllResponses(): Promise<{ user_id: number; section_id: number }[]> {
    if (!userIds.length) return [];
    const PAGE = 1000;
    const out: { user_id: number; section_id: number }[] = [];
    for (let offset = 0; ; offset += PAGE) {
      const { data } = await adminSupabase
        .from('responses')
        .select('user_id, section_id')
        .in('user_id', userIds)
        .order('user_id', { ascending: true })
        .range(offset, offset + PAGE - 1);
      const batch = data ?? [];
      out.push(...batch);
      if (batch.length < PAGE) break;
    }
    return out;
  }

  async function fetchAllPaidPayments(): Promise<{ user_id: number; discount_pct: number }[]> {
    if (!userIds.length) return [];
    const PAGE = 1000;
    const out: { user_id: number; discount_pct: number }[] = [];
    for (let offset = 0; ; offset += PAGE) {
      const { data } = await adminSupabase
        .from('payments')
        .select('user_id, discount_pct')
        .in('user_id', userIds)
        .in('status', ['SUCCESS', 'OVERPAID'])
        .order('user_id', { ascending: true })
        .range(offset, offset + PAGE - 1);
      const batch = data ?? [];
      out.push(...batch);
      if (batch.length < PAGE) break;
    }
    return out;
  }

  const [{ data: allAssessments }, allResponses, paidPayments] = await Promise.all([
    userIds.length
      ? adminSupabase
          .from('assessments')
          .select('id, user_id, status, is_active, completed_at, created_at, released_at')
          .in('user_id', userIds)
          .order('created_at', { ascending: false })
      : Promise.resolve({
          data: [] as {
            id: string;
            user_id: number;
            status: string;
            is_active: boolean;
            completed_at: string | null;
            created_at: string;
            released_at: string | null;
          }[],
        }),
    fetchAllResponses(),
    fetchAllPaidPayments(),
  ]);

  // Latest assessment (por created_at desc), activo y ultima fecha de output por usuario.
  const latestByUser = new Map<number, { status: string }>();
  const activeByUser = new Set<number>();
  const outputByUser = new Map<
    number,
    { id: string; completed_at: string | null; released: boolean }
  >();
  for (const a of allAssessments ?? []) {
    if (!latestByUser.has(a.user_id)) latestByUser.set(a.user_id, { status: a.status });
    if (a.is_active) activeByUser.add(a.user_id);
    // Primer completado en orden desc = ultimo completado (el "output" del usuario).
    if (a.status === 'completed' && !outputByUser.has(a.user_id)) {
      outputByUser.set(a.user_id, {
        id: a.id,
        completed_at: a.completed_at,
        released: !!a.released_at,
      });
    }
  }

  // Distinct responses por usuario.
  const responsesByUser = new Map<number, Set<number>>();
  for (const r of allResponses ?? []) {
    if (!responsesByUser.has(r.user_id)) responsesByUser.set(r.user_id, new Set());
    responsesByUser.get(r.user_id)!.add(r.section_id);
  }

  // Pagos exitosos por usuario (primero encontrado alcanza para saber si pago con/sin descuento).
  const paidByUser = new Map<number, { discount_pct: number }>();
  for (const p of paidPayments) {
    if (!paidByUser.has(p.user_id)) paidByUser.set(p.user_id, { discount_pct: Number(p.discount_pct) });
  }

  let enriched: UserRow[] = (users ?? []).map((user) => {
    const output = outputByUser.get(user.id);
    const paid = paidByUser.get(user.id);
    return {
      ...user,
      responses_count: responsesByUser.get(user.id)?.size ?? 0,
      has_active_assessment: activeByUser.has(user.id),
      profile_status: mapProfileStatus(latestByUser.get(user.id)?.status),
      output_date: output?.completed_at ?? null,
      output_assessment_id: output?.id ?? null,
      released: output?.released ?? false,
      payment_exempt: user.payment_exempt,
      payment_status: user.payment_exempt
        ? 'exempt'
        : paid
          ? (paid.discount_pct > 0 ? 'paid_discount' : 'paid')
          : 'unpaid',
    };
  });

  // 3. Filtro por estado del perfil.
  if (statusFilter === 'pending_release') {
    // Completados con output pero sin liberar.
    enriched = enriched.filter((u) => u.output_assessment_id && !u.released);
  } else if (statusFilter) {
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
