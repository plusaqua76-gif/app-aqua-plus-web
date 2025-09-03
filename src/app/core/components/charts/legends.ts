import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnDestroy, PLATFORM_ID } from '@angular/core';
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
      <h5 class="leading-none text-3xl font-bold text-gray-900 dark:text-white pb-2">Facturas Pagadas vs Facturas Pendientes</h5>
      <p class="text-base font-normal text-gray-500 dark:text-gray-400">Estado de las facturas por mes</p>
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
          {{ selectedPeriod }}
          <svg class="w-2.5 m-2.5 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
          </svg>
        </button>
        <!-- Dropdown menu -->
        <div [class.hidden]="!isDropdownOpen" class="absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 mt-1">
            <ul class="py-2 text-sm text-gray-700 dark:text-gray-200">
              <li>
                <button (click)="selectPeriod('Último mes')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Último mes</button>
              </li>
              <li>
                <button (click)="selectPeriod('Últimos 3 meses')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Últimos 3 meses</button>
              </li>
              <li>
                <button (click)="selectPeriod('Últimos 6 meses')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Últimos 6 meses</button>
              </li>
              <li>
                <button (click)="selectPeriod('Último año')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Último año</button>
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
  private facturasData: IFacturasData | null = null;

  // Propiedades para el dropdown
  public isDropdownOpen = false;
  public selectedPeriod = 'Últimos 6 meses';

  private readonly platformId = inject(PLATFORM_ID);
  private readonly facturasService = inject(FacturasDataService);

  constructor() {
    // No inicializar en constructor para componentes standalone
  }

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
    this.subscription = this.facturasService.getFacturasData().subscribe({
      next: (data: IFacturasData) => {
        this.facturasData = data;
        // Usar setTimeout para asegurar que ApexCharts esté completamente cargado
        setTimeout(() => {
          this.initializeAreaChart();
        }, 0);
      },
      error: (error: any) => {
        console.error('Error loading facturas data:', error);
        // Fallback a datos por defecto
        this.initializeAreaChart();
      }
    });
  }

  /**
   * Método público para actualizar los datos del gráfico
   */
  updateChartData(): void {
    if (this.facturasService) {
      this.subscription?.unsubscribe();
      this.subscription = this.facturasService.updateMockData().subscribe({
        next: (data: IFacturasData) => {
          this.facturasData = data;
          if (this.chart) {
            // Actualizar el gráfico existente con nuevos datos
            const newSeries = [
              {
                name: 'Pagadas',
                data: data.yAxis.facturasPagadas,
              },
              {
                name: 'Pendientes',
                data: data.yAxis.facturasPendientes,
              }
            ];
            this.chart.updateSeries(newSeries);
            this.chart.updateOptions({
              xaxis: {
                categories: data.xAxis
              }
            });
          }
        },
        error: (error: any) => {
          console.error('Error updating chart data:', error);
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
   * Seleccionar período y actualizar gráfico
   */
  selectPeriod(period: string): void {
    this.selectedPeriod = period;
    this.isDropdownOpen = false;
    this.loadDataByPeriod(period);
  }

  /**
   * Cargar datos filtrados por período
   */
  private loadDataByPeriod(period: string): void {
    let mockData: IFacturasData;

    switch(period) {
      case 'Último mes':
        mockData = {
          xAxis: ['Junio'],
          yAxis: {
            facturasPagadas: [150],
            facturasPendientes: [90]
          }
        };
        break;
      case 'Últimos 3 meses':
        mockData = {
          xAxis: ['Abril', 'Mayo', 'Junio'],
          yAxis: {
            facturasPagadas: [145, 130, 150],
            facturasPendientes: [100, 110, 90]
          }
        };
        break;
      case 'Últimos 6 meses':
        mockData = {
          xAxis: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
          yAxis: {
            facturasPagadas: [120, 140, 135, 145, 130, 150],
            facturasPendientes: [80, 95, 85, 100, 110, 90]
          }
        };
        break;
      case 'Último año':
        mockData = {
          xAxis: ['Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
          yAxis: {
            facturasPagadas: [110, 125, 130, 120, 135, 140, 120, 140, 135, 145, 130, 150],
            facturasPendientes: [70, 85, 80, 75, 90, 95, 80, 95, 85, 100, 110, 90]
          }
        };
        break;
      default:
        return;
    }

    // Actualizar los datos y el gráfico
    this.facturasData = mockData;
    if (this.chart) {
      this.chart.updateSeries([
        {
          name: 'Facturas Pagadas',
          data: mockData.yAxis.facturasPagadas,
        },
        {
          name: 'Facturas Pendientes',
          data: mockData.yAxis.facturasPendientes,
        }
      ]);
      this.chart.updateOptions({
        xaxis: {
          categories: mockData.xAxis
        }
      });
    }
  }

  private getOptions(): ChartOptions {
    // Si tenemos datos del servicio, los usamos; sino, datos por defecto
    const series: ChartSeries[] = this.facturasData ? [
      {
        name: 'Pagadas',
        data: this.facturasData.yAxis.facturasPagadas,
        color: '#3B82F6', // Azul como en la imagen
      },
      {
        name: 'Pendientes',
        data: this.facturasData.yAxis.facturasPendientes,
        color: '#8B5CF6', // Morado como en la imagen
      },
    ] : [
      {
        name: 'Ingresos',
        data: [120, 140, 135, 145, 130, 150],
        color: '#3B82F6',
      },
      {
        name: 'Gastos',
        data: [80, 95, 85, 100, 110, 90],
        color: '#8B5CF6',
      },
    ];

    const categories = this.facturasData ?
      this.facturasData.xAxis :
      ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];

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
