
import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/feeRate/fee').then(m => m.FeeComponent),
  },
] as Routes;
