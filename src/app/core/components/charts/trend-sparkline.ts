import { isPlatformBrowser } from '@angular/common';
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
  signal,
} from '@angular/core';

declare const ApexCharts: any;

export interface PeriodoData {
  valor: number;
  periodo: string;
}

export type TrendDirection = 'up' | 'down' | 'neutral';

interface SparklineOptions {
  series: { data: number[] }[];
  chart: {
    type: 'area' | 'line';
    height: number | string;
    width: string | number;
    sparkline: { enabled: boolean };
    animations: {
      enabled: boolean;
      easing: string;
      speed: number;
    };
  };
  stroke: {
    curve: 'smooth' | 'straight';
    width: number;
  };
  fill: {
    type: 'gradient';
    gradient: {
      shadeIntensity: number;
      opacityFrom: number;
      opacityTo: number;
      stops: number[];
    };
  };
  colors: string[];
  xaxis: {
    categories: string[];
  };
  tooltip: {
    enabled: boolean;
    theme: string;
    x: { show: boolean };
    y: {
      formatter: (value: number) => string;
      title: {
        formatter: (seriesName: string, opts: any) => string;
      };
    };
  };
}

@Component({
  selector: 'app-trend-sparkline',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [id]="chartId()"
      [style.width]="getStyleWidth()"
      [style.height]="getStyleHeight()"
      class="w-full relative z-50">
    </div>
  `,
})
export class TrendSparklineComponent implements AfterViewInit, OnDestroy {
  private chart: any;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Inputs con signals
  readonly periodos = input<PeriodoData[]>([]);
  readonly tendencia = input<TrendDirection>('neutral');
  readonly width = input<number | string>('100%');
  readonly height = input<number | string | undefined>(undefined);
  readonly chartId = input<string>('trend-sparkline-' + Math.random().toString(36).substring(7));

  // Signal para height responsive automático
  private readonly responsiveHeight = computed(() => {
    const customHeight = this.height();
    if (customHeight !== undefined) return customHeight;

    // Valores por defecto responsive para SSR
    if (!this.isBrowser) return 45;

    const width = window.innerWidth;
    if (width < 640) return 30;
    if (width < 768) return 38;
    if (width < 1024) return 45;
    return 50;
  });

  // Signal interno para los valores procesados
  private readonly processedValues = computed(() => {
    const data = this.periodos();
    if (!data?.length) return [];
    return data.map((p) => p.valor);
  });

  // Signal para los nombres de los meses
  private readonly processedCategories = computed(() => {
    const data = this.periodos();
    if (!data?.length) return [];
    return data.map((p) => this.formatPeriodToMonth(p.periodo));
  });

  // Color basado en la tendencia
  private readonly trendColor = computed(() => {
    switch (this.tendencia()) {
      case 'up':
        return '#10B981'; // Emerald-500
      case 'down':
        return '#EF4444'; // Red-500
      default:
        return '#1C64F2'; // Blue-600
    }
  });

  constructor() {
    effect(() => {
      const values = this.processedValues();
      if (this.isBrowser && this.chart && values.length > 0) {
        this.updateChart(values);
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      setTimeout(() => {
        this.initializeChart();
      }, 0);
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private getChartOptions(): SparklineOptions {
    const values = this.processedValues();
    const categories = this.processedCategories();
    const color = this.trendColor();

    return {
      series: [
        {
          data: values.length > 0 ? values : [0],
        },
      ],
      chart: {
        type: 'area',
        height: this.responsiveHeight(),
        width: this.width(),
        sparkline: {
          enabled: true,
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
        },
      },
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [0, 100],
        },
      },
      colors: [color],
      xaxis: {
        categories: categories.length > 0 ? categories : [''],
      },
      tooltip: {
        enabled: true,
        theme: 'dark',
        x: {
          show: false,
        },
        y: {
          formatter: (value: number) => this.formatValue(value),
          title: {
            formatter: (_seriesName: string, opts: any) => {
              const idx = opts.dataPointIndex;
              return categories[idx] ? categories[idx] + ':' : '';
            },
          },
        },
      },
    };
  }

  private initializeChart(): void {
    const el = document.getElementById(this.chartId()) as HTMLElement;
    if (el && ApexCharts !== undefined) {
      this.chart = new ApexCharts(el, this.getChartOptions());
      this.chart.render().catch((error: any) => {
        console.error('Error rendering trend sparkline chart:', error);
      });
    }
  }

  private updateChart(values: number[]): void {
    if (this.chart) {
      const color = this.trendColor();

      this.chart.updateSeries([{ data: values }]);
      this.chart.updateOptions({
        colors: [color],
      });
    }
  }

  private formatValue(value: number): string {
    if (value >= 1e9) {
      return (value / 1e9).toFixed(2) + 'B';
    }
    if (value >= 1e6) {
      return (value / 1e6).toFixed(2) + 'M';
    }
    if (value >= 1e3) {
      return (value / 1e3).toFixed(2) + 'K';
    }
    return value.toFixed(0);
  }

  private formatPeriodToMonth(periodo: string): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const parts = periodo.split('-');
    if (parts.length >= 2) {
      const monthIndex = parseInt(parts[1], 10) - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        return `${meses[monthIndex]}`;
      }
    }
    return periodo;
  }


  getStyleWidth(): string {
    const w = this.width();
    return typeof w === 'string' ? w : `${w}px`;
  }

  getStyleHeight(): string {
    const h = this.responsiveHeight();
    return typeof h === 'string' ? h : `${h}px`;
  }
}
