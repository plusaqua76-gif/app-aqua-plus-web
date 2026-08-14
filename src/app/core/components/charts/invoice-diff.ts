import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { ColombianCurrencyPipe } from '../../../shared/pipes/colombian-currency.pipe';

// ─── Domain types ─────────────────────────────────────────────────────────────

type SortField = 'nombre' | 'nuid' | 'factura' | 'movil' | 'web' | 'diferencia';
type SortDir   = 'asc' | 'desc';

interface FacturaDiff {
  nombre:   string;
  nuid:     string;
  factura:  string;
  movil:    number;
  web:      number;
  diferencia: number;   // web - movil
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_FACTURAS: FacturaDiff[] = [
  { nombre: 'Ana Perdomo',     nuid: 'ACU-002', factura: 'F-2025-0542', movil:  38_700, web:  39_200, diferencia:   -500 },
  { nombre: 'Rosa Trujillo',   nuid: 'ACU-004', factura: 'F-2025-0544', movil:  29_800, web:  28_500, diferencia:  1_300 },
  { nombre: 'Pedro Vargas',    nuid: 'ACU-007', factura: 'F-2025-0547', movil:  33_200, web:  35_000, diferencia: -1_800 },
  { nombre: 'Diana Rojas',     nuid: 'ACU-010', factura: 'F-2025-0550', movil:  71_200, web:  68_000, diferencia:  3_200 },
  { nombre: 'Hernán Cárdenas', nuid: 'ACU-013', factura: 'F-2025-0553', movil:  58_300, web:  60_000, diferencia: -1_700 },
  { nombre: 'Néstor Prada',    nuid: 'ACU-017', factura: 'F-2025-0557', movil:  43_800, web:  44_500, diferencia:   -700 },
  { nombre: 'Carmen López',    nuid: 'ACU-021', factura: 'F-2025-0561', movil:  22_500, web:  24_200, diferencia: -1_700 },
  { nombre: 'Fabio Torres',    nuid: 'ACU-025', factura: 'F-2025-0565', movil:  55_000, web:  52_800, diferencia:  2_200 },
  { nombre: 'Gloria Sáenz',    nuid: 'ACU-031', factura: 'F-2025-0571', movil:  48_600, web:  49_100, diferencia:   -500 },
  { nombre: 'Miguel Ríos',     nuid: 'ACU-035', factura: 'F-2025-0575', movil:  36_100, web:  34_200, diferencia:  1_900 },
  { nombre: 'Patricia Núñez',  nuid: 'ACU-038', factura: 'F-2025-0578', movil:  61_400, web:  63_000, diferencia: -1_600 },
  { nombre: 'Julio Mora',      nuid: 'ACU-042', factura: 'F-2025-0582', movil:  27_900, web:  29_400, diferencia: -1_500 },
];

const TOTAL_FACTURAS = 18;
const COINCIDEN      = TOTAL_FACTURAS - MOCK_FACTURAS.length;   // 6
const TABLE_PAGE_SIZE = 5;
const TABLE_MIN_HEIGHT_PX = 280;

const MES_ABREV: Record<string, string> = {
  Enero: 'Ene', Febrero: 'Feb', Marzo: 'Mar', Abril: 'Abr',
  Mayo: 'May', Junio: 'Jun', Julio: 'Jul', Agosto: 'Ago',
  Septiembre: 'Sep', Octubre: 'Oct', Noviembre: 'Nov', Diciembre: 'Dic',
};

function currentPeriodBadge(): string {
  const now  = new Date();
  const year = now.getFullYear();
  const mes  = now.toLocaleString('es-CO', { month: 'long' });
  const key  = mes.charAt(0).toUpperCase() + mes.slice(1);
  const abrev = MES_ABREV[key] ?? key.slice(0, 3);
  return `${abrev} ${year}`;
}

@Component({
  selector: 'app-invoice-diff',
  standalone: true,
  imports: [CommonModule, ColombianCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="relative z-10 w-full h-full bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl rounded-2xl
            shadow-lg border border-white/10 dark:border-slate-700/30 p-3 sm:p-4 transition-all duration-300 flex flex-col">

  <!-- ── 1. Header ──────────────────────────────────────────────────────────── -->
  <div class="flex flex-wrap items-start justify-between gap-2 mb-2 shrink-0">
    <div class="min-w-0">
      <h2 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
        Comparación de Facturas
      </h2>
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        Discrepancias móvil vs web
      </p>
    </div>
    <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                 bg-blue-100/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shrink-0 self-start sm:self-auto">
      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      {{ periodBadge() }}
    </span>
  </div>

  <!-- ── 2. Alert banner ────────────────────────────────────────────────────── -->
  <div class="flex items-center gap-2 mb-2 px-2.5 py-1.5 rounded-lg shrink-0
              bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700/40">
    <svg class="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 flex-shrink-0"
         fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
    </svg>
    <p class="text-[11px] sm:text-xs text-rose-700 dark:text-rose-300 leading-snug">
      <strong>{{ conDiferencia() }} facturas</strong> con diferencias por
      <strong>{{ montoDiscrepancia() | colombianCurrency }}</strong>.
    </p>
  </div>

  <!-- ── 3. Table ───────────────────────────────────────────────────────────── -->
  <div class="flex-1 min-h-0 overflow-auto rounded-lg border border-white/20 dark:border-slate-700/30 custom-scrollbar"
       [style.min-height.px]="tableMinHeight">
    <table class="w-full text-xs sm:text-sm">

      <!-- thead -->
      <thead class="sticky top-0 z-[1]">
        <tr class="bg-white/30 dark:bg-slate-700/40 border-b border-white/20 dark:border-slate-700/30 backdrop-blur-sm">
          @for (col of columns; track col.field) {
            <th (click)="setSort(col.field)"
                class="px-2.5 sm:px-3 py-2.5 text-left text-[10px] sm:text-xs font-bold uppercase
                       text-gray-500 dark:text-gray-400 cursor-pointer select-none
                       hover:text-gray-700 dark:hover:text-gray-200 transition-colors whitespace-nowrap">
              <span class="inline-flex items-center gap-1">
                {{ col.label }}
                <span class="text-[10px]">
                  @if (sortField() === col.field) {
                    {{ sortDir() === 'asc' ? '↑' : '↓' }}
                  } @else {
                    <span class="opacity-30">↑</span>
                  }
                </span>
              </span>
            </th>
          }
        </tr>
      </thead>

      <!-- tbody -->
      <tbody>
        @for (row of paginatedRows(); track row.factura; let odd = $odd) {
          <tr class="border-b border-white/10 dark:border-slate-700/20 transition-colors
                     hover:bg-white/20 dark:hover:bg-slate-700/20"
              [ngClass]="!odd ? 'bg-white/10' : ''">
            <!-- Cliente -->
            <td class="px-2.5 sm:px-3 py-2.5 sm:py-3 font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap">
              {{ row.nombre }}
            </td>
            <td class="px-2.5 sm:px-3 py-2.5 sm:py-3 text-gray-400 dark:text-gray-500 font-mono text-[10px] sm:text-xs whitespace-nowrap">
              {{ row.nuid }}
            </td>
            <td class="px-2.5 sm:px-3 py-2.5 sm:py-3 text-gray-500 dark:text-gray-400 font-mono text-[10px] sm:text-xs whitespace-nowrap">
              {{ row.factura }}
            </td>
            <td class="px-2.5 sm:px-3 py-2.5 sm:py-3 text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
              {{ row.movil | colombianCurrency }}
            </td>
            <td class="px-2.5 sm:px-3 py-2.5 sm:py-3 text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
              {{ row.web | colombianCurrency }}
            </td>
            <td class="px-2.5 sm:px-3 py-2.5 sm:py-3 font-bold whitespace-nowrap"
                [ngClass]="row.diferencia < 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'">
              {{ row.diferencia > 0 ? '+' : '' }}{{ fmtDiff(row.diferencia) }}
            </td>
            <!-- Estado -->
            <td class="px-2.5 sm:px-3 py-2.5 sm:py-3 whitespace-nowrap">
              <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] sm:text-xs font-semibold
                           bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300
                           border border-rose-200 dark:border-rose-700/40">
                <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
                </svg>
                Diferencia
              </span>
            </td>
          </tr>
        }
      </tbody>

    </table>
  </div>

  @if (sorted().length > 0) {
  <!-- ── 5. Paginación ──────────────────────────────────────────────────────── -->
  <div class="mt-2 flex flex-wrap items-center justify-between gap-3 shrink-0">
    <p class="text-xs text-gray-500 dark:text-gray-400">
      Mostrando
      <span class="font-semibold text-gray-700 dark:text-gray-300">{{ rangeStart() }}–{{ rangeEnd() }}</span>
      de
      <span class="font-semibold text-gray-700 dark:text-gray-300">{{ sorted().length }}</span>
      facturas

    </p>
    <div class="flex items-center gap-1.5">
      <button
        type="button"
        (click)="goToPage(page() - 1)"
        [disabled]="page() <= 1"
        class="px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/20 dark:border-slate-600/40
               text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-slate-700/40 transition-all
               disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent">
        Anterior
      </button>
      @for (p of pageNumbers(); track p) {
        <button
          type="button"
          (click)="goToPage(p)"
          class="min-w-[2rem] px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all"
          [ngClass]="p === page()
            ? 'bg-orange-500/20 border-orange-500/40 text-orange-600 dark:text-orange-400'
            : 'border-white/20 dark:border-slate-600/40 text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-slate-700/40'">
          {{ p }}
        </button>
      }
      <button
        type="button"
        (click)="goToPage(page() + 1)"
        [disabled]="page() >= totalPages()"
        class="px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/20 dark:border-slate-600/40
               text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-slate-700/40 transition-all
               disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent">
        Siguiente
      </button>
    </div>
  </div>
  }

</div>
  `,
})
export class InvoiceDiffComponent {

  protected readonly totalFacturas = TOTAL_FACTURAS;
  protected readonly coinciden     = COINCIDEN;

  readonly periodBadge = computed(() => currentPeriodBadge());

  readonly sortField = signal<SortField>('diferencia');
  readonly sortDir   = signal<SortDir>('asc');
  readonly page           = signal(1);
  readonly pageSize       = TABLE_PAGE_SIZE;
  readonly tableMinHeight = TABLE_MIN_HEIGHT_PX;

  readonly columns: { field: SortField; label: string }[] = [
    { field: 'nombre',     label: 'Cliente'    },
    { field: 'nuid',       label: 'NUID'       },
    { field: 'factura',    label: 'N° Factura' },
    { field: 'movil',      label: 'Móvil ($)'  },
    { field: 'web',        label: 'Web ($)'    },
    { field: 'diferencia', label: 'Diferencia' },
  ];

  readonly conDiferencia = computed(() => MOCK_FACTURAS.length);

  readonly montoDiscrepancia = computed(() =>
    MOCK_FACTURAS.reduce((acc, r) => acc + Math.abs(r.diferencia), 0)
  );

  readonly tasaConcidencia = computed(() =>
    Math.round((COINCIDEN / TOTAL_FACTURAS) * 100)
  );

  readonly sorted = computed(() => {
    const field = this.sortField();
    const dir   = this.sortDir() === 'asc' ? 1 : -1;
    return [...MOCK_FACTURAS].sort((a, b) => {
      const va = a[field];
      const vb = b[field];
      if (typeof va === 'string' && typeof vb === 'string') {
        return va.localeCompare(vb, 'es') * dir;
      }
      return ((va as number) - (vb as number)) * dir;
    });
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.sorted().length / this.pageSize))
  );

  readonly paginatedRows = computed(() => {
    const page  = Math.min(this.page(), this.totalPages());
    const start = (page - 1) * this.pageSize;
    return this.sorted().slice(start, start + this.pageSize);
  });

  readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  readonly rangeStart = computed(() => {
    const total = this.sorted().length;
    if (total === 0) return 0;
    return (this.page() - 1) * this.pageSize + 1;
  });

  readonly rangeEnd = computed(() => {
    const total = this.sorted().length;
    if (total === 0) return 0;
    return Math.min(this.page() * this.pageSize, total);
  });

  setSort(field: SortField): void {
    if (this.sortField() === field) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDir.set('asc');
    }
    this.page.set(1);
  }

  goToPage(page: number): void {
    const safe = Math.max(1, Math.min(page, this.totalPages()));
    this.page.set(safe);
  }

  fmtDiff(v: number): string {
    return '$' + Math.abs(v).toLocaleString('es-CO');
  }
}
