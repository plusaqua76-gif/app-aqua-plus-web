export interface TipoAtributo {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface Filtro {
  id: number;
  tipoAtributo: TipoAtributo;
  campo: string;
  requerido: boolean;
  lectura: boolean;
  activo: boolean;
}

export interface FiltroItem {
  id: number;
  filtro: Filtro;
}
