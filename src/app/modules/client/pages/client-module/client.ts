import { EnterpriseClientCounterService } from './../../service/enterpriseClientCounter.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, signal, computed, PLATFORM_ID, effect } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { Action, TableComponent } from '../../../../core/components/table';
import { rxResource } from '@angular/core/rxjs-interop';
import { ToastService } from '@services/toast.service';
import { EMPTY, catchError, of } from 'rxjs';
import { PopupComponent } from '@shared/components/popUp';
import { IPaginationParams } from '@interfaces/IpaginatedResponse';

@Component({
  selector: 'app-client',
  imports: [CommonModule, RouterModule, PopupComponent, TableComponent],
  template: `
    <ng-template #actionsTemplate let-row>
      <div class="flex items-center space-x-4">
        <button
          type="button"
          (click)="editar(row)"
          class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-blue-600/50 text-blue-400 hover:bg-blue-600/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors duration-200"
          title="Editar cliente">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>
    </ng-template>

    <ng-template #estadoTpl let-row>
      <div class="flex items-center gap-2">
        <label class="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            [checked]="row.activo"
            class="sr-only peer"
            (change)="onToggle(row)"
          />
          <div
            class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"
          ></div>
        </label>
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ row.activo ? 'Activo' : 'Inactivo' }}
        </span>
      </div>
    </ng-template>

    <app-table-dynamic
      [title]="title"
      [columns]="clienteColumns()"
      [serverMode]="true"
      [serverData]="serverClientData.value() ?? null"
      [loading]="serverClientData.isLoading()"
      [actionTemplate]="actionsTemplate"
      [columnTemplates]="{ activo: estadoTpl }"
      [showAddButton]="true"
      [addButtonText]="'Agregar Cliente'"
      [showColumnFilters]="true"
      [showExportButton]="true"
      [exportFileName]="exportFileName()"
      (action)="onTableAction($event)"
      (serverPaginationChange)="onPaginationChange($event)"
    >
    </app-table-dynamic>

    <app-pop-up
      [open]="showDeleteConfirm"
      [isConfirmation]="true"
      [title]="'Eliminar Cliente'"
      [message]="
        '¿Está seguro que desea eliminar este cliente? Esta acción no se puede deshacer.'
      "
      [confirmText]="'Eliminar'"
      [cancelText]="'Cancelar'"
      (confirmAction)="confirmDelete()"
    >
    </app-pop-up>
  `,
})
export class Client {
  showDeleteConfirm = signal(false);
  itemToDelete: number | null = null;
  title = 'Gestion de clientes';

  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly enterpriseClientCounterService = inject(
    EnterpriseClientCounterService
  );
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
  protected readonly toastService = inject(ToastService);

  clienteColumns = signal([
    { field: 'numeroCedula', header: 'Número Identificación', type: 'text' as const },
    { field: 'nombre', header: 'Nombre', type: 'text' as const },
    { field: 'apellido', header: 'Apellido', type: 'text' as const },
    { field: 'telefono', header: 'Teléfono', type: 'text' as const },
    { field: 'corregimientoNombre', header: 'Corregimiento', type: 'text' as const },
    { field: 'direccionDescripcion', header: 'Dirección', type: 'text' as const },
    { field: 'correo', header: 'Correo', type: 'text' as const },
    { field: 'activo', header: 'Estado', template: 'estadoTpl', type: 'text' as const },
  ]);

  readonly exportFileName = computed(
    () => `clientes_${new Date().toISOString().split('T')[0]}`
  );

  readonly paginationParams = signal<IPaginationParams>({
    page: 0,
    size: 5,
  });

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

    readonly enterpriseId = computed(() => {
    const data = this.userData();
    return data?.empresaId || null;
  });


  readonly nombreUsuario = computed(() => {
    const data = this.userData();
    return data?.nombre || null;
  });

  serverClientData = rxResource({
    params: () => ({
      enterpriseId: this.enterpriseId(),
      pagination: this.paginationParams(),
    }),
    stream: ({ params }) => {
      const { enterpriseId, pagination } = params;

      if (!enterpriseId) {
        console.warn('No enterprise ID available');
        return EMPTY;
      }

      return this.enterpriseClientCounterService.getAllClientsByIdEnterprisePaginated(
        enterpriseId,
        pagination
      ).pipe(
        catchError((error) => {
          return of(null);
        })
      );
    }
  });



  transformedData = computed(() => this.serverClientData.value() ?? null);

  onToggle(row: any) {
    const nuevoEstado = !row.activo;

    this.enterpriseClientCounterService
      .updateEstado({
        id_persona: row.id,
        activo: nuevoEstado,
        usuario_cambio: this.nombreUsuario()
      })
      .subscribe({
        next: (response) => {
          row.activo = nuevoEstado;
          this.toastService.success(
            'Éxito',
            'Estado actualizado correctamente'
          );
          // Recargar los datos para sincronizar
          this.serverClientData.reload?.();
        },
        error: (err) => {
          console.error('❌ Error al cambiar estado del cliente:', err);
          this.toastService.error(
            'Error',
            'Ocurrió un error al actualizar el estado'
          );
        },
      });
  }

  onDelete(id: number): void {
    this.itemToDelete = id;
    this.showDeleteConfirm.set(true);
  }

  editar(row: any) {
    const id = row?.id;
    if (id) {
      this.router.navigate(['update-client/', id], {
        relativeTo: this.route,
        state: { clienteData: row }
      });
    } else {
      this.toastService.error('Error', 'ID del cliente no válido.');
    }
  }

  confirmDelete(): void {
    if (this.itemToDelete !== null) {
      this.enterpriseClientCounterService
        .deleteClient(this.itemToDelete)
        .subscribe({
          next: () => {
            this.toastService.success(
              'Eliminado',
              'Cliente eliminado correctamente.'
            );
            this.serverClientData.reload?.();
          },
          error: () => {
            this.toastService.error('Error', 'No se pudo eliminar el cliente.');
          },
          complete: () => {
            this.showDeleteConfirm.set(false);
            this.itemToDelete = null;
          },
        });
    }
  }

  onTableAction(event: Action) {
    if (event.action === 'add') {
      this.router.navigate(['create-client'], { relativeTo: this.route });
    } else if (event.action === 'edit' && event.row) {
      this.editar(event.row);
    }
  }

  onPaginationChange(params: IPaginationParams): void {
    this.paginationParams.set(params);
  }
}
