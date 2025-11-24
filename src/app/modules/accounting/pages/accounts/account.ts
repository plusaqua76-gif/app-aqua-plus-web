import {
  Component,
  computed,
  effect,
  inject,
  PLATFORM_ID,
  signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AccountsService } from '../../service/accounts.service';
import { ToastService } from '@services/toast.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, of } from 'rxjs';
import { TableComponent } from '@components/table';
import { PopupComponent } from '@shared/components/popUp';
import { IPaginationParams } from '@interfaces/IpaginatedResponse';
import { IAccountFilters } from '@interfaces/Iaccount';
import { log } from 'console';

@Component({
  selector: 'app-account',
  imports: [CommonModule, TableComponent, RouterModule, PopupComponent],
  template: `
    <ng-template #actionsTemplate let-row>
      <div class="flex items-center space-x-2">
        <button
          type="button"
          (click)="handleTableAction({ action: 'edit', row })"
          class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-blue-600/50 text-blue-400 hover:bg-blue-600/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors duration-200 cursor-pointer"
          title="Editar cuenta"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          type="button"
          (click)="handleTableAction({ action: 'delete', row })"
          class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-red-600/50 text-red-500 hover:bg-red-600/10 focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-colors duration-200 cursor-pointer"
          title="Eliminar cuenta"
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
      [columns]="accountColumns()"
      [serverMode]="true"
      [serverData]="transformedAccountData() ?? null"
      [loading]="serverAccountData.isLoading()"
      [actionTemplate]="actionsTemplate"
      [showAddButton]="true"
      [addButtonText]="'Nueva Cuenta'"
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
      [title]="'Eliminar Cuenta'"
      [message]="
        '¿Está seguro que desea eliminar esta cuenta? Esta acción no se puede deshacer.'
      "
      [confirmText]="'Eliminar'"
      [cancelText]="'Cancelar'"
      (confirmAction)="confirmDelete()"
    >
    </app-pop-up>
  `,
})
export class Account {
  title = signal('Gestión de Cuentas Contables');
  showDeleteConfirm = signal(false);
  itemToDelete: number | null = null;
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  protected readonly accountsService = inject(AccountsService);
  protected readonly toastService = inject(ToastService);
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);

  accountColumns = signal([
    { field: 'codigo', header: 'Código', type: 'text' as const },
    { field: 'nombre', header: 'Nombre', type: 'text' as const },
    { field: 'valor', header: 'Valor', type: 'number' as const },
    { field: 'tipoNombre', header: 'Tipo Cuenta', type: 'text' as const },
    { field: 'tipoNaturaleza', header: 'Naturaleza', type: 'text' as const },
    { field: 'descripcion', header: 'Descripción', type: 'text' as const },
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
    () => `cuentas_${new Date().toISOString().split('T')[0]}`
  );

  readonly paginationParams = signal<IPaginationParams>({
    page: 0,
    size: 5,
  });

  readonly filters = signal<IAccountFilters>({});

  // Transformar los datos para aplanar las propiedades anidadas
  readonly transformedAccountData = computed(() => {
    const rawData = this.serverAccountData.value();
    if (!rawData?.response) return null;

    const transformedResponse = rawData.response.map(account => ({
      ...account,
      tipoNombre: account.tipoCuenta?.nombre || '',
      tipoNaturaleza: account.tipoCuenta?.naturaleza || '',
      descripcion: account.tipoCuenta.descripcion || ''
    }));

    return {
      ...rawData,
      response: transformedResponse
    };
  });

  serverAccountData = rxResource({
    params: () => ({
      enterpriseId: this.enterpriseId(),
      pagination: this.paginationParams(),
      filters: this.filters(),
    }),
    stream: ({ params }) => {
      const { enterpriseId, pagination, filters } = params;
      if (!enterpriseId) {
        return of(null);
      }
      return this.accountsService.getAllAccountsByIdPaginated(
        enterpriseId,
        pagination,
        filters
      ).pipe(
        catchError(error => {
          console.error('Error loading accounts:', error);
          // Mostrar toast solo en entorno de navegador
          if (this.isBrowser) {
            try {
              this.toastService.error('Error', 'No se pudieron cargar las cuentas');
            } catch {}
          }

          // Devolver un objeto paginado consistente para evitar que rxResource entre en estado de error
          return of({
            success: false,
            message: 'Error al cargar cuentas',
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
      this.goToCreateAccount();
    } else if (event.action === 'edit' && event.row) {
      this.router.navigate(['/shell/accounting/accounts/edit', event.row.id]);
    } else if (event.action === 'view' && event.row) {
      this.router.navigate(['/shell/accounting/accounts/detail', event.row.id]);
    } else if (event.action === 'delete' && event.row) {
      this.onDelete(event.row.id);
    }
  }

  goToCreateAccount(): void {
    this.router.navigate(['/shell/accounting/accounts/create']);
  }

  onDelete(id: number): void {
    this.itemToDelete = id;
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(): void {
    if (this.itemToDelete !== null) {
      this.accountsService.deleteAccountById(this.itemToDelete).pipe(
        catchError(error => {
          console.error('Error deleting account:', error);
          this.toastService.error('Error', 'No se pudo eliminar la cuenta.');
          this.itemToDelete = null;
          return of({ success: false, response: null, message: 'Error al eliminar cuenta' });
        })
      ).subscribe({
        next: (response) => {
          if (response.success !== false) {
            this.toastService.success(
              'Eliminado',
              'Cuenta eliminada correctamente.'
            );
            this.serverAccountData.reload?.();
          }
          this.itemToDelete = null;
        },
        error: (error) => {
          console.error('Error en subscribe deleteAccount:', error);
          this.toastService.error('Error', 'Error inesperado al eliminar la cuenta.');
          this.itemToDelete = null;
        },
      });
    }
    this.showDeleteConfirm.set(false);
  }

  onPaginationChange(params: IPaginationParams): void {
    // Extraer los filtros de los parámetros y convertirlos al formato esperado
    if (params.filters) {
      const accountFilters: IAccountFilters = {};

      // Mapear los filtros del formato Record<string, string> a IAccountFilters
      for (const [key, value] of Object.entries(params.filters)) {
        if (value?.trim()) {
          switch (key) {
            case 'codigo':
              accountFilters.codigo = value;
              break;
            case 'nombre':
              accountFilters.nombre = value;
              break;
            case 'valor':
              accountFilters.valor = Number(value) || undefined;
              break;
            case 'tipoNombre':
              accountFilters.tipoNombre = value; // La API espera tipoNombre
              break;
            case 'tipoNaturaleza':
              accountFilters.tipoNaturaleza = value; // La API espera tipoNaturaleza
              break;
          }
        }
      }

      this.filters.set(accountFilters);
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
