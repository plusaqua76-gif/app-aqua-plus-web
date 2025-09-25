import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/admin-roles').then(m => m.AdminRoles)
  },
] as Routes;
