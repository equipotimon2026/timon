export interface Career {
  id: number
  name: string
  field: string
  matchPercentage: number
  definition: {
    description: string
    purpose: string
  }
  competencies: Array<{
    title: string
    description: string
  }>
  academic: {
    complexity: string
    weeklyHours: number
    presentialPercentage: number
    autonomousPercentage: number
    logicIntensity: string
    theoreticalPercentage: number
    practicalPercentage: number
    dropoutRate: number
    filterSubjects: Array<{
      name: string
      skill: string
    }>
    workStudyBalance: string
    studyPlan: {
      description: string
      distribution: Array<{
        area: string
        percentage: number
        color: string
      }>
    }
  }
  compatibility: {
    mentalArchitecture: {
      status: "ÓPTIMO" | "ALERTA" | "PELIGRO"
      description: string
    }
    entryBarrier: {
      status: "ÓPTIMO" | "ALERTA" | "PELIGRO"
      description: string
    }
    socialBattery: {
      status: "ÓPTIMO" | "ALERTA" | "PELIGRO"
      description: string
    }
    lifestyle: {
      status: "ÓPTIMO" | "ALERTA" | "PELIGRO"
      description: string
    }
    work: {
      status: "ÓPTIMO" | "ALERTA" | "PELIGRO"
      description: string
    }
  }
  operative: {
    dailyLoad: string
    strategicIntervention: string
    environment: string
    uncertaintyLevel: string
  }
  market: {
    jobOutlets: Array<{
      position: string
      salaryJunior: string
      salarySemiSenior: string
      salarySenior: string
    }>
    automationRisk: number
    employabilitySafety: string
    salaryScalability: string
    saturationIndex: string
    geographicFlexibility: string
    specializations: Array<{
      name: string
      niche: string
      demand: "Alta" | "Media" | "Baja"
    }>
  }
}

export const careersData: Career[] = [
  {
    id: 1,
    name: "Ingeniería en Sistemas de Información",
    field: "Tecnología",
    matchPercentage: 87,
    definition: {
      description: "Esta profesión se define como el estudio y aplicación de principios computacionales y algorítmicos para gestionar sistemas de información y arquitecturas de software empresarial.",
      purpose: "La función indispensable de este profesional es resolver la ineficiencia en el procesamiento de datos y la automatización de procesos organizacionales."
    },
    competencies: [
      { title: "Competencia 1", description: "Diseño y desarrollo de arquitecturas de software escalables" },
      { title: "Competencia 2", description: "Análisis de requerimientos y modelado de sistemas complejos" },
      { title: "Competencia 3", description: "Gestión de bases de datos y estructuras de información" }
    ],
    academic: {
      complexity: "Altamente Abstracto",
      weeklyHours: 45,
      presentialPercentage: 60,
      autonomousPercentage: 40,
      logicIntensity: "Razonamiento matemático avanzado y pensamiento algorítmico",
      theoreticalPercentage: 40,
      practicalPercentage: 60,
      dropoutRate: 35,
      filterSubjects: [
        { name: "Análisis Matemático II", skill: "abstracción y modelado formal" },
        { name: "Algoritmos y Estructuras de Datos", skill: "pensamiento computacional" }
      ],
      workStudyBalance: "Moderado - Permite trabajo part-time a partir del 3er año",
      studyPlan: {
        description: "El plan de estudios está estructurado para desarrollar competencias técnicas sólidas con una base matemática fuerte. La práctica técnica domina el curriculum a través de laboratorios, proyectos integradores y trabajos prácticos que simulan entornos reales de desarrollo. La teoría de sistemas proporciona los fundamentos arquitectónicos necesarios para diseñar soluciones escalables.",
        distribution: [
          { area: "Práctica Técnica", percentage: 45, color: "bg-slate-800" },
          { area: "Matemática y Algoritmia", percentage: 25, color: "bg-slate-600" },
          { area: "Teoría de Sistemas", percentage: 15, color: "bg-slate-400" },
          { area: "Inglés Técnico", percentage: 8, color: "bg-slate-300" },
          { area: "Gestión de Proyectos", percentage: 7, color: "bg-slate-200" }
        ]
      }
    },
    compatibility: {
      mentalArchitecture: {
        status: "ÓPTIMO",
        description: "Los datos indican que poseés un alto desempeño en la estructuración de procesos lógicos, lo cual es el requisito fundacional para operar en esta disciplina."
      },
      entryBarrier: {
        status: "ÓPTIMO",
        description: "Tu perfil muestra alta resistencia al estudio asincrónico, lo que mitiga el riesgo de deserción en los nodos teóricos iniciales."
      },
      socialBattery: {
        status: "ALERTA",
        description: "La carrera exige trabajo colaborativo en equipos, lo cual requiere adaptación dado tu tendencia hacia el trabajo individual."
      },
      lifestyle: {
        status: "ÓPTIMO",
        description: "El entorno flexible y la posibilidad de trabajo remoto se alinean con tus expectativas de autonomía y balance vida-trabajo."
      },
      work: {
        status: "ÓPTIMO",
        description: "Deriva en un trabajo con las características de resolución de problemas y creatividad técnica que indicaste como preferencias."
      }
    },
    operative: {
      dailyLoad: "La rutina diaria no consiste en programar todo el día. La mayor parte de la jornada se destina a reuniones de coordinación, revisión de código, documentación técnica y debugging.",
      strategicIntervention: "La fracción minoritaria se reserva para el diseño de la arquitectura del software y la resolución de problemas técnicos complejos.",
      environment: "Infraestructura corporativa con esquema híbrido o 100% remoto",
      uncertaintyLevel: "Entorno expuesto a cambios frecuentes de requerimientos y resolución de bugs inesperados"
    },
    market: {
      jobOutlets: [
        { position: "Desarrollador Full Stack", salaryJunior: "$800K - $1.2M", salarySemiSenior: "$1.5M - $2.5M", salarySenior: "$3M - $5M" },
        { position: "Arquitecto de Software", salaryJunior: "$1M - $1.5M", salarySemiSenior: "$2M - $3.5M", salarySenior: "$4M - $7M" },
        { position: "DevOps Engineer", salaryJunior: "$900K - $1.3M", salarySemiSenior: "$1.8M - $3M", salarySenior: "$3.5M - $6M" },
        { position: "Data Engineer", salaryJunior: "$850K - $1.2M", salarySemiSenior: "$1.6M - $2.8M", salarySenior: "$3.2M - $5.5M" },
        { position: "Tech Lead", salaryJunior: "$1.2M - $1.8M", salarySemiSenior: "$2.5M - $4M", salarySenior: "$5M - $8M" }
      ],
      automationRisk: 25,
      employabilitySafety: "Para evitar la obsolescencia, el perfil debe complementar la base técnica con capacidad de diseño de sistemas y liderazgo técnico.",
      salaryScalability: "El diferencial de compensación entre Junior y Senior representa un multiplicador de 4x a 6x.",
      saturationIndex: "Déficit crítico de talento especializado en áreas como IA, ciberseguridad y cloud computing.",
      geographicFlexibility: "Homologación directa sin fricción en la mayoría de mercados internacionales.",
      specializations: [
        { name: "Inteligencia Artificial", niche: "Machine Learning y Deep Learning", demand: "Alta" },
        { name: "Ciberseguridad", niche: "Protección de infraestructuras digitales", demand: "Alta" },
        { name: "Cloud Computing", niche: "Arquitecturas serverless y microservicios", demand: "Alta" }
      ]
    }
  },
  {
    id: 2,
    name: "Licenciatura en Administración de Empresas",
    field: "Negocios",
    matchPercentage: 85,
    definition: {
      description: "Esta profesión se define como el estudio y aplicación de principios de gestión organizacional y estrategia empresarial para gestionar recursos y procesos corporativos.",
      purpose: "La función indispensable de este profesional es resolver la ineficiencia en la asignación de recursos y la coordinación de equipos de trabajo."
    },
    competencies: [
      { title: "Competencia 1", description: "Planificación estratégica y toma de decisiones basada en datos" },
      { title: "Competencia 2", description: "Gestión de equipos y liderazgo organizacional" },
      { title: "Competencia 3", description: "Análisis financiero y control de gestión" }
    ],
    academic: {
      complexity: "Abstracto",
      weeklyHours: 35,
      presentialPercentage: 70,
      autonomousPercentage: 30,
      logicIntensity: "Análisis cuantitativo moderado y razonamiento estratégico",
      theoreticalPercentage: 50,
      practicalPercentage: 50,
      dropoutRate: 25,
      filterSubjects: [
        { name: "Matemática Financiera", skill: "cálculo aplicado a decisiones económicas" },
        { name: "Contabilidad", skill: "análisis e interpretación de estados financieros" }
      ],
      workStudyBalance: "Alto - Compatible con trabajo part-time desde el inicio",
      studyPlan: {
        description: "El plan de estudios combina teoría económica con aplicación práctica en casos de negocio reales. Se enfatiza el desarrollo de habilidades blandas a través de simulaciones, debates y presentaciones. La formación financiera y contable ocupa un espacio significativo para construir la base analítica necesaria en la toma de decisiones empresariales.",
        distribution: [
          { area: "Gestión y Estrategia", percentage: 35, color: "bg-slate-800" },
          { area: "Finanzas y Contabilidad", percentage: 25, color: "bg-slate-600" },
          { area: "Marketing y Comercial", percentage: 20, color: "bg-slate-400" },
          { area: "Recursos Humanos", percentage: 12, color: "bg-slate-300" },
          { area: "Derecho Empresarial", percentage: 8, color: "bg-slate-200" }
        ]
      }
    },
    compatibility: {
      mentalArchitecture: {
        status: "ÓPTIMO",
        description: "Tu capacidad analítica y visión sistémica son compatibles con el perfil de gestión empresarial."
      },
      entryBarrier: {
        status: "ÓPTIMO",
        description: "La carga académica moderada se ajusta a tu estilo de aprendizaje."
      },
      socialBattery: {
        status: "ÓPTIMO",
        description: "La carrera demanda alta interacción social, alineada con tu preferencia por el trabajo colaborativo."
      },
      lifestyle: {
        status: "ALERTA",
        description: "El entorno corporativo tradicional puede requerir ajustes respecto a tus expectativas de flexibilidad."
      },
      work: {
        status: "ÓPTIMO",
        description: "Ofrece variedad de tareas y desafíos estratégicos acordes a tus intereses declarados."
      }
    },
    operative: {
      dailyLoad: "La rutina diaria consiste principalmente en reuniones de coordinación, análisis de reportes, gestión de emails y seguimiento de proyectos.",
      strategicIntervention: "La fracción minoritaria se reserva para la formulación de estrategias y negociaciones de alto nivel.",
      environment: "Infraestructura corporativa con presencialidad parcial o total",
      uncertaintyLevel: "Entorno moderadamente estructurado con variabilidad según el área de especialización"
    },
    market: {
      jobOutlets: [
        { position: "Analista de Negocios", salaryJunior: "$600K - $900K", salarySemiSenior: "$1.2M - $1.8M", salarySenior: "$2M - $3.5M" },
        { position: "Product Manager", salaryJunior: "$800K - $1.2M", salarySemiSenior: "$1.5M - $2.5M", salarySenior: "$3M - $5M" },
        { position: "Consultor de Gestión", salaryJunior: "$700K - $1M", salarySemiSenior: "$1.3M - $2.2M", salarySenior: "$2.5M - $4.5M" },
        { position: "Gerente de Operaciones", salaryJunior: "$750K - $1.1M", salarySemiSenior: "$1.4M - $2.3M", salarySenior: "$2.8M - $5M" },
        { position: "Director Comercial", salaryJunior: "$900K - $1.3M", salarySemiSenior: "$1.8M - $3M", salarySenior: "$4M - $7M" }
      ],
      automationRisk: 35,
      employabilitySafety: "Para evitar la obsolescencia, el perfil debe desarrollar habilidades de liderazgo y pensamiento estratégico.",
      salaryScalability: "El diferencial de compensación entre Junior y Senior representa un multiplicador de 3x a 5x.",
      saturationIndex: "Sobreoferta de graduados básicos, alta demanda de perfiles especializados.",
      geographicFlexibility: "Requiere adaptación al marco regulatorio local en cada jurisdicción.",
      specializations: [
        { name: "Marketing Digital", niche: "Growth y performance marketing", demand: "Alta" },
        { name: "Finanzas Corporativas", niche: "M&A y valuación de empresas", demand: "Media" },
        { name: "Supply Chain", niche: "Logística y operaciones globales", demand: "Alta" }
      ]
    }
  },
  {
    id: 3,
    name: "Diseño de Experiencia de Usuario (UX)",
    field: "Diseño Digital",
    matchPercentage: 83,
    definition: {
      description: "Esta profesión se define como el estudio y aplicación de principios de psicología cognitiva y diseño centrado en el humano para gestionar la interacción usuario-producto.",
      purpose: "La función indispensable de este profesional es resolver la fricción en la interacción entre usuarios y productos digitales."
    },
    competencies: [
      { title: "Competencia 1", description: "Investigación de usuarios y análisis de comportamiento" },
      { title: "Competencia 2", description: "Prototipado y diseño de interfaces intuitivas" },
      { title: "Competencia 3", description: "Testing de usabilidad y optimización de experiencias" }
    ],
    academic: {
      complexity: "Concreto a Abstracto",
      weeklyHours: 30,
      presentialPercentage: 50,
      autonomousPercentage: 50,
      logicIntensity: "Pensamiento visual y empatía con usuarios",
      theoreticalPercentage: 30,
      practicalPercentage: 70,
      dropoutRate: 15,
      filterSubjects: [
        { name: "Psicología del Usuario", skill: "comprensión de modelos mentales" },
        { name: "Diseño de Interacción", skill: "traducción de necesidades a interfaces" }
      ],
      workStudyBalance: "Alto - Muy compatible con freelance y trabajo part-time",
      studyPlan: {
        description: "El plan de estudios tiene un enfoque altamente práctico orientado a la construcción de portfolio. Los proyectos reales con usuarios constituyen el eje central del aprendizaje. La investigación de usuarios y el prototipado ocupan la mayor parte del tiempo, complementados con fundamentos de psicología cognitiva y herramientas digitales.",
        distribution: [
          { area: "Diseño e Interacción", percentage: 40, color: "bg-slate-800" },
          { area: "Investigación de Usuarios", percentage: 25, color: "bg-slate-600" },
          { area: "Prototipado y Testing", percentage: 20, color: "bg-slate-400" },
          { area: "Psicología Cognitiva", percentage: 10, color: "bg-slate-300" },
          { area: "Herramientas Digitales", percentage: 5, color: "bg-slate-200" }
        ]
      }
    },
    compatibility: {
      mentalArchitecture: {
        status: "ÓPTIMO",
        description: "Tu pensamiento visual y capacidad empática son ideales para el diseño centrado en el usuario."
      },
      entryBarrier: {
        status: "ÓPTIMO",
        description: "La curva de aprendizaje es accesible y orientada a proyectos prácticos."
      },
      socialBattery: {
        status: "ÓPTIMO",
        description: "El trabajo implica colaboración moderada con balance de tiempo individual para diseño."
      },
      lifestyle: {
        status: "ÓPTIMO",
        description: "Alta flexibilidad horaria y posibilidad de trabajo remoto completo."
      },
      work: {
        status: "ÓPTIMO",
        description: "Combina creatividad con resolución de problemas, alineado con tus preferencias."
      }
    },
    operative: {
      dailyLoad: "La rutina diaria consiste en análisis de datos de usuarios, iteración de diseños, documentación de patrones y coordinación con desarrollo.",
      strategicIntervention: "La fracción minoritaria se reserva para investigación profunda de usuarios y definición de estrategias de experiencia.",
      environment: "Trabajo remoto o híbrido en equipos multidisciplinarios",
      uncertaintyLevel: "Entorno dinámico con iteraciones constantes basadas en feedback"
    },
    market: {
      jobOutlets: [
        { position: "UX Designer", salaryJunior: "$700K - $1M", salarySemiSenior: "$1.3M - $2M", salarySenior: "$2.5M - $4M" },
        { position: "UX Researcher", salaryJunior: "$650K - $950K", salarySemiSenior: "$1.2M - $1.8M", salarySenior: "$2.2M - $3.5M" },
        { position: "Product Designer", salaryJunior: "$800K - $1.2M", salarySemiSenior: "$1.5M - $2.5M", salarySenior: "$3M - $5M" },
        { position: "Design Lead", salaryJunior: "$1M - $1.5M", salarySemiSenior: "$2M - $3M", salarySenior: "$3.5M - $6M" },
        { position: "Head of Design", salaryJunior: "$1.2M - $1.8M", salarySemiSenior: "$2.5M - $4M", salarySenior: "$5M - $8M" }
      ],
      automationRisk: 20,
      employabilitySafety: "Para evitar la obsolescencia, el perfil debe dominar herramientas de IA generativa y metodologías de research avanzadas.",
      salaryScalability: "El diferencial de compensación entre Junior y Senior representa un multiplicador de 4x.",
      saturationIndex: "Demanda sostenida con crecimiento en productos digitales y servicios.",
      geographicFlexibility: "Homologación directa - portfolio es la credencial universal.",
      specializations: [
        { name: "UX Research", niche: "Investigación cualitativa y cuantitativa", demand: "Alta" },
        { name: "Service Design", niche: "Diseño de servicios end-to-end", demand: "Media" },
        { name: "Voice UX", niche: "Interfaces conversacionales", demand: "Alta" }
      ]
    }
  },
  {
    id: 4,
    name: "Psicología Organizacional",
    field: "Ciencias Sociales",
    matchPercentage: 79,
    definition: {
      description: "Esta profesión se define como el estudio y aplicación de principios psicológicos y conductuales para gestionar el bienestar y rendimiento humano en contextos laborales.",
      purpose: "La función indispensable de este profesional es resolver los problemas de dinámica grupal, motivación y salud mental en organizaciones."
    },
    competencies: [
      { title: "Competencia 1", description: "Evaluación psicométrica y diagnóstico organizacional" },
      { title: "Competencia 2", description: "Diseño de programas de desarrollo y bienestar" },
      { title: "Competencia 3", description: "Mediación de conflictos y coaching ejecutivo" }
    ],
    academic: {
      complexity: "Abstracto",
      weeklyHours: 38,
      presentialPercentage: 65,
      autonomousPercentage: 35,
      logicIntensity: "Asimilación de textos teóricos y análisis cualitativo",
      theoreticalPercentage: 60,
      practicalPercentage: 40,
      dropoutRate: 20,
      filterSubjects: [
        { name: "Estadística Aplicada", skill: "análisis de datos psicométricos" },
        { name: "Psicopatología", skill: "identificación de patrones conductuales" }
      ],
      workStudyBalance: "Moderado - Compatible con prácticas supervisadas",
      studyPlan: {
        description: "El plan de estudios equilibra la formación teórica en psicología clásica con aplicaciones organizacionales modernas. Las prácticas supervisadas son obligatorias y ocupan un lugar central a partir del tercer año. Se desarrollan competencias en evaluación psicométrica, intervención grupal y consultoría de procesos humanos.",
        distribution: [
          { area: "Psicología General", percentage: 30, color: "bg-slate-800" },
          { area: "Comportamiento Organizacional", percentage: 25, color: "bg-slate-600" },
          { area: "Metodología e Investigación", percentage: 20, color: "bg-slate-400" },
          { area: "Prácticas Supervisadas", percentage: 15, color: "bg-slate-300" },
          { area: "Estadística y Psicometría", percentage: 10, color: "bg-slate-200" }
        ]
      }
    },
    compatibility: {
      mentalArchitecture: {
        status: "ÓPTIMO",
        description: "Tu capacidad de lectura emocional y análisis conductual son fortalezas clave para esta disciplina."
      },
      entryBarrier: {
        status: "ALERTA",
        description: "La carga teórica inicial requiere dedicación sostenida a lectura académica."
      },
      socialBattery: {
        status: "ÓPTIMO",
        description: "La carrera demanda alta interacción humana, alineada con tu perfil."
      },
      lifestyle: {
        status: "ALERTA",
        description: "Puede requerir horarios variables según el tipo de intervención organizacional."
      },
      work: {
        status: "ÓPTIMO",
        description: "Ofrece impacto directo en el bienestar de personas, acorde a tus valores."
      }
    },
    operative: {
      dailyLoad: "La rutina diaria consiste en entrevistas, análisis de evaluaciones, redacción de informes y coordinación con RRHH.",
      strategicIntervention: "La fracción minoritaria se reserva para diseño de intervenciones y coaching de alta gerencia.",
      environment: "Consultoría o departamento interno de RRHH",
      uncertaintyLevel: "Entorno variable según la cultura organizacional del cliente"
    },
    market: {
      jobOutlets: [
        { position: "HR Business Partner", salaryJunior: "$600K - $900K", salarySemiSenior: "$1.1M - $1.8M", salarySenior: "$2M - $3.5M" },
        { position: "Talent Acquisition", salaryJunior: "$550K - $800K", salarySemiSenior: "$1M - $1.6M", salarySenior: "$1.8M - $3M" },
        { position: "Consultor Organizacional", salaryJunior: "$650K - $950K", salarySemiSenior: "$1.2M - $2M", salarySenior: "$2.5M - $4M" },
        { position: "Coach Ejecutivo", salaryJunior: "$700K - $1M", salarySemiSenior: "$1.3M - $2.2M", salarySenior: "$2.8M - $5M" },
        { position: "Director de People", salaryJunior: "$800K - $1.2M", salarySemiSenior: "$1.6M - $2.8M", salarySenior: "$3.5M - $6M" }
      ],
      automationRisk: 15,
      employabilitySafety: "Para evitar la obsolescencia, el perfil debe desarrollar competencias en people analytics y gestión del cambio.",
      salaryScalability: "El diferencial de compensación entre Junior y Senior representa un multiplicador de 3x a 5x.",
      saturationIndex: "Demanda creciente por foco en bienestar y cultura organizacional post-pandemia.",
      geographicFlexibility: "Requiere habilitación profesional local en cada jurisdicción.",
      specializations: [
        { name: "People Analytics", niche: "Métricas y datos de capital humano", demand: "Alta" },
        { name: "Change Management", niche: "Gestión de transformaciones organizacionales", demand: "Alta" },
        { name: "Executive Coaching", niche: "Desarrollo de liderazgo C-level", demand: "Media" }
      ]
    }
  },
  {
    id: 5,
    name: "Ciencia de Datos",
    field: "Tecnología & Análisis",
    matchPercentage: 76,
    definition: {
      description: "Esta profesión se define como el estudio y aplicación de métodos estadísticos, matemáticos y computacionales para gestionar la extracción de conocimiento desde grandes volúmenes de datos.",
      purpose: "La función indispensable de este profesional es resolver la incapacidad de las organizaciones para convertir datos en decisiones estratégicas."
    },
    competencies: [
      { title: "Competencia 1", description: "Modelado estadístico y machine learning" },
      { title: "Competencia 2", description: "Visualización de datos y storytelling analítico" },
      { title: "Competencia 3", description: "Ingeniería de features y optimización de modelos" }
    ],
    academic: {
      complexity: "Altamente Abstracto",
      weeklyHours: 42,
      presentialPercentage: 55,
      autonomousPercentage: 45,
      logicIntensity: "Razonamiento matemático avanzado y programación estadística",
      theoreticalPercentage: 45,
      practicalPercentage: 55,
      dropoutRate: 30,
      filterSubjects: [
        { name: "Álgebra Lineal", skill: "manipulación de estructuras matemáticas abstractas" },
        { name: "Probabilidad y Estadística", skill: "razonamiento bajo incertidumbre" }
      ],
      workStudyBalance: "Moderado - Permite trabajo part-time en proyectos de análisis",
      studyPlan: {
        description: "El plan de estudios tiene una base matemática y estadística fuerte como cimiento obligatorio. La programación aplicada a datos ocupa un espacio central, con énfasis en Python, R y SQL. Los proyectos de análisis end-to-end permiten integrar todas las competencias en escenarios reales de negocio.",
        distribution: [
          { area: "Matemática y Estadística", percentage: 35, color: "bg-slate-800" },
          { area: "Programación y ML", percentage: 30, color: "bg-slate-600" },
          { area: "Análisis de Negocio", percentage: 20, color: "bg-slate-400" },
          { area: "Visualización de Datos", percentage: 10, color: "bg-slate-300" },
          { area: "Comunicación y Storytelling", percentage: 5, color: "bg-slate-200" }
        ]
      }
    },
    compatibility: {
      mentalArchitecture: {
        status: "ALERTA",
        description: "Tu perfil muestra capacidad analítica, pero puede requerir refuerzo en fundamentos matemáticos avanzados."
      },
      entryBarrier: {
        status: "ALERTA",
        description: "La curva de aprendizaje es pronunciada en los primeros años."
      },
      socialBattery: {
        status: "ÓPTIMO",
        description: "El trabajo es mayormente individual con colaboración puntual, alineado con tu preferencia."
      },
      lifestyle: {
        status: "ÓPTIMO",
        description: "Alta flexibilidad y demanda remota global."
      },
      work: {
        status: "ÓPTIMO",
        description: "Combina resolución de puzzles con impacto en decisiones de negocio."
      }
    },
    operative: {
      dailyLoad: "La rutina diaria consiste en limpieza de datos, experimentación con modelos, documentación y presentación de resultados a stakeholders.",
      strategicIntervention: "La fracción minoritaria se reserva para el diseño de estrategias de datos y modelos de alto impacto.",
      environment: "Remoto o híbrido en equipos de analytics o producto",
      uncertaintyLevel: "Entorno de alta incertidumbre con experimentación continua"
    },
    market: {
      jobOutlets: [
        { position: "Data Analyst", salaryJunior: "$650K - $950K", salarySemiSenior: "$1.2M - $1.9M", salarySenior: "$2.2M - $3.5M" },
        { position: "Data Scientist", salaryJunior: "$800K - $1.2M", salarySemiSenior: "$1.5M - $2.5M", salarySenior: "$3M - $5M" },
        { position: "ML Engineer", salaryJunior: "$900K - $1.3M", salarySemiSenior: "$1.8M - $3M", salarySenior: "$3.5M - $6M" },
        { position: "Analytics Manager", salaryJunior: "$1M - $1.5M", salarySemiSenior: "$2M - $3.2M", salarySenior: "$4M - $6.5M" },
        { position: "Chief Data Officer", salaryJunior: "$1.5M - $2M", salarySemiSenior: "$3M - $5M", salarySenior: "$6M - $10M" }
      ],
      automationRisk: 20,
      employabilitySafety: "Para evitar la obsolescencia, el perfil debe evolucionar hacia MLOps y diseño de sistemas de IA.",
      salaryScalability: "El diferencial de compensación entre Junior y Senior representa un multiplicador de 5x a 7x.",
      saturationIndex: "Déficit de talento senior, saturación en perfiles junior sin especialización.",
      geographicFlexibility: "Homologación directa - las habilidades técnicas son universales.",
      specializations: [
        { name: "Deep Learning", niche: "Redes neuronales y visión computacional", demand: "Alta" },
        { name: "NLP", niche: "Procesamiento de lenguaje natural", demand: "Alta" },
        { name: "MLOps", niche: "Productivización de modelos de ML", demand: "Alta" }
      ]
    }
  }
]
