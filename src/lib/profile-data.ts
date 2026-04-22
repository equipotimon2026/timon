export interface Profile {
  opening: {
    welcomeText: string
    purposeStatement: string
  }
  methodology: {
    intro: string
    dimensions: Array<{
      name: string
      description: string
    }>
    clarification: string
  }
  whatWeSee: {
    mentalArchitecture: {
      intro: string
      traits: Array<{
        name: string
        description: string
        level: number
        levelLabel: string
        isTension?: boolean
      }>
    }
    energyProfile: {
      intro: string
      activates: string[]
      drains: string[]
    }
    interests: {
      intro: string
      areas: Array<{
        name: string
        score: number
        insight: string
        levelLabel: string
      }>
    }
  }
  notAttracted: {
    intro: string
    areas: Array<{
      name: string
      description: string
      inferenceStrength: "alta" | "media" | "tentativa"
    }>
    reframe: string
  }
  lifeStyle: {
    axes: Array<{
      leftLabel: string
      rightLabel: string
      value: number
      interpretation: string
    }>
  }
  summary: {
    centralPhrase: string
    elaboration: string
    shareableTag: string
  }
}

export const profileData: Profile = {
  opening: {
    welcomeText: "Antes de mostrarte resultados, queremos que entiendas el punto de partida. Esto no es un test de personalidad. No hay respuestas buenas ni malas. Lo que hicimos fue escucharte, observar cómo pensás, qué te moviliza, y qué tipo de futuro podría encajar con quien sos hoy.",
    purposeStatement: "El objetivo de este proceso no es decirte qué hacer con tu vida. Es darte información clara y honesta sobre vos mismo, para que puedas tomar decisiones con más consciencia."
  },
  methodology: {
    intro: "Completaste varias actividades que nos permitieron ver cómo funcionás. No medimos inteligencia ni capacidad. Medimos patrones, preferencias y tendencias.",
    dimensions: [
      {
        name: "Arquitectura mental",
        description: "Cómo procesás información, resolvés problemas y estructurás tus ideas. No es lo que sabés, sino cómo lo pensás."
      },
      {
        name: "Perfil de energía",
        description: "Qué tipo de actividades te cargan las pilas y cuáles te desgastan. Esto define qué caminos podés sostener a largo plazo."
      },
      {
        name: "Mapeo de intereses",
        description: "Hacia dónde se inclina tu atención naturalmente. No lo que 'deberías' querer, sino lo que genuinamente te atrae."
      },
      {
        name: "Estilo de vida buscado",
        description: "Qué tipo de día a día te imaginás. Porque elegir carrera es también elegir cómo vas a pasar tus días."
      }
    ],
    clarification: "Estos datos no definen tu valor ni tus límites. Son una foto de cómo funcionás hoy, y pueden cambiar con el tiempo."
  },
  whatWeSee: {
    mentalArchitecture: {
      intro: "Tu forma de pensar tiene características particulares. No son mejores ni peores que otras, pero sí influyen en qué tipo de desafíos vas a disfrutar resolver.",
      traits: [
        {
          name: "Pensamiento sistemático",
          description: "Tendés a ver las cosas como sistemas con partes interconectadas. Cuando te enfrentás a un problema, buscás entender la estructura subyacente antes de actuar.",
          level: 85,
          levelLabel: "Muy marcado"
        },
        {
          name: "Orientación analítica",
          description: "Tu primer impulso es descomponer. Frente a algo complejo, lo dividís en partes más manejables para entender cada una antes de ver el todo.",
          level: 78,
          levelLabel: "Marcado"
        },
        {
          name: "Procesamiento profundo",
          description: "No te alcanza con entender la superficie. Necesitás saber por qué las cosas funcionan como funcionan.",
          level: 72,
          levelLabel: "Presente"
        },
        {
          name: "Tolerancia a la ambigüedad",
          description: "Te cuesta cuando las reglas no están claras o hay muchas formas válidas de hacer algo. Preferís instrucciones definidas.",
          level: 45,
          levelLabel: "Moderado",
          isTension: true
        }
      ]
    },
    energyProfile: {
      intro: "No todas las actividades te afectan igual. Algunas te cargan las pilas, otras te las drenan. Saber esto te ayuda a elegir contextos donde puedas sostenerte a largo plazo.",
      activates: [
        "Resolver problemas que tienen una lógica interna",
        "Construir cosas que funcionan y se pueden probar",
        "Entender cómo funcionan los sistemas por dentro",
        "Tener autonomía sobre cómo y cuándo trabajar",
        "Profundizar en temas que te interesan sin límite de tiempo"
      ],
      drains: [
        "Tareas repetitivas sin posibilidad de mejora",
        "Ambientes donde las reglas son arbitrarias",
        "Interacción social constante sin pausas",
        "Situaciones con alta ambigüedad emocional",
        "Presión para actuar sin tiempo para pensar"
      ]
    },
    interests: {
      intro: "Tus intereses no son casuales. Revelan hacia dónde se dirige tu atención cuando nadie te obliga. Esto es importante porque sugiere qué tipo de trabajo podría sostenerte a largo plazo.",
      areas: [
        {
          name: "Tecnología y sistemas",
          score: 85,
          insight: "Te atrae entender cómo funcionan las cosas y cómo pueden mejorarse.",
          levelLabel: "Muy marcado"
        },
        {
          name: "Resolución de problemas",
          score: 82,
          insight: "Disfrutás el proceso de encontrar soluciones a desafíos complejos.",
          levelLabel: "Muy marcado"
        },
        {
          name: "Análisis de datos",
          score: 75,
          insight: "Te gusta encontrar patrones y extraer conclusiones de información.",
          levelLabel: "Marcado"
        },
        {
          name: "Construcción y creación",
          score: 70,
          insight: "Necesitás que las ideas se conviertan en algo tangible y funcional.",
          levelLabel: "Marcado"
        },
        {
          name: "Ciencias sociales",
          score: 45,
          insight: "Tenés interés moderado por entender comportamientos humanos.",
          levelLabel: "Presente"
        }
      ]
    }
  },
  notAttracted: {
    intro: "No es que estas cosas estén mal. Simplemente, no parecen encajar con cómo funcionás. Esto no es un juicio, es una delimitación útil para no perder energía en direcciones que probablemente no te van a sostener.",
    areas: [
      {
        name: "Roles de atención al público continua",
        description: "Trabajos donde la interacción social constante es el centro. Recepción, ventas presenciales, atención al cliente en tiempo real. Tu perfil sugiere que esto te agotaría rápidamente.",
        inferenceStrength: "alta"
      },
      {
        name: "Ambientes con reglas arbitrarias",
        description: "Contextos donde las decisiones no siguen una lógica clara o donde el 'porque sí' es la norma. Tu necesidad de entender sistemas choca con esto.",
        inferenceStrength: "alta"
      },
      {
        name: "Carreras puramente artístico-expresivas",
        description: "Disciplinas donde la expresión personal sin estructura técnica es el eje central. Artes plásticas, danza, teatro. Tu perfil muestra más afinidad con lo técnico-constructivo.",
        inferenceStrength: "media"
      }
    ],
    reframe: "Que algo no te atraiga no significa que no puedas hacerlo. Significa que probablemente no sea el mejor uso de tu energía a largo plazo."
  },
  lifeStyle: {
    axes: [
      {
        leftLabel: "Seguridad",
        rightLabel: "Riesgo",
        value: 35,
        interpretation: "Tendés hacia la seguridad, pero no de manera extrema. Necesitás una base estable desde la cual operar."
      },
      {
        leftLabel: "Independencia",
        rightLabel: "Colaboración",
        value: 60,
        interpretation: "Te sentís bien trabajando en equipo, pero necesitás espacios de autonomía."
      },
      {
        leftLabel: "Estructura",
        rightLabel: "Flexibilidad",
        value: 40,
        interpretation: "Preferís tener marcos claros, pero con libertad para decidir cómo organizar tu trabajo."
      },
      {
        leftLabel: "Especialización",
        rightLabel: "Generalismo",
        value: 35,
        interpretation: "Preferís profundizar en pocas áreas que saber un poco de todo."
      }
    ]
  },
  summary: {
    centralPhrase: "Sos alguien que encuentra sentido en entender cómo funcionan las cosas, construir soluciones que funcionen, y tener la autonomía para hacerlo a tu manera.",
    elaboration: "Funcionás mejor en contextos donde hay problemas claros que resolver, donde tu capacidad analítica sea un activo, y donde puedas profundizar sin que te apuren. Te potenciás cuando tenés espacio para pensar, cuando el trabajo tiene una lógica que podés seguir, y cuando podés ver el impacto de lo que hacés. Esto no define quién sos. Es una foto de este momento. Pero es una foto útil para pensar qué sigue.",
    shareableTag: "Sistemático. Profundo. Autónomo."
  }
}
