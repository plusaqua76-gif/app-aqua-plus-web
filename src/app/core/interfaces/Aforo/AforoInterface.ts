export interface AforoInterface {
  empresa: { id: number };
  tipoUso: { id: number };
  tipoAforo: { id: number };
  nombre: string;
  numeroSuscriptores: number;
  produMensual: number;
  frecBarrido: number;
  frecRecoleccion: number;
  tarifaBase: number;
  promedioCRA: number;
  usuarioCreacion: string;
}



export interface AforoResponse {
  id: number;
  tipoUso: {
    id: number;
    nombre: string;
    codigo: string;
    activo: boolean;
    usuarioCreacion: string;
    fechaCreacion: string;
  };
  tipoAforo: {
    id: number;
    codigoPadre: string;
    codigo: string;
    descripcion: string;
    activo: boolean;
    usuarioCreacion: string;
    fechaCreacion: string;
  };
  numeroSuscriptores: number;
  produMensual: number;
  frecBarrido: number;
  frecRecoleccion: number;
  tarifaBase: number;
  promedioCRA: number;
  activo: boolean;
}
