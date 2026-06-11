export interface SaldoClienteUpdatePayload {
  id: number;
  saldoTotal: number;
  usuarioModificacion: string;
  fechaModificacion: string;
}

export interface SaldoClientePayload {
  saldoClienteId?: number;
  empresaClienteContador: { id: number };
  saldoTotal: number;
  saldoDisponible: number;
  cuotas?: number;
  activo: boolean;
  usuarioCreacion: string;
  fechaCreacion?: string;
  usuarioModificacion?: string;
  fechaModificacion?: string;
}

export interface SaldoClienteResponse {
  saldoClienteId: number;
  saldoTotal: number;
  saldoDisponible: number;
  cuotas: number;
  saldoActivo: boolean;
  empresaClienteContadorId: number;
  id: number;
  numeroCedula: string;
  nombreCompleto: string;
  codigo: string;
  activo: boolean;
  discapacidad: boolean;
  tipoDocumentoId: number;
  tipoDocumentoNombre: string;
  nuid: number;
}