
class PreciseDecimal {
  private value: number;
  private scale: number = 10;

  constructor(value: number | string) {
    if (typeof value === 'string') {
      this.value = parseFloat(value);
    } else {
      this.value = value;
    }
  }


  multiply(other: number | PreciseDecimal): PreciseDecimal {
    const otherValue = other instanceof PreciseDecimal ? other.value : other;
    return new PreciseDecimal(this.value * otherValue);
  }

  divide(divisor: number | PreciseDecimal): PreciseDecimal {
    const divisorValue = divisor instanceof PreciseDecimal ? divisor.value : divisor;
    return new PreciseDecimal(this.value / divisorValue);
  }

  plus(other: number | PreciseDecimal): PreciseDecimal {
    const otherValue = other instanceof PreciseDecimal ? other.value : other;
    return new PreciseDecimal(this.value + otherValue);
  }

  minus(other: number | PreciseDecimal): PreciseDecimal {
    const otherValue = other instanceof PreciseDecimal ? other.value : other;
    return new PreciseDecimal(this.value - otherValue);
  }

  toDecimalPlaces(decimals: number): PreciseDecimal {
    const multiplier = Math.pow(10, decimals);
    const rounded = Math.round(this.value * multiplier + Number.EPSILON) / multiplier;
    return new PreciseDecimal(rounded);
  }

  toNumber(): number {
    return this.value;
  }

  toString(): string {
    return this.value.toString();
  }
}

export interface ItemCalculationInput {
  precioUnitario: number;
  cantidad: number;
  descuentoPorcentaje: number; // % descuento (ej: 10 = 10%)
  cargoPorcentaje: number;     // % cargo (ej: 5 = 5%)
  ivaPorcentaje: number;        // % IVA (ej: 19 = 19%)
}


export interface ItemCalculationResult {
  valorBruto: number;
  descuento: number;
  cargo: number;
  baseGravable: number;
  iva: number;
  total: number;
}


export function calcularItemPreciso(input: ItemCalculationInput): ItemCalculationResult {
  const precioUnitario = new PreciseDecimal(input.precioUnitario);
  const cantidad = new PreciseDecimal(input.cantidad);
  const valorBruto = precioUnitario.multiply(cantidad).toDecimalPlaces(2);
  const descuento = valorBruto
    .multiply(input.descuentoPorcentaje)
    .divide(100)
    .toDecimalPlaces(2);
  const cargo = valorBruto
    .multiply(input.cargoPorcentaje)
    .divide(100)
    .toDecimalPlaces(2);
  const baseGravable = valorBruto
    .plus(cargo.toNumber())
    .minus(descuento.toNumber())
    .toDecimalPlaces(2);
  const iva = baseGravable
    .multiply(input.ivaPorcentaje)
    .divide(100)
    .toDecimalPlaces(2);
  const total = baseGravable
    .plus(iva.toNumber())
    .toDecimalPlaces(2);

  return {
    valorBruto: valorBruto.toNumber(),
    descuento: descuento.toNumber(),
    cargo: cargo.toNumber(),
    baseGravable: baseGravable.toNumber(),
    iva: iva.toNumber(),
    total: total.toNumber()
  };
}

export interface TotalsCalculationResult {
  subtotal: number;
  totalDescuentos: number;
  totalCargos: number;
  totalImponible: number;
  totalImpuesto: number;
  totalPagar: number;
}


export function calcularTotalesPrecisos(items: ItemCalculationResult[]): TotalsCalculationResult {
  let totalBruto = 0;
  let totalDescuento = 0;
  let totalCargo = 0;
  let totalImponible = 0;
  let totalImpuesto = 0;

  items.forEach(item => {
    totalBruto += item.valorBruto;
    totalDescuento += item.descuento;
    totalCargo += item.cargo;
    totalImponible += item.baseGravable;
    totalImpuesto += item.iva;
  });

  const totalBrutoRedondeado = new PreciseDecimal(totalBruto).toDecimalPlaces(2).toNumber();
  const totalDescuentoRedondeado = new PreciseDecimal(totalDescuento).toDecimalPlaces(2).toNumber();
  const totalCargoRedondeado = new PreciseDecimal(totalCargo).toDecimalPlaces(2).toNumber();
  const totalImponibleRedondeado = new PreciseDecimal(totalImponible).toDecimalPlaces(2).toNumber();
  const totalImpuestoRedondeado = new PreciseDecimal(totalImpuesto).toDecimalPlaces(2).toNumber();

  const totalPagar = new PreciseDecimal(totalImponibleRedondeado)
    .plus(totalImpuestoRedondeado)
    .toDecimalPlaces(2)
    .toNumber();

  return {
    subtotal: totalBrutoRedondeado,
    totalDescuentos: totalDescuentoRedondeado,
    totalCargos: totalCargoRedondeado,
    totalImponible: totalImponibleRedondeado,
    totalImpuesto: totalImpuestoRedondeado,
    totalPagar: totalPagar
  };
}


export function roundHalfUp(value: number, decimals: number): number {
  return new PreciseDecimal(value).toDecimalPlaces(decimals).toNumber();
}
