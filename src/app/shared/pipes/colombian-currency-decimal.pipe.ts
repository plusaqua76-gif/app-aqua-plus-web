import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'colombianCurrencyDecimal',
  standalone: true
})
export class ColombianCurrencyDecimalPipe implements PipeTransform {

  transform(value: number | string | null | undefined): string {
    if (value == null || value === '') {
      return '$ 0,00';
    }

    const numericValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numericValue)) {
      return '$ 0,00';
    }

    const formatted = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericValue);

    return formatted.replace('COP', '').trim();
  }
}
