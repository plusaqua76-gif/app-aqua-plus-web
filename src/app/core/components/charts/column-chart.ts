import { isPlatformBrowser, NgClass, DecimalPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { ConsumoFacturacionService } from '@services/consumo-facturacion.service';
import { IConsumoFacturacion } from '@interfaces/IConsumoFacturacion';
import { Subscription } from 'rxjs';

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
  imports: [NgClass, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
  <div class="flex justify-between mb-5">
    <div>
      <h5 class="leading-none text-3xl font-bold text-gray-900 dark:text-white pb-2">Consumo vs Facturación</h5>
      <p class="text-base font-normal text-gray-500 dark:text-gray-400">Comparación entre consumo en m³ y monto facturado</p>
    </div>
    <div class="flex items-center px-2.5 py-0.5 text-base font-semibold text-center"
         [ngClass]="eficienciaPercentage >= 80 ? 'text-green-500 dark:text-green-500' : eficienciaPercentage >= 60 ? 'text-yellow-500 dark:text-yellow-500' : 'text-red-500 dark:text-red-500'">
      {{ eficienciaPercentage }}%
      <svg class="w-3 h-3 ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 14"
           [ngClass]="eficienciaPercentage >= 70 ? 'rotate-0' : 'rotate-180'">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13V1m0 0L1 5m4-4 4 4"/>
      </svg>
    </div>
  </div>

  <div class="grid grid-cols-2 pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
    <dl class="flex items-center">
      <dt class="text-gray-500 dark:text-gray-400 text-sm font-normal me-1">Total Consumo:</dt>
      <dd class="text-gray-900 dark:text-white text-sm font-semibold">{{ totalConsumo }} m³</dd>
    </dl>
    <dl class="flex items-center justify-end">
      <dt class="text-gray-500 dark:text-gray-400 text-sm font-normal me-1">Total Facturado:</dt>
      <dd class="text-gray-900 dark:text-white text-sm font-semibold">\${{ totalFacturado | number:'1.0-0' }}</dd>
    </dl>
  </div>

  <div id="column-chart"></div>

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
                <button (click)="selectPeriod('Último día')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Último día</button>
              </li>
              <li>
                <button (click)="selectPeriod('Últimos 3 días')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Últimos 3 días</button>
              </li>
              <li>
                <button (click)="selectPeriod('Últimos 7 días')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Últimos 7 días</button>
              </li>
              <li>
                <button (click)="selectPeriod('Últimos 30 días')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Últimos 30 días</button>
              </li>
              <li>
                <button (click)="selectPeriod('Últimos 90 días')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Últimos 90 días</button>
              </li>
            </ul>
        </div>
      </div>

      <button
        (click)="updateChartData()"
        class="ml-2 uppercase text-sm font-semibold inline-flex items-center rounded-lg text-blue-600 hover:text-blue-700 dark:hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700 px-3 py-2">
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
export class ColumnChartCardComponent implements AfterViewInit, OnDestroy {
  private chart: any;
  private subscription?: Subscription;
  private consumoData: IConsumoFacturacion | null = null;

  // Propiedades para el dropdown
  public isDropdownOpen = false;
  public selectedPeriod = 'Últimos 7 días';

  // Propiedades calculadas
  public totalConsumo = 0;
  public totalFacturado = 0;
  public eficienciaPercentage = 0;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly consumoService = inject(ConsumoFacturacionService);

  constructor() {
    // No inicializar en constructor para componentes standalone
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
    this.subscription = this.consumoService.getConsumoFacturacionData().subscribe({
      next: (data: IConsumoFacturacion) => {
        this.consumoData = data;
        this.calculateTotals();
        // Usar setTimeout para asegurar que ApexCharts esté completamente cargado
        setTimeout(() => {
          this.initializeColumnChart();
        }, 0);
      },
      error: (error: any) => {
        console.error('Error loading consumo data:', error);
        // Fallback a datos por defecto
        this.initializeColumnChart();
      }
    });
  }

  /**
   * Calcular totales y eficiencia
   */
  private calculateTotals(): void {
    if (this.consumoData) {
      this.totalConsumo = this.consumoData.yAxis.consumoM3.reduce((a, b) => a + b, 0);
      this.totalFacturado = this.consumoData.yAxis.facturadoPesos.reduce((a, b) => a + b, 0);
      this.eficienciaPercentage = this.consumoService.calcularEficiencia();
    }
  }

  /**
   * Método público para actualizar los datos del gráfico
   */
  updateChartData(): void {
    if (this.consumoService) {
      this.subscription?.unsubscribe();
      this.subscription = this.consumoService.updateMockData().subscribe({
        next: (data: IConsumoFacturacion) => {
          this.consumoData = data;
          this.calculateTotals();
          if (this.chart) {
            // Actualizar el gráfico existente con nuevos datos
            const newSeries = [
              {
                name: 'Consumo (m³)',
                data: data.xAxis.map((x, i) => ({ x, y: data.yAxis.consumoM3[i] })),
              },
              {
                name: 'Facturado ($)',
                data: data.xAxis.map((x, i) => ({ x, y: Math.round(data.yAxis.facturadoPesos[i] / 1000) })), // Dividir por 1000 para mejor visualización
              }
            ];
            this.chart.updateSeries(newSeries);
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
    this.subscription?.unsubscribe();
    this.subscription = this.consumoService.getConsumoFacturacionByPeriod(period).subscribe({
      next: (data: IConsumoFacturacion) => {
        this.consumoData = data;
        this.calculateTotals();
        if (this.chart) {
          const newSeries = [
            {
              name: 'Consumo (m³)',
              data: data.xAxis.map((x, i) => ({ x, y: data.yAxis.consumoM3[i] })),
            },
            {
              name: 'Facturado (miles $)',
              data: data.xAxis.map((x, i) => ({ x, y: Math.round(data.yAxis.facturadoPesos[i] / 1000) })),
            }
          ];
          this.chart.updateSeries(newSeries);
        }
      },
      error: (error: any) => {
        console.error('Error loading period data:', error);
      }
    });
  }

  private getOptions(): ColumnChartOptions {
    // Si tenemos datos del servicio, los usamos; sino, datos por defecto
    const series: ColumnSeries[] = this.consumoData ? [
      {
        name: 'Consumo (m³)',
        data: this.consumoData.xAxis.map((x, i) => ({ x, y: this.consumoData!.yAxis.consumoM3[i] })),
        color: '#1A56DB', // Azul para consumo
      },
      {
        name: 'Facturado (miles $)',
        data: this.consumoData.xAxis.map((x, i) => ({ x, y: Math.round(this.consumoData!.yAxis.facturadoPesos[i] / 1000) })), // Dividir por 1000
        color: '#FDBA8C', // Naranja para facturación
      },
    ] : [
      {
        name: 'Consumo (m³)',
        data: [
          { x: 'Lun', y: 150 },
          { x: 'Mar', y: 180 },
          { x: 'Mié', y: 165 },
          { x: 'Jue', y: 195 },
          { x: 'Vie', y: 220 },
          { x: 'Sáb', y: 240 },
          { x: 'Dom', y: 190 },
        ],
        color: '#1A56DB',
      },
      {
        name: 'Facturado (miles $)',
        data: [
          { x: 'Lun', y: 230 },
          { x: 'Mar', y: 280 },
          { x: 'Mié', y: 255 },
          { x: 'Jue', y: 305 },
          { x: 'Vie', y: 340 },
          { x: 'Sáb', y: 370 },
          { x: 'Dom', y: 295 },
        ],
        color: '#FDBA8C',
      },
    ];

    return {
      colors: ['#1A56DB', '#FDBA8C'],
      series,
      chart: {
        type: 'bar',
        height: 280,
        maxWidth: '100%',
        fontFamily: 'Inter, sans-serif',
        toolbar: { show: false },
        dropShadow: { enabled: false },
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
            const seriesName = opts?.series?.[opts.seriesIndex]?.name || '';
            if (seriesName.includes('Facturado')) {
              return `$${value}k`;
            }
            return `${value} m³`;
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
          formatter: (value: number) => `${value}`,
          offsetX: -7,
        },
      },
      fill: { opacity: 1 },
    };
  }

  private initializeColumnChart(): void {
    const el = document.getElementById('column-chart') as HTMLElement;
    if (el && typeof ApexCharts !== 'undefined') {
      this.chart = new ApexCharts(el, this.getOptions());
      this.chart.render().catch((error: any) => {
        console.error('Error rendering column chart:', error);
      });
    } else {
      console.error('ApexCharts no está cargado o falta el elemento #column-chart');
    }
  }
}
