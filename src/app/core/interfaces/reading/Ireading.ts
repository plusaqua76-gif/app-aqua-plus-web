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
