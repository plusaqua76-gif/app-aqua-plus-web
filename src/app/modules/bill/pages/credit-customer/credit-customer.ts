import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AbonoService } from '../../service/abono.service';
import { TableComponent } from '@components/table';
import { rxResource } from '@angular/core/rxjs-interop';
import { map, EMPTY } from 'rxjs';
import { IPaginationParams } from '@interfaces/IpaginatedResponse';

@Component({
  selector: 'app-credit-customer',
  imports: [ CommonModule, TableComponent, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-table-dynamic
      [title]="title()"
      [columns]="creditCustomerColumns()"
      [serverMode]="true"
      [serverData]="serverCreditCustomerData.value() ?? null"
      [loading]="serverCreditCustomerData.isLoading()"
      [showExportButton]="true"
      [exportFileName]="exportFileName()"
      [showColumnFilters]="true"
      (serverPaginationChange)="onPaginationChange($event)"
    />
  `,

})
export class CreditCustomer {

  creditCustomerColumns = signal([
    { field: 'nombreCliente', header: 'Cliente', type: 'text' as const },
    { field: 'codigoFactura', header: 'Código Factura', type: 'text' as const },
    { field: 'fechaAbono', header: 'Fecha Abono', type: 'date' as const },
    { field: 'valorAbono', header: 'Valor Abono', type: 'text' as const },
  ]);

  title = signal('Abono Facturas');
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);
  protected readonly abonoService = inject(AbonoService);

  readonly empresaId = computed(() => {
    if (!this.isBrowser) return null;

    try {
      const userData = sessionStorage.getItem('userData');
      if (!userData) return null;

      const parsedUserData = JSON.parse(userData);
      return parsedUserData.empresaId ? Number(parsedUserData.empresaId) : null;
    } catch (error) {
      console.error('Error parsing userData from sessionStorage:', error);
      return null;
    }
  });

  readonly exportFileName = computed(
    () => `abonos_facturas_${new Date().toISOString().split('T')[0]}`
  );

  readonly paginationParams = signal<IPaginationParams>({
    page: 0,
    size: 5,
  });

  serverCreditCustomerData = rxResource({
    params: () => ({
      empresaId: this.empresaId(),
      pagination: this.paginationParams(),
    }),
    stream: ({ params }) => {
      const { empresaId, pagination } = params;
      if (!empresaId) {
        return EMPTY;
      }
      return this.abonoService.getAllAbonoPaginated(
        empresaId,
        pagination
      ).pipe(
        map((response) => ({
          ...response,
          response: response.response.map(abono => ({
            nombreCliente: abono.cliente,
            codigoFactura: abono.codigoFactura,
            fechaAbono: new Date(abono.fechaAbono).toLocaleDateString('es-CO'),
            valorAbono: `$${abono.valorAbono.toLocaleString('es-CO')}`
          }))
        }))
      );
    },
  });

  creditCustomerData = computed(() => this.serverCreditCustomerData.value() ?? null);

  onPaginationChange(params: IPaginationParams): void {
    this.paginationParams.set(params);
  }

}
