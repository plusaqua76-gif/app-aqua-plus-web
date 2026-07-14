export function fmtCOP(v: number): string {
  return '$' + Math.abs(v).toLocaleString('es-CO');
}

export function fmtCOPCompact(v: number): string {
  const n = Math.abs(v);
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000)     return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)         return `$${(n / 1_000).toFixed(0)}K`;
  return fmtCOP(n);
}

export function fmtM3Compact(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M m³`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(0)}K m³`;
  return `${v.toLocaleString('es-CO')} m³`;
}
