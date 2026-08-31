import { Routes } from '@angular/router';

export default [
  {
    path: 'resultado',
    loadComponent: () =>
      import('./pages/pago-resultado').then((m) => m.PagoResultado),
  },
] as Routes;
