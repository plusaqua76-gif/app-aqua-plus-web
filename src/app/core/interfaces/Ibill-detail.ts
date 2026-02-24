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
  codigo: string | null;
  estrato: number;
  direccion: IDireccion;
  descripcion: string | null;
  numeroCedula: string;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  tipoDocumentoNombre: string;
}

export interface IPuntoPago {
  id?: number;
  nombre?: string;
  imagen?: string;
  contentType?: string;
  codigoQr?: string;
}

export interface IPuntoPagoEmpresa {
  nombre: string;
  imagen: string;
}

export interface ICodigoQr {
  nombre: string;
  imagen: string;
}

export interface IEmpresa {
  id: number;
  nit: string;
  activo: boolean;
  codigo: string;
  nombre: string;
  direccion: IDireccion;
  idUsuario: number;
  puntosPago: IPuntoPagoEmpresa[];
  codigoQr: ICodigoQr;
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
  consumoReal: number;
  estadoNombre: string;
  fechaEmision: string;
  lecturaActual: number;
  tipoPagoNombre: string;
  lecturaAnterior: number;
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
  estrato: number;
  direccion: IDireccion;
  idPersona: number;
  tipoContadorNombre: string;
}

export interface IDeudaCliente {
  id: number;
  valor: number;
  idFactura: number | null;
  plazoPago: string;
  fechaDeuda: string;
  descripcion: string;
  tipoDeudaNombre: string;
}

export interface ITotalesTarifas {
  total: number;
  porTipo: { [key: string]: number };
}

export interface ILecturaHistorico {
  id: number;
  precio: number | null;
  consumo: number;
  lectura: number;
  descripcion: string;
  fechaLectura: string;
  consumoAnormal: boolean;
}



export interface ITipoConcepto {
  rango: string;
  valor: number;
  codigo: string;
  descripcion: string;
}

export interface IValoresMetrosCubicos {
  totalAcueducto: number;
  totalAlcantarillado: number;
  tipoConcepto: ITipoConcepto[];
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
  valoresMetrosCubicos: IValoresMetrosCubicos;
  puntosPago?: IPuntoPago[];
}

export type IBillDetailApiResponse = ApiResponse<IBillDetailResponse>;
