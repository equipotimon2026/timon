import { requireAdminPage } from '@/lib/admin/guard';
import { Link } from '@/i18n/routing';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-6 print:hidden">
        <span className="font-semibold text-gray-900">Admin</span>
        <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900">
          Usuarios
        </Link>
        <Link href="/admin/settings" className="text-sm text-gray-600 hover:text-gray-900">
          Configuración
        </Link>
      </nav>
      <main className="px-6 py-8 print:p-0">{children}</main>
    </div>
  );
}
