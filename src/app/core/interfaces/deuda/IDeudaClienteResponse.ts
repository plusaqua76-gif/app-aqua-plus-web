export interface IDeudaClienteResponse {
  id: number;
  fechaDeuda: string;
  valor: number;
  valorTotal?: number;
  totalAbonado?: number;
  saldoPendiente?: number;
  valorMes?: number;
  descripcion: string;
  activo: boolean;
  facturaId: number;
  facturaCodigo: string;
  eccId: number;
  plazoPago: number;
  empresaId: number;
  clienteNombre: string;
  tipoDeudaNombre?: string;
  tipoDeuda: {
    id: number;
    nombre: string;
    descripcion: string;
    codigo: string;
  };
}
