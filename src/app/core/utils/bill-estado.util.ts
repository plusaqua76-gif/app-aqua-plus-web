import { SelectFilterOption } from '@interfaces/table/Itable';

const BADGE_BASE =
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap';

const BILL_ESTADO_OPTIONS = [
  {
    label: 'Pendiente',
    value: 'PENDIENTE',
    badgeClass: `${BADGE_BASE} bg-amber-100 text-amber-800 border border-amber-200/80 dark:bg-amber-900/35 dark:text-amber-300 dark:border-amber-700/50`,
  },
  {
    label: 'Pagada',
    value: 'PAGADA',
    badgeClass: `${BADGE_BASE} bg-emerald-100 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-900/35 dark:text-emerald-300 dark:border-emerald-700/50`,
  },
  {
    label: 'Vencida',
    value: 'VENCIDA',
    badgeClass: `${BADGE_BASE} bg-red-100 text-red-800 border border-red-200/80 dark:bg-red-900/35 dark:text-red-300 dark:border-red-700/50`,
  },
  {
    label: 'Aviso de suspensión',
    value: 'AVISO_DE_SUSPENSION',
    badgeClass: `${BADGE_BASE} bg-orange-100 text-orange-800 border border-orange-200/80 dark:bg-orange-900/35 dark:text-orange-300 dark:border-orange-700/50`,
  },
  {
    label: 'Pago inmediato',
    value: 'PAGO_INMEDIATO',
    badgeClass: `${BADGE_BASE} bg-sky-100 text-sky-800 border border-sky-200/80 dark:bg-sky-900/35 dark:text-sky-300 dark:border-sky-700/50`,
  },
  {
    label: 'Pago parcial',
    value: 'PAGO_PARCIAL',
    badgeClass: `${BADGE_BASE} bg-violet-100 text-violet-800 border border-violet-200/80 dark:bg-violet-900/35 dark:text-violet-300 dark:border-violet-700/50`,
  },
] as const;

const ESTADO_MAP: Record<string, (typeof BILL_ESTADO_OPTIONS)[number]> = {
  PENDIENTE: BILL_ESTADO_OPTIONS[0],
  PAGADA: BILL_ESTADO_OPTIONS[1],
  VENCIDA: BILL_ESTADO_OPTIONS[2],
  AVISO_DE_SUSPENSION: BILL_ESTADO_OPTIONS[3],
  PAGO_INMEDIATO: BILL_ESTADO_OPTIONS[4],
  PAGO_PARCIAL: BILL_ESTADO_OPTIONS[5],
};

const DEFAULT_BADGE = `${BADGE_BASE} bg-slate-100 text-slate-700 border border-slate-200/80 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-600/50`;

function findEstadoOption(estadoNombre: string | null | undefined) {
  if (!estadoNombre?.trim()) return null;
  return ESTADO_MAP[estadoNombre.trim().toUpperCase()] ?? null;
}

export function getBillEstadoBadgeClass(estadoNombre: string | null | undefined): string {
  return findEstadoOption(estadoNombre)?.badgeClass ?? DEFAULT_BADGE;
}

export function getBillEstadoDisplayLabel(estadoNombre: string | null | undefined): string {
  if (!estadoNombre?.trim()) return '';
  return findEstadoOption(estadoNombre)?.label ?? estadoNombre.replace(/_/g, ' ');
}

export const BILL_ESTADO_FILTER_OPTIONS: SelectFilterOption[] = BILL_ESTADO_OPTIONS.map(
  ({ label, value, badgeClass }) => ({ label, value, badgeClass }),
);
