/**
 * V1 question definitions for each section.
 * Used by seed-section-v1.ts to populate section_versions_log.
 *
 * question_number must match what handleSave() writes to responses.question_number
 * in the corresponding form component.
 *
 * Sections with complex/dynamic question text are marked TODO.
 */

export type V1Question = {
  question_number: number;
  text: string;
  type: "boolean" | "integer" | "text" | "array";
  options?: string[];
};

export const V1_SECTIONS: Record<number, V1Question[]> = {
  // ─────────────────────────────────────────────
  // section_id 1 — BRAVITO (Datos Personales)
  // No responses table entries: onboarding data lives in survey_responses.
  // There is no form component that calls onSave() for section_id 1.
  // TODO: confirm with team whether BRAVITO needs a versions_log row.
  // ─────────────────────────────────────────────
  1: [],

  // ─────────────────────────────────────────────
  // section_id 2 — MILLON (MIPS Personality)
  // Source: src/components/assessments/mips-form.tsx
  // 92 statements; question_number = index + 1
  // ─────────────────────────────────────────────
  2: [
    { question_number: 1, text: "Soy una persona tranquila y colaboradora.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 2, text: "Siempre he hecho lo que he querido y he aceptado las consecuencias.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 3, text: "Me gusta ser la persona que asume el control de las cosas.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 4, text: "Tengo una manera habitual de hacer las cosas, con lo que evito equivocarme.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 5, text: "Preferiría ser un seguidor más que un líder.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 6, text: "Con frecuencia me siento tenso en situaciones sociales.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 7, text: "A veces siento que algunas figuras de autoridad abusan del poder que tienen.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 8, text: "Algunas veces he tenido que ser bastante brusco con la gente.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 9, text: "No me importaría tener pocos amigos.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 10, text: "Soy tímido e inhibido en situaciones sociales.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 11, text: "Aunque esté en desacuerdo, por lo general dejo que la gente haga lo que quiera.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 12, text: "Puedo hacer comentarios desagradables si considero que las personas se los merecen.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 13, text: "Me gusta cumplir con lo establecido y hacer lo que se espera de mí.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 14, text: "Siempre trato de hacer lo que es correcto.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 15, text: "Dependo poco de la amistad de los demás.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 16, text: "Cuando hay un límite claro, trato de respetarlo.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 17, text: "Me gusta organizar todas las cosas hasta en sus mínimos detalles.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 18, text: "A menudo los demás logran irritarme.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 19, text: "Me costaba desobedecer las indicaciones de mis padres.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 20, text: "Siempre logro conseguir lo que quiero aunque tenga que presionar a los demás.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 21, text: "Me importa mucho cuidar mi reputación personal.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 22, text: "Ya no expreso lo que realmente siento.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 23, text: "A veces siento que lo que tengo para decir no les interesa a los demás.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 24, text: "Soy una persona dura, nada sentimental.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 25, text: "Me pone nervioso conocer y conversar con gente nueva.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 26, text: "Soy una persona colaboradora que cede ante los demás.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 27, text: "A veces actúo según el momento y las circunstancias.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 28, text: "Primero planifico y luego sigo activamente el plan trazado.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 29, text: "Me parece importante controlar las emociones.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 30, text: "Tengo muy pocos lazos afectivos fuertes con otras personas.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 31, text: "Me siento intranquilo con personas que no conozco muy bien.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 32, text: "A veces siento que las reglas pueden interpretarse de forma flexible.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 33, text: "Con frecuencia siento que los demás no tienen una buena opinión de mí.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 34, text: "Sistemáticamente ordeno mis papeles y materiales de trabajo.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 35, text: "Las situaciones nuevas me ponen más tenso que a la mayoría.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 36, text: "Siempre trato de evitar las discusiones, por más que esté convencido de tener razón.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 37, text: "Busco situaciones novedosas y excitantes para mí.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 38, text: "Siempre termino mi trabajo antes de descansar.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 39, text: "Espero que las cosas sigan su curso antes de decidir qué hacer.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 40, text: "Procuro ocuparme más de los demás que de mí mismo.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 41, text: "El solo hecho de estar con otras personas me hace sentir inspirado.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 42, text: "Suelo respetar las reglas, incluso cuando nadie me está controlando.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 43, text: "Uso mi cabeza y no mi corazón para tomar decisiones.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 44, text: "A veces me guío más por mi intuición que por la información disponible.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 45, text: "En el colegio me gustaban más las materias prácticas que las teóricas.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 46, text: "Planifico las cosas con anticipación y actúo enérgicamente para que mis planes se cumplan.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 47, text: "A veces siento que mis emociones influyen más que mi razón.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 48, text: "Siempre puedo ver el lado positivo de la vida.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 49, text: "A menudo espero que alguien solucione mis problemas.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 50, text: "Hago lo que quiero, sin pensar cómo va a afectar a los otros.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 51, text: "Reacciono rápido ante situaciones que podrían convertirse en un problema.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 52, text: "Sólo me siento una buena persona cuando ayudo a los demás.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 53, text: "Si algo sale mal, aunque no sea importante, se me arruina todo el día.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 54, text: "Me siento satisfecho dejando que las cosas ocurran.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 55, text: "Trato de ser más lógico que emocional.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 56, text: "Prefiero lo concreto antes que lo puramente imaginario.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 57, text: "Me resulta difícil conversar con alguien que acabo de conocer.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 58, text: "Me interesan más las posibilidades futuras que los hechos del pasado.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 59, text: "Me resulta fácil disfrutar de las cosas.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 60, text: "Vivo según mis propias necesidades y no basado en las de los demás.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 61, text: "Nunca espero que las cosas pasen, hago que sucedan como yo quiero.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 62, text: "Suelo evitar responder bruscamente cuando estoy molesto.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 63, text: "La necesidad de ayudar a otros guía mi vida.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 64, text: "A menudo me siento muy tenso, a la espera de que algo salga mal.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 65, text: "Nunca intenté copiarme en un examen.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 66, text: "Soy una persona difícil de conocer bien.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 67, text: "Es fácil para mí controlar mis estados de ánimo.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 68, text: "Soy algo pasivo y lento en temas relacionados con la organización de mi vida.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 69, text: "Mis amigos y familiares recurren a mí para encontrar afecto y apoyo.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 70, text: "Aunque todo esté bien, a veces pienso que podría pasar algo malo.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 71, text: "Planifico y organizo con cuidado mi trabajo antes de empezar a hacerlo.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 72, text: "Soy impersonal y objetivo al tratar de resolver un problema.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 73, text: "Soy una persona realista a la que no le gustan las especulaciones.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 74, text: "Primero me preocupo por mí y después de los demás.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 75, text: "Dedico mucho esfuerzo para que las cosas me salgan bien.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 76, text: "Suelo mantener la compostura, incluso en momentos difíciles.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 77, text: "Demuestro mucho afecto hacia mis amigos.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 78, text: "Me gusta conocer gente nueva y saber cosas sobre sus vidas.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 79, text: "Puedo dejar de lado lo emocional para concentrarme en el trabajo.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 80, text: "Necesito mucho tiempo para poder estar a solas con mis pensamientos.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 81, text: "Me atraen más las personas soñadoras que las muy realistas.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 82, text: "Tiendo a evitar discutir, incluso cuando estoy muy enojado.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 83, text: "Expreso lo que pienso de manera franca y abierta.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 84, text: "Me desagrada sentir que voy a depender demasiado de alguien en mi trabajo.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 85, text: "Trato de asegurar que las cosas salgan como yo quiero.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 86, text: "Disfruto más de las realidades concretas que de las fantasías.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 87, text: "Aprendo bien observando y conversando con otras personas.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 88, text: "No me satisface dejar que las cosas sucedan y simplemente contemplarlas.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 89, text: "Confío más en mis intuiciones que en lo que observo.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 90, text: "Me gusta tomar mis propias decisiones, evitando los consejos de los otros.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 91, text: "Me gusta ser popular y participar en muchas actividades sociales.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
    { question_number: 92, text: "Decido cuáles son las cosas prioritarias y luego actúo firmemente para poder lograrlas.", type: "text", options: ["Me siento identificado/a", "A veces", "No me identifica"] },
  ],

  // ─────────────────────────────────────────────
  // section_id 3 — RIASEC (Intereses Vocacionales)
  // Source: src/components/assessments/riasec-form.tsx
  // The form builds question text as "[section.title] TypeName"
  // and saves only non-empty selections. The total number of questions is
  // variable (depends on what the user selects). We model the 4 subsections
  // as meta-questions whose answer is a JSONB array.
  // question_number increments with n++ over SECTIONS × TYPES (only if items > 0),
  // so it's dynamic. We snapshot the 4 top-level categories instead.
  // ─────────────────────────────────────────────
  3: [
    { question_number: 1, text: "[Características de Personalidad] Realista", type: "array" },
    { question_number: 2, text: "[Características de Personalidad] Investigador", type: "array" },
    { question_number: 3, text: "[Características de Personalidad] Artístico", type: "array" },
    { question_number: 4, text: "[Características de Personalidad] Social", type: "array" },
    { question_number: 5, text: "[Características de Personalidad] Emprendedor", type: "array" },
    { question_number: 6, text: "[Características de Personalidad] Convencional", type: "array" },
    { question_number: 7, text: "[Habilidades] Realista", type: "array" },
    { question_number: 8, text: "[Habilidades] Investigador", type: "array" },
    { question_number: 9, text: "[Habilidades] Artístico", type: "array" },
    { question_number: 10, text: "[Habilidades] Social", type: "array" },
    { question_number: 11, text: "[Habilidades] Emprendedor", type: "array" },
    { question_number: 12, text: "[Habilidades] Convencional", type: "array" },
    { question_number: 13, text: "[Intereses] Realista", type: "array" },
    { question_number: 14, text: "[Intereses] Investigador", type: "array" },
    { question_number: 15, text: "[Intereses] Artístico", type: "array" },
    { question_number: 16, text: "[Intereses] Social", type: "array" },
    { question_number: 17, text: "[Intereses] Emprendedor", type: "array" },
    { question_number: 18, text: "[Intereses] Convencional", type: "array" },
    { question_number: 19, text: "[Motivaciones] Realista", type: "array" },
    { question_number: 20, text: "[Motivaciones] Investigador", type: "array" },
    { question_number: 21, text: "[Motivaciones] Artístico", type: "array" },
    { question_number: 22, text: "[Motivaciones] Social", type: "array" },
    { question_number: 23, text: "[Motivaciones] Emprendedor", type: "array" },
    { question_number: 24, text: "[Motivaciones] Convencional", type: "array" },
  ],

  // ─────────────────────────────────────────────
  // section_id 4 — HERRMANN (Dominancia Cerebral)
  // Source: src/components/assessments/herrmann-form.tsx  (8 STEPS)
  // ─────────────────────────────────────────────
  4: [
    { question_number: 1, text: "¿Qué te energiza más al estudiar o trabajar?", type: "array", options: ["Trabajar solo","Oportunidades para probar cosas nuevas","Expresar mis ideas","Planificar","Tener el control de la situación","Trabajar comunicándome con otros","Provocar cambios","Hacer que algo funcione","Explicar y conversar","Arriesgarse","Crear o usar recursos visuales","Analizar datos","Prestarle atención a los detalles","Pensar escenarios futuros","Aspectos técnicos","Producir y organizar","Trabajar con personas","Ser parte de un equipo","Usar números, estadísticas","Realizar las tareas siempre en el plazo previsto"] },
    { question_number: 2, text: "Cuando aprendés, ¿qué te gusta más?", type: "array", options: ["Evaluar y testar teorías","Recibir informaciones paso a paso","Trabajar con hechos y datos","Tomar iniciativas","Oír y compartir ideas","Elaborar teorías","Usar mi imaginación","Involucrarme emocionalmente","Aplicar análisis y lógica","Trabajar en grupo","Un ambiente bien informal","Orientaciones claras","Verificar mi comprensión","Descubrir cosas nuevas","Hacer experiencias prácticas","Criticar","Pensar sobre las ideas","Ver rápido el panorama general","Confiar en las intuiciones","Adquirir habilidades por la práctica"] },
    { question_number: 3, text: "¿Cómo preferís aprender?", type: "array", options: ["Demostraciones","Utilizando historias y música","Debates guiados","Discusiones de casos orientados hacia los números y hechos","Actividades paso a paso","Ejercicios que usan la intuición","Clases formales","Métodos tradicionales comprobados","Lectura de libros-textos","Ejercicios de análisis","Experiencias","Agenda flexible","Discusiones de casos orientados hacia las personas","Actividades paso a paso con orden claro","Trabajos con estructura clara"] },
    { question_number: 4, text: "¿Cuál es la pregunta que más te gusta hacer?", type: "text", options: ["¿Qué?","¿Cómo?","¿Por qué?","¿Quién?"] },
    { question_number: 5, text: "¿Qué te gusta más hacer?", type: "array", options: ["Descubrir","Teorizar","Cuantificar","Resumir","Agrupar","Evaluar","Organizar","Reflexionar","Conceptuar","Procesar","Analizar","Ordenar","Sentir","Explorar","Practicar","Compartir"] },
    { question_number: 6, text: "¿Cómo definís tu comportamiento?", type: "text", options: ["Me gusta Organizar","Me gusta Compartir","Me gusta Analizar","Me gusta Descubrir"] },
    { question_number: 7, text: "Cuando tengo que resolver un problema, generalmente yo...", type: "text", options: ["Miro el panorama completo y confío en lo que me dice mi instinto para encontrar la solución.","Organizo los \"hechos\" tratándolos de forma realista y cronológica.","Siento los \"hechos\" y pienso en cómo nos afecta a todos, tratando de resolverlo compartiendo lo que sentimos.","Analizo los \"hechos\" tratándolos de forma lógica y racional."] },
    { question_number: 8, text: "Cuando tengo que resolver un problema, busco...", type: "text", options: ["Una visión interpersonal, emocional, \"humana\".","Una visión organizada, detallada, \"cronológica\".","Una visión analítica, lógica, racional, \"de resultados\".","Una visión intuitiva, conceptual, visual, de \"contexto general\"."] },
  ],

  // ─────────────────────────────────────────────
  // section_id 5 — GARDNER (Inteligencias Múltiples)
  // Source: src/components/assessments/gardner-form.tsx
  // 40 questions; question_number = n++ (1-based, sequential across INTEL × questions)
  // ─────────────────────────────────────────────
  5: [
    // Lógico-Matemática (intelIdx 0)
    { question_number: 1, text: "A la hora de tomar una decisión importante, ¿te basás principalmente en los datos concretos y en lo que tiene más lógica, dejando de lado la intuición o las emociones?", type: "integer" },
    { question_number: 2, text: "Si tengo que dividir una cuenta entre amigos, puedo calcular números mentalmente con facilidad.", type: "integer" },
    { question_number: 3, text: "Me gustan los juegos o retos donde tenés que pensar en estrategia: ajedrez, Catan, puzzles de lógica, acertijos, escape rooms.", type: "integer" },
    { question_number: 4, text: "Cuando algo falla, naturalmente busco encontrar exactamente qué salió mal.", type: "integer" },
    { question_number: 5, text: "Las matemáticas y/o ciencias estaban entre mis materias favoritas en la escuela.", type: "integer" },
    // Lingüística (intelIdx 1)
    { question_number: 6, text: "Cuando escribo mensajes (chat, stories, mails) me importa cómo quedan redactados: elegiría otra palabra si la primera no suena bien.", type: "integer" },
    { question_number: 7, text: "Suelo ser el que explica o traduce algo que los demás no entendieron, porque me resulta fácil encontrar las palabras justas.", type: "integer" },
    { question_number: 8, text: "Disfruto leer o escuchar contenido que está bien escrito o narrado: un hilo de Twitter, un podcast, una novela, un ensayo.", type: "integer" },
    { question_number: 9, text: "Me pasa que al hablar o escribir uso expresiones que la gente me pide que explique porque no son tan conocidas.", type: "integer" },
    { question_number: 10, text: "Cuando tengo que convencer a alguien de algo, pienso en cómo voy a argumentarlo antes de hablar.", type: "integer" },
    // Espacial (intelIdx 2)
    { question_number: 11, text: "Me oriento bien en lugares nuevos, incluso en la primera visita, sin necesitar constantemente revisar el mapa.", type: "integer" },
    { question_number: 12, text: "Cuando tengo que armar, decorar o reorganizar algo, pienso visualmente: me imagino el resultado antes de hacerlo.", type: "integer" },
    { question_number: 13, text: "Disfruto el contenido visual: fotos, diseño, videos bien filmados, arte. Noto cuando algo está mal compuesto o mal editado.", type: "integer" },
    { question_number: 14, text: "Prefiero entender algo con un esquema, diagrama o imagen que solo con texto.", type: "integer" },
    { question_number: 15, text: "Cuando explico algo, naturalmente dibujo, gesticulo o señalo en el espacio para que la otra persona lo entienda.", type: "integer" },
    // Corporal-Cinética (intelIdx 3)
    { question_number: 16, text: "Me resulta difícil quedarme quieto mucho tiempo: necesito moverme, cambiar de posición, hacer algo con las manos.", type: "integer" },
    { question_number: 17, text: "Aprendo mejor haciendo algo físicamente que leyendo o escuchando explicaciones: prefiero practicar antes que estudiar la teoría.", type: "integer" },
    { question_number: 18, text: "Se me da bien usar las manos: armar cosas, tocar instrumentos, cocinar, dibujar, hacer trabajos manuales, deportes de contacto.", type: "integer" },
    { question_number: 19, text: "Cuando estoy pensando algo importante, me ayuda caminar, hacer ejercicio o estar en movimiento.", type: "integer" },
    { question_number: 20, text: "Me resulta natural seguir ritmos o coordinar movimientos: sea en un deporte, bailando o en cualquier actividad que requiera sincronización.", type: "integer" },
    // Musical (intelIdx 4)
    { question_number: 21, text: "Noto fácilmente cuando una canción está desafinada o tiene algo 'raro' en el ritmo o la melodía.", type: "integer" },
    { question_number: 22, text: "La música ocupa un lugar importante en mi vida cotidiana: casi siempre escucho algo mientras hago otras cosas.", type: "integer" },
    { question_number: 23, text: "Me aprendo las letras o melodías de canciones rápido, con pocas escuchas.", type: "integer" },
    { question_number: 24, text: "Cuando escucho música, naturalmente sigo el ritmo con el cuerpo (golpeando, moviendo la cabeza, tarareando).", type: "integer" },
    { question_number: 25, text: "Me imagino cómo sonaría algo si le cambiara la música de fondo, o me doy cuenta del impacto que tiene la música en una escena de serie o película.", type: "integer" },
    // Naturalista (intelIdx 5)
    { question_number: 26, text: "Me llama la atención observar la naturaleza: plantas, animales, paisajes, patrones climáticos.", type: "integer" },
    { question_number: 27, text: "Soy bueno para notar diferencias entre cosas similares: razas de perros, tipos de hojas, características de distintos lugares.", type: "integer" },
    { question_number: 28, text: "Me interesa entender cómo funcionan los ecosistemas, el clima o los procesos biológicos, más allá de lo que veo en la escuela.", type: "integer" },
    { question_number: 29, text: "Cuando puedo elegir, prefiero estar al aire libre o en contacto con la naturaleza antes que en espacios cerrados.", type: "integer" },
    { question_number: 30, text: "Cuando estoy en un lugar natural, noto detalles que otras personas no suelen mencionar.", type: "integer" },
    // Intrapersonal (intelIdx 6)
    { question_number: 31, text: "Cuando me pasa algo importante, necesito procesar en soledad antes de hablar con alguien sobre el tema.", type: "integer" },
    { question_number: 32, text: "Tengo bastante claro qué cosas me importan de verdad, en qué soy bueno y en qué no.", type: "integer" },
    { question_number: 33, text: "Suelo reflexionar sobre por qué actúo como actúo: analizo mis propias reacciones, emociones y decisiones.", type: "integer" },
    { question_number: 34, text: "Tengo metas personales sobre las que pienso seguido: lo que quiero lograr, en qué quiero mejorar.", type: "integer" },
    { question_number: 35, text: "Me resulta fácil estar solo sin aburrirme: disfruto del tiempo conmigo mismo.", type: "integer" },
    // Interpersonal (intelIdx 7)
    { question_number: 36, text: "Mis amigos suelen contarme sus problemas y pedirme opinión: se sienten cómodos hablando conmigo.", type: "integer" },
    { question_number: 37, text: "Me doy cuenta rápido cuando alguien está incómodo o algo está mal, incluso si no lo dice directamente.", type: "integer" },
    { question_number: 38, text: "Disfruto coordinar grupos, ya sea para estudiar, jugar, organizar algo o trabajar en proyectos.", type: "integer" },
    { question_number: 39, text: "Se me hace relativamente fácil llevarme bien con personas muy distintas entre sí.", type: "integer" },
    { question_number: 40, text: "Me resulta satisfactorio ayudar a alguien a entender algo o aprender algo nuevo: soy paciente explicando.", type: "integer" },
  ],

  // ─────────────────────────────────────────────
  // section_id 6 — PROYECTIVA (Preguntas Proyectivas)
  // Source: src/components/assessments/proyectivas-form.tsx
  // 12 frases + 6 preguntas abiertas = 18 questions
  // ─────────────────────────────────────────────
  6: [
    { question_number: 1, text: "Siempre me gustó…", type: "text" },
    { question_number: 2, text: "En mi casa…", type: "text" },
    { question_number: 3, text: "Para trabajar es importante…", type: "text" },
    { question_number: 4, text: "Elegir…", type: "text" },
    { question_number: 5, text: "A veces me da miedo…", type: "text" },
    { question_number: 6, text: "Lo que más me atrae de un trabajo es…", type: "text" },
    { question_number: 7, text: "En la vida quiero llegar a ser…", type: "text" },
    { question_number: 8, text: "Ir a la universidad hoy…", type: "text" },
    { question_number: 9, text: "Las personas que estudian…", type: "text" },
    { question_number: 10, text: "Siento que los demás esperan que yo…", type: "text" },
    { question_number: 11, text: "Cuando se me acerca una figura de autoridad, yo…", type: "text" },
    { question_number: 12, text: "Una profesión me daría la posibilidad de…", type: "text" },
    { question_number: 13, text: "Imaginá que pasaron 10 años y sentís que estás bien con tu vida. ¿Cómo es un día de esa vida?", type: "text" },
    { question_number: 14, text: "Si hoy pudieras elegir sin miedo ni presión externa, ¿hacia dónde irías?", type: "text" },
    { question_number: 15, text: "¿Qué es lo que más te frena hoy para avanzar hacia lo que querés?", type: "text" },
    { question_number: 16, text: "Seamos honestos: ¿qué tan difícil te resulta sentarte y ponerte a estudiar? ¿Cuántas horas seguidas podés hacerlo?", type: "text" },
    { question_number: 17, text: "Modelos: ¿A qué personas te quisieras parecer? ¿Por qué?", type: "text" },
    { question_number: 18, text: "Cuando eras chico/a, ¿qué querías ser de grande?", type: "text" },
  ],

  // ─────────────────────────────────────────────
  // section_id 7 — AUTODESC (Auto-descubrimiento)
  // Source: src/components/assessments/autodescubrimiento-form.tsx
  // allQs is SECTIONS.flatMap(s => s.questions) — 12 questions total
  // ─────────────────────────────────────────────
  7: [
    { question_number: 1, text: "Contá cómo sos como persona. Podés arrancar con \"Yo soy…\" y usar adjetivos o frases cortas.", type: "text" },
    { question_number: 2, text: "Felicidad: ¿Qué cosas te hacen feliz en el día a día, por más pequeñas que sean?", type: "text" },
    { question_number: 3, text: "Infelicidad: ¿Qué cosas te hacen infeliz y quisieras evitar o minimizar?", type: "text" },
    { question_number: 4, text: "Éxito: ¿Cómo definirías con tus palabras el \"éxito profesional\"?", type: "text" },
    { question_number: 5, text: "Si supieras que las próximas cinco cosas que hagas te saldrán como querés, ¿cuáles serían?", type: "text" },
    { question_number: 6, text: "Orígenes — Mi familia, mi casa, mi barrio. ¿Qué cosas de ahí me marcaron?", type: "text" },
    { question_number: 7, text: "Pasado — Mi infancia, mis juegos, mis amigos y mi escuela.", type: "text" },
    { question_number: 8, text: "Perfil — Mis intereses y habilidades. Lo que se me da bien.", type: "text" },
    { question_number: 9, text: "Presente — ¿Cómo es mi vida hoy?", type: "text" },
    { question_number: 10, text: "Futuro — Mis sueños y proyectos.", type: "text" },
    { question_number: 11, text: "Recuerdo de Satisfacción #1 — Un hecho que te haya producido mucha satisfacción, donde hayas tenido un papel activo.", type: "text" },
    { question_number: 12, text: "Recuerdo de Satisfacción #2 — Otro hecho inolvidable donde hayas tenido protagonismo.", type: "text" },
    { question_number: 13, text: "Reflexión — ¿Qué patrones o talentos encontrás en común entre estos dos recuerdos?", type: "text" },
  ],

  // ─────────────────────────────────────────────
  // section_id 8 — APRENDIZAJE (Estilo de Aprendizaje / VAK)
  // TODO: No form component found for section_id 8 in src/components/assessments/.
  // The constants.ts references APRENDIZAJE but there is no *-form.tsx for it.
  // Check if this section uses a different component or was not yet implemented.
  // ─────────────────────────────────────────────
  8: [],

  // ─────────────────────────────────────────────
  // section_id 9 — LIFESTYLE (Estilo de Vida)
  // Source: src/components/assessments/estilo-vida-form.tsx
  // CHIP_GROUPS (4 questions) + RADIO_GROUPS (10 questions) = 14
  // ─────────────────────────────────────────────
  9: [
    { question_number: 1, text: "¿Qué valores querés que tu ocupación refleje?", type: "array", options: ["Servicio a otros","Estabilidad y seguridad","Justicia y ética","Innovación","Creatividad","Prestigio y reconocimiento","Impacto social"] },
    { question_number: 2, text: "¿Con qué tipo de personas te gustaría rodearte?", type: "array", options: ["Jóvenes dinámicos","Personas experimentadas","Gente creativa","Personas organizadas","Públicos diversos"] },
    { question_number: 3, text: "¿Qué rol te imaginás dentro de un equipo?", type: "array", options: ["Líder y coordinador","Creativo · generador de ideas","Organizador · planificador","Ejecutor · resolutivo","Facilitador · mediador"] },
    { question_number: 4, text: "Límites — No aceptaría un trabajo que...", type: "array", options: ["Vaya contra mis valores","Me aísle demasiado","Implique exceso de horas","Sea rutinario al extremo","Fomente competencia desleal"] },
    { question_number: 5, text: "Interacción", type: "text", options: ["Mucho contacto social","Interacciones puntuales","Trabajo individual","Trabajo en pequeños grupos"] },
    { question_number: 6, text: "Horarios", type: "text", options: ["Horario fijo de oficina","Flexibilidad parcial","Horarios libres y autogestionados"] },
    { question_number: 7, text: "Rutina", type: "text", options: ["Tareas variadas cada día","Rutina estable y predecible","Mezcla de ambas"] },
    { question_number: 8, text: "Nivel de exigencia", type: "text", options: ["Alta exigencia física","Alta exigencia mental","Punto medio de exigencia","Baja exigencia, mayor tranquilidad"] },
    { question_number: 9, text: "Geografía", type: "text", options: ["Ciudad grande","Ciudad pequeña","Campo o naturaleza","Trabajo que implique viajar","Trabajo remoto desde casa"] },
    { question_number: 10, text: "Espacio ideal", type: "text", options: ["Oficina formal","Espacio creativo y flexible","Aire libre","Taller o lugar práctico","Casa propia"] },
    { question_number: 11, text: "Equilibrio vida / trabajo", type: "text", options: ["Muy importante — tiempo libre y familia son prioridad","Importante — puedo sacrificarlo a veces","Poco importante — priorizo el trabajo"] },
    { question_number: 12, text: "Ingresos", type: "text", options: ["Estabilidad fija (sueldo seguro)","Variables según logros y comisiones","Crecimiento a largo plazo (inversiones)"] },
    { question_number: 13, text: "Impacto que querés tener", type: "text", options: ["Familia y círculo cercano","Comunidad","País","Global"] },
    { question_number: 14, text: "Cómo querés que sea tu día típico", type: "text", options: ["Tranquilo y organizado","Dinámico y cambiante","Creativo y motivador","Intenso y desafiante"] },
  ],

  // ─────────────────────────────────────────────
  // section_id 10 — FUTURO (Proyección de Futuro / Visión a Futuro)
  // Source: src/components/assessments/vision-futuro-form.tsx
  // The form saves 3 aggregated question_numbers (1, 2, 3) with JSON blobs.
  // Sub-items are: 4 visualizaciones, 3 lugarFantaseado, 24 preguntasProfundidad.
  // We snapshot the 3 top-level question texts as they appear in the save payload.
  // ─────────────────────────────────────────────
  10: [
    { question_number: 1, text: "Visualizaciones", type: "text" },
    { question_number: 2, text: "Lugar Fantaseado Ocupacional", type: "text" },
    { question_number: 3, text: "Preguntas de Profundidad", type: "text" },
  ],

  // ─────────────────────────────────────────────
  // section_id 11 — FAMILIA (Contexto Familiar)
  // Source: src/components/assessments/arbol-genealogico-form.tsx
  // ─────────────────────────────────────────────
  11: [
    { question_number: 1, text: "¿A qué se dedican las personas adultas más influyentes?", type: "text" },
    { question_number: 2, text: "¿Alguien cuyo recorrido laboral admires?", type: "text" },
    { question_number: 3, text: "¿Recorrido que no quisieras repetir?", type: "text" },
    { question_number: 4, text: "En tu casa, ¿qué se valora más?", type: "text" },
    { question_number: 5, text: "¿Expectativas sobre qué estudiar?", type: "text" },
    { question_number: 6, text: "¿Te sentís apoyado/a para elegir?", type: "text", options: ["Sí", "Más o menos", "No"] },
    { question_number: 7, text: "Cuando hablás de tu futuro, ¿qué pasa?", type: "text", options: ["Me escuchan y acompañan","Me orientan bastante","Me presionan","Casi no se habla del tema"] },
  ],

  // ─────────────────────────────────────────────
  // section_id 12 — UNIVERSIDAD (Scan Universitario)
  // Source: src/components/assessments/universidad-form.tsx
  // Note: question 7 is conditional (only saved when trabajar === "si")
  // ─────────────────────────────────────────────
  12: [
    { question_number: 1, text: "Costo", type: "text", options: ["sinCuota","cuotaMedia","cuotaAlta"] },
    { question_number: 2, text: "Ubicación (zona de vivienda)", type: "text", options: ["CABA","La Plata","Zona Norte","Gran Buenos Aires SUR","Gran Buenos Aires OESTE","Provincia"] },
    { question_number: 3, text: "Tiempo de viaje aceptado", type: "text", options: ["Menos de 30 min","30 min a 1 hora","Más de 1 hora"] },
    { question_number: 4, text: "Dispuesto/a a mudarse", type: "text", options: ["Sí","No"] },
    { question_number: 5, text: "¿Dispuesto/a a realizar 1 o 2 semestres de ingreso/CBC?", type: "text", options: ["si","no"] },
    { question_number: 6, text: "¿Tenés que trabajar mientras estudiás?", type: "text", options: ["si","no"] },
    { question_number: 7, text: "¿Cuánto trabajarías?", type: "text", options: ["Part-time","Full-time"] },
    { question_number: 8, text: "Prestigio", type: "text", options: ["Muy importante","Algo importante","No me importa"] },
    { question_number: 9, text: "Valores e ideología", type: "text", options: ["Afiliación religiosa","Ambiente laico","Me es indiferente"] },
    { question_number: 10, text: "Instalaciones", type: "text", options: ["Me importa mucho","Algo me importa","No es prioritario"] },
    { question_number: 11, text: "Modalidad de cursada", type: "text", options: ["Presencial","Híbrido","Virtual"] },
    { question_number: 12, text: "Podio de prioridades", type: "text" },
  ],

  // ─────────────────────────────────────────────
  // section_id 13 — VIBECHECK
  // Source: src/components/assessments/vibecheck-form.tsx
  // The follow-up question (q2) text is dynamic: it comes from the selected persona.
  // We snapshot the fixed first question; q2 is dynamic so we leave a note.
  // ─────────────────────────────────────────────
  13: [
    { question_number: 1, text: "¿Con quién te sentís identificado/a?", type: "text", options: ["desorientado","multipotencial","detallista","desconectada","convencido","confirmada","tiburon"] },
    // TODO: question_number 2 is the follow-up question from the selected persona.
    // Its text varies per persona selection. Not snapshotting here — responses.question
    // will contain the full text; question_hash backfill from migration 009 covers it.
  ],

  // ─────────────────────────────────────────────
  // section_id 14 — VOSCOLEGIO
  // Source: src/components/assessments/voscolegio-form.tsx
  // question 1: slider (integer), question 2: text, questions 3..19: one per MATERIAS
  // ─────────────────────────────────────────────
  14: [
    { question_number: 1, text: "Termómetro familiar", type: "integer" },
    { question_number: 2, text: "Contenido digital", type: "text" },
    { question_number: 3, text: "Matemática", type: "text", options: ["gusta","indif","quemado"] },
    { question_number: 4, text: "Lengua y Literatura", type: "text", options: ["gusta","indif","quemado"] },
    { question_number: 5, text: "Historia", type: "text", options: ["gusta","indif","quemado"] },
    { question_number: 6, text: "Geografía", type: "text", options: ["gusta","indif","quemado"] },
    { question_number: 7, text: "Biología", type: "text", options: ["gusta","indif","quemado"] },
    { question_number: 8, text: "Física", type: "text", options: ["gusta","indif","quemado"] },
    { question_number: 9, text: "Química", type: "text", options: ["gusta","indif","quemado"] },
    { question_number: 10, text: "Inglés", type: "text", options: ["gusta","indif","quemado"] },
    { question_number: 11, text: "Educación Física", type: "text", options: ["gusta","indif","quemado"] },
    { question_number: 12, text: "Formación Ética y Ciudadana", type: "text", options: ["gusta","indif","quemado"] },
    { question_number: 13, text: "Filosofía", type: "text", options: ["gusta","indif","quemado"] },
    { question_number: 14, text: "Economía / Economía Política", type: "text", options: ["gusta","indif","quemado"] },
    { question_number: 15, text: "Contabilidad / Administración", type: "text", options: ["gusta","indif","quemado"] },
    { question_number: 16, text: "Informática / Tecnología", type: "text", options: ["gusta","indif","quemado"] },
    { question_number: 17, text: "Arte / Educación Artística", type: "text", options: ["gusta","indif","quemado"] },
    { question_number: 18, text: "Música", type: "text", options: ["gusta","indif","quemado"] },
    { question_number: 19, text: "Construcción de Ciudadanía / Sociales", type: "text", options: ["gusta","indif","quemado"] },
  ],

  // ─────────────────────────────────────────────
  // section_id 15 — PADRES
  // Source: src/components/assessments/padres-form.tsx
  // buildFlow() produces dynamic text with the student's name.
  // In prod the name is always "el/la estudiante" (hardcoded), so the text
  // for name-interpolated questions is deterministic.
  // question_number 0 = "¿Qué familiar sos?" (metadata prefix)
  // questions 1..N = chat flow text answers (variable, see buildFlow)
  // We snapshot the stable question texts from buildFlow(nombre).
  // ─────────────────────────────────────────────
  15: [
    { question_number: 0, text: "¿Qué familiar sos?", type: "text" },
    { question_number: 1, text: "¿Cuál es tu nombre y apellido, tu edad y tu ocupación actual?", type: "text" },
    { question_number: 2, text: "¿Te sentís satisfecho/a con tu ocupación actual?", type: "text" },
    { question_number: 3, text: "¿Comenzaste y abandonaste alguna carrera en algún momento?", type: "text" },
    { question_number: 4, text: "¿Cuál fue esa carrera y qué pasó? Contanos un poco más.", type: "text" },
    { question_number: 5, text: "¿Te hubiese gustado realizar otra actividad o estudiar otra carrera? ¿Cuál? ¿Recordás por qué no lo hiciste?", type: "text" },
    { question_number: 6, text: "¿Cuáles son las profesiones y ocupaciones que más valorás hoy en día?", type: "text" },
    { question_number: 7, text: "¿Creés que hay carreras con mayor salida laboral actualmente? ¿Cuáles sí y cuáles menos?", type: "text" },
    { question_number: 8, text: "¿Hay alguna ocupación o profesión particular que te gustaría ver en el/la estudiante? ¿Cuál y por qué?", type: "text" },
    { question_number: 9, text: "¿Qué habilidades o cualidades destacarías en el/la estudiante? ¿Qué aspectos crees que debería trabajar en lo personal?", type: "text" },
    { question_number: 10, text: "¿Cómo ves la posibilidad de que el/la estudiante empiece a trabajar en lugar de estudiar?", type: "text" },
    { question_number: 11, text: "Para terminar, ¿hay algo más que quieras agregar? Cualquier comentario que sientas que puede ser útil.", type: "text" },
  ],

  // ─────────────────────────────────────────────
  // section_id 16 — PROFESIONALES
  // Source: src/components/assessments/profesionales-form.tsx
  // The form iterates over 9 professionals; for each: one responseArray question
  // for talents + one responseText per open/options answer.
  // question_number increments with n++ globally across all professionals.
  // We snapshot the 9 area talent questions + the 2 follow-up questions per prof = 27 rows.
  // ─────────────────────────────────────────────
  16: [
    // negocios
    { question_number: 1, text: "[Administración y Negocios] Actividades", type: "array" },
    { question_number: 2, text: "¿Alguna vez te imaginaste teniendo tu propio negocio o proyecto?", type: "text" },
    { question_number: 3, text: "¿Hay algún aspecto del mundo de los negocios que siempre te generó curiosidad?", type: "text" },
    // sociales
    { question_number: 4, text: "[Sociales y RRHH] Actividades", type: "array" },
    { question_number: 5, text: "¿Qué es lo que más te moviliza cuando se trata de trabajar con personas?", type: "text" },
    { question_number: 6, text: "¿Hay algún grupo social, problemática o comunidad que te quite el sueño?", type: "text" },
    // humanidades
    { question_number: 7, text: "[Humanidades y Educación] Actividades", type: "array" },
    { question_number: 8, text: "¿Qué rol te imaginás más naturalmente en el futuro?", type: "text" },
    { question_number: 9, text: "¿Hay algún campo de las humanidades o la psicología que siempre te generó curiosidad?", type: "text" },
    // salud
    { question_number: 10, text: "[Salud] Actividades", type: "array" },
    { question_number: 11, text: "¿Qué aspecto del mundo de la salud te genera más vocación?", type: "text" },
    { question_number: 12, text: "¿Hay algo del mundo de la salud que siempre te llamó la atención?", type: "text" },
    // juridicas
    { question_number: 13, text: "[Jurídicas y Política] Actividades", type: "array" },
    { question_number: 14, text: "¿Desde qué lugar te imaginás haciendo una diferencia?", type: "text" },
    { question_number: 15, text: "¿Hay alguna causa, injusticia o problemática que especialmente te movilice?", type: "text" },
    // ecologia
    { question_number: 16, text: "[Ecología y Naturaleza] Actividades", type: "array" },
    { question_number: 17, text: "¿Qué es lo que más te conecta con el mundo natural?", type: "text" },
    { question_number: 18, text: "¿Hay algún ecosistema, especie o problema ambiental que te apasione especialmente?", type: "text" },
    // exactas
    { question_number: 19, text: "[Exactas e Ingeniería] Actividades", type: "array" },
    { question_number: 20, text: "¿Cómo sos cuando te encontrás con un problema difícil?", type: "text" },
    { question_number: 21, text: "¿Hay algún problema técnico, científico o tecnológico que te parezca especialmente fascinante?", type: "text" },
    // comunicacion
    { question_number: 22, text: "[Comunicación y Medios] Actividades", type: "array" },
    { question_number: 23, text: "¿Qué forma de contar historias te llama más?", type: "text" },
    { question_number: 24, text: "¿Hay algún medio, formato o historia que te haya impactado y que siempre recordás?", type: "text" },
    // arte
    { question_number: 25, text: "[Arte y Diseño] Actividades", type: "array" },
    { question_number: 26, text: "¿Cómo definirías tu relación con el arte y la expresión?", type: "text" },
    { question_number: 27, text: "¿Hay alguna forma artística que siempre quisiste explorar pero nunca te animaste?", type: "text" },
  ],
};
