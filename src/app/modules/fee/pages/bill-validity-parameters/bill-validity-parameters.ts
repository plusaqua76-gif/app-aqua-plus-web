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
} as const;

@Component({
  selector: 'app-bill-validity-parameters',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
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
                <i class="fas fa-hourglass-half text-2xl text-[#b9b7eeb9]"></i>
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
              class="group-hover:-top-3 bg-transparent -top-12 -right-12 absolute shadow-green-600 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-24 h-24"
            ></div>
            <div
              class="group-hover:top-44 bg-transparent top-32 right-14 absolute shadow-emerald-500 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-24 h-24"
            ></div>
            <div
              class="group-hover:-right-12 bg-transparent top-20 right-48 absolute shadow-green-700 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-20 h-20"
            ></div>
            <div
              class="group-hover:-top-32 bg-transparent top-8 right-8 absolute shadow-green-800 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-12 h-12"
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
              class="group-hover:-top-3 bg-transparent -top-12 -right-12 absolute shadow-orange-600 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-24 h-24"
            ></div>
            <div
              class="group-hover:top-44 bg-transparent top-32 right-14 absolute shadow-amber-500 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-24 h-24"
            ></div>
            <div
              class="group-hover:-right-12 bg-transparent top-20 right-48 absolute shadow-orange-700 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-20 h-20"
            ></div>
            <div
              class="group-hover:-top-32 bg-transparent top-8 right-8 absolute shadow-orange-800 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-12 h-12"
            ></div>

            <div class="relative z-10">
            <div class="flex items-start gap-4 mb-6">
              <div
                class="w-14 h-14 rounded-xl bg-gradient-to-br from-[#312f62a3] to-[#004fbb00] flex items-center justify-center flex-shrink-0"
              >
                <i class="fas fa-exclamation-triangle text-2xl text-[#b9b7eeb9]"></i>
              </div>
              <div class="flex-1">
                <h3
                  class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2"
                >
                  Estado: Vencida
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Periodos impagos para marcar como vencida
                </p>
              </div>
            </div>

            <div>
              <label
                class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 tracking-wider uppercase"
              >
                Periodos no pagos para marcar vencida
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
              class="group-hover:-top-3 bg-transparent -top-12 -right-12 absolute shadow-red-600 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-24 h-24"
            ></div>
            <div
              class="group-hover:top-44 bg-transparent top-32 right-14 absolute shadow-rose-500 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-24 h-24"
            ></div>
            <div
              class="group-hover:-right-12 bg-transparent top-20 right-48 absolute shadow-red-700 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-20 h-20"
            ></div>
            <div
              class="group-hover:-top-32 bg-transparent top-8 right-8 absolute shadow-red-800 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-12 h-12"
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
        </div>

        <!-- Action Buttons -->
        <div
          class="mt-8 flex items-center justify-end gap-4 pb-6"
        >
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
              <svg
                class="animate-spin h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
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
  `,
})
export class BillValidityParameters {
  private readonly toastService = inject(ToastService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly counterEnterpriceService = inject(CounterEnterpriceService);

  // Propiedades normales para ngModel (no signals)
  diasVigencia: number = 30;
  periodosFacturados: number = 1;
  periodosNoPagosVencida: number = 2;
  periodosPagoInmediato: number = 3;

  guardando = signal<boolean>(false);

  private paramIds = {
    diasVigencia: undefined as number | undefined,
    periodosFacturados: undefined as number | undefined,
    periodosVencida: undefined as number | undefined,
    periodosInmediato: undefined as number | undefined,
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
      diasVigencia: this.counterEnterpriceService.getParamsEnterprice(empresaId, PARAM_KEYS.DIAS_VIGENCIA),
      periodosFacturados: this.counterEnterpriceService.getParamsEnterprice(empresaId, PARAM_KEYS.PERIODOS_FACTURADOS),
      periodosVencida: this.counterEnterpriceService.getParamsEnterprice(empresaId, PARAM_KEYS.PERIODOS_VENCIDA),
      periodosInmediato: this.counterEnterpriceService.getParamsEnterprice(empresaId, PARAM_KEYS.PERIODOS_INMEDIATO),
    }).subscribe({
      next: (params) => {
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

        if (diasParam) {
          this.diasVigencia = Number(diasParam.valorParametro) || 30;
          this.paramIds.diasVigencia = diasParam.id;
        }
        if (periodosParam) {
          this.periodosFacturados = Number(periodosParam.valorParametro) || 1;
          this.paramIds.periodosFacturados = periodosParam.id;
        }
        if (vencidaParam) {
          this.periodosNoPagosVencida = Number(vencidaParam.valorParametro) || 2;
          this.paramIds.periodosVencida = vencidaParam.id;
        }
        if (inmediatoParam) {
          this.periodosPagoInmediato = Number(inmediatoParam.valorParametro) || 3;
          this.paramIds.periodosInmediato = inmediatoParam.id;
        }
      },
      error: (error) => {
        console.error('Error cargando parámetros:', error);
        this.toastService.error('Error', 'No se pudieron cargar los parámetros');
      }
    });
  }

  isFormValid(): boolean {
    return (
      this.diasVigencia > 0 &&
      this.periodosFacturados > 0 &&
      this.periodosNoPagosVencida > 0 &&
      this.periodosPagoInmediato > 0 &&
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
    ];

    forkJoin(
      params.map(param =>
        this.counterEnterpriceService.createParamsEnterprice(param).pipe(
          catchError(error => {
            console.error('Error guardando parámetro:', param.llave, error);
            return of(null);
          })
        )
      )
    ).subscribe({
      next: (results) => {
        this.guardando.set(false);
        const allSuccess = results.every(result => result !== null);

        if (allSuccess) {
          this.toastService.success('Éxito', 'Parámetros guardados correctamente');
          this.cargarParametros(empresaId);
        } else {
          this.toastService.error('Error parcial', 'Algunos parámetros no pudieron guardarse');
        }
      },
      error: (error) => {
        this.guardando.set(false);
        this.toastService.error('Error', 'No se pudieron guardar los parámetros');
        console.error('Error guardando parámetros:', error);
      },
    });
  }

  resetForm(): void {
    const empresaId = this.empresaId();
    if (empresaId) {
      this.cargarParametros(empresaId);
      this.toastService.info('Info', 'Formulario restablecido a valores guardados');
    } else {
      this.toastService.error('Error', 'No se pudo restablecer el formulario');
    }
  }
}
