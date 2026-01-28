export interface CuentaTotalCategoria {
  id: number;
  nombre: string;
}

export interface CuentaTotalEmpresa {
  id: number;
}

export interface CuentaTotal {
  id: number;
  categoria: CuentaTotalCategoria;
  empresa: CuentaTotalEmpresa;
  total: number;
  activo: boolean;
  usuarioCreacion: string;
  fechaCreacion: string;
}

export interface ParamsCuentasTotales {
  idEmpresa: number;
  fechaInicio: string;
  fechaFin: string;
}
