export interface IFacturasData {
  xAxis: string[];
  yAxis: {
    facturasPagadas: number[];
    facturasPendientes: number[];
    facturasVencidas: number[];
  };
  totalMontoPagadas?: number;
  totalMontoPendientes?: number;
  totalMontoVencidas?: number;
  totalMontoRecaudado?: number;
}

export interface IFacturasSeries {
  name: string;
  data: number[];
  color?: string;
}
