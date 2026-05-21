export interface SaldoClientePayload {
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
  id: number;
  empresaClienteContador: { id: number };
  saldoTotal: number;
  saldoDisponible: number;
  cuotas?: number;
  activo: boolean;
  usuarioCreacion: string;
  fechaCreacion: string;
  usuarioModificacion: string;
  fechaModificacion: string;
}
