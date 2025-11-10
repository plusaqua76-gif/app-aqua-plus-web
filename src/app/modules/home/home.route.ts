import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.Home)
  },
    {
    path: 'welcome-user',
    loadComponent: () =>
      import('../home/pages/welcome-user-app.ts/welcome-user').then(
        (m) => m.WelcomeUserApp
      ),
  },
] as Routes;
