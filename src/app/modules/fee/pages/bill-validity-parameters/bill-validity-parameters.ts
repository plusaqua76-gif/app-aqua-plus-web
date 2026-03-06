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

      /* Estilos para los inputs de número */
      input[type='number']::-webkit-inner-spin-button,
      input[type='number']::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      input[type='number'] {
        -moz-appearance: textfield;
      }
    `,
  ],
  template: `
    <div class="min-h-screen py-8 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div #feeRateContainer class="absolute top-4 right-4 z-10 ">
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
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1
            class="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-3"
          >
            Configuración Empresarial
          </h1>
          <p class="text-gray-600 dark:text-gray-400 text-lg">
            Configure los parámetros de tiempo y periodos para la gestión de
            facturas
          </p>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Card 1: Días de Vigencia -->
          <div
            class="group animated-bg relative overflow-hidden rounded-xl border border-[#312f62a3] bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl p-6 hover:shadow-2xl transition-all duration-300"
           >
            <!-- Animated circles -->
            <div
              class="group-hover:-top-3 bg-transparent -top-12 -right-12 absolute shadow-blue-600 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-24 h-24"
            ></div>
            <div
              class="group-hover:top-44 bg-transparent top-32 right-14 absolute shadow-blue-400 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-24 h-24"
            ></div>
            <div
              class="group-hover:-right-12 bg-transparent top-20 right-48 absolute shadow-sky-600 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-20 h-20"
            ></div>
            <div
              class="group-hover:-top-32 bg-transparent top-8 right-8 absolute shadow-blue-800 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-12 h-12"
            ></div>

            <div class="relative z-10">
              <div class="flex items-start gap-4 mb-6">
                <div
                  class="w-14 h-14 rounded-xl bg-gradient-to-br from-[#312f62a3] to-[#004fbb00] flex items-center justify-center flex-shrink-0"
                >
                  <i
                    class="fas fa-hourglass-half text-2xl text-[#b9b7eeb9]"
                  ></i>
                </div>
                <div class="flex-1">
                  <h3
                    class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2"
                  >
                    Días de Vigencia
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Tiempo que la factura permanece válida para pago
                  </p>
                </div>
              </div>

              <div>
                <label
                  class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 tracking-wider uppercase"
                >
                  Días de vigencia de la factura
                </label>
                <div class="relative">
                  <input
                    type="number"
                    [(ngModel)]="diasVigencia"
                    min="1"
                    max="365"
                    placeholder="días"
                    class="w-full px-4 py-3.5 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 text-lg font-medium"
                  />
                  <div
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm font-medium"
                  >
                    días
                  </div>
                </div>
                <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <i class="fas fa-info-circle mr-1"></i>
                  Número de días desde la emisión hasta el vencimiento
                </p>
              </div>
            </div>
          </div>

          <!-- Card 2: Periodos Facturados -->
          <div
            class="group animated-bg relative overflow-hidden rounded-xl border border-[#312f62a3] bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl p-6 hover:shadow-2xl transition-all duration-300"
          >
            <!-- Animated circles -->
            <div
              class="group-hover:-top-3 bg-transparent -top-12 -right-12 absolute shadow-blue-600 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-24 h-24"
            ></div>
            <div
              class="group-hover:top-44 bg-transparent top-32 right-14 absolute shadow-blue-400 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-24 h-24"
            ></div>
            <div
              class="group-hover:-right-12 bg-transparent top-20 right-48 absolute shadow-sky-600 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-20 h-20"
            ></div>
            <div
              class="group-hover:-top-32 bg-transparent top-8 right-8 absolute shadow-blue-800 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-12 h-12"
            ></div>


            <div class="relative z-10">
              <div class="flex items-start gap-4 mb-6">
                <div
                  class="w-14 h-14 rounded-xl bg-gradient-to-br from-[#312f62a3] to-[#004fbb00] flex items-center justify-center flex-shrink-0"
                >
                  <i class="fas fa-calendar-alt text-2xl text-[#b9b7eeb9]"></i>
                </div>
                <div class="flex-1">
                  <h3
                    class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2"
                  >
                    Periodos de Facturación
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Configuración de ciclos de facturación
                  </p>
                </div>
              </div>

              <div>
                <label
                  class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 tracking-wider uppercase"
                >
                  Periodos facturados
                </label>
                <div class="relative">
                  <input
                    type="number"
                    [(ngModel)]="periodosFacturados"
                    min="1"
                    max="24"
                    placeholder="Ej: 1 periodo"
                    class="w-full px-4 py-3.5 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 text-lg font-medium"
                  />
                  <div
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm font-medium"
                  >
                    periodos
                  </div>
                </div>
                <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <i class="fas fa-info-circle mr-1"></i>
                  Cantidad de periodos incluidos en cada factura
                </p>
              </div>
            </div>
          </div>

          <!-- Card 3: Periodos No Pagos -> Vencida -->
          <div
            class="group animated-bg relative overflow-hidden rounded-xl border border-[#312f62a3] bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl p-6 hover:shadow-2xl transition-all duration-300"
          >
            <!-- Animated circles -->
            <div
              class="group-hover:-top-3 bg-transparent -top-12 -right-12 absolute shadow-blue-600 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-24 h-24"
            ></div>
            <div
              class="group-hover:top-44 bg-transparent top-32 right-14 absolute shadow-blue-400 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-24 h-24"
            ></div>
            <div
              class="group-hover:-right-12 bg-transparent top-20 right-48 absolute shadow-sky-600 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-20 h-20"
            ></div>
            <div
              class="group-hover:-top-32 bg-transparent top-8 right-8 absolute shadow-blue-800 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-12 h-12"
            ></div>

            <div class="relative z-10">
              <div class="flex items-start gap-4 mb-6">
                <div
                  class="w-14 h-14 rounded-xl bg-gradient-to-br from-[#312f62a3] to-[#004fbb00] flex items-center justify-center flex-shrink-0"
                >
                  <i
                    class="fas fa-exclamation-triangle text-2xl text-[#b9b7eeb9]"
                  ></i>
                </div>
                <div class="flex-1">
                  <h3
                    class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2"
                  >
                    Estado: Aviso de Suspensión
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Periodos impagos para marcar como aviso de suspensión
                  </p>
                </div>
              </div>

              <div>
                <label
                  class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 tracking-wider uppercase"
                >
                  Periodos no pagos para marcar aviso de suspensión
                </label>
                <div class="relative">
                  <input
                    type="number"
                    [(ngModel)]="periodosNoPagosVencida"
                    min="1"
                    max="12"
                    placeholder="Ej: 2 periodos"
                    class="w-full px-4 py-3.5 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 text-lg font-medium"
                  />
                  <div
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm font-medium"
                  >
                    periodos
                  </div>
                </div>
                <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <i class="fas fa-info-circle mr-1"></i>
                  Número de periodos sin pagar para cambiar estado a vencida
                </p>
              </div>
            </div>
          </div>

          <!-- Card 4: Periodos -> Pago Inmediato -->
          <div
            class="group animated-bg relative overflow-hidden rounded-xl border border-[#312f62a3] bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl p-6 hover:shadow-2xl transition-all duration-300"
          >
            <!-- Animated circles -->
            <div
              class="group-hover:-top-3 bg-transparent -top-12 -right-12 absolute shadow-blue-600 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-24 h-24"
            ></div>
            <div
              class="group-hover:top-44 bg-transparent top-32 right-14 absolute shadow-blue-400 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-24 h-24"
            ></div>
            <div
              class="group-hover:-right-12 bg-transparent top-20 right-48 absolute shadow-sky-600 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-20 h-20"
            ></div>
            <div
              class="group-hover:-top-32 bg-transparent top-8 right-8 absolute shadow-blue-800 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-12 h-12"
            ></div>

            <div class="relative z-10">
              <div class="flex items-start gap-4 mb-6">
                <div
                  class="w-14 h-14 rounded-xl bg-gradient-to-br from-[#312f62a3] to-[#004fbb00] flex items-center justify-center flex-shrink-0"
                >
                  <i class="fas fa-bolt text-2xl text-[#b9b7eeb9]"></i>
                </div>
                <div class="flex-1">
                  <h3
                    class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2"
                  >
                    Pago Inmediato
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Periodos impagos para requerir pago inmediato
                  </p>
                </div>
              </div>

              <div>
                <label
                  class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 tracking-wider uppercase"
                >
                  Periodos para pago inmediato
                </label>
                <div class="relative">
                  <input
                    type="number"
                    [(ngModel)]="periodosPagoInmediato"
                    min="1"
                    max="12"
                    placeholder="Ej: 3 periodos"
                    class="w-full px-4 py-3.5 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 text-lg font-medium"
                  />
                  <div
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm font-medium"
                  >
                    periodos
                  </div>
                </div>
                <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <i class="fas fa-info-circle mr-1"></i>
                  Número de periodos sin pagar para requerir pago inmediato
                </p>
              </div>
            </div>
          </div>

          <!-- Card 5: Tasa de Interés -->
          <div
            class="group animated-bg relative overflow-hidden rounded-xl border border-[#312f62a3] bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl p-6 hover:shadow-2xl transition-all duration-300"
          >
            <!-- Animated circles -->
            <div
              class="group-hover:-top-3 bg-transparent -top-12 -right-12 absolute shadow-blue-600 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-24 h-24"
            ></div>
            <div
              class="group-hover:top-44 bg-transparent top-32 right-14 absolute shadow-blue-400 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-24 h-24"
            ></div>
            <div
              class="group-hover:-right-12 bg-transparent top-20 right-48 absolute shadow-sky-600 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-20 h-20"
            ></div>
            <div
              class="group-hover:-top-32 bg-transparent top-8 right-8 absolute shadow-blue-800 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-12 h-12"
            ></div>

            <div class="relative z-10">
              <div class="flex items-start gap-4 mb-6">
                <div
                  class="w-14 h-14 rounded-xl bg-gradient-to-br from-[#312f62a3] to-[#004fbb00] flex items-center justify-center flex-shrink-0"
                >
                  <i class="fas fa-percent text-2xl text-[#b9b7eeb9]"></i>
                </div>
                <div class="flex-1">
                  <h3
                    class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2"
                  >
                    Tasa de Interés
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Porcentaje de interés aplicado a deudas vencidas
                  </p>
                </div>
              </div>

              <div>
                <label
                  class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 tracking-wider uppercase"
                >
                  Tasa de interés de mora
                </label>
                <div class="relative">
                  <input
                    type="number"
                    [(ngModel)]="interesDeuda"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="Ej: 1.5"
                    class="w-full px-4 py-3.5 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 text-lg font-medium"
                  />
                  <div
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm font-medium"
                  >
                    %
                  </div>
                </div>
                <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <i class="fas fa-info-circle mr-1"></i>
                  Porcentaje de interés aplicado mensualmente sobre la deuda
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-8 flex items-center justify-end gap-4 pb-6">
          <button
            type="button"
            (click)="resetForm()"
            class="px-8 py-3.5 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 backdrop-blur-md text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-white/20 dark:hover:bg-slate-600/50 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
          >
            <i class="fas fa-undo mr-2"></i>
            Restablecer
          </button>

          <button
            type="button"
            (click)="guardarParametros()"
            [disabled]="!isFormValid() || guardando()"
            class="px-8 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3"
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
              <i class="fas fa-sync-alt"></i>
              <span>Actualizar</span>
            }
          </button>
        </div>
      </div>
    </div>

    <!-- Popup de Guía de Configuración con @defer -->
    @defer (on interaction(feeRateContainer)) {
      @if (showGuidePopup()) {
        <app-pop-up
          [open]="showGuidePopup"
          [title]="'Guía de Configuración de Vigencia de Facturas'"
          [isConfirmation]="false"
          [maxWidth]="'max-w-5xl'"
        >
          <div class="space-y-6">
            <div class="space-y-4">
              <div class="flex items-center gap-3 mb-3">
                <span
                  class="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#312f62a3] to-[#004fbb00] flex items-center justify-center text-white font-bold shadow-lg"
                >
                  1
                </span>
                <h3 class="text-xl font-bold text-gray-800 dark:text-white">
                  ¿Cómo funciona el sistema de estados?
                </h3>
              </div>
              <div
                class="space-y-4 text-base leading-relaxed text-gray-700 dark:text-gray-300 pl-12"
              >
                <p>
                  El sistema calcula automáticamente cuántos días han pasado
                  desde que se emitió la factura y, según los parámetros
                  configurados, le asigna un estado. Este estado determina las
                  acciones que se pueden tomar y las notificaciones que se
                  envían al cliente.
                </p>

                <div
                  class="p-5 rounded-xl bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 backdrop-blur-md"
                >
                  <p
                    class="text-sm font-semibold text-gray-800 dark:text-white mb-4 tracking-wide uppercase"
                  >
                    Flujo de estados de la factura:
                  </p>

                  <!-- Diagrama de flujo -->
                  <div class="space-y-4">
                    <!-- Estado Inicial: Emisión de Factura -->
                    <div class="flex items-center gap-4">
                      <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#312f62a3] to-[#004fbb00] flex items-center justify-center text-white font-bold shadow-lg">
                        <i class="fas fa-file-invoice"></i>
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-bold text-gray-800 dark:text-white">Día 0: Emisión de Factura</p>
                        <p class="text-xs text-gray-600 dark:text-gray-400">La factura se genera y se envía al cliente</p>
                      </div>
                    </div>

                    <!-- Flecha hacia abajo -->
                    <div class="flex justify-center">
                      <i class="fas fa-arrow-down text-gray-400 dark:text-gray-500 text-2xl"></i>
                    </div>

                    <!-- Estado 1: PENDIENTE -->
                    <div class="flex items-center gap-4 p-4 rounded-xl bg-gray-900 border border-white/20 dark:border-slate-400/30 backdrop-blur-md hover:bg-white/15 dark:hover:bg-slate-600/40 transition-all duration-300">
                      <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#312f62a3] to-[#004fbb00] flex items-center justify-center text-white font-bold shadow-lg">
                        1
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-bold text-green-800 dark:text-green-300 mb-1">
                          <i class="fas fa-clock mr-1"></i>
                          Estado: PENDIENTE
                        </p>
                        <p class="text-xs text-gray-700 dark:text-gray-300">
                          <strong>Condición:</strong> Días transcurridos menores o iguales a Días de Vigencia
                        </p>
                        <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Cliente puede pagar sin recargos
                        </p>
                      </div>
                    </div>

                    <!-- Flecha condicional -->
                    <div class="flex flex-col items-center">
                      <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Si días son mayores a Días de Vigencia</p>
                      <i class="fas fa-arrow-down text-gray-400 dark:text-gray-500 text-2xl"></i>
                    </div>

                    <!-- Estado 2: VENCIDA -->
                    <div class="flex items-center gap-4 p-4 rounded-xl bg-gray-900 border border-white/20 dark:border-slate-400/30 backdrop-blur-md hover:bg-white/15 dark:hover:bg-slate-600/40 transition-all duration-300">
                      <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#312f62a3] to-[#004fbb00] flex items-center justify-center text-white font-bold shadow-lg">
                        2
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-bold text-orange-800 dark:text-orange-300 mb-1">
                          <i class="fas fa-exclamation-triangle mr-1"></i>
                          Estado: VENCIDA
                        </p>
                        <p class="text-xs text-gray-700 dark:text-gray-300">
                          <strong>Condición:</strong> Días mayores a Días de Vigencia Y menores o iguales a Periodos para Aviso Suspensión
                        </p>
                        <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Se aplican intereses de mora
                        </p>
                      </div>
                    </div>

                    <!-- Flecha condicional -->
                    <div class="flex flex-col items-center">
                      <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Si días son mayores a Periodos Aviso Suspensión</p>
                      <i class="fas fa-arrow-down text-gray-400 dark:text-gray-500 text-2xl"></i>
                    </div>

                    <!-- Estado 3: AVISO SUSPENSIÓN -->
                    <div class="flex items-center gap-4 p-4 rounded-xl bg-gray-900 border border-white/20 dark:border-slate-400/30 backdrop-blur-md hover:bg-white/15 dark:hover:bg-slate-600/40 transition-all duration-300">
                      <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#312f62a3] to-[#004fbb00] flex items-center justify-center text-white font-bold shadow-lg">
                        3
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-bold text-red-800 dark:text-red-300 mb-1">
                          <i class="fas fa-exclamation-circle mr-1"></i>
                          Estado: AVISO SUSPENSIÓN
                        </p>
                        <p class="text-xs text-gray-700 dark:text-gray-300">
                          <strong>Condición:</strong> Días mayores a Periodos Aviso Suspensión Y menores o iguales a Periodos Pago Inmediato
                        </p>
                        <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Riesgo de suspensión del servicio
                        </p>
                      </div>
                    </div>

                    <!-- Flecha condicional -->
                    <div class="flex flex-col items-center">
                      <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Si días son mayores a Periodos Pago Inmediato</p>
                      <i class="fas fa-arrow-down text-gray-400 dark:text-gray-500 text-2xl"></i>
                    </div>

                    <!-- Estado 4: PAGO INMEDIATO -->
                    <div class="flex items-center gap-4 p-4 rounded-xl bg-gray-900 border border-white/20 dark:border-slate-400/30 backdrop-blur-md hover:bg-white/15 dark:hover:bg-slate-600/40 transition-all duration-300">
                      <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#312f62a3] to-[#004fbb00] flex items-center justify-center text-white font-bold shadow-lg">
                        4
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-bold text-rose-800 dark:text-rose-300 mb-1">
                          <i class="fas fa-bolt mr-1"></i>
                          Estado: PAGO INMEDIATO
                        </p>
                        <p class="text-xs text-gray-700 dark:text-gray-300">
                          <strong>Condición:</strong> Días mayores a Periodos Pago Inmediato
                        </p>
                        <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Suspensión del servicio - Acción crítica requerida
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Concepto 4: Recomendaciones -->
            <div class="space-y-4">
              <div class="flex items-center gap-3 mb-3">
                <span
                  class="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#312f62a3] to-[#004fbb00] flex items-center justify-center text-white font-bold shadow-lg"
                >
                  4
                </span>
                <h3 class="text-xl font-bold text-gray-800 dark:text-white">
                  Recomendaciones de configuración
                </h3>
              </div>
              <div
                class="space-y-3 text-sm text-gray-700 dark:text-gray-300 pl-12 mb-4"
              >
                <div
                  class="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700"
                >
                  <i
                    class="fas fa-lightbulb text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
                  ></i>
                  <div>
                    <p class="font-semibold text-gray-800 dark:text-white mb-1">
                      Días de Vigencia
                    </p>
                    <p>
                      Generalmente entre 10-20 días. Debe dar tiempo suficiente
                      para que el cliente reciba y procese el pago.
                    </p>
                  </div>
                </div>
                <div
                  class="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700"
                >
                  <i
                    class="fas fa-lightbulb text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
                  ></i>
                  <div>
                    <p class="font-semibold text-gray-800 dark:text-white mb-1">
                      Periodos para Vencida
                    </p>
                    <p>
                      Usualmente 1-2 periodos. Permite identificar facturas con
                      atraso moderado.
                    </p>
                  </div>
                </div>
                <div
                  class="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700"
                >
                  <i
                    class="fas fa-lightbulb text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
                  ></i>
                  <div>
                    <p class="font-semibold text-gray-800 dark:text-white mb-1">
                      Periodos Pago Inmediato
                    </p>
                    <p>
                      Típicamente 3-4 periodos. Marca el punto crítico antes de
                      acciones legales o suspensión definitiva.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Botón de cerrar -->
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
    } @placeholder {
      <!-- El contenido se carga al interactuar con el contenedor -->
    }
  `,
})
export class BillValidityParameters {
  private readonly toastService = inject(ToastService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly counterEnterpriceService = inject(CounterEnterpriceService);

  showGuidePopup = signal(false);
  diasVigencia: number = 0;
  periodosFacturados: number = 0;
  periodosNoPagosVencida: number = 0;
  periodosPagoInmediato: number = 0;
  interesDeuda: number = 0;

  guardando = signal<boolean>(false);

  private paramIds = {
    diasVigencia: undefined as number | undefined,
    periodosFacturados: undefined as number | undefined,
    periodosVencida: undefined as number | undefined,
    periodosInmediato: undefined as number | undefined,
    interesDeuda: undefined as number | undefined,
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
      diasVigencia: this.counterEnterpriceService.getParamsEnterprice(
        empresaId,
        PARAM_KEYS.DIAS_VIGENCIA,
      ),
      periodosFacturados: this.counterEnterpriceService.getParamsEnterprice(
        empresaId,
        PARAM_KEYS.PERIODOS_FACTURADOS,
      ),
      periodosVencida: this.counterEnterpriceService.getParamsEnterprice(
        empresaId,
        PARAM_KEYS.PERIODOS_VENCIDA,
      ),
      periodosInmediato: this.counterEnterpriceService.getParamsEnterprice(
        empresaId,
        PARAM_KEYS.PERIODOS_INMEDIATO,
      ),
      interesDeuda: this.counterEnterpriceService.getParamsEnterprice(
        empresaId,
        PARAM_KEYS.INTERES_DEUDA,
      ),
    }).subscribe({
      next: (params) => {
        console.log('Parámetros recibidos:', params);

        // El response puede ser un objeto o array, manejar ambos casos
        const diasParam = Array.isArray(params.diasVigencia.response)
          ? params.diasVigencia.response[0]
          : params.diasVigencia.response;
        const periodosParam = Array.isArray(params.periodosFacturados.response)
          ? params.periodosFacturados.response[0]
          : params.periodosFacturados.response;
        const vencidaParam = Array.isArray(params.periodosVencida.response)
          ? params.periodosVencida.response[0]
          : params.periodosVencida.response;
        const inmediatoParam = Array.isArray(params.periodosInmediato.response)
          ? params.periodosInmediato.response[0]
          : params.periodosInmediato.response;
        const interesParam = Array.isArray(params.interesDeuda.response)
          ? params.interesDeuda.response[0]
          : params.interesDeuda.response;

        console.log('Parámetros procesados:', {
          diasParam,
          periodosParam,
          vencidaParam,
          inmediatoParam,
          interesParam
        });

        if (diasParam && diasParam.valorParametro) {
          this.diasVigencia = Number(diasParam.valorParametro);
          this.paramIds.diasVigencia = diasParam.id;
          console.log('Días vigencia asignado:', this.diasVigencia);
        }
        if (periodosParam && periodosParam.valorParametro) {
          this.periodosFacturados = Number(periodosParam.valorParametro);
          this.paramIds.periodosFacturados = periodosParam.id;
          console.log('Periodos facturados asignado:', this.periodosFacturados);
        }
        if (vencidaParam && vencidaParam.valorParametro) {
          this.periodosNoPagosVencida = Number(vencidaParam.valorParametro);
          this.paramIds.periodosVencida = vencidaParam.id;
          console.log('Periodos vencida asignado:', this.periodosNoPagosVencida);
        }
        if (inmediatoParam && inmediatoParam.valorParametro) {
          this.periodosPagoInmediato = Number(inmediatoParam.valorParametro);
          this.paramIds.periodosInmediato = inmediatoParam.id;
          console.log('Periodos inmediato asignado:', this.periodosPagoInmediato);
        }
        if (interesParam && interesParam.valorParametro) {
          this.interesDeuda = Number(interesParam.valorParametro);
          this.paramIds.interesDeuda = interesParam.id;
          console.log('Interés deuda asignado:', this.interesDeuda);
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

  abrirGuia(): void {
    this.showGuidePopup.set(true);
  }

  cerrarGuia(): void {
    this.showGuidePopup.set(false);
  }

  isFormValid(): boolean {
    return (
      this.diasVigencia > 0 &&
      this.periodosFacturados > 0 &&
      this.periodosNoPagosVencida > 0 &&
      this.periodosPagoInmediato > 0 &&
      this.interesDeuda > 0 &&
      this.periodosNoPagosVencida < this.periodosPagoInmediato
    );
  }

  guardarParametros(): void {
    if (!this.isFormValid()) {
      this.toastService.error(
        'Error',
        'Por favor complete todos los campos correctamente. Los periodos para pago inmediato deben ser mayores que los de vencida.',
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
