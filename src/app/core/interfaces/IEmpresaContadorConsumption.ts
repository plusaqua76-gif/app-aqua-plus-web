// Interface para el endpoint de consumo empresa-contador

export interface IEmpresaContadorPorMes {
  mes: number;
  mcTotal: number;
  valorTotal: number;
  valorUnitario: number;
}

export interface IEmpresaContadorTarifa {
  valorUnitario: number;
  idTarifaConcepto: number;
  idTipoTarifa_acu: number;
  idTipoConceptoCafi: number;
}

export interface IEmpresaContadorPeriodo {
  mes: number;
  anio: number;
}

export interface IEmpresaContadorTotales {
  mcTotal: number;
  importeTotal: number;
}

export interface IEmpresaContadorResponse {
  porMes: IEmpresaContadorPorMes[];
  tarifa: IEmpresaContadorTarifa;
  periodo: IEmpresaContadorPeriodo;
  totales: IEmpresaContadorTotales;
  empresa_id: number;
}

export interface IEmpresaContadorApiResponse {
  code: number;
  message: string;
  success: boolean;
  response: IEmpresaContadorResponse;
}

// Interface para datos formateados del gráfico
export interface IEmpresaContadorChartData {
  xAxis: string[];
  yAxis: {
    consumoM3: number[];
    facturadoPesos: number[];
  };
}
