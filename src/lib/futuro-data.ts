// Demo profile data for Valentina
export const demoProfile = {
  name: "Valentina",
  riasec: "I-A",
  topIntelligence: "Lógico-Matemática",
  traits: [
    "Pensamiento sistemático",
    "Orientación analítica",
    "Procesamiento profundo",
    "Tolerancia a la ambigüedad (punto de tensión)"
  ],
  energyActivators: [
    "trabajo profundo",
    "resolución lógica de problemas",
    "autonomía",
    "construir cosas que funcionan"
  ],
  energyDrains: [
    "interacción social constante",
    "reglas arbitrarias",
    "presión sin tiempo para pensar"
  ],
  lifestyle: {
    security: "alto",
    collaboration: "moderado",
    structure: "prefiere estructura",
    specialization: "especialista"
  },
  shareableTag: "Sistemática · Analítica · Constructora"
}

export interface CareerPath {
  id: string
  name: string
  tagline: string
  icon: string
  affinity: "alta" | "media" | "explorar"
  dna: {
    estructura: number
    libertadCreativa: number
    exposicionSocial: number
    ritmo: number
    rutina: number
    autonomia: number
  }
  environment: string
  salaryTimeline: string
  geographicReach: string
  testimonial: {
    quote: string
    author: string
    age: number
    context: string
  }
  honestyWarning: string
  whyFits: string[]
  tensions: string[]
  reflectionQuestion: string
  weeklySchedule: WeekDay[]
  stories: Story[]
  trajectory: TrajectoryNode[]
  skills: {
    hard: Skill[]
    soft: Skill[]
    future: Skill[]
  }
  lifestyle: LifestyleDimension[]
  closingImage: {
    phrase: string
    nextStep: string
  }
}

export interface WeekDay {
  day: string
  activities: {
    time: string
    name: string
    description: string
    type: "deep" | "social" | "routine" | "creative"
    intensity: "alta" | "media" | "baja"
  }[]
}

export interface Story {
  icon: string
  title: string
  body: string
  gradient: string
}

export interface TrajectoryNode {
  year: number
  label: string
  role: string
  description: string
  salaryRange: string
  vibeQuote: string
  branches?: {
    name: string
    description: string
  }[]
}

export interface Skill {
  name: string
  timing: string
  tensionWarning?: string
}

export interface LifestyleDimension {
  name: string
  icon: string
  compatibility: number
  description: string
}

// Career matches from Act 2
export const matchedCareers = [
  {
    id: "sistemas",
    name: "Ingeniería en Sistemas de Información",
    field: "Tecnología",
    matchPercentage: 87,
    description: "Un mundo donde la lógica construye soluciones que millones usan cada día.",
    paths: [] as CareerPath[]
  },
  {
    id: "datos",
    name: "Ciencia de Datos",
    field: "Tecnología / Análisis",
    matchPercentage: 82,
    description: "Donde los patrones ocultos se transforman en decisiones que cambian organizaciones.",
    paths: [] as CareerPath[]
  },
  {
    id: "ux",
    name: "Diseño de Experiencia de Usuario (UX)",
    field: "Diseño / Tecnología",
    matchPercentage: 79,
    description: "Diseñar cómo las personas interactúan con la tecnología, haciéndola humana.",
    paths: [] as CareerPath[]
  },
  {
    id: "admin",
    name: "Licenciatura en Administración de Empresas",
    field: "Negocios / Gestión",
    matchPercentage: 71,
    description: "Entender cómo funcionan las organizaciones y aprender a moverlas.",
    paths: [] as CareerPath[]
  },
  {
    id: "psico-org",
    name: "Psicología Organizacional",
    field: "Psicología / RRHH",
    matchPercentage: 68,
    description: "Entender el comportamiento humano para mejorar cómo trabajamos juntos.",
    paths: [] as CareerPath[]
  }
]

// Generate paths for Ingeniería en Sistemas
const sistemasPaths: CareerPath[] = [
  {
    id: "corporate-dev",
    name: "Desarrollo en Corporativo",
    tagline: "Estabilidad, estructura y proyectos de gran escala",
    icon: "🏢",
    affinity: "media",
    dna: {
      estructura: 5,
      libertadCreativa: 2,
      exposicionSocial: 3,
      ritmo: 3,
      rutina: 4,
      autonomia: 2
    },
    environment: "Oficinas modernas, equipos grandes, procesos definidos",
    salaryTimeline: "Buen sueldo desde el inicio, crecimiento predecible",
    geographicReach: "Principalmente local, algunas multinacionales",
    testimonial: {
      quote: "Los primeros años aprendés mucho de sistemas que manejan millones de usuarios. Después, si no te movés, te estancás. Pero la estabilidad te permite planificar tu vida.",
      author: "Martín",
      age: 29,
      context: "Developer en banco, 5 años de experiencia"
    },
    honestyWarning: "La burocracia puede ser frustrante. A veces pasás más tiempo en reuniones que programando.",
    whyFits: [
      "Tu preferencia por estructura encaja con los procesos definidos",
      "El trabajo profundo es valorado - tenés tiempo para pensar soluciones",
      "La estabilidad que buscás está garantizada con buenos beneficios"
    ],
    tensions: [
      "Tu baja tolerancia a la ambigüedad puede chocar con cambios de prioridades corporativas",
      "La autonomía limitada puede frustrarte a mediano plazo"
    ],
    reflectionQuestion: "¿Te imaginás en un lugar donde la seguridad vale más que la velocidad de cambio?",
    weeklySchedule: [
      {
        day: "Lunes",
        activities: [
          { time: "09:00", name: "Daily standup", description: "Sincronización rápida con el equipo sobre tareas de la semana", type: "social", intensity: "baja" },
          { time: "10:00", name: "Desarrollo feature", description: "Trabajo concentrado en nueva funcionalidad del sistema core", type: "deep", intensity: "alta" },
          { time: "14:00", name: "Code review", description: "Revisión de PRs de compañeros con feedback constructivo", type: "routine", intensity: "media" }
        ]
      },
      {
        day: "Martes",
        activities: [
          { time: "09:00", name: "Análisis de requerimientos", description: "Entender qué necesita el negocio antes de codear", type: "deep", intensity: "media" },
          { time: "11:00", name: "Desarrollo", description: "Implementación de lógica de negocio compleja", type: "deep", intensity: "alta" },
          { time: "15:00", name: "Documentación", description: "Actualizar documentación técnica del sistema", type: "routine", intensity: "baja" }
        ]
      },
      {
        day: "Miércoles",
        activities: [
          { time: "09:00", name: "Daily standup", description: "Update de mitad de semana", type: "social", intensity: "baja" },
          { time: "10:00", name: "Pair programming", description: "Trabajar en conjunto para resolver bug complejo", type: "social", intensity: "media" },
          { time: "14:00", name: "Testing", description: "Escribir y ejecutar tests unitarios", type: "deep", intensity: "media" }
        ]
      },
      {
        day: "Jueves",
        activities: [
          { time: "09:00", name: "Planning refinement", description: "Preparar historias para el próximo sprint", type: "social", intensity: "media" },
          { time: "11:00", name: "Desarrollo", description: "Continuar feature principal de la semana", type: "deep", intensity: "alta" },
          { time: "16:00", name: "1:1 con tech lead", description: "Charla de carrera y feedback", type: "social", intensity: "media" }
        ]
      },
      {
        day: "Viernes",
        activities: [
          { time: "09:00", name: "Daily standup", description: "Cierre de semana", type: "social", intensity: "baja" },
          { time: "10:00", name: "Bug fixing", description: "Resolver issues reportados en producción", type: "deep", intensity: "media" },
          { time: "14:00", name: "Demo interna", description: "Mostrar avances al equipo", type: "social", intensity: "media" }
        ]
      }
    ],
    stories: [
      {
        icon: "🔍",
        title: "El bug que nadie encontraba",
        body: "Son las 11 de la mañana. Llevás dos horas mirando logs, trazando el flujo de datos entre microservicios. De repente, lo ves: un edge case que nadie contempló. Lo arreglás en 20 minutos. Esa satisfacción de resolver un puzzle que otros no pudieron es tuya.",
        gradient: "from-indigo-500/20 to-violet-500/20"
      },
      {
        icon: "🚀",
        title: "Tu código en producción",
        body: "El deploy sale bien. Tu feature está live. Millones de personas van a usar algo que vos escribiste. No hay aplausos, no hay ceremonia. Pero vos sabés. Y eso alcanza.",
        gradient: "from-emerald-500/20 to-teal-500/20"
      },
      {
        icon: "💡",
        title: "La propuesta que escucharon",
        body: "En la retro, sugerís una mejora al proceso de deploy. Dos semanas después, está implementada. Tu voz tiene peso acá. No por tu cargo, sino porque tus ideas funcionan.",
        gradient: "from-amber-500/20 to-orange-500/20"
      }
    ],
    trajectory: [
      {
        year: 1,
        label: "Año 1",
        role: "Junior Developer",
        description: "Aprendés el stack, los procesos, cómo funciona el negocio. Mucho pair programming y mentoreo.",
        salaryRange: "$400.000 - $600.000 ARS",
        vibeQuote: "El síndrome del impostor es real. Pero cada bug que resolvés solo, se va achicando."
      },
      {
        year: 3,
        label: "Año 3",
        role: "Semi-Senior Developer",
        description: "Ya liderás features completas. Te consultan. Empezás a mentorear juniors.",
        salaryRange: "$800.000 - $1.200.000 ARS",
        vibeQuote: "Dejás de googlear todo. Empezás a confiar en tu criterio."
      },
      {
        year: 5,
        label: "Año 5",
        role: "Senior Developer / Tech Lead",
        description: "Definís arquitectura. Tomás decisiones técnicas que afectan al equipo. Menos código, más diseño.",
        salaryRange: "$1.500.000 - $2.500.000 ARS",
        vibeQuote: "Tu trabajo ya no es escribir código perfecto. Es hacer que otros puedan escribir buen código."
      },
      {
        year: 10,
        label: "Año 10",
        role: "Horizonte",
        description: "Se abren varios caminos según lo que priorices.",
        salaryRange: "$3.000.000+ ARS",
        vibeQuote: "El título importa menos. Lo que importa es qué problemas querés resolver.",
        branches: [
          {
            name: "Engineering Manager",
            description: "Liderás equipos. Menos técnico, más gestión de personas y estrategia."
          },
          {
            name: "Staff Engineer",
            description: "Seguís técnico pero a nivel de toda la organización. Resolvés los problemas más difíciles."
          },
          {
            name: "Arquitecto de Soluciones",
            description: "Diseñás sistemas completos. Consultás con múltiples equipos y clientes."
          }
        ]
      }
    ],
    skills: {
      hard: [
        { name: "Lenguajes de programación (Java, Python, JS)", timing: "Desde el día 1" },
        { name: "Bases de datos y SQL", timing: "Primeros 6 meses" },
        { name: "Git y control de versiones", timing: "Primeras semanas" },
        { name: "Cloud (AWS/GCP/Azure)", timing: "Año 2-3" },
        { name: "Arquitectura de microservicios", timing: "Año 3+" }
      ],
      soft: [
        { name: "Comunicación técnica", timing: "Desde el inicio" },
        { name: "Trabajo en equipo", timing: "Constante" },
        { name: "Gestión del tiempo", timing: "Año 1-2" },
        { name: "Manejo del feedback", timing: "Constante" }
      ],
      future: [
        { name: "AI/ML integrado al desarrollo", timing: "Ya empezó" },
        { name: "Prompt engineering", timing: "Próximos 2 años" },
        { name: "Arquitectura para AI", timing: "Próximos 3-5 años" }
      ]
    },
    lifestyle: [
      {
        name: "Tiempo libre",
        icon: "⏰",
        compatibility: 75,
        description: "Horarios predecibles. Rara vez hay emergencias fuera de horario. Podés planificar tu vida personal."
      },
      {
        name: "Dinero",
        icon: "💰",
        compatibility: 80,
        description: "Sueldos competitivos desde el inicio. Aumentos constantes. Beneficios corporativos (obra social, gimnasio, etc)."
      },
      {
        name: "Geografía",
        icon: "🌍",
        compatibility: 65,
        description: "Mayoría requiere presencialidad híbrida en grandes ciudades. Algunas posiciones full remote."
      },
      {
        name: "Vínculos",
        icon: "👥",
        compatibility: 70,
        description: "Equipos estables con los que construís relaciones. Menos networking, más profundidad."
      },
      {
        name: "Autonomía",
        icon: "🎯",
        compatibility: 55,
        description: "Libertad técnica dentro de lineamientos. Decisiones importantes pasan por varios niveles."
      }
    ],
    closingImage: {
      phrase: "Me veo llegando a una oficina moderna, con mi café, sabiendo exactamente qué tengo que resolver hoy. Trabajo en algo que millones usan. Tengo estabilidad para planificar mi vida, y cada tanto resuelvo un puzzle técnico que me recuerda por qué elegí esto.",
      nextStep: "Buscá en LinkedIn \"junior developer\" + el nombre de 3 empresas que te interesen. Leé los requisitos. No para aplicar, solo para ver qué piden."
    }
  },
  {
    id: "startup-dev",
    name: "Desarrollo en Startup",
    tagline: "Velocidad, impacto visible y caos controlado",
    icon: "🚀",
    affinity: "explorar",
    dna: {
      estructura: 2,
      libertadCreativa: 5,
      exposicionSocial: 3,
      ritmo: 5,
      rutina: 1,
      autonomia: 5
    },
    environment: "Equipos chicos, oficinas informales o full remote, iteración constante",
    salaryTimeline: "Arranque modesto, potencial alto si la empresa crece (equity)",
    geographicReach: "Global - muchas startups contratan remoto internacional",
    testimonial: {
      quote: "En 6 meses hice más cosas que mis amigos en corporativos en 2 años. Pero también hubo semanas de no dormir y momentos donde no sabía si la empresa iba a existir el mes siguiente.",
      author: "Lucía",
      age: 26,
      context: "Full-stack en fintech, 3 años de experiencia"
    },
    honestyWarning: "La ambigüedad es constante. Los requerimientos cambian. Si necesitás certezas, esto te va a costar.",
    whyFits: [
      "Tu capacidad de pensamiento sistemático es súper valiosa en el caos - ponés orden",
      "Construir cosas que funcionan rápido va con tu perfil constructivo",
      "La autonomía es máxima - nadie te micromanagea"
    ],
    tensions: [
      "Tu baja tolerancia a la ambigüedad es un punto de tensión real acá",
      "La falta de estructura puede generarte ansiedad inicial"
    ],
    reflectionQuestion: "¿Estás dispuesta a cambiar seguridad por velocidad de aprendizaje?",
    weeklySchedule: [
      {
        day: "Lunes",
        activities: [
          { time: "10:00", name: "Sync semanal", description: "El equipo entero define prioridades de la semana", type: "social", intensity: "media" },
          { time: "11:00", name: "Feature urgente", description: "Implementación de algo que pidió un cliente grande", type: "deep", intensity: "alta" },
          { time: "16:00", name: "Deploy a producción", description: "Subís lo que hiciste hoy. Sin burocracia.", type: "routine", intensity: "media" }
        ]
      },
      {
        day: "Martes",
        activities: [
          { time: "09:00", name: "Bug crítico", description: "Algo se rompió en prod. Hay que arreglarlo ya.", type: "deep", intensity: "alta" },
          { time: "14:00", name: "Diseño de solución", description: "Pensás cómo resolver un problema nuevo sin precedentes", type: "creative", intensity: "alta" },
          { time: "17:00", name: "Code review async", description: "Revisás PRs cuando podés, sin reunión formal", type: "routine", intensity: "baja" }
        ]
      },
      {
        day: "Miércoles",
        activities: [
          { time: "10:00", name: "Llamada con usuario", description: "Hablás directo con alguien que usa tu producto", type: "social", intensity: "media" },
          { time: "11:00", name: "Iteración rápida", description: "Cambiás algo basado en el feedback inmediato", type: "deep", intensity: "alta" },
          { time: "15:00", name: "Aprendizaje", description: "Investigás una tecnología nueva que podrías usar", type: "deep", intensity: "media" }
        ]
      },
      {
        day: "Jueves",
        activities: [
          { time: "09:00", name: "Desarrollo core", description: "Trabajo profundo en la funcionalidad principal", type: "deep", intensity: "alta" },
          { time: "14:00", name: "Pair con founder", description: "El CEO te explica contexto de negocio mientras codeás", type: "social", intensity: "media" },
          { time: "17:00", name: "Testing manual", description: "Probás todo porque no hay QA dedicado", type: "routine", intensity: "media" }
        ]
      },
      {
        day: "Viernes",
        activities: [
          { time: "10:00", name: "Demo a inversores", description: "Mostrás lo que el equipo construyó esta semana", type: "social", intensity: "alta" },
          { time: "12:00", name: "Almuerzo de equipo", description: "Momento social informal, hablan de todo menos trabajo", type: "social", intensity: "baja" },
          { time: "14:00", name: "Refactor opcional", description: "Si querés, mejorás código. Si no, arrancás el finde.", type: "deep", intensity: "baja" }
        ]
      }
    ],
    stories: [
      {
        icon: "⚡",
        title: "La feature que salvó la semana",
        body: "El cliente más grande amenaza con irse. Necesitan algo para el viernes. Son miércoles. No hay spec, no hay diseño. Solo vos, tu código, y la confianza de que vas a encontrar la forma. El viernes a las 6pm, está live. El cliente se queda.",
        gradient: "from-rose-500/20 to-pink-500/20"
      },
      {
        icon: "🎯",
        title: "Tu idea, en producción",
        body: "En el standup tirás: 'Y si probamos esto?'. Tres horas después, está funcionando. Nadie pidió permiso a nadie. Nadie hizo un documento de 20 páginas. La idea era buena, y ahora es real.",
        gradient: "from-violet-500/20 to-purple-500/20"
      },
      {
        icon: "🌊",
        title: "El pivote",
        body: "Lo que construiste las últimas 3 semanas ya no sirve. El producto cambió de dirección. Dolió. Pero en 48 horas ya estás construyendo algo nuevo, y esta vez sabés más.",
        gradient: "from-cyan-500/20 to-blue-500/20"
      }
    ],
    trajectory: [
      {
        year: 1,
        label: "Año 1",
        role: "Developer Generalista",
        description: "Hacés de todo: frontend, backend, algo de infra. Aprendés a los golpes.",
        salaryRange: "$350.000 - $500.000 ARS + equity",
        vibeQuote: "Vas a sentir que no sabés nada. Es normal. Todos acá están improvisando."
      },
      {
        year: 3,
        label: "Año 3",
        role: "Senior / Tech Lead",
        description: "Si la startup creció, ya liderás. Si no, saltaste a otra con más seniority.",
        salaryRange: "$700.000 - $1.500.000 ARS + equity",
        vibeQuote: "El título importa menos que lo que podés mostrar que hiciste."
      },
      {
        year: 5,
        label: "Año 5",
        role: "CTO / Co-founder técnico",
        description: "O liderás la tech de una startup en crecimiento, o empezaste la tuya.",
        salaryRange: "$1.200.000 - $3.000.000 ARS + equity significativo",
        vibeQuote: "Ya no sos 'el dev'. Sos el que decide qué se construye."
      },
      {
        year: 10,
        label: "Año 10",
        role: "Horizonte",
        description: "El mundo startup es impredecible. Pero abriste muchas puertas.",
        salaryRange: "Variable - potencial muy alto con exits",
        vibeQuote: "Algunos amigos hicieron plata con exits. Otros siguen buscando. Todos aprendieron más de lo que imaginaban.",
        branches: [
          {
            name: "Founder",
            description: "Empezás tu propia startup. Todo el riesgo, toda la recompensa."
          },
          {
            name: "Executive en scale-up",
            description: "Liderás tech en una empresa que ya encontró product-market fit."
          },
          {
            name: "Consultor / Advisor",
            description: "Ayudás a otras startups con tu experiencia. Más libertad, menos compromiso."
          }
        ]
      }
    ],
    skills: {
      hard: [
        { name: "Full-stack development", timing: "Desde el día 1" },
        { name: "DevOps básico", timing: "Primeros meses" },
        { name: "Prototipado rápido", timing: "Constante" },
        { name: "Métricas y analytics", timing: "Año 1-2" }
      ],
      soft: [
        { name: "Tolerancia a la ambigüedad", timing: "Desde el inicio", tensionWarning: "Esto puede costarte al principio" },
        { name: "Comunicación directa", timing: "Constante" },
        { name: "Priorización bajo presión", timing: "Primeras semanas" }
      ],
      future: [
        { name: "AI como herramienta de productividad", timing: "Ya es esencial" },
        { name: "No-code/low-code para MVPs", timing: "Próximos 2 años" }
      ]
    },
    lifestyle: [
      {
        name: "Tiempo libre",
        icon: "⏰",
        compatibility: 45,
        description: "Impredecible. Hay semanas tranquilas y semanas intensas. Los límites dependen de vos."
      },
      {
        name: "Dinero",
        icon: "💰",
        compatibility: 60,
        description: "Sueldo inicial moderado, pero el equity puede valer mucho si la empresa crece."
      },
      {
        name: "Geografía",
        icon: "🌍",
        compatibility: 90,
        description: "Muchas posiciones full remote. Podés trabajar desde donde quieras."
      },
      {
        name: "Vínculos",
        icon: "👥",
        compatibility: 75,
        description: "Equipos chicos donde conocés a todos. Relaciones intensas pero a veces efímeras."
      },
      {
        name: "Autonomía",
        icon: "🎯",
        compatibility: 95,
        description: "Máxima. Nadie te dice cómo hacer las cosas. Eso es libertad y responsabilidad."
      }
    ],
    closingImage: {
      phrase: "Me veo abriendo la laptop desde un café o desde mi casa, resolviendo un problema que nadie resolvió antes. El producto cambia constantemente, pero yo también. Construyo rápido, aprendo más rápido. No sé dónde voy a estar en 5 años, pero sé que voy a haber hecho cosas que importaron.",
      nextStep: "Entrá a Angel List o a la sección de empleos de algún newsletter de startups argentinas (ej: Endeavor, NXTP). Mirá qué buscan. No para aplicar, solo para entender el mundo."
    }
  },
  {
    id: "freelance-dev",
    name: "Desarrollo Freelance",
    tagline: "Libertad total, responsabilidad total",
    icon: "🎯",
    affinity: "alta",
    dna: {
      estructura: 2,
      libertadCreativa: 4,
      exposicionSocial: 2,
      ritmo: 3,
      rutina: 2,
      autonomia: 5
    },
    environment: "Donde quieras: tu casa, un coworking, otro país. Vos decidís.",
    salaryTimeline: "Variable. Podés ganar muy bien o tener meses flojos. Depende de vos.",
    geographicReach: "Global - clientes de cualquier parte del mundo",
    testimonial: {
      quote: "Los primeros 6 meses fueron duros. No sabía cómo conseguir clientes ni cuánto cobrar. Ahora trabajo 6 horas al día, elijo mis proyectos y gano más que mis amigos en relación de dependencia.",
      author: "Tomás",
      age: 31,
      context: "Freelancer, 4 años de experiencia"
    },
    honestyWarning: "No hay sueldo fijo. No hay obra social. No hay vacaciones pagas. Todo depende de vos.",
    whyFits: [
      "Tu necesidad de autonomía encuentra acá su máxima expresión",
      "Podés elegir proyectos que requieran trabajo profundo y analítico",
      "Construís cosas de principio a fin - ves el resultado completo"
    ],
    tensions: [
      "La incertidumbre financiera puede estresarte - planificá bien",
      "Vas a tener que vender y negociar, lo cual puede no ser tu fuerte"
    ],
    reflectionQuestion: "¿Estás lista para ser tu propia jefa, con todo lo que eso implica?",
    weeklySchedule: [
      {
        day: "Lunes",
        activities: [
          { time: "09:00", name: "Revisión semanal", description: "Planificás tu semana: qué proyectos, qué deadlines", type: "routine", intensity: "media" },
          { time: "10:00", name: "Desarrollo cliente A", description: "Trabajo profundo en el proyecto principal", type: "deep", intensity: "alta" },
          { time: "15:00", name: "Call con cliente", description: "Update semanal de avances y próximos pasos", type: "social", intensity: "media" }
        ]
      },
      {
        day: "Martes",
        activities: [
          { time: "08:00", name: "Desarrollo temprano", description: "Aprovechás la mañana tranquila para código complejo", type: "deep", intensity: "alta" },
          { time: "12:00", name: "Pausa larga", description: "Almorzás, hacés ejercicio, lo que quieras", type: "routine", intensity: "baja" },
          { time: "16:00", name: "Desarrollo cliente B", description: "Proyecto secundario que mantiene el flujo de caja", type: "deep", intensity: "media" }
        ]
      },
      {
        day: "Miércoles",
        activities: [
          { time: "09:00", name: "Propuesta nuevo cliente", description: "Escribís una propuesta para un proyecto que te interesa", type: "creative", intensity: "media" },
          { time: "11:00", name: "Desarrollo", description: "Continuar feature del cliente principal", type: "deep", intensity: "alta" },
          { time: "15:00", name: "Aprendizaje", description: "Estudiás algo nuevo que mejora tu servicio", type: "deep", intensity: "media" }
        ]
      },
      {
        day: "Jueves",
        activities: [
          { time: "10:00", name: "Entrega parcial", description: "Mostrás avance al cliente, recibís feedback", type: "social", intensity: "media" },
          { time: "14:00", name: "Ajustes", description: "Implementás cambios basados en el feedback", type: "deep", intensity: "media" },
          { time: "17:00", name: "Admin", description: "Facturas, contratos, cosas aburridas pero necesarias", type: "routine", intensity: "baja" }
        ]
      },
      {
        day: "Viernes",
        activities: [
          { time: "09:00", name: "Cierre de semana", description: "Terminás lo urgente antes del fin de semana", type: "deep", intensity: "alta" },
          { time: "13:00", name: "Networking opcional", description: "Un café virtual con alguien de la industria, si querés", type: "social", intensity: "baja" },
          { time: "15:00", name: "Libre", description: "Si terminaste, el viernes es tuyo", type: "routine", intensity: "baja" }
        ]
      }
    ],
    stories: [
      {
        icon: "🌅",
        title: "El martes que no trabajaste",
        body: "Hacía un día hermoso. No tenías calls. Decidiste ir al río. Tu laptop quedó en casa. No pediste permiso a nadie. No mentiste. Simplemente, podías. Y eso vale más de lo que parece.",
        gradient: "from-amber-500/20 to-yellow-500/20"
      },
      {
        icon: "💸",
        title: "El primer cliente grande",
        body: "Después de meses de proyectos chicos, llega uno grande. El presupuesto tiene un cero más de lo que estás acostumbrada. Dudás. Pero lo tomás. Y lo entregás. Y el cliente queda feliz. Ese día entendiste que podías jugar en otra liga.",
        gradient: "from-emerald-500/20 to-green-500/20"
      },
      {
        icon: "😰",
        title: "El mes sin proyectos",
        body: "Terminó un proyecto grande y no conseguiste otro inmediatamente. Tres semanas sin ingresos. Aprendiste a tener un colchón financiero y a nunca depender de un solo cliente.",
        gradient: "from-slate-500/20 to-gray-500/20"
      }
    ],
    trajectory: [
      {
        year: 1,
        label: "Año 1",
        role: "Freelancer Junior",
        description: "Proyectos chicos, clientes locales, aprendiendo a vender y entregar.",
        salaryRange: "Variable: $300.000 - $700.000 ARS/mes",
        vibeQuote: "Los primeros clientes son los más difíciles de conseguir. Después se hace más fácil."
      },
      {
        year: 3,
        label: "Año 3",
        role: "Freelancer Establecido",
        description: "Clientes recurrentes, algunos internacionales. Podés elegir proyectos.",
        salaryRange: "Variable: $800.000 - $2.000.000 ARS/mes",
        vibeQuote: "Ya no perseguís clientes. Te buscan. Eso cambia todo."
      },
      {
        year: 5,
        label: "Año 5",
        role: "Consultor / Especialista",
        description: "Cobrás premium por expertise específica. Trabajás menos, ganás más.",
        salaryRange: "Variable: $1.500.000 - $4.000.000 ARS/mes",
        vibeQuote: "El secreto es especializarte. Ser 'el de X' en vez de 'uno más'."
      },
      {
        year: 10,
        label: "Año 10",
        role: "Horizonte",
        description: "Muchos caminos posibles según qué priorizaste.",
        salaryRange: "Sin techo - depende de tus decisiones",
        vibeQuote: "Algunos freelancers trabajan 4 horas al día. Otros facturan millones. Vos elegís.",
        branches: [
          {
            name: "Estudio propio",
            description: "Armaste un equipo. Ya no hacés todo vos, pero seguís facturando."
          },
          {
            name: "Consultor premium",
            description: "Trabajás con pocos clientes de alto ticket. Máxima libertad."
          },
          {
            name: "Productos propios",
            description: "Creaste un SaaS o producto digital. Ingresos pasivos."
          }
        ]
      }
    ],
    skills: {
      hard: [
        { name: "Stack técnico sólido", timing: "Antes de empezar" },
        { name: "Gestión de proyectos básica", timing: "Primeros meses" },
        { name: "Estimación de tiempos y costos", timing: "Año 1" },
        { name: "Especialización técnica", timing: "Año 2-3" }
      ],
      soft: [
        { name: "Auto-disciplina", timing: "Desde el día 1" },
        { name: "Comunicación con clientes", timing: "Constante" },
        { name: "Negociación", timing: "Primeros proyectos", tensionWarning: "Puede costarte al principio" },
        { name: "Manejo de la incertidumbre", timing: "Constante", tensionWarning: "Tu punto de tensión - trabajalo" }
      ],
      future: [
        { name: "Personal branding / presencia online", timing: "Ya es importante" },
        { name: "AI para multiplicar productividad", timing: "Ya es esencial" }
      ]
    },
    lifestyle: [
      {
        name: "Tiempo libre",
        icon: "⏰",
        compatibility: 90,
        description: "Total control. Podés tomarte el día cuando quieras. Pero también podés trabajar de más si no ponés límites."
      },
      {
        name: "Dinero",
        icon: "💰",
        compatibility: 70,
        description: "Potencial alto pero variable. Necesitás disciplina financiera para los meses flojos."
      },
      {
        name: "Geografía",
        icon: "🌍",
        compatibility: 95,
        description: "Libertad total. Podés vivir donde quieras mientras tengas internet."
      },
      {
        name: "Vínculos",
        icon: "👥",
        compatibility: 50,
        description: "Trabajo solitario. Tenés que buscar activamente comunidad si la necesitás."
      },
      {
        name: "Autonomía",
        icon: "🎯",
        compatibility: 100,
        description: "Absoluta. Sos tu propia jefa en todo sentido."
      }
    ],
    closingImage: {
      phrase: "Me veo trabajando desde donde quiera, en proyectos que elegí, para clientes que respetan mi tiempo. No tengo jefe, no tengo horarios fijos, no tengo techo. Lo que construyo es mío. La libertad tiene un precio, y estoy dispuesta a pagarlo.",
      nextStep: "Hacé un proyecto personal o contribuí a un open source esta semana. Algo que puedas mostrar. Tu portfolio es tu currículum en este mundo."
    }
  },
  {
    id: "product-engineer",
    name: "Product Engineer",
    tagline: "El puente entre código y producto",
    icon: "🌉",
    affinity: "alta",
    dna: {
      estructura: 3,
      libertadCreativa: 4,
      exposicionSocial: 3,
      ritmo: 4,
      rutina: 2,
      autonomia: 4
    },
    environment: "Empresas de producto tech, colaboración estrecha con diseño y negocio",
    salaryTimeline: "Sueldos competitivos, crecimiento ligado al impacto en producto",
    geographicReach: "Global - muy demandado en empresas de producto",
    testimonial: {
      quote: "No soy solo 'el que programa'. Opino sobre qué construir, no solo cómo. Eso hace que mi trabajo tenga más sentido.",
      author: "Sofía",
      age: 28,
      context: "Product Engineer en empresa de EdTech, 4 años"
    },
    honestyWarning: "Requiere habilidades híbridas: técnicas Y de producto. No podés ignorar ninguna de las dos.",
    whyFits: [
      "Tu pensamiento sistemático te permite ver el producto completo, no solo el código",
      "Podés hacer trabajo profundo técnico pero también contribuir a decisiones de producto",
      "La combinación de análisis y construcción va perfecto con tu perfil"
    ],
    tensions: [
      "Vas a tener que defender ideas en reuniones - requiere comunicación activa",
      "Los cambios de dirección de producto pueden frustrarte si buscás estabilidad"
    ],
    reflectionQuestion: "¿Te interesa entender el porqué detrás de lo que construís, además del cómo?",
    weeklySchedule: [
      {
        day: "Lunes",
        activities: [
          { time: "09:30", name: "Planning de producto", description: "Definís con PM y diseño qué se construye esta semana", type: "social", intensity: "media" },
          { time: "11:00", name: "Diseño técnico", description: "Pensás cómo implementar lo que se decidió", type: "deep", intensity: "alta" },
          { time: "15:00", name: "Desarrollo", description: "Empezás a construir la feature principal", type: "deep", intensity: "alta" }
        ]
      },
      {
        day: "Martes",
        activities: [
          { time: "09:00", name: "Análisis de métricas", description: "Revisás cómo está funcionando lo que lanzaste", type: "deep", intensity: "media" },
          { time: "11:00", name: "Desarrollo", description: "Trabajo concentrado en feature", type: "deep", intensity: "alta" },
          { time: "15:00", name: "Sesión con diseño", description: "Iterás detalles de UX mientras construís", type: "social", intensity: "media" }
        ]
      },
      {
        day: "Miércoles",
        activities: [
          { time: "10:00", name: "User research", description: "Ves grabaciones de usuarios usando tu feature", type: "deep", intensity: "media" },
          { time: "11:30", name: "Ajustes basados en data", description: "Cambiás cosas basándote en lo que viste", type: "deep", intensity: "alta" },
          { time: "15:00", name: "Brainstorm de producto", description: "Sesión creativa sobre nuevas ideas", type: "creative", intensity: "media" }
        ]
      },
      {
        day: "Jueves",
        activities: [
          { time: "09:00", name: "Desarrollo", description: "Sprint final de la feature antes de lanzar", type: "deep", intensity: "alta" },
          { time: "14:00", name: "Code review cruzado", description: "Revisás código de otro product engineer", type: "routine", intensity: "media" },
          { time: "16:00", name: "Preparar lanzamiento", description: "Tests finales, feature flags, documentación", type: "routine", intensity: "media" }
        ]
      },
      {
        day: "Viernes",
        activities: [
          { time: "10:00", name: "Lanzamiento", description: "Tu feature sale a producción", type: "deep", intensity: "alta" },
          { time: "11:00", name: "Monitoreo", description: "Mirás métricas en tiempo real post-launch", type: "routine", intensity: "media" },
          { time: "14:00", name: "Retro de equipo", description: "Qué funcionó, qué mejorar para la semana que viene", type: "social", intensity: "media" }
        ]
      }
    ],
    stories: [
      {
        icon: "📊",
        title: "El insight que cambió todo",
        body: "Mirando las métricas, notás algo que nadie vio: los usuarios abandonan en un paso específico. Proponés un cambio. Lo implementás. La conversión sube 40%. Tu idea, tu código, tu impacto.",
        gradient: "from-blue-500/20 to-indigo-500/20"
      },
      {
        icon: "🤝",
        title: "La feature que nació en un café",
        body: "Estás tomando un café con la PM. Tirás una idea random. Una semana después, la estás construyendo. Dos semanas después, miles de personas la usan. Acá las buenas ideas no mueren en documentos.",
        gradient: "from-teal-500/20 to-cyan-500/20"
      },
      {
        icon: "🎯",
        title: "El día que dijiste no",
        body: "PM propone una feature. Vos explicás por qué técnicamente no tiene sentido. No como excusa, sino con alternativas. Te escuchan. Se hace diferente. Y funciona mejor.",
        gradient: "from-purple-500/20 to-violet-500/20"
      }
    ],
    trajectory: [
      {
        year: 1,
        label: "Año 1",
        role: "Product Engineer Junior",
        description: "Aprendés a pensar en producto mientras construís. Muchas preguntas de 'por qué'.",
        salaryRange: "$450.000 - $700.000 ARS",
        vibeQuote: "Al principio vas a sentir que tenés que opinar de cosas que no entendés. Está bien. Preguntá."
      },
      {
        year: 3,
        label: "Año 3",
        role: "Product Engineer",
        description: "Liderás features end-to-end. Tu opinión de producto tiene peso real.",
        salaryRange: "$900.000 - $1.500.000 ARS",
        vibeQuote: "Ya no sos solo 'la que programa'. Sos parte de las decisiones importantes."
      },
      {
        year: 5,
        label: "Año 5",
        role: "Senior Product Engineer",
        description: "Definís dirección técnica de producto. Mentoreás. Influís en roadmap.",
        salaryRange: "$1.800.000 - $3.000.000 ARS",
        vibeQuote: "La gente te busca para entender si una idea es viable. Eso es poder real."
      },
      {
        year: 10,
        label: "Año 10",
        role: "Horizonte",
        description: "El híbrido técnico-producto es muy valorado en muchos contextos.",
        salaryRange: "$3.500.000+ ARS",
        vibeQuote: "Podés ir para cualquier lado. Ese es el superpoder de entender ambos mundos.",
        branches: [
          {
            name: "Head of Product Engineering",
            description: "Liderás un equipo de product engineers. Definís cómo se trabaja."
          },
          {
            name: "CPO técnico",
            description: "Chief Product Officer con background técnico. Raro y muy valioso."
          },
          {
            name: "Founder técnico",
            description: "Empezás tu empresa con la ventaja de entender producto y tecnología."
          }
        ]
      }
    ],
    skills: {
      hard: [
        { name: "Desarrollo full-stack sólido", timing: "Antes de empezar" },
        { name: "Métricas y analytics de producto", timing: "Año 1" },
        { name: "Experimentación (A/B testing)", timing: "Año 1-2" },
        { name: "Diseño de sistemas escalables", timing: "Año 2-3" }
      ],
      soft: [
        { name: "Pensamiento de producto", timing: "Desde el inicio" },
        { name: "Comunicación con stakeholders", timing: "Constante" },
        { name: "Facilitación de decisiones", timing: "Año 2+" },
        { name: "Empatía con usuarios", timing: "Constante" }
      ],
      future: [
        { name: "AI como feature de producto", timing: "Ya es relevante" },
        { name: "Product-led growth", timing: "Próximos 2-3 años" }
      ]
    },
    lifestyle: [
      {
        name: "Tiempo libre",
        icon: "⏰",
        compatibility: 70,
        description: "Generalmente predecible, pero los lanzamientos pueden ser intensos."
      },
      {
        name: "Dinero",
        icon: "💰",
        compatibility: 85,
        description: "Muy bien pago, especialmente en empresas de producto tech. El rol es valorado."
      },
      {
        name: "Geografía",
        icon: "🌍",
        compatibility: 80,
        description: "Muchas posiciones remotas, especialmente en empresas internacionales de producto."
      },
      {
        name: "Vínculos",
        icon: "👥",
        compatibility: 80,
        description: "Trabajo colaborativo con diseño, PM, y otros engineers. Relaciones de trabajo cercanas."
      },
      {
        name: "Autonomía",
        icon: "🎯",
        compatibility: 85,
        description: "Alta. Tu opinión importa. Pero dentro de una visión de producto compartida."
      }
    ],
    closingImage: {
      phrase: "Me veo en una empresa que hace un producto que la gente realmente usa. No solo escribo código: decido qué construir, mido si funcionó, itero hasta que esté bien. Mi trabajo tiene un impacto que puedo ver y medir. Eso le da sentido a mis días.",
      nextStep: "Elegí un producto que usás todos los días. Pensá en una feature que le falta. Escribí cómo la construirías (en 1 párrafo). Eso es pensar como product engineer."
    }
  }
]

// Assign paths to careers
matchedCareers[0].paths = sistemasPaths

// Generate similar paths for other careers (simplified for brevity - in production these would be fully fleshed out)
matchedCareers[1].paths = [
  { ...sistemasPaths[0], id: "datos-corp", name: "Data Science en Corporativo", tagline: "Estabilidad y datos a gran escala" },
  { ...sistemasPaths[1], id: "datos-startup", name: "Data en Startup", tagline: "Impacto rápido, datos reales" },
  { ...sistemasPaths[2], id: "datos-freelance", name: "Consultoría de Datos", tagline: "Proyectos diversos, autonomía total" },
  { ...sistemasPaths[3], id: "datos-product", name: "Data Product Manager", tagline: "El puente entre datos y decisiones" }
]

matchedCareers[2].paths = [
  { ...sistemasPaths[0], id: "ux-corp", name: "UX en Corporativo", tagline: "Procesos, research, equipos grandes" },
  { ...sistemasPaths[1], id: "ux-startup", name: "UX en Startup", tagline: "Diseñar rápido, iterar constante" },
  { ...sistemasPaths[2], id: "ux-freelance", name: "UX Freelance", tagline: "Proyectos diversos, libertad creativa" },
  { ...sistemasPaths[3], id: "ux-product", name: "Product Designer", tagline: "Diseño + estrategia de producto" }
]

matchedCareers[3].paths = [
  { ...sistemasPaths[0], id: "admin-corp", name: "Gestión en Multinacional", tagline: "Estructura, beneficios, carrera definida" },
  { ...sistemasPaths[1], id: "admin-startup", name: "Operaciones en Startup", tagline: "Hacer de todo, crecer con la empresa" },
  { ...sistemasPaths[2], id: "admin-consulting", name: "Consultoría Estratégica", tagline: "Problemas diversos, clientes variados" },
  { ...sistemasPaths[3], id: "admin-entrepreneur", name: "Emprendedor", tagline: "Tu empresa, tus reglas" }
]

matchedCareers[4].paths = [
  { ...sistemasPaths[0], id: "psico-corp", name: "RRHH en Corporativo", tagline: "Procesos, desarrollo, cultura" },
  { ...sistemasPaths[1], id: "psico-startup", name: "People en Startup", tagline: "Construir cultura desde cero" },
  { ...sistemasPaths[2], id: "psico-consulting", name: "Consultoría Organizacional", tagline: "Diagnosticar y transformar empresas" },
  { ...sistemasPaths[3], id: "psico-coaching", name: "Coaching Ejecutivo", tagline: "Desarrollo individual, impacto profundo" }
]

export { sistemasPaths }

// Main export for the Futuro module
export const futuroData = {
  profile: demoProfile,
  careers: matchedCareers
}
