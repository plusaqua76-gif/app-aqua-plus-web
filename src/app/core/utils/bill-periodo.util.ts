import { SelectFilterOption } from '@interfaces/table/Itable';
import { monthNumberToName } from './month.util';

export const PERIODO_BADGE_CLASS =
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/80 dark:bg-slate-700/50 dark:text-slate-200 dark:border-slate-600/50';

export function toBillPeriodoApiValue(
  value: string,
  year = new Date().getFullYear(),
): string {
  const trimmed = value.trim();
  if (/^\d{6}$/.test(trimmed)) return trimmed;
  if (/^\d{1,2}$/.test(trimmed)) {
    return `${year}${trimmed.padStart(2, '0')}`;
  }
  return trimmed;
}

export const BILL_PERIODO_FILTER_OPTIONS: SelectFilterOption[] = Array.from(
  { length: 12 },
  (_, i) => {
    const month = String(i + 1).padStart(2, '0');
    const year = new Date().getFullYear();
    return {
      label: monthNumberToName(month),
      value: `${year}${month}`,
      badgeClass: PERIODO_BADGE_CLASS,
    };
  },
);

export function getBillPeriodoLabel(periodo: string | number | null | undefined): string {
  if (periodo == null || periodo === '') return '';

  const raw = String(periodo).trim();
  const month = /^\d{6}$/.test(raw) ? raw.slice(4, 6) : raw;
  return monthNumberToName(month);
}
