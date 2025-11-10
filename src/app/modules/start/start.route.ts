import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/start/start').then((m) => m.Start),
  }
] as Routes;
