export interface IEstratoValue {
  estrato: number;
  valor: number;
}

export interface IConceptoPayload {
  idTipoConcepto: number;
  indCalcularMc: boolean;
  valor?: number;
  valoresEstrato?: IEstratoValue[];
}

export interface IConceptRatePayload {
  idEmpresa: number;
  idTipoTarifa: number;
  usuarioCreacion: string;
  concepto: IConceptoPayload;
}
