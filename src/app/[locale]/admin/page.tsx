import { requireAdminPage } from '@/lib/admin/guard';
import UsersTable from './_components/users-table';

interface UserRow {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  responses_count: number;
  has_active_assessment: boolean;
}

const PAGE_SIZE = 20;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const { adminSupabase } = await requireAdminPage();
  const { search = '', page: pageStr = '1' } = await searchParams;

  const page = Math.max(1, Number(pageStr) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = adminSupabase
    .from('users')
    .select('id, email, first_name, last_name, created_at', { count: 'exact' });

  const term = search.trim();
  if (term) {
    const esc = term.replace(/[%_,]/g, (m) => `\\${m}`);
    query = query.or(
      `email.ilike.%${esc}%,first_name.ilike.%${esc}%,last_name.ilike.%${esc}%`
    );
  }

  const { data: users, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    return <div className="text-red-600">Error cargando usuarios: {error.message}</div>;
  }

  const enriched: UserRow[] = await Promise.all(
    (users ?? []).map(async (user) => {
      const [{ data: responsesRaw }, { data: activeAssessment }] = await Promise.all([
        adminSupabase
          .from('responses')
          .select('section_id')
          .eq('user_id', user.id),
        adminSupabase
          .from('assessments')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle(),
      ]);

      const distinct = new Set(
        (responsesRaw ?? []).map((r: { section_id: number }) => r.section_id)
      );

      return {
        ...user,
        responses_count: distinct.size,
        has_active_assessment: activeAssessment !== null,
      };
    })
  );

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Usuarios</h1>
      <UsersTable
        users={enriched}
        total={total}
        page={page}
        totalPages={totalPages}
        search={search}
      />
    </div>
  );
}
