import { isPlatformBrowser, CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnDestroy, PLATFORM_ID, input, effect } from '@angular/core';


declare const ApexCharts: any;

interface ChartOptions {
  series: any[];
  chart: {
    height: number;
    type: string;
    toolbar: { show: boolean };
    background: string;
  };
  plotOptions: {
    bar: {
      borderRadius: number;
      dataLabels: {
        position: string;
      };
      columnWidth: string;
    };
  };
  dataLabels: {
    enabled: boolean;
    style: {
      colors: string[];
      fontSize: string;
      fontWeight: string;
    };
    offsetY: number;
  };
  xaxis: {
    categories: string[];
    axisBorder: { show: boolean };
    axisTicks: { show: boolean };
    labels: {
      style: {
        colors: string;
        fontSize: string;
      };
    };
  };
  yaxis: {
    show: boolean;
    min?: number;
    max?: number;
    tickAmount?: number;
    labels: {
      style: {
        colors: string;
        fontSize: string;
      };
    };
  };
  grid: {
    show: boolean;
    strokeDashArray: number;
    borderColor: string;
  };
  colors: string[];
  tooltip: {
    enabled: boolean;
  };
}

@Component({
  selector: 'app-legends-bill-history',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-lg p-1 w-lg h-48">
      <div class="flex items-center">
      </div>
      <div class="relative">
        <div id="consumption-chart" class="w-full bg-white" style="height: 160px;"></div>
        <!-- Valores posicionados más abajo, cerca del eje X -->
        <div class="absolute bottom-0 left-0 right-0 flex justify-around pl-8 pr-1" style="pointer-events: none;">
          <div *ngFor="let price of processedData.prices; let i = index" class="text-center">
            <div class="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded shadow-sm">{{ price }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LegendsHistoryBill implements AfterViewInit, OnDestroy {
  private chart: any;
  protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);

  historyData = input<any[]>([]);

  public processedData = {
    categories: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
    series: [0, 0, 0, 0, 0, 0],
    prices: ['$0', '$0', '$0', '$0', '$0', '$0']
  };

  public readonly emptyData = {
    categories: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
    series: [0, 0, 0, 0, 0, 0],
    prices: ['$0', '$0', '$0', '$0', '$0', '$0']
  };

  constructor() {
    effect(() => {
      const data = this.historyData();
      this.processedData = this.processHistoryData(data);
      if (this.chart) {
        this.updateChartWithHistoryData(data);
      }
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initializeBarChart();
      }, 0);
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  // Método para procesar los datos históricos (cronológicamente de atrás para adelante)
  private processHistoryData(historyData: any[]) {
    if (historyData.length === 0) return this.emptyData;

    // Ordenar datos cronológicamente (de más antiguo a más reciente)
    const sortedData = [...historyData].sort((a, b) => {
      return new Date(a.mes + '-01').getTime() - new Date(b.mes + '-01').getTime();
    });

    const categories = sortedData.map(item => {
      const [, month] = item.mes.split('-');
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return monthNames[parseInt(month) - 1] || month;
    });

    const series = sortedData.map(item => item.consumo || 0);
    const prices = sortedData.map(item => `$${(item.precio || 0).toLocaleString('es-CO')}`);

    return { categories, series, prices };
  }


  private updateChartWithHistoryData(historyData: any[]): void {
    if (!this.chart || historyData.length === 0) return;
    const processedData = this.processHistoryData(historyData);
    this.chart.updateOptions({
      xaxis: {
        categories: processedData.categories
      },
      series: [{
        name: 'Consumo m³',
        data: processedData.series
      }]
    });
  }

  private getOptions(): ChartOptions {
    return {
      series: [{
        name: 'Consumo',
        data: this.processedData.series
      }],
      chart: {
        height: 150,
        type: 'bar',
        toolbar: { show: false },
        background: '#ffffff'
      },
      plotOptions: {
        bar: {
          borderRadius: 5,
          columnWidth: '70%',
          dataLabels: {
            position: 'top'
          }
        }
      },
      dataLabels: {
        enabled: true,
        offsetY: -15,
        style: {
          colors: ['#374151'],
          fontSize: '12px',
          fontWeight: '600'
        }
      },
      xaxis: {
        categories: this.processedData.categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: {
            colors: '#6B7280',
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        show: true,
        min: 0,
        max: 35,
        tickAmount: 4,
        labels: {
          style: {
            colors: '#6B7280',
            fontSize: '11px'
          }
        }
      },
      grid: {
        show: true,
        strokeDashArray: 4,
        borderColor: '#E9E9E9'
      },
      colors: ['#3B82F6'],
      tooltip: {
        enabled: false
      }
    };
  }

  private initializeBarChart(): void {
    const el = document.getElementById('consumption-chart') as HTMLElement;
    if (el && typeof ApexCharts !== 'undefined') {
      this.chart = new ApexCharts(el, this.getOptions());
      this.chart.render().catch((error: any) => {
      });
    }
  }
}
