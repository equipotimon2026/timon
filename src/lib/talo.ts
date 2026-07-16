import 'server-only';
import { TaloClient, type TaloEnvironment } from 'talo-pay';

let client: TaloClient | null = null;

/** Cliente Talo singleton. SOLO usar desde API routes / código server. */
export function getTaloClient(): TaloClient {
  if (!client) {
    client = new TaloClient({
      clientId: process.env.TALO_CLIENT_ID!,
      clientSecret: process.env.TALO_CLIENT_SECRET!,
      userId: process.env.TALO_USER_ID!,
      environment: (process.env.TALO_ENVIRONMENT as TaloEnvironment) ?? 'production',
    });
  }
  return client;
}

export const TALO_USER_ID = () => process.env.TALO_USER_ID!;

/** Base URL pública de la app (webhooks y redirects de Talo). */
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}
