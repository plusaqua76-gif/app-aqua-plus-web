// Interfaces para la respuesta detallada del cliente

export interface ITipoDocumento {
  id: number;
  nombre: string;
  codigo: string;
  idTipoDian: string;
}

export interface ICiudad {
  id: number;
  nombre: string;
  activo: boolean;
  usuarioCreacion: string;
}

export interface ICorregimiento {
  id: number;
  nombre: string;
}

export interface IDepartamento {
  id: number;
  nombre: string;
}

export interface IDireccion {
  id: number;
  departamento: IDepartamento;
  ciudad: ICiudad;
  corregimiento: ICorregimiento;
  descripcion: string;
}

export interface IPersona {
  id: number;
  direccion: IDireccion;
  tipoDocumento: ITipoDocumento;
  numeroCedula: string;
  nombre: string;
  segundoNombre?: string;
  apellido: string;
  segundoApellido?: string;
  discapacidad?: boolean;
  activo: boolean;
}

export interface ITipoContador {
  id: number;
  nombre: string;
}

export interface IDescripcionContador {
  id: number;
  departamento: IDepartamento;
  ciudad: ICiudad;
  corregimiento: ICorregimiento;
  descripcion: string;
  usuarioCreacion: string;
}

export interface IEstadoContador {
  id: number;
  codigoPadre: string;
  codigo: string;
  descripcion: string;
  activo: boolean;
  usuarioCreacion: string;
  fechaCreacion: string;
}

export interface ITipoUso {
  id: number;
  nombre: string;
  codigo: string;
}

export interface IAforoContador {
  id: number;
  nombre: string;
  tarifaBase: number;
}

export interface IContador {
  id: number;
  tipoContador: ITipoContador;
  descripcion: IDescripcionContador;
  estadoContador: IEstadoContador;
  tipoUso: ITipoUso;
  estrato: number;
  activo: boolean;
  aforoContador?: IAforoContador[];
}

export interface ITipoTarifa {
  id: number;
  nombre: string;
  descripcion?: string;
  codigo: string;
}

export interface ITarifa {
  id: number;
  tipoTarifa: ITipoTarifa;
  aplica: boolean;
}

export interface ITipoTarifaFaltante {
  id: number;
  nombre: string;
  codigo: string;
}

export interface IClienteDetalle {
  persona: IPersona;
  contadores: IContador[];
  empleadoEmpresaId: number | null;
  empleadoNombre: string | null;
  correo: string | null;
  telefono: string;
  codigosResidenciaFiscal?: string;
  tarifasContadores: ITarifa[];
  tiposTarifaFaltantes: ITipoTarifaFaltante[];
}

export interface IClienteDetalleApiResponse {
  success: boolean;
  message: string;
  code: number;
  response: IClienteDetalle;
}
