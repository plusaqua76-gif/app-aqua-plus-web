export interface Metrica {
  rangoAntiguedad: string;
  cantidadDeudas: number;
  valorCartera: number;
}

export interface CarteraEdadesFacturas {
  totalGeneral: number;
  cantidadRangos: number;
  metricas: Metrica[];
}
