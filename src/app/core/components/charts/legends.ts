import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, computed, inject, OnDestroy, PLATFORM_ID, signal, effect } from '@angular/core';
import { FacturasDataService } from '@services/facturas-data.service';
import { IFacturasData } from '@interfaces/IFacturasData';
import { Subscription } from 'rxjs';


declare const ApexCharts: any;

interface ChartSeries {
  name: string;
  data: number[];
  color?: string;
}

interface ChartOptions {
  series: ChartSeries[];
  chart: {
    height: number | string;
    maxWidth?: string;
    type: 'line' | 'area';
    fontFamily?: string;
    dropShadow?: { enabled: boolean };
    toolbar: { show: boolean };
  };
  tooltip: {
    enabled: boolean;
    x: { show: boolean };
    y?: { formatter?: (value: number) => string };
  };
  legend: {
    show: boolean;
    position?: 'bottom' | 'top' | 'left' | 'right';
    horizontalAlign?: 'center' | 'left' | 'right';
    fontFamily?: string;
  };
  fill: {
    type: 'gradient' | 'solid';
    gradient?: {
      opacityFrom: number;
      opacityTo: number;
      shade?: string;
      gradientToColors?: string[];
    };
  };
  dataLabels: { enabled: boolean };
  stroke: {
    width: number;
    curve?: 'smooth' | 'straight' | 'stepline';
  };
  grid: {
    show: boolean;
    strokeDashArray: number;
    padding: { left: number; right: number; top: number };
    borderColor?: string;
  };
  xaxis: {
    categories: string[];
    labels: {
      show: boolean;
      style?: {
        colors: string;
        fontSize: string;
        fontFamily: string;
      };
    };
    axisBorder: { show: boolean };
    axisTicks: { show: boolean };
  };
  yaxis: {
    show: boolean;
    labels: {
      formatter: (v: number) => string;
      offsetX?: number;
      style?: {
        colors: string;
        fontSize: string;
        fontFamily: string;
      };
    };
  };
}

@Component({
  selector: 'app-legends',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
  <div class="flex justify-between mb-5">
    <div>
      <h5 class="leading-none text-3xl font-bold text-gray-900 dark:text-white pb-2">Estado de Facturas por Mes</h5>
      <p class="text-base font-normal text-gray-500 dark:text-gray-400">Facturas pagadas, pendientes y vencidas</p>
    </div>
    <div
      class="flex items-center px-2.5 py-0.5 text-base font-semibold text-green-500 dark:text-green-500 text-center">
      76%
      <svg class="w-3 h-3 ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 14">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13V1m0 0L1 5m4-4 4 4"/>
      </svg>
    </div>
  </div>
  <div id="legend-chart"></div>
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
      <!-- <a
        href="#"
        class="uppercase text-sm font-semibold inline-flex items-center rounded-lg text-blue-600 hover:text-blue-700 dark:hover:text-blue-500  hover:bg-gray-100 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700 px-3 py-2">
        Ver más
        <svg class="w-2.5 h-2.5 ms-1.5 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
        </svg>
      </a> -->
      <button
        (click)="updateChartData()"
        class="ml-2 uppercase text-sm font-semibold inline-flex items-center rounded-lg text-green-600 hover:text-green-700 dark:hover:text-green-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700 px-3 py-2">
        Actualizar
        <svg class="w-2.5 h-2.5 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
        </svg>
      </button>
    </div>
  </div>
</div>


  `,
})
export class Legends implements AfterViewInit, OnDestroy {
  private chart: any;
  private subscription?: Subscription;
  protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);
  private readonly facturasService = inject(FacturasDataService);

  // Signals para manejo reactivo de datos
  private chartData = signal<IFacturasData | null>(null);
  public isLoading = signal<boolean>(true);
  public hasError = signal<boolean>(false);

  // Propiedades para el dropdown de meses
  public isDropdownOpen = false;
  public selectedMonth = 'Todos los meses';

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
  });

  // Signal computed que se actualiza cuando cambian empresaId o año
  readonly shouldRefreshData = computed(() => {
    const empresaId = this.empresaId();
    const anio = this.currentYear();
    return { empresaId, anio };
  });

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadFacturasData();
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

  private loadFacturasData(): void {
    const empresaId = this.empresaId();
    const anio = this.currentYear();

    // Validar que tengamos los datos necesarios
    if (!empresaId || !anio) {
      console.warn('Datos incompletos para cargar facturas:', { empresaId, anio });
      return;
    }

    this.isLoading.set(true);
    this.subscription = this.facturasService.getFacturasDataAnual(empresaId, anio).subscribe({
      next: (data: IFacturasData) => {
        this.chartData.set(data);
        this.isLoading.set(false);
        this.hasError.set(false);
        // Usar setTimeout para asegurar que ApexCharts esté completamente cargado
        setTimeout(() => {
          this.initializeAreaChart();
        }, 0);
      },
      error: (error: any) => {
        console.error('Error loading facturas data:', error);
        this.isLoading.set(false);
        this.hasError.set(true);
        // Fallback: inicializar con datos vacíos si falla
        this.initializeAreaChart();
      }
    });
  }

  /**
   * Método público para actualizar los datos del gráfico
   */
  updateChartData(): void {
    const empresaId = this.empresaId();
    const anio = this.currentYear();

    if (!empresaId || !anio) {
      console.warn('Datos incompletos para actualizar facturas:', { empresaId, anio });
      return;
    }

    if (this.facturasService) {
      this.subscription?.unsubscribe();
      this.isLoading.set(true);

      this.subscription = this.facturasService.getFacturasDataAnual(empresaId, anio).subscribe({
        next: (data: IFacturasData) => {
          this.chartData.set(data);
          this.isLoading.set(false);
          this.hasError.set(false);

          // Actualizar el gráfico si existe
          this.updateChart(data);
        },
        error: (error: any) => {
          console.error('Error updating chart data:', error);
          this.isLoading.set(false);
          this.hasError.set(true);
        }
      });
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
      console.warn('Datos incompletos para filtrar por mes:', { empresaId, anio });
      return;
    }

    // Convertir nombre del mes a número (1-12) o undefined para "Todos los meses"
    const monthNumber = this.getMonthNumber(monthName);

    // Llamar al servicio con o sin el parámetro mes
    this.subscription?.unsubscribe();
    this.isLoading.set(true);

    this.subscription = this.facturasService.getFacturasDataAnual(empresaId, anio).subscribe({
      next: (data: IFacturasData) => {
        // Si se seleccionó un mes específico, filtrar los datos
        const filteredData = monthNumber ? this.filterDataByMonth(data, monthNumber) : data;

        this.chartData.set(filteredData);
        this.isLoading.set(false);
        this.hasError.set(false);

        // Actualizar gráfico
        this.updateChart(filteredData);
      },
      error: (error: any) => {
        console.error('Error loading month data:', error);
        this.isLoading.set(false);
        this.hasError.set(true);
      }
    });
  }

  private getMonthNumber(monthName: string): number | undefined {
    const months: { [key: string]: number } = {
      'Enero': 1, 'Febrero': 2, 'Marzo': 3, 'Abril': 4,
      'Mayo': 5, 'Junio': 6, 'Julio': 7, 'Agosto': 8,
      'Septiembre': 9, 'Octubre': 10, 'Noviembre': 11, 'Diciembre': 12
    };

    return months[monthName];
  }

  private filterDataByMonth(data: IFacturasData, monthNumber: number): IFacturasData {
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const monthIndex = monthNumber - 1;

    if (monthIndex >= 0 && monthIndex < data.xAxis.length) {
      return {
        xAxis: [data.xAxis[monthIndex]],
        yAxis: {
          facturasPagadas: [data.yAxis.facturasPagadas[monthIndex] || 0],
          facturasPendientes: [data.yAxis.facturasPendientes[monthIndex] || 0],
          facturasVencidas: [data.yAxis.facturasVencidas[monthIndex] || 0]
        }
      };
    }

    return {
      xAxis: [monthNames[monthIndex]],
      yAxis: {
        facturasPagadas: [0],
        facturasPendientes: [0],
        facturasVencidas: [0]
      }
    };
  }


  private updateChart(data: IFacturasData): void {
    if (this.chart) {
      const newSeries = [
        {
          name: 'Facturas Pagadas',
          data: data.yAxis.facturasPagadas,
        },
        {
          name: 'Facturas Pendientes',
          data: data.yAxis.facturasPendientes,
        },
        {
          name: 'Facturas Vencidas',
          data: data.yAxis.facturasVencidas,
        }
      ];

      this.chart.updateSeries(newSeries);
      this.chart.updateOptions({
        xaxis: {
          categories: data.xAxis
        }
      });
    }
  }

  private getOptions(): ChartOptions {
    // signal
    const currentData = this.chartData();

    const series: ChartSeries[] = currentData ? [
      {
        name: 'Facturas Pagadas',
        data: currentData.yAxis.facturasPagadas,
        color: '#10B981', // Verde para pagadas
      },
      {
        name: 'Facturas Pendientes',
        data: currentData.yAxis.facturasPendientes,
        color: '#3B82F6', // Azul para pendientes
      },
      {
        name: 'Facturas Vencidas',
        data: currentData.yAxis.facturasVencidas,
        color: '#EF4444', // Rojo para vencidas
      },
    ] : [
      {
        name: 'Facturas Pagadas',
        data: [],
        color: '#10B981',
      },
      {
        name: 'Facturas Pendientes',
        data: [],
        color: '#3B82F6',
      },
      {
        name: 'Facturas Vencidas',
        data: [],
        color: '#EF4444',
      },
    ];

    const categories = currentData ?
      currentData.xAxis :
      [];

    return {
      series,
      chart: {
        height: 280,
        maxWidth: '100%',
        type: 'area',
        fontFamily: 'Inter, sans-serif',
        dropShadow: { enabled: false },
        toolbar: { show: false },
      },
      tooltip: {
        enabled: true,
        x: { show: false },
        y: {
          formatter: (v: number) => `$${v}`
        },
      },
      legend: {
        show: true,
        position: 'bottom',
        horizontalAlign: 'center',
        fontFamily: 'Inter, sans-serif'
      },
      fill: {
        type: 'gradient',
        gradient: {
          opacityFrom: 0.55,
          opacityTo: 0.1,
          shade: 'light',
        },
      },
      dataLabels: { enabled: false },
      stroke: {
        width: 3,
        curve: 'smooth'
      },
      grid: {
        show: true,
        strokeDashArray: 3,
        padding: { left: 20, right: 2, top: 0 }, // Aumentar padding izquierdo para más espacio
        borderColor: '#374151'
      },
      xaxis: {
        categories,
        labels: {
          show: true,
          style: {
            colors: '#9CA3AF',
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif'
          }
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
          formatter: (value: number) => `$${value}`,
          offsetX: -7, // Separa los números del eje Y hacia la izquierda
        },
      },
    };
  }

  private initializeAreaChart(): void {
    const el = document.getElementById('legend-chart') as HTMLElement;
    if (el && typeof ApexCharts !== 'undefined') {
      this.chart = new ApexCharts(el, this.getOptions());
      this.chart.render().catch((error: any) => {
        console.error('Error rendering legend chart:', error);
      });
    } else {
      console.error('ApexCharts no está cargado o falta el elemento #legend-chart');
    }
  }
}
