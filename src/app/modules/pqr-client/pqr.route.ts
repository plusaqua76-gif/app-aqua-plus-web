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



// import { Routes } from '@angular/router';
// import { hasRoleGuard } from '../../core/guards/guard-role/has-role-guard';

// export default [
//   {
//     path: '',
//     loadComponent: () => import('./pages/pqr-secretary').then(m => m.PqrSecretary),
//     canActivate: [hasRoleGuard(['ADMIN'])]
//   },
//   {
//     path: 'pqr-enterprice-clients',
//     loadComponent: () => import('./pages/pqr-clients-enterprice').then(m => m.PqrClientsEnterprice),
//     // canActivate: [hasRoleGuard(['CLIENTE'])]
//     canActivate: [hasRoleGuard(['ADMIN'])]
//   },
//   {
//     path: 'pqr-enterprice',
//     loadComponent: () => import('./pages/pqr-secretary').then(m => m.PqrSecretary),
//     canActivate: [hasRoleGuard(['ADMIN'])]
//   }
// ] as Routes;
