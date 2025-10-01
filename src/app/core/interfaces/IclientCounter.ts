import { ApiResponse } from './Iresponse';

export interface IClientCounter {
  id: number;
  cliente: IClienteData;
  contador: IContadorData;
}

export type IClientCounterApiResponse = ApiResponse<IClientCounter[]>;

export interface IClienteData {
  id: number;
  direccion: IDireccionData;
  tipoDocumento: ITipoDocumentoData;
  numeroCedula: string;
  nombre: string;
  segundoNombre: string;
  apellido: string;
  segundoApellido: string;
  codigo: string;
  activo: boolean;
}

export interface IDireccionData {
  id: number;
  departamento: IDepartamentoData;
  ciudad: ICiudadData;
  corregimiento: ICorregimientoData;
  descripcion: string;
}

export interface IDepartamentoData {
  id: number;
  nombre: string;
}

export interface ICiudadData {
  id: number;
  nombre: string;
}

export interface ICorregimientoData {
  id: number;
  nombre: string;
}

export interface ITipoDocumentoData {
  id: number;
  nombre: string;
  codigo: string;
}

export interface IContadorData {
  id: number;
  tipoContador: ITipoContadorData;
  descripcion: IDireccionData;
  serial: string;
  activo: boolean;
}

export interface ITipoContadorData {
  id: number;
  nombre: string;
}
