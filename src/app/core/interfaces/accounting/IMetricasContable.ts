import type { TrendDirection } from "@components/charts/trend-sparkline";

export interface Periodo {
  desde: string;
  hasta: string;
}

export interface PeriodoValor {
  valor: number;
  periodo: string;
}

export interface DataMetricas {
  total: number;
  anterior: number;
  periodos: PeriodoValor[];
  tendencia: TrendDirection;
  variacion: number | null;
}

export interface ResponseMetricasContables {
  periodo: Periodo;
  empresa_id: number;
  activosData: DataMetricas;
  carteraData: DataMetricas;
  pasivosData: DataMetricas;
  patrimonioData: DataMetricas;
  ultimaActualizacion: string;
}



export interface ParamsMetricasContables {
  empresa: number;
  año?: number | null;
  mes?: number | null;
  desde?: string | null;
  hasta?: string | null;
  cantidadPeriodos: number;
}
