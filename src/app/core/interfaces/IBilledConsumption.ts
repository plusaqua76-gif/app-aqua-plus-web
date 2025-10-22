// Interface para el endpoint de consumo facturación

export interface IBilledConsumptionPorMes {
  mes: number;
  mcTotal: number;
  valorTotal: number;
  valorUnitario: number;
}

export interface IBilledConsumptionTarifa {
  valorUnitario: number;
  idTarifaConcepto: number;
  idTipoTarifaAcu: number;
  idTipoConceptoCafi: number;
}

export interface IBilledConsumptionPeriodo {
  mes: number | null;
  anio: number;
}

export interface IBilledConsumptionTotales {
  mcTotal: number;
  importeTotal: number;
}

export interface IBilledConsumptionResponse {
  porMes: IBilledConsumptionPorMes[];
  tarifa: IBilledConsumptionTarifa;
  periodo: IBilledConsumptionPeriodo;
  totales: IBilledConsumptionTotales;
  empresa_id: number;
}

export interface IBilledConsumptionApiResponse {
  code: number;
  message: string;
  success: boolean;
  response: IBilledConsumptionResponse;
}

// Interface para datos formateados del gráfico de columnas
export interface IColumnChartData {
  xAxis: string[];
  yAxis: {
    consumoM3: number[];
    facturadoPesos: number[];
  };
}
