import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/reading/reading').then(m => m.Reading)
  },
  {
    path: 'history-reading/:id',
    loadComponent: () => import('./pages/history-reading/history-reading').then(m => m.HistoryReading)
  }
] as Routes;
