import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  TemplateRef,
  signal,
  computed,
  HostListener,
} from '@angular/core';
import { IPaginatedResponse, IPaginationParams } from '../interfaces/IpaginatedResponse';
import { Datepicker } from '../../shared/components/datepicker';

export interface Action<T = any> {
  action: string;
  row?: T;
}

export interface TableColumn {
  field: string;
  header: string;
  type?: 'text' | 'date' | 'number';
}

@Component({
  selector: 'app-table-dynamic',
  standalone: true,
  imports: [NgTemplateOutlet, Datepicker],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-6 pb-0">
      <div class="mb-6">
        <h1
          class="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-200 mb-4"
        >
          {{ title() }}
        </h1>

        <div
          class="flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
        >
          <div class="flex items-center gap-4">
            <select
              class="px-7 py-3 pl-4 rounded-lg bg-gray-200 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
              [value]="currentPageSize()"
              (change)="onPageSizeChange($event)"
            >
              @for (opt of pageSizeOptions; track opt) {
                <option [value]="opt">{{ opt }}</option>
              }
            </select>

            @if (showExportButton()) {
              <div class="relative" data-export-dropdown>
                <button
                  type="button"
                  class="flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700 transition-colors duration-200"
                  (click)="toggleExportDropdown()"
                >
                  Descargar
                  <svg class="-me-0.5 ms-1.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
                  </svg>
                </button>

                @if (showExportDropdown()) {
                  <div class="absolute right-0 z-50 mt-2 w-52 divide-y divide-gray-100 rounded-lg bg-white shadow-lg dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                    <ul class="p-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      <li>
                        <button
                          class="group inline-flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white transition-colors duration-150"
                          (click)="exportAsCSV()"
                        >
                          <svg class="me-1.5 h-4 w-4 text-gray-400 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M9 2.221V7H4.221a2 2 0 0 1 .365-.5L8.5 2.586A2 2 0 0 1 9 2.22ZM11 2v5a2 2 0 0 1-2 2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2 2 2 0 0 0 2 2h12a2 2 0 0 0 2-2 2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2V4a2 2 0 0 0-2-2h-7Zm1.018 8.828a2.34 2.34 0 0 0-2.373 2.13v.008a2.32 2.32 0 0 0 2.06 2.497l.535.059a.993.993 0 0 0 .136.006.272.272 0 0 1 .263.367l-.008.02a.377.377 0 0 1-.018.044.49.49 0 0 1-.078.02 1.689 1.689 0 0 1-.297.021h-1.13a1 1 0 1 0 0 2h1.13c.417 0 .892-.05 1.324-.279.47-.248.78-.648.953-1.134a2.272 2.272 0 0 0-2.115-3.06l-.478-.052a.32.32 0 0 1-.285-.341.34.34 0 0 1 .344-.306l.94.02a1 1 0 1 0 .043-2l-.943-.02h-.003Zm7.933 1.482a1 1 0 1 0-1.902-.62l-.57 1.747-.522-1.726a1 1 0 0 0-1.914.578l1.443 4.773a1 1 0 0 0 1.908.021l1.557-4.773Zm-13.762.88a.647.647 0 0 1 .458-.19h1.018a1 1 0 1 0 0-2H6.647A2.647 2.647 0 0 0 4 13.647v1.706A2.647 2.647 0 0 0 6.647 18h1.018a1 1 0 1 0 0-2H6.647A.647.647 0 0 1 6 15.353v-1.706c0-.172.068-.336.19-.457Z" clip-rule="evenodd"/>
                          </svg>
                          <span>Export CSV</span>
                        </button>
                      </li>
                      <li>
                        <button
                          class="group inline-flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white transition-colors duration-150"
                          (click)="exportAsJSON()"
                        >
                          <svg class="me-1.5 h-4 w-4 text-gray-400 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M9 2.221V7H4.221a2 2 0 0 1 .365-.5L8.5 2.586A2 2 0 0 1 9 2.22ZM11 2v5a2 2 0 0 1-2 2H4v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-7Zm-.293 9.293a1 1 0 0 1 0 1.414L9.414 14l1.293 1.293a1 1 0 0 1-1.414 1.414l-2-2a1 1 0 0 1 0-1.414l2-2a1 1 0 0 1 1.414 0Zm2.586 1.414a1 1 0 0 1 1.414-1.414l2 2a1 1 0 0 1 0 1.414l-2 2a1 1 0 0 1-1.414-1.414L14.586 14l-1.293-1.293Z" clip-rule="evenodd"/>
                          </svg>
                          <span>Export JSON</span>
                        </button>
                      </li>
                      <li>
                        <button
                          class="group inline-flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white transition-colors duration-150"
                          (click)="exportAsTXT()"
                        >
                          <svg class="me-1.5 h-4 w-4 text-gray-400 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M9 2.221V7H4.221a2 2 0 0 1 .365-.5L8.5 2.586A2 2 0 0 1 9 2.22ZM11 2v5a2 2 0 0 1-2 2H4v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-7ZM8 16a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1Zm1-5a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H9Z" clip-rule="evenodd"/>
                          </svg>
                          <span>Export TXT</span>
                        </button>
                      </li>
                      <li>
                        <button
                          class="group inline-flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white transition-colors duration-150"
                          (click)="exportAsSQL()"
                        >
                          <svg class="me-1.5 h-4 w-4 text-gray-400 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 7.205c4.418 0 8-1.165 8-2.602C20 3.165 16.418 2 12 2S4 3.165 4 4.603c0 1.437 3.582 2.602 8 2.602ZM12 22c4.963 0 8-1.686 8-2.603v-4.404c-.052.032-.112.06-.165.09a7.75 7.75 0 0 1-.745.387c-.193.088-.394.173-.6.253-.063.024-.124.05-.189.073a18.934 18.934 0 0 1-6.3.998c-2.135.027-4.26-.31-6.3-.998-.065-.024-.126-.05-.189-.073a10.143 10.143 0 0 1-.852-.373 7.75 7.75 0 0 1-.493-.267c-.053-.03-.113-.058-.165-.09v4.404C4 20.315 7.037 22 12 22Zm7.09-13.928a9.91 9.91 0 0 1-.6.253c-.063.025-.124.05-.189.074a18.935 18.935 0 0 1-6.3.998c-2.135.027-4.26-.31-6.3-.998-.065-.024-.126-.05-.189-.074a10.163 10.163 0 0 1-.852-.372 7.816 7.816 0 0 1-.493-.268c-.055-.03-.115-.058-.167-.09V12c0 .917 3.037 2.603 8 2.603s8-1.686 8-2.603V7.596c-.052.031-.112.059-.165.09a7.816 7.816 0 0 1-.745.386Z"/>
                          </svg>
                          <span>Export SQL</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                }
              </div>
            }

            @if (showColumnFilters()) {
              <button
                type="button"
                class="flex items-center justify-center rounded-lg border px-4 py-3 text-sm font-medium transition-colors duration-200"
                [class]="buttonFilter()
                  ? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-600 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800'
                  : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-100 hover:text-blue-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'"
                (click)="toggleFilters()"
                [title]="buttonFilter() ? 'Ocultar filtros' : 'Mostrar filtros'"
              >
                @if (buttonFilter()) {
                  <!-- Icono de filtro activo -->
                  <svg class="w-5 h-5 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5.05 3C3.291 3 2.352 5.024 3.51 6.317l5.422 6.059v4.874c0 .472.227.917.613 1.2l3.069 2.25c1.01.742 2.454.036 2.454-1.2v-7.124l5.422-6.059C21.647 5.024 20.708 3 18.95 3H5.05Z"/>
                  </svg>
                  Filtros
                } @else {
                  <!-- Icono de filtro inactivo -->
                  <svg class="w-5 h-5 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M18.796 4H5.204a1 1 0 0 0-.753 1.659l5.302 6.058a1 1 0 0 1 .247.659v4.874a.5.5 0 0 0 .2.4l3 2.25a.5.5 0 0 0 .8-.4v-7.124a1 1 0 0 1 .247-.659l5.302-6.059c.566-.646.106-1.658-.753-1.658Z"/>
                  </svg>
                  Filtros
                }
              </button>
            }
          </div>

          @if (showAddButton()) {
            <button
              class="bg-blue-200 hover:bg-blue-400 text-gray-700 font-bold py-3 px-6 rounded-lg shadow-lg shadow-neutral-400 hover:text-white transform transition-all duration-500 ease-in-out hover:scale-110 hover:brightness-110 hover:animate-pulse active:animate-bounce flex items-center gap-4 whitespace-nowrap cursor-pointer"
              (click)="onAction('add', null)"
            >
              <svg
                class="w-6 h-6"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4H7Zm8-1a1 1 0 0 1 1-1h1v-1a1 1 0 1 1 2 0v1h1a1 1 0 1 1 0 2h-1v1a1 1 0 1 1-2 0v-1h-1a1 1 0 0 1-1-1Z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ addButtonText() }}
            </button>
          }
        </div>
      </div>
    </div>

    <div
      class="relative overflow-x-auto shadow-lg sm:rounded-t-lg mx-4 sm:mx-6 lg:mx-8 bg-white dark:bg-slate-800"
    >
      <table
        class="w-full text-sm text-left rtl:text-right text-gray-700 dark:text-gray-300"
      >
        <thead
          class="bg-slate-700 dark:bg-slate-900"
        >
          <tr>
            @for (column of columns(); track column) {
              <th
                scope="col"
                class="px-3 sm:px-6 py-4"
              >
                <span class="flex items-center text-sm font-semibold text-white uppercase tracking-wider">
                  {{ column.header }}
                  <svg class="w-4 h-4 ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m8 15 4 4 4-4m0-6-4-4-4 4"/>
                  </svg>
                </span>
              </th>
            }
            <th scope="col" class="px-3 sm:px-6 py-4">
              <span class="sr-only">Actions</span>
            </th>
          </tr>

          <!-- Fila de filtros separada -->
          @if (showColumnFilters() && buttonFilter()) {
            <tr class="bg-slate-600 dark:bg-slate-800">
              @for (column of columns(); track column) {
                <th scope="col" class="px-3 sm:px-6 py-3">
                  <div class="relative">
                    <!-- Icono de filtro -->
                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg class="w-4 h-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M18.796 4H5.204a1 1 0 0 0-.753 1.659l5.302 6.058a1 1 0 0 1 .247.659v4.874a.5.5 0 0 0 .2.4l3 2.25a.5.5 0 0 0 .8-.4v-7.124a1 1 0 0 1 .247-.659l5.302-6.059c.566-.646.106-1.658-.753-1.658Z"/>
                      </svg>
                    </div>

                    @if (column.type === 'date') {
                      <!-- Usar el componente app-datepicker en modo compacto -->
                      <app-datepicker
                        [value]="columnFilters()[column.field] || ''"
                        placeholder=""
                        format="yyyy-mm-dd"
                        [compact]="true"
                        (dateChange)="onColumnFilterChange(column.field, $event)"
                      />
                    } @else {
                      <!-- Input normal para otros tipos -->
                      <input
                        type="text"
                        class="w-full pl-10 pr-3 py-2 text-sm bg-slate-700 border border-slate-400 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-slate-600"
                        (keydown.enter)="onColumnFilterInput(column.field, $event)"
                        [value]="columnFilters()[column.field] || ''"
                      />
                    }
                  </div>
                </th>
              }
              <th scope="col" class="px-3 sm:px-6 py-3">
                <button
                  class="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-200"
                  (click)="clearAllFilters()"
                  title="Limpiar todos los filtros"
                >
                  <i class="fas fa-times"></i>
                </button>
              </th>
            </tr>
          }
        </thead>

        <tbody>
          @if (pagedRows().length) {
            @for (row of pagedRows(); track trackById($index, row)) {
              <tr
                class="bg-white border-b border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
              >
                @for (col of columns(); track col) {
                  <td
                    class="px-6 py-4 text-gray-900 dark:text-gray-300 font-medium"
                  >
                    @if (columnTemplates()[col.field]) {
                      <ng-container
                        [ngTemplateOutlet]="columnTemplates()[col.field]"
                        [ngTemplateOutletContext]="{ $implicit: row, row }"
                      />
                    } @else {
                      {{ row[col.field] }}
                    }
                  </td>
                }
                <td class="px-6 py-4 text-right">
                  @if (actionTemplate()) {
                    <ng-container
                      [ngTemplateOutlet]="actionTemplate()"
                      [ngTemplateOutletContext]="{ $implicit: row, row }"
                    />
                  } @else {
                    <button
                      class="font-medium text-blue-600 hover:underline dark:text-blue-400"
                      (click)="onAction('edit', row)"
                    >
                      Edit
                    </button>
                  }
                </td>
              </tr>
            }
          } @else {
            <tr>
              <td
                [attr.colspan]="columns().length + 1"
                class="text-center py-6 text-gray-500 dark:text-gray-500"
              >
                Sin registros
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <!-- Footer de paginación separado del scroll -->
    <div
      class="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-sm shadow-lg sm:rounded-b-lg mx-4 sm:mx-6 lg:mx-8"
    >
      <span class="font-medium">
        Mostrando {{ startEntry() }} en {{ endEntry() }} de
        {{ totalCount() }} registros
      </span>

      <nav class="mt-3 sm:mt-0 inline-flex items-center gap-0 bg-slate-800 dark:bg-slate-8  00 rounded-lg overflow-hidden border border-slate-600">
        <button
          class="px-3 py-2 text-white hover:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 border-r border-slate-600"
          [disabled]="currentPageIndex() === 0"
          (click)="prevPage()"
        >
          ‹
        </button>

        @for (i of createRange(totalPages()); track i) {
          <button
            class="px-3 py-2 min-w-[40px] text-center transition-colors duration-200 border-r border-slate-600 last:border-r-0"
            [class]="i === currentPageIndex()
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'text-white hover:bg-slate-700 dark:hover:bg-slate-600'"
            (click)="goToPage(i)"
          >
            {{ i + 1 }}
          </button>
        }

        <button
          class="px-3 py-2 text-white hover:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          [disabled]="currentPageIndex() >= totalPages() - 1"
          (click)="nextPage()"
        >
          ›
        </button>
      </nav>
    </div>
  `,
})
export class TableComponent {
  readonly buttonFilter = signal<boolean>(false);
  columns = input<TableColumn[]>([]);
  title = input<string>('');
  datasource = input<any[]>([]);
  actionTemplate = input<TemplateRef<any> | null>(null);
  showAddButton = input<boolean>(false);
  addButtonText = input<string>('Agregar');
  columnTemplates = input<Record<string, TemplateRef<any>>>({});
  showSecondaryButton = input<boolean>(false);
  secondaryButtonText = input<string>('Crear');
  showColumnFilters = input<boolean>(false);
  showExportButton = input<boolean>(false);
  exportFileName = input<string>('table_export');

  serverMode = input<boolean>(false);
  serverData = input<IPaginatedResponse<any> | null>(null);
  loading = input<boolean>(false);

  action = output<Action>();
  secondaryButtonAction = output<void>();
  serverPaginationChange = output<IPaginationParams>();
  readonly showExportDropdown = signal<boolean>(false);

  private readonly search = signal<string>('');
  readonly columnFilters = signal<Record<string, string>>({});

  readonly pageSizeOptions = [5, 10, 25, 50];
  readonly pageSize = signal<number>(this.pageSizeOptions[0]);
  readonly pageIndex = signal<number>(0);

  readonly currentPageSize = computed(() => {
    if (this.serverMode()) {
      return this.serverData()?.pageSize || this.pageSize();
    }
    return this.pageSize();
  });

  readonly currentPageIndex = computed(() => {
    if (this.serverMode()) {
      const serverData = this.serverData();
      return serverData ? serverData.currentPage : 0;
    }
    return this.pageIndex();
  });

  onColumnFilterInput(column: string, event: Event) {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    this.columnFilters.update(filters => ({
      ...filters,
      [column]: value
    }));

    if (this.serverMode()) {
      const currentFilters = this.columnFilters();
      const currentSize = this.serverData()?.pageSize || this.pageSize();
      const currentSearch = this.search();

      this.emitServerPaginationChange({
        filters: currentFilters,
        page: 0,
        size: currentSize,
        search: currentSearch
      });
    } else {
      this.pageIndex.set(0);
    }
  }

  onColumnFilterChange(column: string, value: string) {
    this.columnFilters.update(filters => ({
      ...filters,
      [column]: value
    }));

    if (this.serverMode()) {
      const currentFilters = this.columnFilters();
      const currentSize = this.serverData()?.pageSize || this.pageSize();
      const currentSearch = this.search();

      this.emitServerPaginationChange({
        filters: currentFilters,
        page: 0,
        size: currentSize,
        search: currentSearch
      });
    } else {
      this.pageIndex.set(0);
    }
  }

  onPageSizeChange(event: Event) {
    const value = Number((event.target as HTMLSelectElement).value);

    if (this.serverMode()) {
      const currentSearch = this.search();
      const currentFilters = this.columnFilters();

      this.emitServerPaginationChange({
        size: value,
        page: 0,
        search: currentSearch,
        filters: currentFilters
      });
    } else {
      this.pageSize.set(value);
      this.pageIndex.set(0);
    }
  }

  prevPage() {
    if (this.serverMode()) {
      const serverData = this.serverData();
      const currentPage = serverData?.currentPage || 0;
      if (currentPage > 0) {
        const currentSize = serverData?.pageSize || this.pageSize();
        const currentSearch = this.search();
        const currentFilters = this.columnFilters();

        this.emitServerPaginationChange({
          page: currentPage - 1,
          size: currentSize,
          search: currentSearch,
          filters: currentFilters
        });
      }
    } else {
      this.pageIndex.update((i) => Math.max(i - 1, 0));
    }
  }

  nextPage() {
    if (this.serverMode()) {
      const serverData = this.serverData();
      const currentPage = serverData?.currentPage || 0;
      const totalPages = serverData?.totalPages || 1;
      if (currentPage < totalPages - 1) {
        const currentSize = serverData?.pageSize || this.pageSize();
        const currentSearch = this.search();
        const currentFilters = this.columnFilters();

        this.emitServerPaginationChange({
          page: currentPage + 1,
          size: currentSize,
          search: currentSearch,
          filters: currentFilters
        });
      }
    } else {
      this.pageIndex.update((i) =>
        Math.min(i + 1, this.totalPages() - 1),
      );
    }
  }

  goToPage(i: number) {
    if (this.serverMode()) {
      const serverData = this.serverData();
      const currentSize = serverData?.pageSize || this.pageSize();
      const currentSearch = this.search();
      const currentFilters = this.columnFilters();

      this.emitServerPaginationChange({
        page: i,
        size: currentSize,
        search: currentSearch,
        filters: currentFilters
      });
    } else {
      this.pageIndex.set(i);
    }
  }

  readonly filtered = computed(() => {
    if (this.serverMode()) {
      return this.serverData()?.response ?? [];
    }

    let result = this.datasource() ?? [];

    // Aplicar filtro de búsqueda global
    const searchTerm = this.search().toLowerCase().trim();
    if (searchTerm) {
      result = result.filter((row) =>
        this.columns().some((col) =>
          String(row[col.field] ?? '')
            .toLowerCase()
            .includes(searchTerm),
        ),
      );
    }

    // Aplicar filtros por columna
    const filters = this.columnFilters();
    Object.entries(filters).forEach(([column, filterValue]) => {
      if (filterValue.trim()) {
        result = result.filter((row) =>
          String(row[column] ?? '')
            .toLowerCase()
            .includes(filterValue.toLowerCase().trim())
        );
      }
    });

    return result;
  });

  readonly totalPages = computed(() => {
    if (this.serverMode()) {
      return this.serverData()?.totalPages ?? 0;
    }
    return Math.max(
      1,
      Math.ceil(this.filtered().length / this.pageSize()),
    );
  });

  readonly pagedRows = computed(() => {
    if (this.serverMode()) {
      return this.filtered();
    }
    const start = this.pageIndex() * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  createRange = (n: number) =>
    Array.from({ length: n }, (_, i) => i);

  readonly startEntry = computed(() => {
    if (this.serverMode()) {
      const serverData = this.serverData();
      if (!serverData?.response.length) return 0;

      return serverData.currentPage * serverData.pageSize + 1;
    }
    return this.filtered().length ? this.pageIndex() * this.pageSize() + 1 : 0;
  });

  readonly endEntry = computed(() => {
    if (this.serverMode()) {
      const serverData = this.serverData();
      if (!serverData) return 0;


      return Math.min(
        serverData.totalCount,
        (serverData.currentPage + 1) * serverData.pageSize
      );
    }
    return Math.min(
      this.filtered().length,
      (this.pageIndex() + 1) * this.pageSize(),
    );
  });

  readonly totalCount = computed(() => {
    if (this.serverMode()) {
      return this.serverData()?.totalCount ?? 0;
    }
    return this.filtered().length;
  });

  onAction(type: string, row: any) {
    this.action.emit({ action: type, row });
  }

  clearAllFilters() {
    this.columnFilters.set({});

    if (this.serverMode()) {
      const serverData = this.serverData();
      const currentSize = serverData?.pageSize || this.pageSize();
      const currentSearch = this.search();

      this.emitServerPaginationChange({
        page: 0,
        size: currentSize,
        search: currentSearch || undefined,
        filters: undefined
      });
    } else {
      this.pageIndex.set(0);
    }
  }

  trackById = (_: number, row: any) => row.id ?? _;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const exportButton = target.closest('[data-export-dropdown]');
    if (!exportButton && this.showExportDropdown()) {
      this.showExportDropdown.set(false);
    }
  }

  toggleExportDropdown() {
    this.showExportDropdown.update(show => !show);
  }

  toggleFilters() {
    this.buttonFilter.update(show => !show);
  }

  private downloadFile(content: string, fileName: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.showExportDropdown.set(false);
  }

  private getExportData() {
    return this.filtered().map(row => {
      const exportRow: any = {};
      this.columns().forEach(col => {
        exportRow[col.header] = row[col.field] ?? '';
      });
      return exportRow;
    });
  }

  exportAsCSV() {
    const data = this.getExportData();
    const headers = this.columns().map(col => col.header);

    let csvContent = headers.join(';') + '\n';
    data.forEach(row => {
      const rowData = headers.map(header => {
        const value = row[header] ?? '';
        const stringValue = String(value);
        if (stringValue.includes(';') || stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
          return '"' + stringValue.replace(/"/g, '""') + '"';
        }
        return stringValue;
      });
      csvContent += rowData.join(';') + '\n';
    });

    this.downloadFile(csvContent, `${this.exportFileName()}.csv`, 'text/csv;charset=utf-8');
  }

  exportAsJSON() {
    const data = this.getExportData();
    const jsonContent = JSON.stringify(data, null, 2);

    this.downloadFile(jsonContent, `${this.exportFileName()}.json`, 'application/json');
  }

  exportAsTXT() {
    const data = this.getExportData();
    const headers = this.columns().map(col => col.header);
    const colWidths = headers.map((header, index) => {
      const maxContentWidth = Math.max(
        header.length,
        ...data.map(row => String(row[header] ?? '').length)
      );
      return Math.min(maxContentWidth + 2, 30);
    });

    const separatorLine = colWidths.map(width => '+'.padEnd(width + 1, '-')).join('') + '+';

    let txtContent = separatorLine + '\n';


    const headerRow = '|' + headers.map((header, index) =>
      ` ${header.padEnd(colWidths[index])}|`
    ).join('') + '\n';
    txtContent += headerRow;
    txtContent += separatorLine + '\n';

    data.forEach(row => {
      const dataRow = '|' + headers.map((header, index) => {
        const value = String(row[header] ?? '').substring(0, colWidths[index]);
        return ` ${value.padEnd(colWidths[index])}|`;
      }).join('') + '\n';
      txtContent += dataRow;
    });

    txtContent += separatorLine;

    this.downloadFile(txtContent, `${this.exportFileName()}.txt`, 'text/plain');
  }

  exportAsSQL() {
    const data = this.getExportData();
    const headers = this.columns().map(col => col.header);
    const tableName = this.exportFileName().toLowerCase().replace(/[^a-z0-9]/g, '_');

    let sqlContent = `-- SQL Export for ${this.title() || 'Table'}\n`;
    sqlContent += `-- Generated on ${new Date().toISOString()}\n\n`;

    sqlContent += `CREATE TABLE ${tableName} (\n`;
    sqlContent += headers.map(header =>
      `  ${header.toLowerCase().replace(/[^a-z0-9]/g, '_')} VARCHAR(255)`
    ).join(',\n');
    sqlContent += '\n);\n\n';

    if (data.length > 0) {
      sqlContent += `INSERT INTO ${tableName} (${headers.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, '_')).join(', ')}) VALUES\n`;

      const values = data.map(row => {
        const rowValues = headers.map(header => {
          const value = row[header] ?? '';
          return `'${String(value).replace(/'/g, "''")}'`;
        });
        return `(${rowValues.join(', ')})`;
      });

      sqlContent += values.join(',\n') + ';\n';
    }

    this.downloadFile(sqlContent, `${this.exportFileName()}.sql`, 'application/sql');
  }

  private emitServerPaginationChange(additionalParams: Partial<IPaginationParams> = {}): void {
    const serverData = this.serverData();

    const currentPage = serverData?.currentPage ?? 0;
    const currentSize = serverData?.pageSize || this.pageSize();
    const currentSearch = this.search();
    const currentFilters = this.columnFilters();


    const params: IPaginationParams = {
      page: additionalParams.page ?? currentPage,
      size: additionalParams.size ?? currentSize,
      search: additionalParams.search ?? (currentSearch || undefined),
      filters: additionalParams.filters ?? (Object.keys(currentFilters).length > 0 ? currentFilters : undefined)
    };

    if (!params.search) delete params.search;
    if (!params.filters || Object.keys(params.filters).length === 0) delete params.filters;

    this.serverPaginationChange.emit(params);
  }
}
