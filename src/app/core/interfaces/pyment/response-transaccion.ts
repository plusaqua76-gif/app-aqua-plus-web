export interface ResponseTransaccion {
  idWompi: string;
  referencia: string;
  estado: string;
  tipoMedio: string;
  redirect_url?: string;
  mensaje: string;
  marca?: string;
  ultimosCuatro?: string;
  cuotas?: number;
  codigoRespuestaProcesador?: string;
  estadoMensaje?: string | null;
}
