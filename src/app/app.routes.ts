import { Routes } from '@angular/router';
import { AppShellComponent } from './core/components/Shell';
import { authGuard } from './core/guards/guard-auth/auth-guard-guard';
import { hasRoleGuard } from './core/guards/guard-role/has-role-guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'welcome',
  },
  {
    path: 'welcome',
    loadComponent: () =>
      import('./core/components/welcome').then((m) => m.Welcome),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.route').then((m) => m.default),
  },
  {
    canMatch: [authGuard],
    path: 'shell',
    component: AppShellComponent,
    children: [
      {
        path: '',
        redirectTo: 'start',
        pathMatch: 'full',
      },
      {
        // canActivate: [hasRoleGuard(['ADMIN', 'SUPER ADMIN'])],
        path: 'client',
        loadChildren: () =>
          import('./modules/client/client.routes').then((m) => m.default),
      },
      {
        // canActivate: [hasRoleGuard(['ADMIN', 'SUPER ADMIN'])],
        path: 'bill',
        loadChildren: () =>
          import('./modules/bill/bill.routes').then((m) => m.default),
      },
      {
        // canActivate: [hasRoleGuard(['ADMIN', 'SUPER ADMIN'])],
        path: 'reading',
        loadChildren: () =>
          import('./modules/reading/reading.routes').then((m) => m.default),
      },
      {
        // canActivate: [hasRoleGuard(['ADMIN', 'SUPER ADMIN'])],
        path: 'counter',
        loadChildren: () =>
          import('./modules/counter/counter.routes').then((m) => m.default),
      },
      {
        // canActivate: [hasRoleGuard(['ADMIN', 'SUPER ADMIN'])],
        path: 'employee',
        loadChildren: () =>
          import('./modules/employee/employee.routes').then((m) => m.default),
      },
      {
        // canActivate: [hasRoleGuard(['SUPER ADMIN'])],
        path: 'enterprise',
        loadChildren: () =>
          import('./modules/enterprise/enterprise.routes').then(
            (m) => m.default
          ),
      },
      {
        // canActivate: [hasRoleGuard(['ADMIN', 'SUPER ADMIN'])],
        path: 'accounting',
        loadChildren: () =>
          import('./modules/accounting/accounting.route').then(
            (m) => m.default
          ),
      },
      {
        // canActivate: [hasRoleGuard(['ADMIN', 'SUPER ADMIN'])],
        path: 'start',
        loadChildren: () =>
          import('./modules/start/start.route').then((m) => m.default),
      },
      {
        // canActivate: [hasRoleGuard(['SUPER ADMIN'])],
        path: 'user-access',
        loadChildren: () =>
          import('./modules/super-admin/admin.route').then((m) => m.default),
      },
      {
        // canActivate: [hasRoleGuard(['SUPER ADMIN'])],
        path: 'fee',
        loadChildren: () =>
          import('./modules/fee/fee.routes').then((m) => m.default),
      },
      {
        path: 'Inventory',
        loadChildren: () =>
          import('./modules/accounting/accounting.route').then(
            (m) => m.default
          ),
      },
      {
        path: 'pqr-client',
        loadChildren: () =>
          import('./modules/pqr-client/pqr.route').then((m) => m.default),
      },
      {
        path: 'configuration-roles',
        loadChildren: () =>
          import('./modules/admin-roles/roles.route').then((m) => m.default),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('@shared/components/404').then((m) => m.NotFound404),
  },
];
