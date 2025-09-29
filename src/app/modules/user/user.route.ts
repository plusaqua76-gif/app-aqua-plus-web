import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/profile').then(m => m.Profile)
  },
] as Routes;
