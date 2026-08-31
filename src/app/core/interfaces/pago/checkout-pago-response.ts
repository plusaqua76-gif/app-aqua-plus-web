export interface CheckoutPagoResponse {
  checkoutUrl: string;
  /** URL GET completa con todos los parámetros Wompi (usar esta para redirigir). */
  paymentUrl: string;
  publicKey: string;
  currency: string;
  amountInCents: number;
  reference: string;
  signatureIntegrity: string;
  redirectUrl: string;
}
