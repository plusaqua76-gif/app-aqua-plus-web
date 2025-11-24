// Interface para el endpoint de consumo empresa-contador

export interface IEmpresaContadorPorMes {
  mes: number;
  mcTotalEmpresa: number;
  mcTotalClientes: number;
}



export interface IEmpresaContadorPeriodo {
  mes: number | null;
  anio: number;
}

export interface IEmpresaContadorTotales {
  mcTotalEmpresa: number;
  mcTotalClientes: number;
}

export interface IEmpresaContadorResponse {
  porMes: IEmpresaContadorPorMes[];
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
    consumoEmpresa: number[];
    consumoClientes: number[];
  };
}
