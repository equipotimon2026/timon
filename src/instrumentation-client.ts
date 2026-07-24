import posthog from 'posthog-js';

// Analytics + session replay (PostHog). Sin NEXT_PUBLIC_POSTHOG_KEY es un no-op,
// así dev y los tests E2E no ensucian los datos de producción.
if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    // Pasa por el rewrite /ingest de next.config.ts para esquivar adblockers.
    api_host: '/ingest',
    ui_host: 'https://us.posthog.com',
    defaults: '2026-05-30',
    debug: process.env.NODE_ENV === 'development',
    session_recording: {
      // Los usuarios son menores cargando datos personales: nunca grabar
      // lo que escriben en los inputs.
      maskAllInputs: true,
      // maskAllInputs no cubre texto RENDERIZADO (respuestas restauradas en
      // los forms, resultados vocacionales/psicométricos en pantalla). '*'
      // enmascara todo texto del replay: queda la navegación y el layout,
      // nunca el contenido.
      maskTextSelector: '*',
    },
  });
}
