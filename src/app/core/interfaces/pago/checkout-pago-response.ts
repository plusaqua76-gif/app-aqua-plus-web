export interface CheckoutPagoResponse {
  checkoutUrl: string;
  /** URL GET completa con todos los parámetros Wompi (usar esta para redirigir). */
  paymentUrl: string;
  publicKey: string;
  currency: string;
  /** Monto de la factura en centavos (sin comisión). */
  facturaAmountInCents: number;
  /** Comisión Wompi (2,65% + $700) en centavos. */
  comisionInCents: number;
  /** IVA 19% sobre la comisión, en centavos. */
  ivaInCents: number;
  /** Comisión + IVA, en centavos. */
  feeTotalInCents: number;
  /** Total a cobrar en Wompi = factura + feeTotal (centavos). */
  amountInCents: number;
  reference: string;
  signatureIntegrity: string;
  redirectUrl: string;
}
