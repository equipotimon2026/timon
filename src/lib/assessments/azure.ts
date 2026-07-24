import 'server-only';
import {
  AzurePollResult,
  AzureSubmitResult,
  pollAzureCore,
  resolveTimeoutMs,
  submitToAzureCore,
} from './azure-logic';

export { classifyAzureResponse, isPastTimeout } from './azure-logic';
export type { AzurePollResult, AzureSubmitResult } from './azure-logic';
export { applyPollResult, markTimedOut } from './apply';
export type { ApplyPollOutcome, MarkTimedOutOutcome } from './apply';

// Base de Azure configurable por env para sobrevivir la migracion de cuenta
// sin tocar codigo. El valor historico apunta a la CUENTA PERSONAL anterior:
// existe solo para no romper los entornos que aun no setearon AZURE_BASE_URL,
// y avisa fuerte cada vez que se usa. Tras migrar la cuenta, setear
// AZURE_BASE_URL en Vercel es OBLIGATORIO — si no, esto seguiria llamando a la
// cuenta vieja en silencio.
const LEGACY_AZURE_BASE_URL =
  'https://timon-agents-ckfqd5evcdcqgsg9.eastus2-01.azurewebsites.net';

let warnedLegacyBaseUrl = false;

export function getAzureAssessmentsUrl(): string {
  let base = process.env.AZURE_BASE_URL;
  if (!base) {
    base = LEGACY_AZURE_BASE_URL;
    if (!warnedLegacyBaseUrl) {
      warnedLegacyBaseUrl = true;
      console.warn(
        '[assessments] AZURE_BASE_URL no esta seteada — usando la URL historica ' +
          'ligada a la cuenta personal anterior. Setear AZURE_BASE_URL antes de ' +
          'cualquier migracion de cuenta de Azure.'
      );
    }
  }
  return `${base}/api/assessments`;
}

// Timeouts por request a Azure. El poll es un GET liviano; el submit puede
// sufrir el cold start de la Function, por eso su default es mas generoso.
// Las rutas que hacen submit declaran maxDuration = 60: los 40s dejan margen
// real para auth, armado del payload y el INSERT posterior — un submit que
// consumiera casi todo el presupuesto haria que Vercel mate la funcion con el
// trabajo ya aceptado en Azure pero sin row local que lo trackee.
const DEFAULT_POLL_TIMEOUT_MS = 10_000;
const DEFAULT_SUBMIT_TIMEOUT_MS = 40_000;

export function getPollTimeoutMs(): number {
  return resolveTimeoutMs(process.env.AZURE_POLL_TIMEOUT_MS, DEFAULT_POLL_TIMEOUT_MS);
}

export function getSubmitTimeoutMs(): number {
  return resolveTimeoutMs(process.env.AZURE_SUBMIT_TIMEOUT_MS, DEFAULT_SUBMIT_TIMEOUT_MS);
}

export async function pollAzure(
  assessmentId: string,
  email: string
): Promise<AzurePollResult> {
  const azureKey = process.env.AZURE_FUNCTIONS_KEY;
  if (!azureKey) {
    return { kind: 'unreachable', detail: 'AZURE_FUNCTIONS_KEY not configured' };
  }
  return pollAzureCore(
    fetch,
    `${getAzureAssessmentsUrl()}/${assessmentId}?email=${encodeURIComponent(email)}`,
    azureKey,
    getPollTimeoutMs()
  );
}

/** POST del trabajo a Azure, con timeout y validacion del body de respuesta.
 *  Unico camino de submit: analyze, regenerate y admin generate pasan por aca. */
export async function submitToAzure(payload: unknown): Promise<AzureSubmitResult> {
  const azureKey = process.env.AZURE_FUNCTIONS_KEY;
  if (!azureKey) {
    return { kind: 'unreachable', detail: 'AZURE_FUNCTIONS_KEY not configured' };
  }
  return submitToAzureCore(
    fetch,
    getAzureAssessmentsUrl(),
    azureKey,
    JSON.stringify(payload),
    getSubmitTimeoutMs()
  );
}
