export interface DocumentUpload {
  base64File: string;
  idEmpresa: number;
  nombreArchivo: string;
  extension: string;
  usuario: string;
  categoriaCodigo: string;
  publico?: boolean;
}


export interface DocumentUploadResponse {
  success: boolean;
  message: string;
  code: number;
  response: {
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
    categoriaDocumento: {
      id: number;
      nombre: string;
      codigo: string;
      activo: boolean;
      usuarioCreacion: string;
      fechaCreacion: string;
    };
    ruta: string;
    nombre: string;
    extension: string;
  };
}



export interface responseDocument {
  id?: number;
  ruta: string;
  nombre: string;
  imagen: string;
}



