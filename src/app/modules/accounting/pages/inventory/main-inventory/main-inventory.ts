import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Legends } from '@components/charts/legends';

@Component({
  selector: 'app-main-inventory',
  imports: [CommonModule, Legends],
  template: `
    <div class="w-full h-full min-h-screen ">
      <!-- Header Section -->
      <div class="px-4 sm:px-6 lg:px-8 py-6">
        <div class="mb-6">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            <i class="fas fa-calculator mr-3 text-blue-600 dark:text-blue-400"></i>
            Módulo de Contabilidad
          </h1>
          <p class="text-gray-600 dark:text-gray-400 text-lg">
            Sistema integral de gestión contable y financiera del acueducto
          </p>
        </div>

        <!-- KPIs Section - Métricas Clave -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <!-- Ingresos Totales Mensuales -->
          <div class="relative overflow-hidden shadow-2xl rounded-2xl bg-white/30 dark:bg-slate-800/30 backdrop-blur-xl border border-white/40 dark:border-slate-700/40 p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-green-500/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-green-600 dark:text-green-400 text-sm font-medium uppercase tracking-wide">Ingresos Mensuales</p>
                <h3 class="text-4xl font-bold text-gray-900 dark:text-white mt-2">$45.8M</h3>
                <p class="text-green-600 dark:text-green-400 text-xs mt-2">
                  <i class="fas fa-arrow-up mr-1"></i>
                  <span class="font-semibold">+12.5%</span> vs mes anterior
                </p>
              </div>
              <div class="bg-green-500/20 dark:bg-green-500/30 backdrop-blur-sm p-4 rounded-full border border-green-500/30">
                <i class="fas fa-hand-holding-dollar text-4xl text-green-600 dark:text-green-400"></i>
              </div>
            </div>
            <div class="absolute -bottom-2 -right-2 opacity-5 dark:opacity-10">
              <i class="fas fa-chart-line text-9xl text-green-600 dark:text-green-400"></i>
            </div>
          </div>

          <!-- Costos Operativos Mensuales -->
          <div class="relative overflow-hidden shadow-2xl rounded-2xl bg-white/30 dark:bg-slate-800/30 backdrop-blur-xl border border-white/40 dark:border-slate-700/40 p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-orange-500/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-orange-600 dark:text-orange-400 text-sm font-medium uppercase tracking-wide">Costos Operativos</p>
                <h3 class="text-4xl font-bold text-gray-900 dark:text-white mt-2">$28.3M</h3>
                <p class="text-orange-600 dark:text-orange-400 text-xs mt-2">
                  <i class="fas fa-arrow-down mr-1"></i>
                  <span class="font-semibold">-3.2%</span> vs mes anterior
                </p>
              </div>
              <div class="bg-orange-500/20 dark:bg-orange-500/30 backdrop-blur-sm p-4 rounded-full border border-orange-500/30">
                <i class="fas fa-receipt text-4xl text-orange-600 dark:text-orange-400"></i>
              </div>
            </div>
            <div class="absolute -bottom-2 -right-2 opacity-5 dark:opacity-10">
              <i class="fas fa-coins text-9xl text-orange-600 dark:text-orange-400"></i>
            </div>
          </div>

          <!-- Utilidad Neta Mensual -->
          <div class="relative overflow-hidden shadow-2xl rounded-2xl bg-white/30 dark:bg-slate-800/30 backdrop-blur-xl border border-white/40 dark:border-slate-700/40 p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-blue-500/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-blue-600 dark:text-blue-400 text-sm font-medium uppercase tracking-wide">Utilidad Neta</p>
                <h3 class="text-4xl font-bold text-gray-900 dark:text-white mt-2">$17.5M</h3>
                <p class="text-blue-600 dark:text-blue-400 text-xs mt-2">
                  <i class="fas fa-arrow-up mr-1"></i>
                  <span class="font-semibold">+38.2%</span> margen de utilidad
                </p>
              </div>
              <div class="bg-blue-500/20 dark:bg-blue-500/30 backdrop-blur-sm p-4 rounded-full border border-blue-500/30">
                <i class="fas fa-chart-pie text-4xl text-blue-600 dark:text-blue-400"></i>
              </div>
            </div>
            <div class="absolute -bottom-2 -right-2 opacity-5 dark:opacity-10">
              <i class="fas fa-sack-dollar text-9xl text-blue-600 dark:text-blue-400"></i>
            </div>
          </div>
        </div>

        <!-- Gráfica de Tendencias -->
        <div class="mb-8">
          <app-legends></app-legends>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">

          <!-- Plan de Cuentas Contables -->
          <div class="relative overflow-hidden shadow-2xl rounded-2xl bg-white/30 dark:bg-slate-800/30 backdrop-blur-xl border border-white/40 dark:border-slate-700/40">
            <div class="bg-blue-600/20 dark:bg-blue-600/30 backdrop-blur-md border-b border-white/20 dark:border-slate-700/30 p-6">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    <i class="fas fa-book-open mr-3 text-blue-600 dark:text-blue-400"></i>
                    Plan de Cuentas Contables
                  </h2>
                  <p class="text-gray-700 dark:text-gray-300 text-sm mt-1">Estructura contable del acueducto</p>
                </div>
                <button class="bg-blue-500/20 hover:bg-blue-500/30 backdrop-blur-sm px-4 py-2 rounded-lg text-blue-700 dark:text-blue-300 font-medium transition-all border border-blue-500/30 hover:border-blue-500/50">
                  <i class="fas fa-plus mr-2"></i>Nueva Cuenta
                </button>
              </div>
            </div>

            <div class="p-6 max-h-[600px] overflow-y-auto">
              <!-- Activos -->
              <div class="mb-6">
                <div class="flex items-center mb-3 bg-emerald-500/15 dark:bg-emerald-500/25 backdrop-blur-sm p-3 rounded-lg border-l-4 border-l-emerald-500 border border-emerald-500/20">
                  <i class="fas fa-wallet text-2xl text-emerald-600 dark:text-emerald-400 mr-3"></i>
                  <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200">ACTIVOS</h3>
                  <span class="ml-auto text-emerald-600 dark:text-emerald-400 font-bold text-lg">$125.5M</span>
                </div>
                <div class="space-y-2 pl-4">
                  <div class="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-700/40 backdrop-blur-sm rounded-lg hover:bg-white/80 dark:hover:bg-slate-700/60 transition-all cursor-pointer border border-white/50 dark:border-slate-600/50 hover:shadow-lg">
                    <div class="flex items-center">
                      <span class="text-sm font-mono text-gray-600 dark:text-gray-400 mr-3 bg-gray-200/50 dark:bg-slate-800/50 backdrop-blur-sm px-2 py-1 rounded border border-gray-300/30 dark:border-slate-700/30">1105</span>
                      <span class="text-gray-800 dark:text-gray-200 font-medium">Caja General</span>
                    </div>
                    <span class="text-gray-700 dark:text-gray-300 font-semibold">$2.8M</span>
                  </div>
                  <div class="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-700/40 backdrop-blur-sm rounded-lg hover:bg-white/80 dark:hover:bg-slate-700/60 transition-all cursor-pointer border border-white/50 dark:border-slate-600/50 hover:shadow-lg">
                    <div class="flex items-center">
                      <span class="text-sm font-mono text-gray-600 dark:text-gray-400 mr-3 bg-gray-200/50 dark:bg-slate-800/50 backdrop-blur-sm px-2 py-1 rounded border border-gray-300/30 dark:border-slate-700/30">1110</span>
                      <span class="text-gray-800 dark:text-gray-200 font-medium">Bancos</span>
                    </div>
                    <span class="text-gray-700 dark:text-gray-300 font-semibold">$45.2M</span>
                  </div>
                  <div class="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-700/40 backdrop-blur-sm rounded-lg hover:bg-white/80 dark:hover:bg-slate-700/60 transition-all cursor-pointer border border-white/50 dark:border-slate-600/50 hover:shadow-lg">
                    <div class="flex items-center">
                      <span class="text-sm font-mono text-gray-600 dark:text-gray-400 mr-3 bg-gray-200/50 dark:bg-slate-800/50 backdrop-blur-sm px-2 py-1 rounded border border-gray-300/30 dark:border-slate-700/30">1305</span>
                      <span class="text-gray-800 dark:text-gray-200 font-medium">Cuentas por Cobrar - Clientes</span>
                    </div>
                    <span class="text-gray-700 dark:text-gray-300 font-semibold">$35.6M</span>
                  </div>
                  <div class="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-700/40 backdrop-blur-sm rounded-lg hover:bg-white/80 dark:hover:bg-slate-700/60 transition-all cursor-pointer border border-white/50 dark:border-slate-600/50 hover:shadow-lg">
                    <div class="flex items-center">
                      <span class="text-sm font-mono text-gray-600 dark:text-gray-400 mr-3 bg-gray-200/50 dark:bg-slate-800/50 backdrop-blur-sm px-2 py-1 rounded border border-gray-300/30 dark:border-slate-700/30">1520</span>
                      <span class="text-gray-800 dark:text-gray-200 font-medium">Maquinaria y Equipo</span>
                    </div>
                    <span class="text-gray-700 dark:text-gray-300 font-semibold">$41.9M</span>
                  </div>
                </div>
              </div>

              <!-- Pasivos -->
              <div class="mb-6">
                <div class="flex items-center mb-3 bg-red-500/15 dark:bg-red-500/25 backdrop-blur-sm p-3 rounded-lg border-l-4 border-red-500">
                  <i class="fas fa-file-invoice-dollar text-2xl text-red-600 dark:text-red-400 mr-3"></i>
                  <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200">PASIVOS</h3>
                  <span class="ml-auto text-red-600 dark:text-red-400 font-bold text-lg">$42.3M</span>
                </div>
                <div class="space-y-2 pl-4">
                  <div class="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-700/40 backdrop-blur-sm rounded-lg hover:bg-white/80 dark:hover:bg-slate-700/60 transition-all cursor-pointer border border-white/50 dark:border-slate-600/50 hover:shadow-lg">
                    <div class="flex items-center">
                      <span class="text-sm font-mono text-gray-600 dark:text-gray-400 mr-3 bg-gray-200/50 dark:bg-slate-800/50 backdrop-blur-sm px-2 py-1 rounded border border-gray-300/30 dark:border-slate-700/30">2205</span>
                      <span class="text-gray-800 dark:text-gray-200 font-medium">Proveedores Nacionales</span>
                    </div>
                    <span class="text-gray-700 dark:text-gray-300 font-semibold">$8.5M</span>
                  </div>
                  <div class="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-700/40 backdrop-blur-sm rounded-lg hover:bg-white/80 dark:hover:bg-slate-700/60 transition-all cursor-pointer border border-white/50 dark:border-slate-600/50 hover:shadow-lg">
                    <div class="flex items-center">
                      <span class="text-sm font-mono text-gray-600 dark:text-gray-400 mr-3 bg-gray-200/50 dark:bg-slate-800/50 backdrop-blur-sm px-2 py-1 rounded border border-gray-300/30 dark:border-slate-700/30">2335</span>
                      <span class="text-gray-800 dark:text-gray-200 font-medium">Costos y Gastos por Pagar</span>
                    </div>
                    <span class="text-gray-700 dark:text-gray-300 font-semibold">$12.8M</span>
                  </div>
                  <div class="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-700/40 backdrop-blur-sm rounded-lg hover:bg-white/80 dark:hover:bg-slate-700/60 transition-all cursor-pointer border border-white/50 dark:border-slate-600/50 hover:shadow-lg">
                    <div class="flex items-center">
                      <span class="text-sm font-mono text-gray-600 dark:text-gray-400 mr-3 bg-gray-200/50 dark:bg-slate-800/50 backdrop-blur-sm px-2 py-1 rounded border border-gray-300/30 dark:border-slate-700/30">2505</span>
                      <span class="text-gray-800 dark:text-gray-200 font-medium">Obligaciones Financieras</span>
                    </div>
                    <span class="text-gray-700 dark:text-gray-300 font-semibold">$21.0M</span>
                  </div>
                </div>
              </div>

              <!-- Ingresos -->
              <div class="mb-6">
                <div class="flex items-center mb-3 bg-blue-500/15 dark:bg-blue-500/25 backdrop-blur-sm p-3 rounded-lg border-l-4 border-blue-500">
                  <i class="fas fa-arrow-trend-up text-2xl text-blue-600 dark:text-blue-400 mr-3"></i>
                  <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200">INGRESOS</h3>
                  <span class="ml-auto text-blue-600 dark:text-blue-400 font-bold text-lg">$45.8M</span>
                </div>
                <div class="space-y-2 pl-4">
                  <div class="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-700/40 backdrop-blur-sm rounded-lg hover:bg-white/80 dark:hover:bg-slate-700/60 transition-all cursor-pointer border border-white/50 dark:border-slate-600/50 hover:shadow-lg">
                    <div class="flex items-center">
                      <span class="text-sm font-mono text-gray-600 dark:text-gray-400 mr-3 bg-gray-200/50 dark:bg-slate-800/50 backdrop-blur-sm px-2 py-1 rounded border border-gray-300/30 dark:border-slate-700/30">4135</span>
                      <span class="text-gray-800 dark:text-gray-200 font-medium">Facturación Servicio de Agua</span>
                    </div>
                    <span class="text-gray-700 dark:text-gray-300 font-semibold">$38.5M</span>
                  </div>
                  <div class="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-700/40 backdrop-blur-sm rounded-lg hover:bg-white/80 dark:hover:bg-slate-700/60 transition-all cursor-pointer border border-white/50 dark:border-slate-600/50 hover:shadow-lg">
                    <div class="flex items-center">
                      <span class="text-sm font-mono text-gray-600 dark:text-gray-400 mr-3 bg-gray-200/50 dark:bg-slate-800/50 backdrop-blur-sm px-2 py-1 rounded border border-gray-300/30 dark:border-slate-700/30">4140</span>
                      <span class="text-gray-800 dark:text-gray-200 font-medium">Reconexiones y Servicios</span>
                    </div>
                    <span class="text-gray-700 dark:text-gray-300 font-semibold">$5.2M</span>
                  </div>
                  <div class="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-700/40 backdrop-blur-sm rounded-lg hover:bg-white/80 dark:hover:bg-slate-700/60 transition-all cursor-pointer border border-white/50 dark:border-slate-600/50 hover:shadow-lg">
                    <div class="flex items-center">
                      <span class="text-sm font-mono text-gray-600 dark:text-gray-400 mr-3 bg-gray-200/50 dark:bg-slate-800/50 backdrop-blur-sm px-2 py-1 rounded border border-gray-300/30 dark:border-slate-700/30">4295</span>
                      <span class="text-gray-800 dark:text-gray-200 font-medium">Otros Ingresos Operacionales</span>
                    </div>
                    <span class="text-gray-700 dark:text-gray-300 font-semibold">$2.1M</span>
                  </div>
                </div>
              </div>

              <!-- Gastos -->
              <div>
                <div class="flex items-center mb-3 bg-amber-500/15 dark:bg-amber-500/25 backdrop-blur-sm p-3 rounded-lg border-l-4 border-amber-500">
                  <i class="fas fa-chart-line-down text-2xl text-amber-600 dark:text-amber-400 mr-3"></i>
                  <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200">GASTOS OPERATIVOS</h3>
                  <span class="ml-auto text-amber-600 dark:text-amber-400 font-bold text-lg">$28.3M</span>
                </div>
                <div class="space-y-2 pl-4">
                  <div class="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-700/40 backdrop-blur-sm rounded-lg hover:bg-white/80 dark:hover:bg-slate-700/60 transition-all cursor-pointer border border-white/50 dark:border-slate-600/50 hover:shadow-lg">
                    <div class="flex items-center">
                      <span class="text-sm font-mono text-gray-600 dark:text-gray-400 mr-3 bg-gray-200/50 dark:bg-slate-800/50 backdrop-blur-sm px-2 py-1 rounded border border-gray-300/30 dark:border-slate-700/30">5105</span>
                      <span class="text-gray-800 dark:text-gray-200 font-medium">Gastos de Personal</span>
                    </div>
                    <span class="text-gray-700 dark:text-gray-300 font-semibold">$15.2M</span>
                  </div>
                  <div class="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-700/40 backdrop-blur-sm rounded-lg hover:bg-white/80 dark:hover:bg-slate-700/60 transition-all cursor-pointer border border-white/50 dark:border-slate-600/50 hover:shadow-lg">
                    <div class="flex items-center">
                      <span class="text-sm font-mono text-gray-600 dark:text-gray-400 mr-3 bg-gray-200/50 dark:bg-slate-800/50 backdrop-blur-sm px-2 py-1 rounded border border-gray-300/30 dark:border-slate-700/30">5135</span>
                      <span class="text-gray-800 dark:text-gray-200 font-medium">Mantenimiento y Reparaciones</span>
                    </div>
                    <span class="text-gray-700 dark:text-gray-300 font-semibold">$8.5M</span>
                  </div>
                  <div class="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-700/40 backdrop-blur-sm rounded-lg hover:bg-white/80 dark:hover:bg-slate-700/60 transition-all cursor-pointer border border-white/50 dark:border-slate-600/50 hover:shadow-lg">
                    <div class="flex items-center">
                      <span class="text-sm font-mono text-gray-600 dark:text-gray-400 mr-3 bg-gray-200/50 dark:bg-slate-800/50 backdrop-blur-sm px-2 py-1 rounded border border-gray-300/30 dark:border-slate-700/30">5195</span>
                      <span class="text-gray-800 dark:text-gray-200 font-medium">Servicios Públicos</span>
                    </div>
                    <span class="text-gray-700 dark:text-gray-300 font-semibold">$4.6M</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Registro de Pagos e Historial -->
          <div class="relative overflow-hidden shadow-2xl rounded-2xl bg-white/30 dark:bg-slate-800/30 backdrop-blur-xl border border-white/40 dark:border-slate-700/40">
            <div class="bg-purple-600/20 dark:bg-purple-600/30 backdrop-blur-md border-b border-white/20 dark:border-slate-700/30 p-6">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    <i class="fas fa-money-bill-transfer mr-3 text-purple-600 dark:text-purple-400"></i>
                    Registro de Pagos e Historial
                  </h2>
                  <p class="text-gray-700 dark:text-gray-300 text-sm mt-1">Últimas transacciones registradas</p>
                </div>
                <button class="bg-purple-500/20 hover:bg-purple-500/30 backdrop-blur-sm px-4 py-2 rounded-lg text-purple-700 dark:text-purple-300 font-medium transition-all border border-purple-500/30 hover:border-purple-500/50">
                  <i class="fas fa-filter mr-2"></i>Filtrar
                </button>
              </div>
            </div>

            <div class="p-6 max-h-[600px] overflow-y-auto">
              <div class="space-y-3">
                <!-- Pago 1 -->
                <div class="bg-white/60 dark:bg-slate-700/40 backdrop-blur-sm rounded-xl p-4 border-l-4 border-l-green-500 hover:shadow-xl transition-all cursor-pointer border border-white/50 dark:border-slate-600/50">
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center">
                      <div class="bg-green-500/20 dark:bg-green-500/30 backdrop-blur-sm p-3 rounded-lg mr-4 border border-green-500/30">
                        <i class="fas fa-circle-check text-2xl text-green-600 dark:text-green-400"></i>
                      </div>
                      <div>
                        <h4 class="font-bold text-gray-800 dark:text-gray-200">Pago de Factura #FAC-2024-1258</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Cliente: María González Rodríguez</p>
                        <div class="flex items-center gap-3 mt-1">
                          <span class="text-xs bg-green-500/20 dark:bg-green-500/30 backdrop-blur-sm text-green-700 dark:text-green-300 px-2 py-1 rounded-full border border-green-500/30">
                            <i class="fas fa-check-circle mr-1"></i>Pagado
                          </span>
                          <span class="text-xs text-gray-500 dark:text-gray-400">
                            <i class="far fa-calendar mr-1"></i>08 Dic 2024, 14:32
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-2xl font-bold text-green-600 dark:text-green-400">$85,500</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">Transferencia</p>
                    </div>
                  </div>
                </div>

                <!-- Pago 2 -->
                <div class="bg-white/60 dark:bg-slate-700/40 backdrop-blur-sm rounded-xl p-4 border-l-4 border-l-blue-500 hover:shadow-xl transition-all cursor-pointer border border-white/50 dark:border-slate-600/50">
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center">
                      <div class="bg-blue-500/20 dark:bg-blue-500/30 backdrop-blur-sm p-3 rounded-lg mr-4 border border-blue-500/30">
                        <i class="fas fa-clock text-2xl text-blue-600 dark:text-blue-400"></i>
                      </div>
                      <div>
                        <h4 class="font-bold text-gray-800 dark:text-gray-200">Pago Parcial #FAC-2024-1245</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Cliente: Juan Carlos Pérez</p>
                        <div class="flex items-center gap-3 mt-1">
                          <span class="text-xs bg-blue-500/20 dark:bg-blue-500/30 backdrop-blur-sm text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full border border-blue-500/30">
                            <i class="fas fa-clock mr-1"></i>Pendiente
                          </span>
                          <span class="text-xs text-gray-500 dark:text-gray-400">
                            <i class="far fa-calendar mr-1"></i>07 Dic 2024, 10:15
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">$45,000</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">Efectivo</p>
                    </div>
                  </div>
                </div>

                <!-- Pago 3 -->
                <div class="bg-white/60 dark:bg-slate-700/40 backdrop-blur-sm rounded-xl p-4 border-l-4 border-l-green-500 hover:shadow-xl transition-all cursor-pointer border border-white/50 dark:border-slate-600/50">
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center">
                      <div class="bg-green-500/20 dark:bg-green-500/30 backdrop-blur-sm p-3 rounded-lg mr-4 border border-green-500/30">
                        <i class="fas fa-circle-check text-2xl text-green-600 dark:text-green-400"></i>
                      </div>
                      <div>
                        <h4 class="font-bold text-gray-800 dark:text-gray-200">Pago Empresa #FAC-2024-1198</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Cliente: Hotel Los Pinos S.A.S</p>
                        <div class="flex items-center gap-3 mt-1">
                          <span class="text-xs bg-green-500/20 dark:bg-green-500/30 backdrop-blur-sm text-green-700 dark:text-green-300 px-2 py-1 rounded-full border border-green-500/30">
                            <i class="fas fa-check-circle mr-1"></i>Pagado
                          </span>
                          <span class="text-xs text-gray-500 dark:text-gray-400">
                            <i class="far fa-calendar mr-1"></i>06 Dic 2024, 16:45
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-2xl font-bold text-green-600 dark:text-green-400">$1,250,000</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">PSE</p>
                    </div>
                  </div>
                </div>

                <!-- Pago 4 -->
                <div class="bg-white/60 dark:bg-slate-700/40 backdrop-blur-sm rounded-xl p-4 border-l-4 border-l-red-500 hover:shadow-xl transition-all cursor-pointer border border-white/50 dark:border-slate-600/50">
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center">
                      <div class="bg-red-500/20 dark:bg-red-500/30 backdrop-blur-sm p-3 rounded-lg mr-4 border border-red-500/30">
                        <i class="fas fa-circle-exclamation text-2xl text-red-600 dark:text-red-400"></i>
                      </div>
                      <div>
                        <h4 class="font-bold text-gray-800 dark:text-gray-200">Pago Rechazado #FAC-2024-1234</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Cliente: Ana María Torres</p>
                        <div class="flex items-center gap-3 mt-1">
                          <span class="text-xs bg-red-500/20 dark:bg-red-500/30 backdrop-blur-sm text-red-700 dark:text-red-300 px-2 py-1 rounded-full border border-red-500/30">
                            <i class="fas fa-times-circle mr-1"></i>Rechazado
                          </span>
                          <span class="text-xs text-gray-500 dark:text-gray-400">
                            <i class="far fa-calendar mr-1"></i>05 Dic 2024, 09:22
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-2xl font-bold text-red-600 dark:text-red-400">$62,800</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">Tarjeta</p>
                    </div>
                  </div>
                </div>

                <!-- Pago 5 -->
                <div class="bg-white/60 dark:bg-slate-700/40 backdrop-blur-sm rounded-xl p-4 border-l-4 border-l-green-500 hover:shadow-xl transition-all cursor-pointer border border-white/50 dark:border-slate-600/50">
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center">
                      <div class="bg-green-500/20 dark:bg-green-500/30 backdrop-blur-sm p-3 rounded-lg mr-4 border border-green-500/30">
                        <i class="fas fa-circle-check text-2xl text-green-600 dark:text-green-400"></i>
                      </div>
                      <div>
                        <h4 class="font-bold text-gray-800 dark:text-gray-200">Pago de Factura #FAC-2024-1189</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Cliente: Roberto Sánchez López</p>
                        <div class="flex items-center gap-3 mt-1">
                          <span class="text-xs bg-green-500/20 dark:bg-green-500/30 backdrop-blur-sm text-green-700 dark:text-green-300 px-2 py-1 rounded-full border border-green-500/30">
                            <i class="fas fa-check-circle mr-1"></i>Pagado
                          </span>
                          <span class="text-xs text-gray-500 dark:text-gray-400">
                            <i class="far fa-calendar mr-1"></i>04 Dic 2024, 11:50
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-2xl font-bold text-green-600 dark:text-green-400">$73,200</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">Efectivo</p>
                    </div>
                  </div>
                </div>

                <!-- Pago 6 -->
                <div class="bg-white/60 dark:bg-slate-700/40 backdrop-blur-sm rounded-xl p-4 border-l-4 border-l-green-500 hover:shadow-xl transition-all cursor-pointer border border-white/50 dark:border-slate-600/50">
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center">
                      <div class="bg-green-500/20 dark:bg-green-500/30 backdrop-blur-sm p-3 rounded-lg mr-4 border border-green-500/30">
                        <i class="fas fa-circle-check text-2xl text-green-600 dark:text-green-400"></i>
                      </div>
                      <div>
                        <h4 class="font-bold text-gray-800 dark:text-gray-200">Pago Múltiple #FAC-2024-1167</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Cliente: Centro Comercial Plaza Mayor</p>
                        <div class="flex items-center gap-3 mt-1">
                          <span class="text-xs bg-green-500/20 dark:bg-green-500/30 backdrop-blur-sm text-green-700 dark:text-green-300 px-2 py-1 rounded-full border border-green-500/30">
                            <i class="fas fa-check-circle mr-1"></i>Pagado
                          </span>
                          <span class="text-xs text-gray-500 dark:text-gray-400">
                            <i class="far fa-calendar mr-1"></i>03 Dic 2024, 15:30
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-2xl font-bold text-green-600 dark:text-green-400">$2,850,000</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">Transferencia</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reportes Contables Section -->
        <div class="relative overflow-hidden shadow-2xl rounded-2xl bg-white/30 dark:bg-slate-800/30 backdrop-blur-xl border border-white/40 dark:border-slate-700/40 mb-8">
          <div class="bg-indigo-600/20 dark:bg-indigo-600/30 backdrop-blur-md border-b border-white/20 dark:border-slate-700/30 p-6">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <i class="fas fa-file-pdf mr-3 text-indigo-600 dark:text-indigo-400"></i>
                  Reportes Contables
                </h2>
                <p class="text-gray-700 dark:text-gray-300 text-sm mt-1">Generación de informes financieros en PDF</p>
              </div>
            </div>
          </div>

          <div class="p-8">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <!-- Reporte de Ingresos -->
              <div class="group relative">
                <div class="bg-white/40 dark:bg-slate-700/40 backdrop-blur-xl rounded-xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-emerald-500/30 hover:border-emerald-500/50">
                  <div class="bg-emerald-500/20 dark:bg-emerald-500/30 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-emerald-500/30">
                    <i class="fas fa-arrow-trend-up text-3xl text-emerald-600 dark:text-emerald-400"></i>
                  </div>
                  <h3 class="text-gray-900 dark:text-white font-bold text-lg mb-2">Reporte de Ingresos</h3>
                  <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">Detalle de todos los ingresos operacionales</p>
                  <button class="w-full bg-emerald-500/20 hover:bg-emerald-500/30 backdrop-blur-sm text-emerald-700 dark:text-emerald-300 font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center border border-emerald-500/30 hover:border-emerald-500/50">
                    <i class="fas fa-download mr-2"></i>Descargar PDF
                  </button>
                </div>
              </div>

              <!-- Reporte de Gastos -->
              <div class="group relative">
                <div class="bg-white/40 dark:bg-slate-700/40 backdrop-blur-xl rounded-xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-orange-500/30 hover:border-orange-500/50">
                  <div class="bg-orange-500/20 dark:bg-orange-500/30 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-orange-500/30">
                    <i class="fas fa-receipt text-3xl text-orange-600 dark:text-orange-400"></i>
                  </div>
                  <h3 class="text-gray-900 dark:text-white font-bold text-lg mb-2">Reporte de Gastos</h3>
                  <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">Detalle de costos y gastos operativos</p>
                  <button class="w-full bg-orange-500/20 hover:bg-orange-500/30 backdrop-blur-sm text-orange-700 dark:text-orange-300 font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center border border-orange-500/30 hover:border-orange-500/50">
                    <i class="fas fa-download mr-2"></i>Descargar PDF
                  </button>
                </div>
              </div>

              <!-- Reporte de Cartera -->
              <div class="group relative">
                <div class="bg-white/40 dark:bg-slate-700/40 backdrop-blur-xl rounded-xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-blue-500/30 hover:border-blue-500/50">
                  <div class="bg-blue-500/20 dark:bg-blue-500/30 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-blue-500/30">
                    <i class="fas fa-wallet text-3xl text-blue-600 dark:text-blue-400"></i>
                  </div>
                  <h3 class="text-gray-900 dark:text-white font-bold text-lg mb-2">Reporte de Cartera</h3>
                  <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">Estado de cuentas por cobrar</p>
                  <button class="w-full bg-blue-500/20 hover:bg-blue-500/30 backdrop-blur-sm text-blue-700 dark:text-blue-300 font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center border border-blue-500/30 hover:border-blue-500/50">
                    <i class="fas fa-download mr-2"></i>Descargar PDF
                  </button>
                </div>
              </div>

              <!-- Balance General -->
              <div class="group relative">
                <div class="bg-white/40 dark:bg-slate-700/40 backdrop-blur-xl rounded-xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-purple-500/30 hover:border-purple-500/50">
                  <div class="bg-purple-500/20 dark:bg-purple-500/30 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-purple-500/30">
                    <i class="fas fa-scale-balanced text-3xl text-purple-600 dark:text-purple-400"></i>
                  </div>
                  <h3 class="text-gray-900 dark:text-white font-bold text-lg mb-2">Balance General</h3>
                  <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">Estado de situación financiera</p>
                  <button class="w-full bg-purple-500/20 hover:bg-purple-500/30 backdrop-blur-sm text-purple-700 dark:text-purple-300 font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center border border-purple-500/30 hover:border-purple-500/50">
                    <i class="fas fa-download mr-2"></i>Descargar PDF
                  </button>
                </div>
              </div>
            </div>

            <!-- Reportes adicionales -->
            <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <button class="bg-white/60 dark:bg-slate-700/40 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-700/60 rounded-lg p-4 flex items-center justify-between transition-all border border-white/50 dark:border-slate-600/50 hover:shadow-lg group">
                <div class="flex items-center">
                  <div class="bg-indigo-500/20 dark:bg-indigo-500/30 backdrop-blur-sm p-3 rounded-lg mr-3 group-hover:scale-110 transition-transform border border-indigo-500/30">
                    <i class="fas fa-chart-column text-indigo-600 dark:text-indigo-400 text-xl"></i>
                  </div>
                  <div class="text-left">
                    <h4 class="font-bold text-gray-800 dark:text-gray-200">Estado de Resultados</h4>
                    <p class="text-xs text-gray-600 dark:text-gray-400">P&L mensual</p>
                  </div>
                </div>
                <i class="fas fa-download text-gray-600 dark:text-gray-400"></i>
              </button>

              <button class="bg-white/60 dark:bg-slate-700/40 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-700/60 rounded-lg p-4 flex items-center justify-between transition-all border border-white/50 dark:border-slate-600/50 hover:shadow-lg group">
                <div class="flex items-center">
                  <div class="bg-teal-500/20 dark:bg-teal-500/30 backdrop-blur-sm p-3 rounded-lg mr-3 group-hover:scale-110 transition-transform border border-teal-500/30">
                    <i class="fas fa-money-bill-wave text-teal-600 dark:text-teal-400 text-xl"></i>
                  </div>
                  <div class="text-left">
                    <h4 class="font-bold text-gray-800 dark:text-gray-200">Flujo de Caja</h4>
                    <p class="text-xs text-gray-600 dark:text-gray-400">Cash Flow</p>
                  </div>
                </div>
                <i class="fas fa-download text-gray-600 dark:text-gray-400"></i>
              </button>

              <button class="bg-white/60 dark:bg-slate-700/40 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-700/60 rounded-lg p-4 flex items-center justify-between transition-all border border-white/50 dark:border-slate-600/50 hover:shadow-lg group">
                <div class="flex items-center">
                  <div class="bg-rose-500/20 dark:bg-rose-500/30 backdrop-blur-sm p-3 rounded-lg mr-3 group-hover:scale-110 transition-transform border border-rose-500/30">
                    <i class="fas fa-building-columns text-rose-600 dark:text-rose-400 text-xl"></i>
                  </div>
                  <div class="text-left">
                    <h4 class="font-bold text-gray-800 dark:text-gray-200">Libro Mayor</h4>
                    <p class="text-xs text-gray-600 dark:text-gray-400">Contabilidad detallada</p>
                  </div>
                </div>
                <i class="fas fa-download text-gray-600 dark:text-gray-400"></i>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
  `]
})
export class MainInventory {}
