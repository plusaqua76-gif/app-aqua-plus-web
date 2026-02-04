import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, computed, inject, OnDestroy, PLATFORM_ID, signal } from '@angular/core';
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
<div class="relative z-20 w-full shadow-sm rounded-lg bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl p-4 md:p-6">
  <div class="flex justify-between mb-5">
    <div>
      <h5 class="leading-none text-3xl font-bold text-gray-900 dark:text-white pb-2">Estado de Facturas por Mes</h5>
      <p class="text-base font-normal text-gray-500 dark:text-gray-400">Facturas pagadas, pendientes y vencidas</p>
    </div>
    <!-- <div
      class="flex items-center px-2.5 py-0.5 text-base font-semibold text-green-500 dark:text-green-500 text-center">
      76%
      <svg class="w-3 h-3 ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 14">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13V1m0 0L1 5m4-4 4 4"/>
      </svg>
    </div> -->
  </div>
  <div id="legend-chart"></div>
  <div class="grid grid-cols-1 items-center border-gray-200 border-t dark:border-gray-700 justify-between mt-5">
    <div class="flex justify-between items-center pt-5">
      <!-- Dropdown de Años -->
      <div class="year-dropdown-container relative">
        <!-- Button -->
        <button
          (click)="toggleYearDropdown()"
          class="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 text-center inline-flex items-center dark:hover:text-white"
          type="button">
          Año: {{ selectedYear() }}
          <svg class="w-2.5 m-2.5 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
          </svg>
        </button>
        <!-- Dropdown menu -->
        <div [class.hidden]="!isYearDropdownOpen" class="absolute bottom-full mb-1 z-50 bg-white divide-y divide-gray-100 rounded-lg shadow-lg w-32 dark:bg-gray-700">
            <ul class="py-2 text-sm text-gray-700 dark:text-gray-200">
              @for (year of availableYears(); track year) {
                <li>
                  <button
                    (click)="selectYear(year)"
                    [class.bg-blue-100]="selectedYear() === year"
                    [class.dark:bg-blue-900]="selectedYear() === year"
                    class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                    {{ year }}
                  </button>
                </li>
              }
            </ul>
        </div>
      </div>

      <!-- Dropdown de Meses -->
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
        <div [class.hidden]="!isDropdownOpen" class="absolute z-50 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 mt-1">
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


  `,
})
export class Legends implements AfterViewInit, OnDestroy {
  private chart: any;
  private subscription?: Subscription;
  protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);
  private readonly facturasService = inject(FacturasDataService);

  // Signals para manejo reactivo de datos
  private readonly chartData = signal<IFacturasData | null>(null);
  public isLoading = signal<boolean>(true);
  public hasError = signal<boolean>(false);

  // Propiedades para el dropdown de meses
  public isDropdownOpen = false;
  public selectedMonth = 'Todos los meses';

  // Propiedades para el dropdown de años
  public isYearDropdownOpen = false;
  public selectedYear = signal<number>(new Date().getFullYear());
  public availableYears = signal<number[]>([2020, 2021, 2022, 2023, 2024, 2025, 2026]);

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
    return this.selectedYear();
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
    const yearDropdown = target.closest('.year-dropdown-container');
    if (!dropdown) {
      this.isDropdownOpen = false;
    }
    if (!yearDropdown) {
      this.isYearDropdownOpen = false;
    }
  }

  private loadFacturasData(): void {
    const empresaId = this.empresaId();
    const anio = this.currentYear();

    if (!empresaId || !anio) {
      console.warn('Datos incompletos para cargar facturas:', { empresaId, anio });
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
        setTimeout(() => {
          this.initializeAreaChart();
        }, 0);
      },
      error: (error: any) => {

        this.isLoading.set(false);
        this.hasError.set(true);
        this.initializeAreaChart();
      }
    });
  }



  /**
   * Toggle del dropdown de meses
   */
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.isYearDropdownOpen = false;
    }
  }

  /**
   * Toggle del dropdown de años
   */
  toggleYearDropdown(): void {
    this.isYearDropdownOpen = !this.isYearDropdownOpen;
    if (this.isYearDropdownOpen) {
      this.isDropdownOpen = false;
    }
  }

  /**
   * Seleccionar año y recargar datos con animación
   */
  selectYear(year: number): void {
    this.selectedYear.set(year);
    this.isYearDropdownOpen = false;
    this.selectedMonth = 'Todos los meses';

    // Destruir la gráfica existente para forzar animación
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    this.loadFacturasData();
  }

  /**
   * Seleccionar mes y actualizar gráfico con animación
   */
  selectMonth(monthName: string): void {
    this.selectedMonth = monthName;
    this.isDropdownOpen = false;

    const empresaId = this.empresaId();
    const anio = this.currentYear();

    if (!empresaId || !anio) {
      console.warn('Datos incompletos para cargar facturas:', { empresaId, anio });
      return;
    }

    this.isLoading.set(true);

    // Destruir la gráfica existente para forzar animación
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    // Convertir nombre del mes a número (1-12) o undefined para "Todos los meses"
    const monthNumber = this.getMonthNumber(monthName);

    if (monthNumber) {
      // Cargar datos para un mes específico
      this.subscription?.unsubscribe(); // Cancelar subscripción anterior
      this.subscription = this.facturasService.getFacturasMesDinamico(empresaId, anio, monthNumber).subscribe({
        next: (response: any) => {
          // Convertir respuesta a formato de gráfico
          const monthData: IFacturasData = {
            xAxis: [monthName],
            yAxis: {
              facturasPagadas: [response.facturasPagadas?.total || 0],
              facturasPendientes: [response.facturasPendientes?.total || 0],
              facturasVencidas: [response.facturasVencidas?.total || 0]
            }
          };

          this.chartData.set(monthData);
          this.isLoading.set(false);
          this.hasError.set(false);
          setTimeout(() => {
            this.initializeAreaChart();
          }, 0);
        },
        error: (error: any) => {
          this.isLoading.set(false);
          this.hasError.set(true);
        }
      });
    } else {
      // Cargar datos para todos los meses
      this.subscription?.unsubscribe(); // Cancelar subscripción anterior
      this.subscription = this.facturasService.getFacturasDataAnual(empresaId, anio).subscribe({
        next: (data: IFacturasData) => {
          this.chartData.set(data);
          this.isLoading.set(false);
          this.hasError.set(false);
          setTimeout(() => {
            this.initializeAreaChart();
          }, 0);
        },
        error: (error: any) => {
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
          formatter: (v: number) => `${v} facturas` // Más descriptivo
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
          formatter: (value: number) => `${value}`, // Removido el $ ya que son cantidades, no montos
          offsetX: -7, // Separa los números del eje Y hacia la izquierda
        },
      },
    };
  }

  private initializeAreaChart(): void {
    const el = document.getElementById('legend-chart') as HTMLElement;
    if (el && ApexCharts !== undefined) {
      this.chart = new ApexCharts(el, this.getOptions());
      this.chart.render().catch((error: any) => {
      });
    }
  }
}
