import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, PLATFORM_ID } from '@angular/core';
import { ConceptRateService } from '../../services/concept-rate.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY } from 'rxjs';


@Component({
  selector: 'app-concept-rate-enterpice',
  imports: [CommonModule],
  template: `
    <section class="w-full bg-transparent text-gray-200">
      <div class="w-full px-2 pb-4">
        <div class="">
          <h2 class="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight mb-6">
            Lista de Conceptos de Tarifa
          </h2>

        <!-- Loading state -->
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
                  <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <p class="text-gray-400 text-lg">No hay conceptos de tarifa configurados</p>
                <p class="text-gray-500 text-sm mt-2">Configure conceptos de tarifa para esta empresa</p>
              </div>
            } @else {
              <!-- Summary card -->
              <div class="rounded-xl border border-blue-600/70 bg-blue-500/10 p-4 mb-6">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div class="flex items-center space-x-3 mb-4 sm:mb-0">
                    <div class="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <svg class="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-blue-400 font-medium text-sm sm:text-base">Total de conceptos configurados</p>
                      <p class="text-blue-300 text-xs sm:text-sm">Para esta empresa</p>
                    </div>
                  </div>
                  <div class="text-left sm:text-right">
                    <p class="text-2xl font-bold text-blue-400">{{ conceptRatesData().length }}</p>
                    <p class="text-blue-300 text-xs">conceptos</p>
                  </div>
                </div>
              </div>

              @for (conceptRate of conceptRatesData(); track conceptRate.id) {
                <div class="rounded-xl border border-gray-600/70 bg-transparent p-4 hover:border-gray-500/70 transition-colors duration-200">
                  <!-- Mobile Layout -->
                  <div class="block md:hidden">
                    <!-- Header -->
                    <div class="flex items-center justify-between mb-4">
                      <div class="flex-1">
                        <h3 class="text-lg font-semibold text-white mb-1">
                          {{ conceptRate.tipoConcepto.descripcion }}
                        </h3>
                        <span class="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                          {{ conceptRate.tipoConcepto.codigo }}
                        </span>
                      </div>
                      <div class="flex items-center space-x-2">
                        <button
                          (click)="editConceptRate(conceptRate.id)"
                          class="inline-flex items-center justify-center w-8 h-8 bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 transition-colors"
                          title="Editar concepto">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                        <button
                          (click)="deleteConceptRate(conceptRate.id)"
                          class="inline-flex items-center justify-center w-8 h-8 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 transition-colors"
                          title="Eliminar concepto">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </div>

                    <!-- Mobile Content -->
                    <div class="space-y-3">
                      <!-- Tipo de Tarifa -->
                      <div class="flex items-start gap-3">
                        <div class="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div class="flex-1">
                          <span class="text-xs text-gray-400 block mb-1">Tipo de Tarifa</span>
                          <span class="text-sm text-gray-300 block">
                            {{ conceptRate.tarifa.tipoTarifa.descripcion }}
                          </span>
                          <span class="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded inline-block mt-1">
                            {{ conceptRate.tarifa.tipoTarifa.codigo }}
                          </span>
                        </div>
                      </div>

                      <!-- Valor -->
                      <div class="flex items-start gap-3">
                        <div class="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div class="flex-1">
                          <span class="text-xs text-gray-400 block mb-1">Valor</span>
                          @if (conceptRate.porEstrato && conceptRate.estratos && conceptRate.estratos.length > 0) {
                            <div class="space-y-1">
                              @for (estrato of conceptRate.estratos; track estrato.id) {
                                <div class="flex justify-between items-center">
                                  <span class="text-sm text-gray-300">Estrato {{estrato.estrato}}:</span>
                                  <span class="text-green-400 font-bold">$ {{ estrato.valor | number:'1.2-2' }}</span>
                                </div>
                              }
                            </div>
                          } @else if (conceptRate.valor) {
                            <div class="flex items-baseline gap-2">
                              <span class="text-xl font-bold text-green-400">
                                $ {{ conceptRate.valor | number:'1.2-2' }}
                              </span>
                              <span class="text-xs text-gray-500">COP</span>
                            </div>
                          } @else {
                            <span class="text-gray-500">Sin valor</span>
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Desktop Layout -->
                  <div class="hidden md:block">
                    <div class="grid grid-cols-12 items-center gap-4">
                      <!-- Header labels -->
                      <div class="col-span-12 grid grid-cols-12 text-xs text-gray-400 mb-2">
                        <span class="col-span-4">Tipo de Tarifa</span>
                        <span class="col-span-4">Tipo de Concepto</span>
                        <span class="col-span-3">Valor</span>
                        <span class="col-span-1 text-center">Acciones</span>
                      </div>

                      <!-- Data row -->
                      <div class="col-span-12 grid grid-cols-12 items-center">
                        <div class="col-span-4">
                          <div class="space-y-1">
                            <span class="text-sm text-gray-400 block">
                              {{ conceptRate.tarifa.tipoTarifa.descripcion }}
                            </span>
                            <span class="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded inline-block">
                              {{ conceptRate.tarifa.tipoTarifa.codigo }}
                            </span>
                          </div>
                        </div>

                        <div class="col-span-4">
                          <div class="space-y-1">
                            <span class="text-lg font-semibold block text-white">
                              {{ conceptRate.tipoConcepto.descripcion }}
                            </span>
                            <span class="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded inline-block">
                              {{ conceptRate.tipoConcepto.codigo }}
                            </span>
                          </div>
                        </div>

                        <div class="col-span-3">
                          @if (conceptRate.porEstrato && conceptRate.estratos && conceptRate.estratos.length > 0) {
                            <div class="flex flex-col space-y-1">
                              <span class="text-xs text-gray-400">Por Estrato:</span>
                              @for (estrato of conceptRate.estratos; track estrato.id) {
                                <div class="flex justify-between items-center text-sm">
                                  <span class="text-gray-300">Est. {{estrato.estrato}}:</span>
                                  <span class="text-green-400 font-bold">$ {{ estrato.valor | number:'1.2-2' }}</span>
                                </div>
                              }
                            </div>
                          } @else if (conceptRate.valor) {
                            <div class="flex flex-col">
                              <span class="text-xl font-bold text-green-400">
                                $ {{ conceptRate.valor | number:'1.2-2' }}
                              </span>
                              <span class="text-xs text-gray-500">
                                COP
                              </span>
                            </div>
                          } @else {
                            <span class="text-gray-500">Sin valor</span>
                          }
                        </div>

                        <div class="col-span-1">
                          <div class="flex items-center justify-center space-x-1">
                            <button
                              (click)="editConceptRate(conceptRate.id)"
                              class="inline-flex items-center justify-center w-8 h-8 bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 transition-colors"
                              title="Editar concepto">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                            </button>
                            <button
                              (click)="deleteConceptRate(conceptRate.id)"
                              class="inline-flex items-center justify-center w-8 h-8 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 transition-colors"
                              title="Eliminar concepto">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            }
          </div>
        }
        </div>
      </div>
    </section>
  `
  ,
})
export class ConceptRateEnterpice {

  readonly conceptRateService = inject(ConceptRateService);

  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

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
        ? this.conceptRateService.getConceptRateByEnterprise(enterpriseId)
        : EMPTY
  })

conceptRatesData = computed(() => {
  const data = this.dataConceptRate.value()?.response ?? [];
  // Debug: verificar estructura de datos
  console.log('Concept Rates Data:', data);
  return data;
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
    console.log('Editando concepto de tarifa con ID:', id);
  }

  deleteConceptRate(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este concepto de tarifa?')) {
      console.log('Eliminando concepto de tarifa con ID:', id);
    }
  }

}
