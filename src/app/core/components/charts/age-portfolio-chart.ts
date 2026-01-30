import { isPlatformBrowser, DecimalPipe, NgClass } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, effect, inject, input, OnDestroy, PLATFORM_ID, signal } from '@angular/core';
import { ColombianCurrencyPipe } from '../../../shared/pipes/colombian-currency.pipe';
import { CarteraEdadesFacturas } from '../../interfaces/accounting/ICarteraEdadesFacturas';


declare const ApexCharts: any;



@Component({
  selector: 'app-age-portfolio-chart',
  standalone: true,
  imports: [ ColombianCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="relative z-10 w-full shadow-sm rounded-lg bg-white/20 dark:bg-slate-800/20 backdrop-blur-2xl p-4 md:p-6">
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

  @if (chartData()) {
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
      <dl class="flex flex-col items-center justify-center">
        <dt class="text-gray-500 dark:text-gray-400 text-xs font-normal mb-1">0-30 días</dt>
        <dd class="text-gray-900 dark:text-white text-lg font-semibold">{{ chartData()!['0-30'] | colombianCurrency }}</dd>
        <dd class="text-gray-500 dark:text-gray-400 text-xs mt-1">{{ debtCount()!['0-30'] }} deudas</dd>
      </dl>
      <dl class="flex flex-col items-center justify-center">
        <dt class="text-gray-500 dark:text-gray-400 text-xs font-normal mb-1">31-60 días</dt>
        <dd class="text-gray-900 dark:text-white text-lg font-semibold">{{ chartData()!['31-60'] | colombianCurrency }}</dd>
        <dd class="text-gray-500 dark:text-gray-400 text-xs mt-1">{{ debtCount()!['31-60'] }} deudas</dd>
      </dl>
      <dl class="flex flex-col items-center justify-center">
        <dt class="text-gray-500 dark:text-gray-400 text-xs font-normal mb-1">61-90 días</dt>
        <dd class="text-gray-900 dark:text-white text-lg font-semibold">{{ chartData()!['61-90'] | colombianCurrency }}</dd>
        <dd class="text-gray-500 dark:text-gray-400 text-xs mt-1">{{ debtCount()!['61-90'] }} deudas</dd>
      </dl>
      <dl class="flex flex-col items-center justify-center">
        <dt class="text-gray-500 dark:text-gray-400 text-xs font-normal mb-1">90+ días</dt>
        <dd class="text-gray-900 dark:text-white text-lg font-semibold">{{ chartData()!['90+'] | colombianCurrency }}</dd>
        <dd class="text-gray-500 dark:text-gray-400 text-xs mt-1">{{ debtCount()!['90+'] }} deudas</dd>
      </dl>
    </div>

    <div id="age-portfolio-chart"></div>

    <div class="grid grid-cols-1 items-center border-gray-200 border-t dark:border-gray-700 justify-between mt-5 pt-5">
      <div class="flex justify-between items-center">
        <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
          </svg>
          Total cartera: <strong class="ml-1">{{ totalCartera() | colombianCurrency }}</strong>
        </div>
        <!-- <div class="text-sm font-medium"
             [ngClass]="carteraVencidaPercentage() < 30 ? 'text-green-500 dark:text-green-500' : carteraVencidaPercentage() < 50 ? 'text-yellow-500 dark:text-yellow-500' : 'text-red-500 dark:text-red-500'">
          {{ carteraVencidaPercentage() | number:'1.0-1':'es-CO' }}% vencida (>30 días)
        </div> -->
      </div>
    </div>
  } @else {
    <div class="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
      <div class="text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay datos disponibles</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">No se encontraron datos de cartera para mostrar.</p>
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
  public readonly data = input<CarteraEdadesFacturas | null>(null);
  public readonly chartData = signal<AgePortfolioData | null>(null);
  public readonly debtCount = signal<AgePortfolioInvoiceCount | null>(null);
  public isLoading = signal<boolean>(false);
  public hasError = signal<boolean>(false);
  public totalCartera = signal<number>(0);
  public carteraVencidaPercentage = signal<number>(0);

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

      // Mapear metricas a la estructura del gráfico
      serviceData.metricas.forEach((metrica) => {
        const rango = metrica.rangoAntiguedad.trim();

        // Normalizar el rango para que coincida con la estructura
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

  /**
   * Recargar datos manualmente (para el botón de actualizar)
   */
  public loadData(): void {
    const serviceData = this.data();
    if (serviceData) {
      this.transformAndLoadData(serviceData);
    }
  }

  /**
   * Calcular totales y porcentajes
   */
  private calculateTotals(data: AgePortfolioData): void {
    const total = data['0-30'] + data['31-60'] + data['61-90'] + data['90+'];
    const vencida = data['31-60'] + data['61-90'] + data['90+'];

    this.totalCartera.set(total);

    const percentage = total > 0 ? (vencida / total) * 100 : 0;
    this.carteraVencidaPercentage.set(percentage);
  }

  /**
   * Actualizar gráfico con nuevos datos
   */
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

  /**
   * Obtener opciones del gráfico
   */
  private getOptions(): AgePortfolioChartOptions {
    const currentData = this.chartData();

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
        height: 350,
        maxWidth: '100%',
        fontFamily: 'Inter, sans-serif',
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '70%',
          borderRadiusApplication: 'end',
          borderRadius: 8,
        },
      },
      tooltip: {
        enabled: true,
        shared: true,
        intersect: false,
        style: { fontFamily: 'Inter, sans-serif' },
        y: {
          formatter: (value: number, opts?: any) => {
            const seriesIndex = opts?.seriesIndex ?? 0;
            const dataPointIndex = opts?.dataPointIndex ?? 0;
            const debts = this.debtCount();

            if (debts) {
              const ranges = ['0-30', '31-60', '61-90', '90+'] as const;
              const range = ranges[dataPointIndex];
              const count = debts[range];
              return `$${value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} (${count} facturas)`;
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
        padding: { left: 20, right: 20, top: 0 },
        borderColor: '#374151'
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
            fontSize: '12px',
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
            fontSize: '12px',
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

  /**
   * Inicializar gráfico
   */
  private initializeChart(): void {
    const el = document.getElementById('age-portfolio-chart') as HTMLElement;
    const hasData = this.chartData() !== null;

    if (el && ApexCharts !== undefined && hasData) {
      this.chart = new ApexCharts(el, this.getOptions());
      this.chart.render().catch((error: any) => {
        console.error('Error rendering chart:', error);
      });
    } else if (el && !hasData) {
      el.innerHTML = '<div class="flex items-center justify-center h-64 text-gray-500">No hay datos disponibles</div>';
    }
  }
}
