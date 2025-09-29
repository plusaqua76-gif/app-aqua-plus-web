import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'colombianCurrency',
  standalone: true
})
export class ColombianCurrencyPipe implements PipeTransform {

  transform(value: number | string | null | undefined): string {
    if (value == null || value === '') {
      return '$0';
    }

    const numericValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numericValue)) {
      return '$0';
    }

    const formatted = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericValue);

    return formatted.replace('COP', '').trim();
  }
}
