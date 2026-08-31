import { Component, DestroyRef, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { catchError, finalize, interval, of, startWith, switchMap, take, takeWhile } from 'rxjs';
import { PagoService } from '@services/pago.service';
import { EstadoPagoResponse } from '@interfaces/pago/estado-pago-response';

type ResultUiState = 'missing' | 'processing' | 'success' | 'declined' | 'error' | 'timeout';

@Component({
  selector: 'app-pago-resultado',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative min-h-screen overflow-hidden bg-black/70 px-4 py-16 sm:px-6">
      <div class="pointer-events-none absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full bg-blue-800/25 blur-[170px]"></div>
      <div class="pointer-events-none absolute bottom-[-260px] right-[6%] h-[560px] w-[560px] rounded-full bg-indigo-700/20 blur-[190px]"></div>

      <div class="relative z-10 mx-auto w-full max-w-lg">
        <div class="rounded-3xl border border-white/[0.08] bg-black/50 p-8 backdrop-blur-xl text-center">
          @switch (uiState()) {
            @case ('missing') {
              <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 text-red-400">
                <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h1 class="text-xl font-bold text-white">No pudimos identificar la factura</h1>
              <p class="mt-2 text-sm text-white/50">
                Falta el identificador de la factura en la URL. No podemos verificar el pago.
              </p>
            }
            @case ('processing') {
              <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/15 text-blue-400">
                <svg class="h-8 w-8 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              </div>
              <h1 class="text-xl font-bold text-white">Estamos verificando tu pago…</h1>
              <p class="mt-2 text-sm text-white/50">
                Esto puede tardar unos segundos. No cierres esta ventana.
              </p>
            }
            @case ('success') {
              <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 class="text-xl font-bold text-white">Pago aprobado</h1>
              <p class="mt-2 text-sm text-white/50">
                Tu factura quedó registrada como pagada.
              </p>
            }
            @case ('declined') {
              <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
                <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <h1 class="text-xl font-bold text-white">Pago rechazado</h1>
              <p class="mt-2 text-sm text-white/50">
                Wompi no pudo completar el pago. Puedes intentar de nuevo desde tus facturas.
              </p>
            }
            @case ('error') {
              <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 text-red-400">
                <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 class="text-xl font-bold text-white">No se pudo procesar el pago</h1>
              <p class="mt-2 text-sm text-white/50">
                Ocurrió un error al registrar el pago. Si te descontaron el dinero, espera unos minutos o contacta a tu acueducto.
              </p>
            }
            @case ('timeout') {
              <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/15 text-blue-300">
                <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 class="text-xl font-bold text-white">Tu pago sigue en proceso</h1>
              <p class="mt-2 text-sm text-white/50">
                Aún no tenemos confirmación. Puedes volver más tarde; el estado se actualizará cuando se confirme.
              </p>
            }
          }

          <button
            type="button"
            (click)="volverAFacturas()"
            class="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1d4ed8,#3b82f6,#1e40af)] py-3.5 text-sm font-bold tracking-wide text-white shadow-[0_4px_24px_rgba(59,130,246,0.4)] transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            Volver a mis facturas
          </button>
        </div>
      </div>
    </div>
  `,
})
export class PagoResultado implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pagoService = inject(PagoService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  readonly uiState = signal<ResultUiState>('processing');

  ngOnInit(): void {
    const raw = this.route.snapshot.queryParamMap.get('facturaId');
    const facturaId = raw ? Number(raw) : NaN;
    if (!raw || Number.isNaN(facturaId) || facturaId <= 0) {
      this.uiState.set('missing');
      return;
    }
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.startPolling(facturaId);
  }

  volverAFacturas(): void {
    this.router.navigate(['/shell/bills-users']);
  }

  private startPolling(facturaId: number): void {
    interval(3000)
      .pipe(
        startWith(0),
        take(15),
        switchMap(() =>
          this.pagoService.consultarEstadoPago(facturaId).pipe(
            catchError(() =>
              of({ success: false, message: '', code: 0, response: null as EstadoPagoResponse | null }),
            ),
          ),
        ),
        takeWhile((res) => !this.applyTerminal(res.response), true),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (this.uiState() === 'processing') {
            this.uiState.set('timeout');
          }
        }),
      )
      .subscribe({
        error: () => this.uiState.set('error'),
      });
  }

  private applyTerminal(data: EstadoPagoResponse | null | undefined): boolean {
    if (!data) return false;
    const estadoPago = (data.estadoPago ?? '').toUpperCase();
    const estadoFactura = (data.estadoFactura ?? '').toUpperCase();

    if (estadoPago === 'DECLINED') {
      this.uiState.set('declined');
      return true;
    }
    if (estadoPago === 'ERROR' || estadoPago === 'VOIDED') {
      this.uiState.set('error');
      return true;
    }
    if (estadoPago === 'APPROVED' && estadoFactura === 'PAG') {
      this.uiState.set('success');
      return true;
    }
    return false;
  }
}
