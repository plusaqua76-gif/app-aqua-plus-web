import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, signal, PLATFORM_ID, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReadingService } from '../../service/reading.service';
import { TableComponent } from '@components/table';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, of } from 'rxjs';
import { ToastService } from '@services/toast.service';
import { IPaginationParams } from '@interfaces/IpaginatedResponse';

@Component({
  selector: 'app-reading',
  imports: [CommonModule, TableComponent, RouterModule],
  template: `
    <ng-template #actionsTemplate let-row>
      <div class="flex items-center space-x-2">
        <button
          type="button"
          (click)="handleTableAction({ action: 'history', row })"
          class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-purple-600/50 text-purple-500 hover:bg-purple-600/10 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-colors duration-200 cursor-pointer"
          title="Ver historial de lectura"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </ng-template>

    <ng-template #contadorTpl let-row>
      {{ row.contador?.serial || 'N/A' }}
    </ng-template>

    <ng-template #consumoAnormalTpl let-row>
      <span
        class="px-2 py-1 rounded-full text-xs"
        [ngClass]="{
          'bg-red-100 text-red-800': row.consumoAnormal === true,
          'bg-green-100 text-green-800': row.consumoAnormal === false
        }"
      >
        {{ row.consumoAnormal ? 'Sí' : 'No' }}
      </span>
    </ng-template>

    <ng-template #fechaTpl let-row>
      {{ formatDate(row.fechaLectura) }}
    </ng-template>

    <ng-template #nombreCompletoTpl let-row>
      {{ getFullName(row.contador?.cliente) }}
    </ng-template>

    <app-table-dynamic
      [title]="title()"
      [columns]="readingColumns()"
      [serverMode]="true"
      [serverData]="serverReadingData.value() ?? null"
      [loading]="serverReadingData.isLoading()"
      [actionTemplate]="actionsTemplate"
      [columnTemplates]="{
        'contador.serial': contadorTpl,
        'contador.cliente.nombreCompleto': nombreCompletoTpl,
        consumoAnormal: consumoAnormalTpl,
        fechaLectura: fechaTpl
      }"
      [showExportButton]="true"
      [exportFileName]="exportFileName()"
      [showColumnFilters]="true"
      (action)="handleTableAction($event)"
      (serverPaginationChange)="onPaginationChange($event)"
    />
  `
})
export class Reading {
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly readingService = inject(ReadingService);
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  readonly toastService = inject(ToastService);

  title = signal('Gestión de Lecturas');

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

  readingColumns = signal([
    { field: 'contador.serial', header: 'Contador', type: 'text' as const, template: 'contadorTpl' },
    { field: 'contador.cliente.nombreCompleto', header: 'Nombre Completo', type: 'text' as const, template: 'nombreCompletoTpl' },
    { field: 'lectura', header: 'Lectura(m³)', type: 'number' as const },
    { field: 'fechaLectura', header: 'Fecha Lectura', type: 'date' as const, template: 'fechaTpl' },
    { field: 'consumoAnormal', header: 'Consumo Anormal', type: 'text' as const, template: 'consumoAnormalTpl' },
    { field: 'descripcion', header: 'Observación', type: 'text' as const },
  ]);

  // Signal para parámetros de paginación
  readonly paginationParams = signal<IPaginationParams>({
    page: 0,
    size: 5,
  });

  constructor() {
    effect(() => {
      console.log('esta es la data mi pez', this.serverReadingData.value());
    })
  }

  serverReadingData = rxResource({
    params: () => ({
      enterpriseId: this.enterpriseId(),
      pagination: this.paginationParams(),
    }),
    stream: ({ params }) => {
      const { enterpriseId, pagination } = params;
      if (!enterpriseId) {
        return EMPTY;
      }
      return this.readingService.getReadingsPaginated(
        enterpriseId,
        pagination
      ).pipe(
              catchError((error) => {
                return of(null);
              })
            );
    },
  });

  // Computed para el nombre del archivo de exportación
  readonly exportFileName = computed(
    () => `lecturas_${new Date().toISOString().split('T')[0]}`
  );

  /**
   * Handler para cambios de paginación
   */
  onPaginationChange(params: IPaginationParams): void {
    this.paginationParams.set(params);
  }

  /**
   * Formatea una fecha ISO a formato legible
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';

    try {
      const datePart = dateString.split('T')[0];
      const [year, month, day] = datePart.split('-');
      const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day));

      // Formatear como DD/MM/YYYY
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  }

  /**
   * Concatena el nombre completo del cliente
   */
  getFullName(cliente: any): string {
    if (!cliente) return 'N/A';

    const partes = [
      cliente.nombre,
      cliente.segundoNombre,
      cliente.apellido,
      cliente.segundoApellido
    ].filter(parte => parte && parte.trim() !== ''); // Filtrar valores vacíos o null

    return partes.join(' ') || 'N/A';
  }

  handleTableAction(event: { action: string; row?: any }): void {
    if (event.action === 'add') {
      this.router.navigate(['create-reading'], {
        relativeTo: this.route,
      });
    } else if (event.action === 'history' && event.row) {
      this.viewHistory(event.row);
    }
  }

  viewHistory(row: any): void {
    this.router.navigate(['history-reading', row.id], {
      relativeTo: this.route,
    });
  }
}
