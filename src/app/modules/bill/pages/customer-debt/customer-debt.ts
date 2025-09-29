import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DeudaService } from '../../service/deuda.service';
import { ApiResponse } from '@interfaces/Iresponse';
import { ToastService } from '@services/toast.service';
import { TableComponent } from '@components/table';
import { rxResource } from '@angular/core/rxjs-interop';
import { map, EMPTY } from 'rxjs';
import { IPaginationParams } from '@interfaces/IpaginatedResponse';

@Component({
  selector: 'app-customer-debt',
  imports: [CommonModule, TableComponent, RouterModule],
  template: `
    <ng-template #actionsTemplate let-row>
    <div class="flex items-center space-x-2">
      <button (click)="handleTableAction({ action: 'edit', row })"
        class="text-green-600 hover:text-green-900 text-sm">
        <i class="fas fa-edit"></i>
      </button>
      <button (click)="redirigirCrearAbono(row.id)"
        class="text-yellow-600 hover:text-yellow-900 text-sm">
        <i class="fas fa-coins"></i>
      </button>
      <button (click)="handleTableAction({ action: 'delete', row })"
        class="text-red-600 hover:text-red-900 text-sm">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  </ng-template>

  <app-table-dynamic
  [title]="title()"
  [columns]="debtColumns()"
  [serverMode]="true"
  [serverData]="debtData()"
  [loading]="serverDebtData.isLoading()"
  [actionTemplate]="actionsTemplate"
  [showAddButton]="true"
  [addButtonText]="'Abono factura'"
  secondaryButtonText="Crear deuda"
  [showSecondaryButton]="true"
  [showExportButton]="true"
  [exportFileName]="exportFileName()"
  [showColumnFilters]="true"
  (secondaryButtonAction)="createdebt()"
  (action)="handleTableAction($event)"
  (serverPaginationChange)="onPaginationChange($event)">
  </app-table-dynamic>

  `
})
export class CustomerDebt {

  debtColumns = signal([
    { field: 'clienteNombreCompleto', header: 'Cliente', type: 'text' as const },
    { field: 'facturaCodigo', header: 'Factura', type: 'text' as const },
    { field: 'fechaDeudaTexto', header: 'Fecha deuda', type: 'date' as const },
    { field: 'descripcion', header: 'Descripción', type: 'text' as const },
    { field: 'tipoDeudaNombre', header: 'Tipo deuda', type: 'text' as const },
    { field: 'valorTexto', header: 'Valor', type: 'text' as const },
    { field: 'activo', header: 'Estado', type: 'text' as const },
    { field: 'plazoPagoNombre', header: 'N° de cuotas', type: 'text' as const }
  ]);

  protected readonly deudaService = inject(DeudaService);
  protected readonly toastService = inject(ToastService);
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
    protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);

    readonly userData = computed(() => {
    if (!this.isBrowser) return null;
    try {
      const userDataString = sessionStorage.getItem('userData');
      if (!userDataString) return null;
      return JSON.parse(userDataString);
    } catch (e) {
      console.error('Error parsing userData from sessionStorage:', e);
      return null;
    }
  });

  readonly empresaId = computed(() => {
    const data = this.userData();
    return data?.empresaId || null;
  });

  readonly exportFileName = computed(
    () => `deudas_clientes_${new Date().toISOString().split('T')[0]}`
  );

  readonly paginationParams = signal<IPaginationParams>({
    page: 0,
    size: 5,
  });





  /** commentNg
   * @author [PipeChavarro]
   *
   * @remarks
   * El componente no debería realizar ninguna lógica para mostrar la data; toda la lógica de transformación debe hacerse en el backend.
   * Si existe alguna lógica que no se pueda realizar desde el backend, debe implementarse en el service de Angular, no en el componente.
   */

  serverDebtData = rxResource({
    params: () => ({
      empresaId: this.empresaId(),
      pagination: this.paginationParams(),
    }),
    stream: ({ params }) => {
      const { empresaId, pagination } = params;
      if (!empresaId) {
        return EMPTY;
      }
      return this.deudaService.getAllDeudaPaginated(
        empresaId,
        pagination
      ).pipe(
        map((response) => ({
          ...response,
          response: response.response.map(deuda => ({
            id: deuda.id,
            clienteNombreCompleto: deuda.clienteNombre,
            facturaCodigo: deuda.facturaCodigo,
            fechaDeudaTexto: new Date(deuda.fechaDeuda).toLocaleDateString('es-CO'),
            descripcion: deuda.descripcion,
            tipoDeudaNombre: deuda.tipoDeuda?.nombre ?? '',
            valorTexto: `$${deuda.valor.toLocaleString('es-CO')}`,
            activo: deuda.activo ? 'PENDIENTE' : 'PAGO',
            plazoPagoNombre: deuda.plazoPago?.nombre || '0'
          }))
        }))
      );
    },
  });

  debtData = computed(() => this.serverDebtData.value() ?? null);
  title = signal('Deuda de clientes');


  handleTableAction(event: { action: string; row?: any }) {
  switch (event.action) {
    case 'edit':
      this.router.navigate(['../update-debt', event.row.id], {
        relativeTo: this.route,
      });
      break;
    case 'delete':
      this.confirmDelete(event.row?.id);
      break;
    case 'add':
      this.irAbonoFactura();
      break;
  }
}


  confirmDelete(id: number) {
    if (confirm('¿Eliminar deuda?')) {
      this.deudaService.deleteDeudaById(id).subscribe({
        next: () => {
          this.toastService.success('Éxito', 'Deuda eliminada');
          this.serverDebtData.reload?.();
        },
        error: () => this.toastService.error('Error', 'No se pudo eliminar')
      });
    }
  }

  onPaginationChange(params: IPaginationParams): void {
    this.paginationParams.set(params);
  }

  createdebt() {
    this.router.navigate(['../create-debt'], {
      relativeTo: this.route,
    });
  }

  irAbonoFactura() {
    this.router.navigate(['../credit-customer'], {
      relativeTo: this.route,
    });
  }

  redirigirCrearAbono(id: number) {
    this.router.navigate(['../create-credit', id], {
      relativeTo: this.route,
    });
  }


}
