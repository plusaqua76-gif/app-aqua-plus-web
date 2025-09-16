import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/reading/reading').then(m => m.Reading)
  },
  {
    path: 'update-reading/:id',
    loadComponent: () => import('./pages/update-reading/update-reading').then(m => m.UpdateReading)
  },
  {
    path: 'create-reading',
    loadComponent: () => import('./pages/create-reading/create-reading').then(m => m.CreateReading)
  }
] as Routes;
