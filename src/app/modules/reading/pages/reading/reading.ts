import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, signal, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReadingService } from '../../service/reading.service';
import { TableComponent } from '@components/table';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY } from 'rxjs';
import { ToastService } from '@services/toast.service';
import { IPaginationParams } from '@interfaces/IpaginatedResponse';

@Component({
  selector: 'app-reading',
  imports: [CommonModule, TableComponent, RouterModule],
  template: `
    <ng-template #toggleTpl let-row>
      <a (click)="edit(row)" class="text-green-600 hover:text-green-900 text-sm cursor-pointer">
        <i class="fas fa-edit"></i>
      </a>
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
    </ng-template>    <app-table-dynamic
      [title]="title()"
      [columns]="readingColumns()"
      [serverMode]="true"
      [serverData]="serverReadingData.value() ?? null"
      [loading]="serverReadingData.isLoading()"
      [actionTemplate]="toggleTpl"
      [columnTemplates]="{
        'contador.serial': contadorTpl,
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

  // Resource para datos paginados del servidor
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
      const date = new Date(dateString);
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

  handleTableAction(event: { action: string; row?: any }): void {
    if (event.action === 'add') {
      this.router.navigate(['create-reading'], {
        relativeTo: this.route,
      });
    } else if (event.action === 'edit' && event.row) {
      this.edit(event.row);
    }
  }

  edit(row: any): void {
    this.router.navigate(['update-reading', row.id], {
      relativeTo: this.route,
    });
  }
}
