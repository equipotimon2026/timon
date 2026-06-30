'use client';

import { Link } from '@/i18n/routing';
import { VocationalJourney } from '@/components/journey/vocational-journey';

interface AdminResultsViewProps {
  results: any;
  assessmentId: string;
  userId: string;
  userName: string;
}

// PDF vía window.print() sobre la versión `printMode` (plana, expandida) del MISMO
// componente VocationalJourney. El browser imprime texto VECTORIAL (nítido,
// seleccionable), pagina nativo con break-inside:avoid (sin cortar cards por el
// medio) y soporta oklch nativo. No usamos html2canvas (rasterizado = borroso +
// cortes a ciegas). El usuario elige "Guardar como PDF" en el diálogo de impresión.
export function AdminResultsView({ results, userId }: AdminResultsViewProps) {
  return (
    <div>
      {/* Chrome de admin + preview interactivo (igual al output del usuario). Se
          oculta al imprimir. */}
      <div className="admin-screen-only">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <Link
            href={`/admin/users/${userId}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            &larr; Volver al usuario
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted"
          >
            Export PDF
          </button>
        </div>

        <VocationalJourney results={results} />
      </div>

      {/* Versión plana para imprimir: oculta en pantalla, es el ÚNICO contenido al
          imprimir. Mismo componente, printMode (todo expandido, sin nav/tabs). */}
      <div className="admin-print-only">
        <VocationalJourney results={results} printMode />
      </div>

      <style>{`
        /* En pantalla, la versión print no se muestra. */
        @media screen {
          .admin-print-only { display: none; }
        }
        @media print {
          /* Solo imprime el reporte plano. */
          .admin-screen-only { display: none !important; }
          .admin-print-only { display: block !important; }

          /* Neutraliza reveals: en print las animaciones no corren, así que los
             opacity-0 iniciales quedarían invisibles. Forzamos visible. NO tocamos
             transform (el gráfico de constelación posiciona sus nodos con transforms). */
          .admin-print-only *,
          .admin-print-only *::before,
          .admin-print-only *::after {
            opacity: 1 !important;
            animation: none !important;
            transition: none !important;
          }

          /* Menos whitespace: las secciones están pensadas full-screen (py grande
             + min-height). En print las compactamos para no inflar páginas. */
          .admin-print-only section {
            min-height: 0 !important;
            padding-top: 1.25rem !important;
            padding-bottom: 1.25rem !important;
          }

          /* Cortes limpios: no partir cards/secciones chicas por el medio. */
          .admin-print-only [class*="rounded-"],
          .admin-print-only [class*="card"],
          .admin-print-only li,
          .admin-print-only figure,
          .admin-print-only svg {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          @page { margin: 12mm; }
        }
      `}</style>
    </div>
  );
}
