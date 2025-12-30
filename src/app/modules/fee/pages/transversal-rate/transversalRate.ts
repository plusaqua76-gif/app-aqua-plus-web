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
import { ConfirmDeletePopupComponent } from '@shared/index';

@Component({
  selector: 'app-transversal-rate',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ConfirmDeletePopupComponent],
  template: `
    <div
      class="min-h-screen  shadow-sm rounded-lg bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl  p-4"
    >
      <div class="max-w-7xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-200">
            Tarifas Transversales
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
              @let editData = getEditData(tarifa.id);
              <div class="flex-shrink-0 transition-all duration-300 relative">

                    <!-- Card Principal -->
                    <div [ngClass]="{
                      'bg-sky-700': getCardColor(idx) === 'sky',
                      'bg-emerald-700': getCardColor(idx) === 'emerald',
                      'bg-purple-700': getCardColor(idx) === 'purple',
                      'bg-amber-700': getCardColor(idx) === 'amber',
                      'shadow-sky-500': getCardColor(idx) === 'sky',
                      'shadow-emerald-500': getCardColor(idx) === 'emerald',
                      'shadow-purple-500': getCardColor(idx) === 'purple',
                      'shadow-amber-500': getCardColor(idx) === 'amber'
                    }"
                    class="rounded-2xl shadow-sm outline outline-slate-400 -outline-offset-8">
                      <div [ngClass]="{
                        'after:bg-sky-700': getCardColor(idx) === 'sky',
                        'after:bg-emerald-700': getCardColor(idx) === 'emerald',
                        'after:bg-purple-700': getCardColor(idx) === 'purple',
                        'after:bg-amber-700': getCardColor(idx) === 'amber',
                        'before:bg-sky-400': getCardColor(idx) === 'sky',
                        'before:bg-emerald-400': getCardColor(idx) === 'emerald',
                        'before:bg-purple-400': getCardColor(idx) === 'purple',
                        'before:bg-amber-400': getCardColor(idx) === 'amber'
                      }"
                      class="group overflow-hidden relative after:duration-500 before:duration-500 duration-500 hover:after:duration-500 hover:after:translate-x-24 hover:before:translate-y-12 hover:before:-translate-x-32 hover:duration-500 after:absolute after:w-24 after:h-24 after:rounded-full after:blur-xl after:bottom-32 after:right-16 before:absolute before:w-20 before:h-20 before:rounded-full before:blur-xl before:top-20 before:right-16 flex justify-center items-center h-56 w-80 bg-neutral-900 rounded-2xl outline outline-slate-400 -outline-offset-8">
                        <div class="z-10 flex flex-col items-center gap-2 w-full px-4">
                          <i [class]="tarifa.nombre.toLowerCase().includes('alcantarillado') ? 'fas fa-toilet text-slate-400 text-5xl' : 'fas fa-tint text-slate-400 text-5xl'"></i>
                          <p class="text-gray-50 text-center font-semibold text-lg">{{ tarifa.nombre }}</p>

                          <!-- Tipo de Uso y Estrato -->
                          <div class="flex items-center gap-3 text-xs text-gray-400">
                            <div class="flex items-center gap-1">
                              <i class="fas fa-tag text-gray-500"></i>
                              <span>{{ tarifa.tipoUso.nombre }}</span>
                            </div>
                            <span class="text-gray-600">|</span>
                            <div class="flex items-center gap-1">
                              <i class="fas fa-layer-group text-gray-500"></i>
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
                            'bg-sky-600 hover:bg-sky-500': getCardColor(idx) === 'sky',
                            'bg-emerald-600 hover:bg-emerald-500': getCardColor(idx) === 'emerald',
                            'bg-purple-600 hover:bg-purple-500': getCardColor(idx) === 'purple',
                            'bg-amber-600 hover:bg-amber-500': getCardColor(idx) === 'amber'
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
                        'border-sky-500/30': getCardColor(idx) === 'sky',
                        'border-emerald-500/30': getCardColor(idx) === 'emerald',
                        'border-purple-500/30': getCardColor(idx) === 'purple',
                        'border-amber-500/30': getCardColor(idx) === 'amber'
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
                              [placeholder]="tarifa.nombre"
                              [ngClass]="{
                                'focus:ring-sky-500': getCardColor(idx) === 'sky',
                                'focus:ring-emerald-500': getCardColor(idx) === 'emerald',
                                'focus:ring-purple-500': getCardColor(idx) === 'purple',
                                'focus:ring-amber-500': getCardColor(idx) === 'amber'
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
                              [placeholder]="tarifa.estrato.toString()"
                              [ngClass]="{
                                'focus:ring-sky-500': getCardColor(idx) === 'sky',
                                'focus:ring-emerald-500': getCardColor(idx) === 'emerald',
                                'focus:ring-purple-500': getCardColor(idx) === 'purple',
                                'focus:ring-amber-500': getCardColor(idx) === 'amber'
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
                              [placeholder]="tarifa.valor.toString()"
                              [ngClass]="{
                                'focus:ring-sky-500': getCardColor(idx) === 'sky',
                                'focus:ring-emerald-500': getCardColor(idx) === 'emerald',
                                'focus:ring-purple-500': getCardColor(idx) === 'purple',
                                'focus:ring-amber-500': getCardColor(idx) === 'amber'
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
                                'border-sky-600/50 text-sky-400 hover:bg-sky-600/10': !isEditingTarifa(tarifa.id) && getCardColor(idx) === 'sky',
                                'border-emerald-600/50 text-emerald-400 hover:bg-emerald-600/10': !isEditingTarifa(tarifa.id) && getCardColor(idx) === 'emerald',
                                'border-purple-600/50 text-purple-400 hover:bg-purple-600/10': !isEditingTarifa(tarifa.id) && getCardColor(idx) === 'purple',
                                'border-amber-600/50 text-amber-400 hover:bg-amber-600/10': !isEditingTarifa(tarifa.id) && getCardColor(idx) === 'amber'
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
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="sticky top-0 bg-gradient-to-r from-[#2563eb00] to-blue-500 px-6 py-4 rounded-t-2xl">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-white flex items-center gap-2">
              <i class="fas fa-plus-circle"></i>
              Nueva Tarifa Transversal
            </h3>
            <button
              (click)="closeCreateModal()"
              class="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
            >
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-4">
          <!-- Tipo de Uso -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
              Tipo de Uso <span class="text-red-500">*</span>
            </label>
            <select
              [(ngModel)]="newTarifa().tipoUsoId"
              class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 appearance-none cursor-pointer invalid:text-gray-400 dark:invalid:text-gray-500"
            >
              <option [value]="null" class="text-gray-900 dark:text-white bg-white dark:bg-gray-700">Seleccione un tipo de uso</option>
              @for (uso of typeUseData(); track uso.id) {
                <option [value]="uso.id" class="text-gray-900 dark:text-white bg-white dark:bg-gray-700 py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600">{{ uso.nombre }}</option>
              }
            </select>
          </div>

          <!-- Nombre -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
              Nombre <span class="text-red-500">*</span>
            </label>
            <select
              [(ngModel)]="newTarifa().nombre"
              (ngModelChange)="onNombreChange($event)"
              class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 appearance-none cursor-pointer invalid:text-gray-400 dark:invalid:text-gray-500"
            >
              <option value="" class="text-gray-900 dark:text-white bg-white dark:bg-gray-700">Seleccione un nombre</option>
              <option value="Alcantarillado" class="text-gray-900 dark:text-white bg-white dark:bg-gray-700 py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600">Alcantarillado</option>
              <option value="Acueducto" class="text-gray-900 dark:text-white bg-white dark:bg-gray-700 py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600">Acueducto</option>
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
        </div>

        <!-- Modal Footer -->
        <div class="sticky bottom-0 bg-white/10 dark:bg-slate-700/30 backdrop-blur-md border-t border-white/20 dark:border-slate-600/30 px-6 py-4 rounded-b-2xl flex gap-3">
          <button
            (click)="closeCreateModal()"
            class="flex-1 px-4 py-3 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md text-gray-900 dark:text-white hover:bg-white/20 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 font-semibold"
          >
            Cancelar
          </button>
          <button
            (click)="createNewTarifa()"
            [disabled]="isSubmitting()"
            class="flex-1 px-4 py-3 bg-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-105"
          >
            @if (isSubmitting()) {
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            }
            <span>{{ isSubmitting() ? 'Guardando...' : 'Guardar' }}</span>
          </button>
        </div>
      </div>

    </div>
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
    nombre: string;
    estrato: number;
    valor: number;
    codigo: string;
  }>({
    tipoUsoId: null,
    nombre: '',
    estrato: 0,
    valor: 0,
    codigo: ''
  });

  // Card controls
  expandedCard = signal<number | null>(null);

  // Estados de edición para cada tarifa
  editingTarifas = signal<Set<number>>(new Set());
  editValues = signal<{ [id: number]: { nombre: string; estrato: number; valor: number } }>({});

  // Colores para las cards (rotan entre estos)
  readonly cardColors = ['sky', 'emerald', 'purple', 'amber'];

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

  typeUseData = computed(() => {
    try {
      const value = this.typeUse.value();
      return value?.response ?? [];
    } catch (error) {
      return [];
    }
  });

  // Cargar todas las tarifas transversales
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
            console.error('Error al cargar tarifas:', error);
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

  getCardColor(index: number): string {
    return this.cardColors[index % this.cardColors.length];
  }


  isEditingTarifa(id: number): boolean {
    return this.editingTarifas().has(id);
  }

  // Obtener datos de edición para una tarifa
  getEditData(id: number): { nombre: string; estrato: number; valor: number } {
    const values = this.editValues();
    return values[id] || { nombre: '', estrato: 0, valor: 0 };
  }

  // Iniciar edición de una tarifa
  startEditTarifa(tarifa: TarifaTransversal): void {
    this.editValues.update(values => ({
      ...values,
      [tarifa.id]: {
        nombre: tarifa.nombre,
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
      next: () => {
        this.toast.success('Éxito', 'Tarifa actualizada correctamente.');
        this.cancelEditTarifa(tarifa.id);
        this.isSubmitting.set(false);
        this.getAllRates.reload();
      },
      error: (err: any) => {
        console.error('Error al actualizar la tarifa:', err);
        this.toast.error('Error', 'No se pudo actualizar la tarifa.');
        this.isSubmitting.set(false);
      }
    });
  }

  // Abrir modal de confirmación de eliminación
  deleteTarifa(tarifa: TarifaTransversal): void {
    this.tarifaToDelete.set({ id: tarifa.id, nombre: tarifa.nombre });
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
      next: () => {
        this.toast.success('Éxito', 'Tarifa eliminada correctamente.');
        this.isSubmitting.set(false);
        this.closeDeleteModal();
        this.getAllRates.reload();
        this.expandedCard.set(null);
      },
      error: (err: any) => {
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
      nombre: '',
      estrato: 0,
      valor: 0,
      codigo: ''
    });
    this.showCreateModal.set(true);
  }

  // Actualizar código según el nombre seleccionado
  onNombreChange(nombre: string): void {
    let nuevoCodigo = '';
    if (nombre === 'Alcantarillado') {
      nuevoCodigo = 'VLRALC';
    } else if (nombre === 'Acueducto') {
      nuevoCodigo = 'VLRACU';
    }

    this.newTarifa.update(tarifa => ({
      ...tarifa,
      nombre,
      codigo: nuevoCodigo
    }));
  }

  // Cerrar modal de creación
  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  // Crear nueva tarifa
  createNewTarifa(): void {
    const tarifa = this.newTarifa();

    // Validaciones
    if (!tarifa.tipoUsoId) {
      this.toast.error('Error', 'Por favor seleccione un tipo de uso.');
      return;
    }
    if (!tarifa.nombre.trim()) {
      this.toast.error('Error', 'Por favor ingrese un nombre.');
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

    const tarifaData: TransversalRateRequest = {
      empresa: { id: this.enterpriceId() },
      tipoUso: { id: tarifa.tipoUsoId },
      nombre: tarifa.nombre,
      estrato: tarifa.estrato,
      valor: tarifa.valor,
      codigo: tarifa.codigo,
      usuarioCreacion: this.usuarioCreacion()
    };

    this.transversalRatesService.createTransversalRates(tarifaData).subscribe({
      next: () => {
        this.toast.success('Éxito', 'Tarifa creada correctamente.');
        this.isSubmitting.set(false);
        this.closeCreateModal();
        this.getAllRates.reload();
      },
      error: (err: any) => {
        console.error('Error al crear la tarifa:', err);
        this.toast.error('Error', 'No se pudo crear la tarifa.');
        this.isSubmitting.set(false);
      }
    });
  }
}
