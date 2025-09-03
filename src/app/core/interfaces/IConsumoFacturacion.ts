export interface IConsumoFacturacion {
  xAxis: string[];
  yAxis: {
    consumoM3: number[];
    facturadoPesos: number[];
  };
}

export interface IConsumoFacturacionSeries {
  name: string;
  data: { x: string; y: number }[];
  color?: string;
}
