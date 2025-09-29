import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Action, TableComponent } from '@components/table';
import { PopupComponent } from '@shared/components/popUp';
import { ToastService } from '@services/toast.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { EmpresaService } from '../../service/empresa.service';
import { IEnterpriseResponse } from '@interfaces/Ienterprise';

@Component({
  selector: 'app-enterprise',
  imports: [CommonModule, RouterModule, TableComponent],
  template: `
  <ng-template #actionsTemplate let-row>
    <div class="flex items-center space-x-4">
      <button (click)="editar(row)"
        class="text-green-600 hover:text-green-900 text-sm cursor-pointer">
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
    [columns]="empresaColumns()"
    [datasource]="empresaData()"
    [actionTemplate]="actionsTemplate"
    [columnTemplates]="{ estado: estadoTpl }"
    (action)="onTableAction($event)">
  </app-table-dynamic>



`
  ,
})
export class Enterprise {
  showDeleteConfirm = signal(false);
  itemToDelete: number | null = null;

  empresaColumns = signal([
    { field: 'nombre', header: 'Nombre empresa' },
    { field: 'nit', header: 'Nit empresa' },
    { field: 'codigo', header: 'Codigo empresa' },
    { field: 'descripcionDireccion', header: 'Direccion' },
    { field: 'ciudad', header: 'Ciudad' },
    { field: 'departamento', header: 'Departamento' },
    { field: 'estado', header: 'Estado', template: 'estadoTpl' },
  ]);

  empresaData = computed(() => this.dataEmpresaCounter.value() ?? []);
  title = 'Gestion de empresas';

  protected readonly empresaService = inject(EmpresaService);
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
  protected readonly toastService = inject(ToastService);

  dataEmpresaCounter = rxResource({
  stream: () =>
    this.empresaService.getAllEmpresa().pipe(
      map((data: { response: IEnterpriseResponse[] }) => {
        return data.response.map((empresaItem) => ({
          id_empresa: empresaItem.id,
          nombre: empresaItem.nombre,
          nit: empresaItem.nit,
          codigo: empresaItem.codigo,
          estado: empresaItem.activo,
          departamento: empresaItem.departamento,
          ciudad: empresaItem.ciudad,
          corregimiento: empresaItem.corregimiento,
          descripcionDireccion: empresaItem.descripcionDireccion,
        }));
      })
    )
});

  onToggle(row: any) {
  const nuevoEstado = !row.estado;

  this.empresaService.updateEstado({
    id_empresa: row.id_empresa,
    activo: nuevoEstado,
    usuario_cambio: localStorage.getItem('nameUser') || 'admin'
  }).subscribe({
    next: (response) => {
      row.estado = nuevoEstado;
      this.toastService.success('Éxito', 'Estado actualizado correctamente');
    },
    error: (err) => {
      console.error('Error al cambiar estado de la empresa:', err.message);
      row.estado = !nuevoEstado;
      this.toastService.error('Error', 'Ocurrió un error al actualizar el estado');
    }
  });
}


  onDelete(id: number): void {
    this.itemToDelete = id;
    this.showDeleteConfirm.set(true);
  }

  editar(row: any) {
    const id = row?.id_empresa;
    if (id) {
      this.router.navigate(['/enterprise/update-enterprise/', id], { relativeTo: this.route });
    } else {
      this.toastService.error('Error', 'ID de la empresa no válido.');
    }
  }



  onTableAction(event: Action) {
    if (event.action === 'add') {
      this.router.navigate(['create-enterprise'], { relativeTo: this.route });
    } else if (event.action === 'edit' && event.row) {
      this.editar(event.row);
    }
  }
}
