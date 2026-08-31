import { isPlatformBrowser, CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';

import { chartTooltipShell } from '../../utils/chart-tooltip.util';
import { fmtCOP, fmtCOPCompact } from '../../utils/currency.util';
import { ColombianCurrencyPipe } from '../../../shared/pipes/colombian-currency.pipe';

declare var ApexCharts: any;

const MES_ABREV: Record<string, string> = {
  Enero: 'Ene', Febrero: 'Feb', Marzo: 'Mar', Abril: 'Abr',
  Mayo: 'May', Junio: 'Jun', Julio: 'Jul', Agosto: 'Ago',
  Septiembre: 'Sep', Octubre: 'Oct', Noviembre: 'Nov', Diciembre: 'Dic',
};

function currentPeriodBadge(): string {
  const now  = new Date();
  const year = now.getFullYear();
  const mes  = now.toLocaleString('es-CO', { month: 'long' });
  const key  = mes.charAt(0).toUpperCase() + mes.slice(1);
  const abrev = MES_ABREV[key] ?? key.slice(0, 3);
  return `${abrev} ${year}`;
}

interface DebtCategory {
  name: string;
  value: number;
  color: string;
}

const DEBT_DATA: DebtCategory[] = [
  { name: 'Factura Vencida',    value: 850_000, color: '#EF4444' },
  { name: 'Facturación',        value: 620_000, color: '#F97316' },
  { name: 'Sostenimiento 2026', value: 450_000, color: '#FB923C' },
  { name: 'Matrícula',          value: 300_000, color: '#D97706' },
  { name: 'Aporte Reserva',     value: 250_000, color: '#3B82F6' },
  { name: 'Medidor',            value: 180_000, color: '#60A5FA' },
  { name: 'Material',           value: 160_000, color: '#15803D' },
  { name: 'Metros Pasados',     value: 140_000, color: '#10B981' },
  { name: 'Otros',              value: 120_000, color: '#6B7280' },
  { name: 'Reconexión',         value: 110_000, color: '#9CA3AF' },
  { name: 'Multa',              value:  95_000, color: '#B0B7BF' },
  { name: 'Inscripción',        value:  80_000, color: '#CBD5E1' },
];

const TOTAL_DEBT = DEBT_DATA.reduce((s, d) => s + d.value, 0);
const BAR_COUNT  = DEBT_DATA.length;
/** Altura fija del gráfico (~36px por barra × 12 categorías) */
const CHART_HEIGHT = BAR_COUNT * 36 + 24;
const X_AXIS_MAX   = 1_000_000;
const X_AXIS_STEP  = 200_000;

function formatXAxisLabel(val: number | string): string {
  const n = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(n) || n <= 0) return '';

  const tolerance = X_AXIS_STEP * 0.08;
  const remainder = n % X_AXIS_STEP;
  const onStep = remainder <= tolerance || (X_AXIS_STEP - remainder) <= tolerance;
  if (!onStep || n > X_AXIS_MAX + tolerance) return '';

  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${(n / 1_000).toFixed(0)}k`;
}

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule, ColombianCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="flex-1 bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl rounded-2xl shadow-lg
            border border-white/10 dark:border-slate-700/30 p-3 sm:p-4 transition-all duration-300 flex flex-col">

    <!-- Header ---------------------------------------------------------------->
    <div class="flex flex-wrap items-start justify-between gap-2 mb-2 shrink-0">
      <div class="min-w-0">
        <h2 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
          Tipos de Deuda
        </h2>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Distribución por concepto
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

    <div class="grid grid-cols-2 gap-2 mb-2 shrink-0">

      <div class="rounded-xl p-2 sm:p-2.5 bg-white/25 dark:bg-slate-700/25 border border-white/20 dark:border-slate-600/25 min-w-0">
        <p class="text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 leading-tight">Total</p>
        <p class="mt-1 text-xs sm:text-sm font-semibold tabular-nums text-gray-800 dark:text-gray-100 leading-snug truncate">
          {{ totalDebt | colombianCurrency }}
        </p>
      </div>

      <div class="rounded-xl p-2 sm:p-2.5 bg-white/25 dark:bg-slate-700/25 border border-white/20 dark:border-slate-600/25 min-w-0">
        <p class="text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 leading-tight">Categorías</p>
        <p class="mt-1 text-xs sm:text-sm font-semibold tabular-nums text-gray-800 dark:text-gray-100 leading-snug">{{ categoryCount }}</p>
      </div>
    </div>

    <!-- Chart ----------------------------------------------------------------->
    <div id="debt-bar-chart" class="w-full shrink-0" [style.height.px]="chartHeight"></div>

    <!-- Level legend ---------------------------------------------------------->
    <div class="flex flex-wrap gap-x-3 gap-y-1 mt-2 pt-2 shrink-0
                border-t border-gray-200/40 dark:border-slate-700/40">
      <span class="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
        <span class="inline-block w-2.5 h-1.5 rounded-sm bg-red-500"></span>Crítico
      </span>
      <span class="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
        <span class="inline-block w-2.5 h-1.5 rounded-sm bg-amber-500"></span>Alto
      </span>
      <span class="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
        <span class="inline-block w-2.5 h-1.5 rounded-sm bg-blue-500"></span>Medio
      </span>
      <span class="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
        <span class="inline-block w-2.5 h-1.5 rounded-sm bg-green-600"></span>Bajo
      </span>
      <span class="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
        <span class="inline-block w-2.5 h-1.5 rounded-sm bg-gray-400"></span>Mínimo
      </span>
    </div>

</div>
  `,
})
export class BarChartComponent implements AfterViewInit, OnDestroy {

  private chart: any;
  private readonly platformId = inject(PLATFORM_ID);

  readonly periodBadge   = computed(() => currentPeriodBadge());
  readonly totalDebt     = TOTAL_DEBT;
  readonly categoryCount = BAR_COUNT;
  readonly chartHeight   = CHART_HEIGHT;

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.initChart(), 0);
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private initChart(): void {
    const el = document.getElementById('debt-bar-chart');
    if (!el || typeof ApexCharts === 'undefined') return;

    this.chart = new ApexCharts(el, this.buildOptions(CHART_HEIGHT));
    this.chart.render();
  }

  private buildOptions(chartHeight: number): any {
    const values = DEBT_DATA.map(d => d.value);
    const labels = DEBT_DATA.map(d => d.name);
    const colors = DEBT_DATA.map(d => d.color);
    const xMax = X_AXIS_MAX;

    return {
      series: [{ name: 'Deuda', data: values }],
      colors,

      chart: {
        type: 'bar',
        height: chartHeight,
        width: '100%',
        toolbar: { show: false },
        background: 'transparent',
        fontFamily: 'Inter, sans-serif',
        animations: { enabled: true, easing: 'easeinout', speed: 700 },
      },

      plotOptions: {
        bar: {
          horizontal: true,
          distributed: true,
          borderRadius: 6,
          borderRadiusApplication: 'end',
          barHeight: '90%',
          dataLabels: { position: 'center' },
        },
      },

      dataLabels: {
        enabled: true,
        textAnchor: 'middle',
        style: {
          fontSize: '10px',
          fontWeight: '600',
          colors: ['#ffffff'],
        },
        formatter: (val: number, opts: any) => {
          const maxVal = opts.w.globals.maxX || TOTAL_DEBT;
          if (val / maxVal < 0.14) return '';
          return fmtCOPCompact(val);
        },
        dropShadow: { enabled: false },
      },

      legend: { show: false },

      tooltip: {
        custom: ({ series, seriesIndex, dataPointIndex }: any) => {
          const val  = series[seriesIndex][dataPointIndex] as number;
          const name = labels[dataPointIndex];
          const col  = colors[dataPointIndex];

          return chartTooltipShell(`
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;
                          padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.07);">
                <span style="width:10px;height:10px;border-radius:50%;
                             background:${col};display:inline-block;flex-shrink:0;"></span>
                <span style="font-weight:700;font-size:13px;color:#f8fafc;">${name}</span>
              </div>
              <div style="display:flex;justify-content:space-between;gap:20px;">
                <span style="color:#94a3b8;font-size:11px;font-weight:500;">Valor</span>
                <span style="color:#f8fafc;font-size:12px;font-weight:700;">${fmtCOP(val)}</span>
              </div>`, { minWidth: '200px' });
        },
      },

      xaxis: {
        categories: labels,
        min: 0,
        max: xMax,
        tickAmount: X_AXIS_MAX / X_AXIS_STEP,
        forceNiceScale: false,
        labels: {
          show: true,
          hideOverlappingLabels: true,
          style: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '10px',
            colors: '#9CA3AF',
          },
          formatter: (val: number | string) => formatXAxisLabel(val),
        },
        axisTicks:  { show: false },
        axisBorder: { show: false },
      },

      yaxis: {
        labels: {
          show: true,
          maxWidth: 130,
          style: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '10px',
            fontWeight: '500',
            colors: '#9CA3AF',
          },
        },
      },

      grid: {
        show: true,
        borderColor: 'rgba(156,163,175,0.18)',
        strokeDashArray: 3,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: false } },
        padding: { top: 0, right: 8, bottom: 0, left: 0 },
      },
    };
  }
}
