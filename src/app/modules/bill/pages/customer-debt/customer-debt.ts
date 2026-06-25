import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DeudaService } from '../../service/deuda.service';
import { ToastService } from '@services/toast.service';
import { TableComponent } from '@components/table';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { IPaginationParams } from '@interfaces/IpaginatedResponse';
import { ConfirmDeletePopupComponent } from '@shared/components/confirm-delete-popup';
import { TipoDeudaService } from '../../service/tipoDeuda.service';

@Component({
  selector: 'app-customer-debt',
  imports: [CommonModule, TableComponent, RouterModule, ConfirmDeletePopupComponent],
  template: `
    <ng-template #actionsTemplate let-row>
      <div class="flex items-center space-x-2">
        <button
          type="button"
          (click)="handleTableAction({ action: 'edit', row })"
          class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-blue-600/50 text-blue-400 hover:bg-blue-600/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors duration-200 cursor-pointer"
          title="Editar deuda"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          type="button"
          (click)="redirigirCrearAbono(row.id)"
          class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-yellow-600/50 text-yellow-500 hover:bg-yellow-600/10 focus:outline-none focus:ring-2 focus:ring-yellow-500/40 transition-colors duration-200 cursor-pointer"
          title="Crear abono"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <button
          type="button"
          (click)="handleTableAction({ action: 'delete', row })"
          class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-red-600/50 text-red-500 hover:bg-red-600/10 focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-colors duration-200 cursor-pointer"
          title="Eliminar deuda"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
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
  [addButtonText]="'Abonos de clientes'"
  [addButtonIcon]="'fa-solid fa-hand-holding-dollar'"
  secondaryButtonText="Crear deuda"
  [showSecondaryButton]="true"
  [showExportButton]="true"
  [exportFileName]="exportFileName()"
  [showColumnFilters]="true"
  (secondaryButtonAction)="createdebt()"
  (action)="handleTableAction($event)"
  (serverPaginationChange)="onPaginationChange($event)"
  [exportData]="exportDataForTable()"
  [isLoadingExportData]="isLoadingExportData()"
  >
  </app-table-dynamic>

  <app-confirm-delete-popup
    [isOpen]="isDeleteModalOpen()"
    [isSubmitting]="isDeletingDebt()"
    headerTitle="Eliminar Deuda"
    headerIcon="fas fa-exclamation-triangle"
    confirmMessage="¿Está seguro de eliminar esta deuda?"
    warningMessage="Esta acción no se puede deshacer. Toda la información asociada será eliminada permanentemente."
    itemLabel="Deuda"
    [itemName]="debtToDeleteName()"
    confirmText="Eliminar Deuda"
    cancelText="Cancelar"
    loadingText="Eliminando..."
    (confirm)="executeDelete()"
    (cancel)="closeDeleteModal()">
  </app-confirm-delete-popup>

  `
})
export class CustomerDebt {


  exportDataForTable = signal<any[] | null>(null);
  isLoadingExportData = signal(false);

  readonly tipoDeudaFilterOptions = computed(() => {
    const tipos = this.tipoDeuda.value()?.response;
    if (!Array.isArray(tipos)) return [];

    return tipos.map((tipo) => ({
      label: tipo.nombre,
      value: tipo.nombre,
    }));
  });

  readonly debtColumns = computed(() => [
    { field: 'clienteNombre', header: 'Cliente', type: 'text' as const },
    { field: 'facturaCodigo', header: 'Factura', type: 'text' as const },
    { field: 'fechaDeuda', header: 'Fecha deuda', type: 'date' as const },
    {
      field: 'tipoDeudaNombre',
      header: 'Tipo deuda',
      type: 'text' as const,
      filterOptions: this.tipoDeudaFilterOptions(),
      filterPlaceholder: 'Todos',
      filterVariant: 'badge' as const,
    },
    { field: 'valorTotal', header: 'Valor total', type: 'currency' as const },
    { field: 'totalAbonado', header: 'Abonado', type: 'currency' as const },
    { field: 'saldoPendiente', header: 'Saldo pendiente', type: 'currency' as const },
    { field: 'valorMes', header: 'Valor cuota', type: 'currency' as const },
    { field: 'meses', header: 'N° de cuotas', type: 'text' as const },
  ]);



  protected readonly deudaService = inject(DeudaService);
  protected readonly tipoDeudaService = inject(TipoDeudaService);
  protected readonly toastService = inject(ToastService);
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
  protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);


    constructor() {
    effect(() => {
      const data = this.exportDataForTable();
      const isLoading = this.isLoadingExportData();
      if (data && data.length > 0 && !isLoading) {
        setTimeout(() => {
          this.exportDataForTable.set(null);
        }, 2000);
      }
    });
  }

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
        return of(null);
      }
      return this.deudaService.getAllDeudaPaginated(
        empresaId,
        pagination
      ).pipe(catchError((error) => {
        return of(null);
      }));
    },
  });

  tipoDeuda = rxResource({
    stream: () => this.tipoDeudaService.getAllTipoDeuda().pipe(
      catchError(error => {
        console.error('Error loading debt types:', error);
        return of(null);
      }),
    ),
  });

  debtData = computed(() => this.serverDebtData.value() ?? null);
  title = signal('Deuda de clientes');

  // Señales para el modal de eliminación
  isDeleteModalOpen = signal(false);
  debtIdToDelete = signal<number | null>(null);
  debtToDeleteName = signal<string>('');
  isDeletingDebt = signal(false);

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
    const debtData = this.serverDebtData.value();
    const debt = debtData?.response.find((d: any) => d.id === id);

    this.debtIdToDelete.set(id);
    this.debtToDeleteName.set(debt?.facturaCodigo || 'Sin identificar');
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    this.debtIdToDelete.set(null);
    this.debtToDeleteName.set('');
    this.isDeletingDebt.set(false);
  }

  executeDelete() {
    const id = this.debtIdToDelete();
    if (!id) return;

    this.isDeletingDebt.set(true);
    this.deudaService.deleteDeudaById(id).subscribe({
      next: () => {
        this.toastService.success('Éxito', 'Deuda eliminada correctamente');
        this.serverDebtData.reload?.();
        this.closeDeleteModal();
      },
      error: (error) => {
        this.toastService.error('Error', 'No se pudo eliminar la deuda');
        this.isDeletingDebt.set(false);
        console.error('Error deleting debt:', error);
      }
    });
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
