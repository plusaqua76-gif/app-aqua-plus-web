import { EnterpriseClientCounterService } from './../../service/enterpriseClientCounter.service';
import { CommonModule } from '@angular/common';
import { Component, inject, signal, computed, effect } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { Action, TableComponent } from '../../../../core/components/table';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ToastService } from '@services/toast.service';
import { EMPTY, map, of } from 'rxjs';
import { PopupComponent } from '@shared/components/popUp';
import { EnterpriseIdService } from '@services/enterpriceId.service';
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

        <button
          (click)="onDelete(row.id)"
          class="text-red-600 hover:text-red-900 text-sm cursor-pointer"
        >
          <i class="fas fa-trash"></i>
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

  private enterpriseIdService = inject(EnterpriseIdService);
  private enterpriseClientCounterService = inject(
    EnterpriseClientCounterService
  );
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
  protected readonly toastService = inject(ToastService);

  clienteColumns = signal([
    { field: 'idContador', header: 'ID Contador' },
    { field: 'codigoVereda', header: 'Vereda' },
    { field: 'numeroIdentificacion', header: 'Número Identificación' },
    { field: 'razonSocial', header: 'Razón Social' },
    { field: 'nombreCliente', header: 'Nombre cliente' },
    { field: 'telefono', header: 'Teléfono' },
    { field: 'direccion', header: 'Dirección' },
    { field: 'correo', header: 'Correo' },
    { field: 'estado', header: 'Estado', template: 'estadoTpl' },
  ]);

  readonly enterpriseId = toSignal<number | null>(
    this.enterpriseIdService.getEnterpriseId(),
    { initialValue: null }
  );

  // // Agregar effect para debugging
  // constructor() {
  //   effect(() => {
  //     const id = this.enterpriseId();
  //     console.log('Enterprise ID changed:', id);
  //     if (id === null) {
  //       console.warn('Enterprise ID is null - checking sessionStorage userData');
  //     }
  //   });

  //   effect(() => {
  //     const resourceState = this.dataClientCounter.status();
  //     console.log('Resource status:', resourceState);

  //     if (resourceState === 'error') {
  //       console.error('Resource error:', this.dataClientCounter.error());
  //     }
  //   });
  // }

  dataClientCounter = rxResource({
    params: () => this.enterpriseId(),
    stream: ({ params: id }) => {
      if (!id) {
        return of({
          success: true,
          message: 'No enterprise ID available',
          code: 200,
          response: [] as ClientRow[] 
        });
      }
      return this.enterpriseClientCounterService.getAllCounterByIdEnterprise(id);
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
        usuario_cambio: localStorage.getItem('nameUser') || 'admin',
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
          console.error('Error al cambiar estado del empleado:', err.message);
          row.estado = !nuevoEstado;
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
      this.router.navigate(['/client/update-client/', id], {
        relativeTo: this.route,
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
