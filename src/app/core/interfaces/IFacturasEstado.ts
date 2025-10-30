export interface IFacturasEstado {
  pagadas: number;
  pendientes: number;
  vencidas: number;
  total: number;
}

export interface IFacturasEstadoData {
  facturas: IFacturasEstado;
  porcentajes: {
    pagadas: number;
    pendientes: number;
    vencidas: number;
  };
}
