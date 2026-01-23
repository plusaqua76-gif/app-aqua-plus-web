import {
  Component,
  computed,
  effect,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  PeriodoData,
  TrendDirection,
  TrendSparklineComponent,
} from '@components/charts/trend-sparkline';
import { ColombianCurrencyPipe } from '@shared/pipes/colombian-currency.pipe';
import {
  EconomicResultChartComponent,
  EconomicResultData,
} from '@components/charts/economic-result-chart';
import { TableComponent } from '@components/table';
import { catchError, of } from 'rxjs';
import { IPaginationParams } from '@interfaces/IpaginatedResponse';
import { IAccountFilters } from '@interfaces/Iaccount';
import { rxResource } from '@angular/core/rxjs-interop';
import { AccountsService } from '../../../service/accounts.service';
import { AccountingService } from '../../../service/accounting.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { MetricasContablesEagerInitializationService } from '../../../service/metricas-contables-eager-initialization.service';
import { ResultadosContablesEagerInitializationService } from '../../../service/resultados-contables-eager-initialization.service';
import { AgePortfolioChartComponent } from "@components/charts/age-portfolio-chart";
import { CarteraEdadesFacturasService } from '../../../service/cartera-edades-facturas.service';
import { CalculosContablesService } from '../../../service/calculos-contables.service';
import { MovimientoContable } from '@interfaces/accounting/IMovimientoContable';

@Component({
  selector: 'app-main-inventory',
  imports: [
    CommonModule,
    TrendSparklineComponent,
    ColombianCurrencyPipe,
    EconomicResultChartComponent,
    TableComponent,
    AgePortfolioChartComponent
],
  template: `
    @let activos = metricasService.activosData();
    @let pasivos = metricasService.pasivosData();
    @let cartera = metricasService.carteraData();
    @let patrimonio = metricasService.patrimonioData();
    @let economic = resultadosService.economicData();
    @let indicadores = calculosService.enterpriceResolutionSignal();

    <!-- CONTENEDOR GENERAL -->
    <div class="min-h-screen w-full p-6 grid gap-6">
      <!-- GRID: TARJETAS SUPERIORES -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
      >
        <!-- Card Activos Totales -->
        <div
          class="rounded-lg sm:rounded-xl border border-[#312f62a3] bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl p-2.5 sm:p-3 md:p-4"
        >
          <div class="flex gap-2.5 sm:gap-3 md:gap-4">
            <!-- Columna Izquierda: Icono + Título -->
            <div class="flex flex-col items-start justify-between shrink-0">
              <div
                class="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#312f62a3] to-[#004fbb00] flex items-center justify-center"
              >
                <i
                  class="fas fa-wallet text-sm sm:text-base md:text-lg lg:text-2xl text-[#b9b7eeb9]"
                ></i>
              </div>
              <p
                class="text-[10px] sm:text-xs md:text-sm font-medium text-gray-400 whitespace-nowrap mt-auto"
              >
                Activos Totales
              </p>
            </div>

            <!-- Columna Derecha: Valor + Gráfica + Variación -->
            <div
              class="flex-1 flex flex-col justify-between min-w-0 gap-0.5 sm:gap-1"
            >
              @defer (when activos != null) {
                @let activosData = activos!;
                <!-- Valor total -->
                <p
                  class="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-[#9B9B9B] truncate leading-tight text-right"
                >
                  {{ activosData.total | colombianCurrency }}
                </p>

                <!-- Gráfica - Container responsive -->
                <div
                  class="w-full flex-1 min-h-[30px] sm:min-h-[35px] md:min-h-[45px] relative"
                >
                  <app-trend-sparkline
                    [periodos]="activosData.periodos"
                    [tendencia]="activosData.tendencia"
                    width="100%"
                  />
                </div>

                <!-- Variación -->
                <div
                  class="flex flex-wrap items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] md:text-xs justify-end"
                >
                  @if (activosData.tendencia === 'down') {
                    <svg
                      class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="text-red-500 font-medium"
                      >-{{ activosData.variacion }}%</span
                    >
                  } @else {
                    <svg
                      class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-500 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="text-emerald-500 font-medium"
                      >{{ activosData.variacion }}%</span
                    >
                  }
                  <span class="text-gray-500">vs mes anterior</span>
                </div>
              } @placeholder {
                <div class="flex items-center justify-center h-full">
                  <div class="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              }
            </div>
          </div>
        </div>
        <!-- Card Pasivos Totales -->
        <div
          class="rounded-lg sm:rounded-xl border border-[#312f62a3] bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl p-2.5 sm:p-3 md:p-4"
        >
          <div class="flex gap-2.5 sm:gap-3 md:gap-4">
            <div class="flex flex-col items-start justify-between shrink-0">
              <div
                class="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#312f62a3] to-[#004fbb00] flex items-center justify-center"
              >
                <i
                  class="fas fa-credit-card text-sm sm:text-base md:text-lg lg:text-2xl text-[#b9b7eeb9]"
                ></i>
              </div>
              <p
                class="text-[10px] sm:text-xs md:text-sm font-medium text-gray-400 whitespace-nowrap mt-auto"
              >
                Pasivos Totales
              </p>
            </div>
            <div
              class="flex-1 flex flex-col justify-between min-w-0 gap-0.5 sm:gap-1"
            >
              @defer (when pasivos != null) {
                @let pasivosData = pasivos!;
                <p
                  class="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-[#9B9B9B] truncate leading-tight text-right"
                >
                  {{ pasivosData.total | colombianCurrency }}
                </p>
                <div
                  class="w-full flex-1 min-h-[30px] sm:min-h-[35px] md:min-h-[45px] relative"
                >
                  <app-trend-sparkline
                    [periodos]="pasivosData.periodos"
                    [tendencia]="pasivosData.tendencia"
                    width="100%"
                  />
                </div>
                <div
                  class="flex flex-wrap items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] md:text-xs justify-end"
                >
                  @if (pasivosData.tendencia === 'down') {
                    <svg
                      class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="text-red-500 font-medium"
                      >-{{ pasivosData.variacion  }}%</span
                    >
                  } @else {
                    <svg
                      class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-500 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="text-emerald-500 font-medium"
                      >{{ pasivosData.variacion }}%</span
                    >
                  }
                  <span class="text-gray-500">vs mes anterior</span>
                </div>
              } @placeholder {
                <div class="flex items-center justify-center h-full">
                  <div class="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Card Cartera por Cobrar -->
        <div
          class="rounded-lg sm:rounded-xl border border-[#312f62a3] bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl p-2.5 sm:p-3 md:p-4"
        >
          <div class="flex gap-2.5 sm:gap-3 md:gap-4">
            <div class="flex flex-col items-start justify-between shrink-0">
              <div
                class="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#312f62a3] to-[#004fbb00] flex items-center justify-center"
              >
                <i
                  class="fas fa-chart-line text-sm sm:text-base md:text-lg lg:text-2xl text-[#b9b7eeb9]"
                ></i>
              </div>
              <p
                class="text-[10px] sm:text-xs md:text-sm font-medium text-gray-400 whitespace-nowrap mt-auto"
              >
                Cartera por Cobrar
              </p>
            </div>
            <div
              class="flex-1 flex flex-col justify-between min-w-0 gap-0.5 sm:gap-1"
            >
              @defer (when cartera != null) {
                @let carteraData = cartera!;
                <p
                  class="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-[#9B9B9B] truncate leading-tight text-right"
                >
                  {{ carteraData.total | colombianCurrency }}
                </p>
                <div
                  class="w-full flex-1 min-h-[30px] sm:min-h-[35px] md:min-h-[45px] relative"
                >
                  <app-trend-sparkline
                    [periodos]="carteraData.periodos"
                    [tendencia]="carteraData.tendencia"
                    width="100%"
                  />
                </div>
                <div
                  class="flex flex-wrap items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] md:text-xs justify-end"
                >
                  @if (carteraData.tendencia === 'down') {
                    <svg
                      class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="text-red-500 font-medium"
                      >-{{ carteraData.variacion }}%</span
                    >
                  } @else {
                    <svg
                      class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-500 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="text-emerald-500 font-medium"
                      >{{ carteraData.variacion }}%</span
                    >
                  }
                  <span class="text-gray-500">vs mes anterior</span>
                </div>
              } @placeholder {
                <div class="flex items-center justify-center h-full">
                  <div class="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Card Patrimonio -->
        <div
          class="rounded-lg sm:rounded-xl border border-[#312f62a3] bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl p-2.5 sm:p-3 md:p-4"
        >
          <div class="flex gap-2.5 sm:gap-3 md:gap-4">
            <div class="flex flex-col items-start justify-between shrink-0">
              <div
                class="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#312f62a3] to-[#004fbb00] flex items-center justify-center"
              >
                <i
                  class="fas fa-landmark text-sm sm:text-base md:text-lg lg:text-xl text-[#b9b7eeb9]"
                ></i>
              </div>
              <p
                class="text-[10px] sm:text-xs md:text-sm font-medium text-gray-400 whitespace-nowrap mt-auto"
              >
                Patrimonio
              </p>
            </div>
            <div
              class="flex-1 flex flex-col justify-between min-w-0 gap-0.5 sm:gap-1"
            >
              @defer (when patrimonio != null) {
                @let patrimonioData = patrimonio!;
                <p
                  class="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-[#9B9B9B] truncate leading-tight text-right"
                >
                  {{ patrimonioData.total  | colombianCurrency }}
                </p>
                <div
                  class="w-full flex-1 min-h-[30px] sm:min-h-[35px] md:min-h-[45px] relative"
                >
                  <app-trend-sparkline
                    [periodos]="patrimonioData.periodos"
                    [tendencia]="patrimonioData.tendencia"
                  />
                </div>
                <div
                  class="flex flex-wrap items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] md:text-xs justify-end"
                >
                  @if (patrimonioData.tendencia === 'down') {
                    <svg
                      class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="text-red-500 font-medium"
                      >-{{ patrimonioData.variacion }}%</span
                    >
                  } @else {
                    <svg
                      class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-500 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="text-emerald-500 font-medium"
                      >{{ patrimonioData.variacion }}%</span
                    >
                  }
                  <span class="text-gray-500">vs mes anterior</span>
                </div>
              } @placeholder {
                <div class="flex items-center justify-center h-full">
                  <div class="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
        <div class="grid grid-cols-1 gap-6">
          <div class="grid grid-cols-1 sm:grid-cols-[7fr_3fr] gap-6">
            <div
              class="rounded-xl border border-gray-700/10 bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl"
            >
              @defer (when economic != null) {
                @let economicData = economic!;
                <app-economic-result-chart [data]="economicData" />
              } @placeholder {
                <div class="flex items-center justify-center h-40">
                  <div class="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              }
            </div>
            <div class="space-y-6">
              <div
                class="rounded-xl border border-[#312f62a3] bg-gradient-to-br from-[#767de600] to-[#1a18326b] backdrop-blur-xl py-2 px-3 relative overflow-hidden"
               >
                <div class="absolute top-4 right-4 opacity-20">
                  <i
                    class="fas fa-hand-holding-dollar text-5xl text-purple-300"
                  ></i>
                </div>
                <h3 class="text-gray-400 text-sm font-medium mb-2">Liquidez</h3>
                @defer (when indicadores != null) {
                  @let liquidez = indicadores!.liquidez;
                  <div class="flex items-end gap-3 mb-3">
                    <span class="text-4xl font-bold text-[#9B9B9B]">
                      {{ liquidez | number: '1.2-2' }}
                    </span>
                    <!-- <img
                      src="images/Combined Shape.svg"
                      alt="trend"
                      class="w-6 h-6 mb-2"
                    /> -->
                  </div>
                  <p class="text-gray-500 text-xs leading-relaxed">
                    Indica si el acueducto puede pagar sus deudas en el corto plazo. Un valor mayor a 1 es saludable.
                  </p>
                } @placeholder {
                  <div class="flex items-center justify-center h-20">
                    <div class="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                }
              </div>

                         <div
                class="rounded-xl border border-[#312f62a3] bg-gradient-to-br from-[#767de600] to-[#1a18326b] backdrop-blur-xl py-2 px-3 relative overflow-hidden"
               >
                <div class="absolute top-4 right-4 opacity-20">
                  <i
                    class="fas fa-file-invoice-dollar text-5xl text-purple-300"
                  ></i>
                </div>
                <h3 class="text-gray-400 text-sm font-medium mb-2">Cartera Vencida</h3>
                @defer (when indicadores != null) {
                  @let carteraVencida = indicadores!.carteraVencidaPorcentaje;
                  <div class="flex items-end gap-3 mb-3">
                    <span class="text-4xl font-bold text-[#9B9B9B]">
                      {{ carteraVencida | number: '' }}
                    </span>
                    <!-- <img
                      src="images/Combined Shape.svg"
                      alt="trend"
                      class="w-6 h-6 mb-2"
                    /> -->
                  </div>
                  <p class="text-gray-500 text-xs leading-relaxed">
                    Indica si el acueducto puede pagar sus deudas en el corto plazo. Un valor mayor a 1 es saludable.
                  </p>
                } @placeholder {
                  <div class="flex items-center justify-center h-20">
                    <div class="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                }
              </div>

              <!-- Card Recaudo -->
              <div
                class="rounded-xl border border-[#312f62a3] bg-gradient-to-br from-[#767de600] to-[#1a18326b] backdrop-blur-xl py-2 px-3 relative overflow-hidden"
              >
                <div class="absolute top-4 right-4 opacity-20">
                  <i
                    class="fas fa-money-bill-trend-up text-5xl text-purple-300"
                  ></i>
                </div>
                <h3 class="text-gray-400 text-sm font-medium mb-2">Recaudo</h3>
                @defer (when indicadores != null) {
                  @let recaudo = indicadores!.recaudoPorcentaje;
                  <div class="flex items-end gap-3 mb-3">
                    <span class="text-4xl font-bold text-[#9B9B9B]">
                      {{ recaudo | number: '1.2-2' }}%
                    </span>
                    <!-- <img
                      src="images/Combined Shape.svg"
                      alt="trend"
                      class="w-6 h-6 mb-2"
                    /> -->
                  </div>
                  <p class="text-gray-500 text-xs leading-relaxed">
                    Muestra qué porcentaje del servicio facturado se logra cobrar. Mayor a 80% es óptimo.
                  </p>
                } @placeholder {
                  <div class="flex items-center justify-center h-20">
                    <div class="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                }
              </div>

              <!-- Card Cobertura de Gastos Operativos -->
              <div
                class="rounded-xl border border-[#312f62a3] bg-gradient-to-br from-[#767de600] to-[#1a18326b] backdrop-blur-xl py-2 px-3 relative overflow-hidden"
              >
                <div class="absolute top-4 right-4 opacity-20">
                  <i
                    class="fas fa-chart-column text-5xl text-purple-300"
                  ></i>
                </div>
                <h3 class="text-gray-400 text-sm font-medium mb-2">Cobertura de Gastos</h3>
                @defer (when indicadores != null) {
                  @let coberturaGastos = indicadores!.coberturaGastosOperativos;
                  <div class="flex items-end gap-3 mb-3">
                    <span class="text-4xl font-bold text-[#9B9B9B]">
                      {{ coberturaGastos | number: '1.2-2' }}
                    </span>
                    <!-- <img
                      src="images/Combined Shape.svg"
                      alt="trend"
                      class="w-6 h-6 mb-2"
                    /> -->
                  </div>
                  <p class="text-gray-500 text-xs leading-relaxed">
                    Indica la capacidad del acueducto para cubrir sus gastos operativos con los ingresos recaudados. Un valor mayor a 1 es saludable.
                  </p>
                } @placeholder {
                  <div class="flex items-center justify-center h-20">
                    <div class="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Fila inferior: Tabla de Movimientos Contables (ocupa todo el ancho) -->
          <div
            class="rounded-xl border border-gray-700/10 bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl p-4"
          >
            <h3 class="text-gray-400 text-sm font-medium mb-4">Historial de Movimientos Contables</h3>
            <app-table-dynamic
              [columns]="movimientosColumns()"
              [serverMode]="true"
              [serverData]="transformedMovimientosData() ?? null"
              [loading]="serverMovimientosData.isLoading()"
              [pagination]="true"
              [showColumnFilters]="true"
              (serverPaginationChange)="onMovimientosPaginationChange($event)"
            >
            </app-table-dynamic>
          </div>
        </div>

        <!-- COLUMNA DERECHA (40%) -->
        <div class="space-y-6">
          <div class="">
            <app-table-dynamic
              [columns]="accountColumns()"
              [serverMode]="false"
              [datasource]="transformedAccountData()"
              [loading]="serverAccountData.isLoading()"
              [pagination]="false"
            >
            </app-table-dynamic>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Card Ingresos por tarifas -->
            <div
              class="rounded-xl border border-[#312f62a3] bg-gradient-to-br from-[#767de600] to-[#1a18326b] backdrop-blur-xl py-1.5 px-2.5 relative overflow-hidden"
            >
              <div class="absolute top-3 right-3 opacity-20">
                <i class="fas fa-dollar-sign text-4xl text-purple-300"></i>
              </div>
              <h3 class="text-gray-400 text-xs font-medium mb-1.5">
                Ingresos por tarifas
              </h3>
              <div class="mb-2">
                <span class="text-2xl font-bold text-[#9B9B9B]">
                  $ 12,230,000
                </span>
              </div>
              <div class="space-y-0.5 text-[10px] text-gray-500">
                <div class="flex justify-between">
                  <span>Acueducto</span>
                </div>
                <div class="flex justify-between">
                  <span>Aseo</span>
                </div>
                <div class="flex justify-between">
                  <span>Alcantarillado</span>
                </div>
                <div class="flex justify-between">
                  <span>Otros conceptos</span>
                </div>
              </div>
            </div>

            <!-- Card Agua Facturada -->
            <div
              class="rounded-xl border border-[#312f62a3] bg-gradient-to-br from-[#767de600] to-[#1a18326b] backdrop-blur-xl py-1.5 px-2.5 relative overflow-hidden"
            >
              <div class="absolute top-3 right-3 opacity-20">
                <i class="fas fa-tint text-4xl text-purple-300"></i>
              </div>
              <h3 class="text-gray-400 text-xs font-medium mb-1.5">
                Agua Facturada
              </h3>
              <div class="mb-1.5">
                <span class="text-2xl font-bold text-[#9B9B9B]">
                  $ 12,230,000
                </span>
              </div>
              <div class="mb-1.5">
                <span class="text-lg font-semibold text-blue-400">
                  124.500 m³
                </span>
              </div>
              <p class="text-gray-500 text-[10px] leading-snug">
                Volumen de agua que se cobra a los usuarios.
              </p>
            </div>

            <!-- Card Agua perdida -->
            <div
              class="rounded-xl border border-[#312f62a3] bg-gradient-to-br from-[#767de600] to-[#1a18326b] backdrop-blur-xl py-1.5 px-2.5 relative overflow-hidden"
            >
              <div class="absolute top-3 right-3 opacity-20">
                <i class="fas fa-droplet-slash text-4xl text-purple-300"></i>
              </div>
              <h3 class="text-gray-400 text-xs font-medium mb-1.5">
                Agua perdida
              </h3>
              <div class="mb-1.5">
                <span class="text-2xl font-bold text-red-400">
                  $ 3.000.000
                </span>
              </div>
              <div class="mb-1.5">
                <span class="text-lg font-semibold text-red-300">
                  500 m³
                </span>
              </div>
              <p class="text-gray-500 text-[10px] leading-snug">
                Agua producida que no genera ingresos.
              </p>
            </div>

            <!-- Card Eficiencia de facturación -->
            <div
              class="rounded-xl border border-[#312f62a3] bg-gradient-to-br from-[#767de600] to-[#1a18326b] backdrop-blur-xl py-1.5 px-2.5 relative overflow-hidden"
            >
              <div class="absolute top-3 right-3 opacity-20">
                <i class="fas fa-chart-pie text-4xl text-purple-300"></i>
              </div>
              <h3 class="text-gray-400 text-xs font-medium mb-1.5">
                Eficiencia de facturación
              </h3>
              <div class="flex items-end gap-2 mb-2">
                <span class="text-4xl font-bold text-emerald-500">
                  65%
                </span>
              </div>
              <p class="text-gray-500 text-[10px] leading-snug">
                Porcentaje del agua producida que se factura.
              </p>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-4">
            @defer (when carteraEdadesService.enterpriceResolutionSignal() != null) {
              <app-age-portfolio-chart [data]="carteraEdadesService.enterpriceResolutionSignal() ?? null" />
            } @placeholder {
              <div class="flex items-center justify-center h-40 rounded-lg bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl">
                <div class="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- GRID INFERIOR -->
      <!-- <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          class="rounded-xl border border-gray-700/10 bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl h-64"
        ></div>
        <div
          class="rounded-xl border border-gray-700/10 bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl h-64"
        ></div>
      </div> -->
    </div>
  `,
})
export class MainInventory {
  title = signal('Gestión de Cuentas Contables');
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);
  protected readonly accountsService = inject(AccountsService);
  protected readonly accountingService = inject(AccountingService);
  protected readonly metricasService = inject(MetricasContablesEagerInitializationService);
  protected readonly resultadosService = inject(ResultadosContablesEagerInitializationService);
  protected readonly carteraEdadesService = inject(CarteraEdadesFacturasService);
  protected readonly calculosService = inject(CalculosContablesService);
  protected readonly toastService = inject(ToastService);

  readonly enterpriseId = computed(() => {
    if (!this.isBrowser) return null;
    try {
      const userData = sessionStorage.getItem('userData');
      if (!userData) return null;

      const parsedUserData = JSON.parse(userData);
      return parsedUserData.empresaId ? Number(parsedUserData.empresaId) : null;
    } catch {
      return null;
    }
  });

  readonly paginationParams = signal<IPaginationParams>({
    page: 0,
    size: 5,
  });

  readonly movimientosPaginationParams = signal<IPaginationParams>({
    page: 0,
    size: 10,
  });

  readonly filters = signal<IAccountFilters>({});

  readonly accountColumns = signal([
    { field: 'codigo', header: 'Código', type: 'text' as const },
    { field: 'nombre', header: 'Nombre', type: 'text' as const },
    { field: 'tipoNombre', header: 'Tipo Cuenta', type: 'text' as const },
    { field: 'valor', header: 'Valor', type: 'number' as const },
  ]);

  readonly movimientosColumns = signal([
    { field: 'nombre', header: 'Nombre', type: 'text' as const },
    { field: 'categoriaNombre', header: 'Categoría', type: 'text' as const },
    { field: 'valor', header: 'Valor', type: 'number' as const },
    { field: 'fechaCreacion', header: 'Fecha', type: 'date' as const },
  ]);

  readonly transformedAccountData = computed(() => {
    const rawData = this.serverAccountData.value();
    if (!rawData?.response) return [];

    return rawData.response.map(account => ({
      ...account,
      tipoNombre: account.tipoCuenta?.nombre || '',
    }));
  });

  readonly transformedMovimientosData = computed(() => {
    const rawData = this.serverMovimientosData.value();
    if (!rawData?.response) return null;

    return {
      ...rawData,
      response: rawData.response.map(movimiento => ({
        ...movimiento,
        categoriaNombre: movimiento.categoriaCuenta?.nombre || '',
        fechaCreacion: this.formatDate(movimiento.fechaCreacion),
      }))
    };
  });

  serverAccountData = rxResource({
    params: () => ({
      enterpriseId: this.enterpriseId(),
      pagination: this.paginationParams(),
      filters: this.filters(),
    }),
    stream: ({ params }) => {
      const { enterpriseId, pagination, filters } = params;
      if (!enterpriseId) {
        return of(null);
      }
      return this.accountsService.getAllAccountsByIdPaginated(
        enterpriseId,
        pagination,
        filters,
      );
    },
  });

  serverMovimientosData = rxResource({
    params: () => ({
      enterpriseId: this.enterpriseId(),
      pagination: this.movimientosPaginationParams(),
    }),
    stream: ({ params }) => {
      const { enterpriseId, pagination } = params;
      if (!enterpriseId) {
        return of(null);
      }
      return this.accountingService.getServerMovimientosContables(
        enterpriseId,
        pagination,
      ).pipe(
        catchError((error) => {
          return of(null);
        })
      );
    },
  });

  onMovimientosPaginationChange(params: IPaginationParams): void {
    this.movimientosPaginationParams.set(params);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';

    try {
      const datePart = dateString.split('T')[0];
      const [year, month, day] = datePart.split('-');
      const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day));

      // Formatear como DD/MM/YYYY
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  }

}
