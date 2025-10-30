import {
  Component,
  computed,
  effect,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { UserAccessService } from '../services/users-access.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { TableComponent } from '@components/table';
import { isPlatformBrowser } from '@angular/common';
import { catchError, EMPTY, of } from 'rxjs';
import { IPaginationParams } from '@interfaces/IpaginatedResponse';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-user-access',
  imports: [TableComponent],
  template: `
    <ng-template #estadoTpl let-row>
      <div class="flex items-center gap-2">
        <label class="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            [checked]="row.activo"
            class="sr-only peer"
            (change)="toggleUserState(row)"
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
      [title]="title()"
      [columns]="readingColumns()"
      [serverMode]="true"
      [serverData]="usersInactives.value() ?? null"
      [loading]="usersInactives.isLoading()"
      [columnTemplates]="{ estadoNombre: estadoTpl }"
      [showExportButton]="true"
      [exportFileName]="exportFileName()"
      [showColumnFilters]="true"
      (action)="($event)"
      (serverPaginationChange)="onPaginationChange($event)"
    >
    </app-table-dynamic>
  `,
})
export class UserAccess {
  title = signal('Gestión Accesos');

  readonly userAccessService = inject(UserAccessService);
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly idUserSelected = signal<number | null>(null);
  readonly toastService = inject(ToastService);

  readingColumns = signal([
    { field: 'nombre', header: 'Nombre de Usuario', type: 'text' as const },
    { field: 'nombreEmpresa',header: 'Nombre de Empresa', type: 'text' as const },
    { field: 'estadoNombre', header: 'Estado', template: 'estadoTpl', type: 'text' as const },
  ]);

    readonly userData = computed(() => {
    if (!this.isBrowser) return null;
    try {
      const userDataString = sessionStorage.getItem('userData');
      if (!userDataString) return null;
      return JSON.parse(userDataString);
    } catch (e) {
      return null;
    }
  });

  readonly empresaId = computed(() => {
    const data = this.userData();
    return data?.empresaId || null;
  });

  readonly nombreUsuario = computed(() => {
    const data = this.userData();
    return data?.nombre || null;
  });

    readonly paginationParams = signal<IPaginationParams>({
      page: 0,
      size: 5,
    });

    usersInactives = rxResource({
      params: () => ({
        enterpriseId: this.empresaId(),
        pagination: this.paginationParams(),
      }),
      stream: ({ params }) => {
        const { enterpriseId, pagination } = params;
        if (!enterpriseId) {
          return EMPTY;
        }
        return this.userAccessService.getAllUsersAccess(
          enterpriseId,
          pagination
        ).pipe(
                catchError((error) => {
                  return of(null);
                })
              );
      },
    });

    readonly exportFileName = computed(
      () => `accesos_usuarios_${new Date().toISOString().split('T')[0]}`
    );


  toggleUserState(row: any): void {
    const estadoActual = row.activo;
    const nuevoEstado = !estadoActual;
    const usuarioCambio = this.nombreUsuario();

    if (!usuarioCambio) {
      this.toastService.error('Error', 'No se pudo obtener el usuario logueado');
      return;
    }

    this.userAccessService.getEnterpriceIdByIdUser(row.id).subscribe({
      next: (response) => {
        const enterpriseId = response?.response?.empresaId;
        if (!enterpriseId) {
          console.error(' No se pudo obtener el ID de empresa para el usuario:', row.id);
          this.toastService.error('Error', 'No se pudo obtener el ID de empresa para el usuario');
          return;
        }

        // Crear el payload para el servicio
        const payload = {
          idEmpresa: enterpriseId,
          activo: nuevoEstado,
          usuarioCambio: usuarioCambio
        };

        // Llamar al servicio para actualizar el estado
        this.userAccessService.updateUserStatus(payload).subscribe({
          next: (response) => {
            row.activo = nuevoEstado;
            if (row.estado) {
              row.estado.nombre = nuevoEstado ? 'Activo' : 'Inactivo';
            }

            this.toastService.success(
              'Éxito',
              `Usuario ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`
            );

            this.usersInactives.reload?.();
          }
        });
      }
    });
  }

      onPaginationChange(params: IPaginationParams): void {
    this.paginationParams.set(params);
  }


}
