
export interface Periodo {
  mes: number;
  anio: number;
  desde: string;
  hasta: string;
}

export interface IResultsAccounting {
  costos: number;
  gastos: number;
  periodo: Periodo;
  ingresos: number;
  resultado: number;
  empresa_id: number;
  ultimaActualizacion: string;
}

export interface IndicadoresFinancieros {
  coberturaGastosOperativos: number;
  recaudoPorcentaje: number;
  carteraVencidaPorcentaje: number;
  liquidez: number;
  totalRecaudo: number;
  totalFacturacion: number;
  totalCarteraVencida: number;
  activosCorrientes: number;
  pasivosCorrientes: number;
  totalGastos: number;
}
