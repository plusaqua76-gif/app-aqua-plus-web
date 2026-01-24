import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColombianCurrencyPipe } from '@shared/pipes/colombian-currency.pipe';

interface EmpleadoNomina {
  id: number;
  nombreCompleto: string;
  cedula: string;
  cargo: string;
  salarioBase: number;
}

interface Novedad {
  id: number;
  tipo: 'devengado' | 'deduccion';
  concepto: string;
  valor: number;
  descripcion?: string;
}

interface CalculoNomina {
  diasTrabajados: number;
  diasNoTrabajados: number;
  valorDia: number;
  salarioDevengado: number;
  totalDevengados: number;
  totalDeducciones: number;
  totalAPagar: number;
}

@Component({
  selector: 'app-payroll',
  imports: [CommonModule, ColombianCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen w-full p-4 sm:p-6">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          Liquidación de Nómina
        </h1>
        <p class="text-sm text-gray-500">Período: {{ periodoActual() }}</p>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Columna Principal (2/3) -->
        <div class="xl:col-span-2 space-y-6">
          <!-- Información del Empleado -->
          <div class="rounded-xl border border-[#312f62a3] bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl p-4 sm:p-6">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  Información del Empleado
                </h2>
                <p class="text-xs text-gray-500">Datos básicos del colaborador</p>
              </div>
              <button class="px-4 py-2 text-xs bg-gradient-to-br from-slate-700/20 to-blue-900/20 border border-slate-500/30 rounded-lg hover:scale-105 transition-transform text-gray-700 dark:text-gray-300">
                <i class="fas fa-edit mr-1"></i> Editar
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-3">
                <div>
                  <label class="text-xs text-gray-500 uppercase tracking-wider">Nombre Completo</label>
                  <p class="text-base font-semibold text-gray-800 dark:text-gray-200">
                    {{ empleado().nombreCompleto }}
                  </p>
                </div>
                <div>
                  <label class="text-xs text-gray-500 uppercase tracking-wider">Cédula</label>
                  <p class="text-base font-medium text-gray-700 dark:text-gray-300">
                    {{ empleado().cedula }}
                  </p>
                </div>
              </div>

              <div class="space-y-3">
                <div>
                  <label class="text-xs text-gray-500 uppercase tracking-wider">Cargo</label>
                  <p class="text-base font-medium text-gray-700 dark:text-gray-300">
                    {{ empleado().cargo }}
                  </p>
                </div>
                <div>
                  <label class="text-xs text-gray-500 uppercase tracking-wider">Salario Base</label>
                  <p class="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {{ empleado().salarioBase | colombianCurrency }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Días Trabajados -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Días del Período -->
            <div class="rounded-xl border border-[#312f62a3] bg-gradient-to-br from-[#767de600] to-[#1a18326b] backdrop-blur-xl p-4 relative overflow-hidden">
              <div class="absolute top-2 right-2 opacity-10">
                <i class="fas fa-calendar-days text-4xl text-blue-300"></i>
              </div>
              <p class="text-xs text-gray-400 uppercase tracking-wider mb-2">Días del Período</p>
              <p class="text-3xl font-bold text-gray-700 dark:text-gray-200">30</p>
              <p class="text-[10px] text-gray-500 mt-1">días hábiles</p>
            </div>

            <!-- Días Trabajados -->
            <div class="rounded-xl border border-[#312f62a3] bg-gradient-to-br from-[#767de600] to-[#1a18326b] backdrop-blur-xl p-4 relative overflow-hidden">
              <div class="absolute top-2 right-2 opacity-10">
                <i class="fas fa-check-circle text-4xl text-emerald-300"></i>
              </div>
              <p class="text-xs text-gray-400 uppercase tracking-wider mb-2">Días Trabajados</p>
              <p class="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {{ calculo().diasTrabajados }}
              </p>
              <p class="text-[10px] text-gray-500 mt-1">días efectivos</p>
            </div>

            <!-- Días No Trabajados -->
            <div class="rounded-xl border border-[#312f62a3] bg-gradient-to-br from-[#767de600] to-[#1a18326b] backdrop-blur-xl p-4 relative overflow-hidden">
              <div class="absolute top-2 right-2 opacity-10">
                <i class="fas fa-times-circle text-4xl text-red-300"></i>
              </div>
              <p class="text-xs text-gray-400 uppercase tracking-wider mb-2">Días No Trabajados</p>
              <p class="text-3xl font-bold text-red-600 dark:text-red-400">
                {{ calculo().diasNoTrabajados }}
              </p>
              <p class="text-[10px] text-gray-500 mt-1">ausencias</p>
            </div>
          </div>

          <!-- Valor por Día -->
          <div class="rounded-xl border border-slate-600/40 bg-gradient-to-br from-slate-700/10 to-blue-900/20 backdrop-blur-xl p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 mb-1">Valor por Día</p>
                <p class="text-3xl font-bold text-gray-800 dark:text-gray-200">
                  {{ calculo().valorDia | colombianCurrency }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-500 mb-1">Salario Devengado</p>
                <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {{ calculo().salarioDevengado | colombianCurrency }}
                </p>
                <p class="text-xs text-gray-400 mt-1">
                  {{ calculo().valorDia | colombianCurrency }} × {{ calculo().diasTrabajados }} días
                </p>
              </div>
            </div>
          </div>

          <!-- Novedades -->
          <div class="rounded-xl border border-[#312f62a3] bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl p-4 sm:p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
                <i class="fas fa-clipboard-list mr-2 text-orange-500"></i>
                Novedades
              </h2>
              <button class="px-3 py-1.5 text-xs bg-gradient-to-br from-slate-600/20 to-blue-800/20 border border-slate-500/30 rounded-lg hover:scale-105 transition-transform text-gray-700 dark:text-gray-300">
                <i class="fas fa-plus mr-1"></i> Agregar
              </button>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <!-- Devengados -->
              <div>
                <h3 class="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-3 flex items-center">
                  <i class="fas fa-arrow-up mr-2"></i>
                  Devengados
                </h3>
                <div class="space-y-2">
                  @for (novedad of novedadesDevengadas(); track novedad.id) {
                    <div class="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors">
                      <div class="flex justify-between items-start">
                        <div class="flex-1">
                          <p class="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {{ novedad.concepto }}
                          </p>
                          @if (novedad.descripcion) {
                            <p class="text-xs text-gray-500 mt-1">{{ novedad.descripcion }}</p>
                          }
                        </div>
                        <p class="text-sm font-bold text-emerald-600 dark:text-emerald-400 ml-2">
                          +{{ novedad.valor | colombianCurrency }}
                        </p>
                      </div>
                    </div>
                  }
                  @if (novedadesDevengadas().length === 0) {
                    <p class="text-xs text-gray-400 italic text-center py-4">No hay devengados adicionales</p>
                  }
                </div>
              </div>

              <!-- Deducciones -->
              <div>
                <h3 class="text-sm font-medium text-red-600 dark:text-red-400 mb-3 flex items-center">
                  <i class="fas fa-arrow-down mr-2"></i>
                  Deducciones
                </h3>
                <div class="space-y-2">
                  @for (novedad of novedadesDeducciones(); track novedad.id) {
                    <div class="p-3 rounded-lg bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-colors">
                      <div class="flex justify-between items-start">
                        <div class="flex-1">
                          <p class="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {{ novedad.concepto }}
                          </p>
                          @if (novedad.descripcion) {
                            <p class="text-xs text-gray-500 mt-1">{{ novedad.descripcion }}</p>
                          }
                        </div>
                        <p class="text-sm font-bold text-red-600 dark:text-red-400 ml-2">
                          -{{ novedad.valor | colombianCurrency }}
                        </p>
                      </div>
                    </div>
                  }
                  @if (novedadesDeducciones().length === 0) {
                    <p class="text-xs text-gray-400 italic text-center py-4">No hay deducciones</p>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Columna Resumen (1/3) -->
        <div class="space-y-6">
          <!-- Resumen de Liquidación -->
          <div class="rounded-xl border border-[#312f62a3] bg-gradient-to-br from-slate-500/10 to-blue-600/15 backdrop-blur-xl p-6 sticky top-6">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
              <i class="fas fa-calculator mr-2 text-blue-500"></i>
              Resumen de Liquidación
            </h2>

            <div class="space-y-4">
              <!-- Salario Base -->
              <div class="pb-3 border-b border-gray-300/20">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600 dark:text-gray-400">Salario Base</span>
                  <span class="text-base font-semibold text-gray-800 dark:text-gray-200">
                    {{ empleado().salarioBase | colombianCurrency }}
                  </span>
                </div>
              </div>

              <!-- Salario Devengado -->
              <div class="pb-3 border-b border-gray-300/20">
                <div class="flex justify-between items-center">
                  <div>
                    <span class="text-sm text-gray-600 dark:text-gray-400">Salario Devengado</span>
                    <p class="text-xs text-gray-500">{{ calculo().diasTrabajados }} días trabajados</p>
                  </div>
                  <span class="text-base font-semibold text-gray-800 dark:text-gray-200">
                    {{ calculo().salarioDevengado | colombianCurrency }}
                  </span>
                </div>
              </div>

              <!-- Total Devengados -->
              <div class="p-3 rounded-lg bg-emerald-500/10">
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    <i class="fas fa-plus-circle mr-1"></i>
                    Total Devengados
                  </span>
                  <span class="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {{ calculo().totalDevengados | colombianCurrency }}
                  </span>
                </div>
              </div>

              <!-- Total Deducciones -->
              <div class="p-3 rounded-lg bg-red-500/10">
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-red-700 dark:text-red-300">
                    <i class="fas fa-minus-circle mr-1"></i>
                    Total Deducciones
                  </span>
                  <span class="text-lg font-bold text-red-600 dark:text-red-400">
                    {{ calculo().totalDeducciones | colombianCurrency }}
                  </span>
                </div>
              </div>

              <!-- Línea divisoria -->
              <div class="border-t-2 border-blue-500/40 my-4"></div>

              <!-- TOTAL A PAGAR -->
              <div class="p-4 rounded-xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-2 border-blue-500/60">
                <div class="flex justify-between items-center">
                  <div>
                    <span class="text-xs text-gray-500 uppercase tracking-wider block">Total a Pagar</span>
                    <span class="text-sm font-medium text-blue-700 dark:text-blue-300">Neto</span>
                  </div>
                  <span class="text-3xl font-bold text-blue-700 dark:text-blue-300">
                    {{ calculo().totalAPagar | colombianCurrency }}
                  </span>
                </div>
              </div>

              <!-- Botones de Acción -->
              <div class="space-y-2 pt-4">
                <button class="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]">
                  <i class="fas fa-check-circle mr-2"></i>
                  Aprobar y Pagar
                </button>
                <button class="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 border border-gray-400/30 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-all duration-300">
                  <i class="fas fa-file-pdf mr-2"></i>
                  Generar Comprobante
                </button>
                <button class="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 border border-gray-400/30 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-all duration-300">
                  <i class="fas fa-print mr-2"></i>
                  Imprimir
                </button>
              </div>
            </div>
          </div>

          <!-- Info Adicional -->
          <div class="rounded-xl border border-blue-500/30 bg-blue-500/5 backdrop-blur-xl p-4">
            <div class="flex items-start">
              <i class="fas fa-info-circle text-blue-500 mr-3 mt-1"></i>
              <div>
                <p class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Información Importante
                </p>
                <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Verifique todos los datos antes de aprobar el pago. Una vez procesado, no se podrán realizar cambios.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class Payroll {
  // Datos de ejemplo - En producción vendrían de un servicio
  empleado = signal<EmpleadoNomina>({
    id: 1,
    nombreCompleto: 'Juan Carlos Pérez González',
    cedula: '1.234.567.890',
    cargo: 'Operador de Planta',
    salarioBase: 1500000
  });

  novedades = signal<Novedad[]>([
    {
      id: 1,
      tipo: 'devengado',
      concepto: 'Horas Extra',
      valor: 150000,
      descripcion: '10 horas extra diurnas'
    },
    {
      id: 2,
      tipo: 'devengado',
      concepto: 'Auxilio de Transporte',
      valor: 140606,
      descripcion: 'Auxilio legal de transporte'
    },
    {
      id: 3,
      tipo: 'deduccion',
      concepto: 'Salud (4%)',
      valor: 60000,
      descripcion: 'Aporte salud empleado'
    },
    {
      id: 4,
      tipo: 'deduccion',
      concepto: 'Pensión (4%)',
      valor: 60000,
      descripcion: 'Aporte pensión empleado'
    },
    {
      id: 5,
      tipo: 'deduccion',
      concepto: 'Préstamo',
      valor: 100000,
      descripcion: 'Cuota préstamo personal'
    }
  ]);

  // Computed signals
  novedadesDevengadas = signal<Novedad[]>(
    this.novedades().filter(n => n.tipo === 'devengado')
  );

  novedadesDeducciones = signal<Novedad[]>(
    this.novedades().filter(n => n.tipo === 'deduccion')
  );

  calculo = signal<CalculoNomina>({
    diasTrabajados: 28,
    diasNoTrabajados: 2,
    valorDia: this.empleado().salarioBase / 30,
    salarioDevengado: (this.empleado().salarioBase / 30) * 28,
    totalDevengados: ((this.empleado().salarioBase / 30) * 28) +
      this.novedades().filter(n => n.tipo === 'devengado').reduce((sum, n) => sum + n.valor, 0),
    totalDeducciones: this.novedades().filter(n => n.tipo === 'deduccion').reduce((sum, n) => sum + n.valor, 0),
    totalAPagar: (((this.empleado().salarioBase / 30) * 28) +
      this.novedades().filter(n => n.tipo === 'devengado').reduce((sum, n) => sum + n.valor, 0)) -
      this.novedades().filter(n => n.tipo === 'deduccion').reduce((sum, n) => sum + n.valor, 0)
  });

  periodoActual = signal<string>('Enero 2026');
}
