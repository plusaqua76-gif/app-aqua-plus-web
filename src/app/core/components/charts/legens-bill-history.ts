import { isPlatformBrowser, CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnDestroy, PLATFORM_ID } from '@angular/core';


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
        <div class="flex items-center">
          <div class="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <h5 class="text-sm font-semibold text-gray-900">Historial de consumo</h5>
        </div>
      </div>
      <div id="consumption-chart" class="w-full bg-white" style="height: 140px; margin-bottom: -10px;"></div>
      <div class="flex justify-end gap-3.5 mr-4" style="margin-top: -15px;">
        <div *ngFor="let price of consumptionData.prices; let i = index">
          <div class="text-xs text-green-600 font-medium bg-green-50 py-1 rounded text-center" style="width: 60px;">{{ price }}</div>
        </div>
      </div>
    </div>
  `,
})
export class LegendsHistoryBill implements AfterViewInit, OnDestroy {
  private chart: any;
  protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);

  // Datos de prueba que coinciden con la imagen
  public readonly consumptionData = {
    categories: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
    series: [12, 32, 22, 25, 8, 22],
    prices: ['$34.454', '$34.454', '$34.454', '$34.454', '$34.454', '$34.454']
  };

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

  private getOptions(): ChartOptions {
    return {
      series: [{
        name: 'Consumo',
        data: this.consumptionData.series
      }],
      chart: {
        height: 140,
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
        categories: this.consumptionData.categories,
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
        console.error('Error rendering consumption chart:', error);
      });
    } else {
      console.error('ApexCharts no está cargado o falta el elemento #consumption-chart');
    }
  }
}
