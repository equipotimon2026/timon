**TIMON**

Guía Funcional de Outputs del Producto

*Referencia para equipos de modelo e IA*

# **Introducción**

Este documento describe qué debe generar el modelo en cada sección visual del producto Timon. Está organizado por Acto, Capítulo y Elemento visual. Para cada elemento se especifica: qué muestra, qué tipo de contenido es, qué debe devolver el modelo, el nivel de detalle esperado y el formato ideal de respuesta.

El producto está estructurado en 3 actos principales que el usuario recorre de forma secuencial:

* Acto 1 – Entenderte ("Persona"): perfil psicológico completo del usuario

* Acto 2 – Los Caminos ("Carreras"): lista de carreras recomendadas con detalle profundo

* Acto 3 – Dónde Construirlo ("Universidades"): lista de universidades con detalle profundo

# **ACTO 1 — ENTENDERTE**

Este acto presenta el perfil completo del usuario. Está dividido en 9 capítulos secuenciales. Cada capítulo muestra una dimensión diferente de la persona.

## **Capítulo 01 — Cómo llegamos hasta acá**

Explica al usuario las dimensiones que se usaron para construir su perfil. No requiere salida narrativa personal; es una pantalla expositiva.

### **1.1 Párrafo introductorio del método**

| Tipo | Texto fijo |
| :---- | :---- |
| **Qué muestra** | Un párrafo que explica brevemente el enfoque del proceso de análisis |
| **Nivel de detalle** | 2-3 líneas, tono simple y accesible |
| **Formato** | Un solo párrafo corrido. Sin listas. |

### **1.2 Cards de Dimensiones Analizadas**

Se muestran 4 cards con los pilares del análisis. Cada card tiene: nombre de la dimensión y descripción corta.

| Tipo | Lista de cards — texto fijo |
| :---- | :---- |
| **Cantidad** | 4 dimensiones fijas |
| **Por cada dimensión** | Nombre (ej: 'Arquitectura mental') \+ descripción de 1-2 líneas explicando qué mide esa dimensión |
| **Tono** | Claro, no técnico. Como si le hablaras a un adolescente curioso. |
| **Formato** | Array de objetos: { name: string, description: string } |

### **1.3 Nota de cierre / aclaración**

| Tipo | Texto estático  |
| :---- | :---- |
| **Qué muestra** | Una frase corta que aclara que los datos no definen límites, sino una 'foto del momento' |
| **Formato** | 1 línea. Puede ser fija o generada. |

## **Capítulo 02 — Tu forma de pensar**

Muestra los rasgos cognitivos del usuario: cómo procesa información, cómo resuelve problemas. Cada rasgo tiene nombre, nivel de presencia y descripción.

### **2.1 Párrafo introductorio**

| Tipo | Texto fijo |
| :---- | :---- |
| **Qué muestra** | 1-2 oraciones contextualizando la sección |
| **Formato** | Párrafo corto, tono cálido y sin tecnicismos |

### **2.2 Cards de Rasgos Cognitivos**

| Tipo | Lista de cards — texto dinámico |
| :---- | :---- |
| **Cantidad recomendada** | 3 a 5 rasgos |
| **Por cada rasgo** | nombre \+ etiqueta de nivel (ej: 'Muy marcado') \+ número del nivel (0-100) \+ descripción de 2-3 líneas \+ flag si es tensión/contradicción |
| **Tono** | Descriptivo, no evaluativo. Sin 'sos bueno en' ni 'sos malo en'. |
| **Formato ideal** | Array de objetos: { name, level: number, levelLabel, description, isTension?: boolean } |

* Rasgos típicos que puede incluir: Pensamiento sistemático, Orientación analítica, Procesamiento profundo, Tolerancia a la ambigüedad, Pensamiento creativo, etc.

* isTension \= true cuando el rasgo representa una posible fricción o zona de desarrollo (se renderiza con borde ámbar)

## **Capítulo 03 — Tu mapa interno (Psicometría)**

Este capítulo presenta los resultados de 4 herramientas psicométricas. Tiene 4 pestañas: RIASEC, Inteligencias, Dominancia Cerebral y Personalidad MIPS.

### **3.1 — Pestaña RIASEC**

**3.1.a Código primario (Hero card)**

| Tipo | Card destacada — texto dinámico |
| :---- | :---- |
| **Qué muestra** | La letra RIASEC dominante, su nombre (ej: 'Investigador') y una descripción |
| **Formato** | { code: 'I', label: 'Investigador', description: string } |
| **Descripción** | 3-5 líneas explicando qué caracteriza a ese tipo: qué le mueve, cómo trabaja, qué prefiere. Tono narrativo, no técnico. |

**3.1.b Códigos secundarios (Barras de progreso)**

| Tipo | Lista con barras de progreso — datos numéricos |
| :---- | :---- |
| **Qué muestra** | Las 5 letras restantes con su puntaje y nombre |
| **Formato** | Array de 5 objetos: { code: 'A'|'R'|'S'|'E'|'C', label: string, score: number (0-100) } |
| **Orden** | De mayor a menor score |

**3.1.c Insight RIASEC**

| Tipo | Texto dinámico — frase narrativa |
| :---- | :---- |
| **Qué muestra** | 1-2 líneas interpretando la combinación de los 2 códigos dominantes |
| **Ejemplo** | 'Tu perfil I-A sugiere que te atraen campos donde puedas investigar con libertad creativa.' |
| **Formato** | String de 1-2 oraciones |

### 

### 

### **3.2 — Pestaña Inteligencias Múltiples**

**3.2.a Top 3 (Cards destacadas)**

| Tipo | Grid de 3 cards — datos numéricos \+ texto |
| :---- | :---- |
| **Qué muestra** | Las 3 inteligencias más altas, cada una con: nombre, icono emoji, puntaje (0-100), descripción corta |
| **Descripción** | 1 línea que explica qué capacidad representa esa inteligencia |
| **Primera card** | Marcada como 'Top' — la inteligencia más dominante |
| **Formato** | Array de 3: { name, score, icon, description } |

**3.2.b Resto de inteligencias (Lista compacta)**

| Tipo | Lista compacta con mini-barras |
| :---- | :---- |
| **Qué muestra** | Las inteligencias restantes (normalmente 5\) en formato reducido: icono \+ nombre \+ puntaje \+ barra |
| **Formato** | Array: { name, score, icon, description } |
| **Inteligencias típicas** | Lógico-Matemática, Lingüística, Intrapersonal, Espacial, Interpersonal, Musical, Naturalista, Corporal |

### **3.3 — Pestaña Dominancia Cerebral**

**3.3.a Grid 2x2 de cuadrantes**

| Tipo | Grilla 2x2 — datos numéricos \+ texto |
| :---- | :---- |
| **Qué muestra** | 4 cuadrantes (A, B, C, D) cada uno con: letra, nombre, sublabel descriptivo, puntaje (0-100), barra de progreso |
| **El cuadrante dominante** | Se resalta visualmente con un punto pulsante |
| **Cuadrante A** | Lógico — Analítico, crítico, factual |
| **Cuadrante B** | Organizado — Secuencial, detallista, planificador |
| **Cuadrante C** | Relacional — Emocional, expresivo, empático |
| **Cuadrante D** | Experimental — Intuitivo, integrador, innovador |
| **Formato** | Array de 4: { id: 'A'|'B'|'C'|'D', label, sublabel, score, description } |

**3.3.b Insight Dominancia**

| Tipo | Texto dinámico |
| :---- | :---- |
| **Qué muestra** | 1-2 líneas interpretando la combinación dominante |
| **Ejemplo** | 'Predomina el hemisferio izquierdo con apertura a la innovación. Combinás lógica con visión de conjunto.' |
| **Formato** | String |

### **3.4 — Pestaña Personalidad (MIPS / Millon)**

**3.4.a Patrón central (Frase de personalidad)**

| Tipo | Card destacada — texto dinámico |
| :---- | :---- |
| **Qué muestra** | Una frase descriptiva que sintetiza el patrón de personalidad del usuario |
| **Longitud** | 1-2 oraciones, 15-25 palabras |
| **Ejemplo** | 'Pensadora independiente con orientación hacia la modificación activa del entorno' |
| **Tono** | Descriptivo, no clínico. Accesible y claro. |
| **Formato** | String |

**3.4.b Rasgos MIPS (Lista con barras)**

| Tipo | Lista de rasgos con barra de progreso — texto \+ número |
| :---- | :---- |
| **Qué muestra** | Entre 4 y 6 rasgos, cada uno con: nombre del eje, polo dominante, puntaje, descripción |
| **Por cada rasgo** | Eje (ej: 'Apertura/Preservación'), polo activo (ej: 'Apertura'), score (0-100), descripción de 1-2 líneas |
| **Formato** | Array: { name, pole, score, description } |
| **Ejes posibles** | Apertura/Preservación, Modificación/Acomodación, Individualismo/Protección, Reflexión/Afectividad, entre otros |

## **Capítulo 04 — Tu energía**

Muestra qué activa al usuario y qué lo agota. Dos listas diferenciadas visualmente.

### **4.1 Párrafo introductorio**

| Tipo | Texto fijo |
| :---- | :---- |
| **Formato** | 2-3 líneas contextualizando la importancia de conocer el perfil energético |

### **4.2 Lista: Lo que te activa**

| Tipo | Lista — texto dinámico |
| :---- | :---- |
| **Cantidad recomendada** | 4 a 6 ítems |
| **Por cada ítem** | Una oración o frase que describe una situación, actividad o contexto que genera energía |
| **Tono** | Concreto y específico. No abstracto. |
| **Ejemplo ítem** | 'Resolver problemas que tienen una lógica interna' |
| **Formato** | Array de strings: activates: string\[\] |

### **4.3 Lista: Lo que te agota**

| Tipo | Lista — texto dinámico |
| :---- | :---- |
| **Cantidad recomendada** | 4 a 6 ítems |
| **Por cada ítem** | Una oración que describe qué situación o contexto drena al usuario |
| **Formato** | Array de strings: drains: string\[\] |

## **Capítulo 05 — Lo que te atrae**

Muestra las áreas de interés del usuario ordenadas por intensidad, con barras de progreso.

### **5.1 Párrafo introductorio**

| Tipo | Texto fijo |
| :---- | :---- |
| **Formato** | 2-3 líneas. Puede incluir una observación sobre la naturaleza de los intereses del usuario. |

### **5.2 Cards de Áreas de Interés**

| Tipo | Lista de cards con barra de progreso — texto \+ número |
| :---- | :---- |
| **Cantidad recomendada** | 4 a 6 áreas |
| **Por cada área** | Nombre del área, puntaje (0-100), etiqueta de nivel (ej: 'Muy marcado'), descripción corta de 1 línea |
| **Descripción** | Explica qué atrae al usuario de esa área, en 1-2 oraciones |
| **Orden** | De mayor a menor score |
| **Formato** | Array: { name, score, levelLabel, insight } |
| **Áreas posibles** | Tecnología, Ciencias, Arte, Humanidades, Negocios, Diseño, Datos, Resolución de problemas, Educación, etc. |

## **Capítulo 06 — Lo que (probablemente) no va con vos**

Muestra áreas o contextos que probablemente no encajan con el perfil del usuario. Tono delicado y no excluyente.

### **6.1 Párrafo introductorio**

| Tipo | Texto fijo |
| :---- | :---- |
| **Formato** | 2-3 líneas. Debe aclarar que no es un juicio sino una delimitación útil. |

### **6.2 Cards de Áreas No Alineadas**

| Tipo | Lista de cards — texto dinámico |
| :---- | :---- |
| **Cantidad recomendada** | 2 a 4 áreas |
| **Por cada área** | Nombre del área, descripción de 2-3 líneas explicando por qué no encaja con el perfil, nivel de certeza de la inferencia |
| **Nivel de certeza** | 'alta', 'media', o 'tentativa'. Si es tentativa, se agrega una nota aclaratoria. |
| **Tono** | Suave, nunca excluyente. No dice 'no podés', dice 'probablemente no te va a sostener'. |
| **Formato** | Array: { name, description, inferenceStrength: 'alta'|'media'|'tentativa' } |

### **6.3 Frase de Reencuadre**

| Tipo | Texto dinámico — InsightCard |
| :---- | :---- |
| **Qué muestra** | Una frase que relativiza la sección y recuerda que no es un límite definitivo |
| **Ejemplo** | 'Que algo no te atraiga no significa que no puedas hacerlo. Significa que probablemente no sea el mejor uso de tu energía a largo plazo.' |
| **Formato** | String de 1-2 oraciones |

## 

## 

## **Capítulo 07 — Tu tipo de vida ideal**

Muestra cómo el usuario imagina vivir: preferencias de autonomía, entorno, ritmo, especialización. Visualización de sliders entre dos polos.

### **7.1 Párrafo introductorio**

| Tipo | Texto estático (fijo) |
| :---- | :---- |
| **Qué muestra** | 'No se trata solo de qué querés hacer, sino de cómo querés vivir mientras lo hacés.' |

### **7.2 Ejes de Estilo de Vida (Sliders)**

| Tipo | Lista de sliders — datos numéricos \+ texto |
| :---- | :---- |
| **Cantidad recomendada** | 4 a 6 ejes |
| **Por cada eje** | Etiqueta del polo izquierdo, etiqueta del polo derecho, valor (0-100), frase de interpretación |
| **El valor** | Determina la posición del punto deslizante entre los dos polos |
| **Interpretación** | 1-2 líneas que explican lo que ese valor significa para el usuario |
| **Ejes posibles** | Seguridad ↔ Riesgo, Independencia ↔ Colaboración, Estructura ↔ Flexibilidad, Especialización ↔ Generalismo, Dinámico ↔ Estable |
| **Formato** | Array: { leftLabel, rightLabel, value: number (0-100), interpretation: string } |

## **Capítulo 08 — Tu esencia (Resumen Final)**

Es el capítulo de cierre del Acto 1\. Sintetiza todo el perfil en una visualización tipo 'constelación' más un resumen narrativo. Es el momento emocional más importante del producto.

### **8.1 Mapa de Constelación (Visual)**

| Tipo | Gráfico visual / SVG — datos estructurados |
| :---- | :---- |
| **Qué muestra** | Un mapa orbital con el nombre del usuario en el centro y nodos distribuidos en 3 anillos |
| **Anillo 1 (inner)** | 3 rasgos centrales / core traits — nodos grandes con emoji \+ titulo |
| **Anillo 2 (middle)** | 4-5 rasgos de soporte — nodos medianos emoji  \+ titulo |
| **Anillo 3 (outer)** | 4-6 rasgos contextuales — nodos pequeños emoji \+  tiutlo |
| **Formato por nodo** | { label: string, icon: emoji, tier: 1|2|3, color: 'indigo'|'violet'|'emerald'|'amber'|'sky' } |
| **Nota** | El modelo debe generar los nodos ordenados por relevancia e importancia para ese perfil específico |

### **8.2 Frase Central**

| Tipo | Texto dinámico — frase destacada |
| :---- | :---- |
| **Qué muestra** | La síntesis más importante del perfil del usuario en una oración |
| **Longitud** | 25-40 palabras |
| **Tono** | Primera persona parcial, cálido, afirmativo, profundo |
| **Ejemplo** | 'Sos alguien que encuentra sentido en entender cómo funcionan las cosas, construir soluciones que funcionen, y tener la autonomía para hacerlo a tu manera.' |
| **Formato** | String |

### **8.3 Tag compartible**

| Tipo | Texto dinámico — etiqueta corta |
| :---- | :---- |
| **Qué muestra** | 3 palabras clave que definen el perfil, separadas por puntos |
| **Ejemplo** | 'Investigadora. Analítica. Creativa.' |
| **Uso** | Se muestra debajo de la frase central y se incluye al compartir |
| **Formato** | String de 3 adjetivos/sustantivos separados por punto |

### **8.4 Grid de Esencia (4 dimensiones)**

| Tipo | Grilla 2x2 — texto dinámico |
| :---- | :---- |
| **Qué muestra** | Un resumen de los 4 resultados psicométricos más importantes |
| **Celda RIASEC** | Los 2 códigos dominantes (ej: 'I-A') |
| **Celda Inteligencia Top** | Nombre de la inteligencia más alta |
| **Celda Dominancia** | Estilo de dominancia (ej: 'Analítico-Experimental') |
| **Celda Millon** | Patrón de personalidad abreviado (ej: 'Modificador Independiente') |
| **Formato** | { riasecCode, topInteligencia, dominanciaStyle, millonPattern } |

### **8.5 Párrafo de elaboración**

| Tipo | Texto dinámico — párrafo narrativo |
| :---- | :---- |
| **Longitud** | 5-8 líneas |
| **Qué muestra** | Una descripción ampliada del perfil: en qué contextos funciona mejor, qué necesita para potenciarse, qué tipo de trabajo le da sentido |
| **Tono** | Cercano, honesto, no técnico. Como si un coach le hablara directamente al usuario. |
| **Formato** | Párrafo corrido, sin subtítulos ni listas |

# **ACTO 2 — LOS CAMINOS (Carreras)**

Este acto presenta las carreras recomendadas para el usuario. Tiene 3 sub-secciones: pantalla de introducción, lista de carreras, y detalle de cada carrera.

## **Sección 2.A — Introducción a las Carreras**

Pantalla narrativa que prepara emocionalmente al usuario antes de ver las carreras.

### **A.1 Título y párrafo introductorio**

| Tipo | Texto fijo |
| :---- | :---- |
| **Título** | 'No hay una carrera perfecta'  |
| **Párrafo 1** | 1-3 líneas explicando que lo que sigue son caminos que encajan con el perfil, no un ranking genérico |
| **Párrafo 2** | 1-3 líneas que enmarcan la elección como elección de vida, no solo académica |
| **Formato** | 2 párrafos separados |

## **Sección 2.B — Lista de Carreras Recomendadas**

Muestra entre 3 y 5 carreras ordenadas por porcentaje de afinidad con el perfil del usuario.

### **B.1 Párrafo intro de la lista**

| Tipo | Texto dinámico |
| :---- | :---- |
| **Formato** | 1-2 líneas contextualizando la lista |

### **B.2 Ranking de Carreras (Cards)**

| Tipo | Lista de cards clicleables — ranking |
| :---- | :---- |
| **Cantidad** | 3 a 5 carreras |
| **Datos visibles en la card** | Número de ranking, nombre de la carrera, campo/área, porcentaje de afinidad, frase de 'vida que representa' (1-2 líneas) |
| **Frase de vida** | Descripción muy breve de cómo sería el día a día de esa carrera. Tono evocador, no técnico. |
| **Ejemplos de frases de vida** | 'Días resolviendo puzzles lógicos, construyendo cosas que funcionan, trabajando desde donde quieras.' / 'Observar cómo las personas usan las cosas, mezclar creatividad con lógica.' |
| **Formato por carrera** | { name, field, matchPercentage, lifeGlimpse } |
| **Ordenamiento** | De mayor a menor matchPercentage |

## **Sección 2.C — Detalle de Carrera (5 pestañas)**

Cuando el usuario selecciona una carrera, accede a 5 pestañas de profundización. El modelo debe generar contenido para cada una.

### **Pestaña 1: Qué tipo de vida representa**

**C.1.a Párrafo de vida cotidiana**

| Tipo | Texto dinámico — narrativo |
| :---- | :---- |
| **Longitud** | 5-8 líneas |
| **Qué describe** | Cómo sería el día a día de un profesional de esa carrera: dónde trabaja, qué hace, cómo se siente, qué ritmo tiene |
| **Tono** | Segunda persona, evocador, honesto. No romantizador pero sí vivencial. |
| **Ejemplo** | 'Imaginá días donde tu trabajo principal es resolver problemas lógicos. Construir cosas que funcionan...' |
| **Formato** | Párrafo narrativo corrido |

**C.1.b Card: Un día típico**

| Tipo | Texto dinámico — card |
| :---- | :---- |
| **Longitud** | 3-5 líneas |
| **Qué describe** | La rutina diaria real (no idealizada) de ese profesional |
| **Formato** | dailyLoad: string |

**C.1.c Card: El entorno**

| Tipo | Texto dinámico |
| :---- | :---- |
| **Longitud** | 1-2 líneas |
| **Qué describe** | El tipo de entorno laboral típico: remoto, corporativo, campo, consultora, etc. |
| **Formato** | environment: string |

### **Pestaña 2: Qué problemas resuelve**

**C.2.a Propósito de la carrera**

| Tipo | Texto dinámico |
| :---- | :---- |
| **Longitud** | 2-4 líneas |
| **Qué describe** | Para qué existe esta profesión, qué necesidad resuelve en el mundo |
| **Formato** | purpose: string |

**C.2.b Lista de competencias**

| Tipo | Lista de cards — texto |
| :---- | :---- |
| **Cantidad** | 3 a 5 competencias |
| **Por cada competencia** | Descripción de 1-2 líneas de qué aprende a hacer el profesional |
| **Tono** | Funcional, orientado a acción (ej: 'Diseñar arquitecturas...', 'Analizar...') |
| **Formato** | Array: { title, description } |

**C.2.c 'Lo que nadie te dice' (Dato oculto)**

| Tipo | Texto dinámico — card especial |
| :---- | :---- |
| **Longitud** | 2-4 líneas |
| **Qué describe** | Una observación contraintuitiva o sorpresiva sobre el trabajo real en esa profesión |
| **Tono** | Honesto, sin filtro, cercano. Como un consejo de alguien que ya trabaja en eso. |
| **Formato** | strategicIntervention: string |

### **Pestaña 3: Por qué conecta con vos**

**C.3.a Cards de Compatibilidad (5 dimensiones)**

| Tipo | Lista de cards — texto \+ estado |
| :---- | :---- |
| **Qué muestra** | 5 dimensiones de compatibilidad entre el perfil del usuario y la carrera |
| **Estados posibles** | ÓPTIMO (verde), ALERTA (ámbar), PELIGRO (rojo) |
| **Dimensiones** | Arquitectura mental, Barrera de entrada, Batería social, Estilo de vida, Tipo de trabajo |
| **Por cada dimensión** | Estado \+ descripción personalizada de 2-4 líneas explicando por qué ese estado |
| **IMPORTANTE** | La descripción debe referenciar específicamente características del perfil del usuario |
| **Formato** | compatibility: { mentalArchitecture, entryBarrier, socialBattery, lifestyle, work } — cada uno con { status, description } |

### **Pestaña 4: Hacia dónde lleva**

**C.4.a Top 3 salidas laborales**

| Tipo | Lista de cards — texto \+ salario |
| :---- | :---- |
| **Cantidad** | 3 posiciones laborales principales |
| **Por cada posición** | Nombre del rol \+ salario aproximado nivel senior |
| **Formato** | Array: { position, salarySenior } |

**C.4.b Riesgo de automatización**

| Tipo | Barra de progreso \+ número |
| :---- | :---- |
| **Qué muestra** | Porcentaje de probabilidad de que ese trabajo sea reemplazado por IA/automatización |
| **Formato** | automationRisk: number (0-100) |

**C.4.c Flexibilidad geográfica**

| Tipo | Texto dinámico |
| :---- | :---- |
| **Qué muestra** | 1-2 líneas sobre si la carrera habilita trabajo remoto, internacional, etc. |
| **Formato** | geographicFlexibility: string |

**C.4.d Especializaciones con alta demanda**

| Tipo | Lista de tags — texto |
| :---- | :---- |
| **Cantidad** | 3 a 5 especializaciones |
| **Por cada especialización** | Nombre del nicho o especialización |
| **Formato** | Array: { name, niche, demand: 'Alta'|'Media'|'Baja' } |

### **Pestaña 5: Lo que implica estudiar esto**

**C.5.a Datos académicos básicos**

| Tipo | Cards de datos — numéricos \+ texto |
| :---- | :---- |
| **Carga semanal** | Número de horas semanales promedio (weeklyHours: number) |
| **Nivel de abstracción** | Descripción corta del nivel conceptual requerido (complexity: string) |
| **Formato** | { weeklyHours, complexity } |

**C.5.b Distribución del plan de estudios**

| Tipo | Barras de progreso — datos numéricos \+ texto |
| :---- | :---- |
| **Qué muestra** | Porcentaje de cada gran área dentro del plan de estudios |
| **Cantidad de áreas** | 4 a 6 áreas |
| **Descripción introductoria** | 2-4 líneas describiendo la lógica del plan |
| **Formato** | studyPlan: { description, distribution: \[{ area, percentage, color }\] } |

**C.5.c Materias filtro (warning)**

| Tipo | Lista en card ámbar — texto |
| :---- | :---- |
| **Qué muestra** | 2-3 materias donde más gente abandona, con qué capacidad forjan |
| **Tono** | Informativo, no alarmista |
| **Formato** | filterSubjects: \[{ name, skill }\] |

**C.5.d Balance estudio-trabajo**

| Tipo | Texto dinámico |
| :---- | :---- |
| **Longitud** | 1-2 líneas |
| **Qué describe** | Si es posible trabajar mientras se estudia, y desde qué año |
| **Formato** | workStudyBalance: string |

# 

# 

# 

# **ACTO 3 — DÓNDE CONSTRUIRLO (Universidades)**

Este acto presenta las universidades donde el usuario puede estudiar la carrera seleccionada. Tiene filtros, lista y detalle.

## **Sección 3.A — Introducción a Universidades**

### **A.1 Título y párrafos**

| Tipo | Texto dinámico o fijo |
| :---- | :---- |
| **Título** | 'El mismo camino, distintas experiencias' |
| **Párrafo 1** | 2-3 líneas explicando que elegir universidad es más que elegir prestigio |
| **Párrafo 2** | 2-3 líneas sobre cómo cada universidad ofrece una experiencia distinta del mismo camino |
| **Highlight box** | Frase clave: 'La universidad ideal no existe. Pero sí existe la que mejor se adapta a tu situación...' |
| **Formato** | 2 párrafos \+ 1 frase destacada |

## **Sección 3.B — Lista de Universidades (con filtros)**

La lista de universidades se puede filtrar por: carrera ofrecida, tipo (pública/privada), modalidad, religiosa/no religiosa, y zona geográfica.

### **B.1 Filtros (interfaz estática)**

| Tipo | Componente de UI — sin generación de modelo |
| :---- | :---- |
| **Qué hace** | Filtra la lista de universidades según parámetros del usuario |
| **Filtros disponibles** | Carrera, Tipo (pública/privada), Modalidad (presencial/híbrido/virtual), Religiosa (sí/no), Ubicación (zona) |
| **Nota** | Los filtros son UI pura — no requieren generación de modelo |

### **B.2 Cards de Universidades**

| Tipo | Lista de cards clicleables — ranking |
| :---- | :---- |
| **Cantidad** | Hasta 5 universidades (las más compatibles con el perfil) |
| **Datos visibles en la card** | Número de ranking, nombre, tipo (tag), modalidad (tag), zona (tag), porcentaje de match, frase corta descripción |
| **Frase de descripción** | 1-2 líneas que capturan la esencia de esa universidad |
| **Ejemplos de frases** | 'La más prestigiosa del país, gratuita pero exigente.' / 'Elite tech. Cuota alta pero conexiones directas con empresas líderes.' |
| **Ordenamiento** | De mayor a menor matchPercentage |
| **Formato por card** | { name, type, modality, location, matchPercentage, glimpse } |

## **Sección 3.C — Detalle de Universidad (6 pestañas)**

### **Pestaña 1: Por qué es (o no) para vos**

**C.1.a Card de Match general**

| Tipo | Card destacada — texto \+ número |
| :---- | :---- |
| **Qué muestra** | Porcentaje de compatibilidad \+ nivel de match (excelente/bueno/moderado) |
| **Formato** | { matchPercentage, overallMatch: 'excelente'|'bueno'|'moderado' } |

**C.1.b Lista de razones de match**

| Tipo | Lista de cards — texto \+ positivo/negativo |
| :---- | :---- |
| **Cantidad** | 4 a 6 razones |
| **Por cada razón** | Texto de 1-2 líneas explicando un factor que la acerca (+) o aleja (-) del perfil del usuario |
| **Razones positivas (+)** | Se muestran con fondo claro y check verde |
| **Razones negativas (\!)** | Se muestran con fondo ámbar y signo de exclamación |
| **Formato** | compatibility: { reasons: \[{ positive: boolean, text }\], summary: string } |

**C.1.c Resumen de compatibilidad**

| Tipo | Texto dinámico — InsightCard |
| :---- | :---- |
| **Longitud** | 2-4 líneas |
| **Qué describe** | Una síntesis de por qué esta universidad es o no buena opción para este usuario |
| **Formato** | summary: string |

### 

### 

### **Pestaña 2: Qué experiencia ofrece**

**C.2.a Datos de prestigio**

| Tipo | Cards de datos — texto \+ número |
| :---- | :---- |
| **Ranking** | Posición en ranking nacional (ranking: string) |
| **Calidad académica** | Descripción corta del nivel académico (academicQuality: string) |
| **Empleabilidad de egresados** | Porcentaje (0-100) — barra de progreso |
| **Reputación en el mercado** | Porcentaje (0-100) — barra de progreso |
| **Formato** | prestige: { ranking, academicQuality, employability, marketReputation } |

**C.2.b Valores institucionales**

| Tipo | Texto \+ barras de distribución |
| :---- | :---- |
| **Párrafo descriptivo** | 2-4 líneas sobre el enfoque y valores de la institución |
| **Distribución de valores** | 4-5 áreas con porcentaje cada una (ej: Rigor académico 40%, Formación humanista 25%, etc.) |
| **Formato** | values: { description, distribution: \[{ area, percentage, color }\] } |

### **Pestaña 3: Qué implica en tu vida**

**C.3.a Plan de estudios básico**

| Tipo | Cards de datos |
| :---- | :---- |
| **Duración** | Años de carrera (ej: '5 años \+ CBC') |
| **Total de créditos** | Número de créditos |
| **Horas de práctica** | Horas totales de práctica profesional |
| **Modalidad \+ descripción** | Tipo de cursada \+ aclaración de lo que implica (ej: 'Presencial: vas a tener que ir físicamente a cursar regularmente.') |
| **Formato** | studyPlan: { duration, totalCredits, practiceHours, website } |

### **Pestaña 4: La inversión**

**C.4.a Costos**

| Tipo | Card de datos financieros |
| :---- | :---- |
| **Cuota mensual** | String con monto o 'Gratuita' |
| **Matrícula** | Costo de inscripción |
| **Estimado anual total** | Costo anual incluyendo todos los rubros |
| **Opciones de pago** | 1-2 líneas sobre facilidades o planes |
| **Formato** | investment: { monthlyFee, enrollmentFee, annualEstimate, paymentOptions } |

**C.4.b Becas disponibles**

| Tipo | Lista de cards — texto |
| :---- | :---- |
| **Cantidad** | 2 a 5 becas o formas de financiamiento |
| **Por cada beca** | Nombre, cobertura (ej: '50% de la cuota'), requisitos en 1-2 líneas |
| **Formato** | scholarships: \[{ name, coverage, requirements }\] |

### **Pestaña 5: Ubicación**

**C.5.a Datos de ubicación**

| Tipo | Cards de información |
| :---- | :---- |
| **Dirección** | Dirección física de la universidad |
| **Ciudad y provincia** |  |
| **Transporte cercano** | Lista de líneas de transporte o accesos |
| **Campus** | Lista de instalaciones y servicios del campus |
| **Formato** | location: { address, zone, transport, campusInfo } |

### **Pestaña 6: Becas y ayudas**

Ver C.4.b — Esta pestaña duplica y amplía la información de becas de la pestaña de inversión. Mismo formato, puede incluir más detalle.

### **CTA Final de Universidad**

| Tipo | Card de cierre — texto \+ link |
| :---- | :---- |
| **Qué muestra** | Invitación a visitar el sitio oficial de la universidad |
| **Texto del CTA** | '¿Te interesa esta universidad? Visitá su sitio oficial para más información.' |
| **Link** | studyPlan.website — URL del sitio oficial |

# **Apéndice — Tabla Resumen de Outputs del Modelo**

Resumen rápido de todos los elementos que el modelo debe generar, clasificados por tipo.

| Elemento | Tipo | Formato clave del output |
| :---- | :---- | :---- |
| Párrafos introductorios de sección | Texto dinámico | *String de 2-4 líneas* |
| Dimensiones del método | Lista de cards | *Array { name, description }* |
| Rasgos cognitivos | Cards \+ barra | *Array { name, level, levelLabel, description, isTension? }* |
| RIASEC primario | Card hero | *{ code, label, description }* |
| RIASEC secundarios | Barras | *Array { code, label, score }* |
| Inteligencias (top 3\) | Grid de cards | *Array { name, score, icon, description }* |
| Inteligencias (resto) | Lista compacta | *Array { name, score, icon, description }* |
| Dominancia cerebral | Grid 2x2 | *Array { id, label, sublabel, score, description }* |
| Patrón MIPS | Card \+ frase | *{ pattern: string, traits: \[\] }* |
| Rasgos MIPS | Barras | *Array { name, pole, score, description }* |
| Energía: activa / drena | 2 listas | *{ activates: string\[\], drains: string\[\] }* |
| Áreas de interés | Cards \+ barras | *Array { name, score, levelLabel, insight }* |
| Áreas no alineadas | Cards | *Array { name, description, inferenceStrength }* |
| Ejes de estilo de vida | Sliders | *Array { leftLabel, rightLabel, value, interpretation }* |
| Frase central de esencia | Card destacada | *String 25-40 palabras* |
| Tag compartible | Etiqueta | *String 3 palabras* |
| Nodos de constelación | Gráfico SVG | *Array { label, icon, tier, color }* |
| Grid de 4 dimensiones psico | Grilla 2x2 | *{ riasecCode, topInteligencia, dominanciaStyle, millonPattern }* |
| Párrafo de elaboración | Texto narrativo | *String 5-8 líneas* |
| Lista de carreras | Cards ranking | *Array { name, field, matchPercentage, lifeGlimpse }* |
| Vida cotidiana de carrera | Texto narrativo | *String 5-8 líneas (dailyLoad \+ párrafo expandido)* |
| Propósito de carrera | Texto | *String 2-4 líneas* |
| Competencias de carrera | Lista de cards | *Array { title, description }* |
| Lo que nadie te dice | Card especial | *String 2-4 líneas* |
| Compatibilidad con carrera | Cards con estado | *{ mentalArchitecture, entryBarrier, socialBattery, lifestyle, work } — cada uno { status, description }* |
| Salidas laborales | Lista | *Array { position, salarySenior }* |
| Riesgo automatización | Barra \+ número | *number 0-100* |
| Especializaciones de demanda | Tags | *Array { name, niche, demand }* |
| Distribución plan de estudios | Barras | *Array { area, percentage }* |
| Materias filtro | Lista ámbar | *Array { name, skill }* |
| Lista de universidades | Cards ranking | *Array { name, type, modality, matchPercentage, glimpse }* |
| Razones de match universidad | Lista positivo/negativo | *Array { positive, text }* |
| Resumen compatibilidad uni | InsightCard | *summary: string* |
| Prestigio y empleabilidad | Cards \+ barras | *{ ranking, academicQuality, employability, marketReputation }* |
| Valores institucionales | Texto \+ barras | *{ description, distribution: \[{ area, percentage }\] }* |
| Costos y cuotas | Card financiera | *{ monthlyFee, enrollmentFee, annualEstimate }* |
| Becas disponibles | Lista de cards | *Array { name, coverage, requirements }* |
| Ubicación y campus | Cards info | *{ address, zone, transport, campusInfo }* |

**Nota de cierre**

Todos los textos generados por el modelo deben respetar el tono del producto: cercano, claro, sin jerga técnica, honesto y sin idealizar. El usuario es un adolescente o joven adulto en proceso de decisión vocacional.

El modelo no debe generar recomendaciones directas del tipo 'deberías estudiar X'. En cambio, debe presentar la información de forma que el usuario pueda tomar su propia decisión con más claridad.

Los campos numéricos (scores, porcentajes) deben ser coherentes internamente: si un área tiene score 88, el modelo no debe poner otro campo análogo en 20 para el mismo usuario, salvo que exista una razón narrativa clara.

