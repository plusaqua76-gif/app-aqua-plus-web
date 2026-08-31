import { isPlatformBrowser, CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, PLATFORM_ID, computed, signal } from '@angular/core';
import { LecturasContadoresService, LecturasData } from '@services/lecturas-contadores.service';
import { LocationService } from '@shared/services/location.service';
import { ClientesKpiService } from '@services/clientes-kpi.service';
import { IClienteKPIResumen } from '@interfaces/IClienteKPIResponse';
import { Subscription } from 'rxjs';
import { chartTooltipShell } from '../../utils/chart-tooltip.util';

declare const ApexCharts: any;

interface UsuarioPendienteLectura {
  id: number;
  nombre: string;
  nuid: string;
  vereda: string;
  direccion: string;
  serial: string;
  diasPendiente: number;
}

const MOCK_USUARIOS_PENDIENTES: UsuarioPendienteLectura[] = [
  { id: 1, nombre: 'Carlos Muñoz', nuid: 'ACU-0142', vereda: 'La Esperanza', direccion: 'Cra 4 # 12-30', serial: 'CNT-88421', diasPendiente: 12 },
  { id: 2, nombre: 'Ana Perdomo', nuid: 'ACU-0087', vereda: 'El Progreso', direccion: 'Cl 8 # 5-14', serial: 'CNT-77302', diasPendiente: 9 },
  { id: 3, nombre: 'Luis Castaño', nuid: 'ACU-0201', vereda: 'San José', direccion: 'Dg 10 # 3-22', serial: 'CNT-91055', diasPendiente: 7 },
  { id: 4, nombre: 'Rosa Trujillo', nuid: 'ACU-0033', vereda: 'La Esperanza', direccion: 'Cra 2 # 18-05', serial: 'CNT-66218', diasPendiente: 15 },
  { id: 5, nombre: 'Jorge Herrera', nuid: 'ACU-0119', vereda: 'El Progreso', direccion: 'Cl 3 # 9-41', serial: 'CNT-55890', diasPendiente: 5 },
  { id: 6, nombre: 'Marta Gómez', nuid: 'ACU-0278', vereda: 'Buenos Aires', direccion: 'Tv 6 # 11-08', serial: 'CNT-44107', diasPendiente: 11 },
  { id: 7, nombre: 'Pedro Vargas', nuid: 'ACU-0156', vereda: 'San José', direccion: 'Cra 7 # 2-17', serial: 'CNT-33944', diasPendiente: 8 },
  { id: 8, nombre: 'Diana Rojas', nuid: 'ACU-0094', vereda: 'Buenos Aires', direccion: 'Cl 14 # 6-33', serial: 'CNT-22871', diasPendiente: 6 },
  { id: 9, nombre: 'Hernán Cárdenas', nuid: 'ACU-0310', vereda: 'La Esperanza', direccion: 'Dg 5 # 8-19', serial: 'CNT-11703', diasPendiente: 14 },
  { id: 10, nombre: 'Patricia Núñez', nuid: 'ACU-0245', vereda: 'El Progreso', direccion: 'Cra 9 # 15-02', serial: 'CNT-00628', diasPendiente: 4 },
];

/** Día del mes en que inicia la facturación y día de cierre / recaudo */
const DIA_INICIO_FACTURACION = 1;
const DIA_CIERRE_FACTURACION = 20;
const DIAS_RECAUDO = DIA_CIERRE_FACTURACION - DIA_INICIO_FACTURACION + 1;

interface PeriodoRecaudoInfo {
  diaInicio: number;
  diaCierre: number;
  totalDias: number;
  diasTranscurridos: number;
  diasRestantes: number;
  progreso: number;
  inicioFmt: string;
  cierreFmt: string;
  inicioCorto: string;
  cierreCorto: string;
  activo: boolean;
  cerrado: boolean;
  pendiente: boolean;
  estadoDiasLabel: string;
  mensajeProgreso: string;
}

interface RadialOptions {
  series: number[];                 // radialBar usa números (porcentajes)
  colors: string[];
  chart: {
    height: string | number;
    width: string | number;
    type: 'radialBar';
    sparkline?: { enabled: boolean }; // sparkline disponible en chart.sparkline
  };
  plotOptions: {
    radialBar: {
      track?: { background?: string };
      dataLabels?: { show: boolean };
      hollow?: { margin: number; size: string };
    };
  };
  grid: {
    show: boolean;
    strokeDashArray: number;
    padding: { left: number; right: number; top: number; bottom: number };
  };
  labels: string[];
  legend: { show: boolean; position: 'bottom' | 'top' | 'left' | 'right'; fontFamily: string };
  tooltip: {
    enabled: boolean;
    x?: { show: boolean };
    custom?: (options: any) => string;
    // Si quisieras formatear el valor, podrías usar y.formatter
    // y: { formatter?: (value: number) => string }
  };
  yaxis: {
    show: boolean;
    labels: { formatter: (value: number) => string };
  };
}

@Component({
  selector: 'app-website-traffic',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `


<div class="relative z-20 w-full h-full flex flex-col shadow-lg rounded-2xl border border-white/10 dark:border-slate-700/30 bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl p-3 sm:p-4">
  <div class="flex flex-wrap items-start justify-between gap-2 mb-3 shrink-0">
    <div class="min-w-0">
      <h5 class="text-base sm:text-lg font-bold leading-tight text-gray-900 dark:text-white">Lecturas de Contadores</h5>
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        Progreso de lectura por vereda del acueducto
      </p>
    </div>
    <button type="button"
            class="shrink-0 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            title="Más información">
      <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm0 16a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm1-5.034V12a1 1 0 0 1-2 0v-1.418a1 1 0 0 1 1.038-.999 1.436 1.436 0 0 0 1.488-1.441 1.501 1.501 0 1 0-3-.116.986.986 0 0 1-1.037.961 1 1 0 0 1-.96-1.037A3.5 3.5 0 1 1 11 11.466Z"/>
      </svg>
    </button>
  </div>

  <div class="rounded-lg  bg-white/20 dark:bg-slate-800/20 backdrop-blur-3xl p-3 border border-gray-200 dark:border-gray-600 mb-4">
    <div class="grid grid-cols-2 gap-3 mb-2">
      <dl class="bg-[#212c3c] rounded-lg flex flex-col items-center justify-center h-[78px]">
        <dt class="w-8 h-8 rounded-full bg-blue-100 dark:bg-gray-500 text-blue-600 dark:text-blue-300 text-sm font-medium flex items-center justify-center mb-1">{{ getTotalPersonasCompletadas() }}</dt>
        <dd class="text-blue-600 dark:text-blue-300 text-sm font-medium">Leídos</dd>
      </dl>
      <dl
        role="button"
        tabindex="0"
        (click)="openPendingUsersModal()"
        (keydown.enter)="openPendingUsersModal()"
        (keydown.space)="openPendingUsersModal(); $event.preventDefault()"
        class="bg-[#212c3c] rounded-lg flex flex-col items-center justify-center h-[78px] cursor-pointer
               hover:ring-2 hover:ring-orange-500/40 transition-all group"
        title="Ver usuarios pendientes">
        <dt class="w-8 h-8 rounded-full bg-orange-100 dark:bg-gray-500 text-orange-600 dark:text-orange-300 text-sm font-medium flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">{{ getTotalPersonasPendientes() || mockPendingCount() }}</dt>
        <dd class="text-orange-600 dark:text-orange-300 text-sm font-medium flex items-center gap-1">
          Pendientes
          <svg class="w-3 h-3 opacity-60 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
        </dd>
      </dl>
    </div>
    <div class="border-gray-200 border-t dark:border-gray-600 pt-3 mt-3 space-y-2">
      <dl class="flex items-center justify-between">
        <dt class="text-gray-500 dark:text-gray-400 text-sm font-normal">Contadores leídos:</dt>
        <dd class="bg-blue-100 text-blue-800 text-xs font-medium inline-flex items-center px-2.5 py-1 rounded-md dark:bg-blue-900 dark:text-blue-300">
          <svg class="w-2.5 h-2.5 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13V1m0 0L1 5m4-4 4 4"/>
          </svg> {{ getTotalPersonasCompletadas() }} contadores
        </dd>
      </dl>
      <dl class="flex items-center justify-between">
        <dt class="text-gray-500 dark:text-gray-400 text-sm font-normal">Contadores pendientes:</dt>
        <dd
          role="button"
          tabindex="0"
          (click)="openPendingUsersModal()"
          (keydown.enter)="openPendingUsersModal()"
          class="bg-orange-100 text-orange-800 text-xs font-medium inline-flex items-center px-2.5 py-1 rounded-md
                 dark:bg-orange-900 dark:text-orange-300 cursor-pointer hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors">
          <svg class="w-2.5 h-2.5 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1v12m0 0L1 9m4 4 4-4"/>
          </svg>
          {{ getTotalPersonasPendientes() || mockPendingCount() }} contadores — Ver listado
        </dd>
      </dl>
      <dl class="flex items-center justify-between">
        <dt class="text-gray-500 dark:text-gray-400 text-sm font-normal">Total de contadores:</dt>
        <dd class="bg-gray-100 text-gray-800 text-xs font-medium inline-flex items-center px-2.5 py-1 rounded-md dark:bg-gray-600 dark:text-gray-300">{{ getTotalPersonas() }} contadores</dd>
      </dl>
      <dl class="flex items-center justify-between">
        <dt class="text-gray-500 dark:text-gray-400 text-sm font-normal">Última actualización:</dt>
        <dd class="bg-gray-100 text-gray-800 text-xs font-medium inline-flex items-center px-2.5 py-1 rounded-md dark:bg-gray-600 dark:text-gray-300">{{ ultimaActualizacion }}</dd>
      </dl>
    </div>
  </div>

  <!-- Radial Chart -->
  <div class="py-3 shrink-0" id="radial-chart"></div>

  <!-- Resumen de clientes -->
      <!-- Filtro vereda -->
    <div class="pt-3 mt-auto">
      <div class="dropdown-container-acueducto relative">
        <button
          (click)="toggleDropdownAcueducto()"
          class="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900
                 dark:hover:text-white inline-flex items-center transition-colors"
          type="button">
          {{ acueductoSeleccionado }}
          <svg class="w-2.5 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
          </svg>
        </button>
        <div [class.hidden]="!isDropdownAcueductoOpen"
             class="absolute z-50 bottom-full mb-1 bg-white divide-y divide-gray-100 rounded-lg shadow-lg w-44 dark:bg-gray-700">
          <ul class="py-1 text-xs text-gray-700 dark:text-gray-200 max-h-40 overflow-y-auto">
            <li *ngFor="let vereda of veredasDisponibles">
              <button (click)="seleccionarAcueducto(vereda)"
                class="block w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                {{ vereda }}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  <div class="border-t border-white/10 pt-3 flex-1 min-h-0 flex flex-col">
    @if (clientesLoading()) {
      <div class="space-y-2 animate-pulse">
        <div class="h-16 rounded-xl bg-white/10 dark:bg-slate-700/30"></div>
        <div class="grid grid-cols-2 gap-2">
          <div class="h-14 rounded-xl bg-white/10 dark:bg-slate-700/30"></div>
          <div class="h-14 rounded-xl bg-white/10 dark:bg-slate-700/30"></div>
        </div>
      </div>
    } @else if (clientesResumen()) {
      <div class="space-y-2 w-full">
        <div class="w-full rounded-xl border border-white/10 bg-gradient-to-br from-white/15 to-white/5
                    dark:from-slate-700/40 dark:to-slate-800/20 backdrop-blur-sm p-3">
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0 flex-1">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Clientes Activos
              </p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white tabular-nums leading-none mt-1">
                {{ clientesResumen()!.clientesActivos | number:'1.0-0':'es-CO' }}
              </p>
            </div>
            <div class="w-px h-10 bg-white/10 shrink-0"></div>
            <div class="text-right min-w-0 flex-1">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Matrículas
              </p>
              <p class="text-xl font-bold text-teal-500 dark:text-teal-400 tabular-nums leading-none mt-1">
                {{ clientesResumen()!.matriculasActivas | number:'1.0-0':'es-CO' }}
              </p>
              <p class="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">total registrados</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 w-full">
          <div class="rounded-xl border border-orange-500/25 bg-orange-500/5 dark:bg-orange-500/10 p-2.5">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-orange-600/90 dark:text-orange-400/90">
              Clientes en Mora
            </p>
            <p class="text-lg font-bold text-orange-600 dark:text-orange-400 tabular-nums leading-none mt-1">
              {{ clientesResumen()!.clientesMora.total | number:'1.0-0':'es-CO' }}
            </p>
            <div class="flex items-center gap-1.5 mt-2">
              <div class="flex-1 h-1 rounded-full bg-orange-500/20 overflow-hidden">
                <div class="h-full rounded-full bg-orange-500 transition-all duration-500"
                     [style.width.%]="clientesResumen()!.clientesMora.porcentaje"></div>
              </div>
              <span class="text-[10px] font-semibold text-orange-500 dark:text-orange-400 shrink-0 tabular-nums">
                {{ clientesResumen()!.clientesMora.porcentaje | number:'1.1-1':'es-CO' }}%
              </span>
            </div>
            <p class="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">del total</p>
          </div>

          <div class="rounded-xl border border-emerald-500/25 bg-emerald-500/5 dark:bg-emerald-500/10 p-2.5">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-emerald-600/90 dark:text-emerald-400/90">
              Clientes al Día
            </p>
            <p class="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums leading-none mt-1">
              {{ clientesResumen()!.clientesAlDia.total | number:'1.0-0':'es-CO' }}
            </p>
            <div class="flex items-center gap-1.5 mt-2">
              <div class="flex-1 h-1 rounded-full bg-emerald-500/20 overflow-hidden">
                <div class="h-full rounded-full bg-emerald-500 transition-all duration-500"
                     [style.width.%]="clientesResumen()!.clientesAlDia.porcentaje"></div>
              </div>
              <span class="text-[10px] font-semibold text-emerald-500 dark:text-emerald-400 shrink-0 tabular-nums">
                {{ clientesResumen()!.clientesAlDia.porcentaje | number:'1.1-1':'es-CO' }}%
              </span>
            </div>
            <p class="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">del total</p>
          </div>
        </div>
      </div>
    }

    <!-- Periodo de recaudo — siempre visible, ancho completo -->
    <div class="w-full mt-2 rounded-xl border border-blue-500/25 bg-blue-500/5 dark:bg-blue-500/10 backdrop-blur-sm p-3">
      <div class="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wider text-blue-600/90 dark:text-blue-400/90">
            Periodo de Recaudo
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Del inicio de facturación al cierre del periodo
          </p>
        </div>
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border"
              [ngClass]="periodoRecaudo().cerrado
                ? 'bg-gray-500/15 border-gray-500/30 text-gray-500 dark:text-gray-400'
                : periodoRecaudo().pendiente
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : 'bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400'">
          @if (periodoRecaudo().cerrado) { Cierre realizado }
          @else if (periodoRecaudo().pendiente) { Próximo periodo }
          @else { Recaudo activo }
        </span>
      </div>

      <div class="grid grid-cols-3 gap-2 w-full mb-3">
        <div class="rounded-lg bg-white/10 dark:bg-slate-700/30 border border-white/10 p-2 text-center min-w-0">
          <p class="text-[9px] font-semibold uppercase text-gray-400 dark:text-gray-500 leading-tight">Inicio facturación</p>
          <p class="text-xs font-bold text-gray-800 dark:text-gray-100 mt-1 leading-tight">{{ periodoRecaudo().inicioCorto }}</p>
          <p class="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">día {{ periodoRecaudo().diaInicio }}</p>
        </div>
        <div class="rounded-lg bg-white/10 dark:bg-slate-700/30 border border-white/10 p-2 text-center min-w-0">
          <p class="text-[9px] font-semibold uppercase text-gray-400 dark:text-gray-500 leading-tight">Fecha corte</p>
          <p class="text-xs font-bold text-gray-800 dark:text-gray-100 mt-1 leading-tight">{{ periodoRecaudo().cierreCorto }}</p>
          <p class="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">día {{ periodoRecaudo().diaCierre }}</p>
        </div>
        <div class="rounded-lg bg-white/10 dark:bg-slate-700/30 border border-white/10 p-2 text-center min-w-0">
          <p class="text-[9px] font-semibold uppercase text-gray-400 dark:text-gray-500 leading-tight">Días recaudo</p>
          <p class="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1">{{ periodoRecaudo().totalDias }} días</p>
          <p class="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">{{ periodoRecaudo().estadoDiasLabel }}</p>
        </div>
      </div>

      <div class="relative w-full">
        <div class="flex justify-between text-[9px] text-gray-400 dark:text-gray-500 mb-1">
          <span>{{ periodoRecaudo().inicioCorto }}</span>
          <span>{{ periodoRecaudo().cierreCorto }}</span>
        </div>
        <div class="h-2 w-full rounded-full bg-blue-500/15 overflow-hidden">
          <div class="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
               [style.width.%]="periodoRecaudo().progreso"></div>
        </div>
        <p class="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5 text-center">
          {{ periodoRecaudo().mensajeProgreso }}
        </p>
      </div>
    </div>


  </div>
</div>

<!-- Modal: Usuarios pendientes de lectura -->
@if (isPendingUsersModalOpen()) {
<div class="fixed inset-0 z-[1000] overflow-y-auto">
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" (click)="closePendingUsersModal()"></div>
  <div class="flex min-h-full items-start justify-center p-4 pt-20">
    <div class="relative w-full max-w-4xl bg-white/10 dark:bg-slate-800/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl flex flex-col max-h-[calc(100vh-5.5rem)]">

      <!-- Header -->
      <div class="flex-shrink-0 flex items-center justify-between p-6 border-b border-white/10 dark:border-slate-700/30">
        <h3 class="text-xl font-bold text-gray-700 dark:text-gray-200 flex items-center gap-3">
          <svg class="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Usuarios Pendientes de Lectura
          <span class="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30">
            {{ filteredPendingUsers().length }}
          </span>
        </h3>
        <button type="button" (click)="closePendingUsersModal()" class="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/20 transition-all">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Cuerpo -->
      <div class="p-6 overflow-y-auto flex-1">
        <div class="mb-4">
          <input
            type="text"
            [value]="pendingUsersSearch()"
            (input)="onPendingUsersSearch($any($event.target).value)"
            placeholder="Buscar por nombre, NUID, vereda o serial..."
            class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 backdrop-blur-md transition-all"
          />
        </div>

        <div class="overflow-x-auto rounded-xl border border-white/20 dark:border-slate-700/30">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-white/30 dark:bg-slate-700/40 border-b border-white/20 dark:border-slate-700/30">
                <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Cliente</th>
                <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">NUID</th>
                <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Vereda</th>
                <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Dirección</th>
                <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Serial</th>
                <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Días</th>
              </tr>
            </thead>
            <tbody>
              @for (user of paginatedPendingUsers(); track user.id) {
                <tr class="border-b border-white/10 dark:border-slate-700/20 hover:bg-white/20 dark:hover:bg-slate-700/20 transition-colors">
                  <td class="px-4 py-3.5 font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap">{{ user.nombre }}</td>
                  <td class="px-4 py-3.5 text-gray-400 dark:text-gray-500 font-mono text-xs whitespace-nowrap">{{ user.nuid }}</td>
                  <td class="px-4 py-3.5 text-gray-600 dark:text-gray-300 whitespace-nowrap">{{ user.vereda }}</td>
                  <td class="px-4 py-3.5 text-gray-500 dark:text-gray-400 max-w-[180px] truncate" [title]="user.direccion">{{ user.direccion }}</td>
                  <td class="px-4 py-3.5 text-gray-600 dark:text-gray-300 font-mono text-xs whitespace-nowrap">{{ user.serial }}</td>
                  <td class="px-4 py-3.5 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                          [ngClass]="user.diasPendiente >= 10
                            ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700/40'
                            : 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700/40'">
                      {{ user.diasPendiente }} días
                    </span>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No se encontraron usuarios pendientes con ese criterio.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (filteredPendingUsers().length > 0) {
        <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Mostrando
            <span class="font-semibold text-gray-700 dark:text-gray-300">{{ pendingUsersRangeStart() }}–{{ pendingUsersRangeEnd() }}</span>
            de
            <span class="font-semibold text-gray-700 dark:text-gray-300">{{ filteredPendingUsers().length }}</span>
            usuarios
          </p>
          <div class="flex items-center gap-1.5">
            <button
              type="button"
              (click)="goToPendingUsersPage(pendingUsersPage() - 1)"
              [disabled]="pendingUsersPage() <= 1"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/20 dark:border-slate-600/40
                     text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-slate-700/40 transition-all
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent">
              Anterior
            </button>
            @for (page of pendingUsersPageNumbers(); track page) {
              <button
                type="button"
                (click)="goToPendingUsersPage(page)"
                class="min-w-[2rem] px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                [ngClass]="page === pendingUsersPage()
                  ? 'bg-orange-500/20 border-orange-500/40 text-orange-600 dark:text-orange-400'
                  : 'border-white/20 dark:border-slate-600/40 text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-slate-700/40'">
                {{ page }}
              </button>
            }
            <button
              type="button"
              (click)="goToPendingUsersPage(pendingUsersPage() + 1)"
              [disabled]="pendingUsersPage() >= pendingUsersTotalPages()"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/20 dark:border-slate-600/40
                     text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-slate-700/40 transition-all
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent">
              Siguiente
            </button>
          </div>
        </div>
        }
      </div>

      <!-- Footer -->
      <div class="flex-shrink-0 flex justify-end gap-3 p-6 border-t border-white/10 dark:border-slate-700/30">
        <button type="button" (click)="closePendingUsersModal()" class="px-5 py-2.5 rounded-xl border border-gray-400/30 bg-gray-500/10 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-500/20 transition-all">
          Cerrar
        </button>
      </div>

    </div>
  </div>
</div>
}


  `,
})
export class WebsiteTraffic implements AfterViewInit, OnDestroy {

  private chart: any;
  private readonly subscription = new Subscription();
  public datosLecturas: LecturasData | null = null;
  public isDropdownAcueductoOpen = false;
  public acueductoSeleccionado = 'Todas las veredas';
  public veredasDisponibles: string[] = [];
  public corregimientos: any[] = [];
  public corregimientoSeleccionado: any = null;
  public ultimaActualizacion = 'Hace 5 min';
  public cargandoActualizacion = false;
  public cantidad = 0;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly lecturasService = inject(LecturasContadoresService);
  private readonly locationService = inject(LocationService);
  private readonly clientesKpiService = inject(ClientesKpiService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly clientesResumen = signal<IClienteKPIResumen | null>(null);
  readonly clientesLoading = signal(true);

  readonly isPendingUsersModalOpen = signal(false);
  readonly pendingUsersSearch = signal('');
  readonly pendingUsersPage = signal(1);
  readonly pendingUsersPageSize = 5;
  readonly mockPendingCount = computed(() => MOCK_USUARIOS_PENDIENTES.length);

  readonly filteredPendingUsers = computed(() => {
    const term = this.pendingUsersSearch().trim().toLowerCase();
    if (!term) return MOCK_USUARIOS_PENDIENTES;
    return MOCK_USUARIOS_PENDIENTES.filter(u =>
      u.nombre.toLowerCase().includes(term) ||
      u.nuid.toLowerCase().includes(term) ||
      u.vereda.toLowerCase().includes(term) ||
      u.serial.toLowerCase().includes(term) ||
      u.direccion.toLowerCase().includes(term)
    );
  });

  readonly pendingUsersTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredPendingUsers().length / this.pendingUsersPageSize))
  );

  readonly paginatedPendingUsers = computed(() => {
    const page = Math.min(this.pendingUsersPage(), this.pendingUsersTotalPages());
    const start = (page - 1) * this.pendingUsersPageSize;
    return this.filteredPendingUsers().slice(start, start + this.pendingUsersPageSize);
  });

  readonly pendingUsersPageNumbers = computed(() =>
    Array.from({ length: this.pendingUsersTotalPages() }, (_, i) => i + 1)
  );

  readonly pendingUsersRangeStart = computed(() => {
    const total = this.filteredPendingUsers().length;
    if (total === 0) return 0;
    return (this.pendingUsersPage() - 1) * this.pendingUsersPageSize + 1;
  });

  readonly pendingUsersRangeEnd = computed(() => {
    const total = this.filteredPendingUsers().length;
    if (total === 0) return 0;
    return Math.min(this.pendingUsersPage() * this.pendingUsersPageSize, total);
  });

  readonly periodoRecaudo = computed((): PeriodoRecaudoInfo => {
    const now = this.currentDate();
    const year = now.getFullYear();
    const month = now.getMonth();
    const inicio = new Date(year, month, DIA_INICIO_FACTURACION);
    const cierre = new Date(year, month, DIA_CIERRE_FACTURACION);
    const totalDias = DIAS_RECAUDO;

    const pendiente = now < inicio;
    const cerrado = now > cierre;
    const activo = !pendiente && !cerrado;

    let diasTranscurridos = 0;
    if (activo) {
      diasTranscurridos = Math.floor((now.getTime() - inicio.getTime()) / 86_400_000) + 1;
    } else if (cerrado) {
      diasTranscurridos = totalDias;
    }

    const diasRestantes = Math.max(0, totalDias - diasTranscurridos);
    const progreso = pendiente ? 0 : Math.min(100, Math.round((diasTranscurridos / totalDias) * 100));

    const fmtLargo = (d: Date) =>
      d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
    const fmtCorto = (d: Date) =>
      d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });

    const inicioFmt = fmtLargo(inicio);
    const cierreFmt = fmtLargo(cierre);

    let estadoDiasLabel = `${diasRestantes} restantes`;
    let mensajeProgreso = `Día ${diasTranscurridos} de ${totalDias} — quedan ${diasRestantes} días para el cierre`;

    if (pendiente) {
      estadoDiasLabel = 'por iniciar';
      mensajeProgreso = `El periodo inicia el ${inicioFmt}`;
    } else if (cerrado) {
      estadoDiasLabel = 'finalizado';
      mensajeProgreso = `Cierre de facturación el ${cierreFmt} — periodo finalizado`;
    }

    return {
      diaInicio: DIA_INICIO_FACTURACION,
      diaCierre: DIA_CIERRE_FACTURACION,
      totalDias,
      diasTranscurridos,
      diasRestantes,
      progreso,
      inicioFmt,
      cierreFmt,
      inicioCorto: fmtCorto(inicio),
      cierreCorto: fmtCorto(cierre),
      activo,
      cerrado,
      pendiente,
      estadoDiasLabel,
      mensajeProgreso,
    };
  });

  readonly userData = computed(() => {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const userDataString = sessionStorage.getItem('userData');
      if (!userDataString) return null;
      return JSON.parse(userDataString);
    } catch (e) {
      return null;
    }
  });



  readonly ciudadActualId = computed(() => {
    const data = this.userData();
    return data?.empresa?.direccion?.ciudad?.id || null;
  });

  readonly ciudadId = computed(() => this.ciudadActualId());

  readonly empresaId = computed(() => {
    const data = this.userData();
    return data?.empresaId || null;
  });

  readonly currentDate = computed(() => {
    if (!isPlatformBrowser(this.platformId)) return new Date();
    return new Date();
  });

  readonly currentYear = computed(() => {
    return this.currentDate().getFullYear();
  });

  readonly currentMonth = computed(() => {
    return this.currentDate().getMonth() + 1;
  });

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      requestAnimationFrame(() => {
        this.initRadial();
        this.cargarCorregimientos();
        this.loadClientesResumen();
        this.waitForFlowbite().then(() => this.initFlowbite());
      });
      document.addEventListener('click', this.cerrarDropdownsOnOutsideClick.bind(this));
    }
  }

  private waitForFlowbite(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).initFlowbite) {
        resolve();
      } else {
        let attempts = 0;
        const interval = setInterval(() => {
          if ((window as any).initFlowbite || attempts > 40) {
            clearInterval(interval);
            resolve();
          }
          attempts++;
        }, 50);
      }
    });
  }

  private initFlowbite(): void {
    if (typeof window !== 'undefined' && (window as any).initFlowbite) {
      (window as any).initFlowbite();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.subscription.unsubscribe();
    // Remover listener
    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener('click', this.cerrarDropdownsOnOutsideClick.bind(this));
    }
  }

  /**
   * Cerrar dropdowns al hacer clic fuera
   */
  private cerrarDropdownsOnOutsideClick(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdownAcueducto = target.closest('.dropdown-container-acueducto');

    if (!dropdownAcueducto) {
      this.isDropdownAcueductoOpen = false;
    }
  }

  private loadClientesResumen(): void {
    const empresaId = this.empresaId();
    if (!empresaId) {
      this.clientesLoading.set(false);
      return;
    }

    this.subscription.add(
      this.clientesKpiService.getClientesKPIDinamico({
        empresaId,
        anio: this.currentYear(),
        mes: this.currentMonth(),
        rangoPor: 'emision',
        exclusivo: false,
      }).subscribe({
        next: (response) => {
          this.clientesResumen.set(response.resumen);
          this.clientesLoading.set(false);
          this.cdr.detectChanges();
        },
        error: () => {
          this.clientesLoading.set(false);
          this.cdr.detectChanges();
        },
      })
    );
  }

  private cargarDatosLecturas(): void {
    const empresaId = this.empresaId();
    const anio = this.currentYear();
    const mes = this.currentMonth();

    // Si no tenemos datos del usuario, mostrar gráfica vacía
    if (!empresaId) {
      console.warn('No se encontró empresa ID, mostrando gráfica vacía');
      this.datosLecturas = null;
      this.cantidad = 0; // Resetear cantidad cuando no hay empresa ID
      this.initRadial();
      return;
    }

    const sub = this.lecturasService.getLecturasDinamicas(empresaId, this.ciudadId(), undefined, mes, anio).subscribe({
      next: (data: LecturasData) => {
        this.datosLecturas = data;
        this.actualizarVeredasDisponibles();
        this.actualizarUltimaActualizacion(data.resumen.ultimaActualizacion);

        // Actualizar la cantidad de personas completadas (contadoresCompletados del resumen)
        this.cantidad = data.resumen.contadoresCompletados || 0;

        // Forzar detección de cambios para actualizar la UI
        this.cdr.detectChanges();

        // Actualizar la gráfica existente o crear una nueva si no existe
        if (this.chart) {
          this.actualizarGraficoRadial();
        } else {
          setTimeout(() => {
            this.initRadial();
          }, 0);
        }
      },
      error: (error: any) => {
        this.datosLecturas = null;
        this.cantidad = 0; // Resetear cantidad en caso de error

        // Forzar detección de cambios
        this.cdr.detectChanges();

        if (this.chart) {
          this.actualizarGraficoRadial();
        } else {
          this.initRadial();
        }
      }
    });
    this.subscription.add(sub);
  }

  /**
   * Cambiar ciudad y actualizar corregimientos (uso manual desde código)
   */
  private cambiarCiudad(nuevaCiudadId: number): void {
    // Note: No podemos cambiar ciudadId directamente ya que es un computed signal
    // Este método necesitaría ser refactorizado para usar signals writable
    console.warn('cambiarCiudad: Este método necesita ser refactorizado para usar writable signals');
    // Limpiar datos anteriores
    this.datosLecturas = null;
    this.veredasDisponibles = [];
    this.corregimientoSeleccionado = null; // Limpiar corregimiento seleccionado
    this.acueductoSeleccionado = 'Cargando...';
    // Cargar nuevos corregimientos y datos
    this.cargarCorregimientos();
  }

  /**
   * Cargar corregimientos dinámicamente desde el API
   */
  private cargarCorregimientos(): void {
    const sub = this.locationService.getCorregimientos(this.ciudadId()).subscribe({
      next: (response) => {
        if (response.response && response.response.length > 0) {
          this.corregimientos = response.response;
          // Actualizar veredas disponibles con los nombres de los corregimientos
          this.veredasDisponibles = this.corregimientos.map(corr => corr.nombre);

          // Si hay veredas disponibles, seleccionar la primera como default
          if (this.veredasDisponibles.length > 0) {
            this.acueductoSeleccionado = this.veredasDisponibles[0];
            // También establecer el corregimiento seleccionado por defecto
            this.corregimientoSeleccionado = this.corregimientos[0];
          }

          // Forzar detección de cambios
          this.cdr.detectChanges();

          // Una vez cargados los corregimientos, cargar las lecturas dinámicas
          this.cargarDatosLecturas();
        } else {
          // Si no hay corregimientos, mostrar gráfica vacía
          console.warn('No se encontraron corregimientos');
          this.veredasDisponibles = [];
          this.datosLecturas = null;

          // Forzar detección de cambios
          this.cdr.detectChanges();

          if (this.chart) {
            this.actualizarGraficoRadial();
          }
        }
      },
      error: (error) => {
        this.veredasDisponibles = [];
        this.datosLecturas = null;

        // Forzar detección de cambios
        this.cdr.detectChanges();

        if (this.chart) {
          this.actualizarGraficoRadial();
        }
      }
    });
    this.subscription.add(sub);
  }

  /**
   * Actualizar las veredas disponibles según el filtro de estado
   */
  private actualizarVeredasDisponibles(): void {
    // Si tenemos corregimientos dinámicos, usarlos; sino, dejar vacío
    if (this.corregimientos && this.corregimientos.length > 0) {
      this.veredasDisponibles = this.corregimientos.map(corr => corr.nombre);
    } else {
      this.veredasDisponibles = [];
    }

    // Si la vereda actualmente seleccionada no está disponible, seleccionar la primera disponible
    if (this.veredasDisponibles.length > 0 && !this.veredasDisponibles.includes(this.acueductoSeleccionado)) {
      this.acueductoSeleccionado = this.veredasDisponibles[0];
    } else if (this.veredasDisponibles.length === 0) {
      this.acueductoSeleccionado = 'Sin datos';
    }
  }

  /**
   * Obtener datos de la vereda seleccionada
   */
  private getVeredaSeleccionada(): any {
    if (!this.datosLecturas || !this.acueductoSeleccionado) return null;
    return this.datosLecturas.veredas.find(v => v.nombre === this.acueductoSeleccionado);
  }

  /**
   * Obtener personas completadas (contadores completados)
   */
  getTotalPersonasCompletadas(): number {
    return this.datosLecturas?.resumen?.contadoresCompletados || 0;
  }

  /**
   * Obtener personas pendientes (contadores pendientes)
   */
  getTotalPersonasPendientes(): number {
    return this.datosLecturas?.resumen?.contadoresPendientes || 0;
  }

  /**
   * Obtener total de personas (total de contadores)
   */
  getTotalPersonas(): number {
    return this.datosLecturas?.resumen?.totalContadores || 0;
  }

  /**
   * Obtener veredas completadas del resumen
   */
  getVeredasCompletadas(): number {
    return this.datosLecturas?.resumen?.veredasCompletadas || 0;
  }

  /**
   * Obtener veredas pendientes del resumen
   */
  getVeredasPendientes(): number {
    return this.datosLecturas?.resumen?.veredasPendientes || 0;
  }

  /**
   * Obtener porcentaje de completado de la vereda seleccionada
   */
  getPorcentajeCompletado(): number {
    const vereda = this.getVeredaSeleccionada();
    return vereda ? vereda.porcentajeCompletado : 0;
  }

  /**
   * Obtener número de contadores completados de la vereda seleccionada
   */
  getContadoresCompletados(): number {
    const vereda = this.getVeredaSeleccionada();
    return vereda ? vereda.contadoresLeidos : 0;
  }

  /**
   * Toggle del dropdown de acueducto
   */
  toggleDropdownAcueducto(): void {
    this.isDropdownAcueductoOpen = !this.isDropdownAcueductoOpen;
  }

  openPendingUsersModal(): void {
    this.pendingUsersSearch.set('');
    this.pendingUsersPage.set(1);
    this.isPendingUsersModalOpen.set(true);
  }

  closePendingUsersModal(): void {
    this.isPendingUsersModalOpen.set(false);
    this.pendingUsersSearch.set('');
    this.pendingUsersPage.set(1);
  }

  onPendingUsersSearch(value: string): void {
    this.pendingUsersSearch.set(value);
    this.pendingUsersPage.set(1);
  }

  goToPendingUsersPage(page: number): void {
    const safe = Math.max(1, Math.min(page, this.pendingUsersTotalPages()));
    this.pendingUsersPage.set(safe);
  }

  /**
   * Seleccionar vereda específica
   */
  seleccionarAcueducto(vereda: string): void {
    this.acueductoSeleccionado = vereda;
    this.isDropdownAcueductoOpen = false;

    // Buscar el corregimiento seleccionado y guardarlo
    this.corregimientoSeleccionado = this.corregimientos.find(corr => corr.nombre === vereda);

    if (this.corregimientoSeleccionado) {
      // Cargar datos específicos del corregimiento seleccionado
      this.cargarDatosParaCorregimiento(this.corregimientoSeleccionado);
    } else if (this.chart) {
      // Actualizar gráfica con datos de la nueva vereda seleccionada (datos existentes)
      this.actualizarGraficoRadialParaVereda();
    }
  }

  /**
   * Cargar datos específicos para un corregimiento
   * Ahora envía el ID del corregimiento seleccionado al endpoint
   */
  private cargarDatosParaCorregimiento(corregimiento: any): void {
    const empresaId = this.empresaId();
    const anio = this.currentYear();
    const mes = this.currentMonth();

    if (!empresaId) {
      console.warn('No se encontró empresa ID');
      return;
    }

    // Usar el ID del corregimiento seleccionado
    const corregimientoId = corregimiento.id;
    const sub = this.lecturasService.getLecturasDinamicas(
      empresaId,
      this.ciudadId(),
      corregimientoId, // Ahora enviamos el ID del corregimiento
      mes,
      anio
    ).subscribe({
      next: (data: LecturasData) => {
        this.datosLecturas = data;
        this.actualizarUltimaActualizacion(data.resumen.ultimaActualizacion);

        // Actualizar la cantidad de personas completadas para el corregimiento específico
        this.cantidad = data.resumen.contadoresCompletados || 0;

        // Forzar detección de cambios
        this.cdr.detectChanges();

        if (this.chart) {
          this.actualizarGraficoRadial();
        }
      },
      error: (error: any) => {
        this.cantidad = 0;
        if (this.chart) {
          this.actualizarGraficoRadialParaVereda();
        }
      }
    });
    this.subscription.add(sub);
  }

  /**
   * Actualizar lecturas manualmente
   */
  actualizarLecturas(): void {
    this.cargandoActualizacion = true;

    const empresaId = this.empresaId();
    const anio = this.currentYear();
    const mes = this.currentMonth();

    if (!empresaId) {
      // Si no hay empresa ID, no podemos actualizar
      console.warn('No se puede actualizar: falta empresa ID');
      this.cargandoActualizacion = false;
      return;
    }

    // Usar API dinámica para actualizar manteniendo el filtro de corregimiento
    const corregimientoId = this.corregimientoSeleccionado ? this.corregimientoSeleccionado.id : undefined;

    const sub = this.lecturasService.getLecturasDinamicas(
      empresaId,
      this.ciudadId(),
      corregimientoId, // Mantener el filtro de corregimiento seleccionado
      mes,
      anio
    ).subscribe({
      next: (data: LecturasData) => {
        this.datosLecturas = data;
        this.actualizarVeredasDisponibles();
        this.actualizarUltimaActualizacion(data.resumen.ultimaActualizacion);
        this.cargandoActualizacion = false;

        // Actualizar la cantidad de personas completadas
        this.cantidad = data.resumen.contadoresCompletados || 0;

        // Forzar detección de cambios
        this.cdr.detectChanges();

        if (this.chart) {
          this.actualizarGraficoRadial();
        }
      },
      error: (error: any) => {
        this.cargandoActualizacion = false;
        // No mostrar datos mock en caso de error
        this.datosLecturas = null;
        this.cantidad = 0; // Resetear cantidad en caso de error

        // Forzar detección de cambios
        this.cdr.detectChanges();

        if (this.chart) {
          this.actualizarGraficoRadial();
        }
      }
    });
    this.subscription.add(sub);
  }



  /**
   * Actualizar el gráfico radial con nuevos datos
   */
  private actualizarGraficoRadial(): void {
    if (this.chart && this.datosLecturas) {
      const total = this.datosLecturas.resumen.totalContadores;
      const completados = this.datosLecturas.resumen.contadoresCompletados;

      const porcentajeCompletadas = total > 0 ?
        Math.round((completados / total) * 100) : 0;
      const porcentajePendientes = 100 - porcentajeCompletadas;

      this.chart.updateSeries([porcentajeCompletadas, porcentajePendientes]);
    }
  }

  /**
   * Actualizar el gráfico radial para mostrar datos de la vereda específica
   */
  private actualizarGraficoRadialParaVereda(): void {
    if (this.chart) {
      const vereda = this.getVeredaSeleccionada();
      if (vereda) {
        const porcentajeCompletado = vereda.porcentajeCompletado;
        const porcentajePendiente = 100 - porcentajeCompletado;

        this.chart.updateSeries([porcentajeCompletado, porcentajePendiente]);
      }
    }
  }

  /**
   * Actualizar timestamp de última actualización desde la respuesta del API
   */
  private actualizarUltimaActualizacion(fechaApi?: string): void {
    if (fechaApi) {
      // Usar la fecha del API si está disponible
      const fecha = new Date(fechaApi);
      this.ultimaActualizacion = this.formatearFechaHora(fecha);
    } else {
      // Fallback a fecha actual
      const ahora = new Date();
      this.ultimaActualizacion = this.formatearFechaHora(ahora);
    }
  }

  /**
   * Formatear fecha y hora en formato 12 horas (AM/PM)
   */
  private formatearFechaHora(fecha: Date): string {
    const opciones: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Bogota'
    };

    return fecha.toLocaleString('es-CO', opciones);
  }

  private getChartOptions(): RadialOptions {
    // Calcular porcentajes basados en la nueva estructura de datos
    let porcentajeCompletadas: number;
    let porcentajePendientes: number;

    if (this.datosLecturas?.resumen?.totalContadores && this.datosLecturas.resumen.totalContadores > 0) {
      // Calcular porcentajes basados en contadores completados vs pendientes
      const contadoresCompletados = this.datosLecturas.resumen.contadoresCompletados || 0;
      const total = this.datosLecturas.resumen.totalContadores;

      porcentajeCompletadas = Math.round((contadoresCompletados / total) * 100);
      porcentajePendientes = 100 - porcentajeCompletadas;
    } else {
      // Datos por defecto cuando no hay información
      porcentajeCompletadas = 0;
      porcentajePendientes = 0;
    }

    return {
      series: [porcentajeCompletadas, porcentajePendientes],
      colors: ['#10b94e', '#ff683b'], // Azul para completadas, Naranja para pendientes
      chart: {
        height: '350px',
        width: '100%',
        type: 'radialBar',
        sparkline: { enabled: true }, // oculta ejes/ruido cuando está activo
      },
      plotOptions: {
        radialBar: {
          track: { background: '#E5E7EB' }, // track configurable en radialBar options
          dataLabels: { show: false },
          hollow: { margin: 0, size: '32%' },
        },
      },
      grid: {
        show: false,
        strokeDashArray: 4,
        padding: { left: 2, right: 2, top: -23, bottom: -20 },
      },
      labels: ['Contadores Completados', 'Contadores Pendientes'],
      legend: {
        show: true,
        position: 'bottom',
        fontFamily: 'Inter, sans-serif',
      },
      tooltip: {
        enabled: true,
        x: { show: false },
        custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
          const vereda = this.getVeredaSeleccionada();
          let cantidad: number;
          let fechaUltimaLectura: string;

          if (vereda) {
            const isCompletados = seriesIndex === 0;
            cantidad = isCompletados ? vereda.contadoresLeidos : vereda.contadoresPendientes;
            fechaUltimaLectura = vereda.ultimaLectura;
          } else if (this.datosLecturas) {
            // Mostrar datos generales si no hay vereda seleccionada pero hay datos
            const isCompletados = seriesIndex === 0;
            cantidad = isCompletados ? this.datosLecturas.resumen.contadoresCompletados : this.datosLecturas.resumen.contadoresPendientes;
            fechaUltimaLectura = this.datosLecturas.resumen.ultimaActualizacion || 'Sin datos';
          } else {
            // Sin datos - mostrar 0
            cantidad = 0;
            fechaUltimaLectura = 'Sin datos';
          }

          const isCompletados = seriesIndex === 0;
          const porcentaje = series[seriesIndex] || 0;

          return chartTooltipShell(`
              <div style="font-size:13px;font-weight:700;color:#f8fafc;margin-bottom:6px;">
                ${isCompletados ? 'Contadores Completados' : 'Contadores Pendientes'}
              </div>
              <div style="font-size:15px;font-weight:700;color:${isCompletados ? '#2563eb' : '#ea580c'};margin-bottom:6px;">
                ${cantidad} (${porcentaje}%)
              </div>
              <div style="font-size:11px;color:#94a3b8;">
                Última lectura: ${fechaUltimaLectura}
              </div>`, { padding: '12px 16px' });
        }
      },
      yaxis: {
        show: false,
        labels: { formatter: (value: number) => `${value}%` },
      },
    };
  }

  private waitForApexCharts(): Promise<void> {
    return new Promise((resolve) => {
      const checkApexCharts = () => {
        if ((globalThis as any).ApexCharts === undefined) {
          setTimeout(checkApexCharts, 100);
        } else {
          resolve();
        }
      };
      checkApexCharts();
    });
  }

  /**
   * Obtener la cantidad de personas completadas (contadores leídos)
   */
  getCantidad(): number {
    return this.cantidad;
  }

  private async initRadial(): Promise<void> {
    const el = document.getElementById('radial-chart') as HTMLElement;

    if (!el) {
      setTimeout(() => {
        this.initRadial();
      }, 100);
      return;
    }

    try {
      // Esperar a que ApexCharts esté disponible
      await this.waitForApexCharts();
      const ApexChartsLib = (globalThis as any).ApexCharts;

      // Si ya existe un chart, destruirlo antes de crear uno nuevo
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }

      const chartOptions = this.getChartOptions();

      this.chart = new ApexChartsLib(el, chartOptions);

      await this.chart.render();

    } catch (error) {
      setTimeout(() => {
        this.initRadial();
      }, 1000);
    }
  }
}
