import { DecimalPipe, isPlatformBrowser, registerLocaleData } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, computed, inject, OnDestroy, PLATFORM_ID, signal } from '@angular/core';
import localeEs from '@angular/common/locales/es';
import { Subscription } from 'rxjs';
import { ClientesKpiService } from '@services/clientes-kpi.service';
import { IEmpresaContadorChartData } from '@interfaces/IEmpresaContadorConsumption';

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
  selector: 'app-empresa-contador-chart',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="relative z-10 w-full shadow-sm rounded-lg bg-white/20 dark:bg-slate-800/20 backdrop-blur-2xl p-4 md:p-6">
  <div class="flex justify-between mb-5">
    <div>
      <h5 class="leading-none text-3xl font-bold text-gray-900 dark:text-white pb-2">Consumo Empresa vs Clientes</h5>
      <p class="text-base font-normal text-gray-500 dark:text-gray-400">Comparación entre consumo de empresa y consumo de clientes</p>
    </div>
  </div>

  @if (chartData() && chartData()!.xAxis.length > 0) {
    <div class="grid grid-cols-2 pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
      <dl class="flex items-center">
        <dt class="text-gray-500 dark:text-gray-400 text-sm font-normal me-1">Total Empresa:</dt>
        <dd class="text-gray-900 dark:text-white text-sm font-semibold">{{ totalConsumoEmpresa() | number:'1.0-0':'es-CO' }} m³</dd>
      </dl>
      <dl class="flex items-center justify-end">
        <dt class="text-gray-500 dark:text-gray-400 text-sm font-normal me-1">Total Clientes:</dt>
        <dd class="text-gray-900 dark:text-white text-sm font-semibold">{{ totalConsumoClientes() | number:'1.0-0':'es-CO' }} m³</dd>
      </dl>
    </div>

    <div id="empresa-contador-chart"></div>
  } @else {
    <div class="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
      <div class="text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay datos disponibles</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">No se encontraron datos de consumo de empresa para mostrar.</p>
      </div>
    </div>
  }

  <div class="grid grid-cols-1 items-center border-gray-200 border-t dark:border-gray-700 justify-between mt-5">
    <div class="flex justify-between items-center pt-5">
      <div class="dropdown-container relative">
        <button
          (click)="toggleDropdown()"
          class="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 text-center inline-flex items-center dark:hover:text-white"
          type="button">
          {{ selectedMonth }}
          <svg class="w-2.5 m-2.5 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
          </svg>
        </button>
        <div [class.hidden]="!isDropdownOpen" class="absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 mt-1">
            <ul class="py-2 text-sm text-gray-700 dark:text-gray-200">
              <li>
                <button (click)="selectMonth('Todos los meses')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Todos los meses</button>
              </li>
              @for (month of availableMonths(); track month) {
                <li>
                  <button (click)="selectMonth(month)" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">{{ month }}</button>
                </li>
              }
            </ul>
        </div>
      </div>
      @if (selectedMonth === 'Todos los meses' && getTotalPages() > 1) {
        <div class="flex items-center gap-2">
          <button
            (click)="previousPage()"
            [disabled]="currentPage() === 0"
            [class.opacity-50]="currentPage() === 0"
            [class.cursor-not-allowed]="currentPage() === 0"
            class="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:hover:text-gray-500"
            type="button">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <span class="text-sm text-gray-500 dark:text-gray-400">
            {{ currentPage() + 1 }} / {{ getTotalPages() }}
          </span>
          <button
            (click)="nextPage()"
            [disabled]="currentPage() >= getTotalPages() - 1"
            [class.opacity-50]="currentPage() >= getTotalPages() - 1"
            [class.cursor-not-allowed]="currentPage() >= getTotalPages() - 1"
            class="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:hover:text-gray-500"
            type="button">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      }
    </div>
  </div>
</div>
  `
})
export class EmpresaContadorChartComponent implements AfterViewInit, OnDestroy {
  private chart: any;
  private subscription?: Subscription;
  protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);
  private readonly clientesKpiService = inject(ClientesKpiService);

  // Signals para manejo reactivo de datos
  public readonly chartData = signal<IEmpresaContadorChartData | null>(null);
  public isLoading = signal<boolean>(true);
  public hasError = signal<boolean>(false);

  // Propiedades para el dropdown
  public isDropdownOpen = false;
  public selectedMonth = 'Todos los meses';
  public availableMonths = signal<string[]>([]);

  // Propiedades calculadas como signals
  public totalConsumoEmpresa = signal<number>(0);
  public totalConsumoClientes = signal<number>(0);

  // Propiedades para paginación
  public currentPage = signal<number>(0);
  public itemsPerPage = 6;
  public fullChartData = signal<IEmpresaContadorChartData | null>(null);

  readonly userData = computed(() => {
    if (!this.isBrowser) return null;
    try {
      const userDataString = sessionStorage.getItem('userData');
      if (!userDataString) return null;
      return JSON.parse(userDataString);
    } catch (e) {
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
  });

  constructor() {
    registerLocaleData(localeEs);
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadConsumoData();
      document.addEventListener('click', this.closeDropdownOnOutsideClick.bind(this));
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.subscription?.unsubscribe();
    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener('click', this.closeDropdownOnOutsideClick.bind(this));
    }
  }

  private closeDropdownOnOutsideClick(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.dropdown-container');
    if (!dropdown) {
      this.isDropdownOpen = false;
    }
  }

  /**
   * Extraer meses disponibles de los datos del eje X
   */
  private extractAvailableMonths(data: IEmpresaContadorChartData): void {
    if (!data || !data.xAxis || data.xAxis.length === 0) {
      this.availableMonths.set([]);
      return;
    }

    const allMonths = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const uniqueMonths = new Set<string>();

    // Extraer meses que tienen datos (formato puede variar: "Enero" o "01-ContadorName")
    data.xAxis.forEach((label: string, index: number) => {
      const hasConsumoEmpresa = data.yAxis.consumoEmpresa[index] > 0;
      const hasConsumoClientes = data.yAxis.consumoClientes[index] > 0;

      // Buscar si el label contiene un nombre de mes
      for (const month of allMonths) {
        if (label.includes(month) && (hasConsumoEmpresa || hasConsumoClientes)) {
          uniqueMonths.add(month);
          break;
        }
      }
    });

    // Mantener el orden cronológico
    const sortedMonths = allMonths.filter(month => uniqueMonths.has(month));

    this.availableMonths.set(sortedMonths);
  }

  private loadConsumoData(): void {
    const empresaId = this.empresaId();
    const anio = this.currentYear();

    if (!empresaId || !anio) {
      console.warn('Datos incompletos para cargar consumo empresa:', { empresaId, anio });
      this.isLoading.set(false);
      this.hasError.set(true);
      return;
    }

    this.isLoading.set(true);
    this.subscription = this.clientesKpiService.getEmpresaContadorConsumption(empresaId, anio).subscribe({
      next: (data: IEmpresaContadorChartData) => {
        this.fullChartData.set(data);
        this.extractAvailableMonths(data);
        this.currentPage.set(0);
        const paginatedData = this.getPaginatedData(data);
        this.chartData.set(paginatedData);
        this.calculateTotals(data);
        this.isLoading.set(false);
        this.hasError.set(false);
        setTimeout(() => {
          this.initializeChart();
        }, 0);
      },
      error: (error: any) => {
        console.error('Error al cargar datos de empresa-contador:', error);
        this.isLoading.set(false);
        this.hasError.set(true);
        this.initializeChart();
      }
    });
  }

  private getPaginatedData(data: IEmpresaContadorChartData): IEmpresaContadorChartData {
    const start = this.currentPage() * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    return {
      xAxis: data.xAxis.slice(start, end),
      yAxis: {
        consumoEmpresa: data.yAxis.consumoEmpresa.slice(start, end),
        consumoClientes: data.yAxis.consumoClientes.slice(start, end)
      }
    };
  }

  getTotalPages(): number {
    const fullData = this.fullChartData();
    if (!fullData || fullData.xAxis.length === 0) return 1;
    return Math.ceil(fullData.xAxis.length / this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage() < this.getTotalPages() - 1) {
      this.currentPage.set(this.currentPage() + 1);
      this.updatePaginatedChart();
    }
  }

  previousPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.set(this.currentPage() - 1);
      this.updatePaginatedChart();
    }
  }

  private updatePaginatedChart(): void {
    const fullData = this.fullChartData();
    if (fullData) {
      const paginatedData = this.getPaginatedData(fullData);
      this.chartData.set(paginatedData);
      this.updateChart(paginatedData);
    }
  }

  private calculateTotals(data: IEmpresaContadorChartData): void {
    if (data) {
      const totalEmpresa = data.yAxis.consumoEmpresa.reduce((a: number, b: number) => a + b, 0);
      const totalClientes = data.yAxis.consumoClientes.reduce((a: number, b: number) => a + b, 0);

      this.totalConsumoEmpresa.set(totalEmpresa);
      this.totalConsumoClientes.set(totalClientes);
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectMonth(monthName: string): void {
    this.selectedMonth = monthName;
    this.isDropdownOpen = false;

    const empresaId = this.empresaId();
    const anio = this.currentYear();

    if (!empresaId || !anio) {
      console.warn('Datos incompletos para cargar consumo empresa:', { empresaId, anio });
      return;
    }

    this.isLoading.set(true);
    const monthNumber = this.getMonthNumber(monthName);

    if (monthNumber) {
      this.subscription?.unsubscribe();
      this.subscription = this.clientesKpiService.getEmpresaContadorConsumption(empresaId, anio, monthNumber).subscribe({
        next: (data: IEmpresaContadorChartData) => {
          this.fullChartData.set(null);
          this.chartData.set(data);
          this.calculateTotals(data);
          this.isLoading.set(false);
          this.hasError.set(false);
          this.updateChart(data);
        },
        error: (error: any) => {
          console.error('Error al cargar datos filtrados:', error);
          this.isLoading.set(false);
          this.hasError.set(true);
        }
      });
    } else {
      this.subscription?.unsubscribe();
      this.subscription = this.clientesKpiService.getEmpresaContadorConsumption(empresaId, anio).subscribe({
        next: (data: IEmpresaContadorChartData) => {
          this.fullChartData.set(data);
          this.extractAvailableMonths(data);
          this.currentPage.set(0);
          const paginatedData = this.getPaginatedData(data);
          this.chartData.set(paginatedData);
          this.calculateTotals(data);
          this.isLoading.set(false);
          this.hasError.set(false);
          this.updateChart(paginatedData);
        },
        error: (error: any) => {
          console.error('Error al cargar datos anuales:', error);
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

  private updateChart(data: IEmpresaContadorChartData): void {
    if (this.chart && data && data.xAxis.length > 0) {
      const newSeries = [
        {
          name: 'Consumo Empresa (m³)',
          data: data.xAxis.map((x: string, i: number) => ({ x, y: data.yAxis.consumoEmpresa[i] })),
        },
        {
          name: 'Consumo Clientes (m³)',
          data: data.xAxis.map((x: string, i: number) => ({ x, y: data.yAxis.consumoClientes[i] })),
        }
      ];

      this.chart.updateSeries(newSeries);
      this.chart.updateOptions({
        xaxis: {
          categories: data.xAxis
        }
      });
    } else if (this.chart && (!data || data.xAxis.length === 0)) {
      // Si no hay datos, actualizar con series vacías pero NO destruir el gráfico
      const emptySeries = [
        {
          name: 'Consumo Empresa (m³)',
          data: [],
        },
        {
          name: 'Consumo Clientes (m³)',
          data: [],
        }
      ];
      this.chart.updateSeries(emptySeries);
    }
  }

  private getOptions(): ColumnChartOptions {
    const currentData = this.chartData();

    const series: ColumnSeries[] = currentData && currentData.xAxis.length > 0 ? [
      {
        name: 'Consumo Empresa (m³)',
        data: currentData.xAxis.map((x: string, i: number) => ({ x, y: currentData.yAxis.consumoEmpresa[i] })),
        color: '#1A56DB',
      },
      {
        name: 'Consumo Clientes (m³)',
        data: currentData.xAxis.map((x: string, i: number) => ({ x, y: currentData.yAxis.consumoClientes[i] })),
        color: '#FDBA8C',
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
            const seriesIndex = opts?.seriesIndex ?? 0;
            const seriesName = series[seriesIndex]?.name || '';

            if (seriesName.includes('Facturado')) {
              return `$${(value * 1000).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
            }
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

  private initializeChart(): void {
    const el = document.getElementById('empresa-contador-chart') as HTMLElement;
    const hasData = this.chartData() && this.chartData()!.xAxis.length > 0;

    if (el && ApexCharts !== undefined && hasData) {
      this.chart = new ApexCharts(el, this.getOptions());
      this.chart.render().catch((error: any) => {
        console.error('Error al renderizar el gráfico:', error);
      });
    } else if (el && !hasData) {
      el.innerHTML = '<div class="flex items-center justify-center h-64 text-gray-500">No hay datos disponibles</div>';
    }
  }
}
