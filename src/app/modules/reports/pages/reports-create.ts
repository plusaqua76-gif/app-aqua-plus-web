import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { ResportsService } from '../services/resports.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { TableComponent } from '@components/table';
import { of } from 'rxjs';
import { ToastService } from '@services/toast.service';
import { PopupComponent } from '@shared/components/popUp';

@Component({
  selector: 'app-reading',
  imports: [CommonModule, TableComponent, PopupComponent],
  template: `
    <ng-template #actionsTemplate let-row>
      <div class="flex items-center space-x-2">
                <button
          type="button"
          (click)="handleTableAction({ action: 'generate', row })"
          class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-green-600/50 text-green-400 hover:bg-green-600/10 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-colors duration-200 cursor-pointer"
          title="Generar Reporte"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </button>
        <button
          type="button"
          (click)="handleTableAction({ action: 'filter', row })"
          class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-600/50 text-gray-400 hover:bg-gray-600/10 focus:outline-none focus:ring-2 focus:ring-gray-500/40 transition-colors duration-200 cursor-pointer"
          title="Filtros"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v4.586a1 1 0 01-.758.97l-4 1A1 1 0 018 18.86V13.414a1 1 0 00-.293-.707L1.293 6.293A1 1 0 011 5.586V4z"
            />
          </svg>
        </button>
      </div>
    </ng-template>

    <!-- Template vacío para ocultar acciones -->
    <ng-template #emptyActionsTemplate let-row>
      <!-- No renderiza nada -->
    </ng-template>

    <app-table-dynamic
      [title]="title()"
      [columns]="billColumns()"
      [serverMode]="false"
      [datasource]="dataReports.value()?.response || []"
      [loading]="dataReports.isLoading()"
      [actionTemplate]="actionsTemplate"
      [showAddButton]="false"
      [showExportButton]="false"
      [showColumnFilters]="false"
      (action)="handleTableAction($event)"
    >
    </app-table-dynamic>

    <!-- Botón flotante de WhatsApp -->
    <div class="fixed bottom-6 right-6 z-[999] group">
      <!-- Tooltip -->
      <div
        class="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800/90 backdrop-blur-md border border-gray-600/50 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none"
      >
        ¿No encuentras tu reporte? Solicítalo aquí
        <div
          class="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800/90"
        ></div>
      </div>

      <!-- Botón -->
      <button
        type="button"
        (click)="requestReportViaWhatsApp()"
        class="relative w-14 h-14 rounded-full bg-white/70 dark:bg-gray-900/60 backdrop-blur-md shadow-lg hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent border border-gray-200/20 dark:border-gray-700/20"
        title="Solicitar reporte personalizado"
      >
        <!-- Pulso animado suave -->
        <div
          class="absolute inset-0 rounded-full bg-blue-400/20 animate-pulse"
        ></div>

        <!-- Logo de AquaPlus -->
        <img
          src="/images/logoAquaplus.webp"
          alt="AquaPlus"
          class="relative w-8 h-8 z-10 object-contain transition-transform duration-300 group-hover:rotate-12"
        />
      </button>
    </div>


    <!-- Tabla de Resultados del Reporte -->
    @if (hasReportResults()) {
    <div class="mt-8">
      <!-- Mensaje informativo -->
      <div
        class="mb-4 p-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/30 rounded-lg mr-8 ml-8"
      >
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0">
            <svg
              class="w-6 h-6 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-white">
              Resultados del Reporte: {{ selectedReportName() }}
            </h3>
            <p class="text-sm text-gray-300 mt-1">
              Se encontraron
              <span class="font-semibold text-blue-400">{{
                reportTotalRecords()
              }}</span>
              registros
            </p>
          </div>
          <button
            type="button"
            (click)="clearReportResults()"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600/80 hover:bg-red-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-colors"
          >
            <svg
              class="w-4 h-4 inline mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Limpiar
          </button>
        </div>
      </div>

      <!-- Tabla de resultados -->
      <div class="mb-12">
        <app-table-dynamic
          [title]="''"
          [columns]="reportColumns()"
          [serverMode]="false"
          [datasource]="reportData()"
          [loading]="false"
          [showExportButton]="true"
          [showColumnFilters]="true"
          [actionTemplate]="emptyActionsTemplate"
        >
        </app-table-dynamic>
      </div>
    </div>
    }

    <!-- Popup de Filtros -->
    <app-pop-up
      [open]="showFiltersPopup"
      title="Filtros del Reporte"
      [isConfirmation]="false"
      maxWidth="max-w-7xl"
    >
      <div class="flex flex-col" style="max-height: calc(100vh - 230px);">
        <div class="flex-1 overflow-y-auto">
          @if (filtersReports.isLoading()) {
          <div class="flex justify-center items-center py-12">
            <div
              class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"
            ></div>
            <span class="ml-3 text-gray-300 font-medium"
              >Cargando filtros...</span
            >
          </div>
          } @else if (filtersReports.value()?.response &&
          (filtersReports.value()?.response?.length ?? 0) > 0) {
          <div class="p-4">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              @for (filterItem of filtersReports.value()?.response; track
              filterItem.id) {
              <!-- Solo mostrar campos que NO sean requeridos y NO sean de solo lectura -->
            @if (!filterItem.filtro.requerido && !filterItem.filtro.lectura && filterItem.filtro.campo !== 'p_incluir_encabezado') {
              <div
                class="p-4 rounded-lg border border-gray-600/70 hover:bg-white/5 transition-colors"
              >
                <!-- Header con título -->
                <div class="mb-4">
                  <div class="flex items-start justify-between mb-2">
                    <h5 class="text-sm font-medium text-white">
                      {{ formatFieldName(filterItem.filtro.campo) }}
                    </h5>
                  </div>
                </div>

                <!-- Campo según tipo de atributo -->
                <div class="space-y-3">
                  @switch (filterItem.filtro.tipoAtributo.nombre) { @case
                  ('TEXT') {
                  <div>
                    <input
                      type="text"
                      class="w-full px-4 py-3 bg-transparent border border-gray-600/70 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40"
                      [placeholder]="
                        'Ingrese ' +
                        formatFieldName(filterItem.filtro.campo).toLowerCase()
                      "
                      [value]="filterValues()[filterItem.filtro.campo] || ''"
                      (input)="
                        updateFilterValue(filterItem.filtro.campo, $event)
                      "
                    />
                  </div>
                  } @case ('INTEGER') {
                  <div>
                    <input
                      type="number"
                      class="w-full px-4 py-3 bg-transparent border border-gray-600/70 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40"
                      [placeholder]="
                        'Ingrese ' +
                        formatFieldName(filterItem.filtro.campo).toLowerCase()
                      "
                      [value]="filterValues()[filterItem.filtro.campo] || ''"
                      (input)="
                        updateFilterValue(filterItem.filtro.campo, $event)
                      "
                      step="1"
                    />
                  </div>
                  }
                  <!-- @case ('BOOLEAN') {
                          <div>
                            <div class="space-y-3">
                              <div class="flex items-center p-3 rounded-lg border border-gray-600/70 hover:bg-white/5 transition-colors cursor-pointer">
                                <input
                                  type="radio"
                                  [name]="'filter_' + filterItem.filtro.campo"
                                  value="true"
                                  [checked]="filterValues()[filterItem.filtro.campo] === 'true'"
                                  (change)="updateFilterValue(filterItem.filtro.campo, $event)"
                                  class="w-4 h-4 text-blue-600 bg-transparent border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <span class="ml-3 text-sm font-medium text-gray-300">Sí</span>
                              </div>
                              <div class="flex items-center p-3 rounded-lg border border-gray-600/70 hover:bg-white/5 transition-colors cursor-pointer">
                                <input
                                  type="radio"
                                  [name]="'filter_' + filterItem.filtro.campo"
                                  value="false"
                                  [checked]="filterValues()[filterItem.filtro.campo] === 'false'"
                                  (change)="updateFilterValue(filterItem.filtro.campo, $event)"
                                  class="w-4 h-4 text-blue-600 bg-transparent border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <span class="ml-3 text-sm font-medium text-gray-300">No</span>
                              </div>
                            </div>
                          </div>
                        } -->
                  @default {
                  <!-- <div>
                            <input
                              type="text"
                              class="w-full px-4 py-3 bg-transparent border border-gray-600/70 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40"
                              placeholder="Valor personalizado"
                              [value]="filterValues()[filterItem.filtro.campo] || ''"
                              (input)="updateFilterValue(filterItem.filtro.campo, $event)"
                            />
                          </div> -->
                  } }
                </div>
              </div>
              } }
            </div>
          </div>
          } @else {
          <div class="text-center py-12">
            <div class="max-w-md mx-auto">
              <div class="w-20 h-20 mx-auto mb-4 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v4.586a1 1 0 01-.758.97l-4 1A1 1 0 018 18.86V13.414a1 1 0 00-.293-.707L1.293 6.293A1 1 0 011 5.586V4z"
                  />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-white mb-2">
                No hay filtros disponibles
              </h3>
              <p class="text-gray-400">
                Este reporte no tiene filtros configurados o no se pudieron
                cargar.
              </p>
            </div>
          </div>
          }
        </div>

        <!-- Botones fijos al final -->
        @if (filtersReports.value()?.response &&
        (filtersReports.value()?.response?.length ?? 0) > 0) {
        <div class="flex-shrink-0 p-4">
          <div class="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              (click)="clearFilters()"
              class="flex-1 px-6 py-3 text-sm font-medium text-gray-300 bg-transparent border border-gray-600/70 rounded-lg hover:bg-gray-600/10 focus:outline-none focus:ring-2 focus:ring-gray-500/40 transition-colors"
            >
              <svg
                class="w-4 h-4 inline mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Limpiar todo
            </button>
            <button
              type="button"
              (click)="applyFilters()"
              class="flex-1 px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-colors"
            >
              <svg
                class="w-4 h-4 inline mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Aplicar filtros
            </button>
          </div>
        </div>
        }
      </div>
    </app-pop-up>
  `,
})
export class ReportsCreate {
  private readonly resportsService = inject(ResportsService);
  private readonly toastService = inject(ToastService);
  protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);
  title = signal('Gestión de Reportes');
  selectedReportId = signal<number | null>(null);
  selectedReportName = signal<string>('');
  selectedNombreSp = signal<string>('');
  showFiltersPopup = signal(false);
  filterValues = signal<Record<string, any>>({});
  shouldGenerateAfterLoad = signal(false); // Nueva señal para controlar la generación automática

  billColumns = signal([
    { field: 'nombre', header: 'Nombre', type: 'text' as const },
    { field: 'descripcion', header: 'Descripción', type: 'text' as const },
    { field: 'nombreSp', header: 'Procedimiento', type: 'text' as const },
  ]);

  reportData = signal<any[]>([]);
  reportColumns = signal<{ field: string; header: string; type: 'text' }[]>([]);
  reportTotalRecords = signal<number>(0);
  hasReportResults = computed(() => this.reportData().length > 0);

  readonly userData = computed(() => {
    if (!this.isBrowser) return null;
    try {
      const userDataString = sessionStorage.getItem('userData');
      if (!userDataString) return null;
      return JSON.parse(userDataString);
    } catch (e) {
      console.error('Error parsing userData from sessionStorage:', e);
      return null;
    }
  });

  readonly empresaId = computed(() => {
    const data = this.userData();
    return data?.empresaId || null;
  });

  constructor() {
    effect(() => {
      if (this.filtersReports.value()?.response && this.showFiltersPopup()) {
        this.initializeFilterValues();
      }
    });

    // Effect para generar el reporte automáticamente cuando los filtros se carguen
    effect(() => {
      if (
        this.shouldGenerateAfterLoad() &&
        !this.filtersReports.isLoading() &&
        this.filtersReports.value()?.response
      ) {
        this.shouldGenerateAfterLoad.set(false);
        this.applyFilters();
      }
    });
  }

  dataReports = rxResource({
    stream: () => this.resportsService.getReports(),
  });

  filtersReports = rxResource({
    params: () => ({
      idReport: this.selectedReportId(),
    }),
    stream: ({ params }) => {
      const { idReport } = params;
      if (!idReport) {
        return of(null);
      }
      return this.resportsService.getFilteredReports(idReport);
    },
  });

  handleTableAction(event: { action: string; row?: any }): void {
    if (event.action === 'filter' && event.row) {
      this.selectedReportId.set(event.row.id);
      this.selectedReportName.set(event.row.nombre || 'Reporte');
      this.selectedNombreSp.set(event.row.nombreSp || '');
      this.showFiltersPopup.set(true);
    } else if (event.action === 'generate' && event.row) {
      this.selectedReportId.set(event.row.id);
      this.selectedReportName.set(event.row.nombre || 'Reporte');
      this.selectedNombreSp.set(event.row.nombreSp || '');
      // Marcar que se debe generar el reporte después de cargar los filtros
      this.shouldGenerateAfterLoad.set(true);
    }

  }

  closeFiltersPopup(): void {
    this.showFiltersPopup.set(false);
    this.selectedReportId.set(null);
    this.selectedReportName.set('');
    this.selectedNombreSp.set(''); // Limpiar nombreSp
    this.filterValues.set({});
  }

  formatFieldName(fieldName: string): string {
    if (!fieldName || typeof fieldName !== 'string') {
      return 'Campo';
    }

    return fieldName
      .replace(/^p_/, '') // Remover prefijo p_
      .replace(/_/g, ' ') // Reemplazar _ con espacios
      .split(' ')
      .map((word) => {
        if (!word) return '';
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .filter((word) => word.length > 0) // Filtrar palabras vacías
      .join(' ');
  }

  initializeFilterValues(): void {
    const filters = this.filtersReports.value()?.response;
    if (filters) {
      const initialValues: Record<string, any> = {};
      filters.forEach((filterItem) => {
        if (!filterItem.filtro.requerido && !filterItem.filtro.lectura) {
          const campo = filterItem.filtro.campo;
          switch (filterItem.filtro.tipoAtributo.nombre) {
            case 'TEXT':
              initialValues[campo] = '';
              break;
            case 'INTEGER':
              initialValues[campo] = null;
              break;
            case 'BOOLEAN':
              initialValues[campo] = null;
              break;
            default:
              initialValues[campo] = null;
          }
        }
      });
      this.filterValues.set(initialValues);
    }
  }

  clearFilters(): void {
    this.initializeFilterValues();
  }

  updateFilterValue(campo: string, event: any): void {
    const target = event.target as HTMLInputElement;
    const currentValues = this.filterValues();
    const value = target.value;
    this.filterValues.set({
      ...currentValues,
      [campo]: value,
    });
  }

  applyFilters(): void {
    const values = this.filterValues();
    const nombreSp = this.selectedNombreSp();
    const filters = this.filtersReports.value()?.response;

    if (!nombreSp) {
      this.toastService.error(
        'Error',
        'No se ha seleccionado un procedimiento válido'
      );
      return;
    }
    const requestBody: any = {};
    if (filters) {
      filters.forEach((filterItem) => {
        if (filterItem.filtro.requerido) {
          const campo = filterItem.filtro.campo;

          switch (filterItem.filtro.tipoAtributo.nombre) {
            case 'INTEGER':
              if (campo.toLowerCase().includes('page')) {
                requestBody[campo] = 1;
              } else if (campo.toLowerCase().includes('size')) {
                requestBody[campo] = 10;
              } else if (campo.toLowerCase().includes('empresa')) {
                const empresaId = this.empresaId();
                requestBody[campo] = empresaId || 0;
              } else {
                requestBody[campo] = 0;
              }
              break;
            case 'TEXT':
              requestBody[campo] = '';
              break;
            case 'BOOLEAN':
              requestBody[campo] = false;
              break;
            default:
              requestBody[campo] = null;
          }
        }
      });
    }

    Object.keys(values).forEach((key) => {
      const value = values[key];
      if (value !== null && value !== undefined && value !== '') {
        if (value === 'true') {
          requestBody[key] = true;
        } else if (value === 'false') {
          requestBody[key] = false;
        } else if (!isNaN(Number(value)) && value !== '') {
          requestBody[key] = Number(value);
        } else {
          requestBody[key] = value;
        }
      }
    });

    this.resportsService
      .generateReportWithFilters('reportes', nombreSp, requestBody)
      .subscribe({
        next: (apiResponse) => {
          let response;
          if (Array.isArray(apiResponse) && apiResponse.length > 0) {
            response = apiResponse[0];
          } else if (apiResponse?.response) {
            response = apiResponse.response;
          } else {
            response = apiResponse;
          }

          if (!response) {
            this.toastService.warning(
              'Advertencia',
              'No se recibió respuesta del servidor'
            );
            return;
          }

          if (!response.rows || !Array.isArray(response.rows)) {
            this.toastService.warning(
              'Advertencia',
              'El reporte no contiene datos válidos'
            );
            return;
          }
          if (response.rows.length === 0) {
            this.reportData.set([]);
            this.reportColumns.set([]);
            this.reportTotalRecords.set(0);
            this.toastService.warning(
              'Información',
              'El reporte no contiene registros con los filtros aplicados'
            );
            return;
          }
          let columns: { field: string; header: string; type: 'text' }[] = [];
          const excludedHeaders = ['Estado'];

          if (
            response.headers &&
            Array.isArray(response.headers) &&
            response.headers.length > 0
          ) {
            const firstRow = response.rows[0];
            const fieldKeys = Object.keys(firstRow);

            const filteredHeaders = response.headers.filter(
              (header: string) => !excludedHeaders.includes(header)
            );

            columns = filteredHeaders.map((header: string) => {
              const normalizedField = header
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/\s+/g, '_');

              const matchingField = fieldKeys.find(
                (field) =>
                  field.toLowerCase() === normalizedField ||
                  field.toLowerCase().includes(normalizedField) ||
                  normalizedField.includes(field.toLowerCase())
              );

              const finalField = matchingField || normalizedField;

              return {
                field: finalField,
                header: String(header),
                type: 'text' as const,
              };
            });
          } else {
            const firstRow = response.rows[0];
            const fieldKeys = Object.keys(firstRow);

            const excludedFields = ['estado'];
            const filteredFields = fieldKeys.filter(
              (key) => !excludedFields.includes(key.toLowerCase())
            );

            columns = filteredFields.map((key) => ({
              field: key,
              header: this.formatFieldName(key),
              type: 'text' as const,
            }));
          }

          this.reportColumns.set(columns);
          this.reportData.set(response.rows);
          this.reportTotalRecords.set(response.total || response.rows.length);

          this.toastService.success(
            'Éxito',
            `Reporte generado correctamente. ${response.rows.length} registros encontrados.`
          );
        },
        error: (error) => {
          this.reportData.set([]);
          this.reportColumns.set([]);
          this.reportTotalRecords.set(0);
          this.toastService.error('Error', 'Error al generar el reporte');
        },
      });

    this.showFiltersPopup.set(false);
    this.filterValues.set({});
  }

  clearReportResults(): void {
    this.reportData.set([]);
    this.reportColumns.set([]);
    this.reportTotalRecords.set(0);
    this.selectedReportName.set('');
    this.selectedNombreSp.set('');
  }

  requestReportViaWhatsApp(): void {
    const phoneNumber = '573225159744';
    const message = encodeURIComponent(
      '¡Hola! 👋 Me gustaría solicitar un reporte personalizado. ¿Podrían ayudarme?'
    );
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    if (this.isBrowser) {
      window.open(whatsappUrl, '_blank');
    }
  }
}
