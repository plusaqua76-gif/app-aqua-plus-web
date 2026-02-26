import { RenderMode, ServerRoute } from '@angular/ssr';

// Rutas públicas que se renderizan en el servidor (SEO optimizado)
const publicRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Server },
  { path: 'auth/**', renderMode: RenderMode.Server },
];

// Rutas autenticadas que requieren datos de API - Solo cliente
const authenticatedRoutes: ServerRoute[] = [
  { path: 'shell/**', renderMode: RenderMode.Client },
];

export const serverRoutes: ServerRoute[] = [
  ...publicRoutes,
  ...authenticatedRoutes,

  // Fallback: Cualquier otra ruta se renderiza en el servidor
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
