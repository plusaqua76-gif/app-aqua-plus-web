export interface Metrica {
  rangoAntiguedad: string;
  cantidadFacturas: number;
  valorCartera: number;
}

export interface CarteraEdadesFacturas {
  totalGeneral: number;
  cantidadRangos: number;
  metricas: Metrica[];
}
