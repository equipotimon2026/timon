'use client';

import { useState } from 'react';

export default function PriceForm({ initialAmount }: { initialAmount: number }) {
  const [amount, setAmount] = useState(String(initialAmount));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMsg(null);
    const res = await fetch('/api/admin/settings/payment-price', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(amount) }),
    });
    setMsg(res.ok ? 'Guardado ✓' : 'Error al guardar');
    setSaving(false);
  }

  return (
    <div className="max-w-sm rounded-xl border bg-white p-6">
      <label className="block text-sm font-medium mb-1">Precio del desbloqueo (ARS)</label>
      <p className="text-xs text-gray-500 mb-3">
        Precio de lista. El descuento grupal (25% con 4+ amigos) se aplica sobre este monto.
      </p>
      <input
        type="number"
        min={1}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 text-sm mb-3"
      />
      <button
        onClick={save}
        disabled={saving}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? 'Guardando…' : 'Guardar'}
      </button>
      {msg && <span className="ml-3 text-sm text-gray-600">{msg}</span>}
    </div>
  );
}
