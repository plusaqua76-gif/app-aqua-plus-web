export interface IUserBill {
  id: number;
  empresaClienteContadorId: number;
  personaId: number;
  nombre: string;
  segundoNombre: string | null;
  apellido: string;
  segundoApellido: string | null;
  corregimientoNombre: string | null;
  lectura: number | null;
  consumoAnormal: boolean | null;
  tipoPagoId: number;
  tipoPagoNombre: string;
  estadoId: number;
  estadoNombre: string;
  fechaEmision: string;
  fechaFin: string;
  consumo: number | null;
  precio: number;
  codigo: string;
  activo: boolean;
  usuarioCreacion: string;
  fechaCreacion: string;
  usuarioModificacion: string | null;
  fechaModificacion: string | null;
  nuid: number;
}
