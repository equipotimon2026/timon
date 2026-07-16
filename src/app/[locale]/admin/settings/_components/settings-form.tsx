'use client';

import { useState } from 'react';

interface SettingsFormProps {
  initialPriceArs: number;
  initialGroupSize: number;
  initialDiscountPct: number;
}

export default function SettingsForm({
  initialPriceArs,
  initialGroupSize,
  initialDiscountPct,
}: SettingsFormProps) {
  const [priceArs, setPriceArs] = useState(String(initialPriceArs));
  const [groupSize, setGroupSize] = useState(String(initialGroupSize));
  const [discountPct, setDiscountPct] = useState(String(initialDiscountPct));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMsg(null);
    const res = await fetch('/api/admin/settings/payments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceArs: Number(priceArs),
        groupSize: Number(groupSize),
        discountPct: Number(discountPct),
      }),
    });
    if (res.ok) {
      setMsg('Guardado ✓');
    } else {
      const body = await res.json().catch(() => ({}));
      setMsg(body.error || 'Error al guardar');
    }
    setSaving(false);
  }

  return (
    <div className="max-w-sm rounded-xl border bg-white p-6">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Precio del desbloqueo (ARS)</label>
        <p className="text-xs text-gray-500 mb-2">
          Precio de lista. El descuento grupal se aplica sobre este monto.
        </p>
        <input
          type="number"
          min={1}
          value={priceArs}
          onChange={(e) => setPriceArs(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Personas para armar grupo</label>
        <p className="text-xs text-gray-500 mb-2">
          Cantidad de personas (dueño + referidos) para activar el descuento grupal.
        </p>
        <input
          type="number"
          min={2}
          value={groupSize}
          onChange={(e) => setGroupSize(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">% descuento</label>
        <p className="text-xs text-gray-500 mb-2">
          Porcentaje de descuento para los miembros del grupo que aún no pagaron.
        </p>
        <input
          type="number"
          min={1}
          max={99}
          value={discountPct}
          onChange={(e) => setDiscountPct(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
      </div>

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
