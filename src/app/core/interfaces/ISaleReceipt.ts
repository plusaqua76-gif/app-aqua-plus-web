export interface ISaleReceiptProduct {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface ISaleReceiptData {
  codigo: string;
  fecha: string;
  nombreCliente: string;
  identificacion: string;
  metodoPago: string;
  productos: ISaleReceiptProduct[];
  total: number;
  usuarioCreacion?: string;
}
