import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TableComponent } from '@components/table';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY } from 'rxjs';
import { ToastService } from '@services/toast.service';
import { CounterService } from '../../service/counter.service';

@Component({
  selector: 'app-counter',
  imports: [CommonModule, RouterModule, TableComponent],
  template: `

      <ng-template #toggleTpl let-row>
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
      />
  `,
})
export class Counter {

  title = signal('Gestión de Contadores');
  showDeleteConfirm = signal(false);
  itemToDelete: number | null = null;
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  protected readonly counterService = inject(CounterService);
  protected readonly toastService = inject(ToastService);
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);

  counterColumns = signal([
    { field: 'serial', header: 'Serial' },
    { field: 'tipoContador', header: 'Tipo Contador' },
    { field: 'direccion', header: 'Direccion' },
  ]);

  readonly enterpriseId = computed(() => {
    if (!this.isBrowser) return null;
    try {
      return Number(JSON.parse(sessionStorage.getItem('userData')!)?.empresaId) || null;
    } catch (e) {
      console.error('Error parsing userData from sessionStorage:', e);
      return null;
    }
  });

    constructor() {
    effect(() => {
    console.log('info counterData ______>z<>', this.counterData())
    });
  }


  dataEmployee = rxResource({
    params: () => ({ enterpriseId: this.enterpriseId() }),
    stream: ({ params: { enterpriseId } }) =>
      enterpriseId
        ? this.counterService.getAllCounterByIdEnterprise(enterpriseId)
        : EMPTY
  });

  counterData = computed(() => this.dataEmployee.value() ?? []);

  edit(row: any) {
    this.router.navigate(['/counter/actualizar-contador', row.id], {
      relativeTo: this.route,
    });
    console.log('Editar contador con ID:', row.id);
  }
}
