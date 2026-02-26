import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConceptRateService } from '../../services/concept-rate.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PopupComponent } from '../../../../shared/components/popUp';
import { ToastService } from '@services/toast.service';


@Component({
  selector: 'app-concept-rate-enterpice',
  imports: [CommonModule, PopupComponent, FormsModule],
  styles: [`
    :host ::ng-deep app-pop-up #overlay {
      background: rgba(0, 0, 0, 0.8) !important;
      --tw-backdrop-blur: blur(var(--blur-sm));
      -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
      backdrop-filter: var(--tw-backdrop-blur, ) var(--tw-backdrop-brightness, ) var(--tw-backdrop-contrast, ) var(--tw-backdrop-grayscale, ) var(--tw-backdrop-hue-rotate, ) var(--tw-backdrop-invert, ) var(--tw-backdrop-opacity, ) var(--tw-backdrop-saturate, ) var(--tw-backdrop-sepia, );
    }

    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .modal-animate {
      animation: modalSlideIn 0.3s ease-out;
    }
  `],
  template: `
    <section class="w-full bg-transparent text-gray-200">
      <div class="w-full px-2 pb-4">
        <div>
          <!-- Header with title and search -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 class="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight">
              Lista de Conceptos de Tarifa
            </h2>

            <!-- Search bar -->
            <div class="relative w-full sm:w-80">
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <input
                type="text"
                [(ngModel)]="searchTerm"
                placeholder="Buscar por tarifa, concepto o código..."
                class="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-xl text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              />
              @if (searchTerm()) {
                <button
                  (click)="searchTerm.set('')"
                  class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200 transition-colors"
                  title="Limpiar búsqueda">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              }
            </div>
          </div>
        @if (dataConceptRate.isLoading()) {
          <div class="rounded-xl border border-gray-600/70 bg-transparent p-8 text-center">
            <div class="flex items-center justify-center space-x-2">
              <div class="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
              <div class="w-4 h-4 bg-blue-500 rounded-full animate-pulse" style="animation-delay: 0.1s"></div>
              <div class="w-4 h-4 bg-blue-500 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
            </div>
            <p class="text-gray-400 mt-4">Cargando conceptos de tarifa...</p>
          </div>
        }

        <!-- Error state -->
        @else if (dataConceptRate.error()) {
          <div class="rounded-xl border border-red-600/70 bg-red-500/10 p-8 text-center">
            <div class="flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <p class="text-red-400 mb-4">Error al cargar los conceptos de tarifa</p>
            <button
              (click)="reloadData()"
              class="inline-flex items-center px-4 py-2 border border-red-600/70 rounded-lg text-red-400 hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500/40">
              Reintentar
            </button>
          </div>
        }

        <!-- Content -->
        @else {
          <div class="space-y-6">
            @if (conceptRatesData().length === 0) {
              <div class="rounded-xl border border-gray-600/70 bg-transparent p-8 text-center">
                <div class="flex items-center justify-center mb-4">
                  @if (searchTerm()) {
                    <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                  } @else {
                    <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  }
                </div>
                <p class="text-gray-400 text-lg">
                  @if (searchTerm()) {
                    No se encontraron resultados
                  } @else {
                    No hay conceptos de tarifa configurados
                  }
                </p>
                <p class="text-gray-500 text-sm mt-2">
                  @if (searchTerm()) {
                    Intenta con otros términos de búsqueda
                  } @else {
                    Configure conceptos de tarifa para esta empresa
                  }
                </p>
              </div>
            } @else {
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                @for (conceptRate of conceptRatesData(); track conceptRate.id) {
                  <div class="group relative rounded-2xl border border-gray-600/50 bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl p-5 flex flex-col hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-1">

                    <!-- Header -->
                    <div class="mb-4">
                      <h3 class="text-xl font-bold text-white mb-2">
                        {{ conceptRate.tipoTarifa.nombre }}
                      </h3>
                      <p class="text-sm text-gray-400">
                        {{ conceptRate.tipoConcepto.descripcion }}
                      </p>
                    </div>

                    <!-- Divider -->
                    <div class="h-px bg-gradient-to-r from-transparent via-gray-600/50 to-transparent mb-3"></div>

                    <!-- IndCalcularMc Badge (if true) -->
                    @if (conceptRate.indCalcularMc) {
                      <div class="mb-3">
                        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/10 to-cyan-600/10 border border-cyan-500/30">
                          <svg class="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                          </svg>
                          <span class="text-xs font-medium text-cyan-300">
                            Calcula M³ automáticamente
                          </span>
                        </div>
                      </div>
                    }

                    <!-- Price Section -->
                    <div class="flex-1">
                      @if (conceptRate.porEstrato && conceptRate.estratos && conceptRate.estratos.length > 0) {
                        <!-- Estratos Layout -->
                        <div class="space-y-2">
                          <div class="flex items-center gap-2 mb-3">
                            <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                            </svg>
                            <span class="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Por Estrato</span>
                          </div>

                          <div class="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
                            @for (estrato of conceptRate.estratos; track estrato.id) {
                              <div class="flex items-center justify-between py-2 border-b border-gray-700/30 last:border-0">
                                <div class="flex items-center gap-2">
                                  <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
                                    <span class="text-xs font-bold text-emerald-300">{{estrato.estrato}}</span>
                                  </div>
                                  <span class="text-xs text-gray-400 font-medium">Estrato {{estrato.estrato}}</span>
                                </div>
                                <div class="text-right">
                                  <div class="text-base font-bold text-emerald-400">
                                    $ {{ estrato.valor | number:'1.2-2' }}
                                  </div>
                                  <span class="text-[10px] text-gray-500 uppercase">COP</span>
                                </div>
                              </div>
                            }
                          </div>
                        </div>
                      } @else if (conceptRate.valor) {
                        <!-- Single Value Layout -->
                        <div class="relative">
                          <div class="flex items-center gap-2 mb-2">
                            <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <span class="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Valor Tarifa</span>
                          </div>

                          <div class="bg-gradient-to-br from-emerald-900/60 to-emerald-500/0 rounded-xl p-4 border border-transparent">
                            <div class="flex items-baseline gap-2">
                              <span class="text-3xl font-black text-gray-500]">
                                $ {{ conceptRate.valor | number:'1.2-2' }}
                              </span>
                            </div>
                            <span class="text-xs text-emerald-300/60 uppercase tracking-wider mt-1 block">COP</span>
                          </div>
                        </div>
                      } @else {
                        <div class="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50 text-center">
                          <svg class="w-8 h-8 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          <span class="text-sm text-gray-500">Sin valor configurado</span>
                        </div>
                      }
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex gap-2 mt-4">
                      <button
                        (click)="editConceptRate(conceptRate.id)"
                        class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/50 rounded-xl text-blue-400 font-medium text-sm transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20"
                        title="Editar concepto">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                        <span class="hidden sm:inline">Editar</span>
                      </button>

                      <button
                        (click)="deleteConceptRate(conceptRate.id)"
                        class="inline-flex items-center justify-center px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-xl text-red-400 font-medium text-sm transition-all duration-200 hover:shadow-lg hover:shadow-red-500/20"
                        title="Eliminar concepto">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }
        </div>
      </div>
    </section>

    <!-- Modal de confirmación para eliminar concepto de tarifa -->
    @if (showDeleteConfirm()) {
      <div class="fixed inset-0 z-[1200] overflow-y-auto">
        <div class="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"></div>

        <div class="flex min-h-full items-center justify-center p-4">
          <div class="modal-animate relative w-full max-w-md bg-gradient-to-br from-red-950/95 via-gray-950/90 to-black/95 backdrop-blur-xl border border-red-500/30 rounded-2xl shadow-2xl shadow-red-500/20 transition-all">
            
            <!-- Icono de advertencia -->
            <div class="flex justify-center pt-8 pb-4">
              <div class="rounded-full bg-red-500/10 p-4 border-2 border-red-500/30">
                <svg class="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
            </div>

            <!-- Contenido -->
            <div class="px-6 pb-6 text-center">
              <h3 class="text-2xl font-bold text-white mb-3">
                ¿Eliminar concepto de tarifa?
              </h3>
              <p class="text-gray-300 text-sm mb-2">
                @if (conceptRateToDelete) {
                  ¿Está seguro que desea eliminar el concepto "<span class="font-semibold text-red-400">{{ getConceptRateName() }}</span>"?
                } @else {
                  ¿Está seguro que desea eliminar este concepto de tarifa?
                }
              </p>
              <p class="text-gray-400 text-xs mb-6">
                Esta acción no se puede deshacer.
              </p>

              <!-- Botones -->
              <div class="flex gap-3 justify-center">
                <button
                  type="button"
                  (click)="cancelDeleteConceptRate()"
                  [disabled]="deletingConceptRate()"
                  class="px-6 py-2.5 bg-gray-700/50 hover:bg-gray-700 border border-gray-600/50 hover:border-gray-500 rounded-xl text-gray-300 hover:text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]">
                  Cancelar
                </button>
                <button
                  type="button"
                  (click)="confirmDeleteConceptRate()"
                  [disabled]="deletingConceptRate()"
                  class="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 border border-red-500/50 rounded-xl text-white font-medium transition-all duration-200 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] relative">
                  @if (deletingConceptRate()) {
                    <svg class="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  } @else {
                    Eliminar
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Popup de edición de concepto de tarifa -->
    @if (showEditPopup()) {
      <div class="fixed inset-0 z-[1002] flex items-center justify-center p-2 sm:p-4 pt-16 sm:pt-20">
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm" (click)="closeEditPopup()"></div>

        <div class="relative w-full max-w-2xl max-h-[calc(100vh-5rem)] sm:max-h-[calc(100vh-6rem)] flex flex-col bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl border-2 border-white/10 rounded-2xl sm:rounded-3xl shadow-xl" (click)="$event.stopPropagation()">

          <!-- Header fijo -->
          <div class="flex-shrink-0 relative p-4 sm:p-6 pb-2 sm:pb-4 border-b border-white/10">
            <!-- Botón de cerrar -->
            <button
              (click)="closeEditPopup()"
              aria-label="Close"
              class="absolute top-2 right-2 sm:top-3 sm:right-3 h-8 w-8 grid place-content-center text-gray-400 hover:bg-white/10 rounded-lg backdrop-blur-sm z-10"
            >
              <svg class="h-3 w-3" viewBox="0 0 14 14" fill="none">
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
            </button>

            <!-- Título del modal -->
            <h3 class="text-lg sm:text-xl font-semibold text-white text-center pr-8">
              Editar Concepto de Tarifa
            </h3>

            <!-- Información del concepto -->
            @if (editingConceptRate) {
              <div class="mt-4 p-3 sm:p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <h4 class="text-sm font-medium text-gray-300 mb-2">Información del Concepto</h4>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-gray-400">Tipo de Tarifa:</span>
                    <p class="text-white font-medium">{{ editingConceptRate.tipoTarifa.nombre }}</p>
                  </div>
                  <div>
                    <span class="text-gray-400">Tipo de Concepto:</span>
                    <p class="text-white font-medium">{{ editingConceptRate.tipoConcepto.descripcion }}</p>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Contenido con scroll -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-6 pt-2 sm:pt-4">
            @if (editingConceptRate) {
              <div class="space-y-6">
                <!-- Toggle para tipo de tarifa -->
                <div class="flex items-center space-x-3">
                  <label class="flex items-center">
                    <input
                      type="radio"
                      [(ngModel)]="editForm.porEstrato"
                      [value]="false"
                      name="tipoTarifa"
                      class="form-radio text-blue-600"
                    >
                    <span class="ml-2 text-gray-300">Valor único</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      type="radio"
                      [(ngModel)]="editForm.porEstrato"
                      [value]="true"
                      name="tipoTarifa"
                      class="form-radio text-blue-600"
                    >
                    <span class="ml-2 text-gray-300">Por estratos</span>
                  </label>
                </div>

                <!-- Campo valor único -->
                @if (!editForm.porEstrato) {
                  <div class="space-y-4">
                    <div>
                      <label class="block mb-2 text-sm font-medium text-gray-300">Valor</label>
                      <input
                        type="number"
                        [(ngModel)]="editForm.valor"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        class="block w-full rounded-lg border border-gray-600/70 bg-transparent px-3 py-2 text-sm text-gray-100 placeholder-gray-400 outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-400/40"
                      >
                    </div>

                    <!-- Checkbox para indCalcularMc -->
                    <div>
                      <label class="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          [(ngModel)]="editForm.indCalcularMc"
                          class="w-4 h-4 text-blue-600 bg-transparent border border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span>Calcular metros cubicos automáticamente</span>
                      </label>
                    </div>
                  </div>
                }

                <!-- Estratos -->
                @if (editForm.porEstrato) {
                  <div class="space-y-4">
                    <h4 class="text-sm font-medium text-gray-300">Estratos</h4>

                    <!-- Lista de estratos -->
                    @if (editForm.estratos.length > 0) {
                      <div class="space-y-2">
                        @for (estrato of editForm.estratos; track estrato.estrato) {
                          <div class="flex items-center space-x-3 p-2 bg-gray-800/30 rounded">
                            <span class="text-sm text-gray-400 w-16">Estrato {{ estrato.estrato }}:</span>
                            <input
                              type="number"
                              [value]="estrato.valor"
                              (input)="updateEstratoInEdit(estrato.estrato, +$any($event.target).value)"
                              min="0"
                              step="0.01"
                              class="w-20 sm:flex-1 rounded border border-gray-600/70 bg-transparent px-2 py-1 text-sm text-gray-100 outline-none focus:border-gray-300"
                            >
                            <button
                              type="button"
                              (click)="removeEstratoFromEdit(estrato.estrato)"
                              class="text-red-400 hover:text-red-300"
                              title="Eliminar estrato"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                          </div>
                        }
                      </div>
                    } @else {
                      <p class="text-gray-400 text-sm">No hay estratos configurados</p>
                    }

                    <!-- Agregar nuevo estrato -->
                    <div class="flex items-end space-x-2">
                      <div class="w-20 sm:flex-1">
                        <label class="block text-xs text-gray-400 mb-1">Estrato</label>
                        <input
                          type="number"
                          #nuevoEstrato
                          min="1"
                          max="6"
                          [value]="getSiguienteEstratoDisponible()"
                          placeholder="1"
                          class="block w-full rounded border border-gray-600/70 bg-transparent px-2 py-1 text-sm text-gray-100"
                        >
                      </div>
                      <div class="w-20 sm:flex-1">
                        <label class="block text-xs text-gray-400 mb-1">Valor</label>
                        <input
                          type="number"
                          #nuevoValor
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          class="block w-full rounded border border-gray-600/70 bg-transparent px-2 py-1 text-sm text-gray-100"
                        >
                      </div>
                      <button
                        type="button"
                        (click)="addEstratoToEdit(+nuevoEstrato.value, +nuevoValor.value); nuevoEstrato.value = getSiguienteEstratoDisponible().toString(); nuevoValor.value = ''"
                        class="w-50 sm:px-3 px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Agregar
                      </button>
                    </div>

                    <!-- Checkbox para indCalcularMc en estratos -->
                    <div class="mt-4">
                      <label class="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          [(ngModel)]="editForm.indCalcularMc"
                          class="w-4 h-4 text-blue-600 bg-transparent border border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span>Calcular MC automáticamente</span>
                      </label>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Footer fijo con botones -->
          <div class="flex-shrink-0 p-4 sm:p-6 pt-2 sm:pt-4 border-t border-white/10">
            <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                type="button"
                (click)="closeEditPopup()"
                class="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-medium text-gray-300 bg-transparent border border-gray-600/70 rounded-lg hover:bg-gray-600/10 focus:outline-none focus:ring-2 focus:ring-gray-500/40 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="updateConceptRate()"
                [disabled]="updatingConceptRate() || (!editForm.porEstrato && !editForm.valor) || (editForm.porEstrato && editForm.estratos.length === 0)"
                class="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                @if (updatingConceptRate()) {
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Actualizando...
                } @else {
                  Actualizar
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Popup de confirmación de eliminación de estrato -->
    @if (showDeleteConfirmEstrato()) {
      <app-pop-up
        [open]="showDeleteConfirmEstrato"
        [isConfirmation]="true"
        title="Eliminar Estrato"
        [message]="getDeleteConfirmMessageEstrato()"
        confirmText="Eliminar"
        cancelText="Cancelar"
        (confirmAction)="confirmDeleteEstrato()"
        (cancelAction)="cancelDeleteEstrato()"
      >
      </app-pop-up>
    }
  `
  ,
})
export class ConceptRateEnterpice {

  readonly conceptRateService = inject(ConceptRateService);
  protected readonly toastService = inject(ToastService);

  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);


  showDeleteConfirm = signal(false);
  conceptRateToDelete: any = null;
  deletingConceptRate = signal(false);


  showEditPopup = signal(false);
  editingConceptRate: any = null;
  updatingConceptRate = signal(false);

  showDeleteConfirmEstrato = signal(false);
  estratoToDelete: { estrato: number; valor: number } | null = null;

  // Search functionality
  searchTerm = signal('');

  editForm = {
    valor: null as number | null,
    estratos: [] as any[],
    porEstrato: false,
    indCalcularMc: true
  };

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


  readonly nombreUsuario = computed(() => {
    const data = this.userData();
    return data?.nombre || null;
  });

  dataConceptRate = rxResource({
    params: () => ({ enterpriseId: this.empresaId() }),
    stream: ({ params: { enterpriseId } }) =>
      enterpriseId
        ? this.conceptRateService.getConceptRateByEnterprise(enterpriseId).pipe(
            catchError(error => {
              console.error('Error al cargar conceptos de tarifa:', error);
              return of({ success: false, response: [], message: 'Error al cargar conceptos de tarifa' });
            })
          )
        : EMPTY
  })

conceptRatesData = computed(() => {
  const data = this.dataConceptRate.value()?.response ?? [];
  const search = this.searchTerm().toLowerCase().trim();

  if (!search) {
    return data;
  }

  return data.filter(conceptRate => {
    const tipoTarifaNombre = conceptRate.tipoTarifa?.nombre?.toLowerCase() || '';
    const tipoTarifaCodigo = conceptRate.tipoTarifa?.codigo?.toLowerCase() || '';
    const tipoConceptoDesc = conceptRate.tipoConcepto?.descripcion?.toLowerCase() || '';
    const tipoConceptoCodigo = conceptRate.tipoConcepto?.codigo?.toLowerCase() || '';

    return tipoTarifaNombre.includes(search) ||
           tipoTarifaCodigo.includes(search) ||
           tipoConceptoDesc.includes(search) ||
           tipoConceptoCodigo.includes(search);
  });
});

  reloadData(): void {
    this.dataConceptRate.reload();
  }

  totalConceptRates = computed(() => this.conceptRatesData().length);

  averageValue = computed(() => {
    const data = this.conceptRatesData();
    if (data.length === 0) return 0;
    const total = data.reduce((sum, item) => sum + (item.valor || 0), 0);
    return total / data.length;
  });

  editConceptRate(id: number): void {
    const conceptRate = this.conceptRatesData().find(cr => cr.id === id);
    if (conceptRate) {
      this.editingConceptRate = conceptRate;

      // Copiar datos al formulario
      this.editForm = {
        valor: conceptRate.valor || null,
        estratos: conceptRate.estratos ? [...conceptRate.estratos] : [],
        porEstrato: conceptRate.porEstrato || false,
        indCalcularMc: conceptRate.indCalcularMc ?? true
      };

      this.showEditPopup.set(true);
    }
  }

  deleteConceptRate(id: number): void {
    // Buscar el concepto de tarifa para mostrar su información en el popup
    const conceptRate = this.conceptRatesData().find(cr => cr.id === id);
    this.conceptRateToDelete = conceptRate;
    this.showDeleteConfirm.set(true);
  }

  getDeleteConfirmMessage(): string {
    if (!this.conceptRateToDelete) {
      return '¿Está seguro que desea eliminar este concepto de tarifa?';
    }

    const tipoTarifa = this.conceptRateToDelete.tipoTarifa?.nombre || 'Sin nombre';
    const tipoConcepto = this.conceptRateToDelete.tipoConcepto?.descripcion || 'Sin descripción';

    return `¿Está seguro que desea eliminar el concepto de tarifa "${tipoTarifa} - ${tipoConcepto}"? Esta acción no se puede deshacer.`;
  }

  getConceptRateName(): string {
    if (!this.conceptRateToDelete) {
      return '';
    }
    const tipoTarifa = this.conceptRateToDelete.tipoTarifa?.nombre || 'Sin nombre';
    const tipoConcepto = this.conceptRateToDelete.tipoConcepto?.descripcion || 'Sin descripción';
    return `${tipoTarifa} - ${tipoConcepto}`;
  }

  confirmDeleteConceptRate(): void {
    if (this.conceptRateToDelete?.id) {
      this.deletingConceptRate.set(true);
      this.conceptRateService.deleteConceptRate(this.conceptRateToDelete.id).subscribe({
        next: (response) => {
          this.deletingConceptRate.set(false);
          if (response.success) {
            this.dataConceptRate.reload();
            this.toastService.success(
              'Éxito',
              'Concepto de tarifa eliminado exitosamente'
            );
            this.showDeleteConfirm.set(false);
            this.conceptRateToDelete = null;
          } else {
            this.toastService.error(
              'Error',
              'El concepto de tarifa no se pudo eliminar'
            );
          }
        },
        error: (error) => {
          this.deletingConceptRate.set(false);
          console.error('Error al eliminar el concepto de tarifa:', error);
          this.toastService.error(
            'Error',
            'El concepto de tarifa no se pudo eliminar. Inténtelo de nuevo.'
          );
        }
      });
    }
  }

  cancelDeleteConceptRate(): void {
    if (!this.deletingConceptRate()) {
      this.showDeleteConfirm.set(false);
      this.conceptRateToDelete = null;
    }
  }

  // Métodos para el popup de edición
  closeEditPopup(): void {
    this.showEditPopup.set(false);
    this.editingConceptRate = null;
    this.updatingConceptRate.set(false);
    this.resetEditForm();
  }

  resetEditForm(): void {
    this.editForm = {
      valor: null,
      estratos: [],
      porEstrato: false,
      indCalcularMc: true
    };
  }

  updateConceptRate(): void {
    if (!this.editingConceptRate) return;

    const empresaId = this.empresaId();
    const usuario = this.nombreUsuario();

    if (!empresaId || !usuario) {
      this.toastService.error('Error', 'No se pudo obtener la información del usuario o empresa');
      return;
    }

    // Validaciones
    if (!this.editForm.porEstrato && !this.editForm.valor) {
      this.toastService.error('Error', 'Por favor, ingrese un valor para el concepto');
      return;
    }

    if (this.editForm.porEstrato && this.editForm.estratos.length === 0) {
      this.toastService.error('Error', 'Por favor, agregue al menos un estrato');
      return;
    }

    this.updatingConceptRate.set(true);

    // Construir payload según el tipo seleccionado
    let payload: any = {
      idTarifaConcepto: this.editingConceptRate.id,
      usuarioModificacion: usuario,
      indCalcularMc: this.editForm.indCalcularMc
    };

    if (this.editForm.porEstrato) {
      // Payload para actualización por estratos
      payload.estratos = this.editForm.estratos.map(estrato => ({
        estrato: estrato.estrato,
        valor: estrato.valor
      }));
    } else {
      // Payload para valor único
      payload.valor = this.editForm.valor;
    }

    // Llamar al servicio con el nuevo endpoint
    this.conceptRateService.updateConcepRateStratum(payload).subscribe({
      next: (response) => {
        this.updatingConceptRate.set(false); // Resetear loading state aquí
        if (response.success) {
          this.toastService.success('Éxito', 'Concepto de tarifa actualizado correctamente');
          this.closeEditPopup();
          this.reloadData();
        } else {
          this.toastService.error('Error', response.message || 'Error al actualizar el concepto de tarifa');
        }
      },
      error: (error) => {
        this.updatingConceptRate.set(false);
      }
    });
  }

  // Métodos para manejar estratos en edición
  getSiguienteEstratoDisponible(): number {
    const estratosExistentes = this.editForm.estratos.map(e => e.estrato).sort((a, b) => a - b);
    for (let i = 1; i <= 6; i++) {
      if (!estratosExistentes.includes(i)) {
        return i;
      }
    }
    return 1; // Si todos están ocupados, devolver 1
  }

  addEstratoToEdit(estrato: number, valor: number): void {
    if (!estrato || estrato < 1 || estrato > 6) {
      this.toastService.error('Error', 'El estrato debe ser un número entre 1 y 6');
      return;
    }
    if (valor < 0) {
      this.toastService.error('Error', 'El valor no puede ser negativo');
      return;
    }

    const existe = this.editForm.estratos.find(e => e.estrato === estrato);
    if (existe) {
      this.toastService.error('Error', `El estrato ${estrato} ya existe`);
      return;
    }

    if (valor > 0) {
      this.editForm.estratos.push({ estrato, valor });
      this.editForm.estratos.sort((a, b) => a.estrato - b.estrato);
    } else {
      this.toastService.error('Error', 'El valor debe ser mayor que 0');
    }
  }

  removeEstratoFromEdit(estrato: number): void {
    const estratoObj = this.editForm.estratos.find(e => e.estrato === estrato);
    if (estratoObj) {
      this.estratoToDelete = { estrato: estratoObj.estrato, valor: estratoObj.valor };
      this.showDeleteConfirmEstrato.set(true);
    }
  }

  updateEstratoInEdit(estrato: number, valor: number): void {
    const estratoObj = this.editForm.estratos.find(e => e.estrato === estrato);
    if (estratoObj) {
      estratoObj.valor = valor;
    }
  }

  // Métodos para confirmación de eliminación de estrato
  getDeleteConfirmMessageEstrato(): string {
    return this.estratoToDelete
      ? `¿Está seguro que desea eliminar el estrato ${this.estratoToDelete.estrato} con valor $${this.estratoToDelete.valor.toLocaleString()}? Esta acción no se puede deshacer.`
      : '¿Está seguro que desea eliminar este estrato?';
  }

  confirmDeleteEstrato(): void {
    if (!this.estratoToDelete) {
      this.cancelDeleteEstrato();
      return;
    }

    const estratoNumero = this.estratoToDelete.estrato;
    const estratoInfo = `${this.estratoToDelete.estrato} (Valor: $${this.estratoToDelete.valor.toLocaleString()})`;

    // Buscar el estrato en la base de datos (si tiene ID)
    const estratoEnBD = this.editingConceptRate?.estratos?.find((e: any) => e.estrato === estratoNumero);

    if (estratoEnBD?.id) {
      // Si el estrato existe en BD, eliminarlo usando el endpoint
      this.conceptRateService.deleteConceptStratum(estratoEnBD.id).subscribe({
        next: (response) => {
          if (response?.success !== false) {
            // Eliminar del array local solo si la petición fue exitosa
            this.editForm.estratos = this.editForm.estratos.filter(e => e.estrato !== estratoNumero);
            this.toastService.success(
              'Éxito',
              `Se eliminó exitosamente el estrato ${estratoInfo}`
            );
            // Recargar la lista de tarifas conceptos para reflejar los cambios
            this.dataConceptRate.reload();
          } else {
            this.toastService.error(
              'Error',
              response?.message || 'No se pudo eliminar el estrato'
            );
          }
        },
        error: (error) => {
          console.error('Error al eliminar estrato:', error);
          const errorMessage = error?.error?.message || error?.message || 'Error de conexión';
          this.toastService.error(
            'Error',
            `No se pudo eliminar el estrato ${estratoInfo}: ${errorMessage}`
          );
        },
        complete: () => {
          this.cancelDeleteEstrato();
        }
      });
    } else {
      // Si es un estrato nuevo (solo local), eliminarlo directamente
      this.editForm.estratos = this.editForm.estratos.filter(e => e.estrato !== estratoNumero);
      this.toastService.success(
        'Éxito',
        `Se eliminó el estrato ${estratoInfo}`
      );
      this.cancelDeleteEstrato();
    }
  }

  cancelDeleteEstrato(): void {
    this.showDeleteConfirmEstrato.set(false);
    this.estratoToDelete = null;
  }

}
