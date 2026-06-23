// section_id (Supabase) -> label legible. Mismo criterio que el "Progreso" del
// detalle de usuario. Usado por la vista "User input".
export const SECTION_LABELS: Record<number, string> = {
  2: 'Personalidad (MIPS/Millon)',
  3: 'Intereses (RIASEC)',
  4: 'Dominancia Cerebral (Herrmann)',
  5: 'Inteligencias Múltiples (Gardner)',
  6: 'Técnicas Proyectivas',
  7: 'Autodescubrimiento',
  9: 'Estilo de Vida',
  10: 'Visión Futuro',
  11: 'Árbol Genealógico',
  12: 'Universidad',
  13: 'Identificación de Perfil',
  14: 'Vos y el Colegio',
  15: 'Perspectiva Familiar',
};

export function sectionLabel(sectionId: number): string {
  return SECTION_LABELS[sectionId] ?? `Sección ${sectionId}`;
}
