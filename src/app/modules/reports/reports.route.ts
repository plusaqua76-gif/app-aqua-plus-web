import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/reports/reports-create').then(m => m.ReportsCreate)
  }
] as Routes;
