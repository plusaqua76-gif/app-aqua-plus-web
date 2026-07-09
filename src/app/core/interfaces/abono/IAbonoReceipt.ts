export interface IAbonoReceiptData {
  codigo: string;
  fecha: string;
  clienteNombre: string;
  clienteIdentificacion?: string;
  clienteDocumentoTipo?: string;
  facturaCodigo?: string;
  descripcionDeuda: string;
  tipoDeudaNombre?: string;
  valorAbono: number;
  saldoAnterior: number;
  saldoPendiente: number;
  valorTotalDeuda: number;
  capitalCuota?: number;
  interesCuota?: number;
  tasaInteresPercent?: number;
  valorMesProyectado?: number;
  numeroCuotas?: number;
  usuarioCreacion?: string;
}
