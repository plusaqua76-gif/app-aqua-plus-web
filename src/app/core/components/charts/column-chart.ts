import { isPlatformBrowser, registerLocaleData, CommonModule } from '@angular/common';
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
import { ClientesKpiService } from '@services/clientes-kpi.service';
import { IColumnChartData } from '@interfaces/IBilledConsumption';
import { Subscription } from 'rxjs';
import localeEs from '@angular/common/locales/es-CO';
import { chartTooltipShell } from '../../utils/chart-tooltip.util';
import { fmtCOP, fmtM3Compact } from '../../utils/currency.util';
import { ColombianCurrencyPipe } from '../../../shared/pipes/colombian-currency.pipe';

declare const ApexCharts: any;

function fmtM3(v: number): string {
  return v.toLocaleString('es-CO') + ' m³';
}

function fmtMillions(v: number): string {
  return '$' + (v / 1_000_000).toFixed(1) + 'M';
}

const MONTH_MAP: Record<string, number> = {
  Enero: 1, Febrero: 2, Marzo: 3, Abril: 4,
  Mayo: 5, Junio: 6, Julio: 7, Agosto: 8,
  Septiembre: 9, Octubre: 10, Noviembre: 11, Diciembre: 12,
};

const MES_ABREV: Record<string, string> = {
  Enero: 'Ene', Febrero: 'Feb', Marzo: 'Mar', Abril: 'Abr',
  Mayo: 'May', Junio: 'Jun', Julio: 'Jul', Agosto: 'Ago',
  Septiembre: 'Sep', Octubre: 'Oct', Noviembre: 'Nov', Diciembre: 'Dic',
};

type ColumnLegendKey = 'consumo' | 'facturado';

const COLUMN_LEGEND_ITEMS: {
  key: ColumnLegendKey;
  label: string;
  seriesName: string;
  dotClass: string;
  shape: 'square' | 'circle';
}[] = [
  { key: 'consumo',   label: 'Consumo (m³)', seriesName: 'Consumo (m³)', dotClass: 'bg-blue-600',   shape: 'square' },
  { key: 'facturado', label: 'Facturado ($)', seriesName: 'Facturado ($)', dotClass: 'bg-emerald-500', shape: 'circle' },
];

@Component({
  selector: 'app-column-chart-card',
  standalone: true,
  imports: [CommonModule, ColombianCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="relative z-10 w-full h-full bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl rounded-2xl
            shadow-lg border border-white/10 dark:border-slate-700/30 p-3 sm:p-4 transition-all duration-300 flex flex-col">

  <!-- ── 1. Header ─────────────────────────────────────────────────────────── -->
  <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3 shrink-0">
    <div class="min-w-0 pr-2">
      <h2 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
        Consumo vs Facturación
      </h2>
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        Comparación entre consumo en m³ y monto facturado por mes
      </p>
    </div>
    <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                 bg-blue-100/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300
                 shrink-0 self-start sm:self-auto ml-auto">
      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      {{ periodBadge() }}
    </span>
  </div>

  <!-- ── 2. KPI Cards ───────────────────────────────────────────────────────── -->
  <div class="grid grid-cols-2 gap-2 mb-2 shrink-0">

    <div class="rounded-xl p-2 sm:p-2.5 bg-white/25 dark:bg-slate-700/25 border border-white/20 dark:border-slate-600/25 min-w-0">
      <p class="text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 leading-tight">Consumo</p>
      @if (isLoading()) {
        <div class="h-5 w-full bg-gray-200/60 dark:bg-slate-600/60 rounded animate-pulse mt-1.5"></div>
      } @else {
        <p class="mt-1 text-xs sm:text-sm font-semibold tabular-nums text-gray-800 dark:text-gray-100 leading-snug truncate">
          {{ totalConsumoCompact() }}
        </p>
      }
    </div>

    <div class="rounded-xl p-2 sm:p-2.5 bg-white/25 dark:bg-slate-700/25 border border-white/20 dark:border-slate-600/25 min-w-0">
      <p class="text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 leading-tight">Facturado</p>
      @if (isLoading()) {
        <div class="h-5 w-full bg-gray-200/60 dark:bg-slate-600/60 rounded animate-pulse mt-1.5"></div>
      } @else {
        <p class="mt-1 text-xs sm:text-sm font-semibold tabular-nums text-gray-800 dark:text-gray-100 leading-snug truncate">
          {{ totalFacturado() | colombianCurrency }}
        </p>
      }
    </div>

  </div>

  <!-- ── 3. Chart section ───────────────────────────────────────────────────── -->
  <div class="flex flex-col shrink-0">
    <div class="flex flex-wrap items-center justify-between gap-2 mb-2 shrink-0">
      <h3 class="text-xs font-semibold text-gray-600 dark:text-gray-400">
        Evolución mensual
      </h3>

      <div class="flex items-center gap-2 shrink-0">
        <div class="year-dropdown-container relative">
          <button
            (click)="toggleYearDropdown()"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                   bg-white/50 dark:bg-slate-700/50 border border-gray-200/60 dark:border-slate-600/40
                   text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-slate-700/80 transition-all duration-150"
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
                  <button (click)="selectYear(year)"
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

        <div class="dropdown-container relative">
          <button
            (click)="toggleDropdown()"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                   bg-white/50 dark:bg-slate-700/50 border border-gray-200/60 dark:border-slate-600/40
                   text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-slate-700/80 transition-all duration-150"
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
              <li>
                <button (click)="selectMonth('Todos los meses')"
                  class="block w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  [class.text-blue-600]="selectedMonth === 'Todos los meses'"
                  [class.font-semibold]="selectedMonth === 'Todos los meses'">
                  Todos los meses
                </button>
              </li>
              @for (month of availableMonths(); track month) {
                <li>
                  <button (click)="selectMonth(month)"
                    class="block w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    [class.text-blue-600]="selectedMonth === month"
                    [class.font-semibold]="selectedMonth === month">
                    {{ month }}
                  </button>
                </li>
              }
            </ul>
          </div>
        </div>
      </div>
    </div>

  <!-- ── 4. Custom legend ───────────────────────────────────────────────────── -->
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
        @if (item.shape === 'square') {
          <span class="inline-block w-2.5 h-2.5 rounded-sm shrink-0 transition-opacity"
                [class]="item.dotClass"
                [class.opacity-30]="!isSeriesVisible(item.key)"></span>
        } @else {
          <span class="inline-block w-2.5 h-2.5 rounded-full shrink-0 transition-opacity"
                [class]="item.dotClass"
                [class.opacity-30]="!isSeriesVisible(item.key)"></span>
        }
        {{ item.label }}
      </button>
    }
  </div>

  <!-- ── 4. Chart / empty state ─────────────────────────────────────────────── -->
  @if (hasData()) {
    <div class="relative shrink-0">
      @if (isLoading()) {
        <div class="absolute inset-0 flex items-center justify-center z-10
                    rounded-xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm">
          <div class="flex flex-col items-center gap-2">
            <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span class="text-xs text-gray-500 dark:text-gray-400">Cargando datos&hellip;</span>
          </div>
        </div>
      }
      <div id="column-chart"></div>
    </div>
  } @else {
    <div class="flex flex-col items-center justify-center h-40 gap-2 text-gray-400 dark:text-gray-500 shrink-0">
      <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round"
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"/>
      </svg>
      <div class="text-center">
        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">No hay datos disponibles</p>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          Selecciona otro año o mes para ver información.
        </p>
      </div>
    </div>
  }

  </div>

</div>
  `,
})
export class ColumnChartCardComponent implements AfterViewInit, OnDestroy {

  private chart: any;
  private subscription?: Subscription;
  private readonly boundOutsideClick: (e: Event) => void;

  protected readonly platformId = inject(PLATFORM_ID);
  protected readonly isBrowser   = isPlatformBrowser(this.platformId);
  private  readonly clientesKpiService = inject(ClientesKpiService);
  private  readonly cdr                = inject(ChangeDetectorRef);

  readonly chartData  = signal<IColumnChartData | null>(null);
  readonly isLoading  = signal<boolean>(true);
  readonly hasError   = signal<boolean>(false);

  isDropdownOpen     = false;
  isYearDropdownOpen = false;
  selectedMonth      = 'Todos los meses';

  readonly availableMonths = signal<string[]>([]);
  readonly selectedYear    = signal<number>(new Date().getFullYear());
  readonly availableYears  = signal<number[]>([2020, 2021, 2022, 2023, 2024, 2025, 2026]);
  readonly legendItems     = COLUMN_LEGEND_ITEMS;

  readonly seriesVisible = signal<Record<ColumnLegendKey, boolean>>({
    consumo: true,
    facturado: true,
  });

  // ── Computed KPIs ─────────────────────────────────────────────────────────
  readonly totalConsumo   = computed(() => (this.chartData()?.yAxis.consumoM3    ?? []).reduce((a, b) => a + b, 0));
  readonly totalFacturado = computed(() => (this.chartData()?.yAxis.facturadoPesos ?? []).reduce((a, b) => a + b, 0));
  readonly monthCount     = computed(() => this.chartData()?.xAxis.length ?? 0);

  readonly totalConsumoCompact = computed(() => fmtM3Compact(this.totalConsumo()));

  readonly promedioConsumo = computed(() =>
    this.monthCount() > 0 ? Math.round(this.totalConsumo()   / this.monthCount()) : 0);

  readonly promedioFactura = computed(() =>
    this.monthCount() > 0 ? Math.round(this.totalFacturado() / this.monthCount()) : 0);

  readonly hasData = computed(() => {
    const d = this.chartData();
    return d !== null && d.xAxis.length > 0;
  });

  readonly periodBadge = computed(() => {
    const data = this.chartData();
    const year = this.selectedYear();
    if (!data || data.xAxis.length === 0) return `${year}`;
    const first = MES_ABREV[data.xAxis[0]] ?? data.xAxis[0].slice(0, 3);
    const last  = MES_ABREV[data.xAxis[data.xAxis.length - 1]] ?? data.xAxis[data.xAxis.length - 1].slice(0, 3);
    return first === last ? `${first} ${year}` : `${first}-${last} ${year}`;
  });

  // ── Auth ──────────────────────────────────────────────────────────────────
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
    registerLocaleData(localeEs);
    this.boundOutsideClick = this.closeDropdownOnOutsideClick.bind(this);
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadConsumoData();
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

  // ── Dropdown logic ────────────────────────────────────────────────────────

  private closeDropdownOnOutsideClick(event: Event): void {
    const t = event.target as HTMLElement;
    if (!t.closest('.dropdown-container'))      this.isDropdownOpen     = false;
    if (!t.closest('.year-dropdown-container')) this.isYearDropdownOpen = false;
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
    this.loadConsumoData();
  }

  isSeriesVisible(key: ColumnLegendKey): boolean {
    return this.seriesVisible()[key];
  }

  toggleSeries(key: ColumnLegendKey): void {
    const item = COLUMN_LEGEND_ITEMS.find(i => i.key === key);
    if (!item || !this.chart) return;

    this.chart.toggleSeries(item.seriesName);
    this.seriesVisible.update(state => ({
      ...state,
      [key]: !state[key],
    }));

    if (this.isSeriesVisible('facturado')) {
      setTimeout(() => {
        const el = document.getElementById('column-chart');
        if (el) this.bringAreaToFront({ el });
      }, 0);
    }

    this.cdr.markForCheck();
  }

  private resetSeriesVisibility(): void {
    this.seriesVisible.set({ consumo: true, facturado: true });
  }

  selectMonth(monthName: string): void {
    this.selectedMonth = monthName;
    this.isDropdownOpen = false;

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
      this.subscription = this.clientesKpiService
        .getBilledConsumptionForChart(empresaId, anio, monthNumber)
        .subscribe({
          next: (data: IColumnChartData) => {
            this.chartData.set(data);
            this.extractAvailableMonths(data);
            this.isLoading.set(false);
            this.hasError.set(false);
            setTimeout(() => this.initializeColumnChart(), 0);
          },
          error: () => { this.isLoading.set(false); this.hasError.set(true); },
        });
    } else {
      this.subscription = this.clientesKpiService
        .getBilledConsumptionForChart(empresaId, anio)
        .subscribe({
          next: (data: IColumnChartData) => {
            this.chartData.set(data);
            this.extractAvailableMonths(data);
            this.isLoading.set(false);
            this.hasError.set(false);
            setTimeout(() => this.initializeColumnChart(), 0);
          },
          error: () => { this.isLoading.set(false); this.hasError.set(true); },
        });
    }
  }

  // ── Data loading ─────────────────────────────────────────────────────────

  private loadConsumoData(): void {
    const empresaId = this.empresaId();
    const anio      = this.currentYear();

    if (!empresaId || !anio) {
      this.isLoading.set(false);
      this.hasError.set(true);
      return;
    }

    this.isLoading.set(true);
    this.subscription = this.clientesKpiService.getBilledConsumptionForChart(empresaId, anio).subscribe({
      next: (data: IColumnChartData) => {
        this.chartData.set(data);
        this.extractAvailableMonths(data);
        this.isLoading.set(false);
        this.hasError.set(false);
        setTimeout(() => this.initializeColumnChart(), 0);
      },
      error: () => {
        this.isLoading.set(false);
        this.hasError.set(true);
        this.initializeColumnChart();
      },
    });
  }

  private extractAvailableMonths(data: IColumnChartData): void {
    if (!data?.xAxis?.length) { this.availableMonths.set([]); return; }

    const order = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                   'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

    const active = new Set<string>();
    data.xAxis.forEach((name, i) => {
      if ((data.yAxis.consumoM3[i] > 0 || data.yAxis.facturadoPesos[i] > 0) && order.includes(name)) {
        active.add(name);
      }
    });

    this.availableMonths.set(order.filter(m => active.has(m)));
  }

  // ── Chart ─────────────────────────────────────────────────────────────────

  private buildSeries(data: IColumnChartData): any[] {
    return [
      {
        name: 'Consumo (m³)',
        type: 'column',
        data: data.xAxis.map((x, i) => ({ x, y: data.yAxis.consumoM3[i] })),
        color: '#1A56DB',
      },
      {
        name: 'Facturado ($)',
        type: 'area',
        data: data.xAxis.map((x, i) => ({ x, y: data.yAxis.facturadoPesos[i] })),
        color: '#10B981',
      },
    ];
  }

  private getChartOptions(data: IColumnChartData): any {
    const series = this.buildSeries(data);

    return {
      series,
      colors: ['#1A56DB', '#10B981'],

      chart: {
        type: 'bar',
        height: 260,
        width: '100%',
        background: 'transparent',
        fontFamily: 'Inter, sans-serif',
        toolbar: { show: false },
        animations: { enabled: true, easing: 'easeinout', speed: 700 },
        dropShadow: { enabled: false },
        events: {
          mounted:      (ctx: any) => this.bringAreaToFront(ctx),
          updated:      (ctx: any) => this.bringAreaToFront(ctx),
          animationEnd: (ctx: any) => this.bringAreaToFront(ctx),
        },
      },

      plotOptions: {
        bar: {
          columnWidth: '72%',
          borderRadius: 4,
          borderRadiusApplication: 'end',
        },
      },

      stroke: {
        width:     [0, 3],
        dashArray: [0, 0],
        curve:     ['straight', 'smooth'],
      },

      markers: {
        size:         [0, 5],
        strokeWidth:  2,
        strokeColors: ['transparent', '#10B981'],
        colors:       ['transparent', '#0f172a'],
        hover:        { size: 7 },
      },

      fill: {
        type: 'gradient',
        gradient: {
          type: 'vertical',
          colorStops: [
            // ── Barras azules: degradado de arriba (#1A56DB) a abajo (azul oscuro)
            [
              { offset: 0,   color: '#1A56DB', opacity: 1   },
              { offset: 60,  color: '#1746B0', opacity: 0.9 },
              { offset: 100, color: '#0F2D78', opacity: 0.8 },
            ],
            // ── Área verde: relleno muy suave bajo la línea
            [
              { offset: 0,   color: '#10B981', opacity: 0.22 },
              { offset: 70,  color: '#10B981', opacity: 0.07 },
              { offset: 100, color: '#10B981', opacity: 0    },
            ],
          ],
        },
      },
      dataLabels: { enabled: false },
      legend: { show: false },

      tooltip: {
        shared:    true,
        intersect: false,
        custom: ({ series: s, dataPointIndex: i, w }: any) => {
          const month     = w.globals.labels[i] ?? '';
          const consumo   = s[0]?.[i] ?? 0;
          const facturado = s[1]?.[i] ?? 0;

          return chartTooltipShell(`
              <p style="font-weight:700;font-size:13px;color:#f8fafc;
                        margin-bottom:10px;padding-bottom:8px;
                        border-bottom:1px solid rgba(255,255,255,0.07);">${month}</p>
              <div style="display:flex;flex-direction:column;gap:7px;">
                <div style="display:flex;justify-content:space-between;gap:20px;">
                  <span style="display:flex;align-items:center;gap:6px;color:#93c5fd;font-size:12px;">
                    <span style="width:8px;height:8px;border-radius:2px;background:#1A56DB;display:inline-block;flex-shrink:0;"></span>
                    Consumo
                  </span>
                  <span style="color:#f8fafc;font-size:12px;font-weight:600;">${fmtM3(consumo)}</span>
                </div>
                <div style="display:flex;justify-content:space-between;gap:20px;">
                  <span style="display:flex;align-items:center;gap:6px;color:#6ee7b7;font-size:12px;">
                    <span style="width:8px;height:8px;border-radius:50%;background:#10B981;display:inline-block;flex-shrink:0;"></span>
                    Facturado
                  </span>
                  <span style="color:#f8fafc;font-size:12px;font-weight:600;">${fmtCOP(facturado)}</span>
                </div>
              </div>`);
        },
      },

      xaxis: {
        type: 'category',
        labels: {
          show: true,
          style: { colors: '#9CA3AF', fontSize: '12px', fontFamily: 'Inter, sans-serif' },
        },
        axisBorder: { show: false },
        axisTicks:  { show: false },
      },

      yaxis: [
        {
          seriesName: 'Consumo (m³)',
          title: {
            text: 'm³',
            style: { color: '#9CA3AF', fontFamily: 'Inter, sans-serif', fontSize: '11px' },
          },
          labels: {
            style:   { colors: '#9CA3AF', fontSize: '11px', fontFamily: 'Inter, sans-serif' },
            formatter: (v: number) => `${v}`,
            offsetX: -5,
          },
        },
        {
          seriesName: 'Facturado ($)',
          opposite: true,
          title: {
            text: 'Pesos ($)',
            rotate: -90,
            style: { color: '#9CA3AF', fontFamily: 'Inter, sans-serif', fontSize: '11px' },
          },
          labels: {
            style:   { colors: '#9CA3AF', fontSize: '11px', fontFamily: 'Inter, sans-serif' },
            formatter: (v: number) => fmtMillions(v),
            offsetX: 5,
          },
        },
      ],

      grid: {
        show:            true,
        strokeDashArray: 3,
        borderColor:     'rgba(156,163,175,0.15)',
        padding:         { left: 5, right: 10, top: 4, bottom: -4 },
      },

      states: {
        hover:  { filter: { type: 'lighten', value: 0.12 } },
        active: { filter: { type: 'lighten', value: 0.08 } },
      },
    };
  }

  private initializeColumnChart(): void {
    const el = document.getElementById('column-chart');
    if (!el || typeof ApexCharts === 'undefined') return;

    const data = this.chartData();
    if (!data || data.xAxis.length === 0) return;

    this.chart = new ApexCharts(el, this.getChartOptions(data));
    this.chart.render().catch(() => {});
  }

  /** Move the area/line series SVG group to the END of its parent so it paints on top of bars. */
  private bringAreaToFront(ctx: any): void {
    try {
      const el: Element = ctx.el;

      // Target the area series group specifically — much more reliable than index-based selection
      const areaSeries = el.querySelector('.apexcharts-area-series');
      if (areaSeries?.parentElement) {
        areaSeries.parentElement.appendChild(areaSeries);
      }

      // Also ensure the line path itself has a high z-index via inline style
      const linePath = el.querySelector('.apexcharts-area-series .apexcharts-series-markers-wrap');
      if (linePath) {
        (linePath as HTMLElement).style.zIndex = '10';
      }
    } catch { /* noop */ }
  }
}
