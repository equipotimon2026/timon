'use client';

import { Link } from '@/i18n/routing';
import { VocationalJourney } from '@/components/journey/vocational-journey';

interface AdminResultsViewProps {
  results: any;
  assessmentId: string;
  userId: string;
  userName: string;
}

// Nota: el botón "Export PDF" se quitó por ahora. La generación vía html2canvas +
// jspdf chocaba con los colores CSS Color 4 (oklch/lab) de Tailwind v4 (incl. en
// pseudo-elementos, que no se pueden normalizar inline). Si se reintroduce, la vía
// limpia es html2canvas-pro (soporte oklch/lab nativo) o window.print() con print CSS.
export function AdminResultsView({ results, userId }: AdminResultsViewProps) {
  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <Link
          href={`/admin/users/${userId}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Volver al usuario
        </Link>
      </div>

      <VocationalJourney results={results} />
    </div>
  );
}
