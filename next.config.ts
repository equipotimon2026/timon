import createNextIntlPlugin from 'next-intl/plugin';
import path from 'node:path';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {
  // Pin the workspace root so Turbopack doesn't climb to ~/ because of a stray
  // package-lock.json there — otherwise `@import "tailwindcss"` fails to resolve.
  turbopack: {
    root: path.resolve(__dirname),
  },
  // @azure/cosmos es un driver Node-only: que no se bundlee, se carga en runtime.
  serverExternalPackages: ['@azure/cosmos'],
  // Proxy a PostHog (cloud US) para que los adblockers no bloqueen los eventos.
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ];
  },
  // PostHog manda requests con trailing slash; sin esto Next las redirige y se pierden.
  skipTrailingSlashRedirect: true,
};

export default withNextIntl(nextConfig);
