import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, signal, PLATFORM_ID, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReadingService } from '../../service/reading.service';
import { TableComponent } from '@components/table';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, of, map, firstValueFrom } from 'rxjs';
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
      {{ row.contador?.serial || '' }}
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
      [externalFilters]="columnFilters()"
      [externalFiltersVisible]="filtersVisible()"
      [exportData]="exportDataForTable()"
      [isLoadingExportData]="isLoadingExportData()"
      (action)="handleTableAction($event)"
      (serverPaginationChange)="onPaginationChange($event)"
      (filtersChange)="onFiltersChange($event)"
      (filtersVisibilityChange)="onFiltersVisibilityChange($event)"
      (exportAllDataRequest)="handleExportRequest($event)"
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

  // Signals para exportación completa
  exportDataForTable = signal<any[] | null>(null);
  isLoadingExportData = signal(false);
  columnFilters = signal<Record<string, string>>({});
  filtersVisible = signal(false);

  readonly enterpriseId = computed(() => {
    if (!this.isBrowser) return null;

    try {
      const userData = sessionStorage.getItem('userData');
      if (!userData) return null;

      const parsedUserData = JSON.parse(userData);
      return parsedUserData.empresaId ? Number(parsedUserData.empresaId) : null;
    } catch (error) {
      return null;
    }
  });

  readingColumns = signal([
    { field: 'contador.serial', header: 'Contador', type: 'text' as const, template: 'contadorTpl' },
    { field: 'nombreCompleto', header: 'Nombre', type: 'text' as const, template: 'nombreCompletoTpl' },
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
    // Effect para limpiar datos de exportación después de usarlos
    effect(() => {
      const data = this.exportDataForTable();
      const isLoading = this.isLoadingExportData();
      if (data && data.length > 0 && !isLoading) {
        setTimeout(() => {
          this.exportDataForTable.set(null);
        }, 2000);
      }
    });
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
              map(response => {
                if (response?.response && Array.isArray(response.response)) {
                  response.response = response.response.map((lectura: any) => {
                    const cliente = lectura.contador?.cliente;
                    const nombreCompleto = cliente ? [
                      cliente.nombre,
                      cliente.segundoNombre,
                      cliente.apellido,
                      cliente.segundoApellido
                    ].filter(Boolean).join(' ').trim() : '';
                    const serialContador = lectura.contador?.serial || '';

                    return {
                      ...lectura,
                      nombreCompleto,
                      serialContador
                    };
                  });
                }
                return response;
              }),
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
   * Handler para cambios de filtros
   */
  onFiltersChange(filters: Record<string, string>): void {
    this.columnFilters.set(filters);
  }

  /**
   * Handler para cambios de visibilidad de filtros
   */
  onFiltersVisibilityChange(visible: boolean): void {
    this.filtersVisible.set(visible);
  }

  /**
   * Handler para solicitud de exportación de todos los datos
   */
  async handleExportRequest(event: { totalCount: number; currentParams: IPaginationParams }): Promise<void> {
    const enterpriseId = this.enterpriseId();
    if (!enterpriseId) {
      this.toastService.error('Error', 'No se pudo obtener el ID de la empresa');
      return;
    }

    this.isLoadingExportData.set(true);
    this.toastService.info('Preparando exportación', `Cargando ${event.totalCount} registros...`);

    try {
      const exportParams: IPaginationParams = {
        ...event.currentParams,
        page: 0,
        size: event.totalCount
      };

      const response = await firstValueFrom(
        this.readingService.getReadingsPaginated(
          enterpriseId,
          exportParams
        ).pipe(
          map(response => {
            if (response?.response && Array.isArray(response.response)) {
              response.response = response.response.map((lectura: any) => {
                const cliente = lectura.contador?.cliente;
                const nombreCompleto = cliente ? [
                  cliente.nombre,
                  cliente.segundoNombre,
                  cliente.apellido,
                  cliente.segundoApellido
                ].filter(Boolean).join(' ').trim() : '';
                const serialContador = lectura.contador?.serial || '';

                return {
                  ...lectura,
                  nombreCompleto,
                  serialContador
                };
              });
            }
            return response;
          })
        )
      );

      if (response?.response && Array.isArray(response.response)) {
        this.exportDataForTable.set(response.response);
        this.toastService.success('Datos cargados', `${response.response.length} registros listos para exportar`);
      } else {
        throw new Error('No se recibieron datos del servidor');
      }
    } catch (error) {
      console.error('Error al cargar datos para exportación:', error);
      this.toastService.error('Error', 'No se pudieron cargar los datos para exportar');
      this.exportDataForTable.set(null);
    } finally {
      this.isLoadingExportData.set(false);
    }
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
    if (!cliente) return '';

    const partes = [
      cliente.nombre,
      cliente.segundoNombre,
      cliente.apellido,
      cliente.segundoApellido
    ].filter(parte => parte && parte.trim() !== ''); // Filtrar valores vacíos o null

    return partes.join(' ') || '';
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
