import { Action } from './../../../../core/components/table';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TableComponent } from '@components/table';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY } from 'rxjs';
import { ToastService } from '@services/toast.service';
import { CounterService } from '../../service/counter.service';
import { IPaginationParams } from '@interfaces/IpaginatedResponse';

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
        [columns]="counterColumns()"
        [serverMode]="true"
        [serverData]="serverCounterData.value() ?? null"
        [loading]="serverCounterData.isLoading()"
        [actionTemplate]="toggleTpl"
        [showAddButton]="true"
        [addButtonText]="'Agregar Contador'"
        [showExportButton]="true"
        [exportFileName]="exportFileName()"
        [showColumnFilters]="true"
        (action)="onTableAction($event)"
        (serverPaginationChange)="onPaginationChange($event)"
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
    { field: 'serial', header: 'Serial', type: 'text' as const },
    { field: 'tipoContadorNombre', header: 'Tipo Contador', type: 'text' as const },
    { field: 'direccionDescripcion', header: 'Dirección', type: 'text' as const },
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

  // Signal para parámetros de paginación
  readonly paginationParams = signal<IPaginationParams>({
    page: 0,
    size: 5,
  });

  // Resource para datos paginados del servidor
  serverCounterData = rxResource({
    params: () => ({
      enterpriseId: this.enterpriseId(),
      pagination: this.paginationParams(),
    }),
    stream: ({ params }) => {
      const { enterpriseId, pagination } = params;
      if (!enterpriseId) {
        return EMPTY;
      }
      return this.counterService.getAllCounterByIdEnterprisePaginated(
        enterpriseId,
        pagination
      );
    },
  });

  // Computed para el nombre del archivo de exportación
  readonly exportFileName = computed(
    () => `contadores_${new Date().toISOString().split('T')[0]}`
  );

  constructor() {
    effect(() => {
      console.log('info counterData ______>', this.serverCounterData.value())
    });
  }

  onPaginationChange(params: IPaginationParams): void {
    this.paginationParams.set(params);
  }

  edit(row: any) {
    this.router.navigate(['actualizar-contador', row.id], {
      relativeTo: this.route,
    });
  }

  onTableAction(event: Action) {
    if (event.action === 'add') {
      this.router.navigate(['create-counter'], { relativeTo: this.route });
    }
  }
}
