import { RenderMode, ServerRoute } from '@angular/ssr';

// solucion alternativa al endpoint
// se puede mejorar ya que aqui le digo al servidos las rutas qeu tiene qeu precargar mas no la infomracion del id relacionado
const createUpdateRoute = (path: string): ServerRoute => ({
  path,
  renderMode: RenderMode.Server,
});

export const serverRoutes: ServerRoute[] = [
  ...[
    'client/update-client/:id',
    'bill/update-bill/:id',
    'bill/create-credit/:id',
    'bill/update-debt/:id',
    'reading/update-reading/:id',
    'counter/actualizar-contador/:id',
    'employee/update-employee/:id',
    'enterprise/update-enterprise/:id',
  ].map(createUpdateRoute),

  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
