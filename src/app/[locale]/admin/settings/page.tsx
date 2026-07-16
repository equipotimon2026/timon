import { requireAdminPage } from '@/lib/admin/guard';
import PriceForm from './_components/price-form';

export default async function AdminSettingsPage() {
  const { adminSupabase } = await requireAdminPage();
  const { data } = await adminSupabase
    .from('app_settings')
    .select('value')
    .eq('key', 'payment_price_ars')
    .single();
  const amount = (data?.value as { amount?: number })?.amount ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Configuración</h1>
      <PriceForm initialAmount={amount} />
    </div>
  );
}
