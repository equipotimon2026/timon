export interface UniversityProgram {
  name: string
  duration: string | null
  modality: string | null
}

export interface University {
  id: string
  name: string
  type: string // "Pública" | "Privada"
  modality: string // "Presencial" | "Virtual" | "Híbrida"
  matchPercentage: number
  glimpse: string
  detail: {
    matchReasons: Array<{ positive: boolean; text: string }>
    matchSummary: string
    prestige: {
      ranking: string | null
      academicQuality: string | null
      employability: string | null
      marketReputation: string | null
    }
    values: {
      description: string | null
      distribution: Array<{ area: string; percentage: number }>
    }
    costs: {
      monthlyFee: string | null
      enrollmentFee: string | null
      annualEstimate: string | null
    }
    scholarships: Array<{ name: string; coverage: string; requirements: string }>
    programs: UniversityProgram[]
    location: {
      address: string | null
      zone: string | null
      transport: string | null
      campusInfo: string | null
    }
  }
}

export const universitiesData: University[] = [
  {
    id: "uba-sistemas",
    name: "Universidad de Buenos Aires",
    type: "Pública",
    modality: "Presencial",
    matchPercentage: 94,
    glimpse:
      "La UBA representa una opción excelente para tu perfil: combina prestigio, gratuidad y una formación rigurosa que encaja con tu orientación analítica.",
    detail: {
      matchReasons: [
        { positive: true, text: "Es pública y gratuita, alineado con tu preferencia económica" },
        { positive: true, text: "Tenés acceso directo por transporte público desde tu zona" },
        { positive: true, text: "La modalidad presencial favorece tu estilo de aprendizaje" },
        { positive: true, text: "Alto reconocimiento en el mercado laboral argentino e internacional" },
        { positive: false, text: "Requiere CBC previo que suma un año adicional" }
      ],
      matchSummary:
        "La UBA representa una opción excelente para tu perfil: combina prestigio, gratuidad y una formación rigurosa que encaja con tu orientación analítica.",
      prestige: {
        ranking: "#1 Argentina, Top 100 Latam",
        academicQuality: "Excelente - Reconocimiento internacional",
        employability: "92%",
        marketReputation: "95%"
      },
      values: {
        description:
          "Formación integral con énfasis en el pensamiento crítico y el compromiso social. La excelencia académica se combina con la responsabilidad ciudadana.",
        distribution: [
          { area: "Excelencia Académica", percentage: 40 },
          { area: "Pensamiento Crítico", percentage: 25 },
          { area: "Compromiso Social", percentage: 20 },
          { area: "Investigación", percentage: 15 }
        ]
      },
      costs: {
        monthlyFee: "Gratuita",
        enrollmentFee: "Sin costo",
        annualEstimate: "$360.000 - $600.000 (materiales y transporte)"
      },
      scholarships: [
        { name: "Beca Sarmiento", coverage: "100% materiales + estipendio mensual", requirements: "Promedio > 7 y situación económica vulnerable" },
        { name: "Beca de Ayuda Económica", coverage: "Estipendio mensual de $80.000", requirements: "Demostrar necesidad económica" },
        { name: "Programa Compromiso Educativo", coverage: "Tutorías + apoyo económico", requirements: "Primera generación universitaria" }
      ],
      programs: [
        { name: "Ingeniería en Sistemas", duration: "5 años + CBC (1 año)", modality: "Presencial" }
      ],
      location: {
        address: "Av. Paseo Colón 850, CABA",
        zone: "Microcentro / San Telmo",
        transport: "Línea E Belgrano, Línea B Alem, Metrobus del Bajo",
        campusInfo: "Campus urbano con laboratorios de última generación y biblioteca 24hs"
      }
    }
  },
  {
    id: "itba-sistemas",
    name: "Instituto Tecnológico de Buenos Aires",
    type: "Privada",
    modality: "Presencial",
    matchPercentage: 89,
    glimpse:
      "ITBA es ideal si buscás máxima conexión con la industria tech y podés acceder a becas. El nivel de exigencia es alto pero los resultados en empleabilidad lo justifican.",
    detail: {
      matchReasons: [
        { positive: true, text: "Especialización en tecnología alineada con tus intereses" },
        { positive: true, text: "Conexiones directas con empresas tech líderes" },
        { positive: true, text: "Recursos tecnológicos de vanguardia" },
        { positive: false, text: "Cuota elevada, aunque hay becas por mérito disponibles" },
        { positive: false, text: "Alta exigencia que demanda dedicación full-time" }
      ],
      matchSummary:
        "ITBA es ideal si buscás máxima conexión con la industria tech y podés acceder a becas. El nivel de exigencia es alto pero los resultados en empleabilidad lo justifican.",
      prestige: {
        ranking: "#1 Privada Técnica Argentina",
        academicQuality: "Excelente - Estándares internacionales",
        employability: "98%",
        marketReputation: "94%"
      },
      values: {
        description:
          "Formación de ingenieros innovadores con mentalidad emprendedora. El foco está en crear tecnología que transforme la sociedad.",
        distribution: [
          { area: "Innovación Tecnológica", percentage: 45 },
          { area: "Emprendedurismo", percentage: 25 },
          { area: "Rigor Académico", percentage: 20 },
          { area: "Liderazgo", percentage: 10 }
        ]
      },
      costs: {
        monthlyFee: "$450.000 - $550.000/mes",
        enrollmentFee: "$200.000",
        annualEstimate: "$5.400.000 - $6.600.000/año"
      },
      scholarships: [
        { name: "Beca Excelencia ITBA", coverage: "50% - 100% de la cuota", requirements: "Promedio secundario > 9 y examen de ingreso destacado" },
        { name: "Beca Talento Tech", coverage: "75% de la cuota", requirements: "Habilidades excepcionales en programación" },
        { name: "Beca Diversidad", coverage: "100% de la cuota", requirements: "Estudiantes de contextos subrepresentados" }
      ],
      programs: [
        { name: "Ingeniería en Sistemas", duration: "5 años", modality: "Presencial" }
      ],
      location: {
        address: "Av. Eduardo Madero 399, CABA",
        zone: "Puerto Madero",
        transport: "Línea B Alem, Línea E Retiro, Tren Mitre",
        campusInfo: "Campus moderno en Puerto Madero con FabLab y centro de innovación"
      }
    }
  },
  {
    id: "utn-sistemas",
    name: "Universidad Tecnológica Nacional",
    type: "Pública",
    modality: "Híbrido",
    matchPercentage: 87,
    glimpse:
      "La UTN es perfecta si querés trabajar mientras estudiás. Su orientación práctica te va a permitir aplicar lo que aprendés desde temprano.",
    detail: {
      matchReasons: [
        { positive: true, text: "Es pública y gratuita, ideal para tu situación" },
        { positive: true, text: "Modalidad híbrida permite combinar estudio con trabajo" },
        { positive: true, text: "Enfoque aplicado alineado con tu perfil pragmático" },
        { positive: true, text: "Horarios nocturnos disponibles" },
        { positive: false, text: "Menor foco en investigación que otras universidades" }
      ],
      matchSummary:
        "La UTN es perfecta si querés trabajar mientras estudiás. Su orientación práctica te va a permitir aplicar lo que aprendés desde temprano.",
      prestige: {
        ranking: "#3 Pública en Ingeniería",
        academicQuality: "Muy buena - Orientación industrial",
        employability: "90%",
        marketReputation: "88%"
      },
      values: {
        description:
          "Formación técnica de excelencia con fuerte vínculo con el sector productivo. El ingeniero UTN resuelve, no teoriza.",
        distribution: [
          { area: "Aplicación Práctica", percentage: 50 },
          { area: "Vinculación Industrial", percentage: 25 },
          { area: "Formación Técnica", percentage: 15 },
          { area: "Desarrollo Regional", percentage: 10 }
        ]
      },
      costs: {
        monthlyFee: "Gratuita",
        enrollmentFee: "Sin costo",
        annualEstimate: "$300.000 - $480.000 (materiales y transporte)"
      },
      scholarships: [
        { name: "Beca Manuel Belgrano", coverage: "Estipendio mensual de $100.000", requirements: "Carreras estratégicas + necesidad económica" },
        { name: "Beca Progresar", coverage: "$50.000/mes", requirements: "Menores de 24 años" },
        { name: "Beca UTN Inclusión", coverage: "Materiales + transporte", requirements: "Situación de vulnerabilidad" }
      ],
      programs: [
        { name: "Ingeniería en Sistemas", duration: "5 años", modality: "Híbrido" }
      ],
      location: {
        address: "Medrano 951, CABA",
        zone: "Almagro",
        transport: "Línea B Medrano, Colectivos 24, 26, 99",
        campusInfo: "Laboratorios de práctica, centro de empleo y biblioteca técnica"
      }
    }
  },
  {
    id: "uca-admin",
    name: "Universidad Católica Argentina",
    type: "Privada",
    modality: "Presencial",
    matchPercentage: 78,
    glimpse:
      "La UCA es una buena opción si valorás una formación integral y tenés afinidad con instituciones religiosas. La red de contactos es un diferencial importante.",
    detail: {
      matchReasons: [
        { positive: true, text: "Red profesional y networking empresarial sólido" },
        { positive: true, text: "Campus de primer nivel en Puerto Madero" },
        { positive: true, text: "Formación humanística complementa perfil técnico" },
        { positive: false, text: "Incluye formación en valores católicos obligatoria" },
        { positive: false, text: "Cuota elevada sin garantía de becas por mérito" }
      ],
      matchSummary:
        "La UCA es una buena opción si valorás una formación integral y tenés afinidad con instituciones religiosas. La red de contactos es un diferencial importante.",
      prestige: {
        ranking: "#4 Privada Argentina",
        academicQuality: "Muy buena - Acreditación AACSB",
        employability: "88%",
        marketReputation: "85%"
      },
      values: {
        description:
          "Formación basada en la doctrina social de la Iglesia, buscando profesionales íntegros que sirvan al bien común.",
        distribution: [
          { area: "Formación Humanística", percentage: 35 },
          { area: "Excelencia Académica", percentage: 30 },
          { area: "Valores Éticos", percentage: 25 },
          { area: "Servicio Social", percentage: 10 }
        ]
      },
      costs: {
        monthlyFee: "$380.000 - $480.000/mes",
        enrollmentFee: "$150.000",
        annualEstimate: "$4.800.000 - $6.000.000/año"
      },
      scholarships: [
        { name: "Beca Académica UCA", coverage: "25% - 75% de la cuota", requirements: "Promedio > 8 y examen destacado" },
        { name: "Beca Solidaria", coverage: "50% - 100% de la cuota", requirements: "Necesidad económica demostrable" },
        { name: "Beca Deportiva", coverage: "50% de la cuota", requirements: "Deportistas de alto rendimiento" }
      ],
      programs: [
        { name: "Administración de Empresas", duration: "4 años", modality: "Presencial" }
      ],
      location: {
        address: "Av. Alicia Moreau de Justo 1300, CABA",
        zone: "Puerto Madero",
        transport: "Línea B Alem, Metrobus del Bajo, Subte E",
        campusInfo: "Campus moderno con capilla, centro deportivo y residencias"
      }
    }
  },
  {
    id: "unlp-sistemas",
    name: "Universidad Nacional de La Plata",
    type: "Pública",
    modality: "Presencial",
    matchPercentage: 75,
    glimpse:
      "La UNLP es excelente académicamente pero la distancia es un factor a considerar. Ideal si estás dispuesto a mudarte y querés una experiencia universitaria tradicional.",
    detail: {
      matchReasons: [
        { positive: true, text: "Pública y gratuita con alta calidad académica" },
        { positive: true, text: "Segunda universidad pública más importante del país" },
        { positive: true, text: "Ambiente estudiantil activo y ciudad universitaria" },
        { positive: false, text: "Requiere mudanza o viaje diario a La Plata" },
        { positive: false, text: "Menor conexión directa con industria tech de CABA" }
      ],
      matchSummary:
        "La UNLP es excelente académicamente pero la distancia es un factor a considerar. Ideal si estás dispuesto a mudarte y querés una experiencia universitaria tradicional.",
      prestige: {
        ranking: "#2 Pública Argentina",
        academicQuality: "Excelente - Fuerte en investigación",
        employability: "85%",
        marketReputation: "88%"
      },
      values: {
        description:
          "Tradición reformista con compromiso social y excelencia científica. La universidad como motor de transformación.",
        distribution: [
          { area: "Investigación Científica", percentage: 40 },
          { area: "Compromiso Social", percentage: 25 },
          { area: "Extensión Universitaria", percentage: 20 },
          { area: "Formación Integral", percentage: 15 }
        ]
      },
      costs: {
        monthlyFee: "Gratuita",
        enrollmentFee: "Sin costo",
        annualEstimate: "$1.800.000 - $3.000.000 (si te mudás)"
      },
      scholarships: [
        { name: "Beca UNLP Bienestar", coverage: "Alojamiento + comedor + estipendio", requirements: "Estudiantes del interior" },
        { name: "Beca Progresar", coverage: "$50.000/mes", requirements: "Menores de 24 años" },
        { name: "Beca de Investigación", coverage: "Estipendio mensual", requirements: "Promedio > 7, estudiantes avanzados" }
      ],
      programs: [
        { name: "Ingeniería en Sistemas", duration: "5 años", modality: "Presencial" }
      ],
      location: {
        address: "Calle 50 esq. 120, La Plata",
        zone: "La Plata Centro",
        transport: "Tren Roca desde Constitución, colectivos desde CABA",
        campusInfo: "Ciudad universitaria integrada con bosque, complejo deportivo y radio"
      }
    }
  }
]
