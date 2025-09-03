
import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/fee').then(m => m.FeeComponent),
  },
] as Routes;
