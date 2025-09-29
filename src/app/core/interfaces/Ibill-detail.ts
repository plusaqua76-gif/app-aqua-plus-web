import { ApiResponse } from './Iresponse';

export interface IDireccion {
  id: number;
  descripcion: string | null;
  ciudadNombre: string;
  departamentoNombre: string;
  corregimientoNombre: string;
}

export interface ICliente {
  id: number;
  codigo: string;
  estrato: number;
  direccion: IDireccion;
  descripcion: string;
  numeroCedula: string;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  tipoDocumentoNombre: string;
}

export interface IEmpresa {
  id: number;
  nit: string;
  activo: boolean;
  codigo: string;
  nombre: string;
  direccion: IDireccion;
  idUsuario: number;
}

export interface ILectura {
  id: number;
  precio: number | null;
  lectura: number;
  descripcion: string | null;
  fechaLectura: string;
  consumoAnormal: boolean;
}

export interface IFactura {
  id: number;
  iva: number | null;
  codigo: string;
  precio: number;
  lectura: ILectura;
  fechaFin: string;
  estadoNombre: string;
  fechaEmision: string;
  tipoPagoNombre: string;
  idEmpresaClienteContador: number;
}

export interface IValorPorEstrato {
  valor: number;
  fuente: string;
}

export interface IConcepto {
  valor: number | null;
  fuente: string;
  indCalcularMc: boolean;
  estratoAplicado: number;
  valorPorEstrato: IValorPorEstrato | null;
  idTarifaConcepto: number;
  tipoConceptoNombre: string;
}

export interface ITarifa {
  codigo: string;
  nombre: string;
  conceptos: IConcepto[];
  idTipoTarifa: number;
}

export interface IContador {
  id: number;
  serial: string;
  direccion: IDireccion;
  idPersona: number;
  tipoContadorNombre: string;
}

export interface IDeudaCliente {
  id: number;
  valor: number;
  idFactura: number;
  fechaDeuda: string;
  descripcion: string;
  tipoDeudaNombre: string;
  plazoPagoDescripcion: string;
}

export interface ITotalesTarifas {
  total: number;
  porTipo: { [key: string]: number };
}

export interface ILecturaHistorico {
  id: number;
  precio: number | null;
  lectura: number;
  descripcion: string;
  fechaLectura: string;
  consumoAnormal: boolean;
}

export interface IBillDetailResponse {
  cliente: ICliente;
  empresa: IEmpresa;
  factura: IFactura;
  tarifas: ITarifa[];
  contador: IContador;
  deudaCliente: IDeudaCliente[];
  totalesTarifas: ITotalesTarifas;
  lecturasHistorico: ILecturaHistorico[];
}

export type IBillDetailApiResponse = ApiResponse<IBillDetailResponse>;
