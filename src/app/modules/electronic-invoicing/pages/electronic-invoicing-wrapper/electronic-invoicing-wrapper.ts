import { Component, inject, PLATFORM_ID, computed, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ClientInvoices } from '../client-invoices/client-invoices';
import { Invoice } from '../invoice/invoice';

@Component({
  selector: 'app-electronic-invoicing-wrapper',
  standalone: true,
  imports: [CommonModule, ClientInvoices, Invoice],
  template: `
    @if (isRegistered()) {
      <app-client-invoices />
    } @else {
      <app-invoice />
    }
  `,
})
export class ElectronicInvoicingWrapper {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly userData = computed(() => {
    if (!this.isBrowser) return null;
    try {
      const userDataString = sessionStorage.getItem('userData');
      if (!userDataString) return null;
      return JSON.parse(userDataString);
    } catch (e) {
      return null;
    }
  });

  readonly isRegistered = computed(() => {
    const data = this.userData();
    if (!data) return false;

    return !!data.idEmpresaDian && data.idEmpresaDian.trim() !== '';
  });
}
