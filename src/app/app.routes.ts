import { Routes } from '@angular/router';
import { AppShellComponent } from './core/components/Shell';
import { authGuard } from './core/guards/guard-auth/auth-guard-guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./core/components/welcome').then((m) => m.Welcome),
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
        redirectTo: 'home/welcome-user',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadChildren: () =>
          import('./modules/home/home.route').then((m) => m.default),
      },
      {
        path: 'client',
        loadChildren: () =>
          import('./modules/client/client.routes').then((m) => m.default),
      },
      {
        path: 'bill',
        loadChildren: () =>
          import('./modules/bill/bill.routes').then((m) => m.default),
      },
      {
        path: 'reading',
        loadChildren: () =>
          import('./modules/reading/reading.routes').then((m) => m.default),
      },
      {
        path: 'counter',
        loadChildren: () =>
          import('./modules/counter/counter.routes').then((m) => m.default),
      },
      {
        path: 'employee',
        loadChildren: () =>
          import('./modules/employee/employee.routes').then((m) => m.default),
      },
      {
        path: 'enterprise',
        loadChildren: () =>
          import('./modules/enterprise/enterprise.routes').then(
            (m) => m.default
          ),
      },
      {
        path: 'accounting',
        redirectTo: 'Inventory/inventory',
        pathMatch: 'full',
      },
      {
        path: 'start',
        loadChildren: () =>
          import('./modules/start/start.route').then((m) => m.default),
      },
      {
        path: 'user-access',
        loadChildren: () =>
          import('./modules/super-admin/admin.route').then((m) => m.default),
      },
      {
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
      {
        path: 'profile',
        loadChildren: () =>
          import('./modules/user/user.route').then((m) => m.default),
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./modules/reports/reports.route').then((m) => m.default),
      },
      {
        path: 'bills-users',
        loadComponent: () =>
          import('./modules/user/pages/billsUsers').then((m) => m.BillUsers),
      },
      {
        path: 'electronic-invoicing',
        loadChildren: () =>
          import('./modules/electronic-invoicing/electronic-invoicing.route').then((m) => m.default),
      },
      {
        path: 'pagos',
        loadChildren: () =>
          import('./modules/pagos/pagos.route').then((m) => m.default),
      },
      {
        path: 'pyments',
        redirectTo: 'bills-users',
        pathMatch: 'prefix',
      }
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('@shared/components/404').then((m) => m.NotFound404),
  },
];
