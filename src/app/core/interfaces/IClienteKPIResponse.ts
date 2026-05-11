export interface IClienteKPIPeriodo {
  mes: number;
  anio: number;
  desde: string;
  hasta: string;
  criterio: 'emision' | 'vencimiento';
  exclusivo_al_dia: boolean;
}

export interface IClienteKPIClientesMora {
  total: number;
  porcentaje: number;
}

export interface IClienteKPIClientesAlDia {
  total: number;
  porcentaje: number;
}

export interface IClienteKPIResumen {
  clientesMora: IClienteKPIClientesMora;
  clientesAlDia: IClienteKPIClientesAlDia;
  clientesNuevos: number;
  clientesActivos: number;
  matriculasActivas: number;
}

export interface IClienteKPIApiResponse {
  code: number;
  message: string;
  success: boolean;
  response: {
    periodo: IClienteKPIPeriodo;
    resumen: IClienteKPIResumen;
    empresa_id: number;
  };
  totalCount: number;
}

export interface IClienteKPIResponse {
  periodo: IClienteKPIPeriodo;
  resumen: IClienteKPIResumen;
  empresa_id: number;
}
