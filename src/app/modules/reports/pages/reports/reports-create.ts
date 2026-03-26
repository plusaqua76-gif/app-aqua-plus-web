import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { ResportsService } from '../../services/resports.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { TableComponent } from '@components/table';
import { of } from 'rxjs';
import { ToastService } from '@services/toast.service';
import { PopupComponent } from '@shared/components/popUp';
import { Filtro } from '@interfaces/reports/filtersReports';
import * as FilterUtils from '../../utils/report-filter.utils';

@Component({
  selector: 'app-reading',
  imports: [CommonModule, TableComponent, PopupComponent],
  templateUrl: './reports.html',
})
export class ReportsCreate {
  // Constantes de configuración
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_PAGE_SIZE = 10;
  private readonly WHATSAPP_PHONE = '573225159744';
  private readonly EXCLUDED_HEADERS = ['Estado'];
  private readonly EXCLUDED_FIELDS = ['estado'];

  private readonly resportsService = inject(ResportsService);
  private readonly toastService = inject(ToastService);
  protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);
  title = signal('Gestión de Reportes');
  selectedReportId = signal<number | null>(null);
  selectedReportName = signal<string>('');
  selectedNombreSp = signal<string>('');
  showFiltersPopup = signal(false);
  filterValues = signal<Record<string, string | number | boolean | number[]>>(
    {}
  );
  shouldGenerateAfterLoad = signal(false);
  requiredFields = signal<string[]>([]);
  listOptions = signal<Record<string, Array<{ llave: number; valor: string }>>>(
    {}
  );
  loadingLists = signal<Record<string, boolean>>({});
  openDropdowns = signal<Record<string, boolean>>({});
  private clickListener?: (event: MouseEvent) => void;

  // Signals para exportación completa de la tabla de reportes
  exportDataForReports = signal<any[] | null>(null);
  isLoadingExportDataReports = signal(false);

  billColumns = signal([
    { field: 'nombre', header: 'Nombre', type: 'text' as const },
    { field: 'descripcion', header: 'Descripción', type: 'text' as const },
  ]);

  reportData = signal<Record<string, string | number | boolean | null>[]>([]);
  reportColumns = signal<{ field: string; header: string; type: 'text' }[]>([]);
  reportTotalRecords = signal<number>(0);
  hasReportResults = computed(() => this.reportData().length > 0);

  readonly exportFileName = computed(
    () => `clientes_${new Date().toISOString().split('T')[0]}`
  );

  // Computed para clasificar filtros
  readonly uniqueFilters = computed(() => {
    const filters = this.filtersReports.value()?.response || [];
    const uniqueMap = new Map();

    // Primero agregamos todos los filtros al map, dando prioridad a los requeridos
    filters.forEach((item) => {
      if (item.filtro.campo && !item.filtro.lectura) {
        const key = item.filtro.campo;
        const existing = uniqueMap.get(key);

        // Si no existe o el actual es requerido y el existente no, lo reemplazamos
        if (
          !existing ||
          (item.filtro.requerido && !existing.filtro.requerido)
        ) {
          uniqueMap.set(key, item);
        }
      }
    });

    return Array.from(uniqueMap.values());
  });

  readonly optionalFilters = computed(() =>
    this.uniqueFilters().filter(
      (item) =>
        !item.filtro.requerido && !item.filtro.lectura && item.filtro.campo
    )
  );

  readonly requiredFilters = computed(() =>
    this.uniqueFilters().filter(
      (item) =>
        item.filtro.requerido && !item.filtro.lectura && item.filtro.campo
    )
  );

  readonly hasVisibleFilters = computed(
    () => this.optionalFilters().length > 0 || this.requiredFilters().length > 0
  );

  readonly userData = computed(() => {
    if (!this.isBrowser) return null;
    try {
      const userDataString = sessionStorage.getItem('userData');
      if (!userDataString) return null;
      return JSON.parse(userDataString);
    } catch (e) {
      return null;
    }
  });

  readonly empresaId = computed(() => {
    const data = this.userData();
    const id = data?.empresa?.id;
    return id || null;
  });

  readonly IdCiudad = computed(() => {
    const data = this.userData();
    const id = data?.empresa?.direccion?.ciudad?.id;
    return id || null;
  });

  ngOnDestroy(): void {
    // Cleanup de event listener para prevenir memory leaks
    if (this.clickListener && this.isBrowser) {
      document.removeEventListener('click', this.clickListener);
    }
  }

  constructor() {
    // Effect para limpiar datos de exportación después de usarlos
    effect(() => {
      const data = this.exportDataForReports();
      const isLoading = this.isLoadingExportDataReports();
      if (data && data.length > 0 && !isLoading) {
        setTimeout(() => {
          this.exportDataForReports.set(null);
        }, 2000);
      }
    });

    effect(() => {
      if (this.filtersReports.value()?.response && this.showFiltersPopup()) {
        this.initializeFilterValues();
      }
    });

    // Cerrar dropdowns al hacer click fuera
    if (this.isBrowser) {
      this.clickListener = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        // Si el click no es dentro de un dropdown, cerrar todos
        if (!target.closest('.multiselect-dropdown')) {
          this.openDropdowns.set({});
        }
      };
      document.addEventListener('click', this.clickListener);
    }

    // Effect para debug de filtros
    effect(() => {
      const filters = this.filtersReports.value()?.response;
      if (filters) {
        const camposCounts = new Map();
        filters.forEach((item) => {
          if (item.filtro.campo) {
            const count = camposCounts.get(item.filtro.campo) || 0;
            camposCounts.set(item.filtro.campo, count + 1);
          }
        });
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

      // Verificar si hay campos requeridos
      this.checkRequiredFieldsAndGenerate();
    }
  }

  checkRequiredFieldsAndGenerate(): void {
    // Esperar a que se carguen los filtros antes de verificar
    if (this.filtersReports.isLoading()) {
      this.shouldGenerateAfterLoad.set(true);
      return;
    }

    const hasRequiredEditableFields = this.requiredFilters().length > 0;

    if (hasRequiredEditableFields) {
      // Si hay campos requeridos, mostrar el popup de filtros
      this.showFiltersPopup.set(true);
      this.toastService.warning(
        'Campos requeridos',
        'Este reporte tiene campos obligatorios que deben ser completados antes de generar.'
      );
    } else {
      // Si no hay campos requeridos, generar directamente
      this.shouldGenerateAfterLoad.set(true);
    }
  }

  closeFiltersPopup(): void {
    this.showFiltersPopup.set(false);
    this.selectedReportId.set(null);
    this.selectedReportName.set('');
    this.selectedNombreSp.set(''); // Limpiar nombreSp
    this.filterValues.set({});
    this.requiredFields.set([]);
    // Limpiar estados de listas dinámicas
    this.listOptions.set({});
    this.loadingLists.set({});
  }

  formatFieldName(fieldName: string): string {
    return FilterUtils.formatFieldName(fieldName) || 'Campo';
  }

  private getInitialValueByType(type: string): string | number[] | null {
    return FilterUtils.getInitialValueByType(type);
  }

  private isOptionalEditableFilter(filtro: Filtro): boolean {
    return FilterUtils.isOptionalEditableFilter(filtro);
  }

  private isRequiredEditableFilter(filtro: Filtro): boolean {
    return FilterUtils.isRequiredEditableFilter(filtro);
  }

  private isReadOnlyRequiredFilter(filtro: Filtro): boolean {
    return FilterUtils.isReadOnlyRequiredFilter(filtro);
  }

  private shouldShowFilter(filtro: Filtro): boolean {
    return FilterUtils.shouldShowFilter(filtro);
  }

  initializeFilterValues(): void {
    const filters = this.filtersReports.value()?.response;
    if (!filters) return;

    const initialValues: Record<string, any> = {};
    const requiredFieldsList: string[] = [];

    for (const filterItem of filters) {
      const { campo, requerido, lectura, tipoAtributo } = filterItem.filtro;

      if ((requerido && lectura) || !campo) continue;

      if (tipoAtributo.nombre === 'DATE') {
        initialValues[campo] = '';
      } else {
        initialValues[campo] = this.getInitialValueByType(tipoAtributo.nombre);
      }

      if (this.isRequiredEditableFilter(filterItem.filtro)) {
        requiredFieldsList.push(campo);
      }

      // Cargar opciones para campos LIST o INTEGER con código
      if (
        filterItem.codigo &&
        (tipoAtributo.nombre === 'LIST' || tipoAtributo.nombre === 'INTEGER')
      ) {
        this.loadListOptions(filterItem.codigo);
      }
    }

    this.filterValues.set(initialValues);
    this.requiredFields.set(requiredFieldsList);
  }

  loadListOptions(codigo: string): void {
    if (this.listOptions()[codigo] || this.loadingLists()[codigo]) {
      return;
    }

    const empresaId = this.empresaId();
    if (!empresaId) {
      console.warn('No hay empresaId disponible para cargar opciones de lista');
      return;
    }

    this.loadingLists.update((current) => ({ ...current, [codigo]: true }));
    this.resportsService.getListOptions(codigo, empresaId).subscribe({
      next: (response) => {
        this.listOptions.update((current) => ({
          ...current,
          [codigo]: response.response || [],
        }));
        this.loadingLists.update((current) => ({
          ...current,
          [codigo]: false,
        }));
      },
      error: (error) => {
        console.error(
          'Error al cargar opciones para código',
          codigo,
          ':',
          error
        );
        this.listOptions.update((current) => ({ ...current, [codigo]: [] }));
        this.loadingLists.update((current) => ({
          ...current,
          [codigo]: false,
        }));
      },
    });
  }

  clearFilters(): void {
    this.initializeFilterValues();
  }

  updateFilterValue(campo: string, event: any): void {
    const target = event.target as HTMLInputElement;
    const currentValues = this.filterValues();
    this.filterValues.set({
      ...currentValues,
      [campo]: target.value,
    });
  }

  updateMultiSelectValue(campo: string, event: any): void {
    const target = event.target as HTMLSelectElement;
    const selectedValues = Array.from(target.selectedOptions).map((option) =>
      Number(option.value)
    );
    const currentValues = this.filterValues();
    this.filterValues.set({
      ...currentValues,
      [campo]: selectedValues,
    });
  }

  private getDefaultValueForRequiredField(
    campo: string,
    type: string
  ): string | number | boolean | number[] | null {
    switch (type) {
      case 'INTEGER':
        if (campo.toLowerCase().includes('page')) return this.DEFAULT_PAGE;
        if (campo.toLowerCase().includes('size')) return this.DEFAULT_PAGE_SIZE;
        if (campo.toLowerCase().includes('empresa'))
          return this.empresaId() || 0;
        if (campo.toLowerCase().includes('ciudad')) return this.IdCiudad() || 0;
        return 0;
      case 'TEXT':
        return '';
      case 'BOOLEAN':
        return false;
      default:
        return null;
    }
  }

  private parseFilterValue(
    value: string | number | boolean | number[]
  ): string | number | boolean | number[] | null {
    return FilterUtils.parseFilterValue(value);
  }

  validateRequiredFields(): { isValid: boolean; missingFields: string[] } {
    const values = this.filterValues();
    const requiredFields = this.requiredFields();
    const missingFields: string[] = [];

    requiredFields.forEach((field) => {
      const value = values[field];
      if (!FilterUtils.isValidRequiredValue(value)) {
        missingFields.push(this.formatFieldName(field));
      }
    });

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }

  applyFilters(): void {
    // Validar campos requeridos antes de proceder
    const validation = this.validateRequiredFields();
    if (!validation.isValid) {
      this.toastService.error(
        'Campos requeridos',
        `Por favor complete los siguientes campos obligatorios: ${validation.missingFields.join(
          ', '
        )}`
      );
      return;
    }

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

    // Agregar valores por defecto para campos requeridos de solo lectura
    if (filters) {
      filters.forEach((filterItem) => {
        if (filterItem.filtro.requerido && filterItem.filtro.lectura) {
          const { campo, tipoAtributo } = filterItem.filtro;
          requestBody[campo] = this.getDefaultValueForRequiredField(
            campo,
            tipoAtributo.nombre
          );
        }
      });
    }

    // Agregar valores de los campos editables (tanto opcionales como requeridos)
    Object.keys(values).forEach((key) => {
      const parsedValue = this.parseFilterValue(values[key]);
      if (parsedValue !== null) {
        requestBody[key] = parsedValue;
      }
    });

    // Asegurar que siempre se envíen parámetros de paginación
    // Primera llamada para obtener el total
    if (!requestBody['p_page']) {
      requestBody['p_page'] = this.DEFAULT_PAGE;
    }
    if (!requestBody['p_size']) {
      requestBody['p_size'] = this.DEFAULT_PAGE_SIZE;
    }

    // Primera llamada: obtener metadata y total de registros
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

          if (response.total && response.total > this.DEFAULT_PAGE_SIZE) {
            const fullRequestBody = { ...requestBody };
            fullRequestBody['p_size'] = response.total;
            fullRequestBody['p_page'] = 1;

            this.resportsService
              .generateReportWithFilters('reportes', nombreSp, fullRequestBody)
              .subscribe({
                next: (fullApiResponse) => {
                  let fullResponse;
                  if (Array.isArray(fullApiResponse) && fullApiResponse.length > 0) {
                    fullResponse = fullApiResponse[0];
                  } else if (fullApiResponse?.response) {
                    fullResponse = fullApiResponse.response;
                  } else {
                    fullResponse = fullApiResponse;
                  }

                  if (fullResponse?.rows && Array.isArray(fullResponse.rows)) {
                    this.processReportResponse(fullResponse);
                  }
                },
                error: (error) => {
                  console.error('Error al obtener todos los registros:', error);
                  this.processReportResponse(response);
                }
              });
          } else {
            // Si son pocos registros, usar la primera respuesta
            this.processReportResponse(response);
          }
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
    this.requiredFields.set([]);
    // Limpiar estados de listas dinámicas si es necesario
    // this.listOptions.set({});
    // this.loadingLists.set({});
  }

  clearReportResults(): void {
    this.reportData.set([]);
    this.reportColumns.set([]);
    this.reportTotalRecords.set(0);
    this.selectedReportName.set('');
    this.selectedNombreSp.set('');
    this.requiredFields.set([]);
    this.listOptions.set({});
    this.loadingLists.set({});
  }

  requestReportViaWhatsApp(): void {
    const phoneNumber = this.WHATSAPP_PHONE;
    const message = encodeURIComponent(
      '¡Hola! 👋 Me gustaría solicitar un reporte personalizado. ¿Podrían ayudarme?'
    );
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    if (this.isBrowser) {
      window.open(whatsappUrl, '_blank');
    }
  }

  // Métodos para MultiSelect con Checkboxes
  toggleDropdown(fieldName: string): void {
    this.openDropdowns.update((current) => ({
      ...current,
      [fieldName]: !current[fieldName],
    }));
  }

  isDropdownOpen(fieldName: string): boolean {
    return !!this.openDropdowns()[fieldName];
  }

  toggleOption(fieldName: string, optionValue: number): void {
    const currentValues = this.filterValues()[fieldName];

    // Type guard: asegurar que es un array
    if (!Array.isArray(currentValues)) {
      this.filterValues.update((current) => ({
        ...current,
        [fieldName]: [optionValue],
      }));
      return;
    }

    const isSelected = currentValues.includes(optionValue);

    let newValues: number[];
    if (isSelected) {
      newValues = currentValues.filter((val) => val !== optionValue);
    } else {
      newValues = [...currentValues, optionValue];
    }

    this.filterValues.update((current) => ({
      ...current,
      [fieldName]: newValues,
    }));
  }

  isOptionSelected(fieldName: string, optionValue: number): boolean {
    const currentValues = this.filterValues()[fieldName];
    if (!Array.isArray(currentValues)) return false;
    return currentValues.includes(optionValue);
  }

  getSelectedOptionsCount(fieldName: string, codigo: string): number {
    const selectedValues = this.filterValues()[fieldName] || [];
    return Array.isArray(selectedValues) ? selectedValues.length : 0;
  }

  toggleSelectAll(fieldName: string, codigo: string): void {
    const options = this.listOptions()[codigo] || [];
    const allValues = options.map((option) => option.llave);
    const currentValues = this.filterValues()[fieldName];

    // Type guard: si no es array, convertir a array vacío
    const currentArray = Array.isArray(currentValues) ? currentValues : [];
    const isAllSelected =
      allValues.length > 0 &&
      allValues.every((val) => currentArray.includes(val));

    this.filterValues.update((current) => ({
      ...current,
      [fieldName]: isAllSelected ? [] : [...allValues],
    }));
  }

  isAllSelected(fieldName: string, codigo: string): boolean {
    const options = this.listOptions()[codigo] || [];
    const allValues = options.map((option) => option.llave);
    const currentValues = this.filterValues()[fieldName];

    // Type guard: si no es array, retornar false
    if (!Array.isArray(currentValues)) return false;
    return (
      allValues.length > 0 &&
      allValues.every((val) => currentValues.includes(val))
    );
  }

  isIndeterminate(fieldName: string, codigo: string): boolean {
    const options = this.listOptions()[codigo] || [];
    const allValues = options.map((option) => option.llave);
    const currentValues = this.filterValues()[fieldName];

    // Type guard: si no es array, no puede ser indeterminado
    if (!Array.isArray(currentValues)) return false;

    const selectedCount = allValues.filter((val) =>
      currentValues.includes(val)
    ).length;
    return selectedCount > 0 && selectedCount < allValues.length;
  }

  clearSelection(fieldName: string): void {
    this.filterValues.update((current) => ({
      ...current,
      [fieldName]: [],
    }));
  }

  private processReportResponse(response: any): void {
    let columns: { field: string; header: string; type: 'text' }[] = [];
    const excludedHeaders = this.EXCLUDED_HEADERS;

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

      const excludedFields = this.EXCLUDED_FIELDS;
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
    this.reportTotalRecords.set(response.rows.length);

    this.toastService.success(
      'Éxito',
      `Reporte generado correctamente. ${response.rows.length} registros encontrados.`
    );
  }

  isYearField(campo: string): boolean {
    const campoLower = campo.toLowerCase();
    return campoLower.includes('año') || campoLower.includes('ano') || campoLower.includes('year');
  }


  isMonthField(campo: string): boolean {
    const campoLower = campo.toLowerCase();
    return campoLower.includes('mes') || campoLower.includes('month');
  }

  getYearOptions(): number[] {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let i = currentYear - 10; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years.reverse();
  }


  getMonthOptions(): Array<{ value: number; label: string }> {
    return [
      { value: 1, label: 'Enero' },
      { value: 2, label: 'Febrero' },
      { value: 3, label: 'Marzo' },
      { value: 4, label: 'Abril' },
      { value: 5, label: 'Mayo' },
      { value: 6, label: 'Junio' },
      { value: 7, label: 'Julio' },
      { value: 8, label: 'Agosto' },
      { value: 9, label: 'Septiembre' },
      { value: 10, label: 'Octubre' },
      { value: 11, label: 'Noviembre' },
      { value: 12, label: 'Diciembre' }
    ];
  }


  updateSelectValue(campo: string, event: any): void {
    const target = event.target as HTMLSelectElement;
    const currentValues = this.filterValues();
    this.filterValues.set({
      ...currentValues,
      [campo]: target.value ? Number(target.value) : '',
    });
  }
}
