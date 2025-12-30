// Interfaces base comunes
export interface IDepartamento {
  id: number;
  nombre: string;
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

export interface IDireccion {
  id: number;
  departamento: IDepartamento;
  ciudad: ICiudad;
  corregimiento: ICorregimiento;
  descripcion: string;
  usuarioCreacion: string;
}

export interface IRol {
  id: number;
  nombre: string;
  usuarioCreacion: string;
}

export interface IEstado {
  id: number;
  nombre: string;
}

export interface IUsuario {
  id: number;
  rol: IRol;
  estado: IEstado;
  nombre: string;
  contrasena: string;
  activo: boolean;
  usuarioCreacion: string;
}

export interface ITipoDocumento {
  id: number;
  nombre: string;
  codigo: string;
  idTipoDian: string;
}

// Interfaces específicas de negocio
export interface IEmpresaFactura {
  id: number;
  usuario: IUsuario;
  direccion: IDireccion;
  nombre: string;
  nit: string;
  codigo: string;
  activo: boolean;
  usuarioCreacion: string;
  fechaCreacion: string;
  fechaModificacion: string;
  idEmpresaDian: string;
}

export interface IClienteFactura {
  id: number;
  direccion: IDireccion;
  tipoDocumento: ITipoDocumento;
  numeroCedula: string;
  nombre: string;
  segundoNombre: string;
  apellido: string;
  segundoApellido: string;
  codigo: string;
  activo: boolean;
  usuarioCreacion: string;
}

// Interface principal de la factura electrónica
export interface IFacturaElectronica {
  id: number;
  numero: number;
  estado: string;
  estadoLegal: string;
  idDian: string;
  empresa: IEmpresaFactura;
  cliente: IClienteFactura;
  descripcion: string;
}

// Tipos para estados
export type EstadoFactura = 'ENVIADO' | 'RECHAZADO' | 'ACEPTADO' | 'PENDIENTE';
export type EstadoLegalFactura = 'RECHAZADO' | 'ACEPTADO' | 'PENDIENTE';
