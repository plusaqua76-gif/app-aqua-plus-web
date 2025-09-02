import { CommonModule } from '@angular/common';
import { Component, inject, signal, computed, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  Action,
  TableComponent,
} from '../../../../../app/core/components/table';
import { rxResource } from '@angular/core/rxjs-interop';
import { EmpleadoService } from '../../service/empleado.service';
import { map } from 'rxjs';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-employee',
  imports: [CommonModule, RouterModule],
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

    <!-- <app-table-dynamic
      [title]="title"
      [columns]="employeeColumns()"
      [datasource]="employeeData()"
      [actionTemplate]="toggleTpl"
      [columnTemplates]="{ estado: estadoTpl }"
      [showAddButton]="true"
      [addButtonText]="'Agregar Empleado'"
      (action)="handleTableAction($event)"
    /> -->
  `,
})
export class Employee {

  title = 'Gestion de empleados';
  employeeColumns = signal([
    { field: 'personaNombreCompleto', header: 'Nombre Completo' },
    { field: 'numeroCedula', header: 'Cédula' },
    { field: 'codigo', header: 'Código' },
    { field: 'telefono', header: 'Teléfono' },
    { field: 'correoElectronico', header: 'Correo Electrónico' },
    { field: 'estado', header: 'Estado', template: 'estadoTpl' },
  ]);

  // employeeData = computed(() => this.dataEmployeeCounter.value() ?? []);



  protected readonly empleadoService = inject(EmpleadoService);
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
  protected readonly toastService = inject(ToastService);



  // dataEmployeeCounter = rxResource({
  //   stream: () => this.empleadoService.getAllDatosEmpleadoCompleto().pipe(
  //     map(data => {
  //       console.log('📦 Datos recibidos del servicio:', data);
  //       return (data?.empleados?.response ?? []).map(emp => {
  //         const correo = data?.correos?.response?.find(c => c?.persona?.id === emp.personaId)?.correo ?? '';
  //         const telefono = data?.telefonos?.response?.find(t => t?.persona?.id === emp.personaId)?.numero ?? '';
  //         return {
  //           id: emp.id,
  //           personaId: emp.personaId,
  //           personaNombreCompleto: emp.personaNombreCompleto,
  //           numeroCedula: emp.numeroCedula,
  //           codigo: emp.codigo,
  //           correoElectronico: correo,
  //           telefono: telefono,
  //           estado: emp.activo ?? true,
  //         };
  //       });
  //     })
  //   ),
  // });


  onToggle(row: any) {
  const nuevoEstado = !row.estado;

  this.empleadoService.updateEstadoEmpleado({
    id_persona: row.personaId,
    activo: nuevoEstado,
    usuario_cambio: localStorage.getItem('nameUser') || 'admin'
  }).subscribe({
    next: (response) => {
      row.estado = nuevoEstado;
      this.toastService.success('Éxito', 'Estado actualizado correctamente');
    },
    error: (err) => {
      console.error('Error al cambiar estado del empleado:', err.message);
      row.estado = !nuevoEstado;
      this.toastService.error('Error', 'Ocurrió un error al actualizar el estado');
    }
  });
}

  editar(row: any) {
    this.router.navigate(['/employee/update-employee/', row.id], { relativeTo: this.route });
  }

  handleTableAction(event: Action) {
    console.log('Action received:', event);
    if (event.action === 'add') {
      this.router.navigate(['/employee/create-employee'], { relativeTo: this.route });
    }
  }
}

