import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, signal, computed, PLATFORM_ID, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  Action,
  TableComponent,
} from '../../../../../app/core/components/table';
import { rxResource } from '@angular/core/rxjs-interop';
import { EmpleadoService } from '../../service/empleado.service';
import { EMPTY } from 'rxjs';
import { ToastService } from '@services/toast.service';
import { IPaginationParams } from '@interfaces/IpaginatedResponse';

@Component({
  selector: 'app-employee',
  imports: [CommonModule, RouterModule, TableComponent],
  template: `
    <ng-template #toggleTpl let-row>
      <a (click)="editar(row)" class="text-green-600 hover:text-green-900 text-sm cursor-pointer">
        <i class="fas fa-edit"></i>
      </a>
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
    { field: 'personaNombreCompleto', header: 'Nombre Completo', type: 'text' as const },
    { field: 'numeroCedula', header: 'Cédula', type: 'text' as const },
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

  // Signal para parámetros de paginación
  readonly paginationParams = signal<IPaginationParams>({
    page: 0,
    size: 5,
  });

  // Resource para datos paginados del servidor
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
      );
    },
  });

  // Computed para el nombre del archivo de exportación
  readonly exportFileName = computed(
    () => `empleados_${new Date().toISOString().split('T')[0]}`
  );

  onPaginationChange(params: IPaginationParams): void {
    this.paginationParams.set(params);
  }


  onToggle(row: any): void {
    const estadoAnterior = row.estado;
    const nuevoEstado = !row.estado;


    row.estado = nuevoEstado;

    this.empleadoService.updateEstadoEmpleado({
      id_persona: row.personaId,
      activo: nuevoEstado,
      usuario_cambio: localStorage.getItem('nameUser') || 'admin'
    }).subscribe({
      next: () => {
        this.toastService.success('Éxito', 'Estado actualizado correctamente');
        // Opcional: recargar datos para mantener consistencia
        // this.serverEmployeeData.reload?.();
      },
      error: (err) => {
 
        row.estado = estadoAnterior;
        console.error('Error al cambiar estado del empleado:', err.message);
        this.toastService.error('Error', 'Ocurrió un error al actualizar el estado');
      }
    });
  }


  editar(row: any): void {
    this.router.navigate(['shell/employee/update-employee', row.id]);
  }


  handleTableAction(event: Action): void {
    console.log('Action received:', event);
    if (event.action === 'add') {
      this.router.navigate(['create-employee'], {
        relativeTo: this.route
      });
    }
  }
}
