import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/pqr-clients-enterprice').then(m => m.PqrClientsEnterprice)
  },
] as Routes;
