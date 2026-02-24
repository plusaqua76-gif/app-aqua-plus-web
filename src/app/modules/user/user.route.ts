import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/profile/profile').then(m => m.Profile)
  },
  {
    path: 'bills-users',
    loadComponent: () => import('./pages/billsUsers').then(m => m.BillUsers)
  },
  {
    path: 'pyments',
    loadComponent: () => import('./pages/pyments').then(m => m.Pyments)
  }
] as Routes;
