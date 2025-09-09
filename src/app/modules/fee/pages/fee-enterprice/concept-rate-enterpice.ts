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
      <div class="w-full px-2 py-4">
        <h2 class="text-xl md:text-2xl font-semibold tracking-tight mb-6">
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
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <svg class="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-blue-400 font-medium">Total de conceptos configurados</p>
                      <p class="text-blue-300 text-sm">Para esta empresa</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-2xl font-bold text-blue-400">{{ conceptRatesData().length }}</p>
                    <p class="text-blue-300 text-xs">conceptos</p>
                  </div>
                </div>
              </div>

              @for (conceptRate of conceptRatesData(); track conceptRate.id) {
                <div class="rounded-xl border border-gray-600/70 bg-transparent p-5 hover:border-gray-500/70 transition-colors duration-200">
                  <div class="grid grid-cols-12 items-center gap-4">
                    <!-- Header labels -->
                    <div class="col-span-12 grid grid-cols-12 text-xs text-gray-400 mb-2">
                      <span class="col-span-4">Tipo de Tarifa</span>
                      <span class="col-span-4">Tipo de Concepto</span>
                      <span class="col-span-3">Valor</span>
                      <span class="col-span-1 text-center">Calc. MC</span>
                    </div>

                    <!-- Data row -->
                    <div class="col-span-12 grid grid-cols-12 items-center">
                      <div class="col-span-4">
                        <div class="space-y-1">
                          <span class="text-lg font-semibold block text-white">
                            {{ conceptRate.tarifa.tipoTarifa.nombre }}
                          </span>
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
                        <div class="flex flex-col">
                          <span class="text-xl font-bold text-green-400">
                            $ {{ conceptRate.valor | number:'1.2-2' }}
                          </span>
                          <span class="text-xs text-gray-500">
                            COP
                          </span>
                        </div>
                      </div>

                      <div class="col-span-1">
                        <div class="flex items-center justify-center">
                          @if (conceptRate.indCalcularMc) {
                            <span class="inline-flex items-center justify-center w-8 h-8 bg-green-500/20 text-green-400 rounded-full" title="Calcular MC habilitado">
                              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                              </svg>
                            </span>
                          } @else {
                            <span class="inline-flex items-center justify-center w-8 h-8 bg-red-500/20 text-red-400 rounded-full" title="Calcular MC deshabilitado">
                              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                              </svg>
                            </span>
                          }
                        </div>
                      </div>
                    </div>

                    <!-- Enterprise info section -->
                    <div class="col-span-12 mt-4 pt-4 border-t border-gray-600/50">
                      <div class="mb-3">
                        <span class="text-xs text-gray-400 uppercase tracking-wider">Información de la empresa</span>
                      </div>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div class="space-y-3">
                          <div class="flex items-start gap-3">
                            <div class="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <span class="text-gray-400 text-xs block">Empresa</span>
                              <span class="text-gray-200 font-medium">{{ conceptRate.tarifa.empresa.nombre }}</span>
                            </div>
                          </div>
                          <div class="flex items-start gap-3">
                            <div class="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <span class="text-gray-400 text-xs block">NIT</span>
                              <span class="text-gray-200">{{ conceptRate.tarifa.empresa.nit }}</span>
                            </div>
                          </div>
                          <div class="flex items-start gap-3">
                            <div class="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <span class="text-gray-400 text-xs block">Código</span>
                              <span class="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                                {{ conceptRate.tarifa.empresa.codigo }}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="space-y-3">
                          <div class="flex items-start gap-3">
                            <div class="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <span class="text-gray-400 text-xs block">Departamento</span>
                              <span class="text-gray-200">{{ conceptRate.tarifa.empresa.direccion.departamentoId.nombre }}</span>
                            </div>
                          </div>
                          <div class="flex items-start gap-3">
                            <div class="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <span class="text-gray-400 text-xs block">Ciudad</span>
                              <span class="text-gray-200">{{ conceptRate.tarifa.empresa.direccion.ciudadId.nombre }}</span>
                            </div>
                          </div>
                          <div class="flex items-start gap-3">
                            <div class="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <span class="text-gray-400 text-xs block">Corregimiento</span>
                              <span class="text-gray-200">{{ conceptRate.tarifa.empresa.direccion.corregimientoId.nombre }}</span>
                            </div>
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

conceptRatesData = computed(() => this.dataConceptRate.value()?.response ?? []);

  reloadData(): void {
    this.dataConceptRate.reload();
  }

  totalConceptRates = computed(() => this.conceptRatesData().length);

  averageValue = computed(() => {
    const data = this.conceptRatesData();
    if (data.length === 0) return 0;
    const total = data.reduce((sum, item) => sum + item.valor, 0);
    return total / data.length;
  });

}
