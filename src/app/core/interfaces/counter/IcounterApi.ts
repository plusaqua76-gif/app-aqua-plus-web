export interface CounterApiResponse {
  id: number;
  tipoContador: {
    id: number;
    nombre: string;
  };
  descripcion: {
    id: number;
    departamentoId: {
      id: number;
      nombre: string;
    };
    ciudadId: {
      id: number;
      nombre: string;
    };
    corregimientoId: {
      id: number;
      nombre: string;
    };
    descripcion: string;
  };
  serial: string;
}
