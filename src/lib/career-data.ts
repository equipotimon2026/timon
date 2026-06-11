export interface ProfessionalPath {
  title: string
  summary: string
  dayToDay: { entorno: string; conQuien: string; horarios: string; autonomia: string }
  trajectory: Array<{ title: string; description: string; salaryRange: string }>
  lifestyleFit: string[]
  lifestyleChallenges: string[]
  reflectiveQuestion: string
}

export interface CareerAcademics {
  academicComposition: string
  subjectDistribution: Array<{ area: string; percentage: number; color: string }>
  keySkills: string[]
  alerts: { studyHoursLevel: "alta" | "media" | "baja"; durationYears: number | null; workStudyCapacity: string }
}

export interface Career {
  id: string
  name: string
  field: string
  matchPercentage: number
  programSearchGroup: string | null
  lifeGlimpse: string
  detail: {
    professionDescription: string
    matchSummary: string
    whyMatch: string[]
    challenges: string[]
    professionalPaths: ProfessionalPath[]
    academics: CareerAcademics
  }
}

export const careersData: Career[] = [
  {
    id: "ciencia-de-datos",
    name: "Licenciatura en Ciencia de Datos",
    field: "Tecnología",
    matchPercentage: 88,
    programSearchGroup: "Ciencia de Datos y Analítica",
    lifeGlimpse:
      "Días traduciendo preguntas confusas en modelos que predicen, explican y, a veces, sorprenden.",
    detail: {
      professionDescription:
        "Un/a científico/a de datos se dedica a convertir datos crudos en decisiones. No es alguien que 'estudia matemática': es quien diseña experimentos, construye modelos predictivos y traduce patrones en acciones concretas para una empresa, un hospital o un gobierno. Su trabajo es mitad detective, mitad ingeniero/a.",
      matchSummary:
        "Tu combinación de pensamiento analítico marcado y curiosidad por entender 'el porqué' detrás de las cosas encaja con una profesión que vive de formular preguntas y validarlas con evidencia. Te activás resolviendo problemas abiertos, y acá nunca se terminan.",
      whyMatch: [
        "Tu dominancia analítica (cuadrante A) se alinea con el núcleo cuantitativo de la disciplina.",
        "Disfrutás la ambigüedad: acá los problemas casi nunca vienen bien definidos.",
        "Tu interés Investigador (RIASEC I) coincide con el ciclo de hipótesis → datos → conclusión.",
        "Preferís autonomía sobre supervisión constante, algo común en estos equipos.",
      ],
      challenges: [
        "Gran parte del tiempo se va en limpiar datos, no en modelar: puede frustrar si esperás creatividad constante.",
        "Requiere comunicar resultados a gente no técnica, un músculo que hoy tenés menos desarrollado.",
      ],
      professionalPaths: [
        {
          title: "Machine Learning Engineer",
          summary:
            "Llevás modelos del notebook a producción: que funcionen rápido, a escala y sin romperse. Más ingeniería que estadística.",
          dayToDay: {
            entorno: "Empresa tech o producto, mayormente remoto o híbrido.",
            conQuien: "Equipos de software, product managers y otros ingenieros.",
            horarios: "Estructurados, con picos en lanzamientos.",
            autonomia: "Alta sobre el cómo, acotada por objetivos de producto.",
          },
          trajectory: [
            {
              title: "Junior ML Engineer",
              description: "Implementás y mantenés pipelines existentes.",
              salaryRange: "USD 1.200-2.000/mes",
            },
            {
              title: "ML Engineer",
              description: "Diseñás soluciones de punta a punta.",
              salaryRange: "USD 2.500-4.500/mes",
            },
            {
              title: "Staff/Lead",
              description: "Definís arquitectura y mentoreás equipos.",
              salaryRange: "USD 5.000-8.000+/mes",
            },
          ],
          lifestyleFit: [
            "El trabajo enfocado y de baja interrupción coincide con tu preferencia por concentración profunda.",
            "La autonomía técnica alta encaja con tu rechazo a la microgestión.",
          ],
          lifestyleChallenges: [
            "Los lanzamientos pueden romper tu preferencia por horarios predecibles.",
            "Exige coordinación constante con software, más social de lo que solés elegir.",
          ],
          reflectiveQuestion:
            "¿Te entusiasma más que un modelo TUYO corra en producción para millones, o eso te suena a 'plomería' lejos de la pregunta interesante?",
        },
        {
          title: "Data Analyst / BI",
          summary:
            "Respondés preguntas de negocio con datos: dashboards, métricas y reportes que mueven decisiones esta semana, no el año que viene.",
          dayToDay: {
            entorno: "Cualquier industria; muchas veces oficina o híbrido.",
            conQuien: "Áreas de negocio, marketing, finanzas.",
            horarios: "Estables, de oficina.",
            autonomia: "Media: agenda marcada por pedidos del negocio.",
          },
          trajectory: [
            {
              title: "Analista Jr.",
              description: "Armás reportes y consultas SQL.",
              salaryRange: "USD 800-1.500/mes",
            },
            {
              title: "Analista Sr. / BI",
              description: "Diseñás métricas y modelos de datos.",
              salaryRange: "USD 1.800-3.000/mes",
            },
            {
              title: "Analytics Lead",
              description: "Definís la estrategia de datos del área.",
              salaryRange: "USD 3.500-5.500/mes",
            },
          ],
          lifestyleFit: [
            "Horarios predecibles que respetan tu necesidad de estructura.",
            "Impacto visible y rápido, alineado con tu motivación por resultados concretos.",
          ],
          lifestyleChallenges: [
            "Mucho contacto con stakeholders puede drenarte.",
            "Problemas más cerrados: menos espacio para la exploración que disfrutás.",
          ],
          reflectiveQuestion:
            "¿Preferís ver el impacto de tu trabajo hoy mismo, aunque la pregunta sea menos profunda?",
        },
        {
          title: "Investigación / Data Scientist en I+D",
          summary:
            "Trabajás en la frontera: nuevos métodos, papers, prototipos. Menos plata a corto plazo, más profundidad intelectual.",
          dayToDay: {
            entorno: "Universidad, laboratorio o equipo de research.",
            conQuien: "Otros investigadores, a veces en soledad prolongada.",
            horarios: "Flexibles pero exigentes en deadlines de publicación.",
            autonomia: "Muy alta sobre qué y cómo investigar.",
          },
          trajectory: [
            {
              title: "Asistente de investigación",
              description: "Apoyás estudios y experimentos.",
              salaryRange: "USD 700-1.400/mes",
            },
            {
              title: "Data Scientist (R&D)",
              description: "Liderás líneas de investigación aplicada.",
              salaryRange: "USD 2.000-4.000/mes",
            },
            {
              title: "Investigador/a Senior",
              description: "Definís agenda y conseguís financiamiento.",
              salaryRange: "USD 4.000-7.000/mes",
            },
          ],
          lifestyleFit: [
            "Autonomía intelectual máxima, justo lo que más te activa.",
            "Trabajo profundo y solitario compatible con tu perfil introspectivo.",
          ],
          lifestyleChallenges: [
            "Retorno económico más lento que en industria.",
            "La presión por publicar puede volverse competitiva y aislante.",
          ],
          reflectiveQuestion:
            "¿Estarías dispuesto/a a ganar menos por unos años a cambio de trabajar en preguntas que casi nadie resolvió?",
        },
        {
          title: "Data Product Manager",
          summary:
            "Hacés de puente entre datos y producto: decidís qué construir, priorizás y traducís entre técnicos y negocio.",
          dayToDay: {
            entorno: "Empresa de producto, muy colaborativo.",
            conQuien: "Ingeniería, diseño, negocio, clientes.",
            horarios: "De oficina con muchas reuniones.",
            autonomia: "Alta en decisiones, baja en agenda.",
          },
          trajectory: [
            {
              title: "Associate PM",
              description: "Apoyás la gestión de features de datos.",
              salaryRange: "USD 1.500-2.500/mes",
            },
            {
              title: "Data PM",
              description: "Sos dueño/a de un producto de datos.",
              salaryRange: "USD 3.000-5.000/mes",
            },
            {
              title: "Group PM / Head",
              description: "Liderás la visión de varios productos.",
              salaryRange: "USD 5.500-9.000+/mes",
            },
          ],
          lifestyleFit: [
            "Variedad constante que evita el aburrimiento que te drena.",
            "Influencia sobre la dirección, no solo la ejecución.",
          ],
          lifestyleChallenges: [
            "Altísima carga social y de reuniones, opuesta a tu preferencia por foco.",
            "Menos trabajo técnico profundo, que es lo que hoy más disfrutás.",
          ],
          reflectiveQuestion:
            "¿Te llena más decidir QUÉ se construye y por qué, o construirlo con tus propias manos?",
        },
      ],
      academics: {
        academicComposition:
          "Estudiar Ciencia de Datos no es 'ser' científico/a de datos: es atravesar varios años de matemática dura (álgebra, cálculo, probabilidad) antes de tocar los modelos 'divertidos'. Requiere práctica diaria de programación y tolerancia a frustrarte con código que no corre. La curva es empinada los primeros dos años y se vuelve más aplicada después.",
        subjectDistribution: [
          { area: "Matemática y Estadística", percentage: 35, color: "indigo" },
          { area: "Programación y Computación", percentage: 30, color: "violet" },
          { area: "Machine Learning y Modelos", percentage: 20, color: "emerald" },
          { area: "Dominio y Negocio", percentage: 10, color: "amber" },
          { area: "Comunicación y Ética", percentage: 5, color: "sky" },
        ],
        keySkills: [
          "Pensamiento estadístico y razonamiento con incertidumbre",
          "Programación (Python, SQL) y manejo de datos a escala",
          "Construcción y evaluación de modelos predictivos",
          "Comunicación de hallazgos a audiencias no técnicas",
        ],
        alerts: {
          studyHoursLevel: "alta",
          durationYears: 5,
          workStudyCapacity: "part_time_posible_mas_sobre_el_final",
        },
      },
    },
  },
]
