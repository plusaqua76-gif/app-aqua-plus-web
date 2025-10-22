import { RenderMode, ServerRoute } from '@angular/ssr';

// solucion alternativa al endpoint
// se puede mejorar ya que aqui le digo al servidos las rutas qeu tiene qeu precargar mas no la infomracion del id relacionado
const createUpdateRoute = (path: string): ServerRoute => ({
  path,
  renderMode: RenderMode.Server,
});

export const serverRoutes: ServerRoute[] = [
  ...[
    'shell/client/update-client/:id',
    'shell/bill/update-bill/:id',
    'shell/bill/create-credit/:id',
    'shell/bill/update-debt/:id',
    'shell/reading/update-reading/:id',
    'shell/employee/update-employee/:id',
    'shell/enterprise/update-enterprise/:id',
    'shell/bill/print-bill/:id'
  ].map(createUpdateRoute),

  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
