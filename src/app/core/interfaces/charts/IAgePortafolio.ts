interface BarSeries {
  name: string;
  data: { x: string; y: number }[];
  color?: string;
}

interface AgePortfolioChartOptions {
  colors: string[];
  series: BarSeries[];
  chart: {
    type: 'bar';
    height: number | string;
    width?: number | string;
    maxWidth?: string;
    fontFamily?: string;
    toolbar: { show: boolean };
    background?: string;
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
    padding: { left: number; right: number; top: number; bottom?: number };
    borderColor?: string;
  };
  dataLabels: {
    enabled: boolean;
    style?: {
      colors: string[];
      fontSize?: string;
      fontWeight?: string | number;
    };
    formatter?: (value: number) => string;
  };
  legend: {
    show: boolean;
  };
  xaxis: {
    type?: 'category';
    categories?: string[];
    labels: {
      show: boolean;
      style?: {
        fontFamily: string;
        colors?: string;
        fontSize?: string;
      };
      formatter?: (value: number) => string;
    };
    axisBorder: { show: boolean };
    axisTicks: { show: boolean };
  };
  yaxis: {
    show: boolean;
    labels?: {
      formatter?: (value: number) => string;
      style?: {
        colors: string;
        fontSize: string;
        fontFamily: string;
      };
    };
  };
  fill: {
    type: string;
    gradient?: {
      shade: string;
      type: string;
      shadeIntensity: number;
      gradientToColors?: string[];
      inverseColors: boolean;
      opacityFrom: number;
      opacityTo: number;
      stops: number[];
    };
  };
}

interface AgePortfolioData {
  '0-30': number;
  '31-60': number;
  '61-90': number;
  '90+': number;
}

interface AgePortfolioInvoiceCount {
  '0-30': number;
  '31-60': number;
  '61-90': number;
  '90+': number;
}
