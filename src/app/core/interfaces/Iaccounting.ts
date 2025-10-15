import { IEnterprise } from "./Ienterprise";

export interface IInventario {
  id: number;
  productoId: number;
  codigo:string;
  nombre:string;
  cantidad:string;
  precioUnitario:string;
  precioVenta:string;
  porcentaje:string;
  descripcion:string;
  activo: boolean;
  usuarioCreacion: string;
  fechaCreacion: string;
  usuarioModificacion: string | null;
  fechaModificacion: string | null;
}

export interface IInventarioCreate {
  id?: number;
  producto: {
    id: number;
    empresa?: {
      id: number;
    };
    categoria?: {
      id: number;
    };
  };
  cantidad: number;
  precioUnitario: number;
  precioVenta: number;
  porcentaje: number;
  descripcion: string;
  activo: boolean;
  usuarioCreacion: string;
  fechaCreacion?: string;
  usuarioModificacion?: string | null;
  fechaModificacion?: string | null;
}

export interface IProducto{
  id: number;
  empresa: IEnterprise;
  categoria:ICategoria;
  codigo:string;
  nombre:string;
  descripcion:string;
  activo: boolean;
  usuarioCreacion: string;
  fechaCreacion: string;
  usuarioModificacion: string | null;
  fechaModificacion: string | null;
}

export interface ICategoria{
    id: number;
    nombre: string;
    descripcion: string; // Corregido: era 'decripcion'
    activo: boolean;
    usuarioCreacion: string; // Corregido: era 'usuaruioCreacion'
    fechaCreacion: Date;
    usuarioModificacion: string;
    fechaModificacion: Date;
}

