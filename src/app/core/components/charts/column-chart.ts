import { isPlatformBrowser, DecimalPipe, registerLocaleData } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, computed, inject, OnDestroy, PLATFORM_ID, signal } from '@angular/core';
import { ClientesKpiService } from '@services/clientes-kpi.service';
import { IColumnChartData } from '@interfaces/IBilledConsumption';
import { Subscription } from 'rxjs';
import { ColombianCurrencyPipe } from '@shared/index';
import localeEs from '@angular/common/locales/es-CO';

declare const ApexCharts: any;

interface ColumnSeries {
  name: string;
  data: { x: string; y: number }[];
  color?: string;
}

interface ColumnChartOptions {
  colors: string[];
  series: ColumnSeries[];
  chart: {
    type: 'bar';
    height: number | string;
    maxWidth?: string;
    fontFamily?: string;
    toolbar: { show: boolean };
    dropShadow?: { enabled: boolean };
  };
  plotOptions: {
    bar: {
      horizontal: boolean;
      columnWidth: string;
      borderRadiusApplication: 'end' | 'around';
      borderRadius: number;
      dataLabels?: { position?: 'top' | 'center' | 'bottom' };
    };
  };
  tooltip: {
    enabled: boolean;
    shared: boolean;
    intersect: boolean;
    style?: { fontFamily: string };
    y?: { formatter?: (value: number, opts?: any) => string };
  };
  states: {
    hover: {
      filter: {
        type: 'darken';
        value: number;
      };
    };
  };
  stroke: { show: boolean; width: number; colors: string[] };
  grid: {
    show: boolean;
    strokeDashArray: number;
    padding: { left: number; right: number; top: number };
    borderColor?: string;
  };
  dataLabels: { enabled: boolean };
  legend: {
    show: boolean;
    position?: 'bottom' | 'top' | 'left' | 'right';
    horizontalAlign?: 'center' | 'left' | 'right';
    fontFamily?: string;
  };
  xaxis: {
    type?: 'category';
    floating?: boolean;
    categories?: string[];
    labels: {
      show: boolean;
      style?: {
        fontFamily: string;
        cssClass?: string;
        colors?: string;
        fontSize?: string;
      };
    };
    axisBorder: { show: boolean };
    axisTicks: { show: boolean };
  };
  yaxis: {
    show: boolean;
    labels?: {
      formatter?: (value: number) => string;
      offsetX?: number;
      style?: {
        colors: string;
        fontSize: string;
        fontFamily: string;
      };
    };
  };
  fill: { opacity: number };
}

@Component({
  selector: 'app-column-chart-card',
  standalone: true,
  imports: [DecimalPipe, ColombianCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
  <div class="flex justify-between mb-5">
    <div>
      <h5 class="leading-none text-3xl font-bold text-gray-900 dark:text-white pb-2">Consumo vs Facturación</h5>
      <p class="text-base font-normal text-gray-500 dark:text-gray-400">Comparación entre consumo en m³ y monto facturado</p>
    </div>
    <!-- <div class="flex items-center px-2.5 py-0.5 text-base font-semibold text-center"
         [ngClass]="eficienciaPercentage() >= 80 ? 'text-green-500 dark:text-green-500' : eficienciaPercentage() >= 60 ? 'text-yellow-500 dark:text-yellow-500' : 'text-red-500 dark:text-red-500'">
      {{ eficienciaPercentage() }}%
      <svg class="w-3 h-3 ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 14"
           [ngClass]="eficienciaPercentage() >= 70 ? 'rotate-0' : 'rotate-180'">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13V1m0 0L1 5m4-4 4 4"/>
      </svg>
    </div> -->
  </div>

  @if (chartData() && chartData()!.xAxis.length > 0) {
    <div class="grid grid-cols-2 pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
      <dl class="flex items-center">
        <dt class="text-gray-500 dark:text-gray-400 text-sm font-normal me-1">Total Consumo:</dt>
        <dd class="text-gray-900 dark:text-white text-sm font-semibold">{{ totalConsumo() | number:'1.0-0':'es-CO' }} m³</dd>
      </dl>
      <dl class="flex items-center justify-end">
        <dt class="text-gray-500 dark:text-gray-400 text-sm font-normal me-1">Total Facturado:</dt>
        <dd class="text-gray-900 dark:text-white text-sm font-semibold">{{ totalFacturado() | colombianCurrency }}</dd>
      </dl>
    </div>

    <div id="column-chart"></div>
  } @else {
    <div class="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
      <div class="text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay datos disponibles</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">No se encontraron datos de consumo y facturación para mostrar.</p>
      </div>
    </div>
  }

  <div class="grid grid-cols-1 items-center border-gray-200 border-t dark:border-gray-700 justify-between mt-5">
    <div class="flex justify-between items-center pt-5">
      <!-- Dropdown Container -->
      <div class="dropdown-container relative">
        <!-- Button -->
        <button
          (click)="toggleDropdown()"
          class="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 text-center inline-flex items-center dark:hover:text-white"
          type="button">
          {{ selectedMonth }}
          <svg class="w-2.5 m-2.5 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
          </svg>
        </button>
        <!-- Dropdown menu -->
        <div [class.hidden]="!isDropdownOpen" class="absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 mt-1">
            <ul class="py-2 text-sm text-gray-700 dark:text-gray-200">
              <li>
                <button (click)="selectMonth('Todos los meses')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Todos los meses</button>
              </li>
              <li>
                <button (click)="selectMonth('Enero')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Enero</button>
              </li>
              <li>
                <button (click)="selectMonth('Febrero')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Febrero</button>
              </li>
              <li>
                <button (click)="selectMonth('Marzo')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Marzo</button>
              </li>
              <li>
                <button (click)="selectMonth('Abril')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Abril</button>
              </li>
              <li>
                <button (click)="selectMonth('Mayo')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Mayo</button>
              </li>
              <li>
                <button (click)="selectMonth('Junio')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Junio</button>
              </li>
              <li>
                <button (click)="selectMonth('Julio')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Julio</button>
              </li>
              <li>
                <button (click)="selectMonth('Agosto')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Agosto</button>
              </li>
              <li>
                <button (click)="selectMonth('Septiembre')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Septiembre</button>
              </li>
              <li>
                <button (click)="selectMonth('Octubre')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Octubre</button>
              </li>
              <li>
                <button (click)="selectMonth('Noviembre')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Noviembre</button>
              </li>
              <li>
                <button (click)="selectMonth('Diciembre')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Diciembre</button>
              </li>
            </ul>
        </div>
      </div>
    </div>
  </div>
</div>
  `
})
export class ColumnChartCardComponent implements AfterViewInit, OnDestroy {
  private chart: any;
  private subscription?: Subscription;
  protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);
  private readonly clientesKpiService = inject(ClientesKpiService);

  // Signals para manejo reactivo de datos
  public readonly chartData = signal<IColumnChartData | null>(null);
  public isLoading = signal<boolean>(true);
  public hasError = signal<boolean>(false);

  // Propiedades para el dropdown
  public isDropdownOpen = false;
  public selectedMonth = 'Todos los meses';

  // Propiedades calculadas como signals
  public totalConsumo = signal<number>(0);
  public totalFacturado = signal<number>(0);
  public eficienciaPercentage = signal<number>(0);

  readonly userData = computed(() => {
    if (!this.isBrowser) return null;
    try {
      const userDataString = sessionStorage.getItem('userData');
      if (!userDataString) return null;
      return JSON.parse(userDataString);
    } catch (e) {
      console.error('Error parsing userData from sessionStorage:', e);
      return null;
    }
  });

  readonly empresaId = computed(() => {
    const data = this.userData();
    return data?.empresaId || null;
  });

  readonly currentDate = computed(() => {
    if (!this.isBrowser) return new Date();
    return new Date();
  });

  readonly currentYear = computed(() => {
    return this.currentDate().getFullYear();
  });  constructor() {
    // Registrar locale colombiano
    registerLocaleData(localeEs);
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadConsumoData();
      // Agregar listener para cerrar dropdown al hacer clic fuera
      document.addEventListener('click', this.closeDropdownOnOutsideClick.bind(this));
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.subscription?.unsubscribe();
    // Remover listener
    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener('click', this.closeDropdownOnOutsideClick.bind(this));
    }
  }

  /**
   * Cerrar dropdown al hacer clic fuera
   */
  private closeDropdownOnOutsideClick(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.dropdown-container');
    if (!dropdown) {
      this.isDropdownOpen = false;
    }
  }

  private loadConsumoData(): void {
    const empresaId = this.empresaId();
    const anio = this.currentYear();

    if (!empresaId || !anio) {
      console.warn('Datos incompletos para cargar consumo:', { empresaId, anio });
      this.isLoading.set(false);
      this.hasError.set(true);
      return;
    }

    this.isLoading.set(true);
    this.subscription = this.clientesKpiService.getBilledConsumptionForChart(empresaId, anio).subscribe({
      next: (data: IColumnChartData) => {
        this.chartData.set(data);
        this.calculateTotals(data);
        this.isLoading.set(false);
        this.hasError.set(false);
        setTimeout(() => {
          this.initializeColumnChart();
        }, 0);
      },
      error: (error: any) => {
        this.isLoading.set(false);
        this.hasError.set(true);
        this.initializeColumnChart();
      }
    });
  }

  /**
   * Calcular totales y eficiencia
   */
  private calculateTotals(data: IColumnChartData): void {
    if (data) {
      const totalConsumo = data.yAxis.consumoM3.reduce((a: number, b: number) => a + b, 0);
      const totalFacturado = data.yAxis.facturadoPesos.reduce((a: number, b: number) => a + b, 0);

      this.totalConsumo.set(totalConsumo);
      this.totalFacturado.set(totalFacturado);

      // Calcular eficiencia básica (esto puede ajustarse según la lógica de negocio)
      const eficiencia = totalConsumo > 0 ? Math.min(100, Math.round((totalFacturado / totalConsumo) / 100)) : 0;
      this.eficienciaPercentage.set(eficiencia);
    }
  }

  /**
   * Toggle del dropdown
   */
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  /**
   * Seleccionar mes y actualizar gráfico
   */
  selectMonth(monthName: string): void {
    this.selectedMonth = monthName;
    this.isDropdownOpen = false;

    const empresaId = this.empresaId();
    const anio = this.currentYear();

    if (!empresaId || !anio) {
      console.warn('Datos incompletos para cargar consumo:', { empresaId, anio });
      return;
    }

    this.isLoading.set(true);

    // Convertir nombre del mes a número (1-12) o undefined para "Todos los meses"
    const monthNumber = this.getMonthNumber(monthName);

    if (monthNumber) {
      // Cargar datos para un mes específico
      this.subscription?.unsubscribe();
      this.subscription = this.clientesKpiService.getBilledConsumptionForChart(empresaId, anio, monthNumber).subscribe({
        next: (data: IColumnChartData) => {
          this.chartData.set(data);
          this.calculateTotals(data);
          this.isLoading.set(false);
          this.hasError.set(false);
          this.updateChart(data);
        },
        error: (error: any) => {
          console.error('Error loading month data:', error);
          this.isLoading.set(false);
          this.hasError.set(true);
        }
      });
    } else {
      // Cargar datos para todos los meses
      this.subscription?.unsubscribe();
      this.subscription = this.clientesKpiService.getBilledConsumptionForChart(empresaId, anio).subscribe({
        next: (data: IColumnChartData) => {
          this.chartData.set(data);
          this.calculateTotals(data);
          this.isLoading.set(false);
          this.hasError.set(false);
          this.updateChart(data);
        },
        error: (error: any) => {
          console.error('Error loading yearly data:', error);
          this.isLoading.set(false);
          this.hasError.set(true);
        }
      });
    }
  }

  private getMonthNumber(monthName: string): number | undefined {
    const months: { [key: string]: number } = {
      'Enero': 1, 'Febrero': 2, 'Marzo': 3, 'Abril': 4,
      'Mayo': 5, 'Junio': 6, 'Julio': 7, 'Agosto': 8,
      'Septiembre': 9, 'Octubre': 10, 'Noviembre': 11, 'Diciembre': 12
    };

    return months[monthName];
  }

  private updateChart(data: IColumnChartData): void {
    const el = document.getElementById('column-chart') as HTMLElement;

    if (this.chart && data && data.xAxis.length > 0) {
      const newSeries = [
        {
          name: 'Consumo (m³)',
          data: data.xAxis.map((x: string, i: number) => ({ x, y: data.yAxis.consumoM3[i] })),
        },
        {
          name: 'Facturado (miles $)',
          data: data.xAxis.map((x: string, i: number) => ({ x, y: Math.round(data.yAxis.facturadoPesos[i] / 1000) })),
        }
      ];

      this.chart.updateSeries(newSeries);
      this.chart.updateOptions({
        xaxis: {
          categories: data.xAxis
        }
      });
    } else if (el && (!data || data.xAxis.length === 0)) {
      // Si no hay datos, mostrar mensaje
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }
      el.innerHTML = '<div class="flex items-center justify-center h-64 text-gray-500">No hay datos disponibles para el período seleccionado</div>';
    }
  }



  private getOptions(): ColumnChartOptions {
    const currentData = this.chartData();

    // Solo crear series si tenemos datos válidos del servicio
    const series: ColumnSeries[] = currentData && currentData.xAxis.length > 0 ? [
      {
        name: 'Consumo (m³)',
        data: currentData.xAxis.map((x: string, i: number) => ({ x, y: currentData.yAxis.consumoM3[i] })),
        color: '#1A56DB', // Azul para consumo
      },
      {
        name: 'Facturado (miles $)',
        data: currentData.xAxis.map((x: string, i: number) => ({ x, y: Math.round(currentData.yAxis.facturadoPesos[i] / 1000) })), // Dividir por 1000
        color: '#FDBA8C', // Naranja para facturación
      },
    ] : [];

    return {
      colors: ['#1A56DB', '#FDBA8C'],
      series,
      chart: {
        type: 'bar',
        height: 350,
        maxWidth: '100%',
        fontFamily: 'Inter, sans-serif',
        toolbar: { show: false },
        dropShadow: { enabled: false },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%',
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
            // Obtener el nombre de la serie desde el índice de series
            const seriesIndex = opts?.seriesIndex ?? 0;
            const seriesName = series[seriesIndex]?.name || '';

            if (seriesName.includes('Facturado')) {
              // Para facturado, multiplicar por 1000 ya que mostramos en miles
              return `$${(value * 1000).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
            }
            // Para consumo
            return `${value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} m³`;
          }
        },
      },
      states: {
        hover: { filter: { type: 'darken', value: 0.1 } },
      },
      stroke: { show: true, width: 0, colors: ['transparent'] },
      grid: {
        show: true,
        strokeDashArray: 3,
        padding: { left: 20, right: 2, top: 0 },
        borderColor: '#374151'
      },
      dataLabels: { enabled: false },
      legend: {
        show: true,
        position: 'bottom',
        horizontalAlign: 'center',
        fontFamily: 'Inter, sans-serif'
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
            if (value >= 1000) {
              return `${(value / 1000).toFixed(0)}k`;
            }
            return `${value}`;
          },
          offsetX: -7,
        },
      },
      fill: { opacity: 1 },
    };
  }

  private initializeColumnChart(): void {
    const el = document.getElementById('column-chart') as HTMLElement;
    const hasData = this.chartData() && this.chartData()!.xAxis.length > 0;

    // Solo inicializar el gráfico si tenemos datos válidos
    if (el && ApexCharts !== undefined && hasData) {
      this.chart = new ApexCharts(el, this.getOptions());
      this.chart.render().catch((error: any) => {
        console.error('Error rendering column chart:', error);
      });
    } else if (el && !hasData) {
      // Si no hay datos, limpiar el elemento del gráfico
      el.innerHTML = '<div class="flex items-center justify-center h-64 text-gray-500">No hay datos disponibles</div>';
    } else {
      console.error('ApexCharts no está cargado o falta el elemento #column-chart');
    }
  }
}
