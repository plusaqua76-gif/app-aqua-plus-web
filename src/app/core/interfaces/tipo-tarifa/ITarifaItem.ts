export interface NuevoItem {
  nombre: string;
  descripcion: string;
}

export interface Estrato {
  id: number;
  numero: number;
  valor: number;
}

export interface TarifaItem {
  id: number;
  tipoTarifa: string;
  tipoConcepto: string;
  valor: number;
  estratos: Estrato[];
  tipoTarifaId: number;
  tipoConceptoId: number;
}
