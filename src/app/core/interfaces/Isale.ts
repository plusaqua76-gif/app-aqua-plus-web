export interface ISale {
  id: number;
  codigo: string;
  clienteNombre: string;
  nombre: string;
  identificacion: string;
  cantidad: number;
  precioVenta: number;
  valorTotal: number;
  descripcion: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface ISaleFilters {
  clienteNombre?: string;
  codigo?: string;
  cantidad?: number;
  nombre?: string;
  identificacion?: string;
  precioVenta?: number;
  valorTotal?: number;
  descripcion?: string;
}
