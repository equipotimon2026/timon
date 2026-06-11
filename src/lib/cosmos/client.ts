import 'server-only';
import { CosmosClient, type Database } from '@azure/cosmos';

const DATABASE_ID = 'timon-db';

let database: Database | null = null;

/**
 * Cliente Cosmos read-only del catálogo (universidades + programas canónicos).
 *
 * SOLO se usa server-side (API routes). NUNCA importar desde el frontend:
 * `server-only` rompe el build si este módulo se filtra a un bundle de cliente,
 * y `COSMOS_DB_KEY` (sin prefijo NEXT_PUBLIC_) no existe en el browser.
 *
 * Singleton: el SDK reusa el pool de conexiones entre invocaciones.
 */
export function getCosmosDatabase(): Database {
  if (database) return database;

  const endpoint = process.env.COSMOS_DB_ENDPOINT;
  const key = process.env.COSMOS_DB_KEY;
  if (!endpoint || !key) {
    throw new Error('COSMOS_DB_ENDPOINT / COSMOS_DB_KEY no configuradas');
  }

  database = new CosmosClient({ endpoint, key }).database(DATABASE_ID);
  return database;
}
