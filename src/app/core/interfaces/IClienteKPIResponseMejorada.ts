// Interfaces para la respuesta mejorada del backend

export interface IKPIDetalle {
  valor_actual: number;
  valor_anterior: number;
  porcentaje_cambio: number;
  es_positivo: boolean;
  meta_mensual?: number;
  progreso_meta?: number;
}

export interface IClienteKPIPeriodoMejorado {
  mes: number;
  anio: number;
  desde: string;
  hasta: string;
  criterio: 'emision' | 'vencimiento';
  exclusivo_al_dia: boolean;
}

export interface IClienteKPIResumenMejorado {
  clientes_al_dia: IKPIDetalle;
  clientes_nuevos: IKPIDetalle;
  clientes_activos: IKPIDetalle;
  clientes_en_mora: IKPIDetalle;
}

export interface IClienteKPIResponseMejorada {
  periodo: IClienteKPIPeriodoMejorado;
  resumen: IClienteKPIResumenMejorado;
  empresa_id: number;
  periodo_anterior: {
    mes: number;
    anio: number;
    desde: string;
    hasta: string;
  };
}
