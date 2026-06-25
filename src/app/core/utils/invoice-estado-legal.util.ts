import { SelectFilterOption } from '@interfaces/table/Itable';

const BADGE_BASE =
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap';

const INVOICE_ESTADO_LEGAL_OPTIONS = [
  {
    label: 'Aceptado',
    value: 'ACEPTADO',
    badgeClass: `${BADGE_BASE} bg-emerald-100 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-900/35 dark:text-emerald-300 dark:border-emerald-700/50`,
  },
  {
    label: 'Aceptado con observaciones',
    value: 'ACEPTADO CON OBSERVACIONES',
    badgeClass: `${BADGE_BASE} bg-amber-100 text-amber-800 border border-amber-200/80 dark:bg-amber-900/35 dark:text-amber-300 dark:border-amber-700/50`,
  },
  {
    label: 'Rechazado',
    value: 'RECHAZADO',
    badgeClass: `${BADGE_BASE} bg-red-100 text-red-800 border border-red-200/80 dark:bg-red-900/35 dark:text-red-300 dark:border-red-700/50`,
  },
] as const;

const ESTADO_MAP: Record<string, (typeof INVOICE_ESTADO_LEGAL_OPTIONS)[number]> = {
  ACEPTADO: INVOICE_ESTADO_LEGAL_OPTIONS[0],
  ACCEPTED: INVOICE_ESTADO_LEGAL_OPTIONS[0],
  'ACEPTADO CON OBSERVACIONES': INVOICE_ESTADO_LEGAL_OPTIONS[1],
  ACCEPTED_WITH_OBSERVATIONS: INVOICE_ESTADO_LEGAL_OPTIONS[1],
  RECHAZADO: INVOICE_ESTADO_LEGAL_OPTIONS[2],
  REJECTED: INVOICE_ESTADO_LEGAL_OPTIONS[2],
};

const DEFAULT_BADGE = `${BADGE_BASE} bg-slate-100 text-slate-700 border border-slate-200/80 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-600/50`;

function findEstadoOption(estado: string | null | undefined) {
  if (!estado?.trim()) return null;
  return ESTADO_MAP[estado.trim().toUpperCase()] ?? null;
}

export function getInvoiceEstadoLegalBadgeClass(estado: string | null | undefined): string {
  return findEstadoOption(estado)?.badgeClass ?? DEFAULT_BADGE;
}

export function getInvoiceEstadoLegalDisplayLabel(estado: string | null | undefined): string {
  if (!estado?.trim()) return '';
  return findEstadoOption(estado)?.label ?? estado;
}

export const INVOICE_ESTADO_LEGAL_FILTER_OPTIONS: SelectFilterOption[] =
  INVOICE_ESTADO_LEGAL_OPTIONS.map(({ label, value, badgeClass }) => ({
    label,
    value,
    badgeClass,
  }));
