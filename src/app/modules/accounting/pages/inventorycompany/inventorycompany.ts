import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import {RouterModule, Router, ActivatedRoute } from '@angular/router';
import {  TableComponent } from '@components/table';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../service/inventario.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { IPaginationParams } from '@interfaces/IpaginatedResponse';
import { EMPTY, catchError, of } from 'rxjs';

@Component({
  selector: 'app-inventory-company',
  imports: [CommonModule, RouterModule, TableComponent, FormsModule],
  template: `
    <ng-template #actionsTemplate let-row>
      <div class="flex items-center space-x-2">
        <button
          type="button"
          (click)="handleTableAction({ action: 'edit', row })"
          class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-blue-600/50 text-blue-400 hover:bg-blue-600/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors duration-200 cursor-pointer"
          title="Editar inventario"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          type="button"
          (click)="handleTableAction({ action: 'view', row })"
          class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-green-600/50 text-green-500 hover:bg-green-600/10 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-colors duration-200 cursor-pointer"
          title="Ver detalles"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </div>
    </ng-template>

    <app-table-dynamic
      [title]="title()"
      [columns]="inventoryColumns()"
      [serverMode]="true"
      [serverData]="serverInventoryData.value() ?? null"
      [loading]="serverInventoryData.isLoading()"
      [actionTemplate]="actionsTemplate"
      [showAddButton]="true"
      [addButtonText]="'Agregar Inventario'"
      [showExportButton]="true"
      [exportFileName]="exportFileName()"
      [showColumnFilters]="true"
      (action)="handleTableAction($event)"
      (serverPaginationChange)="onPaginationChange($event)"
    >
    </app-table-dynamic>
  `
})
export class InventoryCompany {

  readonly InventarioService = inject(InventarioService)
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);

  title = signal('Gestión de Inventario');

  inventoryColumns = signal([
    { field: 'codigo', header: 'Código', type: 'text' as const },
    { field: 'nombre', header: 'Nombre', type: 'text' as const },
    { field: 'descripcion', header: 'Descripción', type: 'text' as const },
    { field: 'cantidad', header: 'Cantidad', type: 'text' as const },
    { field: 'precioUnitario', header: 'Precio Unitario', type: 'text' as const },
    { field: 'precioVenta', header: 'Precio Venta', type: 'text' as const },
    { field: 'porcentaje', header: 'Porcentaje', type: 'text' as const },
    { field: 'fechaCreacion', header: 'Fecha Creación', type: 'date' as const },
    { field: 'activo', header: 'Estado', type: 'text' as const },
  ]);

  readonly enterpriseId = computed(() => {
    if (!this.isBrowser) return null;

    try {
      const userData = sessionStorage.getItem('userData');
      if (!userData) return null;

      const parsedUserData = JSON.parse(userData);
      return parsedUserData.empresaId ? Number(parsedUserData.empresaId) : null;
    } catch {
      return null;
    }
  });


  constructor() {
    effect(() => {
      console.log('this is data of the serverInventoryData:', this.serverInventoryData.value());
    })
  }

  readonly exportFileName = computed(
    () => `inventario_${new Date().toISOString().split('T')[0]}`
  );

  readonly paginationParams = signal<IPaginationParams>({
    page: 0,
    size: 5,
  });

  serverInventoryData = rxResource({
    params: () => ({
      enterpriseId: this.enterpriseId(),
      pagination: this.paginationParams(),
    }),
    stream: ({ params }) => {
      const { enterpriseId, pagination } = params;
      if (!enterpriseId) {
        return EMPTY;
      }
      return this.InventarioService.getInventoryCompanyPaginated(
        enterpriseId,
        pagination
      ).pipe(
        catchError((error) => {
          return of(null); 
        })
      );
    },
  });

  handleTableAction(event: { action: string; row?: any }): void {
    if (event.action === 'add') {
      this.router.navigate(['create'], {
        relativeTo: this.route,
      });
    } else if (event.action === 'edit' && event.row) {
      this.router.navigate(['edit', event.row.id], {
        relativeTo: this.route,
      });
    } else if (event.action === 'view' && event.row) {
      this.router.navigate(['detail', event.row.id], {
        relativeTo: this.route,
      });
    }
  }

  onPaginationChange(params: IPaginationParams): void {
    this.paginationParams.set(params);
  }


}
