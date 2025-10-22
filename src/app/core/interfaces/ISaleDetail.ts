export interface ISaleDetail {
  id: number;
  empresa: {
    id: number;
    usuario: {
      id: number;
      rol: {
        id: number;
        nombre: string;
        usuarioCreacion: string;
      };
      estado: {
        id: number;
        nombre: string;
      };
      nombre: string;
      contrasena: string;
      activo: boolean;
      usuarioCreacion: string;
      usuarioModificacion: string;
    };
    direccion: {
      id: number;
      departamento: {
        id: number;
        nombre: string;
      };
      ciudad: {
        id: number;
        nombre: string;
        activo: boolean;
        usuarioCreacion: string;
      };
      corregimiento: {
        id: number;
        nombre: string;
      };
      usuarioCreacion: string;
    };
    nombre: string;
    nit: string;
    codigo: string;
    activo: boolean;
    usuarioCreacion: string;
    fechaCreacion: string;
    usuarioModificacion: string;
    fechaModificacion: string;
  };
  cliente: any;
  codigo: string;
  nombre: string;
  identificacion: string;
  cantidad: number;
  precioVenta: number;
  valorTotal: number;
  descripcion: string | null;
  activo: boolean | null;
  usuarioCreacion: string | null;
  fechaCreacion: string;
  usuarioModificacion: string | null;
  fechaModificacion: string | null;
}
