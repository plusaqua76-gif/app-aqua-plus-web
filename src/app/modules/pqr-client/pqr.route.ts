import { Routes } from '@angular/router';
import { hasRoleGuard } from '../../core/guards/guard-role/has-role-guard';
import { pqrRoleRedirectGuard } from '../../core/guards/pqr-role-redirect.guard';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/pqr-secretary').then(m => m.PqrSecretary),
    canActivate: [pqrRoleRedirectGuard]
  },
  {
    path: 'pqr-enterprice-clients',
    loadComponent: () => import('./pages/pqr-clients-enterprice').then(m => m.PqrClientsEnterprice),
    canActivate: [hasRoleGuard(['CLIENTE'])]
  },
  {
    path: 'pqr-enterprice',
    loadComponent: () => import('./pages/pqr-secretary').then(m => m.PqrSecretary),
    canActivate: [hasRoleGuard(['ADMIN'])]
  }
] as Routes;
