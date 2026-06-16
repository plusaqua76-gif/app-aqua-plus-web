import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/pyment/pyment').then(m => m.Pyment)
  }
] as Routes;
