/**
 * Misma fórmula que el backend ({@code WompiFeeCalculator}):
 * comisión = (factura × 2,65%) + $700; IVA 19% solo sobre la comisión;
 * total = factura + comisión + IVA.
 *
 * Se opera en centavos enteros (HALF_UP vía Math.round) para alinear con
 * BigDecimal del API y evitar errores de punto flotante.
 */

const PCT_NUM = 265; // 2,65% = 265 / 10000
const PCT_DEN = 10_000;
const FIJO_CENTS = 70_000; // $700 COP
const IVA_NUM = 19;
const IVA_DEN = 100;

export interface WompiFeeBreakdown {
  factura: number;
  porcentaje: number;
  fijo: number;
  comision: number;
  iva: number;
  feeTotal: number;
  totalCobrar: number;
  facturaAmountInCents: number;
  comisionInCents: number;
  ivaInCents: number;
  feeTotalInCents: number;
  totalAmountInCents: number;
}

function fromCents(cents: number): number {
  return cents / 100;
}

export function calcularComisionWompi(precioFactura: number): WompiFeeBreakdown {
  if (precioFactura == null || !(precioFactura > 0) || Number.isNaN(precioFactura)) {
    throw new Error('El precio de la factura debe ser positivo');
  }

  const facturaAmountInCents = Math.round(precioFactura * 100);
  const porcentajeInCents = Math.round((facturaAmountInCents * PCT_NUM) / PCT_DEN);
  const comisionInCents = porcentajeInCents + FIJO_CENTS;
  const ivaInCents = Math.round((comisionInCents * IVA_NUM) / IVA_DEN);
  const feeTotalInCents = comisionInCents + ivaInCents;
  const totalAmountInCents = facturaAmountInCents + feeTotalInCents;

  return {
    factura: fromCents(facturaAmountInCents),
    porcentaje: fromCents(porcentajeInCents),
    fijo: fromCents(FIJO_CENTS),
    comision: fromCents(comisionInCents),
    iva: fromCents(ivaInCents),
    feeTotal: fromCents(feeTotalInCents),
    totalCobrar: fromCents(totalAmountInCents),
    facturaAmountInCents,
    comisionInCents,
    ivaInCents,
    feeTotalInCents,
    totalAmountInCents,
  };
}

export function formatCop(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}
