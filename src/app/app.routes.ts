import { Routes } from '@angular/router';
import { AppShellComponent } from './core/components/Shell';

export const routes: Routes = [

  {
    path: '',
    loadComponent: () => import('./modules/home/pages/home/home').then(m => m.Home)
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.route').then(m => m.default),
  },


  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: 'client',
        loadChildren: () => import('./modules/client/client.routes').then(m => m.default),
      },
      {
        path: 'bill',
        loadChildren: () => import('./modules/bill/bill.routes').then(m => m.default),
      },
      {
        path: 'reading',
        loadChildren: () => import('./modules/reading/reading.routes').then(m => m.default),
      },
      {
        path: 'counter',
        loadChildren: () => import('./modules/counter/counter.routes').then(m => m.default),
      },
      {
        path: 'employee',
        loadChildren: () => import('./modules/employee/employee.routes').then(m => m.default),
      },
      {
        path: 'enterprise',
        loadChildren: () => import('./modules/enterprise/enterprise.routes').then(m => m.default),
      },
      {
        path: 'accounting',
        loadChildren: () => import('./modules/accounting/accounting.route').then(m => m.default),
      },
      {
        path: 'start',
        loadChildren: () => import('./modules/start/start.route').then(m => m.default),
      }
    ]
  },

  { path: '**', redirectTo: '' }
];
