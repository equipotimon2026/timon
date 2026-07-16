import { requireAdminPage } from '@/lib/admin/guard';
import SettingsForm from './_components/settings-form';

export default async function AdminSettingsPage() {
  const { adminSupabase } = await requireAdminPage();
  const { data } = await adminSupabase
    .from('app_settings')
    .select('key, value')
    .in('key', ['payment_price_ars', 'referral_group_size', 'referral_discount_pct']);
  const map = new Map((data ?? []).map((r) => [r.key, r.value as Record<string, number>]));
  const priceArs = map.get('payment_price_ars')?.amount ?? 0;
  const groupSize = map.get('referral_group_size')?.value ?? 4;
  const discountPct = map.get('referral_discount_pct')?.value ?? 25;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Configuración</h1>
      <SettingsForm
        initialPriceArs={priceArs}
        initialGroupSize={groupSize}
        initialDiscountPct={discountPct}
      />
    </div>
  );
}
