/**
 * Seed script for NEW sections added from timon-push-main (V0 prototype).
 *
 * Prerequisites:
 * 1. The `questions` table must already exist (see seed-questions.mjs for DDL)
 * 2. Run the following SQL to add the new sections:
 *
 * INSERT INTO sections (id, code, name, order_index) VALUES
 *   (13, 'VIBECHECK',     '¿Con quién te sentís identificado?', 1),
 *   (14, 'VOSCOLEGIO',    'Vos y el colegio',                   2),
 *   (15, 'PADRES',        'Perspectiva Familiar',               4),
 *   (16, 'PROFESIONALES', 'Hablemos con Profesionales',        12)
 * ON CONFLICT (id) DO NOTHING;
 *
 * Then run: node seed-new-sections.mjs
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://zxiecdsuflvdabaxmsgh.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// ── New Section IDs ──
const SECTION = {
  VIBECHECK: 13,
  VOSCOLEGIO: 14,
  PADRES: 15,
  PROFESIONALES: 16,
};

// ────────────────────────────────────────────────────────────────────────────
// VIBECHECK (section_id=13) — Persona selection + follow-up
// ────────────────────────────────────────────────────────────────────────────
const vibecheckPersonas = [
  {
    id: 'desorientado', name: 'Julián Cortés', label: 'El Desorientado', emoji: '🧭',
    summary: 'No sabe qué quiere ni por dónde arrancar.',
    followUp: '¿Cuál dirías que es tu mayor miedo hoy a la hora de pensar en el futuro, o qué es lo primero que necesitás que te ayuden a destrabar?',
  },
  {
    id: 'multipotencial', name: 'Sofía Herrera', label: 'La Multipotencial', emoji: '⚡',
    summary: 'Le va bien en todo y no puede elegir uno.',
    followUp: '¿Cuáles son esos dos o tres intereses o hobbies tuyos que parecen no tener nada que ver entre sí, pero que en el fondo te encantaría combinar?',
  },
  {
    id: 'detallista', name: 'Martín Navarro', label: 'El Detallista', emoji: '🔍',
    summary: 'Ya filtró el área pero no puede desempatar opciones.',
    followUp: '¿Cuáles son exactamente esas dos o tres carreras que tenés en mente y que hoy necesitás desempatar con urgencia?',
  },
  {
    id: 'desconectada', name: 'Valentina Rojas', label: 'La Desconectada', emoji: '💻',
    summary: 'Sus talentos reales no encajan en el sistema educativo.',
    followUp: '¿Cuál es esa habilidad, tema o proyecto fuera del colegio en el que sabés que le ponés garra y te gustaría descubrir si tiene salida en el mundo real?',
  },
  {
    id: 'convencido', name: 'Lucas Benítez', label: 'El Convencido', emoji: '🎯',
    summary: 'Ya lo tiene decidido y solo busca confirmación externa.',
    followUp: '¿Cuál es esa carrera que ya elegiste y qué duda puntual necesitás que te respondan hoy para irte 100% tranquilo?',
  },
  {
    id: 'confirmada', name: 'Camila Silva', label: 'La Confirmada', emoji: '🚀',
    summary: 'Sabe qué quiere, ahora optimiza el cómo y el dónde.',
    followUp: '¿Qué carrera elegiste y qué dato duro necesitás comparar ahora mismo —universidades, especializaciones o proyección— para armar tu plan?',
  },
  {
    id: 'tiburon', name: 'Tomás Quiroga', label: 'El Tiburón', emoji: '📈',
    summary: 'Ve la carrera como inversión pura, solo le importa la rentabilidad.',
    followUp: '¿Tenés algún rubro en la mira, o querés ver directamente cuáles son las áreas con mejores sueldos y proyección hoy en día?',
  },
];

const vibecheckRows = [
  {
    section_id: SECTION.VIBECHECK,
    question_number: 1,
    question_text: '¿Con quién te sentís identificado/a?',
    response_type: 'text', // stores persona ID
    options: vibecheckPersonas,
    metadata: { type: 'persona-selection' },
  },
  // Follow-up questions (one per persona, question_number 2-8)
  ...vibecheckPersonas.map((p, i) => ({
    section_id: SECTION.VIBECHECK,
    question_number: i + 2,
    question_text: p.followUp,
    response_type: 'text',
    options: null,
    metadata: { type: 'textarea', minLength: 50, conditionalOn: { question: 1, answer: p.id } },
  })),
];

// ────────────────────────────────────────────────────────────────────────────
// VOS Y EL COLEGIO (section_id=14)
// ────────────────────────────────────────────────────────────────────────────
const subjects = [
  'Matemática', 'Lengua y Literatura', 'Historia', 'Geografía', 'Biología',
  'Física', 'Química', 'Inglés', 'Educación Física', 'Formación Ética y Ciudadana',
  'Filosofía', 'Economía / Economía Política', 'Contabilidad / Administración',
  'Informática / Tecnología', 'Arte / Educación Artística', 'Música',
  'Construcción de Ciudadanía / Sociales',
];

const voscolegioRows = [
  {
    section_id: SECTION.VOSCOLEGIO,
    question_number: 1,
    question_text: "Del 1 al 10, ¿qué tan quemado/a te tiene la típica pregunta de '¿y vos qué vas a estudiar/hacer de tu vida?' en las reuniones familiares?",
    response_type: 'integer',
    options: null,
    metadata: { type: 'slider', min: 1, max: 10, minLabel: '1 · Me chupa un huevo', maxLabel: '10 · Me quiero ir del país' },
  },
  {
    section_id: SECTION.VOSCOLEGIO,
    question_number: 2,
    question_text: 'Cuando abrís YouTube, TikTok o Instagram y te perdés mirando algo por horas sin darte cuenta del tiempo... ¿de qué trata ese contenido?',
    response_type: 'text',
    options: null,
    metadata: {
      type: 'textarea',
      minLength: 3,
      hint: "Pueden ser varios temas. Sé específico/a — no 'entretenimiento' sino qué tipo.",
      placeholder: 'Ej: tutoriales de diseño 3D, partidas de League of Legends, videos de cocina rara, true crime...',
    },
  },
  // Materias: each subject is a question (3-20)
  ...subjects.map((subject, i) => ({
    section_id: SECTION.VOSCOLEGIO,
    question_number: i + 3,
    question_text: subject,
    response_type: 'text',
    options: [
      { value: 'megusta', label: 'Me gusta', color: '#85B882' },
      { value: 'indiferente', label: 'Indiferente', color: '#B2ADA6' },
      { value: 'nomegusta', label: 'No me gusta', color: '#E07070' },
    ],
    metadata: { type: 'subject-rating', minRequired: 10 },
  })),
];

// ────────────────────────────────────────────────────────────────────────────
// PADRES (section_id=15) — Perspectiva Familiar
// ────────────────────────────────────────────────────────────────────────────
const padresQuestions = [
  { q: '¿Cuál es tu nombre y apellido, tu edad y tu ocupación actual?', type: 'text', min: 5 },
  { q: '¿Te sentís satisfecho/a con tu ocupación actual?', type: 'text', min: 50 },
  {
    q: '¿Comenzaste y abandonaste alguna carrera en algún momento?',
    type: 'options',
    opts: ['Sí', 'No'],
    branches: {
      'Sí': '¿Cuál fue esa carrera y qué pasó? Contanos un poco más.',
      'No': '¿Te hubiese gustado realizar otra actividad o estudiar otra carrera? ¿Cuál? ¿Recordás por qué no lo hiciste?',
    },
  },
  { q: '¿Cuáles son las profesiones y ocupaciones que más valorás hoy en día?', type: 'text', min: 50 },
  { q: '¿Creés que hay carreras con mayor salida laboral actualmente? ¿Cuáles sí y cuáles menos?', type: 'text', min: 50 },
  { q: '¿Hay alguna ocupación o profesión particular que te gustaría ver en [estudiante]? ¿Cuál y por qué?', type: 'text', min: 50 },
  { q: '¿Qué habilidades o cualidades destacarías en [estudiante]? ¿Qué aspectos crees que debería trabajar en lo personal?', type: 'text', min: 50 },
  { q: '¿Cómo ves la posibilidad de que [estudiante] empiece a trabajar en lugar de estudiar?', type: 'text', min: 50 },
  { q: 'Para terminar, ¿hay algo más que quieras agregar? Cualquier comentario que sientas que puede ser útil.', type: 'text', min: 50 },
];

const padresRows = padresQuestions.map((item, i) => ({
  section_id: SECTION.PADRES,
  question_number: i + 1,
  question_text: item.q,
  response_type: item.type === 'options' ? 'text' : 'text',
  options: item.opts ?? null,
  metadata: {
    type: item.type,
    minLength: item.min ?? null,
    ...(item.branches ? { branches: item.branches } : {}),
    section: i < 5 ? 'sobre_vos' : 'sobre_estudiante',
  },
}));

// ────────────────────────────────────────────────────────────────────────────
// PROFESIONALES (section_id=16) — Chat with professionals
// ────────────────────────────────────────────────────────────────────────────
const professionals = [
  {
    id: 'negocios', name: 'Lucía Ferreyra', role: 'Emprendedora · Consultora de negocios',
    emoji: '💼', color: '#C87828', area: 'Administración y Negocios',
    chips: [
      ['Trabajar con números', 'Liderar', 'Supervisar', 'Tareas de oficina'],
      ['Iniciar proyecto propio', 'Asumir riesgos', 'Detectar oportunidades', 'Convencer a otros'],
      ['Manejar contabilidad', 'Llevar cuentas', 'Planificar ganancias', 'Diseñar inversiones'],
    ],
    closedQ: { text: '¿Alguna vez te imaginaste teniendo tu propio negocio o proyecto?', options: ['Sí, es algo que me llama mucho', 'Lo pensé pero no sé por dónde empezar', 'No es lo que me imagino haciendo'] },
    openQ: '¿Hay algún aspecto del mundo de los negocios que siempre te generó curiosidad?',
  },
  {
    id: 'sociales', name: 'Mateo Vargas', role: 'Sociólogo · Especialista en RRHH',
    emoji: '🤝', color: '#248850', area: 'Sociales y RRHH',
    chips: [
      ['Ayudar a otros', 'Aconsejar', 'Contención emocional', 'Trabajo en equipo'],
      ['Percibir necesidades', 'Tareas solidarias', 'Actividades con niños/ancianos', 'Incentivar relaciones'],
      ['Leer sobre problemas sociales', 'Interés en conducta humana'],
    ],
    closedQ: { text: '¿Qué es lo que más te moviliza cuando se trata de trabajar con personas?', options: ['Ayudar a resolver problemas concretos', 'Generar conexión y vínculo genuino', 'Entender por qué la gente hace lo que hace'] },
    openQ: '¿Hay algún grupo social, problemática o comunidad que te quite el sueño?',
  },
  {
    id: 'humanidades', name: 'Valentina Ros', role: 'Psicóloga · Educadora',
    emoji: '📚', color: '#7B3FA0', area: 'Humanidades y Educación',
    chips: [
      ['Enseñar/Entrenar', 'Hablar en público', 'Facilitar comunicación', 'Planear recreación'],
      ['Idiomas', 'Escribir', 'Leer', 'Talleres literarios/culturales'],
      ['Interés educativo', 'Reflexión filosófica', 'Retiros espirituales'],
    ],
    closedQ: { text: '¿Qué rol te imaginás más naturalmente en el futuro?', options: ['Guiar o enseñar a otros', 'Explorar ideas y generar contenido', 'Acompañar procesos internos de las personas'] },
    openQ: '¿Hay algún campo de las humanidades o la psicología que siempre te generó curiosidad?',
  },
  {
    id: 'salud', name: 'Diego Moreira', role: 'Médico clínico',
    emoji: '🩺', color: '#2E78C8', area: 'Salud',
    chips: [
      ['Anatomía/Fisiología', 'Investigación en salud', 'Leer sobre medicina', 'Nutrición'],
      ['Ayudar enfermos', 'Voluntariado hospitalario', 'Prevención'],
      ['Emergencias', 'Primeros auxilios'],
    ],
    closedQ: { text: '¿Qué aspecto del mundo de la salud te genera más vocación?', options: ['El contacto directo con pacientes', 'La investigación y el conocimiento científico', 'La prevención y la salud pública'] },
    openQ: '¿Hay algo del mundo de la salud que siempre te llamó la atención, aunque todavía no lo hayas explorado mucho?',
  },
  {
    id: 'juridicas', name: 'Camila Bravo', role: 'Abogada · Asesora en política pública',
    emoji: '⚖️', color: '#C02828', area: 'Jurídicas y Política',
    chips: [
      ['Defender causas justas', 'Defender derechos', 'Juzgar con objetividad', 'Conciliar disputas'],
      ['Política', 'Relaciones internacionales', 'Seguridad de los demás', 'Defensa del territorio'],
      ['Noticias delictivas', 'Prevención del delito'],
    ],
    closedQ: { text: '¿Desde qué lugar te imaginás haciendo una diferencia?', options: ['Desde la ley y los derechos', 'Desde la política y las instituciones', 'Desde la seguridad y la protección'] },
    openQ: '¿Hay alguna causa, injusticia o problemática que especialmente te movilice?',
  },
  {
    id: 'ecologia', name: 'Tomás Alvarado', role: 'Biólogo · Conservacionista',
    emoji: '🌿', color: '#3D7A52', area: 'Ecología y Naturaleza',
    chips: [
      ['Medio ambiente', 'Biología/Ecología', 'Vida marina', 'Preservación de especies'],
      ['Alimentación humana', 'Actividad agrícola/ganadera', 'Crianza de animales', 'Reservas animales'],
      ['Cocina', 'Genética', 'Geografía'],
    ],
    closedQ: { text: '¿Qué es lo que más te conecta con el mundo natural?', options: ['La complejidad de los ecosistemas', 'Los animales y su comportamiento', 'El impacto humano y cómo reducirlo'] },
    openQ: '¿Hay algún ecosistema, especie o problema ambiental que te apasione especialmente?',
  },
  {
    id: 'exactas', name: 'Sofía Méndez', role: 'Ingeniera en Sistemas',
    emoji: '⚙️', color: '#5040B0', area: 'Exactas e Ingeniería',
    chips: [
      ['Relacionar teorías', 'Lógica', 'Cálculos complejos', 'Fórmulas matemáticas/químicas'],
      ['Informática', 'Programar software', 'Organizar objetos/datos', 'Leer revistas científicas'],
      ['Manipular herramientas', 'Experimentos', 'Reparaciones'],
    ],
    closedQ: { text: '¿Cómo sos cuando te encontrás con un problema difícil?', options: ['Me meto de lleno hasta resolverlo', 'Lo analizo primero, después actúo', 'Prefiero colaborar con alguien más'] },
    openQ: '¿Hay algún problema técnico, científico o tecnológico que te parezca especialmente fascinante?',
  },
  {
    id: 'comunicacion', name: 'Nicolás Paredes', role: 'Periodista · Comunicador',
    emoji: '📡', color: '#D4680A', area: 'Comunicación y Medios',
    chips: [
      ['Relatar', 'Periodismo', 'Entrevistar', 'Transmitir comunicación'],
      ['Promocionar', 'Indagar culturas/historia', 'Crítica de espectáculos', 'Organizar eventos'],
      ['Planificar viajes/eventos', 'Luces y sonido', 'Operar sistemas electrónicos'],
    ],
    closedQ: { text: '¿Qué forma de contar historias te llama más?', options: ['En texto — artículos, crónicas, reportajes', 'En audio o video — podcast, radio, televisión', 'En redes — contenido digital, social media'] },
    openQ: '¿Hay algún medio, formato o historia que te haya impactado y que siempre recordás?',
  },
  {
    id: 'arte', name: 'Ana Suárez', role: 'Diseñadora · Artista visual',
    emoji: '🎨', color: '#C83070', area: 'Arte y Diseño',
    chips: [
      ['Dibujar/Pintar', 'Fotografía', 'Diseño de objetos/imágenes', 'Decorar'],
      ['Teatro', 'Danza', 'Tocar instrumento', 'Leer partituras'],
      ['Historia del arte', 'Manualidades/Escultura', 'Confección de ropa', 'Maquetas', 'Diseño web'],
    ],
    closedQ: { text: '¿Cómo definirías tu relación con el arte y la expresión?', options: ['Es una parte central de quién soy', 'Me atrae pero no lo practiqué mucho', 'Me gusta apreciarlo más que crearlo'] },
    openQ: '¿Hay alguna forma artística que siempre quisiste explorar pero nunca te animaste o tuviste la oportunidad?',
  },
];

// Each professional generates 3 questions: chips (array), closed (text), open (text)
const profesionalesRows = professionals.flatMap((prof, pi) => {
  const base = pi * 3;
  return [
    {
      section_id: SECTION.PROFESIONALES,
      question_number: base + 1,
      question_text: `[${prof.area}] ¿Con cuáles de estas actividades te identificás?`,
      response_type: 'array',
      options: prof.chips.flat(),
      metadata: { type: 'multi-chip', professional: prof.id, name: prof.name, role: prof.role, emoji: prof.emoji, color: prof.color, area: prof.area },
    },
    {
      section_id: SECTION.PROFESIONALES,
      question_number: base + 2,
      question_text: prof.closedQ.text,
      response_type: 'text',
      options: prof.closedQ.options,
      metadata: { type: 'single-option', professional: prof.id },
    },
    {
      section_id: SECTION.PROFESIONALES,
      question_number: base + 3,
      question_text: prof.openQ,
      response_type: 'text',
      options: null,
      metadata: { type: 'textarea', professional: prof.id, minLength: 3 },
    },
  ];
});

// ────────────────────────────────────────────────────────────────────────────
// Upsert helper
// ────────────────────────────────────────────────────────────────────────────
async function upsertBatch(sectionName, rows) {
  if (!rows.length) {
    console.log(`  [${sectionName}] No rows.`);
    return 0;
  }

  const CHUNK = 100;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await supabase
      .from('questions')
      .upsert(chunk, { onConflict: 'section_id,question_number' });

    if (error) {
      console.error(`  [${sectionName}] Error chunk ${Math.floor(i / CHUNK) + 1}:`, error.message);
    } else {
      inserted += chunk.length;
    }
  }

  console.log(`  [${sectionName}] Upserted ${inserted} questions.`);
  return inserted;
}

// ────────────────────────────────────────────────────────────────────────────
// Seed sections table
// ────────────────────────────────────────────────────────────────────────────
async function seedSections() {
  const newSections = [
    { id: 13, code: 'VIBECHECK', name: '¿Con quién te sentís identificado?', order_index: 1 },
    { id: 14, code: 'VOSCOLEGIO', name: 'Vos y el colegio', order_index: 2 },
    { id: 15, code: 'PADRES', name: 'Perspectiva Familiar', order_index: 4 },
    { id: 16, code: 'PROFESIONALES', name: 'Hablemos con Profesionales', order_index: 12 },
  ];

  const { error } = await supabase
    .from('sections')
    .upsert(newSections, { onConflict: 'id' });

  if (error) {
    console.error('Error seeding sections:', error.message);
  } else {
    console.log(`  Seeded ${newSections.length} new sections.`);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// MAIN
// ────────────────────────────────────────────────────────────────────────────
async function main() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Set SUPABASE_SERVICE_ROLE_KEY env var before running.');
    process.exit(1);
  }

  console.log('Seeding new sections & questions...\n');

  await seedSections();

  let total = 0;
  total += await upsertBatch('VIBECHECK (section_id=13)', vibecheckRows);
  total += await upsertBatch('VOSCOLEGIO (section_id=14)', voscolegioRows);
  total += await upsertBatch('PADRES (section_id=15)', padresRows);
  total += await upsertBatch('PROFESIONALES (section_id=16)', profesionalesRows);

  console.log(`\nDone! Total new questions upserted: ${total}`);
}

main().catch(console.error);
