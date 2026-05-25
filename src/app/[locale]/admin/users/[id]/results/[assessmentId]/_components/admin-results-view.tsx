'use client';

import { useRef, useState } from 'react';
import { Link } from '@/i18n/routing';
import { VocationalJourney } from '@/components/journey/vocational-journey';

interface AdminResultsViewProps {
  results: any;
  assessmentId: string;
  userId: string;
  userName: string;
}

export function AdminResultsView({ results, assessmentId, userId, userName }: AdminResultsViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  async function exportToPdf() {
    setExporting(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      if (!containerRef.current) return;
      const canvas = await html2canvas(containerRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      pdf.save(`perfil-${userName.replace(/\s+/g, '_')}-${assessmentId}.pdf`);
    } finally {
      setExporting(false);
    }
  }

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
        <button
          onClick={exportToPdf}
          disabled={exporting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {exporting ? 'Generando PDF...' : 'Export PDF'}
        </button>
      </div>

      {/* Results container captured for PDF */}
      <div ref={containerRef} className="print-container">
        <VocationalJourney results={results} />
      </div>
    </div>
  );
}
