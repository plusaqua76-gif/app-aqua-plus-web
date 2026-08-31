import { isPlatformBrowser, CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, effect, inject, input, OnDestroy, PLATFORM_ID, signal } from '@angular/core';
import { ColombianCurrencyPipe } from '../../../shared/pipes/colombian-currency.pipe';
import { CarteraEdadesFacturas } from '../../interfaces/accounting/ICarteraEdadesFacturas';

declare const ApexCharts: any;

const DEFAULT_CHART_HEIGHT  = 350;
const EMBEDDED_CHART_HEIGHT = 280;

@Component({
  selector: 'app-age-portfolio-chart',
  standalone: true,
  imports: [CommonModule, ColombianCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }
    :host ::ng-deep .apexcharts-canvas,
    :host ::ng-deep .apexcharts-svg,
    :host ::ng-deep .apexcharts-inner {
      background: transparent !important;
    }
    .embedded-total-detail {
      display: flex;
      align-items: baseline;
      justify-content: flex-end;
      gap: 0.375rem;
      line-height: 1.2;
    }
    .embedded-total-value {
      font-size: smaller;
      font-weight: 600;
      letter-spacing: 0.01em;
    }
  `],
  template: `
<div class="relative w-full"
     [class]="embedded()
       ? 'bg-transparent p-0'
       : 'z-10 shadow-sm rounded-lg bg-white/20 dark:bg-slate-800/20 backdrop-blur-2xl p-4 md:p-6'">

  @if (embedded()) {
    <div class="flex items-center justify-between gap-2 mb-1">
      <h3 class="text-xs font-semibold text-gray-600 dark:text-gray-400 shrink-0">
        Cartera por edades
      </h3>
    </div>
  } @else {
    <div class="flex justify-between items-center mb-5">
      <div>
        <h5 class="leading-none text-3xl font-bold text-gray-900 dark:text-white pb-2">Cartera por edades</h5>
        <p class="text-base font-normal text-gray-500 dark:text-gray-400">Distribución de cartera según antigüedad de deuda</p>
      </div>
      <div class="flex items-center">
        <button
          (click)="loadData()"
          type="button"
          class="text-gray-500 w-8 h-8 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm inline-flex items-center justify-center">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <span class="sr-only">Actualizar</span>
        </button>
      </div>
    </div>
  }

  @if (chartData()) {
    <div [class]="embedded()
      ? 'grid grid-cols-4 gap-1 mb-1'
      : 'grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 mb-4 border-b border-gray-200 dark:border-gray-700'">

      <dl [class]="embedded() ? 'min-w-0 text-center' : 'flex flex-col items-center justify-center'">
        <dt [class]="embedded() ? 'text-[9px] text-gray-500 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400 text-xs font-normal mb-1'">0-30 días</dt>
        <dd [class]="embedded() ? 'text-[10px] font-semibold tabular-nums text-gray-800 dark:text-gray-100 truncate' : 'text-gray-900 dark:text-white text-lg font-semibold'">{{ chartData()!['0-30'] | colombianCurrency }}</dd>
        @if (!embedded()) {
          <dd class="text-gray-500 dark:text-gray-400 text-xs mt-1">{{ debtCount()!['0-30'] }} deudas</dd>
        }
      </dl>
      <dl [class]="embedded() ? 'min-w-0 text-center' : 'flex flex-col items-center justify-center'">
        <dt [class]="embedded() ? 'text-[9px] text-gray-500 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400 text-xs font-normal mb-1'">31-60 días</dt>
        <dd [class]="embedded() ? 'text-[10px] font-semibold tabular-nums text-gray-800 dark:text-gray-100 truncate' : 'text-gray-900 dark:text-white text-lg font-semibold'">{{ chartData()!['31-60'] | colombianCurrency }}</dd>
        @if (!embedded()) {
          <dd class="text-gray-500 dark:text-gray-400 text-xs mt-1">{{ debtCount()!['31-60'] }} deudas</dd>
        }
      </dl>
      <dl [class]="embedded() ? 'min-w-0 text-center' : 'flex flex-col items-center justify-center'">
        <dt [class]="embedded() ? 'text-[9px] text-gray-500 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400 text-xs font-normal mb-1'">61-90 días</dt>
        <dd [class]="embedded() ? 'text-[10px] font-semibold tabular-nums text-gray-800 dark:text-gray-100 truncate' : 'text-gray-900 dark:text-white text-lg font-semibold'">{{ chartData()!['61-90'] | colombianCurrency }}</dd>
        @if (!embedded()) {
          <dd class="text-gray-500 dark:text-gray-400 text-xs mt-1">{{ debtCount()!['61-90'] }} deudas</dd>
        }
      </dl>
      <dl [class]="embedded() ? 'min-w-0 text-center' : 'flex flex-col items-center justify-center'">
        <dt [class]="embedded() ? 'text-[9px] text-gray-500 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400 text-xs font-normal mb-1'">90+ días</dt>
        <dd [class]="embedded() ? 'text-[10px] font-semibold tabular-nums text-gray-800 dark:text-gray-100 truncate' : 'text-gray-900 dark:text-white text-lg font-semibold'">{{ chartData()!['90+'] | colombianCurrency }}</dd>
        @if (!embedded()) {
          <dd class="text-gray-500 dark:text-gray-400 text-xs mt-1">{{ debtCount()!['90+'] }} deudas</dd>
        }
      </dl>
    </div>

    <div [id]="chartElementId"
         class="w-full"
         [style.height.px]="embedded() ? resolvedEmbeddedHeight : null"></div>

    @if (embedded() && chartData()) {
      <p class="embedded-total-detail mt-1.5 pt-1.5 border-t border-white/10 dark:border-slate-700/30 px-0.5">
        <span class="text-[10px] text-gray-500 dark:text-gray-400">Total cartera</span>
        <strong class="embedded-total-value tabular-nums text-gray-800 dark:text-gray-100">{{ totalCartera() | colombianCurrency }}</strong>
      </p>
    }

    @if (!embedded()) {
      <div class="grid grid-cols-1 items-center border-gray-200 border-t dark:border-gray-700 justify-between mt-5 pt-5">
        <div class="flex justify-between items-center">
          <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
            </svg>
            Total cartera: <strong class="ml-1">{{ totalCartera() | colombianCurrency }}</strong>
          </div>
        </div>
      </div>
    }
  } @else {
    <div [class]="embedded()
      ? 'flex items-center justify-center h-24 text-gray-500 dark:text-gray-400'
      : 'flex items-center justify-center h-64 text-gray-500 dark:text-gray-400'">
      <div class="text-center">
        @if (!embedded()) {
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
        <p [class]="embedded() ? 'text-[10px]' : 'mt-2 text-sm font-medium text-gray-900 dark:text-white'">
          Sin datos de cartera
        </p>
      </div>
    </div>
  }
</div>
  `
})
export class AgePortfolioChartComponent implements AfterViewInit, OnDestroy {
  private chart: any;
  protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);

  /** Modo compacto: sin fondo, para embeber en pass-customers */
  readonly embedded = input(false);
  readonly data = input<CarteraEdadesFacturas | null>(null);
  /** Altura fija del gráfico embebido (evita ResizeObserver) */
  readonly chartHeight = input<number | undefined>(undefined);

  readonly chartData = signal<AgePortfolioData | null>(null);
  readonly debtCount = signal<AgePortfolioInvoiceCount | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly hasError = signal<boolean>(false);
  readonly totalCartera = signal<number>(0);
  readonly carteraVencidaPercentage = signal<number>(0);

  get chartElementId(): string {
    return this.embedded() ? 'age-portfolio-chart-embedded' : 'age-portfolio-chart';
  }

  get resolvedEmbeddedHeight(): number {
    return this.chartHeight() ?? EMBEDDED_CHART_HEIGHT;
  }

  constructor() {
    effect(() => {
      const serviceData = this.data();
      if (serviceData) {
        this.transformAndLoadData(serviceData);
      }
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const serviceData = this.data();
      if (serviceData) {
        this.transformAndLoadData(serviceData);
      }
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private transformAndLoadData(serviceData: CarteraEdadesFacturas): void {
    this.isLoading.set(true);

    try {
      const transformedData: AgePortfolioData = {
        '0-30': 0,
        '31-60': 0,
        '61-90': 0,
        '90+': 0
      };

      const invoiceCounts: AgePortfolioInvoiceCount = {
        '0-30': 0,
        '31-60': 0,
        '61-90': 0,
        '90+': 0
      };

      serviceData.metricas.forEach((metrica) => {
        const rango = metrica.rangoAntiguedad.trim();

        if (rango === '0-30' || rango.includes('0-30')) {
          transformedData['0-30'] = metrica.valorCartera;
          invoiceCounts['0-30'] = metrica.cantidadDeudas;
        } else if (rango === '31-60' || rango.includes('31-60')) {
          transformedData['31-60'] = metrica.valorCartera;
          invoiceCounts['31-60'] = metrica.cantidadDeudas;
        } else if (rango === '61-90' || rango.includes('61-90')) {
          transformedData['61-90'] = metrica.valorCartera;
          invoiceCounts['61-90'] = metrica.cantidadDeudas;
        } else if (rango === '90+' || rango.includes('90') || rango.includes('+')) {
          transformedData['90+'] = metrica.valorCartera;
          invoiceCounts['90+'] = metrica.cantidadDeudas;
        }
      });

      this.chartData.set(transformedData);
      this.debtCount.set(invoiceCounts);
      this.calculateTotals(transformedData);
      this.isLoading.set(false);
      this.hasError.set(false);

      setTimeout(() => {
        if (this.chart) {
          this.updateChart(transformedData);
        } else {
          this.initializeChart();
        }
      }, 0);
    } catch (error) {
      console.error('Error transforming data:', error);
      this.isLoading.set(false);
      this.hasError.set(true);
    }
  }

  public loadData(): void {
    const serviceData = this.data();
    if (serviceData) {
      this.transformAndLoadData(serviceData);
    }
  }

  private calculateTotals(data: AgePortfolioData): void {
    const total = data['0-30'] + data['31-60'] + data['61-90'] + data['90+'];
    const vencida = data['31-60'] + data['61-90'] + data['90+'];

    this.totalCartera.set(total);

    const percentage = total > 0 ? (vencida / total) * 100 : 0;
    this.carteraVencidaPercentage.set(percentage);
  }

  private updateChart(data: AgePortfolioData): void {
    if (this.chart && data) {
      const newSeries = [
        {
          name: 'Monto',
          data: [
            { x: '0-30 días', y: data['0-30'] },
            { x: '31-60', y: data['31-60'] },
            { x: '61-90', y: data['61-90'] },
            { x: '90+ días', y: data['90+'] }
          ]
        }
      ];

      this.chart.updateSeries(newSeries);
    }
  }

  private getOptions(): AgePortfolioChartOptions {
    const currentData = this.chartData();
    const compact = this.embedded();
    const labelSize = compact ? '9px' : '12px';

    const series: BarSeries[] = currentData ? [
      {
        name: 'Monto',
        data: [
          { x: '0-30 días', y: currentData['0-30'] },
          { x: '31-60', y: currentData['31-60'] },
          { x: '61-90', y: currentData['61-90'] },
          { x: '90+ días', y: currentData['90+'] }
        ]
      }
    ] : [];

    return {
      colors: ['#FF6B6B'],
      series,
      chart: {
        type: 'bar',
        height: compact ? (this.chartHeight() ?? EMBEDDED_CHART_HEIGHT) : DEFAULT_CHART_HEIGHT,
        width: '100%',
        maxWidth: '100%',
        fontFamily: 'Inter, sans-serif',
        toolbar: { show: false },
        background: 'transparent',
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: compact ? '82%' : '70%',
          borderRadiusApplication: 'end',
          borderRadius: compact ? 4 : 8,
        },
      },
      tooltip: {
        enabled: true,
        shared: true,
        intersect: false,
        style: { fontFamily: 'Inter, sans-serif' },
        y: {
          formatter: (value: number, opts?: any) => {
            const dataPointIndex = opts?.dataPointIndex ?? 0;
            const debts = this.debtCount();

            if (debts) {
              const ranges = ['0-30', '31-60', '61-90', '90+'] as const;
              const range = ranges[dataPointIndex];
              const count = debts[range];
              return `$${value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} (${count} deudas)`;
            }
            return `$${value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
          }
        }
      },
      states: {
        hover: { filter: { type: 'darken', value: 0.1 } },
      },
      stroke: { show: true, width: 0, colors: ['transparent'] },
      grid: {
        show: true,
        strokeDashArray: 3,
        padding: compact
          ? { left: 0, right: 0, top: -4 }
          : { left: 20, right: 20, top: 0 },
        borderColor: compact ? 'rgba(156,163,175,0.15)' : '#374151'
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      xaxis: {
        type: 'category',
        labels: {
          show: true,
          style: {
            fontFamily: 'Inter, sans-serif',
            colors: '#9CA3AF',
            fontSize: labelSize,
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        show: true,
        labels: {
          style: {
            colors: '#9CA3AF',
            fontSize: labelSize,
            fontFamily: 'Inter, sans-serif'
          },
          formatter: (value: number) => {
            if (value >= 1000000) {
              return `$${(value / 1000000).toFixed(1)}M`;
            } else if (value >= 1000) {
              return `$${(value / 1000).toFixed(0)}K`;
            }
            return `$${value}`;
          },
        },
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.5,
          gradientToColors: ['#FFA07A'],
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 0.8,
          stops: [0, 100]
        }
      },
    };
  }

  private initializeChart(): void {
    const el = document.getElementById(this.chartElementId) as HTMLElement;
    const hasData = this.chartData() !== null;

    if (el && ApexCharts !== undefined && hasData) {
      this.chart = new ApexCharts(el, this.getOptions());
      this.chart.render().catch((error: any) => {
        console.error('Error rendering chart:', error);
      });
    } else if (el && !hasData) {
      el.innerHTML = '';
    }
  }
}
