export type CareerCount = '1' | '2-3' | 'many' | '0';

export type UserPersona =
  | 'buscador'
  | 'multipotencial'
  | 'analitico'
  | 'practico'
  | 'determinado'
  | 'enfocado'
  | 'estratega'
  | 'reinventado';

export interface PersonaProfile {
  id: UserPersona;
  title: string;
  perfil: string;
  busca: string;
  expectativa: string;
  estrategia: string;
}

export const personaProfiles: Record<UserPersona, PersonaProfile> = {
  buscador: {
    id: 'buscador',
    title: 'El Buscador',
    perfil:
      'Se encuentra en un momento donde la brujula interna aun no marca un norte fijo. Tiene mayor claridad sobre lo que no quiere que sobre sus virtudes, buscando transformar la incertidumbre en un plan de accion concreto.',
    busca: 'Un punto de partida solido y una validacion externa que ordene el ruido mental.',
    expectativa:
      'Caminos acotados (calidad sobre cantidad) y referencias de personas con las que pueda identificarse para sentir que es posible avanzar.',
    estrategia: 'Simplificar el panorama y visibilizar capacidades que hoy pasa por alto.',
  },
  multipotencial: {
    id: 'multipotencial',
    title: 'El Multipotencial',
    perfil:
      'Siente que elegir un solo camino implica "apagar" otras facetas vitales de su identidad. Su desafio no es la falta de opciones, sino como integrar diversas pasiones en un estilo de vida que no se sienta como una jaula.',
    busca:
      'Una arquitectura de vida que le permita combinar actividades (hibridos) o entender la carrera como una plataforma base y no un destino final.',
    expectativa:
      'Un ecosistema flexible que contemple proyectos paralelos y hobbies serios, evitando la sensacion de "ruta sin salida".',
    estrategia: 'Conectar puntos (interdisciplinariedad) y mostrar la versatilidad de las opciones.',
  },
  analitico: {
    id: 'analitico',
    title: 'El Analitico',
    perfil:
      'Ya tiene el mapa general definido, pero se detiene en la "letra chica" antes de dar el paso final. Necesita distinguir los matices sutiles entre opciones del mismo rubro para asegurarse de que su eleccion encaje perfectamente con su expectativa del dia a dia.',
    busca:
      'Profundidad tecnica y diferenciacion clara sobre la rutina laboral (Zoom In) para evitar sorpresas futuras.',
    expectativa:
      'Comparativas "lado a lado" y datos objetivos que desambiguen opciones que parecen gemelas.',
    estrategia: 'Aportar precision mediante contrastes de estilo de vida y entornos de trabajo.',
  },
  practico: {
    id: 'practico',
    title: 'El Practico / Autodidacta',
    perfil:
      'Sus capacidades brillan mas en la ejecucion real y la resolucion de problemas que en el estudio teorico tradicional. Siente que el sistema estandar no siempre mide su verdadero valor, priorizando la accion sobre la memorizacion.',
    busca:
      'Poner en valor sus "skills" reales (digitales, creativos o tecnicos) y encontrar formatos educativos dinamicos.',
    expectativa:
      'Lenguaje directo, validacion de sus habilidades no academicas y propuestas de trayectos modernos o tecnicaturas.',
    estrategia: 'Actuar como "Scouter" de talentos ocultos y dignificar las rutas alternativas.',
  },
  determinado: {
    id: 'determinado',
    title: 'El Determinado',
    perfil:
      'Posee una vision muy firme sobre su futuro, a menudo construida sobre una imagen aspiracional fuerte o referencias familiares. Su recorrido requiere validar si esa certeza inicial se sostiene al confrontarla con la realidad operativa de la profesion.',
    busca:
      'Respaldar su intuicion con argumentos racionales y asegurar que su idealizacion matchea con la practica.',
    expectativa:
      'Confirmacion de su eleccion, pero valorara datos que le permitan defender su decision con propiedad.',
    estrategia:
      'Acompanar su certeza ofreciendo un "bano de realidad" constructivo sobre la rutina diaria.',
  },
  enfocado: {
    id: 'enfocado',
    title: 'El Enfocado',
    perfil:
      'La duda vocacional ya fue resuelta; su mentalidad esta puesta enteramente en la excelencia y el rendimiento. No busca descubrir el "que", sino optimizar el "donde" y el "como" para maximizar su proyeccion desde el dia uno.',
    busca:
      'Informacion de nivel superior, especializaciones de nicho y garantias de calidad academica.',
    expectativa:
      'Reconocimiento de su perfil y datos duros sobre proyeccion internacional o posgrados.',
    estrategia: 'Planificacion estrategica de carrera y deteccion de oportunidades de vanguardia.',
  },
  estratega: {
    id: 'estratega',
    title: 'El Estratega',
    perfil:
      'Evalua la educacion superior bajo la optica de la rentabilidad y el retorno de inversion. Prioriza la inteligencia de mercado y la escalabilidad profesional, entendiendo la carrera como una herramienta para lograr autonomia financiera.',
    busca:
      'Datos duros de mercado, tendencias a futuro y analisis de riesgo/beneficio de su tiempo invertido.',
    expectativa:
      'Informacion ejecutiva, rankings salariales y honestidad sobre la demanda laboral real.',
    estrategia:
      'Asesoramiento enfocado en la gestion inteligente del capital profesional y la competitividad.',
  },
  reinventado: {
    id: 'reinventado',
    title: 'El Reinventado',
    perfil:
      'Prioriza su bienestar y busca alinear su carrera con su verdadera esencia tras una experiencia previa que no encajo.',
    busca:
      'Un entorno de contraste que active sus fortalezas dormidas y entender las causas de la desconexion anterior.',
    expectativa:
      'Confirmar que su recorrido previo es un activo transferible (ventaja competitiva) y no tiempo perdido.',
    estrategia:
      'Asegurar que el cambio sea por vocacion genuina y no solo por reaccion al opuesto ("Efecto Pendulo").',
  },
};

export const careerCountToPersonas: Record<CareerCount, UserPersona[]> = {
  '1': ['determinado', 'enfocado', 'analitico'],
  '2-3': ['analitico', 'multipotencial', 'estratega'],
  many: ['multipotencial', 'buscador', 'practico'],
  '0': ['buscador', 'practico', 'reinventado'],
};

export interface QuestionnaireData {
  careerStatus: 'first' | 'change';
  careerChangeData?: {
    previousCareer: string;
    duration: string;
    enrollmentReason: string;
    quitReason: string;
    hatedActivities: string[];
    likedSomething: string;
    likedDetail?: string;
    nonNegotiable: string;
  };
  careerCount: CareerCount;
  careers: string[];
  persona: UserPersona;
}

export type OnboardingStep =
  | 'welcome'
  | 'personal-info'
  | 'career-status'
  | 'career-change'
  | 'career-count'
  | 'career-selection'
  | 'persona-result'
  | 'complete';
