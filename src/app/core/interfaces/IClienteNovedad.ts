export interface ITipoNovedad {
  id: number;
  novedad: string;
  descripcion: string;
}

export interface ICliente {
  id: number;
  nombre: string;
  segundoNombre?: string;
  apellido: string;
  segundoApellido?: string;
}

export interface IContador {
  id: number;
  serial: string;
}

export interface IEmpresaClienteContador {
  id: number;
  cliente: ICliente;
  contador: IContador;
}

export interface IEstadoNovedad {
  id: number;
  codigoPadre: string;
  codigo: string;
  descripcion: string;
}

export interface IClienteNovedad {
  id: number;
  tipoNovedad: ITipoNovedad;
  empresaClienteContador: IEmpresaClienteContador;
  estado: IEstadoNovedad;
  descripcion: string;
  activo: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  usuarioCreacion?: string;
  usuarioActualizacion?: string;
}

export interface IClienteNovedadResponse {
  success: boolean;
  message: string;
  code: number;
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  response: IClienteNovedad[];
}

export interface IClienteNovedadFiltros {
  estado?: string;
  tipoNovedad?: string;
  cliente?: string;
  fechaInicio?: string;
  fechaFin?: string;
  activo?: boolean;
  page?: number;
  size?: number;
}

export interface IClienteNovedadRespuesta {
  novedadId: number;
  respuesta: string;
  estadoId: number;
  usuario: string;
  fecha: Date;
}

