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

export interface IParametroGeneral {
  id: number;
  codigoPadre: string;
  codigo: string;
  descripcion: string;
}

export interface IClienteNovedad {
  id: number;
  tipoNovedad: ITipoNovedad;
  empresaClienteContador: IEmpresaClienteContador;
  estado: IParametroGeneral;
  codigo: string;
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

// Interfaces para crear novedad con archivo
export interface IFacturaRef {
  id: number;
}

export interface ITipoNovedadRef {
  id: number;
}

export interface IEmpresaClienteContadorRef {
  id: number;
}

export interface IEstadoRef {
  codigo: string;
}

export interface ICreateNovedadRequest {
  tipoNovedad: ITipoNovedadRef;
  empresaClienteContador: IEmpresaClienteContadorRef;
  estado: IEstadoRef;
  codigo: string;
  descripcion: string;
  activo: boolean;
  usuarioCreacion: string;
  fechaCreacion: string;
  usuarioModificacion: string;
  fechaModificacion: string;
}

export interface ICreateNovedadWithFileRequest {
  novedad: ICreateNovedadRequest;
  base64File: string;
  idPersona?: number;
  nombreArchivo: string;
  extension: string;
  categoriaCodigo: string;
}

export interface ICreateNovedadResponse {
  success: boolean;
  message: string;
  code: number;
  response?: any;
}

