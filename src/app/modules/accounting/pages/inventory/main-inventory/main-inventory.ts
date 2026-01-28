import {
  Component,
  computed,
  effect,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { PopupComponent } from '@shared/components/popUp';
import { Checkbox } from '@shared/components/checkbox';
import { catchError, of } from 'rxjs';
import { IPaginationParams } from '@interfaces/IpaginatedResponse';
import { IAccountFilters } from '@interfaces/Iaccount';
import { rxResource } from '@angular/core/rxjs-interop';
import { AccountsService } from '../../../service/accounts.service';
import { AccountingService } from '../../../service/accounting.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { MetricasContablesEagerInitializationService } from '../../../service/metricas-contables-eager-initialization.service';
import { ResultadosContablesEagerInitializationService } from '../../../service/resultados-contables-eager-initialization.service';
import { AgePortfolioChartComponent } from '@components/charts/age-portfolio-chart';
import { CarteraEdadesFacturasService } from '../../../service/cartera-edades-facturas.service';
import { CalculosContablesService } from '../../../service/calculos-contables.service';
import { MovimientoContable } from '@interfaces/accounting/IMovimientoContable';
import { MetricasAcueductoEagerInicializationService } from '../../../service/metricas-acueducto-eager-inicialization.service';
import { CuentasTotalesEagerInitializationService } from '../../../service/cuentas-totales-eager-initialization.service';

@Component({
  selector: 'app-main-inventory',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TrendSparklineComponent,
    ColombianCurrencyPipe,
    EconomicResultChartComponent,
    TableComponent,
    AgePortfolioChartComponent,
    PopupComponent,
    Checkbox,
  ],
  template: `
    @let activos = metricasService.activosData();
    @let pasivos = metricasService.pasivosData();
    @let cartera = metricasService.carteraData();
    @let patrimonio = metricasService.patrimonioData();
    @let economic = resultadosService.economicData();
    @let indicadores = calculosService.enterpriceResolutionSignal();
    <div class="min-h-screen w-full p-6 grid gap-6">
      <div
        class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
      >
        <div
          class="rounded-lg sm:rounded-xl border border-[#312f62a3] bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl p-2.5 sm:p-3 md:p-4"
        >
          <div class="flex gap-2.5 sm:gap-3 md:gap-4">
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
                      >{{ activosData.variacion | number: '1.0-0' }}%</span
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
                      >{{ activosData.variacion | number: '1.0-0' }}%</span
                    >
                  }
                  <span class="text-gray-500">vs mes anterior</span>
                </div>
              } @placeholder {
                <div class="flex items-center justify-center h-full">
                  <div
                    class="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"
                  ></div>
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
                      >-{{ pasivosData.variacion | number: '1.0-0' }}%</span
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
                      >{{ pasivosData.variacion | number: '1.0-0' }}%</span
                    >
                  }
                  <span class="text-gray-500">vs mes anterior</span>
                </div>
              } @placeholder {
                <div class="flex items-center justify-center h-full">
                  <div
                    class="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"
                  ></div>
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
                      >{{ carteraData.variacion | number: '1.0-0' }}%</span
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
                      >{{ carteraData.variacion | number: '1.0-0' }}%</span
                    >
                  }
                  <span class="text-gray-500">vs mes anterior</span>
                </div>
              } @placeholder {
                <div class="flex items-center justify-center h-full">
                  <div
                    class="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"
                  ></div>
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
                  {{ patrimonioData.total | colombianCurrency }}
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
                      >-{{ patrimonioData.variacion | number: '1.0-0' }}%</span
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
                      >{{ patrimonioData.variacion | number: '1.0-0' }}%</span
                    >
                  }
                  <span class="text-gray-500">vs mes anterior</span>
                </div>
              } @placeholder {
                <div class="flex items-center justify-center h-full">
                  <div
                    class="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"
                  ></div>
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
                  <div
                    class="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"
                  ></div>
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
                    Indica si el acueducto puede pagar sus deudas en el corto
                    plazo. Un valor mayor a 1 es saludable.
                  </p>
                } @placeholder {
                  <div class="flex items-center justify-center h-20">
                    <div
                      class="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"
                    ></div>
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
                <h3 class="text-gray-400 text-sm font-medium mb-2">
                  Cartera Vencida
                </h3>
                @defer (when indicadores != null) {
                  @let carteraVencida = indicadores!.carteraVencidaPorcentaje;
                  <div class="flex items-end gap-3 mb-3">
                    <span class="text-4xl font-bold text-[#9B9B9B]">
                      {{ carteraVencida | number: '1.0-0' }}%
                    </span>
                    <!-- <img
                      src="images/Combined Shape.svg"
                      alt="trend"
                      class="w-6 h-6 mb-2"
                    /> -->
                  </div>
                  <p class="text-gray-500 text-xs leading-relaxed">
                    Indica si el acueducto puede pagar sus deudas en el corto
                    plazo. Un valor mayor a 1 es saludable.
                  </p>
                } @placeholder {
                  <div class="flex items-center justify-center h-20">
                    <div
                      class="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"
                    ></div>
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
                      {{ recaudo | number: '1.0-0' }}%
                    </span>
                    <!-- <img
                      src="images/Combined Shape.svg"
                      alt="trend"
                      class="w-6 h-6 mb-2"
                    /> -->
                  </div>
                  <p class="text-gray-500 text-xs leading-relaxed">
                    Muestra qué porcentaje del servicio facturado se logra
                    cobrar. Mayor a 80% es óptimo.
                  </p>
                } @placeholder {
                  <div class="flex items-center justify-center h-20">
                    <div
                      class="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"
                    ></div>
                  </div>
                }
              </div>

              <!-- Card Cobertura de Gastos Operativos -->
              <div
                class="rounded-xl border border-[#312f62a3] bg-gradient-to-br from-[#767de600] to-[#1a18326b] backdrop-blur-xl py-2 px-3 relative overflow-hidden"
              >
                <div class="absolute top-4 right-4 opacity-20">
                  <i class="fas fa-chart-column text-5xl text-purple-300"></i>
                </div>
                <h3 class="text-gray-400 text-sm font-medium mb-2">
                  Cobertura de Gastos
                </h3>
                @defer (when indicadores != null) {
                  @let coberturaGastos = indicadores!.coberturaGastosOperativos;
                  <div class="flex items-end gap-3 mb-3">
                    <span class="text-4xl font-bold text-[#9B9B9B]">
                      {{ coberturaGastos | number: '1.0-0' }}
                    </span>
                    <!-- <img
                      src="images/Combined Shape.svg"
                      alt="trend"
                      class="w-6 h-6 mb-2"
                    /> -->
                  </div>
                  <p class="text-gray-500 text-xs leading-relaxed">
                    Indica la capacidad del acueducto para cubrir sus gastos
                    operativos con los ingresos recaudados. Un valor mayor a 1
                    es saludable.
                  </p>
                } @placeholder {
                  <div class="flex items-center justify-center h-20">
                    <div
                      class="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"
                    ></div>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Fila inferior: Tabla de Movimientos Contables (ocupa todo el ancho) -->
          <div
            class="rounded-xl border border-gray-700/10 bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl p-4"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-gray-400 text-sm font-medium">
                Historial de Movimientos Contables
              </h3>
              <div class="flex gap-2">
                <button
                  #btnCrearMovimiento
                  (click)="openMovimientoModal()"
                  class="relative cursor-pointer py-1.5 px-4 text-center inline-flex justify-center text-xs uppercase text-gray-300 rounded-lg border border-[#312f62a3] bg-gradient-to-br from-[#767de600] to-[#1a18326b] transition-transform duration-300 ease-in-out group outline-offset-2 focus:outline focus:outline-1 focus:outline-[#b9b7eeb9] focus:outline-offset-2 overflow-hidden hover:scale-105"
                >
                  <span class="relative z-20"></span>
                  <i class="fas fa-plus mr-2 mt-0.5"></i>
                  Crear Movimiento

                  <span
                    class="absolute left-[-75%] top-0 h-full w-[50%] bg-white/10 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out"
                  ></span>
                </button>
                <button
                  class="relative cursor-pointer py-1.5 px-4 text-center inline-flex justify-center text-xs uppercase text-gray-300 rounded-lg border border-[#312f62a3] bg-gradient-to-br from-[#767de600] to-[#1a18326b] transition-transform duration-300 ease-in-out group outline-offset-2 focus:outline focus:outline-1 focus:outline-[#b9b7eeb9] focus:outline-offset-2 overflow-hidden hover:scale-105"
                >
                  <span class="relative z-20">Ver más</span>

                  <span
                    class="absolute left-[-75%] top-0 h-full w-[50%] bg-white/10 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out"
                  ></span>
                </button>
              </div>
            </div>
            <app-table-dynamic
              [columns]="movimientosColumns()"
              [serverMode]="true"
              [serverData]="transformedMovimientosData() ?? null"
              [loading]="serverMovimientosData.isLoading()"
              [pagination]="false"
              [showColumnFilters]="true"
              (serverPaginationChange)="onMovimientosPaginationChange($event)"
            >
            </app-table-dynamic>
          </div>
        </div>

        <!-- COLUMNA DERECHA (40%) -->
        <div class="space-y-6">
          <div
            class="rounded-xl border border-gray-700/10 bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl p-4"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-gray-400 text-sm font-medium">
                   Cuentas Contables
              </h3>
              <div class="flex gap-2">
                <!-- <button
                  class="relative cursor-pointer py-1.5 px-4 text-center inline-flex justify-center text-xs uppercase text-gray-300 rounded-lg border border-[#312f62a3] bg-gradient-to-br from-[#767de600] to-[#1a18326b] transition-transform duration-300 ease-in-out group outline-offset-2 focus:outline focus:outline-1 focus:outline-[#b9b7eeb9] focus:outline-offset-2 overflow-hidden hover:scale-105"
                >
                  <span class="relative z-20"></span>
                  <i class="fas fa-plus mr-2 mt-0.5"></i>
                  Crear cuenta contable

                  <span
                    class="absolute left-[-75%] top-0 h-full w-[50%] bg-white/10 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out"
                  ></span>
                </button> -->
                <button
                  class="relative cursor-pointer py-1.5 px-4 text-center inline-flex justify-center text-xs uppercase text-gray-300 rounded-lg border border-[#312f62a3] bg-gradient-to-br from-[#767de600] to-[#1a18326b] transition-transform duration-300 ease-in-out group outline-offset-2 focus:outline focus:outline-1 focus:outline-[#b9b7eeb9] focus:outline-offset-2 overflow-hidden hover:scale-105"
                >
                  <span class="relative z-20">Ver más</span>

                  <span
                    class="absolute left-[-75%] top-0 h-full w-[50%] bg-white/10 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out"
                  ></span>
                </button>
              </div>
            </div>
            <app-table-dynamic
              [columns]="accountColumns()"
              [serverMode]="false"
              [datasource]="transformedAccountData()"
              [loading]="cuentasTotalesService.isLoading()"
              [pagination]="false"
            >
            </app-table-dynamic>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Card Ingresos por tarifas -->
            @defer (
              when metricasAcueductoService.enterpriceResolutionSignal() != null
            ) {
              @let metricasData =
                metricasAcueductoService.enterpriceResolutionSignal()!;
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
                    {{
                      metricasData.totales.ingresosPorTarifa | colombianCurrency
                    }}
                  </span>
                </div>
                <div class="space-y-0.5 text-[10px] text-gray-500">
                  @if (
                    metricasData.totales.desgloseTarifas &&
                    metricasData.totales.desgloseTarifas.length > 0
                  ) {
                    @for (
                      tarifa of metricasData.totales.desgloseTarifas;
                      track tarifa.nombreTarifa
                    ) {
                      <div class="flex justify-between">
                        <span>{{ tarifa.nombreTarifa }}</span>
                        <span class="text-gray-400">{{
                          tarifa.valorTarifa | colombianCurrency
                        }}</span>
                      </div>
                    }
                  } @else {
                    <div class="flex justify-between">
                      <span>Valor m³ Acueducto</span>
                      <span class="text-gray-400">{{
                        metricasData.valorMcAcueducto | colombianCurrency
                      }}</span>
                    </div>
                  }
                </div>
              </div>
            } @placeholder {
              <div
                class="flex items-center justify-center h-32 rounded-xl bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl"
              >
                <div
                  class="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"
                ></div>
              </div>
            }

            <!-- Card Agua Facturada -->
            @defer (when metricasAcueductoMesActual() != null) {
              @let aguaFacturada = metricasAcueductoMesActual()!;
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
                    {{ aguaFacturada.vlrAguaFacturada | colombianCurrency }}
                  </span>
                </div>
                <div class="mb-1.5">
                  <span class="text-lg font-semibold text-blue-400">
                    {{ aguaFacturada.mcAguaFacturada | number: '1.0-0' }} m³
                  </span>
                </div>
                <p class="text-gray-500 text-[10px] leading-snug">
                  Volumen de agua que se cobra a los usuarios.
                </p>
              </div>
            } @placeholder {
              <div
                class="flex items-center justify-center h-32 rounded-xl bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl"
              >
                <div
                  class="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"
                ></div>
              </div>
            }

            <!-- Card Agua perdida -->
            @defer (when metricasAcueductoMesActual() != null) {
              @let aguaPerdida = metricasAcueductoMesActual()!;
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
                    {{ aguaPerdida.vlrAguaPerdida | colombianCurrency }}
                  </span>
                </div>
                <div class="mb-1.5">
                  <span class="text-lg font-semibold text-red-300">
                    {{ aguaPerdida.mcAguaPerdida | number: '1.0-0' }} m³
                  </span>
                </div>
                <p class="text-gray-500 text-[10px] leading-snug">
                  Agua producida que no genera ingresos.
                </p>
              </div>
            } @placeholder {
              <div
                class="flex items-center justify-center h-32 rounded-xl bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl"
              >
                <div
                  class="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"
                ></div>
              </div>
            }

            <!-- Card Eficiencia de facturación -->
            @defer (when metricasAcueductoMesActual() != null) {
              @let eficiencia = metricasAcueductoMesActual()!;
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
                    {{ eficiencia.eficienciaFacturacion | number: '1.2-2' }}%
                  </span>
                </div>
                <p class="text-gray-500 text-[10px] leading-snug">
                  Porcentaje del agua producida que se factura.
                </p>
              </div>
            } @placeholder {
              <div
                class="flex items-center justify-center h-32 rounded-xl bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl"
              >
                <div
                  class="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"
                ></div>
              </div>
            }
          </div>
          <div class="grid grid-cols-1 gap-4">
            @defer (
              when carteraEdadesService.enterpriceResolutionSignal() != null
            ) {
              <app-age-portfolio-chart
                [data]="
                  carteraEdadesService.enterpriceResolutionSignal() ?? null
                "
              />
            } @placeholder {
              <div
                class="flex items-center justify-center h-40 rounded-lg bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl"
              >
                <div
                  class="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"
                ></div>
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

    <!-- Modal para crear movimiento contable -->
    @defer (on interaction(btnCrearMovimiento)) {
      @if (isMovimientoModalOpen()) {
        <app-pop-up
          [open]="isMovimientoModalOpen"
          [title]="'Crear Movimiento Contable'"
          [isConfirmation]="false"
          [maxWidth]="'max-w-2xl'"
        >
          <form [formGroup]="movimientoForm" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Nombre del Movimiento -->
              <div class="md:col-span-2">
                <label
                  for="nombreMovimiento"
                  class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase"
                >
                  Nombre del Movimiento <span class="text-red-500">*</span>
                </label>
                <input
                  id="nombreMovimiento"
                  type="text"
                  formControlName="nombre"
                  placeholder="Ingrese el nombre del movimiento"
                  class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40"
                />
                @if (movimientoForm.get('nombre')?.invalid && movimientoForm.get('nombre')?.touched) {
                  <p class="text-red-500 text-xs mt-2">El nombre es requerido</p>
                }
              </div>

              <!-- Código -->
              <div>
                <label
                  for="codigoMovimiento"
                  class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase"
                >
                  Código <span class="text-red-500">*</span>
                </label>
                <input
                  id="codigoMovimiento"
                  type="text"
                  formControlName="codigo"
                  placeholder="Código del movimiento"
                  class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40"
                />
                @if (movimientoForm.get('codigo')?.invalid && movimientoForm.get('codigo')?.touched) {
                  <p class="text-red-500 text-xs mt-2">El código es requerido</p>
                }
              </div>

              <!-- Valor -->
              <div>
                <label
                  for="valorMovimiento"
                  class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase"
                >
                  Valor <span class="text-red-500">*</span>
                </label>
                <input
                  id="valorMovimiento"
                  type="number"
                  formControlName="valor"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40"
                />
                @if (movimientoForm.get('valor')?.invalid && movimientoForm.get('valor')?.touched) {
                  <p class="text-red-500 text-xs mt-2">El valor debe ser mayor a 0</p>
                }
              </div>

              <!-- Tipo de Cuenta -->
              <div>
                <label
                  for="tipoCuenta"
                  class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase"
                >
                  Tipo de Cuenta <span class="text-red-500">*</span>
                </label>
                <select
                  id="tipoCuenta"
                  formControlName="idTipoCuenta"
                  class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 appearance-none cursor-pointer"
                >
                  <option value="" disabled selected>Seleccione tipo de cuenta</option>
                  <option value="1">Activo</option>
                  <option value="2">Pasivo</option>
                  <option value="3">Patrimonio</option>
                  <option value="4">Ingreso</option>
                  <option value="5">Gasto</option>
                </select>
                @if (movimientoForm.get('idTipoCuenta')?.invalid && movimientoForm.get('idTipoCuenta')?.touched) {
                  <p class="text-red-500 text-xs mt-2">Seleccione un tipo de cuenta</p>
                }
              </div>

              <!-- Naturaleza -->
              <div>
                <label
                  for="naturaleza"
                  class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase"
                >
                  Naturaleza <span class="text-red-500">*</span>
                </label>
                <select
                  id="naturaleza"
                  formControlName="idNaturaleza"
                  class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 appearance-none cursor-pointer"
                >
                  <option value="" disabled selected>Seleccione naturaleza</option>
                  <option value="1">Crédito</option>
                  <option value="2">Débito</option>
                </select>
                @if (movimientoForm.get('idNaturaleza')?.invalid && movimientoForm.get('idNaturaleza')?.touched) {
                  <p class="text-red-500 text-xs mt-2">Seleccione una naturaleza</p>
                }
              </div>

              <!-- Categoría -->
              <div>
                <label
                  for="categoria"
                  class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase"
                >
                  Categoría <span class="text-red-500">*</span>
                </label>
                <select
                  id="categoria"
                  formControlName="idCategoriaCuenta"
                  class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 appearance-none cursor-pointer"
                >
                  <option value="" disabled selected>Seleccione categoría</option>
                  <option value="1">Facturas</option>
                  <option value="2">Nomina</option>
                  <option value="3">Ventas</option>
                  <option value="4">Impuestos</option>

                </select>
                @if (movimientoForm.get('idCategoriaCuenta')?.invalid && movimientoForm.get('idCategoriaCuenta')?.touched) {
                  <p class="text-red-500 text-xs mt-2">Seleccione una categoría</p>
                }
              </div>

              <!-- Cuenta Corriente -->
              <div class="flex items-center gap-3 pt-8">
                <app-checkbox
                  [checked]="esCuentaCorriente()"
                  (checkedChange)="onCuentaCorrienteChange($event)"
                />
                <label
                  class="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none pb-1"
                  (click)="onCuentaCorrienteChange(!esCuentaCorriente())"
                >
                  Cuenta Corriente
                </label>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                (click)="closeMovimientoModal()"
                [disabled]="isCreatingMovimiento()"
                class="px-6 py-2 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 backdrop-blur-md text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:border-gray-500/50 transition-all duration-300 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="createMovimiento()"
                [disabled]="movimientoForm.invalid || isCreatingMovimiento()"
                class="px-6 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 backdrop-blur-md text-blue-700 dark:text-blue-300 font-medium rounded-lg hover:border-blue-500/50 transition-all duration-300 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                @if (isCreatingMovimiento()) {
                  <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando...
                } @else {
                  <i class="fas fa-save"></i>
                  Crear Movimiento
                }
              </button>
            </div>
          </form>
        </app-pop-up>
      }
    }
  `,
})
export class MainInventory {
  title = signal('Gestión de Cuentas Contables');
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);
  protected readonly fb = inject(FormBuilder);
  protected readonly accountsService = inject(AccountsService);
  protected readonly accountingService = inject(AccountingService);
  protected readonly calculosService = inject(CalculosContablesService);
  protected readonly carteraEdadesService = inject(
    CarteraEdadesFacturasService,
  );
  protected readonly metricasService = inject(
    MetricasContablesEagerInitializationService,
  );
  protected readonly resultadosService = inject(
    ResultadosContablesEagerInitializationService,
  );
  protected readonly metricasAcueductoService = inject(
    MetricasAcueductoEagerInicializationService,
  );
  protected readonly cuentasTotalesService = inject(
    CuentasTotalesEagerInitializationService,
  );
  protected readonly toastService = inject(ToastService);

  // Signals para el modal de movimientos
  isMovimientoModalOpen = signal<boolean>(false);
  isCreatingMovimiento = signal<boolean>(false);
  esCuentaCorriente = signal<boolean>(false);
  movimientoForm!: FormGroup;

  // rxResource para cargar tipos de cuenta
  tiposCuentaResource = rxResource({
    stream: () => {
      return this.accountsService.getAllTypeAccountingAccounts();
    }
  });

  constructor() {
    this.initializeMovimientoForm();
  }

  // Computed signal para obtener los datos del mes actual
  readonly metricasAcueductoMesActual = computed(() => {
    const data = this.metricasAcueductoService.enterpriceResolutionSignal();
    if (!data?.porMes || data.porMes.length === 0) return null;

    // Obtener el último mes del array (el más reciente)
    return data.porMes[data.porMes.length - 1];
  });

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
    { field: 'categoriaNombre', header: 'Categoría', type: 'text' as const },
    { field: 'total', header: 'Total', type: 'currency' as const },
    { field: 'usuarioCreacion', header: 'Usuario', type: 'text' as const },
    { field: 'fechaCreacion', header: 'Fecha', type: 'date' as const },
  ]);

  readonly movimientosColumns = signal([
    { field: 'nombre', header: 'Nombre', type: 'text' as const },
    { field: 'categoriaNombre', header: 'Categoría', type: 'text' as const },
    { field: 'valor', header: 'Valor', type: 'number' as const },
    { field: 'fechaCreacion', header: 'Fecha', type: 'date' as const },
  ]);

  readonly transformedAccountData = computed(() => {
    const rawData = this.cuentasTotalesService.transformedData();
    if (!rawData?.response) return [];

    return rawData.response.map((cuenta) => ({
      ...cuenta,
      categoriaNombre: cuenta.categoria?.nombre || '',
      fechaCreacion: this.formatDate(cuenta.fechaCreacion),
    }));
  });

  readonly transformedMovimientosData = computed(() => {
    const rawData = this.serverMovimientosData.value();
    if (!rawData?.response) return null;

    return {
      ...rawData,
      response: rawData.response.map((movimiento) => ({
        ...movimiento,
        categoriaNombre: movimiento.categoriaCuenta?.nombre || '',
        fechaCreacion: this.formatDate(movimiento.fechaCreacion),
      })),
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
      return this.accountingService
        .getServerMovimientosContables(enterpriseId, pagination)
        .pipe(
          catchError((error) => {
            return of(null);
          }),
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
      const date = new Date(
        Number.parseInt(year),
        Number.parseInt(month) - 1,
        Number.parseInt(day),
      );

      // Formatear como DD/MM/YYYY
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  }

  // ==================== GESTIÓN DE MOVIMIENTOS CONTABLES ====================

  private initializeMovimientoForm(): void {
    this.movimientoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      codigo: ['', [Validators.required]],
      valor: [0, [Validators.required, Validators.min(0.01)]],
      idTipoCuenta: ['', [Validators.required]],
      idNaturaleza: ['', [Validators.required]],
      idCategoriaCuenta: ['', [Validators.required]],
    });
  }

  openMovimientoModal(): void {
    this.movimientoForm.reset({
      nombre: '',
      codigo: '',
      valor: 0,
      idTipoCuenta: '',
      idNaturaleza: '',
      idCategoriaCuenta: '',
    });
    this.esCuentaCorriente.set(false);
    this.isMovimientoModalOpen.set(true);
  }

  closeMovimientoModal(): void {
    this.isMovimientoModalOpen.set(false);
    this.movimientoForm.reset();
    this.esCuentaCorriente.set(false);
  }

  onCuentaCorrienteChange(checked: boolean): void {
    this.esCuentaCorriente.set(checked);
  }

  createMovimiento(): void {
    if (this.movimientoForm.invalid) {
      this.movimientoForm.markAllAsTouched();
      return;
    }

    const enterpriseId = this.enterpriseId();
    if (!enterpriseId) {
      this.toastService.error('Error', 'No se pudo obtener el ID de la empresa');
      return;
    }

    this.isCreatingMovimiento.set(true);

    const formData = this.movimientoForm.value;
    const payload = {
      empresa: { id: enterpriseId },
      tipoCuenta: { id: Number(formData.idTipoCuenta) },
      naturaleza: { id: Number(formData.idNaturaleza) },
      categoriaCuenta: { id: Number(formData.idCategoriaCuenta) },
      nombre: formData.nombre,
      codigo: formData.codigo,
      valor: Number(formData.valor),
      corriente: this.esCuentaCorriente(),
      activo: true,
    };

    // Aquí deberías llamar al servicio real cuando esté disponible
    // Por ahora simulo éxito
    setTimeout(() => {
      this.toastService.success('Éxito', 'Movimiento contable creado correctamente');
      this.isCreatingMovimiento.set(false);
      this.closeMovimientoModal();
      // Recargar los datos
      this.serverMovimientosData.reload();
    }, 1000);

    // Cuando tengas el servicio, descomenta esto:
    /*
    this.accountingService.createMovimiento(payload).subscribe({
      next: (response) => {
        this.toastService.success('Éxito', 'Movimiento contable creado correctamente');
        this.isCreatingMovimiento.set(false);
        this.closeMovimientoModal();
        this.serverMovimientosData.reload();
      },
      error: (error) => {
        this.toastService.error('Error', 'No se pudo crear el movimiento contable');
        this.isCreatingMovimiento.set(false);
      }
    });
    */
  }
}
