import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, of } from 'rxjs';
import { ReadingService } from '../../service/reading.service';
import { TableComponent } from '@components/table';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-history-reading',
  imports: [CommonModule, TableComponent, RouterModule],
  template: `
    <div class="container mx-auto p-6">
      <ng-template #fechaTpl let-row>
        {{ formatDate(row.fechaLectura) }}
      </ng-template>

      <ng-template #fechaCompletaTpl let-row>
        {{ formatDateComplete(row.fechaLectura) }}
      </ng-template>

      <ng-template #fechaSoloTpl let-row>
        {{ formatDateOnly(row.fechaLectura) }}
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

      <!-- Template vacío para acciones -->
      <ng-template #emptyActionsTpl> </ng-template>

      <app-table-dynamic
        [title]="'Historial de Cambios'"
        [columns]="historyColumns()"
        [serverMode]="false"
        [datasource]="transformedHistoryData() || []"
        [loading]="dataHistoryReading.isLoading()"
        [columnTemplates]="{
          fechaLectura: fechaTpl,
          consumoAnormal: consumoAnormalTpl
        }"
        [actionTemplate]="emptyActionsTpl"
        [showExportButton]="true"
        [exportFileName]="exportFileName()"
        [showAddButton]="false"
        [showColumnFilters]="true"
      />

      <div
        *ngIf="dataHistoryReading.error()"
        class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <svg
              class="h-5 w-5 text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              Error al cargar el historial
            </h3>
            <div class="mt-2 text-sm text-red-700">
              <p>
                No se pudo cargar el historial de la lectura. Por favor,
                inténtelo de nuevo.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        *ngIf="
          !dataHistoryReading.isLoading() &&
          !dataHistoryReading.error() &&
          (!dataHistoryReading.value()?.response ||
            dataHistoryReading.value()?.response?.length === 0)
        "
        class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <svg
              class="h-5 w-5 text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-800">
              Sin historial disponible
            </h3>
            <div class="mt-2 text-sm text-blue-700">
              <p>No hay cambios registrados para esta lectura.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class HistoryReading {
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly readingService = inject(ReadingService);
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  readonly toastService = inject(ToastService);

  readonly readingId = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? Number(id) : null;
  });

  historyColumns = signal([
    {
      field: 'fechaLectura',
      header: 'Fecha Lectura',
      type: 'date' as const,
      template: 'fechaTpl',
    },
    { field: 'consumo', header: 'Consumo (m³)', type: 'number' as const },
    {
      field: 'consumoAnormal',
      header: 'Consumo Anormal',
      type: 'text' as const,
      template: 'consumoAnormalTpl',
    },
    { field: 'descripcion', header: 'Descripción', type: 'text' as const },
    {
      field: 'usuarioModificacion',
      header: 'Usuario Modificación',
      type: 'text' as const,
    },
  ]);

  readonly transformedHistoryData = computed(() => {
    const response = this.dataHistoryReading.value();
    if (!response?.response) return [];
    return response.response;
  });

  readonly exportFileName = computed(
    () =>
      `historial_lectura_${this.readingId()}_${
        new Date().toISOString().split('T')[0]
      }`
  );

  dataHistoryReading = rxResource({
    stream: () => {
      const readingId = this.readingId();
      if (!readingId) {
        return of({
          success: true,
          message: '',
          code: 200,
          totalCount: 0,
          response: [],
        });
      }
      return this.readingService.getHistoryReading(readingId).pipe(
        catchError((error) => {
          return of({
            success: false,
            message: 'Error',
            code: 500,
            totalCount: 0,
            response: [],
          });
        })
      );
    },
  });

  formatDate(dateString: string): string {
    if (!dateString) return '';

    try {
      const datePart = dateString.split('T')[0];
      const [year, month, day] = datePart.split('-');
      const date = new Date(
        Number.parseInt(year),
        Number.parseInt(month) - 1,
        Number.parseInt(day)
      );

      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return dateString;
    }
  }

  formatDateComplete(dateString: string): string {
    if (!dateString) return '';
    try {
      const datePart = dateString.split('T')[0];
      const [year, month, day] = datePart.split('-');

      const date = new Date(
        Number.parseInt(year),
        Number.parseInt(month) - 1,
        Number.parseInt(day)
      );

      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return dateString;
    }
  }

  formatDateOnly(dateString: string): string {
    if (!dateString) return '';
    try {
      // Extraer la parte de la fecha sin la zona horaria para evitar problemas de UTC
      const datePart = dateString.split('T')[0];
      const [year, month, day] = datePart.split('-');

      // Crear la fecha usando los componentes individuales para evitar problemas de zona horaria
      const date = new Date(
        Number.parseInt(year),
        Number.parseInt(month) - 1,
        Number.parseInt(day)
      );

      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  }
}
