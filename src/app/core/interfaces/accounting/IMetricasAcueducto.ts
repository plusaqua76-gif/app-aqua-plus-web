export interface IDesgloseTarifa {
  nombreTarifa: string;
  valorTarifa: number;
}

export interface IMetricasAcueducto {
  porMes: Array<{
    mes: number;
    mesNombre: string;
    mcAguaPerdida: number;
    vlrAguaPerdida: number;
    mcAguaFacturada: number;
    mcAguaProducida: number;
    vlrAguaFacturada: number;
    eficienciaFacturacion: number;
  }>;
  periodo: {
    mes: number;
    anio: number;
  };
  totales: {
    mcAguaPerdida: number;
    vlrAguaPerdida: number;
    mcAguaFacturada: number;
    mcAguaProducida: number;
    vlrAguaFacturada: number;
    ingresosPorTarifa: number;
    eficienciaFacturacion: number;
    desgloseTarifas?: IDesgloseTarifa[];
  };
  empresa_id: number;
  valorMcAcueducto: number;
  ingresosPorTarifa: number; 
}
