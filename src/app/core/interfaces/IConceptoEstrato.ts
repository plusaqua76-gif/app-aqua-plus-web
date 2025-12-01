// stratos por concepto
export interface EstratoConcepto {
  id: number;
  valor: number;
  activo: boolean;
  estrato: number;
  rango?: number;
  fecha_cambio: string | null;
  fecha_creacion: string;
  usuario_cambio: string | null;
  usuario_creacion: string;
}

export interface ConceptoEstratoResponse {
  estratos: EstratoConcepto[];
  idTipoTarifa: number;
  idTipoConcepto: number;
  idTarifaConcepto: number;
}

export interface ConceptoEstratoApiResponse {
  success: boolean;
  message: string;
  code: number;
  response: {
    message: string;
    response: ConceptoEstratoResponse;
    statusCode: number;
  };
}
