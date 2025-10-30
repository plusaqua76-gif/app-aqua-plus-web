export interface IFacturasMesPeriodo {
  mes: number | null;
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
  porMes?: IFacturasPorMesDetalle[]; // Para respuesta anual
}

// Nueva interface para los datos por mes en la respuesta anual
export interface IFacturasPorMesDetalle {
  mes: number;
  pagadas: IFacturasMesDetalle;
  vencidas: IFacturasMesDetalle;
  pendientes: IFacturasMesDetalle;
}

export interface IFacturasAnualResponse {
  empresa_id: number;
  anio: number;
  meses: IFacturasMesResponse[];
}
