export interface ParamsEnterprice {
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
    fechaModificacion: string;
  };
  llave: string;
  valorParametro: string;
}
