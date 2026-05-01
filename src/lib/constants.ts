export const SECTION_IDS = {
  BRAVITO: 1,
  MILLON: 2,
  RIASEC: 3,
  HERRMANN: 4,
  GARDNER: 5,
  PROYECTIVA: 6,
  AUTODESC: 7,
  APRENDIZAJE: 8,
  LIFESTYLE: 9,
  FUTURO: 10,
  FAMILIA: 11,
  UNIVERSIDAD: 12,
  VIBECHECK: 13,
  VOSCOLEGIO: 14,
  PADRES: 15,
  PROFESIONALES: 16,
} as const;

export type SectionCode = keyof typeof SECTION_IDS;
export type SectionId = (typeof SECTION_IDS)[SectionCode];

export interface AssessmentMeta {
  id: number;
  sectionId: SectionId;
  title: string;
  subtitle: string;
  description: string;
  category: 'personality' | 'interests' | 'cognitive' | 'projective' | 'context';
}

export const ASSESSMENTS: AssessmentMeta[] = [
  {
    id: 1,
    sectionId: SECTION_IDS.MILLON,
    title: 'Personalidad',
    subtitle: 'Test MIPS',
    description:
      'Evalua tu perfil de personalidad a traves del Inventario Millon de Estilos de Personalidad.',
    category: 'personality',
  },
  {
    id: 2,
    sectionId: SECTION_IDS.RIASEC,
    title: 'Intereses Vocacionales',
    subtitle: 'Test RIASEC',
    description:
      'Descubre tus intereses vocacionales segun el modelo de Holland (Realista, Investigador, Artistico, Social, Emprendedor, Convencional).',
    category: 'interests',
  },
  {
    id: 3,
    sectionId: SECTION_IDS.HERRMANN,
    title: 'Dominancia Cerebral',
    subtitle: 'Test Herrmann',
    description:
      'Identifica tu estilo de pensamiento dominante segun los cuatro cuadrantes cerebrales de Herrmann.',
    category: 'cognitive',
  },
  {
    id: 4,
    sectionId: SECTION_IDS.GARDNER,
    title: 'Inteligencias Multiples',
    subtitle: 'Test Gardner',
    description:
      'Explora tus inteligencias multiples segun la teoria de Howard Gardner.',
    category: 'cognitive',
  },
  {
    id: 5,
    sectionId: SECTION_IDS.PROYECTIVA,
    title: 'Preguntas Proyectivas',
    subtitle: 'Exploracion Personal',
    description:
      'Responde preguntas abiertas que revelan aspectos profundos de tu personalidad y motivaciones.',
    category: 'projective',
  },
  {
    id: 6,
    sectionId: SECTION_IDS.AUTODESC,
    title: 'Auto-descubrimiento de Talentos',
    subtitle: 'Talentos y Fortalezas',
    description:
      'Identifica tus talentos naturales y fortalezas a traves de un ejercicio de auto-reflexion.',
    category: 'projective',
  },
  {
    id: 7,
    sectionId: SECTION_IDS.APRENDIZAJE,
    title: 'Estilo de Aprendizaje',
    subtitle: 'Test VAK',
    description:
      'Determina si tu estilo de aprendizaje predominante es Visual, Auditivo o Kinestesico.',
    category: 'cognitive',
  },
  {
    id: 8,
    sectionId: SECTION_IDS.LIFESTYLE,
    title: 'Estilo de Vida y Valores',
    subtitle: 'Valores Personales',
    description:
      'Explora tus valores personales y como influyen en tus decisiones de vida y carrera.',
    category: 'context',
  },
  {
    id: 9,
    sectionId: SECTION_IDS.FUTURO,
    title: 'Proyeccion de Futuro',
    subtitle: 'Vision a Futuro',
    description:
      'Reflexiona sobre tus metas, aspiraciones y como te imaginas en el futuro.',
    category: 'context',
  },
  {
    id: 10,
    sectionId: SECTION_IDS.FAMILIA,
    title: 'Contexto Familiar',
    subtitle: 'Entorno Familiar',
    description:
      'Comparte informacion sobre tu contexto familiar y como influye en tu orientacion vocacional.',
    category: 'context',
  },
];
