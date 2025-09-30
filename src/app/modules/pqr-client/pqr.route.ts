import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/pqr-clients-enterprice').then(m => m.PqrClientsEnterprice)
  },
  {
    path: 'pqr-enterprice-clients',
    loadComponent: () => import('./pages/pqr-clients-enterprice').then(m => m.PqrClientsEnterprice)
  },
  {
    path: 'pqr-enterprice',
    loadComponent: () => import('./pages/pqr-secretary').then(m => m.PqrSecretary)
  }
] as Routes;
