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
    'shell/reading/history-reading/:id',
    'shell/employee/update-employee/:id',
    'shell/enterprise/update-enterprise/:id',
    'shell/bill/print-bill/:id',
    'shell/accounting/inventory/edit/:id',
    'shell/accounting/accounts/edit/:id',
    'shell/Inventory/inventory/edit/:id',
    'shell/Inventory/accounts/edit/:id',
  ].map(createUpdateRoute),

  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];



// X [ERROR] The 'shell/accounting/inventory/edit/:id' route uses prerendering and includes parameters, but 'getPrerenderParams' is missing. Please define 'getPrerenderParams' function for this route in your server routing configuration or specify a different 'renderMode'.


// X [ERROR] The 'shell/accounting/accounts/edit/:id' route uses prerendering and includes parameters, but 'getPrerenderParams' is missing. Please define 'getPrerenderParams' function for this route in your server routing configuration or specify a different 'renderMode'.


// X [ERROR] The 'shell/Inventory/inventory/edit/:id' route uses prerendering and includes parameters, but 'getPrerenderParams' is missing. Please define 'getPrerenderParams' function for this route in your server routing configuration or specify a different 'renderMode'.


// X [ERROR] The 'shell/Inventory/accounts/edit/:id' route uses prerendering and includes parameters, but 'getPrerenderParams' is missing. Please define 'getPrerenderParams' function for this route in your server routing configuration or specify a different 'renderMode'.
