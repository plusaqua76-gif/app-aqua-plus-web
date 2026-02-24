import {
  Component,
  computed,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { TransversalRatesService, TransversalRate as TarifaTransversal, TransversalRateRequest } from '../../services/transversalRates.service';
import { UseService } from '../../services/use.service';
import { IUse } from '@interfaces/IUse';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ToastService } from '@services/toast.service';
import { ConfirmDeletePopupComponent } from '@shared/components/confirm-delete-popup';
import { PopupComponent } from '@shared/components/popUp';
import { RateTypeService } from '../../services/rate-type.service';

@Component({
  selector: 'app-transversal-rate',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ConfirmDeletePopupComponent, PopupComponent],
  template: `
    <div
      class="min-h-screen  shadow-sm rounded-lg bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl  p-4"
    >
      <div class="max-w-7xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-200">
            Configuración de Servicios
          </h1>
          <button
            (click)="openCreateModal()"
            class="inline-flex items-center gap-2 px-6 py-3 border-2 border-blue-600 bg-white/10 dark:bg-slate-700/50 backdrop-blur-md hover:bg-white/20 dark:hover:bg-slate-600/50 hover:border-blue-500 text-gray-900 dark:text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <i class="fas fa-plus"></i>
            <span>Nueva Tarifa</span>
          </button>
        </div>

        <!-- Parámetros de Configuración -->
        <div class="mb-8">
          <!-- <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">
            Gestión de Tarifas
          </h2> -->
          <div class="flex flex-wrap justify-center gap-6 py-8">
            <!-- Cards de Tarifas Dinámicas -->
            @for (tarifa of transversalRates(); track tarifa.id; let idx = $index) {
              @let editData = getEditData(tarifa);
              @let cardColor = getCardColor(tarifa);
              <div class="flex-shrink-0 transition-all duration-300 relative">

                    <!-- Card Principal -->
                    <div [ngClass]="{
                      'bg-sky-600': cardColor === 'sky',
                      'bg-purple-600': cardColor === 'purple',
                      'bg-amber-500': cardColor === 'amber',
                      'bg-slate-600': cardColor === 'slate',
                      'shadow-sky-400': cardColor === 'sky',
                      'shadow-purple-400': cardColor === 'purple',
                      'shadow-amber-400': cardColor === 'amber',
                      'shadow-slate-400': cardColor === 'slate'
                    }"
                    class="rounded-2xl shadow-sm outline outline-slate-400 -outline-offset-8">
                      <div [ngClass]="{
                        'after:bg-sky-600': cardColor === 'sky',
                        'after:bg-purple-600': cardColor === 'purple',
                        'after:bg-amber-500': cardColor === 'amber',
                        'after:bg-slate-600': cardColor === 'slate',
                        'before:bg-sky-300': cardColor === 'sky',
                        'before:bg-purple-300': cardColor === 'purple',
                        'before:bg-amber-300': cardColor === 'amber',
                        'before:bg-slate-300': cardColor === 'slate'
                      }"
                      class="group overflow-hidden relative after:duration-500 before:duration-500 duration-500 hover:after:duration-500 hover:after:translate-x-24 hover:before:translate-y-12 hover:before:-translate-x-32 hover:duration-500 after:absolute after:w-24 after:h-24 after:rounded-full after:blur-xl after:bottom-32 after:right-16 before:absolute before:w-20 before:h-20 before:rounded-full before:blur-xl before:top-20 before:right-16 flex justify-center items-center h-56 w-80 bg-neutral-900 rounded-2xl outline outline-slate-400 -outline-offset-8">
                        <div class="z-10 flex flex-col items-center gap-2 w-full px-4">
                          <!-- Ícono con efecto blur -->
                         <i
                        [class]="getTarifaIcon(tarifa) + ' text-white/50 text-5xl drop-shadow-[0_0_25px_rgba(255,255,255,0.4)] filter brightness-125'">
                      </i>
                          <p class="text-gray-50 text-center font-semibold text-lg">{{ tarifa.nombre }}</p>

                          <!-- Tipo de Uso, Nombre Tarifa y Estrato -->
                          <div class="flex items-center gap-3 text-xs text-white">
                            <div class="flex items-center gap-1">
                              <i class="fas fa-tag"></i>
                              <span>{{ tarifa.tipoUso.nombre }}</span>
                            </div>
                            <span class="text-gray-300">|</span>
                            <div class="flex items-center gap-1">
                              <i class="fas fa-file-invoice"></i>
                              <span>{{ tarifa.tipoTarifa.nombre }}</span>
                            </div>
                            <span class="text-gray-300">|</span>
                            <div class="flex items-center gap-1">
                              <i class="fas fa-layer-group"></i>
                              <span>Estrato {{ tarifa.estrato }}</span>
                            </div>
                          </div>

                          <div class="mt-1 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                            <p class="text-xs text-gray-300">Valor Actual:</p>
                            <p class="text-xl font-bold text-white">
                              {{ tarifa.valor | currency:'COP':'symbol-narrow':'1.0-0' }}
                            </p>
                          </div>
                        </div>

                        <!-- Toggle Button -->
                        <button
                          (click)="toggleCard(idx)"
                          [ngClass]="{
                            'bg-sky-500 hover:bg-sky-400': cardColor === 'sky',
                            'bg-purple-500 hover:bg-purple-400': cardColor === 'purple',
                            'bg-amber-300 hover:bg-amber-300': cardColor === 'amber',
                            'bg-slate-500 hover:bg-slate-400': cardColor === 'slate'
                          }"
                          class="absolute bottom-4 right-4 z-20 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all duration-300 shadow-lg">
                          <i [class]="expandedCard() === idx ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                        </button>
                      </div>
                    </div>

                    <!-- Expandable Section -->
                    <div [class]="expandedCard() === idx ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'"
                         class="transition-all duration-300 ease-in-out overflow-hidden">
                      <div [ngClass]="{
                        'border-sky-400/30': cardColor === 'sky',
                        'border-purple-400/30': cardColor === 'purple',
                        'border-amber-400/30': cardColor === 'amber',
                        'border-slate-400/30': cardColor === 'slate'
                      }"
                      class="bg-neutral-800/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border w-80">
                        <div class="space-y-3">
                          <!-- Tipo de Uso (solo lectura) -->
                          <div class="bg-neutral-700/50 rounded-lg p-3">
                            <p class="text-xs text-gray-400 mb-1">Tipo de Uso:</p>
                            <p class="text-sm text-gray-200 font-medium">{{ tarifa.tipoUso.nombre }}</p>
                          </div>

                          <!-- Input de Nombre -->
                          <div>
                            <p class="text-xs text-gray-400 mb-1">Nombre:</p>
                            <input
                              type="text"
                              [disabled]="!isEditingTarifa(tarifa.id)"
                              [(ngModel)]="editData.nombre"
                              [placeholder]="tarifa.tipoTarifa.nombre"
                              [ngClass]="{
                                'focus:ring-sky-400': cardColor === 'sky',
                                'focus:ring-purple-400': cardColor === 'purple',
                                'focus:ring-amber-400': cardColor === 'amber',
                                'focus:ring-slate-400': cardColor === 'slate'
                              }"
                              class="w-full px-3 py-2 bg-neutral-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>

                          <!-- Input de Estrato -->
                          <div>
                            <p class="text-xs text-gray-400 mb-1">Estrato:</p>
                            <input
                              type="number"
                              [disabled]="!isEditingTarifa(tarifa.id)"
                              [(ngModel)]="editData.estrato"
                              [placeholder]="tarifa.estrato"
                              [ngClass]="{
                                'focus:ring-sky-400': cardColor === 'sky',
                                'focus:ring-purple-400': cardColor === 'purple',
                                'focus:ring-amber-400': cardColor === 'amber',
                                'focus:ring-slate-400': cardColor === 'slate'
                              }"
                              class="w-full px-3 py-2 bg-neutral-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>

                          <!-- Input de Valor -->
                          <div>
                            <p class="text-xs text-gray-400 mb-1">Valor:</p>
                            <input
                              type="number"
                              [disabled]="!isEditingTarifa(tarifa.id)"
                              [(ngModel)]="editData.valor"
                              [placeholder]="tarifa.valor ?? 0"
                              [ngClass]="{
                                'focus:ring-sky-400': cardColor === 'sky',
                                'focus:ring-purple-400': cardColor === 'purple',
                                'focus:ring-amber-400': cardColor === 'amber',
                                'focus:ring-slate-400': cardColor === 'slate'
                              }"
                              class="w-full px-3 py-2 bg-neutral-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>

                          <!-- Botones de Acción -->
                          <div class="flex items-center gap-2 pt-2">
                            <!-- Botón Editar/Guardar -->
                            <button
                              type="button"
                              (click)="isEditingTarifa(tarifa.id) ? saveTarifa(tarifa) : startEditTarifa(tarifa)"
                              [disabled]="isSubmitting()"
                              [ngClass]="{
                                'border-green-600/50 text-green-400 hover:bg-green-600/10': isEditingTarifa(tarifa.id),
                                'border-sky-500/50 text-sky-400 hover:bg-sky-500/10': !isEditingTarifa(tarifa.id) && cardColor === 'sky',
                                'border-purple-500/50 text-purple-400 hover:bg-purple-500/10': !isEditingTarifa(tarifa.id) && cardColor === 'purple',
                                'border-amber-500/50 text-amber-200/20 hover:bg-amber-500/10': !isEditingTarifa(tarifa.id) && cardColor === 'amber',
                                'border-slate-500/50 text-slate-400 hover:bg-slate-500/10': !isEditingTarifa(tarifa.id) && cardColor === 'slate'
                              }"
                              class="flex-1 inline-flex items-center justify-center h-9 rounded-lg border transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed gap-2"
                              [title]="isEditingTarifa(tarifa.id) ? 'Guardar' : 'Editar'">
                              @if (isSubmitting()) {
                                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                              }
                              @if (!isEditingTarifa(tarifa.id) && !isSubmitting()) {
                                <svg
                                  class="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              }
                              @if (isEditingTarifa(tarifa.id) && !isSubmitting()) {
                                <svg
                                  class="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                              }
                              <span class="text-xs font-medium">{{ isEditingTarifa(tarifa.id) ? 'Guardar' : 'Editar' }}</span>
                            </button>

                            <!-- Botón Cancelar -->
                            @if (isEditingTarifa(tarifa.id)) {
                              <button
                                type="button"
                                (click)="cancelEditTarifa(tarifa.id)"
                                class="flex-1 inline-flex items-center justify-center h-9 rounded-lg border border-red-600/50 text-red-400 hover:bg-red-600/10 transition-colors duration-200 gap-2"
                                title="Cancelar">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span class="text-xs font-medium">Cancelar</span>
                              </button>
                            }

                            <!-- Botón Eliminar -->
                            @if (!isEditingTarifa(tarifa.id)) {
                              <button
                                type="button"
                                (click)="deleteTarifa(tarifa)"
                                [disabled]="isSubmitting()"
                                class="flex-1 inline-flex items-center justify-center h-9 rounded-lg border border-red-600/50 text-red-400 hover:bg-red-600/10 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed gap-2"
                                title="Eliminar">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span class="text-xs font-medium">Eliminar</span>
                              </button>
                            }
                          </div>
                        </div>
                      </div>
                    </div>
              </div>
            }
          </div>
        </div>

        <!-- Loading -->
        @if (ratesLoading()) {
          <div class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }

        <!-- Empty State -->
        @if (!ratesLoading() && transversalRates().length === 0) {
          <div class="flex flex-col items-center justify-center py-12">
            <i class="fas fa-inbox text-6xl text-gray-400 mb-4"></i>
            <p class="text-gray-500 text-lg">No hay tarifas transversales configuradas</p>
          </div>
        }
      </div>
    </div>

    <!-- Modal de Creación -->
    @if (showCreateModal()) {
      <app-pop-up
        [open]="showCreateModal"
        [title]="'Nueva Tarifa Transversal'"
        [isConfirmation]="false"
        [maxWidth]="'max-w-md'"
      >
        <div class="space-y-4">
          <!-- Tipo de Uso -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
              Tipo de Uso <span class="text-red-500">*</span>
            </label>
            <select
              [(ngModel)]="newTarifa().tipoUsoId"
              class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 appearance-none cursor-pointer invalid:text-gray-400 dark:invalid:text-gray-500"
            >
              <option [ngValue]="null" class="text-gray-900 dark:text-white bg-white dark:bg-gray-700">Seleccione un tipo de uso</option>
              @for (uso of typeUseData(); track uso.id) {
                <option [ngValue]="uso.id" class="text-gray-900 dark:text-white bg-white dark:bg-gray-700 py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600">{{ uso.nombre }}</option>
              }
            </select>
          </div>

          <!-- Nombre -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
              Nombre <span class="text-red-500">*</span>
            </label>
            <select
              [(ngModel)]="newTarifa().tipoTarifaId"
              (ngModelChange)="onTipoTarifaChange($event)"
              class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 appearance-none cursor-pointer invalid:text-gray-400 dark:invalid:text-gray-500"
            >
              <option [ngValue]="null" class="text-gray-900 dark:text-white bg-white dark:bg-gray-700">Seleccione un nombre</option>
              @for (item of typeRatesData(); track item.id) {
                <option [ngValue]="item.id" class="text-gray-900 dark:text-white bg-white dark:bg-gray-700 py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600">{{ item.nombre }}</option>
              }

            </select>
          </div>

          <!-- Estrato -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
              Estrato <span class="text-red-500">*</span>
            </label>
            <input
              type="number"
              [(ngModel)]="newTarifa().estrato"
              placeholder="Ej: 1"
              min="0"
              max="6"
              class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40"
            />
          </div>

          <!-- Valor -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
              Valor <span class="text-red-500">*</span>
            </label>
            <input
              type="number"
              [(ngModel)]="newTarifa().valor"
              placeholder="Ej: 5000"
              min="0"
              class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40"
            />
          </div>

          <!-- Código (readonly, quemado) -->
          <!-- <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
              Código
            </label>
            <input
              type="text"
              [value]="newTarifa().codigo"
              readonly
              class="w-full px-4 py-3 bg-gray-100/50 dark:bg-slate-600/50 border border-white/20 dark:border-slate-600 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed backdrop-blur-md"
            />
          </div> -->

          <!-- Botones de acción -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              (click)="closeCreateModal()"
              [disabled]="isSubmitting()"
              class="px-6 py-2 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 backdrop-blur-md text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:border-gray-500/50 transition-all duration-300 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="button"
              (click)="createNewTarifa()"
              [disabled]="isSubmitting()"
              class="px-6 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 backdrop-blur-md text-blue-700 dark:text-blue-300 font-medium rounded-lg hover:border-blue-500/50 transition-all duration-300 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              @if (isSubmitting()) {
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              } @else {
                <i class="fas fa-save"></i>
                Guardar
              }
            </button>
          </div>
        </div>
      </app-pop-up>
    }


    <!-- Modal de Confirmación de Eliminación -->
    <app-confirm-delete-popup
      [isOpen]="showDeleteModal()"
      [isSubmitting]="isSubmitting()"
      [headerTitle]="'Confirmar Eliminación'"
      [confirmMessage]="'¿Está seguro de eliminar esta tarifa?'"
      [warningMessage]="'Esta acción no se puede deshacer.'"
      [itemLabel]="'Tarifa'"
      [itemName]="tarifaToDelete()?.nombre || ''"
      [confirmText]="'Eliminar'"
      [cancelText]="'Cancelar'"
      [loadingText]="'Eliminando...'"
      (confirm)="confirmDeleteTarifa()"
      (cancel)="closeDeleteModal()"
    />
  `,
})
export class TransversalRate {
  protected readonly transversalRatesService = inject(TransversalRatesService);
  protected readonly rateTypeService = inject(RateTypeService);
  protected readonly useService = inject(UseService);
  protected toast = inject(ToastService);
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  isSubmitting = signal<boolean>(false);
  showCreateModal = signal<boolean>(false);
  showDeleteModal = signal<boolean>(false);
  tarifaToDelete = signal<{ id: number; nombre: string } | null>(null);
  newTarifa = signal<{
    tipoUsoId: number | null;
    tipoTarifaId: number | null;
    estrato: number;
    valor: number;
    codigo: string;
  }>({
    tipoUsoId: null,
    tipoTarifaId: null,
    estrato: 0,
    valor: 0,
    codigo: ''
  });

  // Card controls
  expandedCard = signal<number | null>(null);

  // Estados de edición para cada tarifa
  editingTarifas = signal<Set<number>>(new Set());
  editValues = signal<{ [id: number]: { nombre: string; estrato: number; valor: number } }>({});

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

  readonly enterpriceId = computed(() => {
    const data = this.userData();
    const id = data?.empresaId || 0;
    return id;
  });

  readonly usuarioCreacion = computed(() => {
    const data = this.userData();
    const username = data?.nombre || '';
    return username;
  });

  // Cargar tipos de uso
  typeUse = rxResource({
    params: () => ({
      enterpriseId: this.enterpriceId()
    }),
    stream: ({ params }) => {
      if (!params.enterpriseId) {
        return of(null);
      }
      return this.useService.getTypeUse(params.enterpriseId).pipe(
        catchError(error => {
          return of(null);
        })
      );
    }
  });

  typeRates = rxResource({
    params: () => ({ enterpriseId: this.enterpriceId() }),
    stream: ({ params: { enterpriseId } }) => {
      if (!enterpriseId) {
        return of(null);
      }
      return this.rateTypeService.getRateTypes(enterpriseId).pipe(
        catchError((error) => {
          return of(null);
        })
      );
    }
  });

  typeUseData = computed(() => {
    try {
      const value = this.typeUse.value();
      return value?.response ?? [];
    } catch (error) {
      return [];
    }
  });

  typeRatesData = computed(() => {
    try {
      const value = this.typeRates.value();
      return value?.response ?? [];
    } catch (error) {
      return [];
    }
  });


  getAllRates = rxResource({
    params: () => ({
      idEnterprise: this.enterpriceId(),
    }),
    stream: ({ params }) => {
      if (!params.idEnterprise || params.idEnterprise === 0) {
        return of([]);
      }
      return this.transversalRatesService
        .getAllTransversalRates(params.idEnterprise)
        .pipe(
          catchError((error) => {
            return of([]);
          })
        );
    },
  });

  readonly ratesLoading = computed(() => this.getAllRates.isLoading());
  readonly transversalRates = computed(() => {
    const value = this.getAllRates.value();
    if (Array.isArray(value)) {
      return value;
    }
    if (value && typeof value === 'object' && 'response' in value) {
      return (value as any).response || [];
    }
    return [];
  });


  getCardColor(tarifa: TarifaTransversal): string {
    const nombre = (tarifa?.tipoTarifa?.nombre || '').toLowerCase();
    if (nombre.includes('acueducto')) {
      return 'sky';
    } else if (nombre.includes('aseo')) {
      return 'purple';
    } else if (nombre.includes('alcantarillado')) {
      return 'amber';
    }
    return 'slate';
  }


  getTarifaIcon(tarifa: TarifaTransversal): string {
    const nombre = (tarifa?.tipoTarifa?.nombre || '').toLowerCase();
    const baseClasses = 'text-5xl';

    if (nombre.includes('acueducto')) {
      return `fas fa-tint ${baseClasses}`;
    } else if (nombre.includes('aseo')) {
      return `fas fa-broom ${baseClasses}`;
    } else if (nombre.includes('alcantarillado')) {
      return `fas fa-toilet ${baseClasses}`;
    } else {
      return `fas fa-tasks ${baseClasses}`;
    }
  }


  getIconColorClasses(tarifa: TarifaTransversal): string {
    const nombre = (tarifa?.tipoTarifa?.nombre || '').toLowerCase();

    if (nombre.includes('acueducto')) {
      return 'text-sky-400';
    } else if (nombre.includes('aseo')) {
      return 'text-purple-400';
    } else if (nombre.includes('alcantarillado')) {
      return 'text-amber-400';
    } else {
      return 'text-gray-400';
    }
  }

  isEditingTarifa(id: number): boolean {
    return this.editingTarifas().has(id);
  }

  getEditData(tarifa: TarifaTransversal): { nombre: string; estrato: number; valor: number } {
    const values = this.editValues();
    if (values[tarifa.id]) {
      return values[tarifa.id];
    }
    return {
      nombre: tarifa.tipoTarifa?.nombre || '',
      estrato: tarifa.estrato,
      valor: tarifa.valor
    };
  }

  // Iniciar edición de una tarifa
  startEditTarifa(tarifa: TarifaTransversal): void {
    this.editValues.update(values => ({
      ...values,
      [tarifa.id]: {
        nombre: tarifa.tipoTarifa?.nombre || '',
        estrato: tarifa.estrato,
        valor: tarifa.valor
      }
    }));
    this.editingTarifas.update(editing => {
      const newSet = new Set(editing);
      newSet.add(tarifa.id);
      return newSet;
    });
  }

  // Cancelar edición de una tarifa
  cancelEditTarifa(id: number): void {
    this.editingTarifas.update(editing => {
      const newSet = new Set(editing);
      newSet.delete(id);
      return newSet;
    });
    this.editValues.update(values => {
      const newValues = { ...values };
      delete newValues[id];
      return newValues;
    });
  }

  // Guardar una tarifa específica
  saveTarifa(tarifa: TarifaTransversal): void {
    const values = this.editValues()[tarifa.id];
    if (!values || values.valor === null) {
      this.toast.error('Error', 'Por favor ingrese un valor válido.');
      return;
    }

    this.isSubmitting.set(true);

    // Para actualización, solo enviar id, valor y usuarioModificacion
    const tarifaData: any = {
      id: tarifa.id,
      valor: values.valor,
      usuarioModificacion: this.usuarioCreacion()
    };

    this.transversalRatesService.createTransversalRates(tarifaData).subscribe({
      next: (response) => {
        if (response?.success !== false) {
          this.toast.success('Éxito', 'Tarifa actualizada correctamente.');
          this.cancelEditTarifa(tarifa.id);
          this.isSubmitting.set(false);
          this.getAllRates.reload();
        } else {
          this.toast.error('Error', response?.message || 'No se pudo actualizar la tarifa.');
          this.isSubmitting.set(false);
        }
      },
      error: (err: any) => {
        console.error('Error al actualizar la tarifa:', err);
        const errorMessage = err?.error?.message || err?.message || 'No se pudo actualizar la tarifa. Por favor intente nuevamente.';
        this.toast.error('Error', errorMessage);
        this.isSubmitting.set(false);
      }
    });
  }

  // Abrir modal de confirmación de eliminación
  deleteTarifa(tarifa: TarifaTransversal): void {
    this.tarifaToDelete.set({ id: tarifa.id, nombre: tarifa.tipoTarifa?.nombre || '' });
    this.showDeleteModal.set(true);
  }

  // Cerrar modal de eliminación
  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.tarifaToDelete.set(null);
  }

  // Confirmar y ejecutar eliminación
  confirmDeleteTarifa(): void {
    const tarifa = this.tarifaToDelete();
    if (!tarifa) return;

    this.isSubmitting.set(true);

    this.transversalRatesService.deleteTransversalRates(tarifa.id).subscribe({
      next: (response) => {
        if (response?.success) {
          this.toast.success('Éxito', 'Tarifa eliminada correctamente.');
          this.isSubmitting.set(false);
          this.closeDeleteModal();
          this.getAllRates.reload();
          this.expandedCard.set(null);
        } else {
          this.toast.error('Error', response?.message || 'No se pudo eliminar la tarifa.');
          this.isSubmitting.set(false);
        }
      },
      error: (err: any) => {
        console.error('Error al eliminar tarifa:', err);
        const errorMessage = err?.error?.message || err?.message || 'Error al eliminar la tarifa. Por favor intente nuevamente.';
        this.toast.error('Error', errorMessage);
        this.isSubmitting.set(false);
      }
    });
  }

  toggleCard(cardIndex: number): void {
    if (this.expandedCard() === cardIndex) {
      this.expandedCard.set(null);
    } else {
      this.expandedCard.set(cardIndex);
    }
  }

  // Abrir modal de creación
  openCreateModal(): void {
    this.newTarifa.set({
      tipoUsoId: null,
      tipoTarifaId: null,
      estrato: 0,
      valor: 0,
      codigo: ''
    });
    this.showCreateModal.set(true);
  }

  // Actualizar código según el tipo de tarifa seleccionado
  onTipoTarifaChange(tipoTarifaId: number): void {
    const tipoTarifa = this.typeRatesData().find(t => t.id === tipoTarifaId);
    let nuevoCodigo = '';

    if (tipoTarifa) {
      const nombre = tipoTarifa.nombre.toLowerCase();
      if (nombre.includes('alcantarillado')) {
        nuevoCodigo = 'VLRALC';
      } else if (nombre.includes('acueducto')) {
        nuevoCodigo = 'VLRACU';
      } else if (nombre.includes('aseo')) {
        nuevoCodigo = 'VLRASE';
      } else {
        // Generar código basado en las primeras letras del nombre, ya sabemos que esta chamboncito pero con esto ya lo generamos dinmicamente
        nuevoCodigo = 'VLR' + tipoTarifa.nombre.substring(0, 3).toUpperCase();
      }
    }

    this.newTarifa.update(tarifa => ({
      ...tarifa,
      tipoTarifaId,
      codigo: nuevoCodigo
    }));
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  createNewTarifa(): void {
    const tarifa = this.newTarifa();

    if (!tarifa.tipoUsoId) {
      this.toast.error('Error', 'Por favor seleccione un tipo de uso.');
      return;
    }
    if (!tarifa.tipoTarifaId) {
      this.toast.error('Error', 'Por favor seleccione un tipo de tarifa.');
      return;
    }
    if (tarifa.estrato < 0 || tarifa.estrato > 6) {
      this.toast.error('Error', 'El estrato debe estar entre 0 y 6.');
      return;
    }
    if (tarifa.valor <= 0) {
      this.toast.error('Error', 'Por favor ingrese un valor válido.');
      return;
    }

    this.isSubmitting.set(true);

    const tipoUsoIdNumber = typeof tarifa.tipoUsoId === 'string' ? parseInt(tarifa.tipoUsoId) : tarifa.tipoUsoId;
    const tipoTarifaIdNumber = typeof tarifa.tipoTarifaId === 'string' ? parseInt(tarifa.tipoTarifaId) : tarifa.tipoTarifaId;

    const tipoTarifaSeleccionado = this.typeRatesData().find(t => t.id === tipoTarifaIdNumber);
    const nombreTarifa = tipoTarifaSeleccionado?.nombre || '';

    const tarifaData: TransversalRateRequest = {
      empresa: { id: this.enterpriceId() },
      tipoUso: { id: tipoUsoIdNumber! },
      tipoTarifa: { id: tipoTarifaIdNumber! },
      nombre: nombreTarifa,
      estrato: tarifa.estrato,
      valor: tarifa.valor,
      codigo: tarifa.codigo,
      usuarioCreacion: this.usuarioCreacion()
    };

    this.transversalRatesService.createTransversalRates(tarifaData).subscribe({
      next: (response) => {
        if (response?.success !== false) {
          this.toast.success('Éxito', 'Tarifa creada correctamente.');
          this.isSubmitting.set(false);
          this.closeCreateModal();
          this.getAllRates.reload();
        } else {
          this.toast.error('Error', response?.message || 'No se pudo crear la tarifa.');
          this.isSubmitting.set(false);
        }
      },
      error: (err: any) => {
        console.error('Error al crear la tarifa:', err);
        const errorMessage = err?.error?.message || err?.message || 'No se pudo crear la tarifa. Por favor intente nuevamente.';
        this.toast.error('Error', errorMessage);
        this.isSubmitting.set(false);
      }
    });
  }
}
