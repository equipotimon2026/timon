import { getCosmosDatabase } from './client';

const CANONICAL_CONTAINER = 'university_programs_canonical';

/**
 * Una universidad que dicta un programa del grupo de carrera buscado.
 * Alimenta los "bubbles" del detalle de carrera (PDF 3.c):
 * ej. "UBA — Licenciatura en Ciencias de Datos".
 */
export interface ProgramBubble {
  universityId: string;
  universityName: string;
  /** Nombre del programa en el plan de estudios (nombre canónico/dedupeado). */
  programName: string;
  facultyName: string | null;
}

interface CanonicalRow {
  universityId: string;
  universityName: string;
  canonicalProgramName: string;
  facultyName: string | null;
}

/**
 * Dado el `programSearchGroup` de una carrera (ej. "Ciencia de Datos y Analítica"),
 * devuelve las universidades que la dictan con el nombre de su programa.
 *
 * Fuente: container `university_programs_canonical` de Cosmos (ya dedupeado a nivel
 * programa). Solo lectura. Filtra por `enabled = true` para excluir programas dados
 * de baja del catálogo.
 */
export async function getUniversitiesByProgramGroup(
  programSearchGroup: string
): Promise<ProgramBubble[]> {
  const { resources } = await getCosmosDatabase()
    .container(CANONICAL_CONTAINER)
    .items.query<CanonicalRow>({
      query: `SELECT c.universityId, c.universityName, c.canonicalProgramName, c.facultyName
              FROM c
              WHERE c.programSearchGroup = @group AND c.enabled = true`,
      parameters: [{ name: '@group', value: programSearchGroup }],
    })
    .fetchAll();

  // Dedupe por universidad + nombre de programa (una universidad puede aparecer en
  // varias facultades/sedes); ordena alfabéticamente por universidad.
  const seen = new Set<string>();
  const bubbles: ProgramBubble[] = [];
  for (const row of resources) {
    const programName = row.canonicalProgramName;
    const dedupeKey = `${row.universityId}::${programName}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    bubbles.push({
      universityId: row.universityId,
      universityName: row.universityName,
      programName,
      facultyName: row.facultyName ?? null,
    });
  }

  return bubbles.sort((a, b) =>
    a.universityName.localeCompare(b.universityName, 'es')
  );
}
