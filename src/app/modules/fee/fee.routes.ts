
import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/feeRate/fee').then(m => m.FeeComponent),
  },
  {
    path: 'payment-points',
    loadComponent: () => import('./pages/payment-points/payment-points').then(m => m.PaymentPoints),
  },
  {
    path: 'days-validity',
    loadComponent: () => import('./pages/transversal-rate/transversalRate').then(m => m.TransversalRate),
  },
  {
    path: 'counter-enterprice',
    loadComponent: () => import('./pages/company-accountant-reading/counter-enterprice').then(m => m.CounterEnterprice),
  }
] as Routes;
