import {
  Component,
  computed,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FacturaService } from '../../service/factura.service';
import { ToastService } from '@services/toast.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY } from 'rxjs';
import { TableComponent } from '@components/table';
import { PopupComponent } from '@shared/components/popUp';
import { IPaginationParams } from '@interfaces/IpaginatedResponse';

@Component({
  selector: 'app-bill',
  imports: [CommonModule, TableComponent, RouterModule, PopupComponent],
  template: `
    <ng-template #actionsTemplate let-row>
      <div class="flex items-center space-x-2">
        <button
          (click)="handleTableAction({ action: 'edit', row })"
          class="text-green-600 hover:text-green-900 text-sm cursor-pointer"
        >
          <i class="fas fa-edit"></i>
        </button>
        <button
          (click)="onDelete(row.id)"
          class="text-red-600 hover:text-red-900 text-sm cursor-pointer"
        >
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </ng-template>

    <app-table-dynamic
      [title]="title()"
      [columns]="billColumns()"
      [serverMode]="true"
      [serverData]="serverBillData.value() ?? null"
      [loading]="serverBillData.isLoading()"
      [actionTemplate]="actionsTemplate"
      [showAddButton]="true"
      [addButtonText]="'Deuda Clientes'"
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
      [title]="'Eliminar Factura'"
      [message]="
        '¿Está seguro que desea eliminar esta factura? Esta acción no se puede deshacer.'
      "
      [confirmText]="'Eliminar'"
      [cancelText]="'Cancelar'"
      (confirmAction)="confirmDelete()"
    >
    </app-pop-up>
  `,
})
export class Bill {
  title = signal('Gestión de Facturas');
  showDeleteConfirm = signal(false);
  itemToDelete: number | null = null;
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  protected readonly facturaService = inject(FacturaService);
  protected readonly toastService = inject(ToastService);
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);

  billColumns = signal([
    { field: 'codigo', header: 'Código', type: 'text' as const },
    { field: 'nombre', header: 'Nombre', type: 'text' as const },
    { field: 'apellido', header: 'Apellido', type: 'text' as const },
    { field: 'consumo', header: 'Consumo (m³)', type: 'number' as const },
    { field: 'fechaEmision', header: 'Fecha emisión', type: 'date' as const },
    { field: 'fechaFin', header: 'Fecha Vencimiento', type: 'date' as const },
    { field: 'estadoNombre', header: 'Estado', type: 'text' as const },
    { field: 'tipoPagoNombre', header: 'Tipo Pago', type: 'text' as const },
    { field: 'precio', header: 'Precio', type: 'number' as const },
  ]);

  readonly enterpriseId = computed(() => {
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

  readonly paginationParams = signal<IPaginationParams>({
    page: 0,
    size: 5,
  });

  readonly exportFileName = computed(
    () => `facturas_${new Date().toISOString().split('T')[0]}`
  );

  serverBillData = rxResource({
    params: () => ({
      enterpriseId: this.enterpriseId(),
      pagination: this.paginationParams(),
    }),
    stream: ({ params }) => {
      const { enterpriseId, pagination } = params;
      if (!enterpriseId) {
        console.warn('No enterprise ID available for bills');
        return EMPTY;
      }
      return this.facturaService.getAllBillByIdPaginated(
        enterpriseId,
        pagination
      );
    },
  });

  goToCustomerDebt(): void {
    this.router.navigate(['/bill/customer-debt']);
  }

  handleTableAction(event: { action: string; row?: any }): void {
    if (event.action === 'add') {
      this.goToCustomerDebt();
    } else if (event.action === 'edit' && event.row) {
      this.router.navigate(['shell/bill/update-bill', event.row.id], {
        relativeTo: this.route,
      });
    } else if (event.action === 'delete' && event.row) {
      this.onDelete(event.row.id);
    }
  }

  onDelete(id: number): void {
    this.itemToDelete = id;
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(): void {
    if (this.itemToDelete !== null) {
      this.facturaService.deleteFacturaById(this.itemToDelete).subscribe({
        next: () => {
          this.toastService.success(
            'Eliminado',
            'Factura eliminada correctamente.'
          );
          this.serverBillData.reload?.();
          this.itemToDelete = null;
        },
        error: () => {
          this.toastService.error('Error', 'No se pudo eliminar la factura.');
          this.itemToDelete = null;
        },
      });
    }
    this.showDeleteConfirm.set(false);
  }

  onPaginationChange(params: IPaginationParams): void {
    this.paginationParams.set(params);
  }

}
