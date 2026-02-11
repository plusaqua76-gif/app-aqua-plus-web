import { isPlatformBrowser, DecimalPipe, NgClass, CommonModule } from '@angular/common';
import { ColombianCurrencyPipe } from '../../../shared/pipes/colombian-currency.pipe';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  PLATFORM_ID,
  signal
} from '@angular/core';
import { AccountingService } from '../../../modules/accounting/service/accounting.service';
import { Subscription } from 'rxjs';

declare const ApexCharts: any;

export interface EconomicResultData {
  ingresos: number;
  costos: number;
  gastos: number;
  resultado: number;
  periodo: string;
  fechaInicio: string;
  fechaFin: string;
}

interface HorizontalBarSeries {
  name: string;
  data: number[];
}

interface HorizontalBarChartOptions {
  colors: string[];
  series: HorizontalBarSeries[];
  chart: {
    type: 'bar';
    height: number | string;
    fontFamily?: string;
    toolbar: { show: boolean };
  };
  labels?: string[];
  plotOptions: {
    bar: {
      horizontal: boolean;
      columnWidth?: string;
      barHeight?: string;
      borderRadius: number;
      borderRadiusApplication: 'end' | 'around';
      distributed?: boolean;
    };
  };
  dataLabels: {
    enabled: boolean;
    formatter?: (val: number) => string;
    style?: {
      colors: string[];
      fontSize: string;
      fontWeight: string | number;
    };
  };
  xaxis: {
    min?: number;
    max?: number;
    tickAmount?: number;
    decimalsInFloat?: number;
    labels?: {
      formatter?: (value: string | number) => string;
      style?: {
        colors?: string | string[];
        fontSize?: string;
      };
      rotate?: number;
      hideOverlappingLabels?: boolean;
      trim?: boolean;
      maxTicksLimit?: number;
      rotateAlways?: boolean;
      minHeight?: number;
    };
  };
  yaxis: {
    labels: {
      style?: {
        colors?: string | string[];
        fontSize?: string;
      };
    };
  };
  grid: {
    show: boolean;
    strokeDashArray?: number;
    borderColor?: string;
    xaxis?: { lines: { show: boolean } };
  };
  tooltip: {
    enabled: boolean;
    y?: {
      formatter?: (value: number) => string;
    };
  };
  legend: {
    show: boolean;
  };
  fill?: {
    type?: 'solid' | 'gradient';
    opacity?: number;
    gradient?: {
      shade?: string;
      type?: string;
      shadeIntensity?: number;
      gradientToColors?: string[];
      inverseColors?: boolean;
      opacityFrom?: number;
      opacityTo?: number;
      stops?: number[];
    };
  };
}

@Component({
  selector: 'app-economic-result-chart',
  standalone: true,
  imports: [CommonModule, ColombianCurrencyPipe, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="relative z-10 w-full p-4 pb-3 md:p-6">
  <div class="mb-5">
    <h5 class="leading-none text-3xl font-bold text-gray-900 dark:text-white pb-2">
      Resultado Económico del Mes
    </h5>
    <p class="text-base font-normal text-gray-500 dark:text-gray-400">
      Comparación clara del dinero que entra y el dinero que sale durante el mes
    </p>
  </div>

  @if (data()) {
    <div class="grid grid-cols-2 gap-4 pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
      <dl class="flex flex-col">
        <dt class="text-gray-500 dark:text-gray-400 text-sm font-normal">Período:</dt>
        <dd class="text-gray-900 dark:text-white text-sm font-semibold">{{ formattedPeriod() }}</dd>
      </dl>
      <dl class="flex flex-col items-end">
        <dt class="text-gray-500 dark:text-gray-400 text-sm font-normal">Resultado:</dt>
        <dd class="text-sm font-semibold"
            [ngClass]="resultadoClass()">
          {{ data()!.resultado | colombianCurrency }}
        </dd>
      </dl>
    </div>

    <div [id]="chartId()" class="min-h-[350px]"></div>

    <div class="grid grid-cols-1 items-center border-gray-200 border-t dark:border-gray-700 justify-between mt-5">
      <div class="flex justify-between items-center pt-5 gap-4">

        <div class="year-dropdown-container relative">
          <button
            (click)="toggleYearDropdown()"
            class="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 text-center inline-flex items-center dark:hover:text-white"
            type="button">
            Año: {{ selectedYear() }}
            <svg class="w-2.5 m-2.5 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
            </svg>
          </button>
          <div [class.hidden]="!isYearDropdownOpen" class="absolute bottom-full mb-1 z-50 bg-white divide-y divide-gray-100 rounded-lg shadow-lg w-32 dark:bg-gray-700">
            <ul class="py-2 text-sm text-gray-700 dark:text-gray-200">
              @for (year of availableYears; track year) {
                <li>
                  <button
                    (click)="selectYear(year)"
                    [class.bg-blue-100]="selectedYear() === year"
                    [class.dark:bg-blue-900]="selectedYear() === year"
                    class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">{{ year }}</button>
                </li>
              }
            </ul>
          </div>
        </div>


        <div class="month-dropdown-container relative">
          <button
            (click)="toggleMonthDropdown()"
            class="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 text-center inline-flex items-center dark:hover:text-white"
            type="button">
            {{ selectedMonthName() }}
            <svg class="w-2.5 m-2.5 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
            </svg>
          </button>
          <div [class.hidden]="!isMonthDropdownOpen" class="absolute bottom-full mb-1 z-50 bg-white divide-y divide-gray-100 rounded-lg shadow-lg w-44 dark:bg-gray-700">
            <ul class="py-2 text-sm text-gray-700 dark:text-gray-200">
              @for (month of availableMonths; track month) {
                <li>
                  <button
                    (click)="selectMonth(month)"
                    [class.bg-blue-100]="selectedMonthName() === month"
                    [class.dark:bg-blue-900]="selectedMonthName() === month"
                    class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">{{ month }}</button>
                </li>
              }
            </ul>
          </div>
        </div>
      </div>
    </div>
  } @else {
    <div class="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
      <div class="text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay datos disponibles</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">No se encontraron datos económicos para mostrar.</p>
      </div>
    </div>
  }
</div>
  `
})
export class EconomicResultChartComponent implements AfterViewInit, OnDestroy {
  private chart: any;
  private subscription?: Subscription;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly accountingService = inject(AccountingService);
  private resizeObserver: ResizeObserver | null = null;
  private readonly containerWidth = signal<number>(0);

  //  Inputs con signals
  readonly chartId = input<string>('economic-result-chart-' + Math.random().toString(36).substring(7));
  readonly height = input<number>(350);

  // Signals para manejo reactivo de datos
  public readonly data = signal<EconomicResultData | null>(null);
  public isLoading = signal<boolean>(true);
  public hasError = signal<boolean>(false);

  // Propiedades para los dropdowns
  public isYearDropdownOpen = false;
  public isMonthDropdownOpen = false;
  public selectedYear = signal<number>(new Date().getFullYear());
  public selectedMonth = signal<number>(new Date().getMonth() + 1);
  public availableYears: number[] = [];
  public availableMonths: string[] = [];

  // Computed para obtener datos del usuario
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

  //  Computed signals para valores derivados
  readonly formattedPeriod = computed(() => {
    const currentData = this.data();
    if (!currentData || !currentData.periodo) return '';
    return this.formatPeriod(currentData.periodo);
  });

  readonly resultadoClass = computed(() => {
    const currentData = this.data();
    const resultado = currentData?.resultado ?? 0;
    return resultado >= 0
      ? 'text-green-600 dark:text-green-500'
      : 'text-red-600 dark:text-red-500';
  });

  readonly chartColor = computed(() => {
    const currentData = this.data();
    const resultado = currentData?.resultado ?? 0;
    return resultado >= 0 ? '#0e9f6e' : '#f05252';
  });

  readonly chartValues = computed(() => {
    const currentData = this.data();
    if (!currentData) return [];

    return [
      currentData.ingresos,
      currentData.costos,
      currentData.gastos,
      Math.abs(currentData.resultado)
    ];
  });

  // Computed para mostrar el nombre del mes seleccionado
  readonly selectedMonthName = computed(() => {
    const monthIndex = this.selectedMonth() - 1;
    return this.availableMonths[monthIndex] || 'Enero';
  });

  //  Computed para determinar cuántos ticks mostrar basado en el ancho
  readonly tickAmount = computed(() => {
    const width = this.containerWidth();
    if (width === 0) return 4; // Valor por defecto
    if (width < 300) return 2;  // Solo inicio y fin
    if (width < 450) return 3;  // 3 valores
    if (width < 600) return 4;  // 4 valores
    if (width < 800) return 5;  // 5 valores
    return 6; // 6 valores
  });

  //  Computed para calcular el valor máximo del eje X
  readonly maxXValue = computed(() => {
    const values = this.chartValues();
    if (values.length === 0) return 100000;
    const maxValue = Math.max(...values);
    // Redondear al múltiplo superior más cercano para una escala limpia
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
    return Math.ceil(maxValue / magnitude) * magnitude;
  });

  //  Computed para determinar si debe rotar las etiquetas
  readonly shouldRotateLabels = computed(() => this.containerWidth() < 500);

  // Función para formatear valores en pesos colombianos
  private formatCOP(value: number): string {
    return `$${value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  constructor() {
    //  Effect para actualizar el gráfico cuando cambia el ancho
    effect(() => {
      const width = this.containerWidth();
      if (this.isBrowser && this.chart && width > 0) {
        this.updateChartResponsive();
      }
    });

    // Generar años y meses disponibles
    this.generateAvailableYears();
    this.generateAvailableMonths();
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.loadEconomicData();
      setTimeout(() => {
        this.setupResizeObserver();
      }, 0);
      // Agregar listener para cerrar dropdowns al hacer clic fuera
      document.addEventListener('click', this.closeDropdownOnOutsideClick.bind(this));
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.subscription?.unsubscribe();
    this.resizeObserver?.disconnect();
    if (this.isBrowser) {
      document.removeEventListener('click', this.closeDropdownOnOutsideClick.bind(this));
    }
  }

  private closeDropdownOnOutsideClick(event: Event): void {
    const target = event.target as HTMLElement;
    const yearDropdown = target.closest('.year-dropdown-container');
    const monthDropdown = target.closest('.month-dropdown-container');

    if (!yearDropdown) {
      this.isYearDropdownOpen = false;
    }
    if (!monthDropdown) {
      this.isMonthDropdownOpen = false;
    }
  }

  private generateAvailableYears(): void {
    const currentYear = new Date().getFullYear();
    // Generar últimos 5 años
    this.availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);
  }

  private generateAvailableMonths(): void {
    // Mostrar todos los 12 meses
    this.availableMonths = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
  }

  toggleYearDropdown(): void {
    this.isYearDropdownOpen = !this.isYearDropdownOpen;
    if (this.isYearDropdownOpen) {
      this.isMonthDropdownOpen = false;
    }
  }

  toggleMonthDropdown(): void {
    this.isMonthDropdownOpen = !this.isMonthDropdownOpen;
    if (this.isMonthDropdownOpen) {
      this.isYearDropdownOpen = false;
    }
  }

  selectYear(year: number): void {
    this.selectedYear.set(year);
    this.isYearDropdownOpen = false;
    this.loadEconomicData();
  }

  selectMonth(monthName: string): void {
    const monthIndex = this.availableMonths.indexOf(monthName) + 1;
    this.selectedMonth.set(monthIndex);
    this.isMonthDropdownOpen = false;
    this.loadEconomicData();
  }

  private loadEconomicData(): void {
    const empresaId = this.empresaId();
    const anio = this.selectedYear();
    const mes = this.selectedMonth();

    if (!empresaId || !anio) {
      console.warn('Datos incompletos para cargar resultados:', { empresaId, anio });
      this.isLoading.set(false);
      this.hasError.set(true);
      return;
    }

    this.isLoading.set(true);
    this.subscription?.unsubscribe();
    this.subscription = this.accountingService.getResultadosContables({
      empresa: empresaId,
      año: anio,
      mes: mes,
      cantidadPeriodos: 1
    }).subscribe({
      next: (response) => {
        if (response && response.response) {
          const apiData = response.response;
          const transformed: EconomicResultData = {
            ingresos: apiData.ingresos,
            costos: apiData.costos,
            gastos: apiData.gastos,
            resultado: apiData.resultado,
            periodo: `${apiData.periodo.anio}-${String(apiData.periodo.mes).padStart(2, '0')}`,
            fechaInicio: apiData.periodo.desde,
            fechaFin: apiData.periodo.hasta,
          };
          this.data.set(transformed);
          this.isLoading.set(false);
          this.hasError.set(false);
          setTimeout(() => {
            if (!this.chart) {
              this.initializeChart();
            } else {
              this.updateChart();
            }
          }, 0);
        }
      },
      error: (error: any) => {
        console.error('Error loading economic data:', error);
        this.isLoading.set(false);
        this.hasError.set(true);
        if (!this.chart) {
          this.initializeChart();
        }
      }
    });
  }

  private formatPeriod(periodo: string): string {
    const [year, month] = periodo.split('-');
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const monthIndex = parseInt(month, 10) - 1;
    return `${months[monthIndex]} ${year}`;
  }

  private setupResizeObserver(): void {
    const el = document.getElementById(this.chartId());
    if (!el) return;

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        this.containerWidth.set(width);
      }
    });

    this.resizeObserver.observe(el);
    // Establecer el ancho inicial
    this.containerWidth.set(el.offsetWidth);
  }

  private getOptions(): HorizontalBarChartOptions {
    const values = this.chartValues();
    const currentData = this.data();

    if (!currentData || values.length === 0) {
      return this.getEmptyOptions();
    }

    const resultado = this.data()?.resultado ?? 0;
    const resultGradientColor = resultado >= 0 ? '#22c55e' : '#ef4444';

    return {
      colors: ['#5b59a8', '#6b68b8', '#4a4890', '#5b59a8'],
      series: [{
        name: 'Millones ($)',
        data: values
      }],
      chart: {
        type: 'bar',
        height: this.height(),
        fontFamily: 'Inter, sans-serif',
        toolbar: { show: false }
      },
      labels: ['Ingresos', 'Costos', 'Gastos', 'Resultado'],
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '70%',
          borderRadius: 8,
          borderRadiusApplication: 'end',
          distributed: true
        }
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => this.formatCOP(val),
        style: {
          colors: ['#fff'],
          fontSize: '14px',
          fontWeight: 600
        }
      },
      xaxis: {
        min: 0,
        max: this.maxXValue(),
        tickAmount: this.tickAmount(),
        decimalsInFloat: 0,
        labels: {
          formatter: (value: string | number) => {
            if (typeof value === 'number') {
              // Formatear de manera compacta para pantallas pequeñas
              if (this.containerWidth() < 500) {
                if (value >= 1000000) {
                  return `$${(value / 1000000).toFixed(1)}M`;
                } else if (value >= 1000) {
                  return `$${(value / 1000).toFixed(0)}K`;
                }
              }
              return this.formatCOP(value);
            }
            return value;
          },
          style: {
            colors: '#9CA3AF',
            fontSize: this.containerWidth() < 500 ? '9px' : '11px'
          },
          rotate: this.shouldRotateLabels() ? -45 : 0,
          rotateAlways: this.shouldRotateLabels(),
          hideOverlappingLabels: true,
          trim: true,
          maxTicksLimit: this.tickAmount(),
          minHeight: this.shouldRotateLabels() ? 60 : undefined
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#9CA3AF',
            fontSize: '14px'
          }
        }
      },
      grid: {
        show: true,
        strokeDashArray: 3,
        borderColor: '#374151',
        xaxis: { lines: { show: true } }
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: (value: number) => this.formatCOP(value)
        }
      },
      legend: {
        show: false
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: 'horizontal',
          shadeIntensity: 0.6,
          gradientToColors: ['#2f2d70', '#3d3a85', '#1f1d45', resultGradientColor],
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 0.95,
          stops: [0, 100]
        }
      }
    };
  }

  private getEmptyOptions(): HorizontalBarChartOptions {
    return {
      colors: ['#9CA3AF'],
      series: [{ name: 'Millones ($)', data: [] }],
      chart: {
        type: 'bar',
        height: this.height(),
        fontFamily: 'Inter, sans-serif',
        toolbar: { show: false }
      },
      labels: [],
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '70%',
          borderRadius: 8,
          borderRadiusApplication: 'end'
        }
      },
      dataLabels: { enabled: false },
      xaxis: { min: 0, max: 100000, tickAmount: 5 },
      yaxis: { labels: {} },
      grid: { show: false },
      tooltip: { enabled: false },
      legend: { show: false }
    };
  }

  private initializeChart(): void {
    const el = document.getElementById(this.chartId()) as HTMLElement;
    const hasData = this.data() !== null;

    if (el && ApexCharts !== undefined && hasData) {
      this.chart = new ApexCharts(el, this.getOptions());
      this.chart.render().catch((error: any) => {
        console.error('Error al renderizar gráfico:', error);
      });
    }
  }

  private updateChart(): void {
    if (this.chart) {
      const values = this.chartValues();
      const resultado = this.data()?.resultado ?? 0;
      const resultGradientColor = resultado >= 0 ? '#22c55e' : '#ef4444';

      this.chart.updateSeries([{
        name: 'Millones ($)',
        data: values
      }]);

      this.chart.updateOptions({
        colors: ['#5b59a8', '#6b68b8', '#4a4890', '#5b59a8'],
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            type: 'horizontal',
            shadeIntensity: 0.6,
            gradientToColors: ['#2f2d70', '#3d3a85', '#1f1d45', resultGradientColor],
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 0.95,
            stops: [0, 100]
          }
        }
      });
    }
  }

  private updateChartResponsive(): void {
    if (this.chart) {
      this.chart.updateOptions({
        xaxis: {
          min: 0,
          max: this.maxXValue(),
          tickAmount: this.tickAmount(),
          decimalsInFloat: 0,
          labels: {
            style: {
              fontSize: this.containerWidth() < 500 ? '9px' : '11px'
            },
            rotate: this.shouldRotateLabels() ? -45 : 0,
            rotateAlways: this.shouldRotateLabels(),
            hideOverlappingLabels: true,
            trim: true,
            maxTicksLimit: this.tickAmount(),
            minHeight: this.shouldRotateLabels() ? 60 : undefined
          }
        }
      });
    }
  }
}
