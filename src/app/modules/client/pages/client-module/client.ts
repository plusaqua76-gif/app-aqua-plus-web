import { EnterpriseClientCounterService } from './../../service/enterpriseClientCounter.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, signal, computed, PLATFORM_ID, effect } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { Action, TableComponent } from '../../../../core/components/table';
import { rxResource } from '@angular/core/rxjs-interop';
import { ToastService } from '@services/toast.service';
import { EMPTY, of } from 'rxjs';
import { PopupComponent } from '@shared/components/popUp';
import { ClientRow } from '@interfaces/client/IclientRow';
import { IPaginationParams } from '@interfaces/IpaginatedResponse';

@Component({
  selector: 'app-client',
  imports: [CommonModule, RouterModule, PopupComponent, TableComponent],
  template: `
    <ng-template #actionsTemplate let-row>
      <div class="flex items-center space-x-4">
        <button
          (click)="editar(row)"
          class="text-green-600 hover:text-green-900 text-sm cursor-pointer"
        >
          <i class="fas fa-edit"></i>
        </button>
      </div>
    </ng-template>

    <ng-template #estadoTpl let-row>
      <div class="flex items-center gap-2">
        <label class="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            class="sr-only peer"
            [checked]="row.estado"
            (change)="onToggle(row)"
          />
          <div
            class="relative w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full
                peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full
                after:content-[''] after:absolute after:top-[2px] after:start-[2px]
                after:bg-white after:border-gray-300 after:border after:rounded-full
                after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
          ></div>
        </label>
        <span class="text-sm font-medium">
          {{ row.estado ? 'Activo' : 'Inactivo' }}
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
      [columnTemplates]="{ estado: estadoTpl }"
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
    { field: 'numeroIdentificacion', header: 'Número Identificación', type: 'text' as const },
    { field: 'nombreCliente', header: 'Nombre cliente', type: 'text' as const },
    { field: 'telefono', header: 'Teléfono', type: 'text' as const },
    { field: 'corregimientoNombre', header: 'Corregimiento', type: 'text' as const },
    { field: 'direccionDescripcion', header: 'Dirección', type: 'text' as const },
    { field: 'correo', header: 'Correo', type: 'text' as const },
    { field: 'estado', header: 'Estado', template: 'estadoTpl', type: 'text' as const },
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
      );
    }
  });

  constructor() {
    effect(() => {
      console.log("la data mi pez", this.dataClientCounter.value())
    })
  }

  // Método legacy para compatibilidad con el toggle de estado
  dataClientCounter = rxResource({
    params: () => ({ enterpriseId: this.enterpriseId() }),
    stream: ({ params }) => {
      const { enterpriseId } = params;

      if (!enterpriseId) {
        console.warn('No enterprise ID available');
        return of({
          success: true,
          message: 'No enterprise ID available',
          code: 200,
          response: [] as ClientRow[]
        });
      }

      return this.enterpriseClientCounterService.getAllClientsByIdEnterprise(enterpriseId);
    }
  });

  transformedData = computed(() => this.serverClientData.value() ?? null);

  onToggle(row: any) {
    const nuevoEstado = !row.estado;

    this.enterpriseClientCounterService
      .updateEstado({
        id_persona: row.id,
        activo: nuevoEstado,
        usuario_cambio: this.nombreUsuario()
      })
      .subscribe({
        next: (response) => {
          row.estado = nuevoEstado;
          this.toastService.success(
            'Éxito',
            'Estado actualizado correctamente'
          );
        },
        error: (err) => {
          console.error('Error al cambiar estado del cliente:', err.message);
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
