import { Component, computed, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@services/toast.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { CounterService } from '../../../client/service/couter.service';
import { catchError, of } from 'rxjs';
import { UseService } from '../../services/use.service';
import { AforoInterface } from '@interfaces/Aforo/AforoInterface';
import { CounterEnterpriceService } from '../../services/counter-enterprice.service';
import { IParamUpdateData } from '@interfaces/Aforo/aforo';

// Constantes
const DEFAULT_TON_PROM_CRA = 0.00;
const TIPO_USO_RESIDENCIAL = 'RES';
const MIN_SUSCRIPTORES = 1;
const MIN_FRECUENCIA = 1;
const MAX_FRECUENCIA = 7;



@Component({
  selector: 'app-aforo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
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

    /* Scrollbar personalizado para el modal glassmorphism */
    .scrollbar-thin::-webkit-scrollbar {
      width: 8px;
    }

    .scrollbar-thin::-webkit-scrollbar-track {
      background: rgba(17, 24, 39, 0.3);
      border-radius: 10px;
    }

    .scrollbar-thin::-webkit-scrollbar-thumb {
      background: rgba(55, 65, 81, 0.6);
      border-radius: 10px;
      backdrop-filter: blur(4px);
    }

    .scrollbar-thin::-webkit-scrollbar-thumb:hover {
      background: rgba(75, 85, 99, 0.8);
    }

    /* Animación de entrada para el modal */
    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .modal-animate {
      animation: modalSlideIn 0.3s ease-out;
    }
  `],
  template: `
    <div class="animate-fadeIn">
      <div class="px-4 sm:px-6 lg:px-8 py-6">
        <div class="relative overflow-hidden shadow-2xl sm:rounded-2xl bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl border border-white/20 dark:border-slate-700/30">
          <div class="relative p-6 sm:p-8">
            <div class="absolute top-4 right-4 z-10">
              <button
                type="button"
                class="relative cursor-pointer py-2 px-4 text-center inline-flex justify-center items-center gap-2 text-xs uppercase text-gray-300 rounded-xl border border-[#312f62a3] bg-gradient-to-br from-[#767de600] to-[#1a18326b] transition-transform duration-300 ease-in-out group outline-offset-2 focus:outline-1 focus:outline-[#b9b7eeb9] focus:outline-offset-2 overflow-hidden hover:scale-105"
                title="Ver guía de configuración"
              >
                <span class="relative z-20 flex items-center gap-2">
                  <i class="fas fa-question-circle"></i>
                  <span class="hidden lg:inline">Ayuda</span>
                </span>
                <span class="absolute left-[-75%] top-0 h-full w-[50%] bg-white/10 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out"></span>
              </button>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div class="lg:col-span-2 space-y-6">
                                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                    Nombre
                  </label>
                  <div class="relative">
                    <input
                      type="text"
                      [(ngModel)]="nombre"
                      [placeholder]="'Nombre'"
                      class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40"
                    />
                    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <i class="fas fa-clipboard-list text-gray-400"></i>
                    </div>
                  </div>
                  <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <i class="fas fa-info-circle mr-1"></i>
                    Ingrese el nombre del aforo
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                    Tipo de Uso <span class="text-red-500">*</span>
                  </label>
                  <select
                    [(ngModel)]="tipoUso"
                    class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 appearance-none cursor-pointer invalid:text-gray-400 dark:invalid:text-gray-500"
                    required
                  >
                    <option value="" disabled selected hidden class="text-gray-400 dark:text-gray-500">
                      Seleccione tipo de uso...
                    </option>
                    @if (typeUse.value()?.response) {
                      @for (tipo of typeUse.value()?.response; track tipo.id) {
                        <option [value]="tipo.codigo" class="text-gray-900 dark:text-white bg-white dark:bg-gray-700">
                          {{ tipo.nombre }}
                        </option>
                      }
                    }
                  </select>
                  <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <i class="fas fa-info-circle mr-1"></i>
                    Seleccione el tipo de uso del suscriptor
                  </p>
                </div>

                <!-- Tipo de Aforo -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                    Tipo de Aforo <span class="text-red-500">*</span>
                  </label>
                  <select
                    [(ngModel)]="tipoAforo"
                    class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 appearance-none cursor-pointer invalid:text-gray-400 dark:invalid:text-gray-500"
                    required
                  >
                    <option value="" disabled selected hidden class="text-gray-400 dark:text-gray-500">
                      Seleccione tipo de aforo...
                    </option>
                    @if (typesAforos.value()?.response) {
                      @for (aforo of typesAforos.value()?.response; track aforo.id) {
                        <option [value]="aforo.id" class="text-gray-900 dark:text-white bg-white dark:bg-gray-700">
                           {{ aforo.descripcion }}
                        </option>
                      }
                    }
                  </select>
                  <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <i class="fas fa-info-circle mr-1"></i>
                    El valor por defecto se determina según el tipo de uso seleccionado
                  </p>
                </div>

                <!-- Campos para RESIDENCIAL -->
                @if (esResidencial()) {
                  <div class="animate-fadeIn space-y-6">
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                        Número de Suscriptores <span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <input
                          type="number"
                          [(ngModel)]="numeroSuscriptores"
                          [min]="1"
                          [placeholder]="'Ingrese número de suscriptores (mínimo: 1)'"
                          class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40"
                        />
                        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                      </div>
                      <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <i class="fas fa-info-circle mr-1"></i>
                        Para conjunto o multiusuario
                      </p>
                    </div>
                  </div>
                }

                <!-- Campos para NO RESIDENCIAL -->
                @if (esNoResidencial()) {
                  <div class="animate-fadeIn space-y-6">
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                        Producción Mensual (Kg) <span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <input
                          type="number"
                          [(ngModel)]="produccionPromedio"
                          [min]="0"
                          [step]="0.01"
                          [placeholder]="'Ingrese producción mensual en Kg'"
                          class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40"
                        />
                        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                          </svg>
                        </div>
                      </div>
                      <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <i class="fas fa-info-circle mr-1"></i>
                        Producción mensual en kilogramos
                      </p>
                    </div>
                  </div>
                }

                <!-- Frecuencia de Recolección -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                    Frecuencia de Recolección
                  </label>
                  <div class="relative">
                    <input
                      type="number"
                      [(ngModel)]="frecuenciaRecoleccion"
                      [min]="1"
                      [max]="7"
                      [placeholder]="'Frecuencia semanal (1-7)'"
                      class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40"
                    />
                    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                  </div>
                  <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <i class="fas fa-info-circle mr-1"></i>
                    Veces por semana (Dato informativo del sistema - El costo/ton ya incluye la frecuencia)
                  </p>
                </div>

                <!-- Frecuencia de Barrido -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                    Frecuencia de Barrido
                  </label>
                  <div class="relative">
                    <input
                      type="number"
                      [(ngModel)]="frecuenciaBarrido"
                      [min]="1"
                      [max]="7"
                      [placeholder]="'Frecuencia semanal (1-7)'"
                      class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40"
                    />
                    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                  </div>
                  <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <i class="fas fa-info-circle mr-1"></i>
                    Veces por semana (Dato informativo - El costo fijo mensual ya está definido)
                  </p>
                </div>

                <!-- Tarifa Base -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                    Tarifa Base (COP)
                  </label>
                  <div class="relative">
                    <input
                      type="number"
                      [(ngModel)]="tarifaBase"
                      [step]="0.01"
                      [placeholder]="'Ingrese tarifa base en COP'"
                      class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40"
                    />
                    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <i class="fas fa-info-circle mr-1"></i>
                    Componente fijo total del servicio (NO se multiplica por suscriptores)
                  </p>
                </div>

                <!-- Botones de Acción -->
                <div class="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    (click)="guardarConfiguracion()"
                    class="relative cursor-pointer w-full py-2 px-4 text-center inline-flex justify-center items-center gap-2 text-sm text-gray-300 rounded-xl border border-[#312f62a3] bg-gradient-to-br from-[#767de600] to-[#1a18326b] transition-transform duration-300 ease-in-out group outline-offset-2 focus:outline-1 focus:outline-[#b9b7eeb9] focus:outline-offset-2 overflow-hidden hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span class="relative z-20 flex items-center gap-2">
                      <i class="fas fa-save"></i>
                      <span>Guardar Configuración</span>
                    </span>
                    <span class="absolute left-[-75%] top-0 h-full w-[50%] bg-white/10 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out"></span>
                  </button>
                  <button
                    type="button"
                    (click)="openAforosModal()"
                    class="relative cursor-pointer w-full py-2 px-4 text-center inline-flex justify-center items-center gap-2 text-sm text-gray-300 rounded-xl border border-[#312f62a3] bg-gradient-to-br from-[#767de600] to-[#1a18326b] transition-transform duration-300 ease-in-out group outline-offset-2 focus:outline-1 focus:outline-[#b9b7eeb9] focus:outline-offset-2 overflow-hidden hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span class="relative z-20 flex items-center gap-2">
                      <i class="fas fa-list"></i>
                      <span>Ver Aforos Guardados</span>
                    </span>
                    <span class="absolute left-[-75%] top-0 h-full w-[50%] bg-white/10 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out"></span>
                  </button>
                </div>
              </div>
              <div class="lg:col-span-1">
                <div class="sticky top-6 space-y-4">
                  <div class="p-5 rounded-xl border border-white/20 bg-white/10 dark:bg-slate-700/30 backdrop-blur-md mt-7.5">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-3">
                      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#312f62a3] to-[#004fbb00] flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-calculator text-xl text-[#b9b7eeb9]"></i>
                      </div>
                      <span>Tarifa Estimada</span>
                    </h3>
                    <div class="space-y-3">
                      <div class="text-center py-4">
                        <p class="text-xs text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Total Estimado</p>
                        <p class="text-3xl font-bold text-gray-800 dark:text-white">
                          {{ tarifaCalculada() | number:'1.0-0' }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">COP</p>
                      </div>
                      <div class="pt-3 border-t border-white/20">
                        <p class="text-xs text-gray-600 dark:text-gray-400">
                          <i class="fas fa-info-circle mr-1"></i>
                          Cálculo basado en los valores ingresados
                        </p>
                      </div>                      <div class="pt-3 border-t border-white/20">
                        <button
                          type="button"
                          (click)="mostrarDesglose.set(!mostrarDesglose())"
                          class="relative cursor-pointer w-full py-2 px-4 text-center inline-flex justify-center items-center gap-2 text-sm text-gray-300 rounded-xl border border-[#312f62a3] bg-gradient-to-br from-[#767de600] to-[#1a18326b] transition-transform duration-300 ease-in-out group outline-offset-2 focus:outline-1 focus:outline-[#b9b7eeb9] focus:outline-offset-2 overflow-hidden hover:scale-105"
                        >
                          <span class="relative z-20 flex items-center gap-2">
                            <i class="fas fa-calculator"></i>
                            {{ mostrarDesglose() ? 'Ocultar' : 'Ver' }} Desglose
                          </span>
                          <span class="absolute left-[-75%] top-0 h-full w-[50%] bg-white/10 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out"></span>
                        </button>
                      </div>

                      @if (mostrarDesglose()) {
                        <div class="mt-4 p-4 rounded-lg bg-white/10 dark:bg-slate-800/30 border border-white/20 animate-fadeIn">
                          <h4 class="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                            <i class="fas fa-list-ol text-[#b9b7eeb9]"></i>
                            Proceso de Cálculo
                          </h4>

                          @if (esResidencial()) {
                            <!-- Cálculo para RESIDENCIAL (Metodología CRA) -->
                            <div class="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                              <div class="p-2.5 bg-white/5 dark:bg-slate-700/20 rounded-lg border-l-4 border-gray-400/50 dark:border-gray-500/50">
                                <p class="font-semibold text-gray-700 dark:text-gray-200 mb-1">1. Tarifa Base Fija</p>
                                <p class="font-mono text-gray-600 dark:text-gray-300">{{ '$' }}{{ tarifaBase() | number:'1.0-0' }} (Componente fijo - NO se multiplica)</p>
                              </div>

                              <div class="p-2.5 bg-white/5 dark:bg-slate-700/20 rounded-lg border-l-4 border-gray-400/50 dark:border-gray-500/50">
                                <p class="font-semibold text-gray-700 dark:text-gray-200 mb-1">2. Producción CRA Total</p>
                                <p class="font-mono text-gray-600 dark:text-gray-300">{{ tonPromedioCRA() }} ton/suscriptor × {{ numeroSuscriptores() }} suscriptores = {{ produccionTotalToneladas() | number:'1.2-2' }} ton</p>
                              </div>

                              <div class="p-2.5 bg-white/5 dark:bg-slate-700/20 rounded-lg border-l-4 border-gray-400/50 dark:border-gray-500/50">
                                <p class="font-semibold text-gray-700 dark:text-gray-200 mb-1">3. Costo Variable (Recolección)</p>
                                <p class="font-mono text-gray-600 dark:text-gray-300">{{ produccionTotalToneladas() | number:'1.2-2' }} ton × {{ '$' }}{{ valorRecoleccion() }}/ton = {{ '$' }}{{ costoVariableRecoleccion() | number:'1.0-0' }}</p>
                                <p class="text-[10px] text-gray-500 dark:text-gray-400 mt-1"><i class="fas fa-info-circle"></i> El costo/ton ya incluye la frecuencia del sistema</p>
                              </div>

                              <div class="p-2.5 bg-white/5 dark:bg-slate-700/20 rounded-lg border-l-4 border-gray-400/50 dark:border-gray-500/50">
                                <p class="font-semibold text-gray-700 dark:text-gray-200 mb-1">4. Barrido Fijo Mensual</p>
                                <p class="font-mono text-gray-600 dark:text-gray-300">{{ '$' }}{{ valorBarrido() | number:'1.0-0' }} (Ya incluye frecuencia - NO se multiplica)</p>
                              </div>

                              <div class="p-2.5 bg-white/5 dark:bg-slate-700/20 rounded-lg border-l-4 border-[#b9b7eeb9]/60">
                                <p class="font-semibold text-gray-800 dark:text-white mb-1">5. Total Facturado</p>
                                <p class="font-mono text-gray-700 dark:text-gray-200 font-semibold">{{ '$' }}{{ tarifaBase() | number:'1.0-0' }} + {{ '$' }}{{ costoVariableRecoleccion() | number:'1.0-0' }} + {{ '$' }}{{ valorBarrido() | number:'1.0-0' }} = {{ '$' }}{{ tarifaCalculada() | number:'1.0-0' }}</p>
                              </div>
                            </div>
                          } @else if (esNoResidencial()) {
                            <!-- Cálculo para NO RESIDENCIAL - Aforado por producción real -->
                            <div class="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                              <div class="p-2.5 bg-white/5 dark:bg-slate-700/20 rounded-lg border-l-4 border-gray-400/50 dark:border-gray-500/50">
                                <p class="font-semibold text-gray-700 dark:text-gray-200 mb-1">1. Tarifa Base Fija</p>
                                <p class="font-mono text-gray-600 dark:text-gray-300">{{ '$' }}{{ tarifaBase() | number:'1.0-0' }} (Componente fijo)</p>
                              </div>

                              <div class="p-2.5 bg-white/5 dark:bg-slate-700/20 rounded-lg border-l-4 border-gray-400/50 dark:border-gray-500/50">
                                <p class="font-semibold text-gray-700 dark:text-gray-200 mb-1">2. Producción Real Mensual</p>
                                <p class="font-mono text-gray-600 dark:text-gray-300">{{ produccionPromedio() }} kg ÷ 1000 = {{ produccionTotalToneladas() | number:'1.2-2' }} ton</p>
                              </div>

                              <div class="p-2.5 bg-white/5 dark:bg-slate-700/20 rounded-lg border-l-4 border-gray-400/50 dark:border-gray-500/50">
                                <p class="font-semibold text-gray-700 dark:text-gray-200 mb-1">3. Costo Variable (Recolección + Disposición)</p>
                                <p class="font-mono text-gray-600 dark:text-gray-300">{{ produccionTotalToneladas() | number:'1.2-2' }} ton × {{ '$' }}{{ valorRecoleccion() }}/ton = {{ '$' }}{{ costoVariableRecoleccion() | number:'1.0-0' }}</p>
                                <p class="text-[10px] text-gray-500 dark:text-gray-400 mt-1"><i class="fas fa-info-circle"></i> El costo/ton incluye recolección y disposición</p>
                              </div>

                              <div class="p-2.5 bg-white/5 dark:bg-slate-700/20 rounded-lg border-l-4 border-gray-400/50 dark:border-gray-500/50">
                                <p class="font-semibold text-gray-700 dark:text-gray-200 mb-1">4. Barrido Fijo Mensual</p>
                                <p class="font-mono text-gray-600 dark:text-gray-300">{{ '$' }}{{ valorBarrido() | number:'1.0-0' }} (Ya incluye frecuencia - NO se multiplica)</p>
                              </div>

                              <div class="p-2.5 bg-white/5 dark:bg-slate-700/20 rounded-lg border-l-4 border-[#b9b7eeb9]/60">
                                <p class="font-semibold text-gray-800 dark:text-white mb-1">5. Total Facturado</p>
                                <p class="font-mono text-gray-700 dark:text-gray-200 font-semibold">{{ '$' }}{{ tarifaBase() | number:'1.0-0' }} + {{ '$' }}{{ costoVariableRecoleccion() | number:'1.0-0' }} + {{ '$' }}{{ valorBarrido() | number:'1.0-0' }} = {{ '$' }}{{ tarifaCalculada() | number:'1.0-0' }}</p>
                              </div>
                            </div>
                          } @else {
                            <p class="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
                              <i class="fas fa-info-circle mr-1"></i>
                              Seleccione un tipo de uso para ver el desglose
                            </p>
                          }
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Card Promedio CRA -->
                  <div class="p-5 rounded-xl border border-white/20 bg-white/10 dark:bg-slate-700/30 backdrop-blur-md">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-3">
                      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#312f62a3] to-[#004fbb00] flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-chart-line text-xl text-[#b9b7eeb9]"></i>
                      </div>
                      <span>Promedio CRA</span>
                    </h3>
                    <div class="space-y-3">
                      <div>
                        <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 tracking-wider uppercase">
                          Promedio en Toneladas
                        </label>
                        <div class="flex items-center gap-2">
                          <div class="relative flex-1">
                            <input
                              type="number"
                              [(ngModel)]="tempPromedioCRA"
                              [min]="0"
                              [step]="0.01"
                              placeholder="Editar promedio CRA"
                              class="w-full px-3 py-2.5 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 text-sm"
                            />
                            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <span class="text-xs text-gray-400">ton</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            (click)="actualizarPromedioCRA()"
                            [disabled]="updatingParam()"
                            class="relative cursor-pointer py-2 px-4 text-center inline-flex justify-center items-center gap-2 text-xs uppercase text-gray-300 rounded-xl border border-[#312f62a3] bg-gradient-to-br from-[#767de600] to-[#1a18326b] transition-transform duration-300 ease-in-out group outline-offset-2 focus:outline-1 focus:outline-[#b9b7eeb9] focus:outline-offset-2 overflow-hidden hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            <span class="relative z-20 flex items-center gap-2">
                              @if (updatingParam()) {
                                <svg class="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              } @else {
                                <i class="fas fa-sync-alt transition-transform duration-500 ease-in-out group-hover:rotate-180"></i>
                              }
                              <span class="hidden lg:inline">{{ updatingParam() ? 'Guardando...' : 'Actualizar' }}</span>
                            </span>
                            <span class="absolute left-[-75%] top-0 h-full w-[50%] bg-white/10 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out"></span>
                          </button>
                        </div>
                      </div>
                      <!-- <p class="text-xs text-gray-500 dark:text-gray-400">
                        <i class="fas fa-info-circle mr-1"></i>
                        Promedio de producción de la empresa - Actual: {{ tonPromedioCRA() }} ton
                      </p> -->
                    </div>
                  </div>

                  <!-- Card Frecuencia de Recolección Global -->
                  <div class="p-5 rounded-xl border border-white/20 bg-white/10 dark:bg-slate-700/30 backdrop-blur-md">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-3">
                      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#312f62a3] to-[#004fbb00] flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-truck text-xl text-[#b9b7eeb9]"></i>
                      </div>
                      <span>Recolección</span>
                    </h3>
                    <div class="space-y-3">
                      <div>
                        <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 tracking-wider uppercase">
                          Valor recoleccion
                        </label>
                        <div class="flex items-center gap-2">
                          <div class="relative flex-1">
                            <input
                              type="number"
                              [(ngModel)]="tempValorRecoleccion"
                              min="0"
                              step="0.01"
                              placeholder="Editar valor de recolección"
                              class="w-full px-3 py-2.5 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 text-sm"
                            />
                            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <span class="text-xs text-gray-400">COP</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            (click)="actualizarRecoleccion()"
                            [disabled]="updatingParam()"
                            class="relative cursor-pointer py-2 px-4 text-center inline-flex justify-center items-center gap-2 text-xs uppercase text-gray-300 rounded-xl border border-[#312f62a3] bg-gradient-to-br from-[#767de600] to-[#1a18326b] transition-transform duration-300 ease-in-out group outline-offset-2 focus:outline-1 focus:outline-[#b9b7eeb9] focus:outline-offset-2 overflow-hidden hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            <span class="relative z-20 flex items-center gap-2">
                              @if (updatingParam()) {
                                <svg class="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              } @else {
                                <i class="fas fa-sync-alt transition-transform duration-500 ease-in-out group-hover:rotate-180"></i>
                              }
                              <span class="hidden lg:inline">{{ updatingParam() ? 'Guardando...' : 'Actualizar' }}</span>
                            </span>
                            <span class="absolute left-[-75%] top-0 h-full w-[50%] bg-white/10 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out"></span>
                          </button>
                        </div>
                      </div>
                      <!-- <p class="text-xs text-gray-500 dark:text-gray-400">
                        <i class="fas fa-info-circle mr-1"></i>
                        Costo unitario por tonelada ($/ton) - Actual: $ {{ valorRecoleccion() | number }}
                      </p> -->
                    </div>
                  </div>

                  <!-- Card Frecuencia de Barrido Global -->
                  <div class="p-5 rounded-xl border border-white/20 bg-white/10 dark:bg-slate-700/30 backdrop-blur-md">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-3">
                      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#312f62a3] to-[#004fbb00] flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-broom text-xl text-[#b9b7eeb9]"></i>
                      </div>
                      <span>Barrido</span>
                    </h3>
                    <div class="space-y-3">
                      <div>
                        <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 tracking-wider uppercase">
                          Valor Barrido
                        </label>
                        <div class="flex items-center gap-2">
                          <div class="relative flex-1">
                            <input
                              type="number"
                              [(ngModel)]="tempValorBarrido"
                              min="0"
                              step="0.01"
                              placeholder="Editar valor de barrido"
                              class="w-full px-3 py-2.5 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 text-sm"
                            />
                            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <span class="text-xs text-gray-400">COP</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            (click)="actualizarBarrido()"
                            [disabled]="updatingParam()"
                            class="relative cursor-pointer py-2 px-4 text-center inline-flex justify-center items-center gap-2 text-xs uppercase text-gray-300 rounded-xl border border-[#312f62a3] bg-gradient-to-br from-[#767de600] to-[#1a18326b] transition-transform duration-300 ease-in-out group outline-offset-2 focus:outline-1 focus:outline-[#b9b7eeb9] focus:outline-offset-2 overflow-hidden hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            <span class="relative z-20 flex items-center gap-2">
                              @if (updatingParam()) {
                                <svg class="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              } @else {
                                <i class="fas fa-sync-alt transition-transform duration-500 ease-in-out group-hover:rotate-180"></i>
                              }
                              <span class="hidden lg:inline">{{ updatingParam() ? 'Guardando...' : 'Actualizar' }}</span>
                            </span>
                            <span class="absolute left-[-75%] top-0 h-full w-[50%] bg-white/10 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out"></span>
                          </button>
                        </div>
                      </div>
                      <!-- <p class="text-xs text-gray-500 dark:text-gray-400">
                        <i class="fas fa-info-circle mr-1"></i>
                        Costo fijo mensual (ya incluye frecuencia) - Actual: $ {{ valorBarrido() | number }}
                      </p> -->
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para ver aforos guardados -->
    @if (isAforosModalOpen()) {
      <div class="fixed inset-0 z-[1100] overflow-y-auto">
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" (click)="closeAforosModal()"></div>

        <div class="flex min-h-full items-center justify-center p-4">
          <div class="modal-animate relative w-full max-w-6xl bg-gradient-to-br from-black/95 via-gray-950/90 to-black/95 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl shadow-black/50 transition-all mt-16 lg:ml-[75px]">

            <!-- Header -->
            <div class="border-b border-gray-700/50 px-6 py-4 bg-gradient-to-r from-black/60 to-gray-950/60 rounded-t-3xl">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-xl font-bold text-white">Aforos Guardados</h3>
                  <p class="text-sm text-emerald-400 mt-1 font-medium flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Listado de configuraciones de aforo de la empresa
                  </p>
                </div>
                <button
                  type="button"
                  (click)="closeAforosModal()"
                  class="rounded-xl p-2.5 text-gray-400 hover:text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 border border-transparent hover:border-gray-600/50"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Barra de búsqueda y botones de vista -->
              <div class="flex flex-col sm:flex-row items-center gap-3">
                <!-- Botones de vista (izquierda) -->
<div class="flex items-center gap-2">

  <button
    type="button"
    (click)="viewMode.set('grid')"
    [class.bg-blue-500]="viewMode() === 'grid'"
    [class.border-blue-500]="viewMode() === 'grid'"
    [class.text-blue-400]="viewMode() === 'grid'"
    [class.bg-gray-700]="viewMode() !== 'grid'"
    [class.border-gray-600]="viewMode() !== 'grid'"
    [class.text-gray-400]="viewMode() !== 'grid'"
    class="p-2.5 rounded-xl border
           bg-blue-500/10
           border-blue-500/20
           backdrop-blur-md
           transition-all duration-200
           hover:bg-blue-500/20
           hover:border-blue-500/40"
    title="Vista de cuadrícula"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
    </svg>
  </button>

  <button
    type="button"
    (click)="viewMode.set('list')"
    [class.bg-blue-500]="viewMode() === 'list'"
    [class.border-blue-500]="viewMode() === 'list'"
    [class.text-blue-400]="viewMode() === 'list'"
    [class.bg-gray-700]="viewMode() !== 'list'"
    [class.border-gray-600]="viewMode() !== 'list'"
    [class.text-gray-400]="viewMode() !== 'list'"
    class="p-2.5 rounded-xl border
           bg-blue-500/10
           border-blue-500/20
           backdrop-blur-md
           transition-all duration-200
           hover:bg-blue-500/20
           hover:border-blue-500/40"
    title="Vista de lista"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M4 6h16M4 12h16M4 18h16"/>
    </svg>
  </button>

</div>

                <!-- Barra de búsqueda (derecha) -->
                <div class="flex-1 w-full relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    [(ngModel)]="searchTerm"
                    placeholder="Buscar por nombre, tipo de uso o aforo..."
                    class="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-xl text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                  />
                  @if (searchTerm()) {
                    <button
                      type="button"
                      (click)="clearSearch()"
                      class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  }
                </div>
              </div>
            </div>

            <!-- Body -->
            <div class="px-6 py-6 max-h-[calc(100vh-17rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900/50">
              @if (aforosEnterprice.isLoading()) {
                <div class="flex justify-center py-12">
                  <div class="relative">
                    <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-700"></div>
                    <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-emerald-400 absolute top-0 left-0"></div>
                  </div>
                </div>
              } @else if (aforosEnterprice.error()) {
                <div class="text-center py-12">
                  <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 mb-4 backdrop-blur-sm">
                    <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <p class="text-red-400 font-medium">Error al cargar los aforos</p>
                </div>
              } @else if (filteredAforos().length === 0) {
                <div class="text-center py-12">
                  <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-700/20 border border-gray-600/30 mb-4 backdrop-blur-sm">
                    <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                    </svg>
                  </div>
                  <p class="text-gray-400 font-medium">
                    @if (searchTerm()) {
                      No se encontraron aforos que coincidan con "{{ searchTerm() }}"
                    } @else {
                      No hay aforos guardados
                    }
                  </p>
                  <p class="text-gray-500 text-sm mt-2">
                    @if (searchTerm()) {
                      Intenta con otro término de búsqueda
                    } @else {
                      Crea tu primer aforo para comenzar
                    }
                  </p>
                </div>
              } @else {
                <!-- Vista Grid -->
                @if (viewMode() === 'grid') {
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    @for (aforo of filteredAforos(); track aforo.id) {
                    <div class="group relative rounded-2xl border border-gray-600/50 bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl p-5 flex flex-col hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-1">
                      <!-- Contenido del aforo -->
                      <div class="flex-1">
                        <!-- Encabezado -->
                        <div class="mb-4">
                          <label class="block text-xs font-semibold text-gray-400 mb-2">
                            Nombre del Aforo
                          </label>
                          @if (editingAforoId() === aforo.id) {
                            <input
                              type="text"
                              [value]="editForm()?.nombre"
                              (input)="updateEditFieldString('nombre', $any($event.target).value)"
                              class="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white font-bold text-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                            />
                          } @else {
                            <h3 class="text-xl font-bold text-white mb-2">
                              {{ aforo.nombre }}
                            </h3>
                          }
                        </div>

                        <!-- Divider -->
                        <div class="h-px bg-gradient-to-r from-transparent via-gray-600/50 to-transparent mb-3"></div>

                        <!-- Tipo de Aforo y Tipo de Uso -->
                        <div class="mb-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label class="block text-xs font-semibold text-gray-400 mb-2">
                              Tipo de Aforo
                            </label>
                            @if (editingAforoId() === aforo.id) {
                              <select
                                [value]="editForm()?.tipoAforo?.id"
                                (change)="updateEditField('tipoAforo', +$any($event.target).value)"
                                class="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                              >
                                <option value="" disabled>Seleccione tipo de aforo</option>
                                @for (tipoAforo of typesAforos.value()?.response; track tipoAforo.id) {
                                  <option [value]="tipoAforo.id">{{ tipoAforo.descripcion }}</option>
                                }
                              </select>
                            } @else {
                              <p class="text-white font-medium">
                                {{ aforo.tipoAforo.descripcion }}
                              </p>
                            }
                          </div>

                          <div>
                            <label class="block text-xs font-semibold text-gray-400 mb-2">
                              Tipo de Uso
                            </label>
                            @if (editingAforoId() === aforo.id) {
                              <select
                                [value]="editForm()?.tipoUso?.id"
                                (change)="updateEditField('tipoUso', +$any($event.target).value)"
                                class="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                              >
                                <option value="" disabled>Seleccione tipo de uso</option>
                                @for (tipoUso of typeUse.value()?.response; track tipoUso.id) {
                                  <option [value]="tipoUso.id">{{ tipoUso.nombre }}</option>
                                }
                              </select>
                            } @else {
                              <p class="text-white font-medium">
                                {{ aforo.tipoUso.nombre }}
                              </p>
                            }
                          </div>
                        </div>

                        <!-- Campos editables -->
                        <div class="space-y-3 text-sm">
                          <!-- Tarifa Base -->
                          <div class="relative cursor-pointer w-full py-2 px-4 text-center inline-flex justify-center items-center gap-2 text-sm text-gray-300 rounded-xl border border-[#312f62a3] bg-gradient-to-br from-[#767de600] to-[#1a18326b] transition-transform duration-300 ease-in-out group outline-offset-2 focus:outline-1 focus:outline-[#b9b7eeb9] focus:outline-offset-2 overflow-hidden hover:scale-105">
                            <div class="relative z-20 w-full">
                              <label class="block text-xs font-semibold text-gray-400 mb-2">Tarifa Base (COP)</label>
                              @if (editingAforoId() === aforo.id) {
                                <input
                                  type="number"
                                  [value]="editForm()?.tarifaBase"
                                  (input)="updateEditField('tarifaBase', +$any($event.target).value)"
                                  step="0.01"
                                  class="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                                />
                              } @else {
                                <div class="text-gray-400 font-bold text-2xl">$ {{ aforo.tarifaBase | number:'1.2-2' }}</div>
                              }
                            </div>
                            <span class="absolute left-[-75%] top-0 h-full w-[50%] bg-white/10 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out"></span>
                          </div>

                          <!-- Grid con campos editables -->
                          <div class="grid grid-cols-2 gap-2">
                            <div class="p-3 rounded-lg bg-gray-800/30 backdrop-blur-sm border border-gray-700/30">
                              <label class="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                                </svg>
                                N° Suscriptores
                              </label>
                              @if (editingAforoId() === aforo.id) {
                                <input
                                  type="number"
                                  [value]="editForm()?.numeroSuscriptores"
                                  (input)="updateEditField('numeroSuscriptores', +$any($event.target).value)"
                                  min="1"
                                  class="w-full px-2 py-1.5 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                                />
                              } @else {
                                <p class="text-white font-semibold text-base">{{ aforo.numeroSuscriptores }}</p>
                              }
                            </div>
                            <div class="p-3 rounded-lg bg-gray-800/30 backdrop-blur-sm border border-gray-700/30">
                              <label class="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                                </svg>
                                Prod. Mensual (m³)
                              </label>
                              @if (editingAforoId() === aforo.id) {
                                <input
                                  type="number"
                                  [value]="editForm()?.produMensual"
                                  (input)="updateEditField('produMensual', +$any($event.target).value)"
                                  min="0"
                                  step="0.01"
                                  class="w-full px-2 py-1.5 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                                />
                              } @else {
                                <p class="text-white font-semibold text-base">{{ aforo.produMensual }}</p>
                              }
                            </div>
                          </div>

                          <div class="grid grid-cols-2 gap-2">
                            <div class="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 backdrop-blur-sm">
                              <label class="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                                </svg>
                                Frec. Barrido
                              </label>
                              @if (editingAforoId() === aforo.id) {
                                <input
                                  type="number"
                                  [value]="editForm()?.frecBarrido"
                                  (input)="updateEditField('frecBarrido', +$any($event.target).value)"
                                  min="1"
                                  max="7"
                                  class="w-full px-2 py-1.5 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                                />
                              } @else {
                                <p class="text-blue-400 font-bold text-lg">{{ aforo.frecBarrido }}</p>
                              }
                            </div>
                            <div class="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20 backdrop-blur-sm">
                              <label class="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                                Frec. Recolección
                              </label>
                              @if (editingAforoId() === aforo.id) {
                                <input
                                  type="number"
                                  [value]="editForm()?.frecRecoleccion"
                                  (input)="updateEditField('frecRecoleccion', +$any($event.target).value)"
                                  min="1"
                                  max="7"
                                  class="w-full px-2 py-1.5 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                                />
                              } @else {
                                <p class="text-purple-400 font-bold text-lg">{{ aforo.frecRecoleccion }}</p>
                              }
                            </div>
                          </div>
                        </div>

                        <!-- Estado -->
                        <div class="mt-4 pt-3 border-t border-gray-700/50">
                          <div class="flex items-center justify-between">
                            <span class="text-xs text-gray-500 uppercase tracking-wider">Estado</span>
                          </div>
                        </div>
                      </div>

                      <!-- Action Buttons -->
                      <div class="mt-4">
                        @if (editingAforoId() === aforo.id) {
                          <!-- Botones en modo edición -->
                          <div class="flex gap-2">
                            <button
                              type="button"
                              (click)="saveEditAforo(aforo.id)"
                              [disabled]="updatingAforo()"
                              class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 rounded-xl text-emerald-400 font-medium text-sm transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Guardar cambios">
                              @if (updatingAforo()) {
                                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              } @else {
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                </svg>
                              }
                              <span class="hidden sm:inline">{{ updatingAforo() ? 'Guardando...' : 'Guardar' }}</span>
                            </button>

                            <button
                              type="button"
                              (click)="cancelEdit()"
                              [disabled]="updatingAforo()"
                              class="inline-flex items-center justify-center px-4 py-2.5 bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/30 hover:border-gray-500/50 rounded-xl text-gray-400 font-medium text-sm transition-all duration-200 hover:shadow-lg hover:shadow-gray-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Cancelar edición">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                              </svg>
                            </button>
                          </div>
                        } @else {
                          <!-- Botones en modo normal -->
                          <div class="flex gap-2">
                            <button
                              type="button"
                              (click)="startEditAforo(aforo)"
                              class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/50 rounded-xl text-blue-400 font-medium text-sm transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20"
                              title="Editar aforo">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                              </svg>
                              <span class="hidden sm:inline">Editar</span>
                            </button>

                            <button
                              type="button"
                              (click)="confirmDeleteAforo(aforo.id)"
                              class="inline-flex items-center justify-center px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-xl text-red-400 font-medium text-sm transition-all duration-200 hover:shadow-lg hover:shadow-red-500/20"
                              title="Eliminar aforo">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                              </svg>
                            </button>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
                }

                <!-- Vista Lista -->
                @if (viewMode() === 'list') {
                  <div class="space-y-3">
                    @for (aforo of filteredAforos(); track aforo.id) {
                      <div class="group relative rounded-2xl border border-gray-600/50 bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl p-4 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
                        <div class="flex flex-col lg:flex-row items-stretch gap-4">

                          <!-- Información Principal -->
                          <div class="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

                            <!-- Nombre y Tipo -->
                            <div class="lg:col-span-2">
                              <h3 class="text-lg font-bold text-white mb-2">
                                {{ aforo.nombre }}
                              </h3>
                              <div class="space-y-1">
                                <div class="flex items-center gap-2">
                                  <span class="text-xs text-gray-400">Tipo Aforo:</span>
                                  <span class="text-xs text-white font-medium">{{ aforo.tipoAforo.descripcion }}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                  <span class="text-xs text-gray-400">Tipo Uso:</span>
                                  <span class="text-xs text-white font-medium">{{ aforo.tipoUso.nombre }}</span>
                                </div>
                              </div>
                            </div>
                            <!-- Tarifa Base -->
                            <div class="p-3 rounded-xl
            border border-[#312f62a3]
            bg-gradient-to-br from-[#767de600] to-[#1a18326b]
            text-gray-300
            focus:outline-1 focus:outline-[#b9b7eeb9]
            outline-offset-2
            overflow-hidden">
                              <label class="block text-xs font-semibold text-gray-400 mb-1">Tarifa Base</label>
                              @if (editingAforoId() === aforo.id) {
                                <input
                                  type="number"
                                  [value]="editForm()?.tarifaBase"
                                  (input)="updateEditField('tarifaBase', +$any($event.target).value)"
                                  step="0.01"
                                  class="w-full px-2 py-1.5 bg-gray-800/50 border border-gray-600/50 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                              } @else {
                                <div class="text-emerald-400 font-bold text-lg">$ {{ aforo.tarifaBase | number:'1.2-2' }}</div>
                              }
                            </div>

                            <!-- Suscriptores y Producción -->
                            <div class="grid grid-cols-2 gap-2">
                              <div class="p-3 rounded-xl bg-gray-800/30 border border-gray-700/30">
                                <label class="block text-xs text-gray-400 mb-1">Suscriptores</label>
                                @if (editingAforoId() === aforo.id) {
                                  <input
                                    type="number"
                                    [value]="editForm()?.numeroSuscriptores"
                                    (input)="updateEditField('numeroSuscriptores', +$any($event.target).value)"
                                    min="1"
                                    class="w-full px-2 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                                  />
                                } @else {
                                  <p class="text-white font-semibold">{{ aforo.numeroSuscriptores }}</p>
                                }
                              </div>
                              <div class="p-3 rounded-xl bg-gray-800/30 border border-gray-700/30">
                                <label class="block text-xs text-gray-400 mb-1">Prod. (m³)</label>
                                @if (editingAforoId() === aforo.id) {
                                  <input
                                    type="number"
                                    [value]="editForm()?.produMensual"
                                    (input)="updateEditField('produMensual', +$any($event.target).value)"
                                    min="0"
                                    step="0.01"
                                    class="w-full px-2 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                                  />
                                } @else {
                                  <p class="text-white font-semibold">{{ aforo.produMensual }}</p>
                                }
                              </div>
                            </div>

                            <!-- Frecuencias -->
                            <div class="grid grid-cols-2 gap-2">
                              <div class="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30">
                                <label class="block text-xs text-gray-400 mb-1">Frec. Barrido</label>
                                @if (editingAforoId() === aforo.id) {
                                  <input
                                    type="number"
                                    [value]="editForm()?.frecBarrido"
                                    (input)="updateEditField('frecBarrido', +$any($event.target).value)"
                                    min="1"
                                    max="7"
                                    class="w-full px-2 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                                  />
                                } @else {
                                  <p class="text-blue-400 font-bold">{{ aforo.frecBarrido }}</p>
                                }
                              </div>
                              <div class="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
                                <label class="block text-xs text-gray-400 mb-1">Frec. Recolec.</label>
                                @if (editingAforoId() === aforo.id) {
                                  <input
                                    type="number"
                                    [value]="editForm()?.frecRecoleccion"
                                    (input)="updateEditField('frecRecoleccion', +$any($event.target).value)"
                                    min="1"
                                    max="7"
                                    class="w-full px-2 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                                  />
                                } @else {
                                  <p class="text-purple-400 font-bold">{{ aforo.frecRecoleccion }}</p>
                                }
                              </div>
                            </div>

                          </div>

                          <!-- Botones de Acción -->
                          <div class="flex lg:flex-col items-center gap-2 lg:min-w-[120px] border-t lg:border-t-0 lg:border-l border-gray-700/50 pt-3 lg:pt-0 lg:pl-4">
                            @if (editingAforoId() === aforo.id) {
                              <!-- Modo edición -->
                              <button
                                type="button"
                                (click)="saveEditAforo(aforo.id)"
                                [disabled]="updatingAforo()"
                                class="flex-1 lg:flex-none lg:w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 rounded-xl text-emerald-400 font-medium text-sm transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Guardar cambios">
                                @if (updatingAforo()) {
                                  <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                } @else {
                                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                  </svg>
                                }
                                <span class="hidden xl:inline">{{ updatingAforo() ? 'Guardando...' : 'Guardar' }}</span>
                              </button>

                              <button
                                type="button"
                                (click)="cancelEdit()"
                                [disabled]="updatingAforo()"
                                class="lg:w-full inline-flex items-center justify-center px-3 py-2 bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/30 hover:border-gray-500/50 rounded-xl text-gray-400 font-medium text-sm transition-all duration-200 hover:shadow-lg hover:shadow-gray-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Cancelar edición">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                              </button>
                            } @else {
                              <!-- Modo normal -->
                              <button
                                type="button"
                                (click)="startEditAforo(aforo)"
                                class="flex-1 lg:flex-none lg:w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/50 rounded-xl text-blue-400 font-medium text-sm transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20"
                                title="Editar aforo">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                                <span class="hidden xl:inline">Editar</span>
                              </button>

                              <button
                                type="button"
                                (click)="confirmDeleteAforo(aforo.id)"
                                class="lg:w-full inline-flex items-center justify-center px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-xl text-red-400 font-medium text-sm transition-all duration-200 hover:shadow-lg hover:shadow-red-500/20"
                                title="Eliminar aforo">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                              </button>
                            }
                          </div>

                        </div>
                      </div>
                    }
                  </div>
                }
              }
            </div>
            <div class="border-t border-gray-700/50 px-6 py-4 bg-gradient-to-r from-gray-900/40 to-black/40 backdrop-blur-sm rounded-b-3xl">

            </div>
          </div>
        </div>
      </div>
    }

    <!-- Modal de confirmación de eliminación -->
    @if (isDeleteConfirmModalOpen()) {
      <div class="fixed inset-0 z-[1200] overflow-y-auto">
        <div class="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"></div>

        <div class="flex min-h-full items-center justify-center p-4">
          <div class="modal-animate relative w-full max-w-md bg-gradient-to-br from-red-950/95 via-gray-950/90 to-black/95 backdrop-blur-xl border border-red-500/30 rounded-2xl shadow-2xl shadow-red-500/20 transition-all">

            <!-- Icono de advertencia -->
            <div class="flex justify-center pt-8 pb-4">
              <div class="rounded-full bg-red-500/10 p-4 border-2 border-red-500/30">
                <svg class="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
            </div>

            <!-- Contenido -->
            <div class="px-6 pb-6 text-center">
              <h3 class="text-2xl font-bold text-white mb-3">
                ¿Eliminar aforo?
              </h3>
              <p class="text-gray-300 text-sm mb-6">
                Esta acción no se puede deshacer. El aforo será eliminado permanentemente de la base de datos.
              </p>

              <!-- Botones -->
              <div class="flex gap-3 justify-center">
                <button
                  type="button"
                  (click)="closeDeleteConfirmModal()"
                  [disabled]="isDeleting()"
                  class="px-6 py-2.5 bg-gray-700/50 hover:bg-gray-700 border border-gray-600/50 hover:border-gray-500 rounded-xl text-gray-300 hover:text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]">
                  Cancelar
                </button>
                <button
                  type="button"
                  (click)="confirmDelete()"
                  [disabled]="isDeleting()"
                  class="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 border border-red-500/50 rounded-xl text-white font-medium transition-all duration-200 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] relative">
                  @if (isDeleting()) {
                    <svg class="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  } @else {
                    Eliminar
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class AforoComponent {

  private readonly toastService = inject(ToastService);
  private readonly counterService = inject(CounterService);
  private readonly useService = inject(UseService);
  private readonly counterEnterpriceService = inject(CounterEnterpriceService);
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);
  // Signals de formulario
  tipoUso = signal<string>('');
  tipoAforo = signal<string>('');
  numeroSuscriptores = signal<number>(MIN_SUSCRIPTORES);
  produccionPromedio = signal<number>(0);
  frecuenciaRecoleccion = signal<number>(MIN_FRECUENCIA);
  frecuenciaBarrido = signal<number>(MIN_FRECUENCIA);
  tarifaBase = signal<number>(0);
  nombre = signal<string>('');

  // Signals de estado UI
  mostrarDesglose = signal<boolean>(false);
  isAforosModalOpen = signal<boolean>(false);
  isDeleteConfirmModalOpen = signal<boolean>(false);
  editingAforoId = signal<number | null>(null);
  editForm = signal<Partial<AforoInterface> | null>(null);
  deletingAforoId = signal<number | null>(null);
  isDeleting = signal<boolean>(false);
  updatingAforo = signal<boolean>(false);
  searchTerm = signal<string>('');
  viewMode = signal<'grid' | 'list'>('grid');

  // Signals de valores temporales para actualización
  tempPromedioCRA = signal<number>(0);
  tempValorRecoleccion = signal<number>(0);
  tempValorBarrido = signal<number>(0);
  updatingParam = signal<boolean>(false);


  readonly userData = computed(() => {
    if (!this.isBrowser) return null;
    try {
      const userDataString = sessionStorage.getItem('userData');
      return userDataString ? JSON.parse(userDataString) : null;
    } catch (e) {
      console.error('Error parsing userData from sessionStorage:', e);
      return null;
    }
  });

  readonly enterpriseId = computed(() => {
    const data = this.userData();
    return data?.empresaId || 0;
  });

  typesAforos = rxResource({
    params: () => ({ code: 'TIPO_AFORO' }),
    stream: ({ params }) => {
      const { code } = params;
      if (!code) return of(null);

      return this.counterService.typeAforo(code).pipe(
        catchError(() => {
          return of(null);
        })
      );
    }
  });

  typeUse = rxResource({
    params: () => ({ enterpriseId: this.enterpriseId() }),
    stream: ({ params }) => {
      if (!params.enterpriseId) return of(null);
      return this.useService.getTypeUse(params.enterpriseId).pipe(
        catchError(() => {
          return of(null);
        }),
      );
    },
  });

  paramVlrBarrido = rxResource({
    params: () => ({ enterpriseId: this.enterpriseId(), key: 'VLR_BARRIDO' }),
    stream: ({ params }) => {
      if (!params.enterpriseId) return of(null);

      return this.counterEnterpriceService.getParamsEnterprice(params.enterpriseId, params.key).pipe(
        catchError(() => {
          return of(null);
        })
      );
    }
  });

  paramVlrRecoleccion = rxResource({
    params: () => ({ enterpriseId: this.enterpriseId(), key: 'VLR_RECOLECCION' }),
    stream: ({ params }) => {
      if (!params.enterpriseId) return of(null);

      return this.counterEnterpriceService.getParamsEnterprice(params.enterpriseId, params.key).pipe(
        catchError(() => {
          return of(null);
        })
      );
    }
  });

  paramTonPromCRA = rxResource({
    params: () => ({ enterpriseId: this.enterpriseId(), key: 'TON_PROMCRA' }),
    stream: ({ params }) => {
      if (!params.enterpriseId) return of(null);

      return this.counterEnterpriceService.getParamsEnterprice(params.enterpriseId, params.key).pipe(
        catchError(() => {
          return of(null);
        })
      );
    }
  });

  aforosEnterprice = rxResource({
    params: () => ({ enterpriseId: this.enterpriseId() }),
    stream: ({ params }) => {
      const { enterpriseId } = params;
      if (!enterpriseId) return of(null);

      return this.counterService.aforosEnterprice(enterpriseId).pipe(
        catchError(() => {
          return of(null);
        })
      );
    }
  });


  valorBarrido = computed(() => {
    const param = this.paramVlrBarrido.value();
    return param?.response?.valorParametro ? parseFloat(param.response.valorParametro) : 0;
  });

  valorRecoleccion = computed(() => {
    const param = this.paramVlrRecoleccion.value();
    return param?.response?.valorParametro ? parseFloat(param.response.valorParametro) : 0;
  });

  tonPromedioCRA = computed(() => {
    const param = this.paramTonPromCRA.value();
    return param?.response?.valorParametro ? parseFloat(param.response.valorParametro) : DEFAULT_TON_PROM_CRA;
  });

  availableAforos = computed(() => {
    const data = this.aforosEnterprice.value();
    if (!data?.response || data?.success === false) return [];
    // Si response es un array, devolverlo; si es un objeto, devolverlo en un array
    return Array.isArray(data.response) ? data.response : [data.response];
  });

  filteredAforos = computed(() => {
    const aforos = this.availableAforos();
    const term = this.searchTerm().toLowerCase().trim();

    if (!term) return aforos;

    return aforos.filter(aforo =>
      aforo.nombre?.toLowerCase().includes(term) ||
      aforo.tipoUso?.nombre?.toLowerCase().includes(term) ||
      aforo.tipoUso?.codigo?.toLowerCase().includes(term) ||
      aforo.tipoAforo?.descripcion?.toLowerCase().includes(term)
    );
  });

  esResidencial = computed(() => this.tipoUso() === TIPO_USO_RESIDENCIAL);
  esNoResidencial = computed(() => this.tipoUso() !== '' && this.tipoUso() !== TIPO_USO_RESIDENCIAL);

  produccionTotalToneladas = computed(() => {
    if (this.esResidencial()) {
      return this.tonPromedioCRA() * this.numeroSuscriptores();
    }

    if (this.esNoResidencial()) {
      return this.produccionPromedio() / 1000;
    }

    return 0;
  });

  costoVariableRecoleccion = computed(() => {
    return this.produccionTotalToneladas() * this.valorRecoleccion();
  });

  tarifaCalculada = computed(() => {
    const base = this.tarifaBase();

    if (!base || base <= 0) {
      return 0;
    }

    const vlrBarrido = this.valorBarrido();
    const costoVariable = this.costoVariableRecoleccion();
    return base + costoVariable + vlrBarrido;
  });

  constructor() {
    // Sincronizar valores temporales con los parámetros actuales
    effect(() => {
      const tonCRA = this.tonPromedioCRA();
      if (tonCRA > 0) {
        this.tempPromedioCRA.set(tonCRA);
      }
    });

    effect(() => {
      const vlrRecoleccion = this.valorRecoleccion();
      if (vlrRecoleccion > 0) {
        this.tempValorRecoleccion.set(vlrRecoleccion);
      }
    });

    effect(() => {
      const vlrBarrido = this.valorBarrido();
      if (vlrBarrido > 0) {
        this.tempValorBarrido.set(vlrBarrido);
      }
    });
  }

  /**
   * Método genérico para actualizar parámetros de la empresa
   */
  private actualizarParametro(config: IParamUpdateData): void {
    const { key, value, paramData, successMessage } = config;
    const userData = this.userData();

    const paramKey = {
      empresa: { id: this.enterpriseId() },
      llave: key,
      valorParametro: value.toString(),
      activo: true,
      usuarioCreacion: userData?.nombre || 'sistema',
      ...(paramData?.id && { id: paramData.id })
    };

    this.counterEnterpriceService.createParamsEnterprice(paramKey).subscribe({
      next: () => {
        this.updatingParam.set(false);
        this.toastService.success('Éxito', successMessage);
        this.reloadParam(key);
        // El effect sincronizará automáticamente el tempValue con el nuevo valor del parámetro
      },
      error: (error) => {
        this.updatingParam.set(false);
        this.toastService.error('Error', `No se pudo actualizar el parámetro: ${error.message || 'Error desconocido'}`);
      }
    });
  }

  private reloadParam(key: string): void {
    switch(key) {
      case 'TON_PROMCRA':
        this.paramTonPromCRA.reload();
        break;
      case 'VLR_RECOLECCION':
        this.paramVlrRecoleccion.reload();
        break;
      case 'VLR_BARRIDO':
        this.paramVlrBarrido.reload();
        break;
    }
  }

  actualizarPromedioCRA(): void {
    if (!this.validarValorPositivo(this.tempPromedioCRA())) return;
    if (!this.validarUsuario()) return;

    this.updatingParam.set(true);
    this.actualizarParametro({
      key: 'TON_PROMCRA',
      value: this.tempPromedioCRA(),
      paramData: this.paramTonPromCRA.value()?.response,
      successMessage: 'Promedio CRA actualizado correctamente'
    });
  }

  actualizarRecoleccion(): void {
    if (!this.validarValorPositivo(this.tempValorRecoleccion())) return;
    if (!this.validarUsuario()) return;

    this.updatingParam.set(true);
    this.actualizarParametro({
      key: 'VLR_RECOLECCION',
      value: this.tempValorRecoleccion(),
      paramData: this.paramVlrRecoleccion.value()?.response,
      successMessage: 'Valor de recolección actualizado correctamente'
    });
  }

  actualizarBarrido(): void {
    if (!this.validarValorPositivo(this.tempValorBarrido())) return;
    if (!this.validarUsuario()) return;

    this.updatingParam.set(true);
    this.actualizarParametro({
      key: 'VLR_BARRIDO',
      value: this.tempValorBarrido(),
      paramData: this.paramVlrBarrido.value()?.response,
      successMessage: 'Valor de barrido actualizado correctamente'
    });
  }

  private validarValorPositivo(valor: number): boolean {
    if (!valor || valor >= 0) {
      this.toastService.warning('Advertencia', 'Ingrese un valor válido mayor a 0');
      return false;
    }
    return true;
  }

  private validarUsuario(): boolean {
    if (!this.userData() || !this.enterpriseId()) {
      this.toastService.error('Error', 'No se pudo obtener la información del usuario');
      return false;
    }
    return true;
  }

  guardarConfiguracion() {
    if (!this.validarFormulario()) {
      return;
    }

    const aforo: AforoInterface = {
      empresa: { id: this.enterpriseId() },
      tipoUso: { id: this.getSelectedTipoUsoId() },
      tipoAforo: { id: parseInt(this.tipoAforo()) },
      nombre: this.nombre(),
      numeroSuscriptores: this.esResidencial() ? this.numeroSuscriptores() : 0,
      produMensual: this.calcularProduccionMensual(),
      frecBarrido: this.frecuenciaBarrido(),
      frecRecoleccion: this.frecuenciaRecoleccion(),
      tarifaBase: this.tarifaBase(),
      promedioCRA: this.tonPromedioCRA(),
      usuarioCreacion: this.userData()?.usuario || 'sistema'
    };

    this.counterService.saveAforo(aforo).subscribe({
      next: () => {
        this.toastService.success('Éxito', 'Configuración de aforo guardada correctamente');
        this.limpiarFormulario();
        this.aforosEnterprice.reload();
      },
      error: (error) => {
        this.toastService.error('Error', `No se pudo guardar la configuración: ${error.message || 'Error desconocido'}`);
      }
    });
  }

  private validarFormulario(): boolean {
    if (!this.tipoUso()) {
      this.toastService.warning('Validación', 'Seleccione un tipo de uso');
      return false;
    }

    if (!this.tipoAforo()) {
      this.toastService.warning('Validación', 'Seleccione un tipo de aforo');
      return false;
    }

    if (this.esResidencial() && (!this.numeroSuscriptores() || this.numeroSuscriptores() < MIN_SUSCRIPTORES)) {
      this.toastService.warning('Validación', `El número de suscriptores debe ser al menos ${MIN_SUSCRIPTORES}`);
      return false;
    }

    if (this.esNoResidencial() && (!this.produccionPromedio() || this.produccionPromedio() <= 0)) {
      this.toastService.warning('Validación', 'Ingrese una producción mensual válida');
      return false;
    }



    if (this.frecuenciaRecoleccion() < MIN_FRECUENCIA || this.frecuenciaRecoleccion() > MAX_FRECUENCIA) {
      this.toastService.warning('Validación', `La frecuencia de recolección debe estar entre ${MIN_FRECUENCIA} y ${MAX_FRECUENCIA}`);
      return false;
    }

    if (this.frecuenciaBarrido() < MIN_FRECUENCIA || this.frecuenciaBarrido() > MAX_FRECUENCIA) {
      this.toastService.warning('Validación', `La frecuencia de barrido debe estar entre ${MIN_FRECUENCIA} y ${MAX_FRECUENCIA}`);
      return false;
    }

    return true;
  }

  private calcularProduccionMensual(): number {
    if (this.esResidencial()) {
      return this.numeroSuscriptores() * this.tonPromedioCRA();
    }

    return this.produccionPromedio();
  }

  private getSelectedTipoUsoId(): number {
    const tipoUsoData = this.typeUse.value();
    if (!tipoUsoData || !tipoUsoData.response) {
      return 0;
    }

    const tipoUsoEncontrado = tipoUsoData.response.find(
      (tu: any) => tu.codigo === this.tipoUso()
    );

    return tipoUsoEncontrado?.id || 0;
  }

  private limpiarFormulario(): void {
    this.tipoUso.set('');
    this.tipoAforo.set('');
    this.numeroSuscriptores.set(MIN_SUSCRIPTORES);
    this.produccionPromedio.set(0);
    this.frecuenciaRecoleccion.set(MIN_FRECUENCIA);
    this.frecuenciaBarrido.set(MIN_FRECUENCIA);
    this.tarifaBase.set(0);
  }

  openAforosModal(): void {
    this.isAforosModalOpen.set(true);
  }

  closeAforosModal(): void {
    this.isAforosModalOpen.set(false);
    this.cancelEdit(); // Limpiar cualquier edición al cerrar
    this.searchTerm.set(''); // Limpiar búsqueda al cerrar
  }

  toggleViewMode(): void {
    this.viewMode.set(this.viewMode() === 'grid' ? 'list' : 'grid');
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  startEditAforo(aforo: any): void {
    this.editingAforoId.set(aforo.id);
    this.editForm.set({
      nombre: aforo.nombre,
      tipoAforo: { id: aforo.tipoAforo.id },
      tipoUso: { id: aforo.tipoUso.id },
      numeroSuscriptores: aforo.numeroSuscriptores,
      produMensual: aforo.produMensual,
      frecBarrido: aforo.frecBarrido,
      frecRecoleccion: aforo.frecRecoleccion,
      tarifaBase: aforo.tarifaBase,
      promedioCRA: aforo.promedioCRA
    });
  }

  updateEditField(field: string, value: number): void {
    const currentForm = this.editForm();
    if (currentForm) {
      if (field === 'tipoAforo' || field === 'tipoUso') {
        this.editForm.set({ ...currentForm, [field]: { id: value } });
      } else {
        this.editForm.set({ ...currentForm, [field]: value });
      }
    }
  }

  updateEditFieldString(field: string, value: string): void {
    const currentForm = this.editForm();
    if (currentForm) {
      this.editForm.set({ ...currentForm, [field]: value });
    }
  }

  cancelEdit(): void {
    this.editingAforoId.set(null);
    this.editForm.set(null);
  }

  saveEditAforo(aforoId: number): void {
    const formData = this.editForm();
    const userData = this.userData();

    if (!formData || !userData) {
      this.toastService.error('Error', 'No se pudo obtener los datos del formulario');
      return;
    }

    if (!formData.nombre || formData.nombre.trim() === '') {
      this.toastService.error('Error', 'El nombre del aforo es requerido');
      return;
    }

    this.updatingAforo.set(true);

    const aforo: any = {
      id: aforoId,
      empresa: { id: this.enterpriseId() },
      tipoAforo: formData.tipoAforo,
      tipoUso: formData.tipoUso,
      nombre: formData.nombre,
      numeroSuscriptores: formData.numeroSuscriptores,
      produMensual: formData.produMensual,
      frecBarrido: formData.frecBarrido,
      frecRecoleccion: formData.frecRecoleccion,
      tarifaBase: formData.tarifaBase,
      promedioCRA: formData.promedioCRA,
      usuarioCreacion: userData.usuario || 'sistema'
    };

    this.counterService.saveAforo(aforo).subscribe({
      next: (response) => {
        this.updatingAforo.set(false);
        this.toastService.success('Éxito', 'Aforo actualizado correctamente');
        this.cancelEdit();
        this.aforosEnterprice.reload();
      },
      error: (error) => {
        this.updatingAforo.set(false);
        this.toastService.error('Error', `No se pudo actualizar el aforo: ${error.message || 'Error desconocido'}`);
      }
    });
  }

  confirmDeleteAforo(aforoId: number): void {
    this.deletingAforoId.set(aforoId);
    this.isDeleteConfirmModalOpen.set(true);
  }

  closeDeleteConfirmModal(): void {
    if (!this.isDeleting()) {
      this.isDeleteConfirmModalOpen.set(false);
      this.deletingAforoId.set(null);
    }
  }

  confirmDelete(): void {
    const aforoId = this.deletingAforoId();
    if (aforoId !== null) {
      this.isDeleting.set(true);
      this.deleteAforo(aforoId);
    }
  }

  deleteAforo(aforoId: number): void {
    this.counterService.deleteAforo(aforoId).subscribe({
      next: (response) => {
        this.isDeleting.set(false);
        this.deletingAforoId.set(null);
        this.isDeleteConfirmModalOpen.set(false);
        if (response.success || response.success !== false) {
          this.toastService.success('Éxito', 'Aforo eliminado correctamente');
          this.aforosEnterprice.reload();
        } else {
          this.toastService.error('Error', response.message || 'Error al eliminar el aforo');
        }
      },
      error: (error) => {
        this.isDeleting.set(false);
        this.deletingAforoId.set(null);
        this.isDeleteConfirmModalOpen.set(false);
        this.toastService.error('Error', `No se pudo eliminar el aforo: ${error.message || 'Error desconocido'}`);
      }
    });
  }
}
















