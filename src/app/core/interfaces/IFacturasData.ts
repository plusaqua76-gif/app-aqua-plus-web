export interface IFacturasData {
  xAxis: string[];
  yAxis: {
    facturasPagadas: number[];
    facturasPendientes: number[];
    facturasVencidas: number[];
  };
}

export interface IFacturasSeries {
  name: string;
  data: number[];
  color?: string;
}
