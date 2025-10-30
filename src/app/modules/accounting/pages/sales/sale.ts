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
import { EMPTY, catchError, of } from 'rxjs';
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
      ).pipe(
        catchError(error => {
          console.error('Error loading sales:', error);
          // Mostrar toast solo en entorno de navegador
          if (this.isBrowser) {
            try {
              this.toastService.error('Error', 'No se pudieron cargar las ventas');
            } catch {}
          }

          // Devolver un objeto paginado consistente para evitar que rxResource entre en estado de error
          return of({
            success: false,
            message: 'Error al cargar ventas',
            code: error?.status || 500,
            totalCount: 0,
            pageSize: pagination?.size ?? 0,
            currentPage: pagination?.page ?? 0,
            totalPages: 0,
            response: []
          });
        })
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
    this.router.navigate(['/shell/accounting/sales/create']);
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
