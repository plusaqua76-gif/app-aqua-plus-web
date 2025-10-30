import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { FacturasEstadoService } from '@services/facturas-estado.service';
import { IFacturasEstadoData } from '@interfaces/IFacturasEstado';
import { Subscription } from 'rxjs';

// Declaración global para ApexCharts
declare const ApexCharts: any;

// Interfaces para tipado
interface ChartOptions {
  series: number[];
  colors: string[];
  chart: {
    height: number;
    width: string;
    type: string;
  };
  stroke: {
    colors: string[];
    lineCap: string;
  };
  plotOptions: {
    pie: {
      donut: {
        labels: {
          show: boolean;
          name: {
            show: boolean;
            fontFamily: string;
            offsetY: number;
          };
          total: {
            showAlways: boolean;
            show: boolean;
            label: string;
            fontFamily: string;
            formatter: (w: any) => string;
          };
          value: {
            show: boolean;
            fontFamily: string;
            offsetY: number;
            formatter: (value: string) => string;
          };
        };
        size: string;
      };
    };
  };
  grid: {
    padding: {
      top: number;
    };
  };
  labels: string[];
  dataLabels: {
    enabled: boolean;
  };
  legend: {
    position: string;
    fontFamily: string;
  };
  yaxis: {
    labels: {
      formatter: (value: number) => string;
    };
  };
  xaxis: {
    labels: {
      formatter: (value: string) => string;
    };
    axisTicks: {
      show: boolean;
    };
    axisBorder: {
      show: boolean;
    };
  };
}

@Component({
  selector: 'app-donut-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="max-w-sm w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
  <div class="flex justify-between mb-3">
      <div class="flex justify-center items-center">
          <div class="flex items-center">
            <!-- Icono de documento de Tailwind -->
            <!-- <svg class="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
            </svg> -->
            <h5 class="text-xl font-bold leading-none text-gray-900 dark:text-white pe-1">Facturas por estado</h5>
          </div>
          <svg data-popover-target="chart-info" data-popover-placement="bottom" class="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm0 16a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm1-5.034V12a1 1 0 0 1-2 0v-1.418a1 1 0 0 1 1.038-.999 1.436 1.436 0 0 0 1.488-1.441 1.501 1.501 0 1 0-3-.116.986.986 0 0 1-1.037.961 1 1 0 0 1-.96-1.037A3.5 3.5 0 1 1 11 11.466Z"/>
          </svg>
          <div data-popover id="chart-info" role="tooltip" class="absolute z-10 invisible inline-block text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-xs opacity-0 w-72 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400">
              <div class="p-3 space-y-2">
                  <h3 class="font-semibold text-gray-900 dark:text-white">Estado de facturación</h3>
                  <p><span class="inline-flex items-center"><svg class="w-3 h-3 text-blue-500 mr-1" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10"/></svg> <strong>Pagadas:</strong></span> Facturas canceladas dentro del ciclo actual.</p>
                  <p><span class="inline-flex items-center"><svg class="w-3 h-3 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10"/></svg> <strong>Pendientes:</strong></span> Facturas emitidas que aún no vencen.</p>
                  <p><span class="inline-flex items-center"><svg class="w-3 h-3 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10"/></svg> <strong>Vencidas:</strong></span> Facturas que pasaron su fecha límite sin pago.</p>
                  <p class="text-xs text-gray-400">El centro muestra el total de facturas emitidas en el ciclo actual.</p>
              </div>
              <div data-popper-arrow></div>
          </div>
      </div>
      <div>
        <button
          (click)="updateChartData()"
          type="button"
          data-tooltip-target="data-tooltip"
          data-tooltip-placement="bottom"
          class="hidden sm:inline-flex items-center justify-center text-gray-500 w-8 h-8 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm">
          <!-- Icono de actualizar de Tailwind -->
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <span class="sr-only">Actualizar datos</span>
        </button>
        <div id="data-tooltip" role="tooltip" class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
            Actualizar datos
            <div class="tooltip-arrow" data-popper-arrow></div>
        </div>
      </div>
  </div>

  <!-- Estado de las facturas -->
  <div class="mb-4">
    <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
      <div class="flex items-center">
        <!-- Icono de check circle para pagadas -->
        <svg class="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        <span>Pagadas: <strong>{{ currentData?.facturas?.pagadas || 0 }}</strong> ({{ currentData?.porcentajes?.pagadas || 0 }}%)</span>
      </div>
    </div>
    <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
      <div class="flex items-center">
        <!-- Icono de clock para pendientes -->
        <svg class="w-4 h-4 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
        </svg>
        <span>Pendientes: <strong>{{ currentData?.facturas?.pendientes || 0 }}</strong> ({{ currentData?.porcentajes?.pendientes || 0 }}%)</span>
      </div>
    </div>
    <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
      <div class="flex items-center">
        <!-- Icono de x circle para vencidas -->
        <svg class="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
        </svg>
        <span>Vencidas: <strong>{{ currentData?.facturas?.vencidas || 0 }}</strong> ({{ currentData?.porcentajes?.vencidas || 0 }}%)</span>
      </div>
    </div>
  </div>

  <!-- Donut Chart -->
  <div class="py-6" id="donut-chart"></div>

  <div class="grid grid-cols-1 items-center border-gray-200 border-t dark:border-gray-700 justify-between">
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
                <button (click)="selectPeriod('Enero')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Enero</button>
              </li>
              <li>
                <button (click)="selectPeriod('Febrero')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Febrero</button>
              </li>
              <li>
                <button (click)="selectPeriod('Marzo')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Marzo</button>
              </li>
              <li>
                <button (click)="selectPeriod('Abril')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Abril</button>
              </li>
              <li>
                <button (click)="selectPeriod('Mayo')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Mayo</button>
              </li>
              <li>
                <button (click)="selectPeriod('Junio')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Junio</button>
              </li>
              <li>
                <button (click)="selectPeriod('Julio')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Julio</button>
              </li>
              <li>
                <button (click)="selectPeriod('Agosto')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Agosto</button>
              </li>
              <li>
                <button (click)="selectPeriod('Septiembre')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Septiembre</button>
              </li>
              <li>
                <button (click)="selectPeriod('Octubre')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Octubre</button>
              </li>
              <li>
                <button (click)="selectPeriod('Noviembre')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Noviembre</button>
              </li>
              <li>
                <button (click)="selectPeriod('Diciembre')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Diciembre</button>
              </li>
            </ul>
        </div>
      </div>
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
`
})
export class DonutChartComponent implements AfterViewInit, OnDestroy {
  private chart: any;
  private subscription?: Subscription;
  currentData: IFacturasEstadoData | null = null;

  // Propiedades para el dropdown
  public isDropdownOpen = false;
  public selectedPeriod = 'Junio';

  private readonly platformId = inject(PLATFORM_ID);
  private readonly facturasEstadoService = inject(FacturasEstadoService);

  constructor() {
    // No inicializar en constructor para componentes standalone
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadFacturasEstadoData();
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

  private loadFacturasEstadoData(): void {
    this.subscription = this.facturasEstadoService.getFacturasEstadoData().subscribe({
      next: (data: IFacturasEstadoData) => {
        this.currentData = data;
        // Usar setTimeout para asegurar que ApexCharts esté completamente cargado
        setTimeout(() => {
          this.initializeDonutChart();
        }, 0);
      },
      error: (error: any) => {
        this.initializeDonutChart();
      }
    });
  }

  /**
   * Método público para actualizar los datos del gráfico
   */
  updateChartData(): void {
    if (this.facturasEstadoService) {
      this.subscription?.unsubscribe();
      this.subscription = this.facturasEstadoService.updateMockData().subscribe({
        next: (data: IFacturasEstadoData) => {
          this.currentData = data;
          if (this.chart) {
            // Actualizar el gráfico existente con nuevos datos
            const newSeries = [
              data.facturas.pagadas,
              data.facturas.pendientes,
              data.facturas.vencidas
            ];
            this.chart.updateSeries(newSeries);
          }
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
    this.subscription?.unsubscribe();
    this.subscription = this.facturasEstadoService.getFacturasEstadoByPeriod(period).subscribe({
      next: (data: IFacturasEstadoData) => {
        this.currentData = data;
        if (this.chart) {
          const newSeries = [
            data.facturas.pagadas,
            data.facturas.pendientes,
            data.facturas.vencidas
          ];
          this.chart.updateSeries(newSeries);
        }
      }
    });
  }

  getChartOptions(): ChartOptions {
    // Si tenemos datos del servicio, los usamos; sino, datos por defecto
    const series = this.currentData ? [
      this.currentData.facturas.pagadas,
      this.currentData.facturas.pendientes,
      this.currentData.facturas.vencidas
    ] : [850, 250, 100];

    const total = this.currentData ? this.currentData.facturas.total : 1200;

    return {
      series,
      colors: ["#3B82F6", "#F59E0B", "#EF4444"], // Azul, Amarillo, Rojo
      chart: {
        height: 320,
        width: "100%",
        type: "donut",
      },
      stroke: {
        colors: ["transparent"],
        lineCap: "",
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              name: {
                show: true,
                fontFamily: "Inter, sans-serif",
                offsetY: 20,
              },
              total: {
                showAlways: true,
                show: true,
                label: "Facturas emitidas",
                fontFamily: "Inter, sans-serif",
                formatter: function (): string {
                  return total.toString();
                },
              },
              value: {
                show: true,
                fontFamily: "Inter, sans-serif",
                offsetY: -20,
                formatter: function (value: string): string {
                  return value;
                },
              },
            },
            size: "80%",
          },
        },
      },
      grid: {
        padding: {
          top: -2,
        },
      },
      labels: ["Pagadas", "Pendientes", "Vencidas"],
      dataLabels: {
        enabled: false,
      },
      legend: {
        position: "bottom",
        fontFamily: "Inter, sans-serif",
      },
      yaxis: {
        labels: {
          formatter: function (value: number): string {
            return value.toString();
          },
        },
      },
      xaxis: {
        labels: {
          formatter: function (value: string): string {
            return value;
          },
        },
        axisTicks: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
      },
    };
  }

  // Inicialización del gráfico
  initializeDonutChart(): void {
    const chartElement = document.getElementById("donut-chart") as HTMLElement;

    if (chartElement && typeof ApexCharts !== 'undefined') {
      this.chart = new ApexCharts(chartElement, this.getChartOptions());
      this.chart.render().catch((error: any) => {
      });
    }
  }
}

