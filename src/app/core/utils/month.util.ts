const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function monthNumberToName(month: number | string): string {
  const num = typeof month === 'string' ? parseInt(month, 10) : month;

  if (num >= 1 && num <= 12) {
    return MESES[num - 1];
  }
  return String(month);
}
