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
  effect,
  DestroyRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { IPaginatedResponse, IPaginationParams } from '../interfaces/IpaginatedResponse';
import { Datepicker } from '../../shared/components/datepicker';
import { ColombianCurrencyPipe } from '../../shared/pipes/colombian-currency.pipe';

export interface Action<T = any> {
  action: string;
  row?: T;
}

export interface TableColumn {
  field: string;
  header: string;
  type?: 'text' | 'date' | 'number' | 'currency';
  defaultValue?: string;
}

@Component({
  selector: 'app-table-dynamic',
  standalone: true,
  imports: [NgTemplateOutlet, Datepicker, ColombianCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (title()) {
      <div class="px-4 sm:px-6 lg:px-8 py-6 pb-0">
        <div class="mb-6">
          @if (!hideTitle()) {
          <h1
            class="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-200 mb-4"
          >
            {{ title() }}
          </h1>
          }

          <div
            class="flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
          >
            <div class="flex items-center gap-4">
              @if (showExportButton()) {
              <div class="relative" data-export-dropdown>
                <button
                  type="button"
                  class="relative flex w-full items-center justify-center rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-600/20 backdrop-blur-md px-4 py-3 text-sm font-medium text-gray-900 dark:text-white hover:bg-blue-500/20 hover:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 overflow-hidden group"
                  (click)="toggleExportDropdown()"
                >
                  <span class="relative z-20 flex items-center">
                    Descargar
                    <svg class="-me-0.5 ms-1.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
                    </svg>
                  </span>
                  <span class="absolute left-[-75%] top-0 h-full w-[50%] bg-blue-400/30 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out"></span>
                </button>

                @if (showExportDropdown()) {
                  <div class="absolute left-0 top-full z-[9999] mt-2 w-52 rounded-xl bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 overflow-hidden">
                    <ul class="p-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      <li>
                        <button
                          class="group inline-flex w-full items-center rounded-lg px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                          (click)="exportAsCSV()"
                        >
                          <svg class="me-1.5 h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M9 2.221V7H4.221a2 2 0 0 1 .365-.5L8.5 2.586A2 2 0 0 1 9 2.22ZM11 2v5a2 2 0 0 1-2 2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2 2 2 0 0 0 2 2h12a2 2 0 0 0 2-2 2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2V4a2 2 0 0 0-2-2h-7Zm1.018 8.828a2.34 2.34 0 0 0-2.373 2.13v.008a2.32 2.32 0 0 0 2.06 2.497l.535.059a.993.993 0 0 0 .136.006.272.272 0 0 1 .263.367l-.008.02a.377.377 0 0 1-.018.044.49.49 0 0 1-.078.02 1.689 1.689 0 0 1-.297.021h-1.13a1 1 0 1 0 0 2h1.13c.417 0 .892-.05 1.324-.279.47-.248.78-.648.953-1.134a2.272 2.272 0 0 0-2.115-3.06l-.478-.052a.32.32 0 0 1-.285-.341.34.34 0 0 1 .344-.306l.94.02a1 1 0 1 0 .043-2l-.943-.02h-.003Zm7.933 1.482a1 1 0 1 0-1.902-.62l-.57 1.747-.522-1.726a1 1 0 0 0-1.914.578l1.443 4.773a1 1 0 0 0 1.908.021l1.557-4.773Zm-13.762.88a.647.647 0 0 1 .458-.19h1.018a1 1 0 1 0 0-2H6.647A2.647 2.647 0 0 0 4 13.647v1.706A2.647 2.647 0 0 0 6.647 18h1.018a1 1 0 1 0 0-2H6.647A.647.647 0 0 1 6 15.353v-1.706c0-.172.068-.336.19-.457Z" clip-rule="evenodd"/>
                          </svg>
                          <span>Export CSV</span>
                        </button>
                      </li>
                      <li>
                        <button
                          class="group inline-flex w-full items-center rounded-lg px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200"
                          (click)="exportAsExcel()"
                        >
                          <svg class="me-1.5 h-4 w-4 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M9 7V2.221a2 2 0 0 0-.5.365L4.586 6.5a2 2 0 0 0-.365.5H9Zm2 0V2h7a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9h5a2 2 0 0 0 2-2Zm-1 9a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2Zm2-5a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Zm4 4a1 1 0 1 0-2 0v3a1 1 0 1 0 2 0v-3Z" clip-rule="evenodd"/>
                          </svg>
                          <span>Export Excel</span>
                        </button>
                      </li>
                      <li>
                        <button
                          class="group inline-flex w-full items-center rounded-lg px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200"
                          (click)="exportAsJSON()"
                        >
                          <svg class="me-1.5 h-4 w-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M9 2.221V7H4.221a2 2 0 0 1 .365-.5L8.5 2.586A2 2 0 0 1 9 2.22ZM11 2v5a2 2 0 0 1-2 2H4v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-7Zm-.293 9.293a1 1 0 0 1 0 1.414L9.414 14l1.293 1.293a1 1 0 0 1-1.414 1.414l-2-2a1 1 0 0 1 0-1.414l2-2a1 1 0 0 1 1.414 0Zm2.586 1.414a1 1 0 0 1 1.414-1.414l2 2a1 1 0 0 1 0 1.414l-2 2a1 1 0 0 1-1.414-1.414L14.586 14l-1.293-1.293Z" clip-rule="evenodd"/>
                          </svg>
                          <span>Export JSON</span>
                        </button>
                      </li>
                      <li>
                        <button
                          class="group inline-flex w-full items-center rounded-lg px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200"
                          (click)="exportAsTXT()"
                        >
                          <svg class="me-1.5 h-4 w-4 text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M9 2.221V7H4.221a2 2 0 0 1 .365-.5L8.5 2.586A2 2 0 0 1 9 2.22ZM11 2v5a2 2 0 0 1-2 2H4v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-7ZM8 16a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1Zm1-5a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H9Z" clip-rule="evenodd"/>
                          </svg>
                          <span>Export TXT</span>
                        </button>
                      </li>
                      <li>
                        <button
                          class="group inline-flex w-full items-center rounded-lg px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200"
                          (click)="exportAsSQL()"
                        >
                          <svg class="me-1.5 h-4 w-4 text-gray-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
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
                class="relative flex items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium backdrop-blur-md transition-all duration-300 overflow-hidden group"
                [class]="buttonFilter()
                  ? 'border-green-500/30 bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:border-green-400/30 dark:bg-green-400/10 dark:text-green-300 dark:hover:bg-green-400/20'
                  : 'border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-600/20 text-gray-900 dark:text-white hover:bg-blue-500/20 hover:border-blue-500/50'"
                (click)="toggleFilters()"
                [title]="buttonFilter() ? 'Ocultar filtros' : 'Mostrar filtros'"
              >
                <span class="relative z-20 flex items-center">
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
                </span>
                <span class="absolute left-[-75%] top-0 h-full w-[50%] bg-blue-400/30 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out"></span>
              </button>
            }
          </div>

          <div class="flex flex-col sm:flex-row items-center gap-3">
            @if (showAddButton()) {
              <button
                class="relative bg-gradient-to-br from-blue-500/10 to-blue-600/20 hover:bg-blue-500/30 border border-blue-500/30 backdrop-blur-md text-blue-700 dark:text-blue-300 font-semibold py-3 px-6 rounded-xl hover:border-blue-500/50 transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 flex items-center gap-3 whitespace-nowrap cursor-pointer w-full sm:w-auto justify-center overflow-hidden group"
                (click)="onAction('add', null)"
              >
                <span class="relative z-20 flex items-center gap-3">
                  <i [class]="addButtonIcon() + ' text-xl'" aria-hidden="true"></i>
                  {{ addButtonText() }}
                </span>
                <span class="absolute left-[-75%] top-0 h-full w-[50%] bg-blue-400/30 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out"></span>
              </button>
            }

            @if (showSecondaryButton()) {
              <button
                class="relative bg-gradient-to-br from-green-500/10 to-green-600/20 hover:bg-green-500/30 border border-green-500/30 backdrop-blur-md text-green-700 dark:text-green-300 font-semibold py-3 px-6 rounded-xl hover:border-green-500/50 transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 active:scale-95 flex items-center gap-3 whitespace-nowrap cursor-pointer w-full sm:w-auto justify-center overflow-hidden group"
                (click)="onSecondaryAction()"
              >
                <span class="relative z-20 flex items-center gap-3">
                  <i [class]="secondaryButtonIcon() + ' text-xl'" aria-hidden="true"></i>
                  {{ secondaryButtonText() }}
                </span>
                <span class="absolute left-[-75%] top-0 h-full w-[50%] bg-green-400/30 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out"></span>
              </button>
            }
          </div>
        </div>
      </div>
    </div>
    }

    <div
      class="relative overflow-hidden shadow-2xl bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl border-t border-white/20 dark:border-slate-700/30"
      [class.mx-4]="title()"
      [class.sm:mx-6]="title()"
      [class.lg:mx-8]="title()"
      [class.sm:rounded-t-2xl]="pagination()"
      [class.sm:rounded-2xl]="!pagination()"
    >
      <div class="overflow-x-auto">
        <table
          class="w-full text-sm text-left rtl:text-right text-gray-700 dark:text-gray-300"
        >
          <thead
            class="bg-slate-700/40 dark:bg-slate-900/30 backdrop-blur-xl"
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
            @if (actionTemplate()) {
              <th scope="col" class="px-3 sm:px-6 py-4">
                <span class="sr-only">Actions</span>
              </th>
            }
          </tr>

          <!-- Fila de filtros separada -->
          @if (showColumnFilters() && buttonFilter()) {
            <tr class="bg-slate-600/30 dark:bg-slate-800/20 backdrop-blur-xl border-t border-white/10">
              @for (column of columns(); track column) {
                <th scope="col" class="px-3 sm:px-6 py-3">
                  <div class="relative">
                    <!-- Icono de filtro -->
                    <div class="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
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
                        class="w-full pl-6 pr-3 py-2 text-sm bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40"
                        (input)="onColumnFilterInput(column.field, $event)"
                        [value]="columnFilters()[column.field] || ''"
                      />
                    }
                  </div>
                </th>
              }
              @if (actionTemplate()) {
                <th scope="col" class="px-3 sm:px-6 py-3">
                  <button
                    type="button"
                    (click)="clearAllFilters()"
                    class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-red-600/40 bg-red-500/10 text-red-400 hover:bg-red-600/20 hover:border-red-500/60 focus:outline-none focus:ring-2 focus:ring-red-500/40 backdrop-blur-sm transition-all duration-300"
                    title="Limpiar todos los filtros"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </th>
              }
            </tr>
          }
        </thead>

        <tbody class="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl">
          @if (pagedRows().length) {
            @for (row of pagedRows(); track trackById($index, row)) {
              <tr
                class="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-blue-50/30 dark:hover:bg-gray-700/40 transition-all duration-300"
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
                    } @else if (col.type === 'currency') {
                      {{ getNestedValue(row, col.field) | colombianCurrency }}
                    } @else {
                      {{ getNestedValue(row, col.field) ?? col.defaultValue ?? '' }}
                    }
                  </td>
                }
                @if (actionTemplate()) {
                  <td class="px-6 py-4 text-right">
                    <ng-container
                      [ngTemplateOutlet]="actionTemplate()"
                      [ngTemplateOutletContext]="{ $implicit: row, row }"
                    />
                  </td>
                }
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
    </div>

    <!-- Footer de paginación separado del scroll -->
@if (pagination() == true){
      <div
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-slate-100/30 dark:bg-slate-700/20 backdrop-blur-xl text-gray-700 dark:text-gray-300 text-sm shadow-xl sm:rounded-b-2xl mt-[-1px]"
      [class.mx-4]="title()"
      [class.sm:mx-6]="title()"
      [class.lg:mx-8]="title()"
    >
      <!-- Información de registros -->
      <span class="font-medium text-xs sm:text-sm text-center sm:text-left sm:mb-0">
        Mostrando {{ startEntry() }} en {{ endEntry() }} de {{ totalCount() }} registros
      </span>

      <!-- Controles de paginación -->
      <div class="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
        <!-- Navegación de páginas -->
        <nav class="inline-flex items-center gap-0 bg-slate-800/40 dark:bg-slate-800/30 backdrop-blur-xl rounded-lg sm:rounded-xl overflow-hidden border border-slate-600/50 shadow-lg">
          <!-- Botón Anterior -->
          <button
            class="px-2 py-1.5 sm:px-3 sm:py-2 text-white hover:bg-slate-700/80 dark:hover:bg-slate-600/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 border-r border-slate-600/50 backdrop-blur-sm text-xs sm:text-sm"
            [disabled]="currentPageIndex() === 0"
            (click)="prevPage()"
          >
            ‹
          </button>

          <!-- Páginas numeradas (responsive) -->
          @for (i of getVisiblePages(); track i) {
            <button
              class="px-2 py-1.5 sm:px-3 sm:py-2 min-w-[32px] sm:min-w-[40px] text-center transition-all duration-300 border-r border-slate-600/50 last:border-r-0 backdrop-blur-sm text-xs sm:text-sm"
              [class]="i === currentPageIndex()
                ? 'bg-blue-600/90 text-white hover:bg-blue-700/90 shadow-lg shadow-blue-500/20'
                : 'text-white hover:bg-slate-700/80 dark:hover:bg-slate-600/80'"
              (click)="goToPage(i)"
            >
              {{ i + 1 }}
            </button>
          }

          <!-- Botón Siguiente -->
          <button
            class="px-2 py-1.5 sm:px-3 sm:py-2 text-white hover:bg-slate-700/80 dark:hover:bg-slate-600/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 backdrop-blur-sm text-xs sm:text-sm"
            [disabled]="currentPageIndex() >= totalPages() - 1"
            (click)="nextPage()"
          >
            ›
          </button>
        </nav>

        <!-- Selector de filas por página -->
        <div class="flex items-center gap-2 text-xs sm:text-sm">
          <!-- <span class="text-gray-600 dark:text-gray-300 whitespace-nowrap font-medium">
            Filas:
          </span> -->
          <select
            class="px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl bg-gray-800/60 dark:bg-gray-800/60 backdrop-blur-sm text-white border border-gray-600/50 text-xs sm:text-sm min-w-[60px] sm:min-w-[70px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 cursor-pointer hover:bg-gray-700/70 shadow-lg appearance-none bg-[length:14px_14px] sm:bg-[length:16px_16px] bg-[position:right_0.4rem_center] sm:bg-[position:right_0.5rem_center] bg-no-repeat"
            style="background-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 24 24%27 stroke=%27%23ffffff%27%3E%3Cpath stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27M19 9l-7 7-7-7%27/%3E%3C/svg%3E');"
            [value]="currentPageSize()"
            (change)="onPageSizeChange($event)"
          >
            @for (opt of pageSizeOptions; track opt) {
              <option [value]="opt" class="bg-gray-800 text-white">{{ opt }}</option>
            }
          </select>
        </div>
      </div>
    </div>
}
  `,
})
export class TableComponent {
  pagination = input<boolean>(true);
  private readonly destroyRef = inject(DestroyRef);
  private readonly filterSubject = new Subject<{ field: string; value: string }>();

  readonly buttonFilter = signal<boolean>(false);
  columns = input<TableColumn[]>([]);
  title = input<string>('');
  datasource = input<any[]>([]);
  actionTemplate = input<TemplateRef<any> | null>(null);
  showAddButton = input<boolean>(false);
  addButtonText = input<string>('Agregar');
  addButtonIcon = input<string>('fa-solid fa-user-plus');
  columnTemplates = input<Record<string, TemplateRef<any>>>({});
  showSecondaryButton = input<boolean>(false);
  secondaryButtonText = input<string>('Crear');
  secondaryButtonIcon = input<string>('fa-solid fa-circle-plus');
  showColumnFilters = input<boolean>(false);
  showExportButton = input<boolean>(false);
  exportFileName = input<string>('table_export');
  hideTitle = input<boolean>(false);
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

  constructor() {
    // Configurar el debounce para los filtros
    this.filterSubject
      .pipe(
        debounceTime(600), // Esperar después del último cambio
        distinctUntilChanged((prev, curr) =>
          prev.field === curr.field && prev.value === curr.value
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ field, value }) => {
        this.applyColumnFilter(field, value);
      });
  }

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

    // Actualizar inmediatamente el signal para la UI
    this.columnFilters.update(filters => ({
      ...filters,
      [column]: value
    }));

    // Enviar al subject para aplicar debounce
    this.filterSubject.next({ field: column, value });
  }

  private applyColumnFilter(field: string, value: string) {
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
      // Para modo cliente, resetear la página
      this.pageIndex.set(0);
    }
  }

  onColumnFilterChange(column: string, value: string) {
    // Actualizar inmediatamente el signal para la UI
    this.columnFilters.update(filters => ({
      ...filters,
      [column]: value
    }));

    // Enviar al subject para aplicar debounce
    this.filterSubject.next({ field: column, value });
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

  // Método para obtener las páginas visibles (adaptativo según pantalla)
  getVisiblePages(): number[] {
    const totalPages = this.totalPages();
    const currentPage = this.currentPageIndex();

    // Detectar si es móvil (esto es una aproximación simple)
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const maxVisible = isMobile ? 3 : 5; // 3 páginas en móvil, 5 en desktop

    // Si hay maxVisible o menos páginas, mostrar todas
    if (totalPages <= maxVisible) {
      return this.createRange(totalPages);
    }

    // Calcular el rango centrado en la página actual
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(0, currentPage - half);
    let end = Math.min(totalPages, start + maxVisible);

    // Ajustar si estamos cerca del final
    if (end === totalPages) {
      start = Math.max(0, end - maxVisible);
    }

    return Array.from({ length: end - start }, (_, i) => start + i);
  }

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

  onSecondaryAction() {
    this.secondaryButtonAction.emit();
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

    // Agregar BOM UTF-8 para caracteres especiales
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    this.downloadFile(csvWithBOM, `${this.exportFileName()}.csv`, 'text/csv;charset=utf-8');
  }

  exportAsExcel() {
    const data = this.getExportData();
    const headers = this.columns().map(col => col.header);

    // Crear tabla HTML compatible con Excel
    let excelContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>${this.title() || 'Hoja1'}</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; width: 100%; }
          th { background-color: #4472C4; color: white; font-weight: bold; padding: 8px; border: 1px solid #ddd; }
          td { padding: 8px; border: 1px solid #ddd; }
          tr:nth-child(even) { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              ${headers.map(header => `<th>${this.escapeHtml(header)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
    `;

    data.forEach(row => {
      excelContent += '<tr>';
      headers.forEach(header => {
        const value = row[header] ?? '';
        excelContent += `<td>${this.escapeHtml(String(value))}</td>`;
      });
      excelContent += '</tr>';
    });

    excelContent += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    // Agregar BOM UTF-8 para caracteres especiales
    const BOM = '\uFEFF';
    const excelWithBOM = BOM + excelContent;

    this.downloadFile(excelWithBOM, `${this.exportFileName()}.xls`, 'application/vnd.ms-excel;charset=utf-8');
  }

  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
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

  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  }
}
