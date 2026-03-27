export type MIPSResponse = {
  [key: string]: boolean; // true = Verdadero, false = Falso
};

export type RIASECResponse = {
  personality: {
    R: string[];
    I: string[];
    A: string[];
    S: string[];
    E: string[];
    C: string[];
  };
  habilidades: {
    R: string[];
    I: string[];
    A: string[];
    S: string[];
    E: string[];
    C: string[];
  };
  intereses: {
    R: string[];
    I: string[];
    A: string[];
    S: string[];
    E: string[];
    C: string[];
  };
  motivaciones: {
    R: string[];
    I: string[];
    A: string[];
    S: string[];
    E: string[];
    C: string[];
  };
};

export type HerrmannResponse = {
  motivacion: string[];
  aprendizaje: string[];
  aprendizajeModo: string[];
  tipoPregunta: string;
  meGusta: string[];
  comprarChoice: string;
  comprarCoche: string[];
  comprarCelular: string[];
  comportamiento: string;
  estiloPalabras: string[];
  desprecio: string[];
  resolucionProblema: string;
  visionProblema: string;
  frasesAproximadas: string[];
};

export type GardnerResponse = {
  logicoMatematica: { [key: string]: number }; // 1-5 scale
  linguistica: { [key: string]: number };
  espacial: { [key: string]: number };
  corporalCinetica: { [key: string]: number };
  musical: { [key: string]: number };
  naturalista: { [key: string]: number };
  intrapersonal: { [key: string]: number };
  interpersonal: { [key: string]: number };
};

export type ProyectivasResponse = {
  [key: string]: string; // Frases incompletas con respuestas de texto
};

export type AutodescubrimientoResponse = {
  intereses: {
    [area: string]: {
      talentos: string[];
      noTalentos: string[];
    };
  };
  autobiografia: {
    [key: string]: string;
  };
  estilosAprendizaje: {
    [key: string]: string;
  };
  preguntasAbiertas: {
    [key: string]: string;
  };
};

export type EstiloVidaResponse = {
  tomaDecisiones: { [key: string]: number }; // 0-3 scale
  prioridades: string[];
  intolerables: string[];
};

export type VisionFuturoResponse = {
  bolaMagica: string;
  soñandoFuturo: string;
  motivacionSer: string;
  motivacionHacer: string;
  motivacionTener: string;
};

export type ArbolGenealogResponse = {
  profundidad: {
    [key: string]: string;
  };
};

export type UniversidadResponse = {
  [key: string]: string;
};

// --- New types for the migrated app ---

export type AssessmentId =
  | 'mips'
  | 'riasec'
  | 'herrmann'
  | 'gardner'
  | 'proyectivas'
  | 'autodescubrimiento'
  | 'estilo-vida'
  | 'vision-futuro'
  | 'arbol-genealogico'
  | 'universidad';

export type AssessmentConfig = {
  id: AssessmentId;
  sectionId: number;
  title: string;
  subtitle: string;
  description: string;
  category: 'personalidad' | 'autoconocimiento' | 'educacion';
};

export type AssessmentStatus = 'pending' | 'in_progress' | 'completed';
