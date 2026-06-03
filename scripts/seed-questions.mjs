/**
 * Seed script for the `questions` table.
 *
 * Run the following DDL in Supabase SQL Editor first:
 *
 * CREATE TABLE IF NOT EXISTS questions (
 *   id serial PRIMARY KEY,
 *   section_id integer NOT NULL,
 *   question_number integer NOT NULL,
 *   question_text text NOT NULL,
 *   options jsonb,
 *   response_type text NOT NULL DEFAULT 'text',
 *   metadata jsonb,
 *   created_at timestamptz DEFAULT now(),
 *   UNIQUE(section_id, question_number)
 * );
 *
 * Then run: node seed-questions.mjs
 */

import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY env var before running.');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://zxiecdsuflvdabaxmsgh.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── Section IDs ──
const SECTION = {
  MILLON: 2,
  RIASEC: 3,
  HERRMANN: 4,
  GARDNER: 5,
  PROYECTIVA: 6,
  AUTODESC: 7,
  LIFESTYLE: 9,
  FUTURO: 10,
  FAMILIA: 11,
  UNIVERSIDAD: 12,
};

// ────────────────────────────────────────────────────────────────────────────
// MILLON (section_id=2) — 183 boolean questions
// ────────────────────────────────────────────────────────────────────────────
const millonStatements = [
  "Soy una persona tranquila y colaboradora.",
  "Siempre he hecho lo que he querido y he aceptado las consecuencias.",
  "Me gusta ser la persona que asume el control de las cosas.",
  "Tengo una manera habitual de hacer las cosas, con lo que evito equivocarme.",
  "Respondo mensajes o comunicaciones el mismo día que los recibo.",
  "A veces me las arreglo para arruinar las cosas buenas que me pasan.",
  "Ya no encuentro tantas cosas nuevas que me gustan como antes",
  "Preferiría ser un seguidor más que un líder.",
  "Me esfuerzo por llegar a ser popular.",
  "Siempre he tenido talento para tener éxito en lo que hago.",
  "Con frecuencia me doy cuenta de que he sido tratado injustamente.",
  "Me siento incómodo cuando me tratan bien.",
  "Con frecuencia me siento tenso en situaciones sociales.",
  "Creo que la policía / patovica / preceptores abusan del poder que tiene.",
  "Algunas veces he tenido que ser bastante brusco con la gente.",
  "Los niños deben obedecer siempre las indicaciones de sus mayores.",
  "A menudo me molestan la forma en que se hacen las cosas.",
  "A menudo espero que me pase lo peor.",
  "No me importaría tener pocos amigos.",
  "Soy tímido e inhibido en situaciones sociales.",
  "Aunque esté en desacuerdo, por lo general dejo que la gente haga lo que quiera.",
  "Es imposible pretender que las personas digan siempre la verdad.",
  "Puedo hacer comentarios desagradables si considero que las personas se los merecen.",
  "Me gusta cumplir con lo establecido y hacer lo que se espera de mí.",
  "Muy poco de lo que hago es valorado por los demás.",
  "Casi todo lo que intento hacer me resulta fácil.",
  "Últimamente me he convertido en una persona más encerrada en mí misma.",
  "Tiendo a hacer un drama de las cosas que me pasan.",
  "Siempre trato de hacer lo que es correcto.",
  "Dependo poco de la amistad de los demás.",
  "Cuando hay un límite claro (horario, cantidad, consigna), trato de no pasarme",
  "Los castigos nunca me han impedido hacer lo que he querido.",
  "Me gusta organizar todas las cosas hasta en sus mínimos detalles.",
  "A menudo los demás logran irritarme.",
  "Jamás he desobedecido las indicaciones de mis padres.",
  "Siempre logro conseguir lo que quiero aunque tenga que presionar a los demás.",
  "Nada es más importante que proteger la reputación personal.",
  "Los demás tienen mejores oportunidades que yo.",
  "Ya no expreso lo que realmente siento.",
  "Es imposible que lo que tengo que decir interese a los demás.",
  "Me esfuerzo por conocer gente interesante y tener aventuras.",
  "Me tomo con poca seriedad muchas de las responsabilidades que tengo.",
  "Soy una persona dura, nada sentimental.",
  "Pocas cosas en la vida pueden conmoverme.",
  "Me pone muy nervioso el tener que conocer y conversar con gente nueva.",
  "Soy una persona colaboradora que cede ante los demás.",
  "Actúo en función del momento, dependiendo de las circunstancias.",
  "Primero planifico y luego sigo activamente el plan trazado.",
  "A menudo me he sentido inquieto con ganas de irme a cualquier parte.",
  "Lo mejor es controlar nuestras emociones.",
  "Desearía que la gente no me culpara a mí cuando algo sale mal.",
  "Probablemente soy mi peor enemigo.",
  "Tengo muy pocos lazos afectivos fuertes con otras personas.",
  "Me siento intranquilo con personas que no conozco muy bien.",
  "Es correcto tratar de burlar la ley sin dejar de cumplirla.",
  "Hago mucho por los demás, pero ellos hacen poco por mí.",
  "Siempre he creído que los demás no tienen buena opinión de mí.",
  "Tengo mucha confianza en mí mismo.",
  "Sistemáticamente ordeno mis papeles y materiales de trabajo.",
  "Mi experiencia me ha enseñado que las cosas buenas duran poco.",
  "Algunos dicen que me gusta hacerme la víctima.",
  "Me siento mejor cuando estoy solo.",
  "Me pongo más tenso que los demás frente a situaciones nuevas.",
  "Siempre trato de evitar las discusiones, por más que esté convencido de tener razón.",
  "Busco situaciones novedosas y excitantes para mí.",
  "Hubo épocas en que mis padres tuvieron problemas por mi comportamiento.",
  "Siempre termino mi trabajo antes de descansar.",
  "Otros consiguen cosas que yo no logro.",
  "A veces siento que merezco ser infeliz.",
  "Espero que las cosas sigan su curso antes de decidir qué hacer.",
  "Procuro ocuparme más de los demás que de mí mismo.",
  "A menudo creo que mi vida va de mal en peor.",
  "Es fácil para mí controlar mis estados de ánimo.",
  "El solo hecho de estar con otras personas me hace sentir inspirado.",
  "Suelo respetar las reglas, incluso cuando nadie está controlando",
  "Uso mi cabeza y no mi corazón para tomar decisiones.",
  "Generalmente suelo guiarme de mis intuiciones más que por la información que tengo sobre algo.",
  "Jamás envidio los éxitos de los demás.",
  "En el colegio me gustaban más los cursos prácticos que los teóricos.",
  "Planifico las cosas con anticipación y actúo enérgicamente para que mis planes se cumplan.",
  "Mi corazón controla mi cerebro.",
  "Siempre puedo ver el lado positivo de la vida.",
  "A menudo espero que alguien solucione mis problemas.",
  "Hago lo que quiero, sin pensar cómo va a afectar a los otros.",
  "Reacciono con rapidez ante cualquier situación que pueda llegar a ser un problema para mí.",
  "Sólo me siento una buena persona cuando ayudo a los demás.",
  "Si algo sale mal, aunque no sea importante, se me arruina todo el día.",
  "Disfruto más de mis fantasías que de la realidad cotidiana.",
  "Me siento satisfecho dejando que las cosas ocurran.",
  "Trato de ser más lógico que emocional.",
  "Prefiero las cosas que se pueden ver y tocar antes que las que sólo se imaginan.",
  "Me resulta difícil conversar con alguien que acabo de conocer.",
  "Ser afectuoso es más importante que ser frío y calculador.",
  "Las predicciones sobre el futuro son más interesantes para mí que los hechos del pasado.",
  "Me resulta fácil disfrutar de las cosas.",
  "Me siento incapaz de influir en el mundo que me rodea.",
  "Vivo según mis propias necesidades y no basado en las de los demás.",
  "Nunca espero que las cosas pasen, hago que sucedan como yo quiero.",
  "Evito contestar bruscamente cuando estoy molesto.",
  "La necesidad de ayudar a otros guía mi vida.",
  "A menudo me siento muy tenso, a la espera de que algo salga mal.",
  "Nunca intenté copiar en un examen.",
  "Siempre soy frío y objetivo en el trato con los demás.",
  "Prefiero aprender a manejar un aparato antes que especular sobre por qué funciona de ese modo.",
  "Soy una persona difícil de conocer bien.",
  "Paso mucho tiempo pensando en los misterios de la vida.",
  "Es fácil para mí controlar mis estados de ánimo.",
  "Soy algo pasivo y lento en temas relacionados con la organización de mi vida.",
  "Hago lo que quiero sin importarme el complacer a otros.",
  "Jamás haría algo malo, por más fuerte que sea la tentación de hacerlo.",
  "Mis amigos y mis familiares recurren a mí en primer lugar para encontrar afecto y apoyo.",
  "Aunque todo esté bien, generalmente pienso que va a pasar lo peor.",
  "Planifico y organizo con cuidado mi trabajo antes de empezar a hacerlo.",
  "Soy impersonal y objetivo al tratar de resolver un problema.",
  "Soy una persona realista a la que no le gustan las especulaciones.",
  "Algunos de mis mejores amigos desconocen lo que realmente siento.",
  "La gente piensa que soy una persona más racional que afectiva.",
  "Mi sentido de la realidad es mejor que mi imaginación.",
  "Primero me preocupo por mí y después de los demás.",
  "Dedico mucho esfuerzo para que las cosas me salgan bien.",
  "Siempre mantengo la compostura, sin importar lo que esté pasando.",
  "Demuestro mucho afecto hacia mis amigos.",
  "Muy pocas cosas me han salido bien.",
  "Me gusta conocer gente nueva y saber cosas sobre sus vidas.",
  "Puedo ignorar aspectos emocionales y afectivos en mi trabajo.",
  "Prefiero ocuparme de realidades y no de posibilidades.",
  "Necesito mucho tiempo para poder estar a solas con mis pensamientos.",
  "Los sentimientos son más importantes que la lógica de la mente.",
  "Me gustan más los soñadores que los realistas.",
  "Soy más capaz que los demás de reírme de los problemas.",
  "Es poco lo que puedo hacer, así que prefiero esperar a ver qué pasa.",
  "Nunca me pongo a discutir, aunque esté muy enojado.",
  "Expreso lo que pienso de manera franca y abierta.",
  "Me preocupo por el trabajo que hay que realizar y no por lo que siente la gente que participa en su realización.",
  "Para mí lo ideal sería trabajar con ideas creativas.",
  "Soy el tipo de persona que no se toma la vida muy en serio, prefiero ser más espectador que actor.",
  "Me desagrada que voy a depender de alguien en mi trabajo.",
  "Trato de asegurar que las cosas salgan como yo quiero.",
  "Disfruto más de las realidades concretas que de las fantasías.",
  "Muchas cosas sin importancia me ponen de mal humor.",
  "Aprendo mejor observando y hablando con la gente.",
  "No me satisface dejar que las cosas sucedan y simplemente contemplarlas.",
  "No me atrae conocer gente nueva.",
  "Pocas veces sé cómo mantener una conversación.",
  "Siempre tengo en cuenta los sentimientos de las personas.",
  "Confío más en mis intuiciones que en mis observaciones.",
  "Trato de no actuar hasta saber qué van a hacer los demás.",
  "Me gusta tomar mis propias decisiones, evitando los consejos de los otros.",
  "Muchas veces me siento muy mal sin saber por qué.",
  "Me gusta ser popular y participar en muchas actividades sociales.",
  "Raramente cuento a otro lo que pienso.",
  "Me entusiasman casi todas las actividades que realizo.",
  "Para mí es una práctica constante depender de mí mismo y no de otros.",
  "La mayor parte del tiempo la dedico a organizar lo que tengo que hacer.",
  "No hay nada mejor que el afecto que se siente estando con mi familia",
  "Algunas veces estoy tenso o deprimido sin saber por qué.",
  "Disfruto conversando sobre temas o sucesos místicos.",
  "Decido cuáles son las cosas prioritarias y luego actúo firmemente para poder lograrlas.",
  "No dudo en orientar a las personas hacia lo que yo creo que es mejor para ellas.",
  "Me siento orgulloso de ser eficiente y organizado.",
  "Realmente me desagradan las personas que se convierten en líderes sin razones que lo justifiquen.",
  "Soy ambicioso en mis metas.",
  "Sé cómo agradar a la gente.",
  "La gente puede confiar en que voy a hacer bien mi trabajo.",
  "Los demás me consideran una persona más afectiva que racional.",
  "Estaría dispuesto a trabajar mucho tiempo para poder llegar a ser alguien importante.",
  "Me gustaría mucho poder vender nuevas ideas o productos a la gente.",
  "Generalmente logro convencer a los demás para que hagan exactamente lo que yo quiero.",
  "Me gustan los trabajos en los que hay que prestar mucha atención en los detalles.",
  "Soy muy introspectivo, siempre trato de entender mis pensamientos y emociones.",
  "Confío mucho en mis habilidades sociales.",
  "Evalúo las situaciones rápidamente y luego actúo para que las cosas salgan como yo quiero.",
  "En una discusión soy capaz de convencer a casi todos para que apoyen mi posición.",
  "Soy capaz de llevar a cabo cualquier trabajo, pese a los obstáculos que puedan presentarse.",
  "Como si fuera un buen vendedor, puedo influir con éxito sobre los demás, con modales agradables.",
  "Conocer gente nueva es un objetivo importante para mí.",
  "Al tomar decisiones creo que lo más importante es pensar en el bienestar de la gente involucrada.",
  "Tengo paciencia para realizar trabajos que requieren mucha precisión.",
  "Mi imaginación es superior a mi sentido de la realidad.",
  "Estoy motivado para llegar a ser uno de los mejores en mi campo de trabajo.",
  "Tengo un comportamiento que logra ganarme la aprobación de la gente.",
  "Siento que mi nombre debe quedar en la historia por lo que hago.",
  "Me considero un apasionado del trabajo.",
];

const millonRows = millonStatements.map((text, i) => ({
  section_id: SECTION.MILLON,
  question_number: i + 1,
  question_text: text,
  options: null,
  response_type: 'boolean',
  metadata: null,
}));

// ────────────────────────────────────────────────────────────────────────────
// RIASEC (section_id=3) — 24 array questions
// ────────────────────────────────────────────────────────────────────────────
const riasecSections = {
  personality: {
    R: ["Dinámico","Concreto","Conservador","Franco","Independiente","Persistente","Práctico","Bien coordinado","Rígido","Fuerte","Ahorrador","Tradicional","Individualista"],
    I: ["Original","Metódico","Explorador","Independiente","Investigador","Intelectual","Lógico","Observador","Racional","Curioso","Reservado","Preciso","Investigativo"],
    A: ["Soñador","Informal","Emocional","Impulsivo","Imaginativo","Original","Espontáneo","No conformista","Expresivo","Independiente","Práctico","Sensible","Creativo"],
    S: ["Cálido","Sensible","Cooperativo","Honesto","Amigable","Generoso","Responsable","Genuino","Perceptivo","Sociable","Comprensivo","Soñador","Prudente"],
    E: ["Aventurero","Dinámico","Dominante","Popular","Seguro de sí","Sociable","Curioso","Extrovertido","Optimista","Colaborador","Persuasivo","Decidido","Competitivo"],
    C: ["Preciso","Ordenado","Cuidadoso","Organizado","Conformista","Conservador","Eficiente","Prudente","Detallista","Responsable","Práctico","Predecible","Callado"],
  },
  habilidades: {
    R: ["Mecánica","Atlética","Manual","Precisión","Practicidad","Estabilidad","Analítica","Crítica","Uso del cuerpo","Espacial"],
    I: ["Analítica","Abstracta","Matemática","Científica","Verbal","Resolutiva","Metódica","Observación","Paciencia","Investigación"],
    A: ["Creativa","Expresiva","Intuitiva","Introspectiva","Musical","Diseño","Espacial","Imaginación","Detalle","Innovación"],
    S: ["Enseñanza","Comprensión","Escucha","Ayuda al otro","Comunicación","Imaginación","Responsabilidad","Mediador","Persuasión","Astucia / viveza"],
    E: ["Persuasión","Responsabilidad","Liderazgo","Comunicación","Expresión oral","Organización","Objetividad","Practicidad","Tolerancia","Ambición"],
    C: ["Cálculo","Finanzas","Prolijidad","Planificación","Método","Orden","Responsabilidad","Practicidad","Detalle","Exactitud"],
  },
  intereses: {
    R: ["Cálculo","Científico","Manual","Ser preciso","Planificación"],
    I: ["Ordenar","Numérico","Análisis/síntesis","Orden/precisión","Investigación"],
    A: ["Estético","Equilibrado","Manual","Visual","Auditivo"],
    S: ["Precisión verbal","Organización","Comunicación","Ayuda","Justicia"],
    E: ["Organización","Supervisión","Colaboración","Análisis/síntesis","Estrategias"],
    C: ["Orden","Supervisión","Computación","Detalle","Cálculo"],
  },
  motivaciones: {
    R: ["Lo tradicional","Vida al aire libre","Trabajo manual","Sentido común","Naturaleza","Deportes"],
    I: ["Conocimiento","Resolución de problemas","Independencia","Teorías","Ciencia","Curiosidad"],
    A: ["Ayuda","Arte","Lograr armonía","Observación","Expresión","La belleza"],
    S: ["Cooperación","Trabajo en equipo","Comunicación","Protección","Curar","El desarrollo personal"],
    E: ["Desafíos","Competencia","Organización","Poder/servicio","El estatus","Emprender"],
    C: ["Seguridad","Precisión","Eficiencia","Estadísticas","Métodos","Pertenencia"],
  },
};

const riasecLabels = { R: "Realista", I: "Investigador", A: "Artístico", S: "Social", E: "Emprendedor", C: "Convencional" };
const riasecCategoryLabels = { personality: "Personalidad", habilidades: "Habilidades", intereses: "Intereses", motivaciones: "Motivaciones" };
const riasecTypeOrder = ['R','I','A','S','E','C'];

const riasecRows = [];
let riasecQNum = 1;
for (const category of ['personality', 'habilidades', 'intereses', 'motivaciones']) {
  for (const type of riasecTypeOrder) {
    const opts = riasecSections[category][type];
    riasecRows.push({
      section_id: SECTION.RIASEC,
      question_number: riasecQNum++,
      question_text: `${riasecCategoryLabels[category]} - ${riasecLabels[type]} (${type})`,
      options: opts,
      response_type: 'array',
      metadata: { category, type },
    });
  }
}

// ────────────────────────────────────────────────────────────────────────────
// HERRMANN (section_id=4) — 15 integer questions (1-5 scale)
// Matches the payload: q1-5 = motivacion subset, q6-10 = aprendizaje subset,
// q11-15 = meGusta subset
// ────────────────────────────────────────────────────────────────────────────
const herrmannRows = [
  // Motivacion (questions 1-5 from payload)
  { qn: 1, text: "Motivación: Trabajar solo", cat: "motivacion" },
  { qn: 2, text: "Motivación: Expresar mis ideas", cat: "motivacion" },
  { qn: 3, text: "Motivación: Tener el control de la situación", cat: "motivacion" },
  { qn: 4, text: "Motivación: Trabajar en equipo", cat: "motivacion" },
  { qn: 5, text: "Motivación: Ser reconocido por mi esfuerzo", cat: "motivacion" },
  // Aprendizaje (questions 6-10 from payload)
  { qn: 6, text: "Aprendizaje: Aprendo mejor leyendo y tomando notas", cat: "aprendizaje" },
  { qn: 7, text: "Aprendizaje: Aprendo mejor discutiendo en grupo", cat: "aprendizaje" },
  { qn: 8, text: "Aprendizaje: Aprendo mejor haciendo experimentos", cat: "aprendizaje" },
  { qn: 9, text: "Aprendizaje: Aprendo mejor con dibujos y diagramas", cat: "aprendizaje" },
  { qn: 10, text: "Aprendizaje: Aprendo mejor con ejemplos prácticos", cat: "aprendizaje" },
  // Me gusta (questions 11-15 from payload)
  { qn: 11, text: "Me gusta: Descubrir", cat: "meGusta" },
  { qn: 12, text: "Me gusta: Organizar", cat: "meGusta" },
  { qn: 13, text: "Me gusta: Conceptuar", cat: "meGusta" },
  { qn: 14, text: "Me gusta: Socializar", cat: "meGusta" },
  { qn: 15, text: "Me gusta: Crear", cat: "meGusta" },
].map(({ qn, text, cat }) => ({
  section_id: SECTION.HERRMANN,
  question_number: qn,
  question_text: text,
  options: null,
  response_type: 'integer',
  metadata: { category: cat },
}));

// ────────────────────────────────────────────────────────────────────────────
// GARDNER (section_id=5) — 24 integer questions (1-5), 3 per intelligence
// Matches the payload: each intelligence picks 3 representative questions
// ────────────────────────────────────────────────────────────────────────────
const gardnerIntelligences = [
  { key: 'logicoMatematica', questions: [
    "Puedo calcular números mentalmente con facilidad.",
    "Me gusta jugar juegos o resolver problemas que requieren pensamiento lógico.",
    "Mi mente busca los patrones, las regularidades o las secuencias lógicas en las cosas.",
  ]},
  { key: 'linguistica', questions: [
    "Para mí los libros son importantes.",
    "Puedo escuchar las palabras en mi cabeza antes de leerlas, decirlas o escribirlas.",
    "Me encantan los juegos de ingenio con palabras.",
  ]},
  { key: 'espacial', questions: [
    "Soy sensible a los colores.",
    "Disfruto el armar rompecabezas y resolver problemas visuales.",
    "De noche tengo sueños vívidos.",
  ]},
  { key: 'corporalCinetica', questions: [
    "Practico de manera regular por lo menos un deporte o actividad física.",
    "Me resulta difícil estar sentado durante períodos largos de tiempo.",
    "Me describiría como bien coordinado.",
  ]},
  { key: 'musical', questions: [
    "Tengo una voz agradable para cantar.",
    "Puedo darme cuenta cuándo una nota musical está fuera de tono.",
    "Escucho música frecuentemente.",
  ]},
  { key: 'interpersonal', questions: [
    "Mis amigos siempre me eligen como el psicólogo del grupo para contarme sus problemas o pedirme un consejo.",
    "Me considero un líder u otros me han dicho que lo soy.",
    "Me siento cómodo en medio de una multitud.",
  ]},
  { key: 'intrapersonal', questions: [
    "De una manera regular paso tiempo solo meditando, reflexionando o pensando en cosas importantes.",
    "Regularmente dedico tiempo a reflexionar sobre los asuntos importantes de la vida.",
    "Considero que poseo una voluntad fuerte y una mente independiente.",
  ]},
  { key: 'naturalista', questions: [
    "Amo ir a caminar a los bosques y mirar a los árboles y las flores.",
    "Me preocupa la conservación del medio ambiente.",
    "Me gusta alejarme de las ciudades y disfrutar de la naturaleza.",
  ]},
];

const gardnerRows = [];
let gardnerQNum = 1;
for (const intel of gardnerIntelligences) {
  for (const qText of intel.questions) {
    gardnerRows.push({
      section_id: SECTION.GARDNER,
      question_number: gardnerQNum++,
      question_text: qText,
      options: null,
      response_type: 'integer',
      metadata: { intelligence: intel.key },
    });
  }
}

// ────────────────────────────────────────────────────────────────────────────
// PROYECTIVA (section_id=6) — 15 text questions (matching payload)
// The payload uses the first 15 of the 66 proyectivas questions
// ────────────────────────────────────────────────────────────────────────────
const proyectivasAll = [
  "Siempre me gustó...",
  "Acceder a la universidad hoy...",
  "En mi casa...",
  "Para trabajar es importante...",
  "El año que viene...",
  "Mis profesores piensan que yo...",
  "Las chicas/os que estudian...",
  "Conseguir trabajo hoy...",
  "Sin un título...",
  "Si se me presenta una dificultad...",
  "Las carreras largas...",
  "Si tengo que mantener una familia...",
  "Una persona adulta...",
  "Sin un trabajo...",
  "Elegir...",
  "A veces me da miedo...",
  "Si quiero tener una buena posición económica...",
  "Estudiar en grupo...",
  "Si yo pudiera...",
  "Hacer cursos fuera de la universidad...",
  "Cuando tenga hijos...",
  "Terminar una carrera...",
  "Para organizar mejor mi tiempo...",
  "Las mujeres que trabajan...",
  "Hacerse de amigos en la universidad...",
  "Mis padres quisieran que yo...",
  "Hacer una carrera corta...",
  "No tener hijos...",
  "Presentarme a un examen...",
  "Dentro de diez años...",
  "Para elegir hago ta-te-ti...",
  "Si yo fuera rica/o podría...",
  "Rara vez tomo una decisión importante sin consultar con alguien...",
  "Lo que más me atrae de un trabajo es...",
  "Me resulta difícil...",
  "En esta sociedad, más vale la pena ganar plata que...",
  "Me da miedo equivocarme...",
  "Cuando dudo entre dos cosas...",
  "En la vida, lo más importante es...",
  "Antes de hacer algo importante pienso...",
  "Pensar en el futuro me asusta muchísimo...",
  "Lo que más me pone nerviosa/o es...",
  "La mayor satisfacción en un trabajo es...",
  "La sociedad espera que una/o sea una persona...",
  "Es difícil elegir una profesión cuando...",
  "En la vida quiero llegar a ser...",
  "El problema con la mayor parte de los trabajos es...",
  "Cuando tengo que tomar una decisión me resulta tan difícil que...",
  "Si no estudiara sería...",
  "Siempre quise viajar por...",
  "Lo que más me preocupa es...",
  "El deseo más grande de un profesional es...",
  "Cuando sea mayor podré...",
  "Necesito que me entiendan...",
  "Una profesión brinda la oportunidad para...",
  "Lo que más quiero de un trabajo es...",
  "Lo difícil de tomar una decisión es...",
  "Lo que más me disgusta de un trabajo es...",
  "Puedo intentar un cambio pero...",
  "Yo soy...",
  "Los demás...",
  "Siento que los adultos que tienen autoridad sobre mí (profes, directivos) a veces son...",
  "Cuando se me acerca un profe o alguien que manda, yo..",
  "Las personas con autoridad me inspiran...",
];

// The payload saves only the first 15. We seed ALL 66 so they're available.
// But the question_number in the responses table is 1..15 for existing data.
// We seed all with question_number = 1..66 to have the full set.
const proyectivaRows = proyectivasAll.map((text, i) => ({
  section_id: SECTION.PROYECTIVA,
  question_number: i + 1,
  question_text: text,
  options: null,
  response_type: 'text',
  metadata: null,
}));

// ────────────────────────────────────────────────────────────────────────────
// AUTODESC (section_id=7) — 15 mixed questions (matching payload)
// ────────────────────────────────────────────────────────────────────────────
const areaNames = [
  "Administración, Economía y Negocios",
  "Sociales y RRHH",
  "Humanidades, Educación y Psicología",
  "Salud",
  "Jurídicas, Políticas y Seguridad",
  "Ecología y Naturaleza",
  "Exactas, Ingeniería y Sistemas",
  "Comunicación y Medios",
  "Arte y Diseño",
];

const areaTalents = {
  "Administración, Economía y Negocios": ["Trabajar con números","Iniciar proyecto propio","Liderar","Asumir riesgos","Tareas de oficina","Manejar contabilidad","Convencer a otros","Llevar cuentas","Supervisar","Detectar oportunidades","Planificar ganancias","Diseñar inversiones"],
  "Sociales y RRHH": ["Ayudar a otros","Percibir necesidades","Leer sobre problemas sociales","Tareas solidarias","Aconsejar","Incentivar relaciones","Actividades con niños/ancianos","Contención emocional","Trabajo en equipo","Interés en conducta humana"],
  "Humanidades, Educación y Psicología": ["Enseñar/Entrenar","Idiomas","Facilitar comunicación","Planear recreación","Interés educativo","Talleres literarios/culturales","Retiros espirituales","Hablar en público","Escribir","Reflexión filosófica","Leer"],
  "Salud": ["Anatomía/Fisiología","Investigación en salud","Ayudar enfermos","Leer sobre medicina","Voluntariado hospitalario","Prevención","Emergencias","Primeros auxilios","Nutrición"],
  "Jurídicas, Políticas y Seguridad": ["Seguridad de los demás","Relaciones internacionales","Defensa del territorio","Política","Noticias delictivas","Defender causas justas","Conciliar disputas","Prevención del delito","Defender derechos","Juzgar con objetividad"],
  "Ecología y Naturaleza": ["Medio ambiente","Alimentación humana","Reservas animales","Preservación de especies","Actividad agrícola/ganadera","Crianza de animales","Biología/Ecología","Vida marina","Cocina","Genética","Geografía"],
  "Exactas, Ingeniería y Sistemas": ["Relacionar teorías","Organizar objetos/datos","Informática","Programar software","Lógica","Leer revistas científicas","Cálculos complejos","Fórmulas matemáticas/químicas","Manipular herramientas","Experimentos","Reparaciones"],
  "Comunicación y Medios": ["Promocionar","Indagar culturas/historia","Planificar viajes/eventos","Luces y sonido","Relatar","Crítica de espectáculos","Periodismo","Operar sistemas electrónicos","Transmitir comunicación","Entrevistar","Organizar eventos"],
  "Arte y Diseño": ["Decorar","Leer partituras","Historia del arte","Tocar instrumento","Fotografía","Danza","Teatro","Diseño de objetos/imágenes","Dibujar/Pintar","Manualidades/Escultura","Confección de ropa","Maquetas","Diseño web"],
};

const autobiografiaFields = ["Yo","Retrato","Orígenes","Pasado","Perfil","Memorias","Presente","Futuro"];

const autodescRows = [
  // Q1: Areas de interes (array)
  { section_id: SECTION.AUTODESC, question_number: 1, question_text: "Áreas de interés seleccionadas", options: areaNames, response_type: 'array', metadata: { step: 'areas' } },
  // Q2: Talentos area 1
  { section_id: SECTION.AUTODESC, question_number: 2, question_text: "Talentos identificados en área 1", options: areaTalents, response_type: 'array', metadata: { step: 'talentos', areaIndex: 0 } },
  // Q3: Talentos area 2
  { section_id: SECTION.AUTODESC, question_number: 3, question_text: "Talentos identificados en área 2", options: areaTalents, response_type: 'array', metadata: { step: 'talentos', areaIndex: 1 } },
  // Q4-11: Autobiografia fields
  ...autobiografiaFields.map((field, i) => ({
    section_id: SECTION.AUTODESC,
    question_number: 4 + i,
    question_text: `Autobiografía - ${field}`,
    options: null,
    response_type: 'text',
    metadata: { step: 'autobiografia', field: field.toLowerCase() },
  })),
  // Q12: Felicidad
  { section_id: SECTION.AUTODESC, question_number: 12, question_text: "Felicidad", options: null, response_type: 'text', metadata: { step: 'preguntasAbiertas', field: 'felicidad' } },
  // Q13: Infelicidad
  { section_id: SECTION.AUTODESC, question_number: 13, question_text: "Infelicidad", options: null, response_type: 'text', metadata: { step: 'preguntasAbiertas', field: 'infelicidad' } },
  // Q14: Exito
  { section_id: SECTION.AUTODESC, question_number: 14, question_text: "Éxito", options: null, response_type: 'text', metadata: { step: 'preguntasAbiertas', field: 'exito' } },
  // Q15: Certeza
  { section_id: SECTION.AUTODESC, question_number: 15, question_text: "Certeza", options: null, response_type: 'text', metadata: { step: 'preguntasAbiertas', field: 'certeza' } },
];

// ────────────────────────────────────────────────────────────────────────────
// LIFESTYLE (section_id=9) — 19 mixed questions (matching payload)
// ────────────────────────────────────────────────────────────────────────────
const lifestyleRows = [
  { qn: 1, text: "Me gusta / Me llama la atención", type: 'array', opts: null, meta: { step: 'reconociendoIntereses', field: 'meGusta' } },
  { qn: 2, text: "No me gusta", type: 'array', opts: null, meta: { step: 'reconociendoIntereses', field: 'noMeGusta' } },
  { qn: 3, text: "Tipo de persona que NO quiero ser", type: 'array', opts: ["Solitaria","Rutinaria","Agitada-estresada","Conformista","Desorganizada"], meta: { step: 'estiloVidaLaboral', field: 'noQuieroSer' } },
  { qn: 4, text: "Rol preferido en equipo", type: 'text', opts: ["Líder-coordinador","Creativo-generador de ideas","Organizador-planificador","Ejecutor-resolutivo","Facilitador-mediador"], meta: { step: 'estiloVidaLaboral', field: 'rol' } },
  { qn: 5, text: "Ambiente laboral ideal", type: 'text', opts: null, meta: { step: 'estiloVidaLaboral', field: 'ambiente' } },
  { qn: 6, text: "Equilibrio vida-trabajo", type: 'text', opts: ["Muy importante (tiempo libre y familia)","Importante (puedo sacrificar a veces)","Poco importante (priorizo el trabajo)"], meta: { step: 'estiloVidaLaboral', field: 'equilibrio' } },
  { qn: 7, text: "Carreras preferidas (+)", type: 'array', opts: null, meta: { step: 'desiderativoOcupacional', field: 'preferencias' } },
  { qn: 8, text: "Carreras rechazadas (-)", type: 'array', opts: null, meta: { step: 'desiderativoOcupacional', field: 'rechazos' } },
  { qn: 9, text: "Valores laborales", type: 'array', opts: ["Servicio a otros","Estabilidad y seguridad","Justicia-ética","Innovación","Creatividad","Prestigio-reconocimiento","Impacto social"], meta: { step: 'estiloVidaLaboral', field: 'valores' } },
  { qn: 10, text: "Tipo de personas para rodearte", type: 'array', opts: ["Jóvenes dinámicos","Personas experimentadas","Gente creativa","Personas organizadas","Públicos diversos"], meta: { step: 'estiloVidaLaboral', field: 'personas' } },
  { qn: 11, text: "Interacción", type: 'text', opts: ["Mucho contacto social","Interacciones puntuales","Trabajo individual","Trabajo en pequeños grupos"], meta: { step: 'ritmoOrganizacion', field: 'interaccion' } },
  { qn: 12, text: "Horarios", type: 'text', opts: ["Horario fijo de oficina","Flexibilidad parcial","Horarios libres y autogestionados"], meta: { step: 'ritmoOrganizacion', field: 'horarios' } },
  { qn: 13, text: "Rutina", type: 'text', opts: ["Tareas variadas cada día","Rutina estable y predecible","Mezcla de ambas"], meta: { step: 'ritmoOrganizacion', field: 'rutina' } },
  { qn: 14, text: "Geografía", type: 'text', opts: ["Ciudad grande","Ciudad pequeña","Campo o naturaleza","Trabajo que implique viajar","Trabajo remoto desde casa"], meta: { step: 'lugarEntornoEquilibrio', field: 'geografia' } },
  { qn: 15, text: "Espacio ideal", type: 'text', opts: ["Oficina formal","Espacio creativo y flexible","Aire libre","Taller o lugar práctico","Casa propia"], meta: { step: 'lugarEntornoEquilibrio', field: 'espacioIdeal' } },
  { qn: 16, text: "Ingresos", type: 'text', opts: ["Estabilidad fija (sueldo)","Variables según logros-comisiones","Crecimiento a largo plazo (inversiones)"], meta: { step: 'lugarEntornoEquilibrio', field: 'ingresos' } },
  { qn: 17, text: "Impacto", type: 'text', opts: ["Familia-círculo cercano","Comunidad","País","Global"], meta: { step: 'lugarEntornoEquilibrio', field: 'impacto' } },
  { qn: 18, text: "Día típico", type: 'text', opts: ["Tranquilo y organizado","Dinámico y cambiante","Creativo y motivador","Intenso y desafiante"], meta: { step: 'lugarEntornoEquilibrio', field: 'diaTipico' } },
  { qn: 19, text: "Límites (No aceptaría)", type: 'array', opts: ["Que vayan contra mis valores","Que me aíslen demasiado","Exceso de horas","Rutinarias al extremo","Competencia desleal"], meta: { step: 'lugarEntornoEquilibrio', field: 'limites' } },
].map(({ qn, text, type, opts, meta }) => ({
  section_id: SECTION.LIFESTYLE,
  question_number: qn,
  question_text: text,
  options: opts,
  response_type: type,
  metadata: meta,
}));

// ────────────────────────────────────────────────────────────────────────────
// FUTURO (section_id=10) — 23 text questions (matching payload)
// ────────────────────────────────────────────────────────────────────────────
const futuroQuestions = [
  // Visualizaciones (1-4)
  { qn: 1, text: "El Artículo (7 años) - ¿Qué dice el artículo sobre vos?", meta: { step: 'visualizaciones', id: 'articulo' } },
  { qn: 2, text: "La Escena (Visión a Futuro Vocacional)", meta: { step: 'visualizaciones', id: 'escena' } },
  { qn: 3, text: "El Futuro Lejano (20 años)", meta: { step: 'visualizaciones', id: 'futuroLejano' } },
  { qn: 4, text: "El Legado", meta: { step: 'visualizaciones', id: 'legado' } },
  // Lugar fantaseado (5-7)
  { qn: 5, text: "Lugar de agrado", meta: { step: 'lugarFantaseado', id: 'lugarAgrado' } },
  { qn: 6, text: "Lugar de trabajo ideal", meta: { step: 'lugarFantaseado', id: 'lugarTrabajoIdeal' } },
  { qn: 7, text: "Acción", meta: { step: 'lugarFantaseado', id: 'accion' } },
  // Preguntas de profundidad (8-23)
  { qn: 8, text: "Si pienso en mi futuro, lo que a veces me da miedo es...", meta: { step: 'preguntasProfundidad', id: 'miedo' } },
  { qn: 9, text: "Académicamente, ¿Cuáles son mis debilidades?", meta: { step: 'preguntasProfundidad', id: 'debilidades' } },
  { qn: 10, text: "¿Qué tan difícil te resulta sentarte a estudiar?", meta: { step: 'preguntasProfundidad', id: 'estudiar' } },
  { qn: 11, text: "¿Qué no querés ser?", meta: { step: 'preguntasProfundidad', id: 'noQuieroSer' } },
  { qn: 12, text: "¿Qué no querés hacer?", meta: { step: 'preguntasProfundidad', id: 'noQuieroHacer' } },
  { qn: 13, text: "Modelos: ¿A qué personas te quisieras parecer?", meta: { step: 'preguntasProfundidad', id: 'modelos' } },
  { qn: 14, text: "La Viga de Acero", meta: { step: 'preguntasProfundidad', id: 'vigaAcero' } },
  { qn: 15, text: "Fundación", meta: { step: 'preguntasProfundidad', id: 'fundacion' } },
  { qn: 16, text: "Lotería", meta: { step: 'preguntasProfundidad', id: 'loteria' } },
  { qn: 17, text: "Cuando eras chico, ¿qué querías ser de grande?", meta: { step: 'preguntasProfundidad', id: 'chico' } },
  { qn: 18, text: "¿En qué áreas te gusta ser realmente bueno?", meta: { step: 'preguntasProfundidad', id: 'bueno' } },
  { qn: 19, text: "Estrés: ¿Qué es lo que más te estresa?", meta: { step: 'preguntasProfundidad', id: 'estres' } },
  { qn: 20, text: "Satisfacción actual", meta: { step: 'preguntasProfundidad', id: 'satisfaccion' } },
  { qn: 21, text: "Talentos", meta: { step: 'preguntasProfundidad', id: 'talentos' } },
  { qn: 22, text: "Personaje Histórico", meta: { step: 'preguntasProfundidad', id: 'personajeHistorico' } },
  { qn: 23, text: "Top 10 cosas que más te gusta hacer", meta: { step: 'preguntasProfundidad', id: 'top10' } },
];

const futuroRows = futuroQuestions.map(({ qn, text, meta }) => ({
  section_id: SECTION.FUTURO,
  question_number: qn,
  question_text: text,
  options: null,
  response_type: 'text',
  metadata: meta,
}));

// ────────────────────────────────────────────────────────────────────────────
// FAMILIA (section_id=11) — 12 text questions (matching payload)
// ────────────────────────────────────────────────────────────────────────────
const familiaRows = [
  { qn: 1, text: "Padre - Ocupación" },
  { qn: 2, text: "Padre - Nivel educativo" },
  { qn: 3, text: "Madre - Ocupación" },
  { qn: 4, text: "Madre - Nivel educativo" },
  { qn: 5, text: "Hermano/a - Ocupación" },
  { qn: 6, text: "Abuelo Paterno - Ocupación" },
  { qn: 7, text: "Abuela Paterna - Ocupación" },
  { qn: 8, text: "Abuelo Materno - Ocupación" },
  { qn: 9, text: "Abuela Materna - Ocupación" },
  { qn: 10, text: "Tío Paterno - Ocupación" },
  { qn: 11, text: "Prima - Ocupación" },
  { qn: 12, text: "¿Quién influyó más en tu vocación?" },
].map(({ qn, text }) => ({
  section_id: SECTION.FAMILIA,
  question_number: qn,
  question_text: text,
  options: null,
  response_type: 'text',
  metadata: { step: 'arbolGenealogico' },
}));

// ────────────────────────────────────────────────────────────────────────────
// UNIVERSIDAD (section_id=12) — 8 mixed questions (matching payload + form)
// ────────────────────────────────────────────────────────────────────────────
const universidadRows = [
  {
    qn: 1, text: "En cuanto al contexto economico de tu familia, que tipo de cuota decidieron pagar para tus estudios?",
    type: 'text',
    opts: [
      { value: "A", label: "Sin cuota, gratis. No podemos ir a una universidad privada." },
      { value: "B", label: "Cuota media. Podemos pagar algunas universidades privadas que no sean muy caras, o ir a las caras si nos dan beca." },
      { value: "C", label: "Cuota alta. Tenemos la posibilidad de poder pagar casi cualquier universidad." },
    ],
    meta: { block: 'economia', field: 'cuota' },
  },
  {
    qn: 2, text: "Esfuerzo extra: En caso de necesitar beca, estoy dispuesto a cumplir con los requisitos academicos?",
    type: 'text',
    opts: [{ value: "si", label: "Si" }, { value: "no", label: "No" }],
    meta: { block: 'economia', field: 'beca' },
  },
  {
    qn: 3, text: "Donde vas a vivir en los anos que estudies? (Provincia, barrio)",
    type: 'text', opts: null,
    meta: { block: 'logistica', field: 'lugar_vivienda' },
  },
  {
    qn: 4, text: "Zona: Donde aceptarias que este ubicada la universidad a la que quieras asistir?",
    type: 'array',
    opts: ["CABA Norte","CABA Sur","CABA Centro","Zona Norte GBA","Zona Sur GBA","Zona Oeste GBA","Interior del pais","Me da igual / Cualquier lugar"],
    meta: { block: 'logistica', field: 'zona' },
  },
  {
    qn: 5, text: "Disposicion al ingreso: Estoy dispuesto a preparar un examen de ingreso exigente o hacer un curso de nivelacion largo?",
    type: 'text',
    opts: [{ value: "si", label: "Si" }, { value: "no", label: "No" }],
    meta: { block: 'ingreso', field: 'disposicion_ingreso' },
  },
  {
    qn: 6, text: "Perfil Institucional: Es importante para mi que la universidad tenga cierto prestigio o reconocimiento social?",
    type: 'text',
    opts: [
      { value: "A", label: "Si, el prestigio es muy importante para mi" },
      { value: "B", label: "Me importa un poco, pero no es lo principal" },
      { value: "C", label: "No me importa, priorizo otras cosas" },
    ],
    meta: { block: 'identidad', field: 'prestigio' },
  },
  {
    qn: 7, text: "Valores: Busco una universidad con una afiliacion religiosa o ideologia especifica, o prefiero un ambiente laico?",
    type: 'text',
    opts: [
      { value: "A", label: "Prefiero una universidad con afiliacion religiosa" },
      { value: "B", label: "Prefiero un ambiente laico/diverso" },
      { value: "C", label: "Me es indiferente" },
    ],
    meta: { block: 'identidad', field: 'valores' },
  },
  {
    qn: 8, text: "El entorno: Me importa como son las instalaciones (campus, laboratorios, tecnologia)?",
    type: 'text',
    opts: [
      { value: "A", label: "Las instalaciones son muy importantes para mi" },
      { value: "B", label: "Me importa un poco, pero priorizo lo academico" },
      { value: "C", label: "Me da igual, solo me importa el nivel academico" },
    ],
    meta: { block: 'identidad', field: 'entorno' },
  },
  {
    qn: 9, text: "Podio de Prioridades: Asignale a cada tema una categoria de importancia",
    type: 'text',
    opts: {
      items: ["Costo","Ubicacion","Tiempo extra por examen de ingreso","Reconocimiento institucional y calidad de las instalaciones","Afiliacion religiosa"],
      categories: ["Critico","Importante","Levemente importante","Indiferente"],
    },
    meta: { block: 'podio', field: 'ranking' },
  },
].map(({ qn, text, type, opts, meta }) => ({
  section_id: SECTION.UNIVERSIDAD,
  question_number: qn,
  question_text: text,
  options: opts,
  response_type: type,
  metadata: meta,
}));

// ────────────────────────────────────────────────────────────────────────────
// UPSERT HELPER
// ────────────────────────────────────────────────────────────────────────────
async function upsertBatch(sectionName, rows) {
  if (rows.length === 0) {
    console.log(`  [${sectionName}] No rows to insert.`);
    return 0;
  }

  // Supabase has a max payload size; batch in chunks of 100
  const CHUNK = 100;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { data, error } = await supabase
      .from('questions')
      .upsert(chunk, { onConflict: 'section_id,question_number' });

    if (error) {
      console.error(`  [${sectionName}] Error upserting chunk ${Math.floor(i / CHUNK) + 1}:`, error.message);
    } else {
      inserted += chunk.length;
    }
  }

  console.log(`  [${sectionName}] Upserted ${inserted} questions.`);
  return inserted;
}

// ────────────────────────────────────────────────────────────────────────────
// MAIN
// ────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Starting seed...\n');
  let total = 0;

  total += await upsertBatch('MILLON (section_id=2)', millonRows);
  total += await upsertBatch('RIASEC (section_id=3)', riasecRows);
  total += await upsertBatch('HERRMANN (section_id=4)', herrmannRows);
  total += await upsertBatch('GARDNER (section_id=5)', gardnerRows);
  total += await upsertBatch('PROYECTIVA (section_id=6)', proyectivaRows);
  total += await upsertBatch('AUTODESC (section_id=7)', autodescRows);
  total += await upsertBatch('LIFESTYLE (section_id=9)', lifestyleRows);
  total += await upsertBatch('FUTURO (section_id=10)', futuroRows);
  total += await upsertBatch('FAMILIA (section_id=11)', familiaRows);
  total += await upsertBatch('UNIVERSIDAD (section_id=12)', universidadRows);

  console.log(`\nDone! Total questions upserted: ${total}`);
}

main().catch(console.error);
