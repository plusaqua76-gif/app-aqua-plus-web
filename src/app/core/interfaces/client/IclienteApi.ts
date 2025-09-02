export interface ClienteApi {
  id: number;
  direccion: Direccion;
  tipoDocumento: TipoDocumento;
  numeroCedula: string;
  nombre: string;
  apellido: string;
  segundoApellido?: string;
  codigo: string;
  telefono?: string;
  correo?: string;
  razonSocial?: string;
  estado?: boolean;
  activo?: boolean;
}


export interface IdNombre {
  id: number;
  nombre: string;
}

export interface Direccion {
  id: number;
  departamentoId: IdNombre;
  ciudadId: IdNombre;
  corregimientoId: IdNombre;
  descripcion: string;
}

export interface TipoDocumento {
  id: number;
  nombre: string;
}
