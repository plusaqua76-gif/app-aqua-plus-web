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
import { chartTooltipShell } from '../../utils/chart-tooltip.util';
import { fmtCOP, fmtCOPCompact } from '../../utils/currency.util';
import { ColombianCurrencyPipe } from '../../../shared/pipes/colombian-currency.pipe';
import { AgePortfolioChartComponent } from './age-portfolio-chart';
import { CarteraEdadesFacturas } from '@interfaces/accounting/ICarteraEdadesFacturas';
import { MetricasAcueductoEagerInicializationService } from '../../../modules/accounting/service/metricas-acueducto-eager-inicialization.service';
import { CarteraEdadesFacturasService } from '../../../modules/accounting/service/cartera-edades-facturas.service';

declare const ApexCharts: any;

// ─── Domain types ────────────────────────────────────────────────────────────

interface ClienteAbono {
  nuid:    string;
  abono:   number;
  factura: number;
  deuda:   number;
}

// ─── Mock data ───────────────────────────────────────────────────────────────

const TOTAL_DEUDA     = 1_200_000;
const TOTAL_ABONADO   = 1_000_000;
const SALDO_PENDIENTE = TOTAL_DEUDA - TOTAL_ABONADO;   // 200 000
const PCT_RECAUDADO   = Math.round((TOTAL_ABONADO / TOTAL_DEUDA) * 100); // 83
const CLIENTES_ACTIVOS = 12;
const CLIENTES_SIN_ABONO = 5;

const MOCK_CUSTOMERS: ClienteAbono[] = [
  { nuid: 'ACU-001', abono: 220_000, factura: 220_000, deuda:       0 },
  { nuid: 'ACU-002', abono: 150_000, factura: 180_000, deuda:  30_000 },
  { nuid: 'ACU-003', abono: 200_000, factura: 200_000, deuda:       0 },
  { nuid: 'ACU-004', abono: 120_000, factura: 150_000, deuda:  30_000 },
  { nuid: 'ACU-005', abono: 160_000, factura: 160_000, deuda:       0 },
  { nuid: 'ACU-007', abono:  50_000, factura: 150_000, deuda: 100_000 },
  { nuid: 'ACU-009', abono: 100_000, factura: 140_000, deuda:  40_000 },
];

const PASS_ABONOS_CHART_HEIGHT  = 280;
const PASS_CARTERA_CHART_HEIGHT = 280;
const TABLE_MAX_VISIBLE_ROWS    = 5;
const TABLE_SCROLL_MAX_HEIGHT_PX = 26 + TABLE_MAX_VISIBLE_ROWS * 25;
const CHART_DAYS    = ['1 jun', '3 jun', '5 jun', '7 jun', '9 jun', '11 jun', '13 jun', '15 jun', '17 jun', '18 jun'];
const CHART_ABONADO = [50_000, 120_000, 230_000, 340_000, 450_000, 580_000, 680_000, 780_000, 920_000, 1_000_000];

type PassLegendKey = 'abonado' | 'deuda';

const PASS_LEGEND_ITEMS: {
  key: PassLegendKey;
  label: string;
  seriesName: string;
  indicator: 'dot' | 'dashed';
  dotClass?: string;
  lineClass?: string;
}[] = [
  { key: 'abonado', label: 'Abonado', seriesName: 'Abonado', indicator: 'dot',    dotClass: 'bg-emerald-500' },
  { key: 'deuda',   label: 'Deuda',   seriesName: 'Deuda',   indicator: 'dashed', lineClass: 'border-red-500' },
];

@Component({
  selector: 'app-pass-customers',
  standalone: true,
  imports: [CommonModule, ColombianCurrencyPipe, AgePortfolioChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="relative z-20 w-full h-full bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl rounded-2xl
            shadow-lg border border-white/10 dark:border-slate-700/30 p-3 sm:p-4 transition-all duration-300 flex flex-col">

  <!-- ── 1. Header ────────────────────────────────────────────────────────── -->
  <div class="flex flex-wrap items-start justify-between gap-2 mb-2 shrink-0">
    <div class="min-w-0">
      <h2 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
        Abonos del periodo
      </h2>
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        Recaudo acumulado vs deuda del periodo
      </p>
    </div>
    <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                 bg-blue-100/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shrink-0">
      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      {{ periodBadge() }}
    </span>
  </div>

  <!-- ── 2. KPI Cards ─────────────────────────────────────────────────────── -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2 shrink-0">

    <div class="rounded-xl p-2 sm:p-2.5 bg-white/25 dark:bg-slate-700/25 border border-white/20 dark:border-slate-600/25 min-w-0">
      <p class="text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 leading-tight">Con abono</p>
      <p class="mt-1 text-xs sm:text-sm font-semibold tabular-nums text-gray-800 dark:text-gray-100 leading-snug">{{ clientesConAbono }}</p>

    </div>

    <div class="rounded-xl p-2 sm:p-2.5 bg-white/25 dark:bg-slate-700/25 border border-white/20 dark:border-slate-600/25 min-w-0">
      <p class="text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 leading-tight">Abonado</p>
      <p class="mt-1 text-xs sm:text-sm font-semibold tabular-nums text-gray-800 dark:text-gray-100 leading-snug truncate">
        {{ totalAbonado | colombianCurrency }}
      </p>
    </div>

    <div class="rounded-xl p-2 sm:p-2.5 bg-white/25 dark:bg-slate-700/25 border border-white/20 dark:border-slate-600/25 min-w-0">
      <p class="text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 leading-tight">Deuda</p>
      <p class="mt-1 text-xs sm:text-sm font-semibold tabular-nums text-gray-800 dark:text-gray-100 leading-snug truncate">
        {{ totalDeuda | colombianCurrency }}
      </p>
    </div>

    <div class="rounded-xl p-2 sm:p-2.5 bg-white/25 dark:bg-slate-700/25 border border-white/20 dark:border-slate-600/25 min-w-0">
      <p class="text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 leading-tight">Pendiente</p>
      <p class="mt-1 text-xs sm:text-sm font-semibold tabular-nums text-gray-800 dark:text-gray-100 leading-snug truncate">
        {{ saldoPendiente | colombianCurrency }}
      </p>
    </div>

  </div>

  <!-- ── 3. Alert banner ──────────────────────────────────────────────────── -->
  <div class="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30
              rounded-lg px-2.5 py-1.5 mb-2 shrink-0">
    <svg class="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    </svg>
    <p class="text-[11px] sm:text-xs text-amber-700 dark:text-amber-300 leading-snug">
      Faltan <strong>{{ saldoPendiente | colombianCurrency }}</strong> &mdash;
      <strong>{{ clientesSinAbono }} clientes</strong> sin abono.
    </p>
  </div>

  <!-- ── 4. Chart ─────────────────────────────────────────────────────────── -->
  <div class="flex flex-col shrink-0 mb-2">
    <div class="flex flex-wrap items-center justify-between gap-2 mb-2 shrink-0">
      <h3 class="text-xs font-semibold text-gray-600 dark:text-gray-400">
        Abonos acumulados vs deuda
      </h3>
    </div>

    <!-- Leyenda interactiva (reemplaza apexcharts-legend) -->
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
          @if (item.indicator === 'dot') {
            <span class="inline-block w-2 h-2 rounded-full shrink-0 transition-opacity"
                  [class]="item.dotClass"
                  [class.opacity-30]="!isSeriesVisible(item.key)"></span>
          } @else {
            <span class="inline-block w-4 h-0 border-t-2 border-dashed shrink-0 transition-opacity"
                  [class]="item.lineClass"
                  [class.opacity-30]="!isSeriesVisible(item.key)"></span>
          }
          {{ item.label }}
        </button>
      }
    </div>

    <div class="relative w-full shrink-0">
      <div id="pass-customers-chart"></div>
    </div>
  </div>

  <!-- ── 5. Customer detail table ─────────────────────────────────────────── -->
  <div class="shrink-0">
    <div class="flex flex-wrap items-center justify-between gap-2 mb-1.5">
      <h3 class="text-xs font-semibold text-gray-600 dark:text-gray-400">
        Detalle por cliente
      </h3>
      <div class="relative min-w-[140px] flex-1 max-w-[200px]">
        <svg class="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <input
          type="search"
          [value]="searchQuery()"
          (input)="onSearchInput($event)"
          placeholder="Buscar NUID…"
          class="w-full pl-7 pr-2 py-0 text-[10px] rounded-lg
                 bg-white/20 dark:bg-slate-700/30 border border-white/20 dark:border-slate-600/30
                 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500
                 focus:outline-none focus:ring-1 focus:ring-blue-400/50" />
      </div>
    </div>
    <div class="overflow-x-auto custom-scrollbar"
         [class.overflow-y-auto]="tableNeedsScroll()"
         [style.max-height.px]="tableNeedsScroll() ? tableScrollMaxHeight : null">
      <table class="w-full text-xs">
        <thead class="sticky top-0 z-[1] bg-white dark:bg-[rgb(20,24,31)]">
   
          <tr class="border-b border-gray-200/40 dark:border-slate-700/50">
            <th class="text-left pb-1.5 pt-0.5 text-[10px] font-semibold uppercase text-gray-400 dark:text-gray-500">NUID</th>
            <th class="text-left pb-1.5 pt-0.5 text-[10px] font-semibold uppercase text-gray-400 dark:text-gray-500">Valor abonado</th>
            <th class="text-left pb-1.5 pt-0.5 text-[10px] font-semibold uppercase text-gray-400 dark:text-gray-500">Valor factura</th>
            <th class="text-left pb-1.5 pt-0.5 text-[10px] font-semibold uppercase text-gray-400 dark:text-gray-500">Deuda</th>
          </tr>
        </thead>
        <tbody>
          @for (c of filteredCustomers(); track c.nuid) {
            <tr class="border-b border-gray-100/20 dark:border-slate-700/30 hover:bg-white/10 dark:hover:bg-white/5">
              <td class="py-1 font-semibold text-gray-900 dark:text-white">{{ c.nuid }}</td>
              <td class="py-1 font-semibold text-emerald-600 dark:text-emerald-400">{{ c.abono | colombianCurrency }}</td>
              <td class="py-1 text-gray-700 dark:text-gray-300">{{ c.factura | colombianCurrency }}</td>
              <td class="py-1 font-semibold"
                  [class]="c.deuda > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'">
                {{ c.deuda > 0 ? (c.deuda | colombianCurrency) : '—' }}
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="4" class="py-3 text-center text-[10px] text-gray-400 dark:text-gray-500">
                Sin resultados para «{{ searchQuery() }}»
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  </div>

  <!-- ── 6. Cartera por edades (embebida) ─────────────────────────────────── -->
  <div class="shrink-0 mt-2 pt-2 border-t border-white/10 dark:border-slate-700/30">
    <app-age-portfolio-chart
      [data]="carteraEdadesData()"
      [embedded]="true"
      [chartHeight]="carteraChartHeight" />
  </div>

</div>
  `,
})
export class PassCustomersComponent implements AfterViewInit, OnDestroy {

  private chart: any;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr        = inject(ChangeDetectorRef);
  protected readonly metricasAcueductoService = inject(
    MetricasAcueductoEagerInicializationService,
  );
  protected readonly carteraEdadesService = inject(
    CarteraEdadesFacturasService,
  );

  readonly legendItems = PASS_LEGEND_ITEMS;
  readonly seriesVisible = signal<Record<PassLegendKey, boolean>>({
    abonado: true,
    deuda: true,
  });
  readonly searchQuery = signal('');

  readonly filteredCustomers = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return MOCK_CUSTOMERS;
    return MOCK_CUSTOMERS.filter(c => c.nuid.toLowerCase().includes(q));
  });

  readonly tableNeedsScroll = computed(
    () => this.filteredCustomers().length > TABLE_MAX_VISIBLE_ROWS,
  );

  readonly metricasAcueductoMesActual = computed(() => {
    const data = this.metricasAcueductoService.enterpriceResolutionSignal();
    if (!data?.porMes || data.porMes.length === 0) return null;
    return data.porMes[data.porMes.length - 1];
  });

  readonly carteraEdadesData = computed((): CarteraEdadesFacturas | null => {
    const data = this.carteraEdadesService.enterpriceResolutionSignal();
    return (data as CarteraEdadesFacturas | null | undefined) ?? null;
  });

  // ── Static data exposed to template ──────────────────────────────────────
  readonly totalAbonado     = TOTAL_ABONADO;
  readonly totalDeuda       = TOTAL_DEUDA;
  readonly saldoPendiente   = SALDO_PENDIENTE;
  readonly pctRecaudado     = PCT_RECAUDADO;
  readonly clientesConAbono = MOCK_CUSTOMERS.length;
  readonly clientesActivos  = CLIENTES_ACTIVOS;
  readonly clientesSinAbono = CLIENTES_SIN_ABONO;
  readonly carteraChartHeight = PASS_CARTERA_CHART_HEIGHT;
  readonly tableVisibleRows   = TABLE_MAX_VISIBLE_ROWS;
  readonly tableScrollMaxHeight = TABLE_SCROLL_MAX_HEIGHT_PX;

  readonly periodBadge = computed(() => {
    const now  = new Date();
    const mes  = now.toLocaleString('es-CO', { month: 'long' });
    const year = now.getFullYear();
    return `${mes.charAt(0).toUpperCase() + mes.slice(1)} ${year}`;
  });

  onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  isSeriesVisible(key: PassLegendKey): boolean {
    return this.seriesVisible()[key];
  }

  toggleSeries(key: PassLegendKey): void {
    if (!this.chart) return;

    this.seriesVisible.update(state => {
      const next = { ...state, [key]: !state[key] };

      if (key === 'abonado') {
        this.chart.toggleSeries('Abonado');
      } else if (key === 'deuda') {
        this.chart.updateOptions(
          { annotations: { yaxis: this.buildDeudaAnnotations(next.deuda) } },
          false,
          false,
        );
      }

      return next;
    });
    this.cdr.markForCheck();
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.initChart(), 0);
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  // ── Chart ─────────────────────────────────────────────────────────────────
  private yAxisMax(): number {
    const headroom = Math.max(TOTAL_DEUDA, ...CHART_ABONADO) * 1.12;
    return Math.ceil(headroom / 100_000) * 100_000;
  }

  private buildDeudaAnnotations(visible: boolean): any[] {
    if (!visible) return [];

    return [{
      y: TOTAL_DEUDA,
      borderColor: '#EF4444',
      borderWidth: 2.5,
      strokeDashArray: 8,
      opacity: 0.95,
      label: {
        text: `Deuda ${fmtCOPCompact(TOTAL_DEUDA)}`,
        borderColor: '#EF4444',
        borderWidth: 0,
        style: {
          color: '#fff',
          background: '#EF4444',
          fontSize: '10px',
          fontWeight: 700,
          fontFamily: 'Inter, sans-serif',
          padding: { left: 8, right: 8, top: 3, bottom: 3 },
        },
        position: 'right',
        offsetX: 8,
      },
    }];
  }

  private initChart(): void {
    const el = document.getElementById('pass-customers-chart');
    if (!el || typeof ApexCharts === 'undefined') return;

    const lastIndex = CHART_ABONADO.length - 1;

    const options: any = {
      series: [{
        type: 'area',
        name: 'Abonado',
        data: CHART_ABONADO,
      }],

      colors: ['#10B981'],

      chart: {
        type: 'area',
        height: PASS_ABONOS_CHART_HEIGHT,
        width: '100%',
        background: 'transparent',
        fontFamily: 'Inter, sans-serif',
        toolbar: { show: false },
        animations: { enabled: true, easing: 'easeinout', speed: 700 },
        dropShadow: { enabled: false },
      },

      annotations: {
        yaxis: this.buildDeudaAnnotations(this.seriesVisible().deuda),
      },

      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          type: 'vertical',
          opacityFrom: 0.45,
          opacityTo: 0.04,
          stops: [0, 75, 100],
        },
      },

      stroke: {
        width: 3,
        curve: 'smooth',
        colors: ['#10B981'],
        lineCap: 'round',
      },

      markers: {
        size: 0,
        strokeWidth: 2,
        strokeColors: '#fff',
        colors: ['#10B981'],
        hover: { size: 6, sizeOffset: 2 },
        discrete: [{
          seriesIndex: 0,
          dataPointIndex: lastIndex,
          fillColor: '#10B981',
          strokeColor: '#fff',
          size: 7,
        }],
      },

      legend: { show: false },

      dataLabels: { enabled: false },

      tooltip: {
        shared: true,
        intersect: false,
        x: { show: true },
        custom: ({ series: s, dataPointIndex: i, w }: any) => {
          const day       = w.globals.labels[i] ?? '';
          const abonado   = s[0]?.[i] ?? 0;
          const deuda     = TOTAL_DEUDA;
          const pendiente = Math.max(deuda - abonado, 0);
          const pct       = deuda > 0 ? ((abonado / deuda) * 100).toFixed(1) : '0';

          return chartTooltipShell(`
              <p style="font-weight:700;font-size:13px;color:#f8fafc;
                        margin-bottom:10px;padding-bottom:8px;
                        border-bottom:1px solid rgba(255,255,255,0.07);">${day}</p>
              <div style="display:flex;flex-direction:column;gap:7px;">
                <div style="display:flex;justify-content:space-between;gap:20px;">
                  <span style="display:flex;align-items:center;gap:6px;color:#6ee7b7;font-size:12px;">
                    <span style="width:8px;height:8px;border-radius:50%;background:#10B981;display:inline-block;flex-shrink:0;"></span>
                    Abonado acum.
                  </span>
                  <span style="color:#f8fafc;font-size:12px;font-weight:600;">${fmtCOP(abonado)}</span>
                </div>
                <div style="display:flex;justify-content:space-between;gap:20px;">
                  <span style="display:flex;align-items:center;gap:6px;color:#fca5a5;font-size:12px;">
                    <span style="width:10px;height:0;border-top:2px dashed #EF4444;display:inline-block;flex-shrink:0;"></span>
                    Deuda total
                  </span>
                  <span style="color:#f8fafc;font-size:12px;font-weight:600;">${fmtCOP(deuda)}</span>
                </div>
                <div style="display:flex;justify-content:space-between;gap:20px;">
                  <span style="display:flex;align-items:center;gap:6px;color:#fcd34d;font-size:12px;">
                    <span style="width:8px;height:8px;border-radius:2px;background:#F59E0B;display:inline-block;flex-shrink:0;"></span>
                    Pendiente
                  </span>
                  <span style="color:#f8fafc;font-size:12px;font-weight:600;">${fmtCOP(pendiente)}</span>
                </div>
                <div style="display:flex;justify-content:space-between;gap:20px;margin-top:2px;
                            padding-top:8px;border-top:1px solid rgba(255,255,255,0.07);">
                  <span style="color:#94a3b8;font-size:11px;font-weight:500;">% Recaudado</span>
                  <span style="color:#34d399;font-size:12px;font-weight:700;">${pct}%</span>
                </div>
              </div>`);
        },
      },

      xaxis: {
        categories: CHART_DAYS,
        tickAmount: 6,
        crosshairs: {
          show: true,
          stroke: { color: 'rgba(156,163,175,0.35)', width: 1, dashArray: 4 },
        },
        labels: {
          show: true,
          rotate: -35,
          rotateAlways: false,
          hideOverlappingLabels: true,
          style: { colors: '#9CA3AF', fontSize: '10px', fontFamily: 'Inter, sans-serif' },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },

      yaxis: {
        show: true,
        min: 0,
        max: this.yAxisMax(),
        tickAmount: 5,
        labels: {
          style: { colors: '#9CA3AF', fontSize: '10px', fontFamily: 'Inter, sans-serif' },
          formatter: (v: number) => fmtCOPCompact(v),
          offsetX: -4,
        },
      },

      grid: {
        show: true,
        strokeDashArray: 3,
        borderColor: 'rgba(156,163,175,0.15)',
        padding: { left: 4, right: 12, top: 8, bottom: 0 },
      },

      states: {
        hover: { filter: { type: 'lighten', value: 0.08 } },
        active: { filter: { type: 'none' } },
      },
    };

    this.chart = new ApexCharts(el, options);
    this.chart.render().catch(() => {});
  }
}
