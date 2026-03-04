import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, signal, computed, PLATFORM_ID, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  Action,
  TableComponent,
} from '../../../../../app/core/components/table';
import { rxResource } from '@angular/core/rxjs-interop';
import { EmpleadoService } from '../../service/empleado.service';
import { catchError, EMPTY, of, map } from 'rxjs';
import { ToastService } from '@services/toast.service';
import { IPaginationParams } from '@interfaces/IpaginatedResponse';

@Component({
  selector: 'app-employee',
  imports: [CommonModule, RouterModule, TableComponent],
  template: `
    <ng-template #toggleTpl let-row>
      <div class="flex items-center gap-2">
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

        <!-- <button
          type="button"
          (click)="handleTableAction({ action: 'print', row })"
          class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-yellow-600/50 text-yellow-500 hover:bg-yellow-600/10 focus:outline-none focus:ring-2 focus:ring-yellow-500/40 transition-colors duration-200 cursor-pointer"
          title="Pagar Nómina">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button> -->
      </div>
    </ng-template>

    <ng-template #estadoTpl let-row>
      <div class="flex items-center gap-2">
        <label class="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            class="sr-only peer"
            [checked]="row.activo === true"
            [attr.data-activo]="row.activo"
            (change)="onToggle(row)"
          />
          <div
            class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"
          ></div>
        </label>
        <span class="text-sm font-medium" [class]="row.activo ? 'text-green-600' : 'text-red-600'">
          {{ row.activo ? 'Activo' : 'Inactivo' }}
        </span>
      </div>
    </ng-template>

    <app-table-dynamic
      [title]="title()"
      [columns]="employeeColumns()"
      [serverMode]="true"
      [serverData]="serverEmployeeData.value() ?? null"
      [loading]="serverEmployeeData.isLoading()"
      [actionTemplate]="toggleTpl"
      [columnTemplates]="{ estado: estadoTpl }"
      [showAddButton]="true"
      [addButtonText]="'Agregar Empleado'"
      [showExportButton]="true"
      [exportFileName]="exportFileName()"
      [showColumnFilters]="true"
      (action)="handleTableAction($event)"
      (serverPaginationChange)="onPaginationChange($event)"
    />
  `,
})
export class Employee {
  title = signal('Gestión de Empleados');
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  protected readonly empleadoService = inject(EmpleadoService);
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
  protected readonly toastService = inject(ToastService);

  employeeColumns = signal([
    { field: 'nombreCompleto', header: 'Nombre', type: 'text' as const },
    { field: 'cedula', header: 'Cédula', type: 'text' as const },
    { field: 'codigo', header: 'Código', type: 'text' as const },
    { field: 'telefono', header: 'Teléfono', type: 'text' as const },
    { field: 'correo', header: 'Correo Electrónico', type: 'text' as const },
    { field: 'estado', header: 'Estado', template: 'estadoTpl' },
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


  serverEmployeeData = rxResource({
    params: () => ({
      enterpriseId: this.enterpriseId(),
      pagination: this.paginationParams(),
    }),
    stream: ({ params }) => {
      const { enterpriseId, pagination } = params;
      if (!enterpriseId) {
        return EMPTY;
      }
      return this.empleadoService.getEmployeeByEnterpricePaginated(
        enterpriseId,
        pagination
      ).pipe(
              map(response => {
                if (response?.response && Array.isArray(response.response)) {
                  response.response = response.response.map((empleado: any) => ({
                    ...empleado,
                    nombreCompleto: empleado.personaNombreCompleto || '',
                    cedula: empleado.numeroCedula || ''
                  }));
                }
                return response;
              }),
              catchError((error) => {
                return of(null);
              })
            );
    },
  });


  readonly exportFileName = computed(
    () => `empleados_${new Date().toISOString().split('T')[0]}`
  );

  onPaginationChange(params: IPaginationParams): void {
    this.paginationParams.set(params);
  }




  onToggle(row: any): void {
    const estadoAnterior = row.activo === true;
    const nuevoEstado = !estadoAnterior;
    row.activo = nuevoEstado;

    this.empleadoService.updateEstadoEmpleado({
      id_persona: row.personaId,
      activo: nuevoEstado,
      usuario_cambio: localStorage.getItem('nameUser') || 'admin'
    }).subscribe({
      next: () => {
        this.toastService.success('Éxito', 'Estado actualizado correctamente');
      },
      error: (err) => {
        // Revertir el cambio en caso de error
        row.activo = estadoAnterior;
        console.error('Error al cambiar estado del empleado:', err.message);
        this.toastService.error('Error', 'Ocurrió un error al actualizar el estado');
      }
    });
  }


  editar(row: any): void {
    const id = row?.id;
    if (id) {
      this.router.navigate(['update-employee/', id], {
        relativeTo: this.route,
        state: { empleadoData: row }
      });
    }
     else {
      this.toastService.error('Error', 'ID del empleado no válido.');
    }
  }


  handleTableAction(event: Action): void {
    if (event.action === 'add') {
      this.router.navigate(['create-employee'], {
        relativeTo: this.route
      });
    } else if (event.action === 'print') {
      this.router.navigate(['payroll'], {
        relativeTo: this.route
      });
    }
  }

  // TrackBy function para mejorar el rendimiento de la tabla
  trackByEmployeeId(index: number, item: any): any {
    return item?.id || item?.personaId || index;
  }
}
