export interface RequestTransaccion {
  referencia: string;
  acceptanceToken: string;
  tipoMedio: string;
  redirectUrl?: string;
  token?: string;
  cuotas?: number;
  telefono?: string;
  tipoUsuario?: number;
  documento?: string;
  tipoDocumento?: string;
  codigoBanco?: string;
  nombreCompleto?: string;
  telefonoCliente?: string;
}
