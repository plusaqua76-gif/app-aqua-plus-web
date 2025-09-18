export interface IFacturasMesPeriodo {
  mes: number;
  anio: number;
  desde: string;
  hasta: string;
}

export interface IFacturasMesDetalle {
  total: number;
  totalMonto: number;
}

export interface IFacturasMesResponse {
  periodo: IFacturasMesPeriodo;
  empresa_id: number;
  facturasPagadas: IFacturasMesDetalle;
  facturasVencidas: IFacturasMesDetalle;
  facturasPendientes: IFacturasMesDetalle;
}

export interface IFacturasAnualResponse {
  empresa_id: number;
  anio: number;
  meses: IFacturasMesResponse[];
}
