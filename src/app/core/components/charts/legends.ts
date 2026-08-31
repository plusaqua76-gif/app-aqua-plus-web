import { isPlatformBrowser, CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  OnDestroy,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { FacturasDataService } from '@services/facturas-data.service';
import { IFacturasData } from '@interfaces/IFacturasData';
import { Subscription } from 'rxjs';
import { chartTooltipShell } from '../../utils/chart-tooltip.util';
import { ColombianCurrencyPipe } from '../../../shared/pipes/colombian-currency.pipe';

declare const ApexCharts: any;

const MES_ABREV: Record<string, string> = {
  Enero: 'Ene', Febrero: 'Feb', Marzo: 'Mar', Abril: 'Abr',
  Mayo: 'May', Junio: 'Jun', Julio: 'Jul', Agosto: 'Ago',
  Septiembre: 'Sep', Octubre: 'Oct', Noviembre: 'Nov', Diciembre: 'Dic',
};

function fmtNum(v: number): string {
  return v.toLocaleString('es-CO');
}

const MONTH_OPTIONS = [
  'Todos los meses', 'Enero', 'Febrero', 'Marzo', 'Abril',
  'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre',
  'Octubre', 'Noviembre', 'Diciembre',
];

const MONTH_MAP: Record<string, number> = {
  Enero: 1, Febrero: 2, Marzo: 3, Abril: 4,
  Mayo: 5, Junio: 6, Julio: 7, Agosto: 8,
  Septiembre: 9, Octubre: 10, Noviembre: 11, Diciembre: 12,
};

type LegendSeriesKey = 'pagadas' | 'pendientes' | 'vencidas';

const LEGEND_ITEMS: {
  key: LegendSeriesKey;
  label: string;
  seriesName: string;
  dotClass: string;
}[] = [
  { key: 'pagadas',    label: 'Pagadas',    seriesName: 'Pagadas',    dotClass: 'bg-emerald-500' },
  { key: 'pendientes', label: 'Pendientes', seriesName: 'Pendientes', dotClass: 'bg-blue-500'   },
  { key: 'vencidas',   label: 'Vencidas',   seriesName: 'Vencidas',   dotClass: 'bg-red-500'    },
];

@Component({
  selector: 'app-legends',
  standalone: true,
  imports: [CommonModule, ColombianCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="relative z-20 w-full h-full bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl rounded-2xl
            shadow-lg border border-white/10 dark:border-slate-700/30 p-3 sm:p-4 transition-all duration-300 flex flex-col">

  <!-- Header ----------------------------------------------------------------->
  <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3 shrink-0">
    <div class="min-w-0">
      <h2 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
        Estado de Facturas por Mes
      </h2>
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        Facturas pagadas, pendientes y vencidas
      </p>
    </div>
    <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                 bg-blue-100/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shrink-0 self-start sm:self-auto">
      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      {{ periodBadge() }}
    </span>
  </div>

  <!-- KPI Cards -------------------------------------------------------------->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2 shrink-0">

    <div class="rounded-xl p-2 sm:p-2.5 bg-white/25 dark:bg-slate-700/25 border border-white/20 dark:border-slate-600/25 min-w-0">
      <p class="text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 leading-tight">Pagadas</p>
      @if (isLoading()) {
        <div class="h-5 w-full bg-gray-200/60 dark:bg-slate-600/60 rounded animate-pulse mt-1.5"></div>
      } @else {
        <p class="mt-1 text-xs sm:text-sm font-semibold tabular-nums text-gray-800 dark:text-gray-100 leading-snug truncate">
          {{ totalMontoPagadas() | colombianCurrency }}
        </p>
      }
    </div>

    <div class="rounded-xl p-2 sm:p-2.5 bg-white/25 dark:bg-slate-700/25 border border-white/20 dark:border-slate-600/25 min-w-0">
      <p class="text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 leading-tight">Pendientes</p>
      @if (isLoading()) {
        <div class="h-5 w-full bg-gray-200/60 dark:bg-slate-600/60 rounded animate-pulse mt-1.5"></div>
      } @else {
        <p class="mt-1 text-xs sm:text-sm font-semibold tabular-nums text-gray-800 dark:text-gray-100 leading-snug truncate">
          {{ totalMontoPendientes() | colombianCurrency }}
        </p>
      }
    </div>

    <div class="rounded-xl p-2 sm:p-2.5 bg-white/25 dark:bg-slate-700/25 border border-white/20 dark:border-slate-600/25 min-w-0">
      <p class="text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 leading-tight">Vencidas</p>
      @if (isLoading()) {
        <div class="h-5 w-full bg-gray-200/60 dark:bg-slate-600/60 rounded animate-pulse mt-1.5"></div>
      } @else {
        <p class="mt-1 text-xs sm:text-sm font-semibold tabular-nums text-gray-800 dark:text-gray-100 leading-snug truncate">
          {{ totalMontoVencidas() | colombianCurrency }}
        </p>
      }
    </div>

    <div class="rounded-xl p-2 sm:p-2.5 bg-white/25 dark:bg-slate-700/25 border border-white/20 dark:border-slate-600/25 min-w-0">
      <p class="text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 leading-tight">Facturado</p>
      @if (isLoading()) {
        <div class="h-5 w-full bg-gray-200/60 dark:bg-slate-600/60 rounded animate-pulse mt-1.5"></div>
      } @else {
        <p class="mt-1 text-xs sm:text-sm font-semibold tabular-nums text-gray-800 dark:text-gray-100 leading-snug truncate">
          {{ totalRecaudado() | colombianCurrency }}
        </p>
      }
    </div>

  </div>

  <!-- Chart section ---------------------------------------------------------->
  <div class="flex flex-col shrink-0">
    <div class="flex flex-wrap items-center justify-between gap-2 mb-2 shrink-0">
      <h3 class="text-xs font-semibold text-gray-600 dark:text-gray-400">
        Evolución mensual
      </h3>

      <div class="flex items-center gap-2 shrink-0">
        <!-- Year dropdown -->
        <div class="year-dropdown-container relative">
          <button
            (click)="toggleYearDropdown()"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                   bg-white/50 dark:bg-slate-700/50 border border-gray-200/60 dark:border-slate-600/40
                   text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-slate-700/80
                   transition-all duration-150"
            type="button">
            {{ selectedYear() }}
            <svg class="w-3 h-3 transition-transform duration-150" [class.rotate-180]="isYearDropdownOpen"
                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
            </svg>
          </button>
          <div [class.hidden]="!isYearDropdownOpen"
               class="absolute right-0 bottom-full mb-1 z-50 min-w-[100px]
                      bg-white dark:bg-slate-800 rounded-xl shadow-xl
                      border border-gray-100 dark:border-slate-700 overflow-hidden">
            <ul class="py-1 text-xs text-gray-700 dark:text-gray-200">
              @for (year of availableYears(); track year) {
                <li>
                  <button
                    (click)="selectYear(year)"
                    class="block w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    [class.text-blue-600]="selectedYear() === year"
                    [class.font-semibold]="selectedYear() === year">
                    {{ year }}
                  </button>
                </li>
              }
            </ul>
          </div>
        </div>

        <!-- Month dropdown -->
        <div class="dropdown-container relative">
          <button
            (click)="toggleDropdown()"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                   bg-white/50 dark:bg-slate-700/50 border border-gray-200/60 dark:border-slate-600/40
                   text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-slate-700/80
                   transition-all duration-150"
            type="button">
            {{ selectedMonth }}
            <svg class="w-3 h-3 transition-transform duration-150" [class.rotate-180]="isDropdownOpen"
                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
            </svg>
          </button>
          <div [class.hidden]="!isDropdownOpen"
               class="absolute right-0 bottom-full mb-1 z-50 w-44
                      bg-white dark:bg-slate-800 rounded-xl shadow-xl
                      border border-gray-100 dark:border-slate-700 overflow-hidden">
            <ul class="py-1 text-xs text-gray-700 dark:text-gray-200 max-h-52 overflow-y-auto">
              @for (m of monthOptions; track m) {
                <li>
                  <button
                    (click)="selectMonth(m)"
                    class="block w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    [class.text-blue-600]="selectedMonth === m"
                    [class.font-semibold]="selectedMonth === m">
                    {{ m }}
                  </button>
                </li>
              }
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Leyenda interactiva (reemplaza apexcharts-legend; evita solapamiento con filtros) -->
    <div class="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 mb-2 shrink-0">
      @for (item of legendItems; track item.key) {
        <button
          type="button"
          (click)="toggleSeries(item.key)"
          class="flex items-center gap-1.5 text-[10px] font-medium transition-all duration-150 cursor-pointer select-none
                 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 rounded px-1 -mx-1"
          [ngClass]="isSeriesVisible(item.key)
            ? 'opacity-100 text-gray-500 dark:text-gray-400'
            : 'opacity-40 line-through text-gray-400 dark:text-gray-500'"
          [attr.aria-pressed]="isSeriesVisible(item.key)"
          [attr.aria-label]="'Mostrar u ocultar ' + item.label">
          <span class="inline-block w-2 h-2 rounded-full shrink-0 transition-opacity"
                [class]="item.dotClass"
                [class.opacity-30]="!isSeriesVisible(item.key)"></span>
          {{ item.label }}
        </button>
      }
    </div>

    <!-- Chart with optional loading overlay -->
    <div class="relative w-full shrink-0">
      @if (isLoading()) {
        <div class="absolute inset-0 flex items-center justify-center z-10
                    rounded-xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm">
          <div class="flex flex-col items-center gap-2">
            <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span class="text-xs text-gray-500 dark:text-gray-400">Cargando datos&hellip;</span>
          </div>
        </div>
      }
      <div id="legend-chart"></div>
    </div>
  </div>

</div>
  `,
})
export class Legends implements AfterViewInit, OnDestroy {

  private chart: any;
  private subscription?: Subscription;
  private readonly boundOutsideClick: (e: Event) => void;

  protected readonly platformId = inject(PLATFORM_ID);
  protected readonly isBrowser   = isPlatformBrowser(this.platformId);
  private  readonly facturasService = inject(FacturasDataService);
  private  readonly cdr             = inject(ChangeDetectorRef);

  readonly chartData  = signal<IFacturasData | null>(null);
  readonly isLoading  = signal<boolean>(true);
  readonly hasError   = signal<boolean>(false);

  isDropdownOpen     = false;
  isYearDropdownOpen = false;
  selectedMonth      = 'Todos los meses';
  readonly monthOptions = MONTH_OPTIONS;

  readonly selectedYear   = signal<number>(new Date().getFullYear());
  readonly availableYears = signal<number[]>([2020, 2021, 2022, 2023, 2024, 2025, 2026]);
  readonly legendItems    = LEGEND_ITEMS;

  /** Visibilidad por serie — equivalente al toggle de apexcharts-legend */
  readonly seriesVisible = signal<Record<LegendSeriesKey, boolean>>({
    pagadas: true,
    pendientes: true,
    vencidas: true,
  });

  // ---------- Derived KPIs (montos en COP) ----------
  readonly totalMontoPagadas    = computed(() => this.chartData()?.totalMontoPagadas    ?? this.chartData()?.totalMontoRecaudado ?? 0);
  readonly totalMontoPendientes = computed(() => this.chartData()?.totalMontoPendientes ?? 0);
  readonly totalMontoVencidas   = computed(() => this.chartData()?.totalMontoVencidas   ?? 0);
  readonly totalRecaudado       = computed(() => this.chartData()?.totalMontoRecaudado ?? this.totalMontoPagadas());

  readonly periodBadge = computed(() => {
    const data = this.chartData();
    const year = this.selectedYear();
    if (!data || data.xAxis.length === 0) return `${year}`;
    const first = MES_ABREV[data.xAxis[0]] ?? data.xAxis[0].slice(0, 3);
    const last  = MES_ABREV[data.xAxis[data.xAxis.length - 1]] ?? data.xAxis[data.xAxis.length - 1].slice(0, 3);
    return first === last ? `${first} ${year}` : `${first}-${last} ${year}`;
  });

  // ---------- Session / auth ----------
  readonly userData = computed(() => {
    if (!this.isBrowser) return null;
    try {
      const s = sessionStorage.getItem('userData');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  readonly empresaId   = computed(() => this.userData()?.empresaId ?? null);
  readonly currentYear = computed(() => this.selectedYear());

  constructor() {
    this.boundOutsideClick = this.closeDropdownOnOutsideClick.bind(this);
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadFacturasData();
      document.addEventListener('click', this.boundOutsideClick);
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.subscription?.unsubscribe();
    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener('click', this.boundOutsideClick);
    }
  }

  private closeDropdownOnOutsideClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container'))      this.isDropdownOpen     = false;
    if (!target.closest('.year-dropdown-container')) this.isYearDropdownOpen = false;
    this.cdr.markForCheck();
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) this.isYearDropdownOpen = false;
  }

  toggleYearDropdown(): void {
    this.isYearDropdownOpen = !this.isYearDropdownOpen;
    if (this.isYearDropdownOpen) this.isDropdownOpen = false;
  }

  selectYear(year: number): void {
    this.selectedYear.set(year);
    this.isYearDropdownOpen = false;
    this.selectedMonth = 'Todos los meses';
    this.resetSeriesVisibility();
    this.chart?.destroy();
    this.chart = null;
    this.loadFacturasData();
  }

  isSeriesVisible(key: LegendSeriesKey): boolean {
    return this.seriesVisible()[key];
  }

  toggleSeries(key: LegendSeriesKey): void {
    const item = LEGEND_ITEMS.find(i => i.key === key);
    if (!item || !this.chart) return;

    this.chart.toggleSeries(item.seriesName);
    this.seriesVisible.update(state => ({
      ...state,
      [key]: !state[key],
    }));
    this.cdr.markForCheck();
  }

  private resetSeriesVisibility(): void {
    this.seriesVisible.set({
      pagadas: true,
      pendientes: true,
      vencidas: true,
    });
  }

  selectMonth(monthName: string): void {
    this.selectedMonth    = monthName;
    this.isDropdownOpen   = false;
    const empresaId = this.empresaId();
    const anio      = this.currentYear();
    if (!empresaId || !anio) return;

    this.isLoading.set(true);
    this.resetSeriesVisibility();
    this.chart?.destroy();
    this.chart = null;
    this.subscription?.unsubscribe();

    const monthNumber = MONTH_MAP[monthName];

    if (monthNumber) {
      this.subscription = this.facturasService
        .getFacturasMesDinamico(empresaId, anio, monthNumber)
        .subscribe({
          next: (response: any) => {
            const monthData: IFacturasData = {
              xAxis: [monthName],
              yAxis: {
                facturasPagadas:    [response.facturasPagadas?.total    ?? 0],
                facturasPendientes: [response.facturasPendientes?.total ?? 0],
                facturasVencidas:   [response.facturasVencidas?.total   ?? 0],
              },
              totalMontoPagadas:    response.facturasPagadas?.totalMonto    ?? 0,
              totalMontoPendientes: response.facturasPendientes?.totalMonto ?? 0,
              totalMontoVencidas:   response.facturasVencidas?.totalMonto   ?? 0,
              totalMontoRecaudado:  response.facturasPagadas?.totalMonto    ?? 0,
            };
            this.chartData.set(monthData);
            this.isLoading.set(false);
            this.hasError.set(false);
            setTimeout(() => this.initializeAreaChart(), 0);
          },
          error: () => { this.isLoading.set(false); this.hasError.set(true); },
        });
    } else {
      this.subscription = this.facturasService
        .getFacturasDataAnual(empresaId, anio)
        .subscribe({
          next: (data: IFacturasData) => {
            this.chartData.set(data);
            this.isLoading.set(false);
            this.hasError.set(false);
            setTimeout(() => this.initializeAreaChart(), 0);
          },
          error: () => { this.isLoading.set(false); this.hasError.set(true); },
        });
    }
  }

  private loadFacturasData(): void {
    const empresaId = this.empresaId();
    const anio      = this.currentYear();

    if (!empresaId || !anio) {
      this.isLoading.set(false);
      this.hasError.set(true);
      return;
    }

    this.isLoading.set(true);
    this.subscription = this.facturasService.getFacturasDataAnual(empresaId, anio).subscribe({
      next: (data: IFacturasData) => {
        this.chartData.set(data);
        this.isLoading.set(false);
        this.hasError.set(false);
        setTimeout(() => this.initializeAreaChart(), 0);
      },
      error: () => {
        this.isLoading.set(false);
        this.hasError.set(true);
        this.initializeAreaChart();
      },
    });
  }

  private getChartOptions(): any {
    const data = this.chartData();

    const series = [
      { name: 'Pagadas',    data: data?.yAxis.facturasPagadas    ?? [], color: '#10B981' },
      { name: 'Pendientes', data: data?.yAxis.facturasPendientes ?? [], color: '#3B82F6' },
      { name: 'Vencidas',   data: data?.yAxis.facturasVencidas   ?? [], color: '#EF4444' },
    ];

    const categories = data?.xAxis ?? [];

    return {
      series,
      colors: ['#10B981', '#3B82F6', '#EF4444'],

      chart: {
        height: 260,
        maxWidth: '100%',
        type: 'area',
        fontFamily: 'Inter, sans-serif',
        background: 'transparent',
        dropShadow: { enabled: false },
        toolbar: { show: false },
        animations: { enabled: true, easing: 'easeinout', speed: 700 },
      },

      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.38,
          opacityTo: 0.02,
          stops: [0, 90, 100],
        },
      },

      stroke: { width: 2.5, curve: 'smooth' },
      dataLabels: { enabled: false },

      legend: { show: false },

      tooltip: {
        shared: true,
        intersect: false,
        custom: ({ series: s, dataPointIndex: i, w }: any) => {
          const month    = w.globals.labels[i] ?? '';
          const pagadas  = s[0]?.[i] ?? 0;
          const pendien  = s[1]?.[i] ?? 0;
          const vencidas = s[2]?.[i] ?? 0;
          const total    = pagadas + pendien + vencidas;

          return chartTooltipShell(`
              <p style="font-weight:700;font-size:13px;color:#f8fafc;
                        margin-bottom:10px;padding-bottom:8px;
                        border-bottom:1px solid rgba(255,255,255,0.07);">${month}</p>
              <div style="display:flex;flex-direction:column;gap:7px;">
                <div style="display:flex;justify-content:space-between;gap:20px;">
                  <span style="display:flex;align-items:center;gap:6px;color:#6ee7b7;font-size:12px;">
                    <span style="width:8px;height:8px;border-radius:50%;background:#10B981;display:inline-block;flex-shrink:0;"></span>
                    Pagadas
                  </span>
                  <span style="color:#f8fafc;font-size:12px;font-weight:600;">${fmtNum(pagadas)}</span>
                </div>
                <div style="display:flex;justify-content:space-between;gap:20px;">
                  <span style="display:flex;align-items:center;gap:6px;color:#93c5fd;font-size:12px;">
                    <span style="width:8px;height:8px;border-radius:50%;background:#3B82F6;display:inline-block;flex-shrink:0;"></span>
                    Pendientes
                  </span>
                  <span style="color:#f8fafc;font-size:12px;font-weight:600;">${fmtNum(pendien)}</span>
                </div>
                <div style="display:flex;justify-content:space-between;gap:20px;">
                  <span style="display:flex;align-items:center;gap:6px;color:#fca5a5;font-size:12px;">
                    <span style="width:8px;height:8px;border-radius:50%;background:#EF4444;display:inline-block;flex-shrink:0;"></span>
                    Vencidas
                  </span>
                  <span style="color:#f8fafc;font-size:12px;font-weight:600;">${fmtNum(vencidas)}</span>
                </div>
                <div style="display:flex;justify-content:space-between;gap:20px;margin-top:2px;
                            padding-top:8px;border-top:1px solid rgba(255,255,255,0.07);">
                  <span style="color:#94a3b8;font-size:11px;font-weight:500;">Total mes</span>
                  <span style="color:#f8fafc;font-size:12px;font-weight:700;">${fmtNum(total)}</span>
                </div>
              </div>`);
        },
      },

      grid: {
        show: true,
        strokeDashArray: 3,
        borderColor: 'rgba(156,163,175,0.15)',
        padding: { left: 8, right: 4, top: 4, bottom: -4 },
      },

      xaxis: {
        categories,
        labels: {
          show: true,
          style: { colors: '#9CA3AF', fontSize: '12px', fontFamily: 'Inter, sans-serif' },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },

      yaxis: {
        show: true,
        labels: {
          style: { colors: '#9CA3AF', fontSize: '12px', fontFamily: 'Inter, sans-serif' },
          formatter: (v: number) => `${v}`,
          offsetX: -7,
        },
      },
    };
  }

  private initializeAreaChart(): void {
    const el = document.getElementById('legend-chart');
    if (el && typeof ApexCharts !== 'undefined') {
      this.chart = new ApexCharts(el, this.getChartOptions());
      this.chart.render().catch(() => {});
    }
  }
}
