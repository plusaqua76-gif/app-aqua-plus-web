/** Clase base del tooltip — bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl rounded-2xl */
export const CHART_TOOLTIP_CLASS = 'chart-tooltip-blur';

export interface ChartTooltipShellOptions {
  minWidth?: string;
  padding?: string;
}

export function chartTooltipShell(
  content: string,
  opts: ChartTooltipShellOptions = {},
): string {
  const minWidth = opts.minWidth ?? '210px';
  const padding = opts.padding ?? '14px 18px';

  return `<div class="${CHART_TOOLTIP_CLASS}" style="padding:${padding};font-family:Inter,sans-serif;min-width:${minWidth};color:#f1f5f9;">${content}</div>`;
}
