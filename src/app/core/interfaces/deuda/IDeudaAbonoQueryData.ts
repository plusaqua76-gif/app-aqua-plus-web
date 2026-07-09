/** Datos mínimos de la fila de deuda enviados por query params al registrar abono */
export interface IDeudaAbonoQueryData {
  id: number;
  clienteNombre: string;
  facturaCodigo: string;
  fechaDeuda: string;
  valor: number;
  valorTotal?: number;
  totalAbonado?: number;
  saldoPendiente?: number;
  valorMes?: number;
  plazoPago: number;
  descripcion?: string;
  tipoDeudaNombre?: string;
  tipoDeudaId?: number;
}
