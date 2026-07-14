export interface IPlazoPago {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  usuarioCreacion: string;
  fechaCreacion: Date;
  usuarioModificacion: string | null;
  fechaModificacion: Date | null;
}
