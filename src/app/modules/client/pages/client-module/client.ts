import { EnterpriseClientCounterService } from './../../service/enterpriseClientCounter.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, signal, computed, effect, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { Action, TableComponent } from '../../../../core/components/table';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ToastService } from '@services/toast.service';
import { EMPTY, map, of } from 'rxjs';
import { PopupComponent } from '@shared/components/popUp';
import { ClientRow } from '@interfaces/client/IclientRow';

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
      [datasource]="transformedData()"
      [actionTemplate]="actionsTemplate"
      [columnTemplates]="{ estado: estadoTpl }"
      [showAddButton]="true"
      [addButtonText]="'Agregar Cliente'"
      [showColumnFilters]="true"
      [showExportButton]="true"
      [exportFileName]="'mi_reporte_2025'"
      (action)="onTableAction($event)"
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
    { field: 'idContador', header: 'ID Contador' },
    { field: 'codigoVereda', header: 'Vereda' },
    { field: 'numeroIdentificacion', header: 'Número Identificación' },
    { field: 'nombreCliente', header: 'Nombre cliente' },
    { field: 'telefono', header: 'Teléfono' },
    { field: 'direccion', header: 'Dirección' },
    { field: 'correo', header: 'Correo' },
    { field: 'estado', header: 'Estado', template: 'estadoTpl' },
  ]);


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

  transformedData = computed(() => {
    const apiResponse = this.dataClientCounter.value();
    return apiResponse?.response || [];
  });

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
      // Pasar toda la información del cliente como state en la navegación
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
            this.dataClientCounter.reload?.();
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
}
