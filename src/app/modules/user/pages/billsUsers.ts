import { Component, computed, inject, PLATFORM_ID, effect, signal } from '@angular/core';
import { UserAccessService } from '../services/bill-users.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { PopupComponent } from '@shared/components/popUp';
import { IPaginationParams } from '@interfaces/IpaginatedResponse';
import { IUserBill } from '@interfaces/IuserBill';
import { ToastService } from '@services/toast.service';
import { PlazoPagoService } from '../../bill/service/print-bill-details.service';
import { PdfBill } from '@components/pdf-bill/pdf-bill';
import { PdfService } from '@services/pdf.service';
import { PagoService } from '@services/pago.service';
import { CheckoutPagoResponse } from '@interfaces/pago/checkout-pago-response';
import { WompiCheckoutSubmit } from '../../pagos/components/wompi-checkout-submit';
import { ErrorHandlerService } from '@shared/services/error-handler.service';
import {
  calcularComisionWompi,
  formatCop,
  WompiFeeBreakdown,
} from '../../../core/utils/wompi-fee.util';


@Component({
  selector: 'app-bills-users',
  imports: [CommonModule, PopupComponent, PdfBill, WompiCheckoutSubmit],
  template: `
    <div class="relative min-h-screen overflow-hidden bg-black/70 px-4 py-8 sm:px-6 lg:px-10">
      <!-- Fondos difuminados (coherente con módulo de pagos) -->
      <div class="pointer-events-none absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full bg-blue-800/25 blur-[170px]"></div>
      <div class="pointer-events-none absolute bottom-[-260px] right-[6%] h-[560px] w-[560px] rounded-full bg-indigo-700/20 blur-[190px]"></div>

      <div class="relative z-10 mx-auto w-full max-w-6xl">
        <!-- ═══ ENCABEZADO ═══ -->
        <header class="animate-fade-up mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="mb-1 text-[10px] font-medium uppercase tracking-[0.22em] text-blue-300/70">
              Mis facturas
            </p>
            <h1 class="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {{ title() }}
            </h1>
            <p class="mt-1.5 max-w-xl text-sm text-white/45">
              Consulta el historial de tus facturas y paga fácilmente la que tienes pendiente.
            </p>
          </div>

          <!-- Resumen -->

        </header>

        <!-- ═══ BARRA DE HERRAMIENTAS: BÚSQUEDA / FILTRO / SORT ═══ -->
        <div class="animate-fade-up mb-6 flex flex-col gap-3 rounded-2xl border border-white/[0.07] bg-black/40 p-3 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <!-- Búsqueda -->
          <div class="relative w-full lg:max-w-xs">
            <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
            <input
              type="text"
              [value]="searchTerm()"
              (input)="onSearchInput($event)"
              placeholder="Buscar por código, estado..."
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-9 pr-9 text-sm text-slate-100 outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-white/25 focus:border-blue-500/60 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
            />
            @if (searchTerm()) {
              <button
                (click)="clearSearch()"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/70"
                title="Limpiar búsqueda"
              >
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            }
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <!-- Filtro por estado -->
            <div class="relative">
              <select
                [value]="estadoFilter()"
                (change)="onEstadoFilterChange($event)"
                class="w-full appearance-none cursor-pointer rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-3.5 pr-9 text-sm text-slate-100 outline-none transition-[border-color,box-shadow] duration-200 focus:border-blue-500/60 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] [&_option]:bg-[#0f2040]"
              >
                <option value="">Todos los estados</option>
                @for (opt of estadoOptions; track opt) {
                  <option [value]="opt">{{ opt }}</option>
                }
              </select>

            </div>

            <!-- Campo de ordenamiento -->
            <div class="relative">
              <select
                [value]="sortField()"
                (change)="onSortFieldChange($event)"
                class="w-full appearance-none cursor-pointer rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-3.5 pr-9 text-sm text-slate-100 outline-none transition-[border-color,box-shadow] duration-200 focus:border-blue-500/60 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] [&_option]:bg-[#0f2040]"
              >
                <option value="">Ordenar por…</option>
                @for (col of userColumns(); track col.field) {
                  <option [value]="col.field">{{ col.header }}</option>
                }
              </select>
            </div>

            <!-- Dirección de ordenamiento -->
            <button
              (click)="toggleSortDir()"
              [disabled]="!sortField()"
              class="inline-flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-white/10 text-white/60 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
              [title]="sortDir() === 'asc' ? 'Ascendente' : 'Descendente'"
            >
              <i class="fa-solid text-sm {{ sortDir() === 'asc' ? 'fa-sort-up' : 'fa-sort-down' }}"></i>
            </button>

            <!-- Limpiar filtros -->
            @if (hasActiveFilters()) {
              <button
                (click)="clearFilters()"
                class="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3.5 py-2.5 text-sm font-medium text-white/55 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpiar
              </button>
            }
          </div>
        </div>

        <!-- ═══ ESTADO: CARGANDO ═══ -->
        @if (serverUserData.isLoading()) {
          <div class="grid grid-cols-1 gap-5">
            <div class="h-52 animate-pulse rounded-3xl border border-white/[0.06] bg-white/[0.03]"></div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              @for (s of [1,2,3]; track s) {
                <div class="h-44 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]"></div>
              }
            </div>
          </div>
        }

        <!-- ═══ ESTADO: ERROR ═══ -->
        @else if (serverUserData.error()) {
          <div class="animate-fade-up rounded-3xl border border-red-500/25 bg-red-500/[0.06] p-10 text-center backdrop-blur-xl">
            <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-red-500/40 bg-red-500/10">
              <svg class="h-7 w-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p class="mb-4 text-sm text-white/60">No pudimos cargar tus facturas. Intenta nuevamente.</p>
            <button
              (click)="reloadBills()"
              class="inline-flex items-center gap-2 rounded-xl border border-blue-500/40 bg-blue-500/15 px-5 py-2.5 text-sm font-medium text-blue-300 transition-colors hover:bg-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              Reintentar
            </button>
          </div>
        }

        <!-- ═══ ESTADO: SIN FACTURAS ═══ -->
        @else if (bills().length === 0) {
          <div class="animate-fade-up rounded-3xl border border-white/[0.08] bg-black/40 p-14 text-center backdrop-blur-xl">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
              <svg class="h-8 w-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            @if (hasActiveFilters()) {
              <p class="text-base font-semibold text-white/80">Sin resultados</p>
              <p class="mt-1 text-sm text-white/45">No encontramos facturas con los filtros aplicados.</p>
              <button
                (click)="clearFilters()"
                class="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-blue-500/40 bg-blue-500/15 px-5 py-2.5 text-sm font-medium text-blue-300 transition-colors hover:bg-blue-500/25"
              >
                Limpiar filtros
              </button>
            } @else {
              <p class="text-base font-semibold text-white/80">Aún no tienes facturas</p>
              <p class="mt-1 text-sm text-white/45">Cuando se generen tus facturas aparecerán aquí.</p>
            }
          </div>
        }

        <!-- ═══ CONTENIDO PRINCIPAL ═══ -->
        @else {
          <!-- ── FACTURA PRIORITARIA (pendiente por pagar) ── -->
          @if (facturaPrioritaria(); as bill) {
            <section class="animate-fade-up mb-8">
              <div class="mb-3 flex items-center gap-2 px-1">
                <span class="relative flex h-2.5 w-2.5">
                  <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                  <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-400"></span>
                </span>
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300">
                  Factura pendiente por pagar
                </p>
              </div>

              <div class="group relative overflow-hidden rounded-3xl border border-blue-500/40 bg-[linear-gradient(135deg,rgba(29,78,216,0.28),rgba(15,23,42,0.55)_45%,rgba(2,6,23,0.6))] p-6 shadow-[0_0_0_1px_rgba(80,120,255,0.12),0_20px_60px_rgba(0,10,60,0.45)] backdrop-blur-xl sm:p-8">
                <!-- Brillo decorativo -->
                <div class="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/25 blur-[80px] transition-opacity duration-500 group-hover:opacity-80"></div>

                <div class="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <!-- Info -->
                  <div class="flex-1">
                    <div class="mb-4 flex flex-wrap items-center gap-2.5">
                      <span [class]="estadoBadgeClass(bill.estadoNombre)">{{ bill.estadoNombre }}</span>
                      <span class="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium text-white/50">
                        {{ bill.tipoPagoNombre }}
                      </span>
                      <span class="font-mono text-[11px] tracking-wider text-white/40">#{{ bill.codigo }}</span>
                    </div>

                    <p class="text-[11px] uppercase tracking-widest text-white/40">Total a pagar</p>
                    <p class="mt-1 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                      {{ bill.precio | currency:'COP':'symbol-narrow':'1.0-0':'es' }}
                    </p>

                    <div class="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:max-w-lg">
                      <div>
                        <p class="text-[10px] uppercase tracking-widest text-white/35">Emisión</p>
                        <p class="mt-0.5 text-sm font-semibold text-white/85">{{ bill.fechaEmision | date:'dd MMM yyyy':'':'es' }}</p>
                      </div>
                      <div>
                        <p class="text-[10px] uppercase tracking-widest text-white/35">Vence</p>
                        <p class="mt-0.5 text-sm font-semibold text-white/85">{{ bill.fechaFin | date:'dd MMM yyyy':'':'es' }}</p>
                      </div>
                      <div>
                        <p class="text-[10px] uppercase tracking-widest text-white/35">Consumo</p>
                        <p class="mt-0.5 text-sm font-semibold text-white/85">{{ bill.consumo !== null ? (bill.consumo + ' m³') : 'N/D' }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Acciones -->
                  <div class="flex w-full flex-col gap-3 lg:w-64">
                    <button
                      (click)="selectedBillRow.set(bill); goToPyment()"
                      [disabled]="isPagoDisabled(bill)"
                      class="relative w-full overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#1d4ed8,#3b82f6,#1e40af)] py-4 text-sm font-bold tracking-wide text-white shadow-[0_4px_24px_rgba(59,130,246,0.4)] transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 after:absolute after:inset-0 after:bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.18)_50%,transparent_60%)] after:[background-size:200%_100%] after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100 hover:after:animate-[shimmerBtn_1.2s_infinite]"
                    >
                      <svg class="mb-0.5 mr-2 inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Pagar ahora
                    </button>
                    <button
                      (click)="viewUser(bill.id, bill)"
                      class="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] py-3.5 text-sm font-medium text-white/70 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver detalles
                    </button>
                  </div>
                </div>
              </div>
            </section>
          }

          <!-- ── HISTORIAL DE FACTURAS ── -->
          @if (facturasHistorial().length > 0) {
            <section class="animate-fade-up">
              <div class="mb-4 flex items-center justify-between px-1">
                <h2 class="flex items-center gap-2 text-sm font-semibold tracking-wide text-white/80">
                  <svg class="h-4 w-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Historial de facturas
                </h2>
              </div>

              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                @for (bill of facturasHistorial(); track bill.id) {
                  <article class="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 p-5 backdrop-blur-xl transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-[0_10px_40px_rgba(0,10,60,0.5)]">
                    <div class="mb-3 flex items-start justify-between gap-2">
                      <span [class]="estadoBadgeClass(bill.estadoNombre)">{{ bill.estadoNombre }}</span>
                      <span class="font-mono text-[10px] tracking-wider text-white/35">#{{ bill.codigo }}</span>
                    </div>

                    <p class="text-[10px] uppercase tracking-widest text-white/35">Valor</p>
                    <p class="mb-4 text-2xl font-bold tracking-tight text-white">
                      {{ bill.precio | currency:'COP':'symbol-narrow':'1.0-0':'es' }}
                    </p>

                    <div class="mb-4 grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-3">
                      <div>
                        <p class="text-[9px] uppercase tracking-widest text-white/30">Emisión</p>
                        <p class="mt-0.5 text-xs font-semibold text-white/70">{{ bill.fechaEmision | date:'dd MMM yy':'':'es' }}</p>
                      </div>
                      <div>
                        <p class="text-[9px] uppercase tracking-widest text-white/30">Vence</p>
                        <p class="mt-0.5 text-xs font-semibold text-white/70">{{ bill.fechaFin | date:'dd MMM yy':'':'es' }}</p>
                      </div>
                      <div>
                        <p class="text-[9px] uppercase tracking-widest text-white/30">Consumo</p>
                        <p class="mt-0.5 text-xs font-semibold text-white/70">{{ bill.consumo !== null ? (bill.consumo + ' m³') : 'N/D' }}</p>
                      </div>
                      <div>
                        <p class="text-[9px] uppercase tracking-widest text-white/30">Tipo</p>
                        <p class="mt-0.5 truncate text-xs font-semibold text-white/70">{{ bill.tipoPagoNombre }}</p>
                      </div>
                    </div>

                    <div class="mt-auto flex items-center gap-2">
                      <button
                        type="button"
                        (click)="viewUser(bill.id, bill)"
                        class="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-blue-500/40 bg-blue-500/[0.08] py-2.5 text-xs font-medium text-blue-300 transition-colors hover:bg-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        title="Ver detalles"
                      >
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver
                      </button>
                      <button
                        type="button"
                        (click)="selectedBillRow.set(bill); goToPyment()"
                        [disabled]="isPagoDisabled(bill)"
                        class="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-green-500/40 bg-green-500/[0.08] py-2.5 text-xs font-medium text-green-300 transition-colors hover:bg-green-500/20 focus:outline-none focus:ring-2 focus:ring-green-500/30 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-green-500/[0.08]"
                        title="Pagar factura"
                      >
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Pagar
                      </button>
                    </div>
                  </article>
                }
              </div>
            </section>
          }

          <!-- ── PAGINACIÓN ── -->
          @if (totalPaginas() > 1) {
            <nav class="animate-fade-up mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-black/40 px-5 py-4 backdrop-blur-xl sm:flex-row">
              <p class="text-xs text-white/45">
                Página <span class="font-semibold text-white/80">{{ paginaActual() + 1 }}</span>
                de <span class="font-semibold text-white/80">{{ totalPaginas() }}</span>
                · {{ totalRegistros() }} facturas
              </p>
              <div class="flex items-center gap-1.5">
                <button
                  (click)="paginaAnterior()"
                  [disabled]="paginaActual() === 0"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/60 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Anterior"
                >
                  <svg class="h-4 w-4 rotate-180" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                @for (p of paginas(); track p) {
                  <button
                    (click)="irAPagina(p)"
                    [class]="p === paginaActual()
                      ? 'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-blue-500/50 bg-blue-500/20 px-3 text-sm font-semibold text-blue-200'
                      : 'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-white/10 px-3 text-sm text-white/55 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white'"
                  >
                    {{ p + 1 }}
                  </button>
                }
                <button
                  (click)="paginaSiguiente()"
                  [disabled]="paginaActual() >= totalPaginas() - 1"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/60 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Siguiente"
                >
                  <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </nav>
          }
        }
      </div>
    </div>

    <app-pop-up
      [open]="showDeleteConfirm"
      [isConfirmation]="true"
      [title]="'Eliminar Usuario'"
      [message]="
        '¿Está seguro que desea eliminar este usuario? Esta acción no se puede deshacer.'
      "
      [confirmText]="'Eliminar'"
      [cancelText]="'Cancelar'"
      (confirmAction)="confirmDelete()"
    >
    </app-pop-up>

    <!-- Popup personalizado para mostrar detalles de la factura -->
    <div class="bill-popup-wrapper">
      <app-pop-up
        [open]="showBillDetailsPopup"
        [isConfirmation]="false"
        [title]="'Detalles de la Factura'"
        [cancelText]="'Cerrar'"
        [maxWidth]="'max-w-7xl'"
        [contentPadding]="'p-2'"
        (cancelAction)="closeBillDetailsPopup()"
      >
        <div class="bill-details-content">
          @if (billDetailsResource.isLoading()) {
            <div class="loading-container flex justify-center items-center p-8 m-4">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span class="ml-2 text-white">Cargando detalles de la factura...</span>
            </div>
          }

          @if (billDetailsResource.error()) {
            <div class="error-container text-center p-8 m-4 text-red-400">
              <div class="flex items-center justify-center mb-4">
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z">
                  </path>
                </svg>
                <p>Error al cargar los detalles de la factura</p>
              </div>
              <button
                (click)="retryLoadBillDetails()"
                class="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Reintentar
              </button>
            </div>
          }

          @if (billDetailsResource.value()?.response) {
            <div class="bill-container">
              <app-pdf-bill
                [selectedStatus]="selectedStatus()"
                [billData]="billDetailsResource.value()?.response || null"
                [valorDeuda]="valorDeuda()">
              </app-pdf-bill>
            </div>

            <!-- Botón flotante sticky para descarga PDF -->
            <div class="floating-download-button">
              <button
                  (click)="goToPyment()"
                  [disabled]="!puedeRealizarPago()"
                  class="inline-flex items-center justify-center rounded-xl border border-blue-500/70 bg-blue-500/15 px-6 py-3 text-sm font-medium text-blue-400 transition-[background-color,border-color,box-shadow] duration-300 ease-out hover:bg-blue-500/25 hover:border-blue-400/80 hover:shadow-[0_4px_16px_rgba(59,130,246,0.2)] focus:outline-none focus:ring-2 focus:ring-blue-400/40 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Ir a pagos"
                >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span class="ml-2">Pagar factura</span>
              </button>
              <button
                (click)="downloadPDF()"
                [disabled]="procesandoPDF()"
                class="inline-flex items-center justify-center rounded-xl border border-green-600/70 bg-green-500/10 px-6 py-3 text-sm text-green-400 hover:bg-green-500/20 focus:outline-none focus:ring-2 focus:ring-green-400/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Descargar factura en PDF"
              >
                @if (procesandoPDF()) {
                  <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span class="ml-2">Generando PDF...</span>
                } @else {
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <span class="ml-2">Descargar PDF</span>
                }
              </button>
            </div>
          }
        </div>
      </app-pop-up>

      @if (feeConfirmOpen() && feeBreakdown(); as fee) {
        <div class="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div class="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b1220] p-6 shadow-2xl">
            <h2 class="text-lg font-bold text-white">Confirmar pago</h2>
            <p class="mt-1 text-sm text-white/50">
              Al pagar en línea se suma el costo de la pasarela Wompi. Revisa el desglose antes de continuar.
            </p>

            <div class="mt-5 space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm">
              <div class="flex items-center justify-between text-white/70">
                <span>Valor de la factura</span>
                <span class="font-medium text-white">{{ formatMoney(fee.factura) }}</span>
              </div>
              <div class="flex items-center justify-between text-white/70">
                <span>Comisión Wompi (2,65% + $700)</span>
                <span class="font-medium text-white">{{ formatMoney(fee.comision) }}</span>
              </div>
              <div class="flex items-center justify-between text-white/70">
                <span>IVA 19% sobre comisión</span>
                <span class="font-medium text-white">{{ formatMoney(fee.iva) }}</span>
              </div>
              <div class="flex items-center justify-between border-t border-white/10 pt-2 text-white/70">
                <span>Costo de la transferencia</span>
                <span class="font-semibold text-amber-300">{{ formatMoney(fee.feeTotal) }}</span>
              </div>
              <div class="flex items-center justify-between border-t border-white/10 pt-3">
                <span class="font-semibold text-white">Total a pagar</span>
                <span class="text-lg font-bold text-blue-300">{{ formatMoney(fee.totalCobrar) }}</span>
              </div>
            </div>

            <p class="mt-3 text-xs leading-relaxed text-white/40">
              Este valor es el que se enviará a Wompi. El IVA aplica solo sobre la comisión, no sobre el valor de la factura.
            </p>

            <div class="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
              <button
                type="button"
                (click)="confirmFeeAndPay()"
                [disabled]="checkoutPending()"
                class="inline-flex flex-1 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1d4ed8,#3b82f6,#1e40af)] py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                Continuar a Wompi
              </button>
              <button
                type="button"
                (click)="cancelFeeConfirm()"
                [disabled]="checkoutPending()"
                class="inline-flex flex-1 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.03] py-3 text-sm font-medium text-white/70 hover:bg-white/[0.06] disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      }

      @if (checkoutPending()) {
        <div class="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div class="mx-4 w-full max-w-sm rounded-3xl border border-white/10 bg-black/70 p-8 text-center">
            <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/15 text-blue-400">
              <svg class="h-7 w-7 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            </div>
            <p class="text-lg font-semibold text-white">Redirigiendo a Wompi…</p>
            <p class="mt-1 text-sm text-white/45">No cierres esta ventana.</p>
          </div>
        </div>
      }

      @if (checkoutData(); as checkout) {
        <app-wompi-checkout-submit [checkout]="checkout" />
      }
    </div>
  `,
  styles: [`
    .bill-details-content {
      width: 100%;
      max-height: 75vh;
      overflow-y: auto;
      padding: 0;
    }

    /* Ajustar la escala de la factura para desktop */
    .bill-details-content :deep(.bill-content) {
      transform: scale(0.85);
      transform-origin: center top;
      margin: 0 auto 20px auto;
    }

    /* Asegurar padding inferior para que se vea todo el contenido */
    .bill-container {
      width: 100%;
      background: transparent;
      border-radius: 0;
      box-shadow: none;
      padding: 0 0 20px 0;
      margin: 0;
    }

    /* Responsive para mobile */
    @media (max-width: 768px) {
      .bill-details-content {
        max-height: 70vh;
      }

      .bill-details-content :deep(.bill-content) {
        transform: scale(0.6);
        transform-origin: center top;
        margin: 0 auto 15px auto;
      }
    }

    @media (max-width: 480px) {
      .bill-details-content {
        max-height: 65vh;
      }

      .bill-details-content :deep(.bill-content) {
        transform: scale(0.45);
        transform-origin: center top;
        margin: 0 auto 10px auto;
      }
    }

    /* Estilos para loading y error mejorados */
    .loading-container {
      background: rgba(0, 0, 0, 0.8);
      border-radius: 8px;
      backdrop-filter: blur(4px);
    }

    .error-container {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px;
      backdrop-filter: blur(4px);
    }

    /* Botón flotante sticky para descarga PDF */
    .floating-download-button {
      position: sticky;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 50;
      padding: 16px;
      display: flex;
      justify-content: center;
      gap: 12px;
      background: rgba(10, 12, 22, 0.70);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      transition: all 300ms ease;
    }

    /* Responsive para el botón flotante */
    @media (max-width: 768px) {
      .floating-download-button {
        padding: 12px;
        gap: 8px;
      }
      .floating-download-button button {
        padding: 8px 16px;
        font-size: 0.75rem;
      }
    }

    @media (max-width: 480px) {
      .floating-download-button {
        padding: 8px;
        gap: 6px;
      }
      .floating-download-button button {
        padding: 6px 12px;
        font-size: 0.7rem;
      }
    }
  `],
})
export class BillUsers {
  readonly userAccessService = inject(UserAccessService);
  readonly toastService = inject(ToastService);
  readonly billDetailsService = inject(PlazoPagoService);
  readonly pdfService = inject(PdfService);
  readonly pagoService = inject(PagoService);
  readonly errorHandler = inject(ErrorHandlerService);
  protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);

  title = signal('Gestión de Usuarios de Facturas');
  showDeleteConfirm = signal(false);
  itemToDelete = signal<number | null>(null);
  showBillDetailsPopup = signal(false);
  selectedBillId = signal<number | null>(null);
  selectedBillRow = signal<any>(null);
  procesandoPDF = signal(false);
  checkoutPending = signal(false);
  checkoutData = signal<CheckoutPagoResponse | null>(null);
  feeConfirmOpen = signal(false);
  feeBreakdown = signal<WompiFeeBreakdown | null>(null);

  userColumns = signal([
    { field: 'codigo', header: 'Código', type: 'text' as const },
    { field: 'consumo', header: 'Consumo', type: 'number' as const },
    { field: 'estadoNombre', header: 'Estado', type: 'text' as const },
    { field: 'fechaEmision', header: 'Fecha Emisión', type: 'date' as const },
    { field: 'fechaFin', header: 'Fecha Fin', type: 'date' as const },
    { field: 'precio', header: 'Precio', type: 'number' as const },
  ]);

  // Parámetros de paginación
  readonly paginationParams = signal<IPaginationParams>({
    page: 0,
    size: 5,
  });

  // ── Estado de búsqueda / filtro / ordenamiento ──
  readonly searchTerm = signal('');
  readonly estadoFilter = signal('');
  readonly sortField = signal('');
  readonly sortDir = signal<'asc' | 'desc'>('asc');

  readonly estadoOptions = [
    'PENDIENTE',
    'PAGO INMEDIATO',
    'PAGO PARCIAL',
    'AVISO DE SUSPENSIÓN',
    'PAGADA',
    'VENCIDA',
    'INACTIVO',
  ];

  private searchDebounce: ReturnType<typeof setTimeout> | null = null;

  readonly hasActiveFilters = computed(
    () => !!this.searchTerm() || !!this.estadoFilter() || !!this.sortField()
  );

  // ── Helpers visuales (no alteran la lógica de negocio) ──
  readonly bills = computed<IUserBill[]>(
    () => this.serverUserData.value()?.response ?? []
  );

  readonly totalPaginas = computed(
    () => this.serverUserData.value()?.totalPages ?? 0
  );

  readonly paginaActual = computed(
    () => this.serverUserData.value()?.currentPage ?? this.paginationParams().page
  );

  readonly totalRegistros = computed(
    () => this.serverUserData.value()?.totalCount ?? this.bills().length
  );

  readonly paginas = computed(() =>
    Array.from({ length: this.totalPaginas() }, (_, i) => i)
  );

  // Primera factura pagable de la página → se destaca visualmente
  readonly facturaPrioritaria = computed<IUserBill | null>(
    () => this.bills().find((b) => this.esPagable(b)) ?? null
  );

  readonly facturasHistorial = computed<IUserBill[]>(() => {
    const prioridad = this.facturaPrioritaria();
    return this.bills().filter((b) => b !== prioridad);
  });

  readonly totalPendientePagina = computed(() =>
    this.bills()
      .filter((b) => this.esPagable(b))
      .reduce((total, b) => total + (Number(b.precio) || 0), 0)
  );

  esPagable(row: IUserBill | null | undefined): boolean {
    const estado = (row?.estadoNombre || '').toString();
    if (!estado) return false;

    const estadosNoPermitidos = ['PAGADA', 'INACTIVO', 'VENCIDA'];
    if (estadosNoPermitidos.some((e) => estado.toUpperCase().includes(e))) {
      return false;
    }

    const estadosPermitidos = ['PENDIENTE', 'PAGO INMEDIATO', 'AVISO DE SUSPENSIÓN', 'PAGO PARCIAL'];
    return estadosPermitidos.some((e) => estado.toUpperCase().includes(e));
  }

  estadoBadgeClass(estado: string | null | undefined): string {
    const base =
      'inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.05em]';
    const value = (estado || '').toLowerCase();

    if (value.includes('pagad')) {
      return `${base} border border-green-500/40 bg-green-500/15 text-green-300`;
    }
    if (value.includes('vencid')) {
      return `${base} border border-red-500/40 bg-red-500/15 text-red-300`;
    }
    if (value.includes('pendiente') || value.includes('suspensi') || value.includes('parcial') || value.includes('inmediato')) {
      return `${base} border border-amber-500/40 bg-amber-500/15 text-amber-300`;
    }
    return `${base} border border-white/15 bg-white/[0.06] text-white/60`;
  }

  reloadBills(): void {
    this.serverUserData.reload?.();
  }

  irAPagina(page: number): void {
    if (page < 0) return;
    const total = this.totalPaginas();
    if (total > 0 && page > total - 1) return;
    if (page === this.paginaActual()) return;
    this.onPaginationChange({ ...this.paginationParams(), page });
  }

  paginaSiguiente(): void {
    this.irAPagina(this.paginaActual() + 1);
  }

  paginaAnterior(): void {
    this.irAPagina(this.paginaActual() - 1);
  }

  // ── Búsqueda / filtro / ordenamiento (server-side vía paginationParams) ──
  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    if (this.searchDebounce) clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.applyQuery(), 350);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    if (this.searchDebounce) clearTimeout(this.searchDebounce);
    this.applyQuery();
  }

  onEstadoFilterChange(event: Event): void {
    this.estadoFilter.set((event.target as HTMLSelectElement).value);
    this.applyQuery();
  }

  onSortFieldChange(event: Event): void {
    this.sortField.set((event.target as HTMLSelectElement).value);
    this.applyQuery();
  }

  toggleSortDir(): void {
    if (!this.sortField()) return;
    this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    this.applyQuery();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.estadoFilter.set('');
    this.sortField.set('');
    this.sortDir.set('asc');
    if (this.searchDebounce) clearTimeout(this.searchDebounce);
    this.applyQuery();
  }

  // Reconstruye los parámetros de paginación con búsqueda, filtros y sort,
  // reiniciando siempre a la primera página.
  private applyQuery(): void {
    const current = this.paginationParams();
    const search = this.searchTerm().trim();
    const estado = this.estadoFilter().trim();
    const field = this.sortField().trim();

    const params: IPaginationParams = {
      page: 0,
      size: current.size,
    };

    if (search) params.search = search;
    if (estado) params.filters = { estadoNombre: estado };
    if (field) params.sort = `${field},${this.sortDir()}`;

    this.onPaginationChange(params);
  }

  readonly exportFileName = computed(
    () => `usuarios_facturas_${new Date().toISOString().split('T')[0]}`
  );


  readonly userData = computed(() => {
    if (!this.isBrowser) return null;
    try {
      const userDataString = sessionStorage.getItem('userData');
      if (!userDataString) return null;
      return JSON.parse(userDataString);
    } catch (e) {
      console.error('Error parsing userData from sessionStorage:', e);
      return null;
    }
  });

  readonly empresaId = computed(() => {
    const data = this.userData();
    return data?.empresaId || null;
  });

  readonly personaId = computed(() => {
    const data = this.userData();
    return data?.personaId || null;
  });

  // Computed para obtener el estado de la factura desde billDetailsResource
  readonly selectedStatus = computed(() => {
    const billData = this.billDetailsResource.value()?.response;
    return billData?.factura?.estadoNombre || null;
  });

  // Computed para obtener el valor de deuda (si existe)
  readonly valorDeuda = computed(() => {
    const billData = this.billDetailsResource.value()?.response;

    // Si no hay datos o está cargando
    if (!billData || this.billDetailsResource.isLoading()) {
      return 0;
    }

    // Obtener las deudas desde la respuesta de billDetails
    const deudas = billData.deudaCliente;

    // Si no hay deudas
    if (!deudas || deudas.length === 0) {
      return 0;
    }

    // Sumar todas las deudas, manejando tanto string como number
    return deudas.reduce((total, deuda) => {
      const valorDeuda = deuda.valorTotal || 0;
      // Manejar tanto string como number por seguridad
      const valor = typeof valorDeuda === 'string'
        ? parseFloat(valorDeuda)
        : Number(valorDeuda);
      return total + (isNaN(valor) ? 0 : valor);
    }, 0);
  });


  serverUserData = rxResource({
    params: () => ({
      idPersona: this.personaId(),
      pagination: this.paginationParams(),
    }),
    stream: ({ params }) => {
      const { idPersona, pagination } = params;
      if (!idPersona) {
        return of(null);
      }
      return this.userAccessService.getBillByUserPersonPaginated(idPersona, pagination);
    },
  });

  billDetailsResource = rxResource({
    params: () => ({
      billId: this.selectedBillId(),
      IdEnterprice: this.empresaId(),
    }),
    stream: ({ params }) => {
      const { billId, IdEnterprice } = params;
      if (!billId) {
        return of(null);
      }
      return this.billDetailsService.getAllBillDetails(IdEnterprice, billId);
    },
  });

  // Manejo de acciones de la tabla
  handleTableAction(event: { action: string; row?: any }): void {
    if (event.action === 'view') {
     this.viewUser(event.row.id, event.row);
    } else if (event.action === 'delete' && event.row) {
      this.onDelete(event.row.id);
    }
  }


  viewUser(billId: number, row?: any): void {
    this.selectedBillId.set(billId);
    this.selectedBillRow.set(row ?? null);
    this.showBillDetailsPopup.set(true);
  }

  closeBillDetailsPopup(): void {
    this.showBillDetailsPopup.set(false);
    this.selectedBillId.set(null);
  }


  retryLoadBillDetails(): void {
    if (this.selectedBillId()) {
      this.billDetailsResource.reload?.();
    }
  }



  // Eliminar usuario
  onDelete(id: number): void {
    this.itemToDelete.set(id);
    this.showDeleteConfirm.set(true);
  }

  // Confirmar eliminación
  confirmDelete(): void {
    const userId = this.itemToDelete();
    if (userId !== null) {
      this.toastService.success('Eliminado', 'Usuario eliminado correctamente.');
      this.itemToDelete.set(null);
    }
    this.showDeleteConfirm.set(false);
  }

  onPaginationChange(params: IPaginationParams): void {
    this.paginationParams.set(params);
  }

goToPyment(): void {
  const bill = this.selectedBillRow();
  if (!bill) return;

  const estadoActual = (bill.estadoNombre as string) || '';
  const estadosNoPermitidos = ['PAGADA', 'INACTIVO', 'VENCIDA'];
  const esNoPermitido = estadosNoPermitidos.some(e =>
    estadoActual.toUpperCase().includes(e.toUpperCase())
  );

  if (esNoPermitido) {
    this.toastService.warning(
      'Pago no permitido',
      `La factura no se puede pagar en estado: "${estadoActual}"`
    );
    return;
  }

  const estadosPermitidos = ['PENDIENTE', 'PAGO INMEDIATO', 'AVISO DE SUSPENSIÓN', 'PAGO PARCIAL'];
  const esPermitido = estadosPermitidos.some(e =>
    estadoActual.toUpperCase().includes(e.toUpperCase())
  );

  if (!esPermitido) {
    this.toastService.warning(
      'Pago no permitido',
      `El estado "${estadoActual}" no permite realizar pagos`
    );
    return;
  }

  if (bill.id == null) {
    this.toastService.error('Error', 'No se pudo identificar la factura a pagar');
    return;
  }

  if (bill.precio == null || bill.precio <= 0) {
    this.toastService.error('Error', 'La factura no tiene un valor válido para pagar');
    return;
  }

  if (this.checkoutPending()) {
    return;
  }

  try {
    this.feeBreakdown.set(calcularComisionWompi(Number(bill.precio)));
    this.feeConfirmOpen.set(true);
  } catch {
    this.toastService.error('Error', 'No se pudo calcular el costo de la transferencia');
  }
}

formatMoney(value: number): string {
  return formatCop(value);
}

cancelFeeConfirm(): void {
  if (this.checkoutPending()) return;
  this.feeConfirmOpen.set(false);
  this.feeBreakdown.set(null);
}

confirmFeeAndPay(): void {
  const bill = this.selectedBillRow();
  const expected = this.feeBreakdown();
  if (!bill?.id || !expected) return;
  if (this.checkoutPending()) return;

  this.checkoutPending.set(true);
  this.pagoService.crearCheckout(bill.id).subscribe({
    next: (res) => {
      if (res.success && res.response) {
        const checkout = res.response;
        if (checkout.amountInCents !== expected.totalAmountInCents) {
          this.checkoutPending.set(false);
          this.feeConfirmOpen.set(false);
          this.toastService.error(
            'Error',
            'El monto del checkout no coincide con el desglose. Intenta de nuevo o contacta soporte.'
          );
          return;
        }
        this.feeConfirmOpen.set(false);
        this.checkoutData.set(checkout);
        return;
      }
      this.checkoutPending.set(false);
      this.toastService.error('Error', res.message || 'No se pudo iniciar el checkout');
    },
    error: (err) => {
      this.checkoutPending.set(false);
      this.toastService.error('Error', this.errorHandler.extractErrorMessage(err));
    },
  });
}

  async downloadPDF(): Promise<void> {
    if (!this.billDetailsResource.value()?.response) {
      this.toastService.error('Error', 'No hay datos de factura para descargar');
      return;
    }

    this.procesandoPDF.set(true);

    try {
      const billElement = document.querySelector('.bill-container .bill-content') as HTMLElement;
      if (!billElement) {
        this.toastService.error('Error', 'No se pudo encontrar el contenido de la factura para generar el PDF');
        this.procesandoPDF.set(false);
        return;
      }

      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
        const originalStyle = billElement.style.cssText;
        const originalTransform = billElement.style.transform;
        billElement.style.transform = 'scale(1)';
        billElement.style.transformOrigin = 'top left';
        billElement.style.width = '994px';
        billElement.style.overflow = 'visible';
        await new Promise(resolve => setTimeout(resolve, 100));
        const billData = this.billDetailsResource.value()?.response;
        const facturaId = billData?.factura?.id || 'factura';
        const empresaCodigo = billData?.empresa?.codigo || '';
        const clienteNombre = billData?.cliente?.primerNombre || 'cliente';
        const timestamp = new Date().getTime();

        const filename = `factura-${empresaCodigo}-${facturaId}-${clienteNombre}-${timestamp}.pdf`;

        await this.pdfService.convertElementToPdf(billElement, filename);

        billElement.style.cssText = originalStyle;
        billElement.style.transform = originalTransform;
      } else {
        // En desktop usar el método normal
        const billData = this.billDetailsResource.value()?.response;
        const facturaId = billData?.factura?.id || 'factura';
        const empresaCodigo = billData?.empresa?.codigo || '';
        const clienteNombre = billData?.cliente?.primerNombre || 'cliente';
        const timestamp = new Date().getTime();

        const filename = `factura-${empresaCodigo}-${facturaId}-${clienteNombre}-${timestamp}.pdf`;

        await this.pdfService.convertElementToPdf(billElement, filename);
      }

      this.toastService.success('Éxito', 'Factura descargada correctamente');

    } catch (error) {
      console.error('Error en downloadPDF:', error);
      this.toastService.error('Error', 'No se pudo generar el PDF. Intente nuevamente.');
    } finally {
      this.procesandoPDF.set(false);
    }
  }


  readonly puedeRealizarPago = computed(() => {
  const bill = this.selectedBillRow();
  if (!bill) return false;

  const estadoActual = bill.estadoNombre as string;
  if (!estadoActual) return false;

  const estadosNoPermitidos = ['PAGADA', 'INACTIVO', 'VENCIDA'];
  const esNoPermitido = estadosNoPermitidos.some(e =>
    estadoActual.toUpperCase().includes(e.toUpperCase())
  );
  if (esNoPermitido) return false;

  const estadosPermitidos = ['PENDIENTE', 'PAGO INMEDIATO', 'AVISO DE SUSPENSIÓN', 'PAGO PARCIAL'];
  return estadosPermitidos.some(e =>
    estadoActual.toUpperCase().includes(e.toUpperCase())
  );
});

isPagoDisabled(row: any): boolean {
  const estado = (row?.estadoNombre || '').toUpperCase();

  return ['PAGADA', 'INACTIVO', 'VENCIDA']
    .some(e => estado.includes(e));
}


}
