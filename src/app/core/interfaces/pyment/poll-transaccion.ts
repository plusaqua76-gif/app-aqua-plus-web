export interface PollTransaccion {
  id: number;
  referencia: string;
  estado: string;
  metodoPago: string;
  montoCentavos: number;
  moneda: string;
  emailCliente: string;
  idTransaccionWompi: string;
  redirectLista: boolean;
  redirectConsumido: boolean;
  redirectExpiraEn: string | null;
  fechaCreacion: string;
  fechaCambio: string;
}
