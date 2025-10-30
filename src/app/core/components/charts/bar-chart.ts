import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID } from '@angular/core';
import { ApexOptions } from 'apexcharts';


declare var ApexCharts: any;

interface BarSeries {
  name: string;
  color?: string;
  data: number[];
}
interface BarChartOptions {
  series: BarSeries[];
  chart: {
    sparkline: { enabled: boolean };
    type: 'bar';
    width: string;
    height: number;
    toolbar: { show: boolean };
  };
  fill: { opacity: number };
  plotOptions: {
    bar: {
      horizontal: boolean;
      columnWidth: string;
      borderRadiusApplication: 'end' | 'around';
      borderRadius: number;
      dataLabels: { position: 'top' | 'center' | 'bottom' };
    };
  };
  legend: { show: boolean; position: 'bottom' | 'top' | 'left' | 'right' };
  dataLabels: { enabled: boolean };
  tooltip: {
    shared: boolean;
    intersect: boolean;
    y: { formatter: (value: number) => string };
  };
  xaxis: {
    labels: {
      show: boolean;
      style: { fontFamily: string; cssClass: string };
      formatter: (value: string | number) => string;
    };
    categories: string[];
    axisTicks: { show: boolean };
    axisBorder: { show: boolean };
  };
  yaxis: {
    labels: { show: boolean; style: { fontFamily: string; cssClass: string } };
  };
  grid: {
    show: boolean;
    strokeDashArray: number;
    padding: { left: number; right: number; top: number };
  };
}

/* Serie (usa números, no strings) */
const seriesData: BarSeries[] = [
  { name: 'Income',  color: '#31C48D', data: [1420, 1620, 1820, 1420, 1650, 2120] },
  { name: 'Expense', color: '#F05252', data: [ 788,  810,  866,  788, 1100, 1200] },
];

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `

<div class="max-w-sm w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
  <div class="flex justify-between border-gray-200 border-b dark:border-gray-700 pb-3">
    <dl>
      <dt class="text-base font-normal text-gray-500 dark:text-gray-400 pb-1">Profit</dt>
      <dd class="leading-none text-3xl font-bold text-gray-900 dark:text-white">$5,405</dd>
    </dl>
    <div>
      <span class="bg-green-100 text-green-800 text-xs font-medium inline-flex items-center px-2.5 py-1 rounded-md dark:bg-green-900 dark:text-green-300">
        <svg class="w-2.5 h-2.5 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 14">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13V1m0 0L1 5m4-4 4 4"/>
        </svg>
        Profit rate 23.5%
      </span>
    </div>
  </div>

  <div class="grid grid-cols-2 py-3">
    <dl>
      <dt class="text-base font-normal text-gray-500 dark:text-gray-400 pb-1">Income</dt>
      <dd class="leading-none text-xl font-bold text-green-500 dark:text-green-400">$23,635</dd>
    </dl>
    <dl>
      <dt class="text-base font-normal text-gray-500 dark:text-gray-400 pb-1">Expense</dt>
      <dd class="leading-none text-xl font-bold text-red-600 dark:text-red-500">-$18,230</dd>
    </dl>
  </div>

  <div id="bar-chart"></div>
    <div class="grid grid-cols-1 items-center border-gray-200 border-t dark:border-gray-700 justify-between">
      <div class="flex justify-between items-center pt-5">
        <!-- Button -->
        <button
          id="dropdownDefaultButton"
          data-dropdown-toggle="lastDaysdropdown"
          data-dropdown-placement="bottom"
          class="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 text-center inline-flex items-center dark:hover:text-white"
          type="button">
          Last 6 months
          <svg class="w-2.5 m-2.5 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
          </svg>
        </button>
        <!-- Dropdown menu -->
        <div id="lastDaysdropdown" class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700">
            <ul class="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
              <li>
                <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Yesterday</a>
              </li>
              <li>
                <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Today</a>
              </li>
              <li>
                <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Last 7 days</a>
              </li>
              <li>
                <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Last 30 days</a>
              </li>
              <li>
                <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Last 90 days</a>
              </li>
              <li>
                <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Last 6 months</a>
              </li>
              <li>
                <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Last year</a>
              </li>
            </ul>
        </div>
        <a
          href="#"
          class="uppercase text-sm font-semibold inline-flex items-center rounded-lg text-blue-600 hover:text-blue-700 dark:hover:text-blue-500  hover:bg-gray-100 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700 px-3 py-2">
          Revenue Report
          <svg class="w-2.5 h-2.5 ms-1.5 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
          </svg>
        </a>
      </div>
    </div>
</div>

  `,
})
export class BarChartComponent  {

private chart: any;

  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeBarChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private getChartOptions(): BarChartOptions {
    return {
      series: seriesData,
      chart: {
        sparkline: { enabled: false },
        type: 'bar',
        width: '100%',
        height: 400,
        toolbar: { show: false },
      },
      fill: { opacity: 1 },
      plotOptions: {
        bar: {
          horizontal: true,
          columnWidth: '100%',
          borderRadiusApplication: 'end',
          borderRadius: 6,
          dataLabels: { position: 'top' },
        },
      },
      legend: { show: true, position: 'bottom' },
      dataLabels: { enabled: false },
      tooltip: {
        shared: true,
        intersect: false,
        y: { formatter: (value: number) => `$${value}` }, // tooltip.y.formatter
      },
      xaxis: {
        categories: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], // xaxis categories
        labels: {
          show: true,
          style: {
            fontFamily: 'Inter, sans-serif',
            cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400',
          },
          formatter: (value: string | number) => `$${value}`,
        },
        axisTicks: { show: false },
        axisBorder: { show: false },
      },
      yaxis: {
        labels: {
          show: true,
          style: {
            fontFamily: 'Inter, sans-serif',
            cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400',
          },
        },
      },
      grid: {
        show: true,
        strokeDashArray: 4,
        padding: { left: 2, right: 2, top: -20 },
      },
    };
  }

  private initializeBarChart(): void {
    const el = document.getElementById('bar-chart') as HTMLElement;
    if (el && typeof ApexCharts !== 'undefined') {
      this.chart = new ApexCharts(el, this.getChartOptions());
      this.chart.render();
    }
  }
}
