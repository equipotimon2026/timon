export const estiloVidaData = {
  // Section 1: Reconociendo Intereses
  reconociendoIntereses: {
    meGusta: {
      label: "Me gusta / Me llama la atención",
      description: "Haga una lista de las cosas que le gustan o le llaman la atención",
      slots: 18,
    },
    noMeGusta: {
      label: "No me gusta",
      description: "Haga una lista de las cosas que no le gustan",
      slots: 18,
    },
    actividadesCotidianas: {
      label: "Actividades cotidianas",
      description: "¿Qué actividades de su vida diaria se relacionan con lo que le gusta?",
      slots: 18,
    },
    carrerasRelacionadas: {
      label: "Carreras Relacionadas",
      description: "Piense en carreras vinculadas a esas áreas de interés. Reflexión: ¿Encontró cosas que le gustan pero de las cuales no hace actividades relacionadas?",
      slots: 9,
    },
  },

  // Section 2: Desiderativo Ocupacional
  desiderativoOcupacional: {
    preferencias: {
      label: "Preferencias (+)",
      description: "¿Cuáles son las tres ocupaciones o carreras que más te gustan al día de hoy? ¿Por qué?",
      count: 3,
    },
    rechazos: {
      label: "Rechazos (-)",
      description: "¿Cuáles son las tres ocupaciones o carreras que menos te gustan al día de hoy? ¿Por qué?",
      count: 3,
    },
  },

  // Section 3: Explorando tu Estilo de Vida Laboral
  estiloVidaLaboral: {
    identidadRechazo: {
      noQuieroSer: {
        label: "¿Qué tipo de persona NO querés ser de ninguna manera?",
        options: ["Solitaria", "Rutinaria", "Agitada-estresada", "Conformista", "Desorganizada"],
      },
      siQuieroSer: {
        label: "¿Qué tipo de persona SÍ te gustaría ser a través de tu trabajo?",
        options: ["Creativa", "Responsable", "Innovadora", "Solidaria", "Líder", "Tranquila-equilibrada"],
      },
      ocupacionesRechazo: {
        label: "¿Qué formas de ocupación rechazás?",
        options: [
          "Trabajo con máquinas",
          "Trabajo con números",
          "Dar discursos-hablar en público",
          "Escritura constante",
          "Trabajo científico o de laboratorio",
          "Trabajo de oficina muy estructurado",
        ],
      },
    },
    valoresRelaciones: {
      valores: {
        label: "¿Qué valores querés que tu ocupación refleje?",
        options: [
          "Servicio a otros",
          "Estabilidad y seguridad",
          "Justicia-ética",
          "Innovación",
          "Creatividad",
          "Prestigio-reconocimiento",
          "Impacto social",
        ],
      },
      personas: {
        label: "¿Con qué tipo de personas te gustaría rodearte?",
        options: [
          "Jóvenes dinámicos",
          "Personas experimentadas",
          "Gente creativa",
          "Personas organizadas",
          "Públicos diversos",
        ],
      },
      rol: {
        label: "¿Qué rol te imaginás dentro de un equipo?",
        options: [
          "Líder-coordinador",
          "Creativo-generador de ideas",
          "Organizador-planificador",
          "Ejecutor-resolutivo",
          "Facilitador-mediador",
        ],
      },
    },
    ritmoOrganizacion: {
      interaccion: {
        label: "Interacción",
        options: [
          "Mucho contacto social",
          "Interacciones puntuales",
          "Trabajo individual",
          "Trabajo en pequeños grupos",
        ],
      },
      horarios: {
        label: "Horarios",
        options: ["Horario fijo de oficina", "Flexibilidad parcial", "Horarios libres y autogestionados"],
      },
      rutina: {
        label: "Rutina",
        options: ["Tareas variadas cada día", "Rutina estable y predecible", "Mezcla de ambas"],
      },
      exigencia: {
        label: "Exigencia",
        options: [
          "Alta exigencia física",
          "Alta exigencia mental",
          "Punto medio de exigencia",
          "Baja exigencia, mayor tranquilidad",
        ],
      },
    },
    lugarEntornoEquilibrio: {
      geografia: {
        label: "Geografía",
        options: [
          "Ciudad grande",
          "Ciudad pequeña",
          "Campo o naturaleza",
          "Trabajo que implique viajar",
          "Trabajo remoto desde casa",
        ],
      },
      espacioIdeal: {
        label: "Espacio ideal",
        options: [
          "Oficina formal",
          "Espacio creativo y flexible",
          "Aire libre",
          "Taller o lugar práctico",
          "Casa propia",
        ],
      },
      equilibrio: {
        label: "Equilibrio vida / trabajo",
        options: [
          "Muy importante (tiempo libre y familia)",
          "Importante (puedo sacrificar a veces)",
          "Poco importante (priorizo el trabajo)",
        ],
      },
      ingresos: {
        label: "Ingresos",
        options: [
          "Estabilidad fija (sueldo)",
          "Variables según logros-comisiones",
          "Crecimiento a largo plazo (inversiones)",
        ],
      },
      impacto: {
        label: "Impacto",
        options: ["Familia-círculo cercano", "Comunidad", "País", "Global"],
      },
      diaTipico: {
        label: "Día típico",
        options: ["Tranquilo y organizado", "Dinámico y cambiante", "Creativo y motivador", "Intenso y desafiante"],
      },
      limites: {
        label: "Límites (No aceptaría)",
        options: [
          "Que vayan contra mis valores",
          "Que me aíslen demasiado",
          "Exceso de horas",
          "Rutinarias al extremo",
          "Competencia desleal",
        ],
      },
    },
  },
}
