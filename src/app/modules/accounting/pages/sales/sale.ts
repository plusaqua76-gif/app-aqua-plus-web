import {
  Component,
  computed,
  inject,
  PLATFORM_ID,
  signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SalesService } from '../../service/sales.service';
import { ToastService } from '@services/toast.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY } from 'rxjs';
import { TableComponent } from '@components/table';
import { PopupComponent } from '@shared/components/popUp';
import { IPaginationParams } from '@interfaces/IpaginatedResponse';
import { ISaleFilters } from '@interfaces/Isale';

@Component({
  selector: 'app-sale',
  imports: [CommonModule, TableComponent, RouterModule, PopupComponent],
  template: `
    <ng-template #actionsTemplate let-row>
      <div class="flex items-center space-x-2">
        <!-- <button
          type="button"
          (click)="handleTableAction({ action: 'edit', row })"
          class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-blue-600/50 text-blue-400 hover:bg-blue-600/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors duration-200 cursor-pointer"
          title="Editar venta"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button> -->
        <!-- <button
          type="button"
          (click)="handleTableAction({ action: 'view', row })"
          class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-green-600/50 text-green-500 hover:bg-green-600/10 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-colors duration-200 cursor-pointer"
          title="Ver detalles"
         >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button> -->
        <!-- <button
          type="button"
          (click)="handleTableAction({ action: 'delete', row })"
          class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-red-600/50 text-red-500 hover:bg-red-600/10 focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-colors duration-200 cursor-pointer"
          title="Eliminar venta"
         >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button> -->
      </div>
    </ng-template>

    <app-table-dynamic
      [title]="title()"
      [columns]="salesColumns()"
      [serverMode]="true"
      [serverData]="serverSalesData.value() ?? null"
      [loading]="serverSalesData.isLoading()"
      [actionTemplate]="actionsTemplate"
      [showAddButton]="true"
      [addButtonText]="'Nueva Venta'"
      [showExportButton]="true"
      [exportFileName]="exportFileName()"
      [showColumnFilters]="true"
      (action)="handleTableAction($event)"
      (serverPaginationChange)="onPaginationChange($event)"
    >
    </app-table-dynamic>

    <app-pop-up
      [open]="showDeleteConfirm"
      [isConfirmation]="true"
      [title]="'Eliminar Venta'"
      [message]="
        '¿Está seguro que desea eliminar esta venta? Esta acción no se puede deshacer.'
      "
      [confirmText]="'Eliminar'"
      [cancelText]="'Cancelar'"
      (confirmAction)="confirmDelete()"
    >
    </app-pop-up>
  `,
})
export class Sale {
  title = signal('Gestión de Ventas');
  showDeleteConfirm = signal(false);
  itemToDelete: number | null = null;
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  protected readonly salesService = inject(SalesService);
  protected readonly toastService = inject(ToastService);
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);

  salesColumns = signal([
    { field: 'codigo', header: 'Código', type: 'text' as const },
    { field: 'nombre', header: 'Cliente', type: 'text' as const },
    { field: 'identificacion', header: 'Identificación', type: 'text' as const },
    { field: 'cantidad', header: 'Cantidad', type: 'number' as const },
    { field: 'precioVenta', header: 'Precio Unitario', type: 'number' as const },
    { field: 'valorTotal', header: 'Valor Total', type: 'number' as const },
  ]);

  readonly enterpriseId = computed(() => {
    if (!this.isBrowser) return null;

    try {
      const userData = sessionStorage.getItem('userData');
      if (!userData) return null;

      const parsedUserData = JSON.parse(userData);
      return parsedUserData.empresaId ? Number(parsedUserData.empresaId) : null;
    } catch {
      return null;
    }
  });

  readonly exportFileName = computed(
    () => `ventas_${new Date().toISOString().split('T')[0]}`
  );

  readonly paginationParams = signal<IPaginationParams>({
    page: 0,
    size: 5,
  });

  readonly filters = signal<ISaleFilters>({});

  serverSalesData = rxResource({
    params: () => ({
      enterpriseId: this.enterpriseId(),
      pagination: this.paginationParams(),
      filters: this.filters(),
    }),
    stream: ({ params }) => {
      const { enterpriseId, pagination, filters } = params;
      if (!enterpriseId) {
        return EMPTY;
      }
      return this.salesService.getAllSalesByIdPaginated(
        enterpriseId,
        pagination,
        filters
      );
    },
  });

  handleTableAction(event: { action: string; row?: any }): void {
    if (event.action === 'add') {
      this.goToCreateSale();
    } else if (event.action === 'edit' && event.row) {
      this.router.navigate(['edit', event.row.id], {
        relativeTo: this.route,
      });
    } else if (event.action === 'view' && event.row) {
      // Por ahora no se implementa la vista de detalles
      this.toastService.info('Ver detalles', 'Funcionalidad en desarrollo');
    } else if (event.action === 'delete' && event.row) {
      this.onDelete(event.row.id);
    }
  }

  goToCreateSale(): void {
    this.router.navigate(['create'], {
      relativeTo: this.route,
    });
  }

  onDelete(id: number): void {
    this.itemToDelete = id;
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(): void {
    if (this.itemToDelete !== null) {
      this.salesService.deleteSaleById(this.itemToDelete).subscribe({
        next: () => {
          this.toastService.success(
            'Eliminado',
            'Venta eliminada correctamente.'
          );
          this.serverSalesData.reload?.();
          this.itemToDelete = null;
        },
        error: () => {
          this.toastService.error('Error', 'No se pudo eliminar la venta.');
          this.itemToDelete = null;
        },
      });
    }
    this.showDeleteConfirm.set(false);
  }

  onPaginationChange(params: IPaginationParams): void {
    // Extraer los filtros de los parámetros y convertirlos al formato esperado
    if (params.filters) {
      const saleFilters: ISaleFilters = {};

      // Mapear los filtros del formato Record<string, string> a ISaleFilters
      for (const [key, value] of Object.entries(params.filters)) {
        if (value?.trim()) {
          switch (key) {
            case 'codigo':
              saleFilters.codigo = value;
              break;
            case 'nombre':
              saleFilters.nombre = value;
              break;
            case 'identificacion':
              saleFilters.identificacion = value;
              break;
            case 'cantidad':
              saleFilters.cantidad = Number(value) || undefined;
              break;
            case 'precioVenta':
              saleFilters.precioVenta = Number(value) || undefined;
              break;
            case 'valorTotal':
              saleFilters.valorTotal = Number(value) || undefined;
              break;
            case 'descripcion':
              saleFilters.descripcion = value;
              break;
            case 'clienteNombre':
              saleFilters.clienteNombre = value;
              break;
          }
        }
      }

      this.filters.set(saleFilters);
    } else {
      // Si no hay filtros, limpiar
      this.filters.set({});
    }

    // Actualizar los parámetros de paginación
    this.paginationParams.set({
      page: params.page,
      size: params.size,
    });
  }
}
