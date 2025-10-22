export interface ClientesEmpresaMesData {
  porMes: PorMes[];
  tarifa: Tarifa;
  periodo: Periodo;
  totales: Totales;
  empresa_id: number;
}

export interface PorMes {
  mes: number;
  mc_total: number;
  valor_total: number;
  valor_unitario: number;
}

export interface Tarifa {
  valor_unitario: number;
  id_tarifa_concepto: number;
  id_tipo_tarifa_acu: number;
  id_tipo_concepto_cafi: number;
}

export interface Periodo {
  mes: number | null;
  anio: number;
}

export interface Totales {
  mc_total: number;
  importe_total: number;
}
