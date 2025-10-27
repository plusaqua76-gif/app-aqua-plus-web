export interface LecturaResponse {
  id: number;
  contador: Contador;
  lectura: number;
  fechaLectura: string;
  consumoAnormal: boolean;
  descripcion: string;
}

export interface Contador {
  id: number;
  tipoContador: TipoContador;
  descripcion: Direccion;
  serial: string;
}

export interface TipoContador {
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

export interface IdNombre {
  id: number;
  nombre: string;
}

// Interfaces para el historial de lecturas
export interface HistoryReadingResponse {
  id: number;
  lectura: {
    id: number;
  };
  contador: {
    id: number;
    cliente: {
      id: number;
      nombre: string;
      segundoNombre: string;
      apellido: string;
      segundoApellido: string;
    };
    serial: string;
  };
  consumo: number;
  fechaLectura: string;
  consumoAnormal: boolean;
  descripcion: string;
  activo: boolean;
  usuarioCreacion: string;
  usuarioModificacion: string;
}

export interface HistoryReadingApiResponse {
  success: boolean;
  message: string;
  code: number;
  totalCount: number;
  response: HistoryReadingResponse[];
}
