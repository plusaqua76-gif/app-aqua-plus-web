import {
  Component,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-days-validity',
  imports: [
    CommonModule
  ],
  template: `
    <div class="relative overflow-hidden shadow-2xl sm:rounded-2xl bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl border border-white/20 dark:border-slate-700/30">
      <div class="p-6 sm:p-8">
        <div class="text-center space-y-6">
          <!-- Icono principal -->
          <div class="mx-auto w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
            <i class="fas fa-calendar-check text-3xl text-green-600 dark:text-green-400"></i>
          </div>

          <!-- Título -->
          <div>
            <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Días de Validez
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
              Configuración de períodos de validez para diferentes conceptos
            </p>
          </div>

          <!-- Estado de desarrollo -->
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-xl backdrop-blur-md">
            <i class="fas fa-tools text-yellow-600 dark:text-yellow-400"></i>
            <span class="text-sm font-medium text-yellow-700 dark:text-yellow-300">
              En desarrollo
            </span>
          </div>

          <!-- Descripción de funcionalidades -->
          <div class="mt-8 space-y-4">
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Funcionalidades próximamente:
            </h3>
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="p-4 bg-white/10 dark:bg-slate-700/20 rounded-xl border border-white/20 dark:border-slate-600/30 backdrop-blur-md">
                <div class="flex items-center gap-3">
                  <i class="fas fa-calendar-plus text-green-500"></i>
                  <span class="text-sm text-gray-700 dark:text-gray-300">Configurar períodos</span>
                </div>
              </div>
              <div class="p-4 bg-white/10 dark:bg-slate-700/20 rounded-xl border border-white/20 dark:border-slate-600/30 backdrop-blur-md">
                <div class="flex items-center gap-3">
                  <i class="fas fa-clock text-blue-500"></i>
                  <span class="text-sm text-gray-700 dark:text-gray-300">Validez automática</span>
                </div>
              </div>
              <div class="p-4 bg-white/10 dark:bg-slate-700/20 rounded-xl border border-white/20 dark:border-slate-600/30 backdrop-blur-md">
                <div class="flex items-center gap-3">
                  <i class="fas fa-bell text-purple-500"></i>
                  <span class="text-sm text-gray-700 dark:text-gray-300">Notificaciones</span>
                </div>
              </div>
              <div class="p-4 bg-white/10 dark:bg-slate-700/20 rounded-xl border border-white/20 dark:border-slate-600/30 backdrop-blur-md">
                <div class="flex items-center gap-3">
                  <i class="fas fa-history text-orange-500"></i>
                  <span class="text-sm text-gray-700 dark:text-gray-300">Historial de cambios</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DaysValidity {

}
