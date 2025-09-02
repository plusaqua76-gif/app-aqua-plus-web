import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/user-access').then(m => m.UserAccess)
  },
] as Routes;
