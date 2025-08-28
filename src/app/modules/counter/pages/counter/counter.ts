import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EnterpriseClientCounterService } from '../../../client/service/enterpriseClientCounter.service';
import { TableComponent } from '@components/table';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-counter',
  imports: [CommonModule, RouterModule],
  template: `

      <!-- <ng-template #toggleTpl let-row>
        <a
          (click)="edit(row)"
          class="text-green-600 hover:text-green-900 text-sm cursor-pointer"
        >
          <i class="fas fa-edit"></i>
        </a>
      </ng-template>

      <app-table-dynamic
        [title]="title()"
        [datasource]="counterData()"
        [columns]="counterColumns()"
        [actionTemplate]="toggleTpl"
      /> -->
  `,
})
export class Counter {
  // enterpriseId = signal<number | undefined>(
  //   Number(localStorage.getItem('enterpriseId')) || undefined
  // );
  // idDef: string | null = localStorage.getItem('enterpriseId');

  // counterColumns = signal([
  //   { field: 'serial', header: 'Serial' },
  //   { field: 'tipoContador', header: 'Tipo Contador' },
  //   { field: 'direccion', header: 'Direccion' },
  //   { field: 'cliente', header: 'Cliente' },
  //   { field: 'cedula', header: 'Cedula' },
  // ]);
  // counterData = computed(() => this.dataEnterpriseClientCounter.value() ?? []);
  // title = signal('Gestión de Contadores');

  // private readonly enterpriseClientCounterService = inject(
  //   EnterpriseClientCounterService
  // );
  // private readonly router = inject(Router);
  // protected readonly route = inject(ActivatedRoute);

  // constructor() {
  //   const enterpriseId = localStorage.getItem('enterpriseId');
  //   console.log('ID de la empresa:', enterpriseId);

  //   effect(() => {
  //     console.log(
  //       'Data loaded______:',
  //       this.dataEnterpriseClientCounter.value()
  //     );
  //   });
  // }

  // dataEnterpriseClientCounter = rxResource({
  //   stream: () => {
  //     const id = this.enterpriseId();
  //     if (!id) {
  //       throw new Error('Enterprise ID is required');
  //     }
  //     return this.enterpriseClientCounterService
  //       .getAllCounterByIdEnterprise(id)
  //       .pipe(
  //         map((data) =>
  //           data.response.map((item) => ({
  //             id: item.id,
  //             serial: item.contador.serial,
  //             tipoContador: item.contador.tipoContador.nombre,
  //             cliente: [
  //               item.contador.cliente?.nombre || '',
  //               item.contador.cliente?.segundoNombre || '',
  //               item.contador.cliente?.apellido || '',
  //               item.contador.cliente?.segundoApellido || '',
  //             ]
  //               .filter((name) => name.trim() !== '')
  //               .join(' '),
  //             cedula: item.contador.cliente.numeroCedula,
  //             direccion: item.contador.descripcion.descripcion,
  //           }))
  //         )
  //       );
  //   },
  // });

  // edit(row: any) {
  //   this.router.navigate(['/counter/actualizar-contador', row.id], {
  //     relativeTo: this.route,
  //   });
  //   console.log('Editar contador con ID:', row.id);
  // }
}
