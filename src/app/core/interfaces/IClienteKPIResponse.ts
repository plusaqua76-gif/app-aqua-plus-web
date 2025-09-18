export interface IClienteKPIPeriodo {
  mes: number;
  anio: number;
  desde: string;
  hasta: string;
  criterio: 'emision' | 'vencimiento';
  exclusivo_al_dia: boolean;
}

export interface IClienteKPIResumen {
  clientes_al_dia: number;
  clientes_nuevos: number;
  clientes_activos: number;
  clientes_en_mora: number;
}

export interface IClienteKPIResponse {
  periodo: IClienteKPIPeriodo;
  resumen: IClienteKPIResumen;
  empresa_id: number;
}
