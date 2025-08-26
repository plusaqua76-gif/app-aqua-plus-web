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
        pathMatch: 'full'
      },
      {
        // canActivate: [hasRoleGuard(['EMPRESA'])],
        path: 'client',
        loadChildren: () =>
          import('./modules/client/client.routes').then((m) => m.default),
      },
      {
        // canActivate: [hasRoleGuard(['EMPRESA'])],
        path: 'bill',
        loadChildren: () =>
          import('./modules/bill/bill.routes').then((m) => m.default),
      },
      {
        // canActivate: [hasRoleGuard(['EMPLEADO'])],
        path: 'reading',
        loadChildren: () =>
          import('./modules/reading/reading.routes').then((m) => m.default),
      },
      {
        // canActivate: [hasRoleGuard(['EMPLEADO'])],
        path: 'counter',
        loadChildren: () =>
          import('./modules/counter/counter.routes').then((m) => m.default),
      },
      {
        // canActivate: [hasRoleGuard(['EMPLEADO'])],
        path: 'employee',
        loadChildren: () =>
          import('./modules/employee/employee.routes').then((m) => m.default),
      },
      {
        // canActivate: [hasRoleGuard(['EMPLEADO'])],
        path: 'enterprise',
        loadChildren: () =>
          import('./modules/enterprise/enterprise.routes').then(
            (m) => m.default
          ),
      },
      {
        // canActivate: [hasRoleGuard(['EMPLEADO'])],
        path: 'accounting',
        loadChildren: () =>
          import('./modules/accounting/accounting.route').then(
            (m) => m.default
          ),
      },
      {
        // canActivate: [hasRoleGuard(['EMPLEADO'])],
        path: 'start',
        loadChildren: () =>
          import('./modules/start/start.route').then((m) => m.default),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('@shared/components/404').then((m) => m.NotFound404),
  },
];
