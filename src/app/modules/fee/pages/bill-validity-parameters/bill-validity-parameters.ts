import {
  Component,
  computed,
  inject,
  PLATFORM_ID,
  signal,
  effect,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import { ToastService } from '@services/toast.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, of, map, forkJoin } from 'rxjs';
import { CounterEnterpriceService } from '../../services/counter-enterprice.service';
import { ParamKey } from '@interfaces/params-enterprice/param-key';
import { PopupComponent } from '@shared/components/popUp';
import {
  getBillEstadoBadgeClass,
  getBillEstadoDisplayLabel,
} from '../../../../core/utils/bill-estado.util';

interface BillValidityParams {
  id?: number;
  diasVigenciaFactura: number;
  periodosFacturados: number;
  periodosNoPagosVencida: number;
  periodosPagoInmediato: number;
  empresaId: number;
  activo: boolean;
}

const PARAM_KEYS = {
  DIAS_VIGENCIA: 'DIAS_VENCIDA',
  PERIODOS_FACTURADOS: 'PERIODOS_FACT',
  PERIODOS_VENCIDA: 'PERIODOS_VIG',
  PERIODOS_INMEDIATO: 'PERIODOS_INM',
  INTERES_DEUDA: 'INTERES_DEUDA',
  PERIODOS_ANT: 'PERIODOS_ANT',
} as const;

@Component({
  selector: 'app-bill-validity-parameters',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, PopupComponent],
  styles: [
    `
      .animate-fadeIn {
        animation: fadeIn 0.4s ease-in-out;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      input[type='number']::-webkit-inner-spin-button,
      input[type='number']::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      input[type='number'] {
        -moz-appearance: textfield;
      }

      .state-flow-line {
        background: linear-gradient(
          90deg,
          transparent,
          rgba(185, 183, 238, 0.35) 20%,
          rgba(185, 183, 238, 0.35) 80%,
          transparent
        );
      }
    `,
  ],
  template: `
    <div class="animate-fadeIn">
      <div class="px-4 sm:px-6 lg:px-8 py-6">
        <div
          class="relative overflow-hidden shadow-2xl sm:rounded-2xl bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl border border-white/20 dark:border-slate-700/30"
        >
          <div class="relative p-6 sm:p-8">
            <div #feeRateContainer class="absolute top-4 right-4 z-10">
              <button
                type="button"
                #btnGuia
                (click)="abrirGuia()"
                class="relative cursor-pointer py-2 px-4 text-center inline-flex justify-center items-center gap-2 text-xs uppercase text-gray-300 rounded-xl border border-[#312f62a3] bg-gradient-to-br from-[#767de600] to-[#1a18326b] transition-transform duration-300 ease-in-out group outline-offset-2 focus:outline focus:outline-1 focus:outline-[#b9b7eeb9] focus:outline-offset-2 overflow-hidden hover:scale-105"
                title="Ver guía de configuración"
              >
                <span class="relative z-20 flex items-center gap-2">
                  <i class="fas fa-question-circle"></i>
                  <span class="hidden lg:inline">Ayuda</span>
                </span>
                <span
                  class="absolute left-[-75%] top-0 h-full w-[50%] bg-white/10 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out"
                ></span>
              </button>
            </div>

            <!-- Header -->
            <div class="mb-8 pr-24">
              <h1
                class="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2"
              >
                Configuración de vigencia y estados
              </h1>
              <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-3xl">
                Defina los tiempos de facturación y los umbrales que determinan
                cuándo una factura cambia de estado según las facturas vencidas
                del cliente.
              </p>
            </div>

            <!-- ═══ SECCIÓN 1: Tiempo y ciclos ═══ -->
            <section class="mb-8">
              <div class="flex items-center gap-3 mb-5">
                <span
                  class="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-[#312f62a3] to-[#004fbb00] flex items-center justify-center"
                >
                  <i class="fas fa-clock text-[#b9b7eeb9] text-sm"></i>
                </span>
                <div>
                  <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    Tiempo y ciclos de facturación
                  </h2>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Vigencia, periodos incluidos y facturación atrasada
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">
                <!-- Días de vigencia -->
                <div
                  class="xl:col-span-2 rounded-xl border border-white/15 dark:border-slate-600/30 bg-white/5 dark:bg-slate-900/20 p-5"
                >
                  <div class="flex items-start gap-3 mb-4">
                    <i class="fas fa-hourglass-half text-blue-400 mt-0.5"></i>
                    <div>
                      <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Días de vigencia
                      </h3>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Tiempo que la factura permanece en estado
                        <span [class]="badgePendiente">Pendiente</span>
                        antes de pasar a
                        <span [class]="badgeVencida">Vencida</span>
                      </p>
                    </div>
                  </div>

                  <div
                    class="p-4 rounded-xl bg-white/5 dark:bg-slate-800/30 border border-white/10 dark:border-slate-600/20 mb-4"
                  >
                    <p class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wider">
                      <i class="fas fa-calculator mr-1 text-blue-400"></i>
                      Calcular desde fechas
                    </p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Inicio facturación
                        </label>
                        <input
                          type="date"
                          [(ngModel)]="fechaInicioFacturacion"
                          (ngModelChange)="calcularDiasVigencia()"
                          [max]="fechaCorte"
                          class="w-full px-3 py-2 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-lg text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 [color-scheme:dark]"
                        />
                      </div>
                      <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Fecha de corte
                        </label>
                        <input
                          type="date"
                          [(ngModel)]="fechaCorte"
                          (ngModelChange)="calcularDiasVigencia()"
                          [min]="fechaInicioFacturacion"
                          class="w-full px-3 py-2 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-lg text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 [color-scheme:dark]"
                        />
                      </div>
                    </div>
                    @if (diasCalculados > 0) {
                      <div
                        class="mt-3 flex items-center gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20"
                      >
                        <i class="fas fa-check-circle text-blue-400 text-xs"></i>
                        <span class="text-xs text-blue-300 font-medium"
                          >{{ diasCalculados }} días aplicados</span
                        >
                      </div>
                    }
                    @if (errorFechas) {
                      <div
                        class="mt-3 flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20"
                      >
                        <i class="fas fa-exclamation-circle text-red-400 text-xs"></i>
                        <span class="text-xs text-red-300">{{ errorFechas }}</span>
                      </div>
                    }
                  </div>

                  <div class="relative max-w-[8rem]">
                    <input
                      type="number"
                      [(ngModel)]="diasVigencia"
                      min="1"
                      max="365"
                      placeholder="15"
                      class="w-full px-3 py-2.5 pr-10 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <span
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
                      >días</span
                    >
                  </div>
                </div>

                <!-- Periodos facturados + anteriores -->
                <div class="space-y-5">
                  <div
                    class="rounded-xl border border-white/15 dark:border-slate-600/30 bg-white/5 dark:bg-slate-900/20 p-5"
                  >
                    <label
                      class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider"
                    >
                      Periodos facturados
                    </label>
                    <div class="relative">
                      <input
                        type="number"
                        [(ngModel)]="periodosFacturados"
                        min="1"
                        max="24"
                        placeholder="1"
                        class="w-full px-3 py-2.5 pr-16 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                      <span
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
                        >periodos</span
                      >
                    </div>
                    <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Periodos incluidos en cada factura emitida
                    </p>
                  </div>

                  <div
                    class="rounded-xl border border-white/15 dark:border-slate-600/30 bg-white/5 dark:bg-slate-900/20 p-5"
                  >
                    <label
                      class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider"
                    >
                      Periodos anteriores
                    </label>
                    <div class="relative">
                      <input
                        type="number"
                        [(ngModel)]="periodosAnteriores"
                        min="0"
                        max="12"
                        placeholder="0"
                        class="w-full px-3 py-2.5 pr-16 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                      <span
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
                        >periodos</span
                      >
                    </div>
                    <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Para facturación mes atrasado. Use 0 para mes actual.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div class="h-px state-flow-line mb-8"></div>

            <!-- ═══ SECCIÓN 2: Flujo de estados (destacada) ═══ -->
            <section class="mb-8">
              <div class="flex items-center gap-3 mb-4">
                <span
                  class="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-[#312f62a3] to-[#004fbb00] flex items-center justify-center"
                >
                  <i class="fas fa-route text-[#b9b7eeb9] text-sm"></i>
                </span>
                <div>
                  <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    Escalamiento por facturas vencidas
                  </h2>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Los umbrales cuentan cuántas facturas en estado
                    <span [class]="badgeVencida">Vencida</span> tiene el cliente
                  </p>
                </div>
              </div>

              <!-- Aviso importante -->
              <!-- Pipeline visual de estados -->
              <div
                class="mb-6 p-5 rounded-xl border border-white/15 dark:border-slate-600/30 bg-white/5 dark:bg-slate-900/30 overflow-x-auto"
              >
                <p
                  class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4"
                >
                  Flujo de estados
                </p>
                <div
                  class="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0"
                >
                  <span [class]="badgePendiente">
                    <i class="fas fa-clock mr-1"></i>
                    {{ labelPendiente }}
                  </span>
                  <i class="fas fa-chevron-right text-gray-500 text-xs"></i>
                  <span class="text-xs text-gray-400 whitespace-nowrap"
                    >{{ diasVigencia || '?' }} días sin pago</span
                  >
                  <i class="fas fa-chevron-right text-gray-500 text-xs"></i>
                  <span [class]="badgeVencida">
                    <i class="fas fa-exclamation-triangle mr-1"></i>
                    {{ labelVencida }}
                  </span>
                  <i class="fas fa-chevron-right text-gray-500 text-xs"></i>
                  <span class="text-xs text-gray-400 whitespace-nowrap"
                    >{{ facturasVencidasTexto(periodosNoPagosVencida) }}</span
                  >
                  <i class="fas fa-chevron-right text-gray-500 text-xs"></i>
                  <span [class]="badgeAviso">
                    <i class="fas fa-bell mr-1"></i>
                    {{ labelAviso }}
                  </span>
                  <i class="fas fa-chevron-right text-gray-500 text-xs"></i>
                  <span class="text-xs text-gray-400 whitespace-nowrap"
                    >{{ facturasVencidasTexto(periodosPagoInmediato) }}</span
                  >
                  <i class="fas fa-chevron-right text-gray-500 text-xs"></i>
                  <span [class]="badgeInmediato">
                    <i class="fas fa-bolt mr-1"></i>
                    {{ labelInmediato }}
                  </span>
                </div>
              </div>

              <!-- Configuración de umbrales -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <!-- Aviso de suspensión -->
                <div
                  class="rounded-xl border border-white/15 dark:border-slate-600/30 bg-white/5 dark:bg-slate-900/30 p-5"
                >
                  <div class="flex items-center gap-2 mb-3">
                    <span [class]="badgeAviso">{{ labelAviso }}</span>
                  </div>
                  <label
                    class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider"
                  >
                    Facturas vencidas requeridas
                  </label>
                  <div class="relative max-w-[8rem] mb-3">
                    <input
                      type="number"
                      [(ngModel)]="periodosNoPagosVencida"
                      min="1"
                      max="12"
                      placeholder="2"
                      class="w-full px-3 py-2.5 pr-10 bg-white/10 dark:bg-slate-700/50 border border-orange-500/30 rounded-xl text-gray-900 dark:text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                    <span
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400/70 text-xs font-medium"
                      >venc.</span
                    >
                  </div>

                  <button
                    type="button"
                    (click)="abrirEjemplo('aviso')"
                    [disabled]="periodosNoPagosVencida <= 0"
                    class="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-200 hover:bg-orange-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <i class="fas fa-eye"></i>
                    Ver ejemplo
                  </button>
                </div>

                <!-- Pago inmediato -->
                <div
                  class="rounded-xl border border-white/15 dark:border-slate-600/30 bg-white/5 dark:bg-slate-900/30 p-5"
                >
                  <div class="flex items-center gap-2 mb-3">
                    <span [class]="badgeInmediato">{{ labelInmediato }}</span>
                  </div>
                  <label
                    class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider"
                  >
                    Facturas en Aviso de suspensión requeridas
                  </label>
                  <div class="relative max-w-[8rem] mb-3">
                    <input
                      type="number"
                      [(ngModel)]="periodosPagoInmediato"
                      min="1"
                      max="12"
                      placeholder="3"
                      class="w-full px-3 py-2.5 pr-10 bg-white/10 dark:bg-slate-700/50 border border-sky-500/30 rounded-xl text-gray-900 dark:text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                    />
                    <span
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-sky-400/70 text-xs font-medium"
                      >venc.</span
                    >
                  </div>

                  <button
                    type="button"
                    (click)="abrirEjemplo('inmediato')"
                    [disabled]="periodosPagoInmediato <= 0"
                    class="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-200 hover:bg-sky-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <i class="fas fa-eye"></i>
                    Ver ejemplo
                  </button>
                </div>
              </div>

              @if (
                periodosNoPagosVencida > 0 &&
                periodosPagoInmediato > 0 &&
                periodosNoPagosVencida >= periodosPagoInmediato
              ) {
                <div
                  class="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/25 flex items-center gap-2"
                >
                  <i class="fas fa-exclamation-triangle text-red-400"></i>
                  <span class="text-xs text-red-300">
                    Pago inmediato debe requerir más facturas vencidas que aviso
                    de suspensión (actualmente
                    {{ periodosNoPagosVencida }} ≥
                    {{ periodosPagoInmediato }}).
                  </span>
                </div>
              }
            </section>

            <div class="h-px state-flow-line mb-8"></div>

            <!-- ═══ SECCIÓN 3: Interés de mora ═══ -->
            <section class="mb-8">
              <div class="flex items-center gap-3 mb-5">
                <span
                  class="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-[#312f62a3] to-[#004fbb00] flex items-center justify-center"
                >
                  <i class="fas fa-percent text-[#b9b7eeb9] text-sm"></i>
                </span>
                <div>
                  <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    Interés de mora
                  </h2>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Porcentaje mensual aplicado sobre deudas vencidas
                  </p>
                </div>
              </div>

              <div
                class="max-w-xs rounded-xl border border-white/15 dark:border-slate-600/30 bg-white/5 dark:bg-slate-900/20 p-5"
              >
                <label
                  class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider"
                >
                  Tasa de interés
                </label>
                <div class="relative">
                  <input
                    type="number"
                    [(ngModel)]="interesDeuda"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="1.5"
                    class="w-full px-3 py-2.5 pr-8 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                  <span
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
                    >%</span
                  >
                </div>
              </div>
            </section>

            <!-- Acciones -->
            <div
              class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-white/10 dark:border-slate-600/20"
            >
              <button
                type="button"
                (click)="resetForm()"
                class="px-6 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-white/20 dark:hover:bg-slate-600/50 transition-all duration-200"
              >
                <i class="fas fa-undo mr-2"></i>
                Restablecer
              </button>

              <button
                type="button"
                (click)="guardarParametros()"
                [disabled]="!isFormValid() || guardando()"
                class="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                @if (guardando()) {
                  <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Actualizando...</span>
                } @else {
                  <i class="fas fa-save"></i>
                  <span>Guardar configuración</span>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    @defer (on interaction(feeRateContainer)) {
      @if (showGuidePopup()) {
        <app-pop-up
          [open]="showGuidePopup"
          [title]="'Guía de configuración de vigencia de facturas'"
          [isConfirmation]="false"
          [maxWidth]="'max-w-5xl'"
        >
          <div class="space-y-6">
            <div
              class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex gap-3"
            >
              <i class="fas fa-info-circle text-amber-400 mt-0.5"></i>
              <p class="text-sm text-gray-300 leading-relaxed">
                Los umbrales de
                <strong>Aviso de suspensión</strong> y
                <strong>Pago inmediato</strong> indican cuántas facturas en
                estado <strong>Vencida</strong> debe acumular el cliente. Un
                valor de <strong>2</strong> significa
                <strong>2 facturas vencidas</strong>, no la tercera factura
                emitida.
              </p>
            </div>

            <div class="space-y-4">
              <h3 class="text-lg font-bold text-gray-100">
                Flujo de estados
              </h3>
              <div class="space-y-3 pl-2">
                <div class="flex items-start gap-3">
                  <span [class]="badgePendiente">{{ labelPendiente }}</span>
                  <p class="text-sm text-gray-400">
                    Mientras la factura esté dentro de los
                    {{ diasVigencia || 'N' }} días de vigencia.
                  </p>
                </div>
                <div class="flex items-start gap-3">
                  <span [class]="badgeVencida">{{ labelVencida }}</span>
                  <p class="text-sm text-gray-400">
                    Cuando supera los días de vigencia sin pago. Se aplican
                    intereses de mora.
                  </p>
                </div>
                <div class="flex items-start gap-3">
                  <span [class]="badgeAviso">{{ labelAviso }}</span>
                  <p class="text-sm text-gray-400">
                    Cuando el cliente acumula
                    {{ periodosNoPagosVencida || 'N' }}
                    {{
                      periodosNoPagosVencida === 1
                        ? 'factura vencida'
                        : 'facturas vencidas'
                    }}.
                  </p>
                </div>
                <div class="flex items-start gap-3">
                  <span [class]="badgeInmediato">{{ labelInmediato }}</span>
                  <p class="text-sm text-gray-400">
                    Cuando el cliente acumula
                    {{ periodosPagoInmediato || 'N' }}
                    {{
                      periodosPagoInmediato === 1
                        ? 'factura vencida'
                        : 'facturas vencidas'
                    }}. Acción crítica requerida.
                  </p>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <h3 class="text-lg font-bold text-gray-100">Recomendaciones</h3>
              <ul class="space-y-2 text-sm text-gray-400 pl-4 list-disc">
                <li>Días de vigencia: generalmente entre 10 y 20 días.</li>
                <li>
                  Aviso de suspensión: suele configurarse con 1–2 facturas
                  vencidas.
                </li>
                <li>
                  Pago inmediato: típicamente 3–4 facturas vencidas, siempre
                  mayor que aviso de suspensión.
                </li>
              </ul>
            </div>
          </div>

          <div
            class="flex justify-end pt-6 border-t border-white/10 dark:border-slate-400/20"
          >
            <button
              type="button"
              (click)="cerrarGuia()"
              class="relative cursor-pointer py-3 px-6 text-center inline-flex justify-center text-sm uppercase text-gray-300 rounded-xl border border-[#312f62a3] bg-gradient-to-br from-[#767de600] to-[#1a18326b] transition-transform duration-300 ease-in-out group outline-offset-2 focus:outline focus:outline-1 focus:outline-[#b9b7eeb9] focus:outline-offset-2 overflow-hidden hover:scale-105"
            >
              <span class="relative z-20 flex items-center gap-2">
                <i class="fas fa-check-circle"></i>
                Entendido
              </span>
              <span
                class="absolute left-[-75%] top-0 h-full w-[50%] bg-white/10 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out"
              ></span>
            </button>
          </div>
        </app-pop-up>
      }
    } @placeholder {}

    @if (showEjemploPopup()) {
      <app-pop-up
        [open]="showEjemploPopup"
        [title]="ejemploTituloPopup()"
        [isConfirmation]="false"
        [maxWidth]="'max-w-2xl'"
        [contentPadding]="'p-6 sm:p-8'"
      >
        <div class="space-y-5">
          <p class="text-sm text-gray-400 leading-relaxed">
            Vista previa del escalamiento con el valor configurado actualmente.
          </p>

          <div
            class="p-4 sm:p-5 rounded-xl bg-white/5 dark:bg-slate-800/40 border border-white/10"
          >
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider font-semibold">
              Escalamiento
            </p>
            <div class="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              @for (n of rangoFacturas(ejemploCantidadActual()); track n) {
                @if (ejemploPopupTipo() === 'aviso') {
                  <div
                    class="flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 min-w-[5rem]"
                  >
                    <i class="fas fa-file-invoice text-red-400"></i>
                    <span class="text-[11px] text-gray-400">Factura {{ n }}</span>
                    <span [class]="badgeVencida + ' !text-[10px] !px-2 !py-0.5'"
                      >{{ labelVencida }}</span
                    >
                  </div>
                } @else {
                  <div
                    class="flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 min-w-[5rem]"
                  >
                    <i class="fas fa-file-invoice text-orange-400"></i>
                    <span class="text-[11px] text-gray-400">Factura {{ n }}</span>
                    <span [class]="badgeAviso + ' !text-[10px] !px-2 !py-0.5'"
                      >{{ labelAviso }}</span
                    >
                  </div>
                }
              }
              <i
                class="fas fa-arrow-right text-lg mx-1"
                [class.text-orange-400]="ejemploPopupTipo() === 'aviso'"
                [class.text-sky-400]="ejemploPopupTipo() === 'inmediato'"
              ></i>
              @if (ejemploPopupTipo() === 'aviso') {
                <div
                  class="flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-lg bg-orange-500/15 border border-orange-500/30"
                >
                  <i class="fas fa-bell text-orange-400 text-lg"></i>
                  <span [class]="badgeAviso">{{ labelAviso }}</span>
                </div>
              } @else {
                <div
                  class="flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-lg bg-sky-500/15 border border-sky-500/30"
                >
                  <i class="fas fa-bolt text-sky-400 text-lg"></i>
                  <span [class]="badgeInmediato">{{ labelInmediato }}</span>
                </div>
              }
            </div>

            <p
              class="mt-5 text-sm leading-relaxed text-center"
              [class.text-orange-200]="ejemploPopupTipo() === 'aviso'"
              [class.text-sky-200]="ejemploPopupTipo() === 'inmediato'"
            >
              Con <strong>{{ ejemploCantidadActual() }}</strong>
              {{ ejemploFacturasPrevioTexto() }}, el cliente entra en
              <strong>{{ ejemploEstadoDestinoLabel() }}</strong>.
            </p>
          </div>

          <div
            class="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex gap-2"
          >
            <i class="fas fa-lightbulb text-amber-400 text-xs mt-0.5"></i>
            @if (ejemploPopupTipo() === 'aviso') {
              <p class="text-xs text-gray-400 leading-relaxed">
                Recuerde: el número indica cuántas facturas ya están en estado
                <span [class]="badgeVencida">{{ labelVencida }}</span>, no la
                posición de la próxima factura a emitir.
              </p>
            } @else {
              <p class="text-xs text-gray-400 leading-relaxed">
                Recuerde: el número indica cuántas facturas ya están en estado
                <span [class]="badgeAviso">AVISO DE SUSPENSIÓN</span>, no la
                posición de la próxima factura a emitir.
              </p>
            }
          </div>
        </div>

        <div
          class="flex justify-end pt-6 mt-2 border-t border-white/10 dark:border-slate-400/20"
        >
          <button
            type="button"
            (click)="cerrarEjemplo()"
            class="relative cursor-pointer py-2.5 px-5 text-center inline-flex justify-center text-sm uppercase text-gray-300 rounded-xl border border-[#312f62a3] bg-gradient-to-br from-[#767de600] to-[#1a18326b] transition-transform duration-300 ease-in-out group outline-offset-2 focus:outline focus:outline-1 focus:outline-[#b9b7eeb9] focus:outline-offset-2 overflow-hidden hover:scale-105"
          >
            <span class="relative z-20 flex items-center gap-2">
              <i class="fas fa-check-circle"></i>
              Entendido
            </span>
            <span
              class="absolute left-[-75%] top-0 h-full w-[50%] bg-white/10 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out"
            ></span>
          </button>
        </div>
      </app-pop-up>
    }
  `,
})
export class BillValidityParameters {
  private readonly toastService = inject(ToastService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly counterEnterpriceService = inject(CounterEnterpriceService);

  showGuidePopup = signal(false);
  showEjemploPopup = signal(false);
  ejemploPopupTipo = signal<'aviso' | 'inmediato'>('aviso');

  readonly badgePendiente = getBillEstadoBadgeClass('PENDIENTE');
  readonly badgeVencida = getBillEstadoBadgeClass('VENCIDA');
  readonly badgeAviso = getBillEstadoBadgeClass('AVISO_DE_SUSPENSION');
  readonly badgeInmediato = getBillEstadoBadgeClass('PAGO_INMEDIATO');
  readonly labelPendiente = getBillEstadoDisplayLabel('PENDIENTE');
  readonly labelVencida = getBillEstadoDisplayLabel('VENCIDA');
  readonly labelAviso = getBillEstadoDisplayLabel('AVISO_DE_SUSPENSION');
  readonly labelInmediato = getBillEstadoDisplayLabel('PAGO_INMEDIATO');

  diasVigencia: number = 0;
  fechaInicioFacturacion: string = '';
  fechaCorte: string = '';
  diasCalculados: number = 0;
  errorFechas: string = '';
  periodosFacturados: number = 0;
  periodosNoPagosVencida: number = 0;
  periodosPagoInmediato: number = 0;
  interesDeuda: number = 0;
  periodosAnteriores: number = 0;

  guardando = signal<boolean>(false);

  private paramIds = {
    diasVigencia: undefined as number | undefined,
    periodosFacturados: undefined as number | undefined,
    periodosVencida: undefined as number | undefined,
    periodosInmediato: undefined as number | undefined,
    interesDeuda: undefined as number | undefined,
    periodosAnteriores: undefined as number | undefined,
  };

  readonly empresaId = computed(() => {
    if (!this.isBrowser) return 0;
    try {
      const userDataString = sessionStorage.getItem('userData');
      if (!userDataString) return 0;
      const userData = JSON.parse(userDataString);
      return userData?.empresaId || 0;
    } catch (e) {
      return 0;
    }
  });

  readonly usuarioCreacion = computed(() => {
    if (!this.isBrowser) return '';
    try {
      const userDataString = sessionStorage.getItem('userData');
      if (!userDataString) return '';
      const userData = JSON.parse(userDataString);
      return userData?.nombre || '';
    } catch (e) {
      return '';
    }
  });

  // Cargar parámetros al inicializar
  constructor() {
    effect(() => {
      const empresaId = this.empresaId();
      if (empresaId) {
        this.cargarParametros(empresaId);
      }
    });
  }

  private cargarParametros(empresaId: number): void {
    forkJoin({
      diasVigencia: this.counterEnterpriceService
        .getParamsEnterprice(empresaId, PARAM_KEYS.DIAS_VIGENCIA)
        .pipe(catchError(() => of({ response: null }))),
      periodosFacturados: this.counterEnterpriceService
        .getParamsEnterprice(empresaId, PARAM_KEYS.PERIODOS_FACTURADOS)
        .pipe(catchError(() => of({ response: null }))),
      periodosVencida: this.counterEnterpriceService
        .getParamsEnterprice(empresaId, PARAM_KEYS.PERIODOS_VENCIDA)
        .pipe(catchError(() => of({ response: null }))),
      periodosInmediato: this.counterEnterpriceService
        .getParamsEnterprice(empresaId, PARAM_KEYS.PERIODOS_INMEDIATO)
        .pipe(catchError(() => of({ response: null }))),
      interesDeuda: this.counterEnterpriceService
        .getParamsEnterprice(empresaId, PARAM_KEYS.INTERES_DEUDA)
        .pipe(catchError(() => of({ response: null }))),
      periodosAnteriores: this.counterEnterpriceService
        .getParamsEnterprice(empresaId, PARAM_KEYS.PERIODOS_ANT)
        .pipe(catchError(() => of({ response: null }))),
    }).subscribe({
      next: (params) => {
        // El response puede ser un objeto o array, manejar ambos casos
        const diasParam =
          params.diasVigencia.response &&
          (Array.isArray(params.diasVigencia.response)
            ? params.diasVigencia.response[0]
            : params.diasVigencia.response);
        const periodosParam =
          params.periodosFacturados.response &&
          (Array.isArray(params.periodosFacturados.response)
            ? params.periodosFacturados.response[0]
            : params.periodosFacturados.response);
        const vencidaParam =
          params.periodosVencida.response &&
          (Array.isArray(params.periodosVencida.response)
            ? params.periodosVencida.response[0]
            : params.periodosVencida.response);
        const inmediatoParam =
          params.periodosInmediato.response &&
          (Array.isArray(params.periodosInmediato.response)
            ? params.periodosInmediato.response[0]
            : params.periodosInmediato.response);
        const interesParam =
          params.interesDeuda.response &&
          (Array.isArray(params.interesDeuda.response)
            ? params.interesDeuda.response[0]
            : params.interesDeuda.response);
        const anterioresParam =
          params.periodosAnteriores.response &&
          (Array.isArray(params.periodosAnteriores.response)
            ? params.periodosAnteriores.response[0]
            : params.periodosAnteriores.response);

        if (diasParam && diasParam.valorParametro !== undefined) {
          this.diasVigencia = Number(diasParam.valorParametro);
          this.paramIds.diasVigencia = diasParam.id;
        }
        if (periodosParam && periodosParam.valorParametro !== undefined) {
          this.periodosFacturados = Number(periodosParam.valorParametro);
          this.paramIds.periodosFacturados = periodosParam.id;
        }
        if (vencidaParam && vencidaParam.valorParametro !== undefined) {
          this.periodosNoPagosVencida = Number(vencidaParam.valorParametro);
          this.paramIds.periodosVencida = vencidaParam.id;
        }
        if (inmediatoParam && inmediatoParam.valorParametro !== undefined) {
          this.periodosPagoInmediato = Number(inmediatoParam.valorParametro);
          this.paramIds.periodosInmediato = inmediatoParam.id;
        }
        if (interesParam && interesParam.valorParametro !== undefined) {
          this.interesDeuda = Number(interesParam.valorParametro);
          this.paramIds.interesDeuda = interesParam.id;
        }
        if (anterioresParam && anterioresParam.valorParametro !== undefined) {
          this.periodosAnteriores = Number(anterioresParam.valorParametro);
          this.paramIds.periodosAnteriores = anterioresParam.id;
        }
      },
      error: (error) => {
        console.error('Error cargando parámetros:', error);
        this.toastService.error(
          'Error',
          'No se pudieron cargar los parámetros',
        );
      },
    });
  }

  calcularDiasVigencia(): void {
    this.errorFechas = '';
    this.diasCalculados = 0;

    if (!this.fechaInicioFacturacion || !this.fechaCorte) return;

    const inicio = new Date(this.fechaInicioFacturacion);
    const corte = new Date(this.fechaCorte);

    if (corte <= inicio) {
      this.errorFechas = 'La fecha de corte debe ser posterior al inicio de facturación.';
      return;
    }

    const diffTime = corte.getTime() - inicio.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    this.diasCalculados = diffDays;
    this.diasVigencia = diffDays;
  }

  abrirGuia(): void {
    this.showGuidePopup.set(true);
  }

  cerrarGuia(): void {
    this.showGuidePopup.set(false);
  }

  abrirEjemplo(tipo: 'aviso' | 'inmediato'): void {
    this.ejemploPopupTipo.set(tipo);
    this.showEjemploPopup.set(true);
  }

  cerrarEjemplo(): void {
    this.showEjemploPopup.set(false);
  }

  ejemploTituloPopup(): string {
    return this.ejemploPopupTipo() === 'aviso'
      ? `Ejemplo: ${this.labelAviso}`
      : `Ejemplo: ${this.labelInmediato}`;
  }

  ejemploCantidadActual(): number {
    return this.ejemploPopupTipo() === 'aviso'
      ? this.periodosNoPagosVencida
      : this.periodosPagoInmediato;
  }

  ejemploEstadoDestinoLabel(): string {
    return this.ejemploPopupTipo() === 'aviso'
      ? this.labelAviso
      : this.labelInmediato;
  }

  ejemploFacturasPrevioTexto(): string {
    const n = this.ejemploCantidadActual();
    if (this.ejemploPopupTipo() === 'aviso') {
      return n === 1 ? 'factura vencida' : 'facturas vencidas';
    }
    return n === 1
      ? 'factura en aviso de suspensión'
      : 'facturas en aviso de suspensión';
  }

  facturasVencidasTexto(cantidad: number): string {
    if (!cantidad || cantidad <= 0) return '? facturas vencidas';
    return cantidad === 1
      ? '1 factura vencida'
      : `${cantidad} facturas vencidas`;
  }

  rangoFacturas(cantidad: number): number[] {
    const n = Math.max(0, Math.min(Math.floor(cantidad) || 0, 6));
    return Array.from({ length: n }, (_, i) => i + 1);
  }

  isFormValid(): boolean {
    return (
      this.diasVigencia > 0 &&
      this.periodosFacturados > 0 &&
      this.periodosNoPagosVencida > 0 &&
      this.periodosPagoInmediato > 0 &&
      this.interesDeuda >= 0 &&
      this.periodosAnteriores >= 0 &&
      this.periodosNoPagosVencida < this.periodosPagoInmediato
    );
  }

  guardarParametros(): void {
    if (!this.isFormValid()) {
      this.toastService.error(
        'Error',
        'Complete todos los campos. Pago inmediato debe requerir más facturas vencidas que aviso de suspensión.',
      );
      return;
    }

    this.guardando.set(true);

    const empresaId = this.empresaId();
    const usuario = this.usuarioCreacion();

    const params: ParamKey[] = [
      {
        id: this.paramIds.diasVigencia,
        empresa: { id: empresaId },
        llave: PARAM_KEYS.DIAS_VIGENCIA,
        valorParametro: String(this.diasVigencia),
        activo: true,
        usuarioCreacion: usuario,
      },
      {
        id: this.paramIds.periodosFacturados,
        empresa: { id: empresaId },
        llave: PARAM_KEYS.PERIODOS_FACTURADOS,
        valorParametro: String(this.periodosFacturados),
        activo: true,
        usuarioCreacion: usuario,
      },
      {
        id: this.paramIds.periodosVencida,
        empresa: { id: empresaId },
        llave: PARAM_KEYS.PERIODOS_VENCIDA,
        valorParametro: String(this.periodosNoPagosVencida),
        activo: true,
        usuarioCreacion: usuario,
      },
      {
        id: this.paramIds.periodosInmediato,
        empresa: { id: empresaId },
        llave: PARAM_KEYS.PERIODOS_INMEDIATO,
        valorParametro: String(this.periodosPagoInmediato),
        activo: true,
        usuarioCreacion: usuario,
      },
      {
        id: this.paramIds.interesDeuda,
        empresa: { id: empresaId },
        llave: PARAM_KEYS.INTERES_DEUDA,
        valorParametro: String(this.interesDeuda),
        activo: true,
        usuarioCreacion: usuario,
      },
      {
        id: this.paramIds.periodosAnteriores,
        empresa: { id: empresaId },
        llave: PARAM_KEYS.PERIODOS_ANT,
        valorParametro: String(this.periodosAnteriores),
        activo: true,
        usuarioCreacion: usuario,
      },
    ];

    forkJoin(
      params.map((param) =>
        this.counterEnterpriceService.createParamsEnterprice(param).pipe(
          catchError((error) => {
            console.error('Error guardando parámetro:', param.llave, error);
            return of(null);
          }),
        ),
      ),
    ).subscribe({
      next: (results) => {
        this.guardando.set(false);
        const allSuccess = results.every((result) => result !== null);

        if (allSuccess) {
          this.toastService.success(
            'Éxito',
            'Parámetros guardados correctamente',
          );
          this.cargarParametros(empresaId);
        } else {
          this.toastService.error(
            'Error parcial',
            'Algunos parámetros no pudieron guardarse',
          );
        }
      },
      error: (error) => {
        this.guardando.set(false);
        this.toastService.error(
          'Error',
          'No se pudieron guardar los parámetros',
        );
        console.error('Error guardando parámetros:', error);
      },
    });
  }

  resetForm(): void {
    const empresaId = this.empresaId();
    if (empresaId) {
      this.cargarParametros(empresaId);
      this.toastService.info(
        'Info',
        'Formulario restablecido a valores guardados',
      );
    } else {
      this.toastService.error('Error', 'No se pudo restablecer el formulario');
    }
  }
}
