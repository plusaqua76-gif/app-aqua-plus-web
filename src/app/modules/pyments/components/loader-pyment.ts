import { Component, ChangeDetectionStrategy, signal, computed, Input, OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core'

interface Step { text: string; sub: string }

const STEPS: Record<string, Step[]> = {
  CARD: [
    { text: 'Procesando pago...',    sub: 'Conectando con la red de pago'    },
    { text: 'Validando tarjeta...',  sub: 'Verificando información segura'   },
    { text: 'Confirmando pago...',   sub: 'Aprobando transacción'            },
  ],
  NEQUI: [
    { text: 'Enviando notificación...', sub: 'Notificando a tu app Nequi'       },
    { text: 'Esperando confirmación...', sub: 'Confirma el pago en tu celular'  },
    { text: 'Verificando estado...',    sub: 'Actualizando transacción'         },
  ],
  PSE: [
    { text: 'Iniciando transacción...', sub: 'Conectando con el sistema PSE'   },
    { text: 'Generando link...',        sub: 'Preparando redirección segura'   },
    { text: 'Esperando banco...',       sub: 'Link del banco en preparación'   },
  ],
  BANCOLOMBIA_TRANSFER: [
    { text: 'Iniciando transferencia...', sub: 'Conectando con Bancolombia'     },
    { text: 'Generando link...',          sub: 'Preparando redirección segura'  },
    { text: 'Esperando banco...',         sub: 'Link del banco en preparación'  },
  ],
}

const DEFAULT_STEPS: Step[] = [
  { text: 'Procesando pago...',  sub: 'Conectando con el servidor'  },
  { text: 'Validando datos...',  sub: 'Verificando información'      },
  { text: 'Confirmando pago...', sub: 'Aprobando transacción segura' },
]

@Component({
  selector: 'app-loader-pyment',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Ripple loader -->
    <div class="loader">
      <div class="box" [class.box-hidden]="isSuccess() || isError()">
        <div class="logo">
          @if (icon) {
            <div class="pm-icon">
              <svg width="100%" height="100%"><use [attr.href]="icon"/></svg>
            </div>
          } @else {
            <svg viewBox="0 0 24 24" fill="currentColor" class="default-icon">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
          }
        </div>
      </div>
      <div class="box" [class.box-hidden]="isSuccess() || isError()"></div>
      <div class="box" [class.box-hidden]="isSuccess() || isError()"></div>
      <div class="box" [class.box-hidden]="isSuccess() || isError()"></div>
      <div class="box" [class.box-hidden]="isSuccess() || isError()"></div>

      <!-- Success state -->
      <div class="success-ring" [class.show]="isSuccess()"></div>
      <div class="checkmark" [class.show]="isSuccess()">
        <svg viewBox="0 0 52 52" fill="none">
          <circle cx="26" cy="26" r="24" stroke="#22c55e" stroke-width="2.5"/>
          <polyline class="check-path" points="14,27 22,35 38,18"
            stroke="#22c55e" stroke-width="3"
            stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <!-- Error state -->
      <div class="error-ring" [class.show]="isError()"></div>
      <div class="errormark" [class.show]="isError()">
        <svg viewBox="0 0 52 52" fill="none">
          <circle cx="26" cy="26" r="24" stroke="#ef4444" stroke-width="2.5"/>
          <line class="x-path-1" x1="17" y1="17" x2="35" y2="35"
            stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
          <line class="x-path-2" x1="35" y1="17" x2="17" y2="35"
            stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </div>
    </div>

    <!-- Status -->
    <div class="mt-9 flex flex-col items-center gap-[6px]">
      <p class="text-[17px] font-medium tracking-[0.02em] text-white/90 transition-opacity duration-300"
        [style.opacity]="textOpacity()">{{ statusText() }}</p>
      <p class="text-[13px] tracking-[0.04em] text-white/35">{{ statusSub() }}</p>
      <p class="result-label mt-[6px] translate-y-[10px] text-[28px] font-bold opacity-0 transition-all delay-[0.6s] duration-500"
        [class.show]="isSuccess() || isError()"
        [class.text-green-300]="isSuccess()"
        [class.text-red-400]="isError()">{{ resultLabel() }}</p>
    </div>

    <!-- Step dots -->
    <div class="mt-5 flex gap-2">
      @for (cls of dotClasses(); track $index) {
        <div [class]="cls"></div>
      }
    </div>

    <!-- Secure badge -->
    <div class="mt-7 flex items-center gap-[6px] text-[11px] tracking-[0.06em] text-white/[0.22]">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" class="opacity-30">
        <path d="M12 1L3 5v6c0 5.25 3.8 10.15 9 11.35C17.2 21.15 21 16.25 21 11V5L12 1z"/>
      </svg>
      Pago cifrado con TLS 256-bit
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }

    /* ══ LOADER ══ */
    .loader {
      --size: 250px;
      --duration: 2s;
      --background: linear-gradient(0deg, rgba(29,78,216,0.18) 0%, rgba(59,130,246,0.22) 100%);
      height: var(--size);
      aspect-ratio: 1;
      position: relative;
    }
    .loader .box {
      position: absolute;
      background: var(--background);
      border-radius: 50%;
      border-top: 1px solid rgba(147,197,253,1);
      backdrop-filter: blur(5px);
      animation: ripple var(--duration) infinite ease-in-out;
    }
    .loader .box:nth-child(1) { inset: 40%; z-index: 99; }
    .loader .box:nth-child(2) { inset: 30%; z-index: 98; border-color: rgba(147,197,253,0.8); animation-delay: 0.2s; }
    .loader .box:nth-child(3) { inset: 20%; z-index: 97; border-color: rgba(147,197,253,0.6); animation-delay: 0.4s; }
    .loader .box:nth-child(4) { inset: 10%; z-index: 96; border-color: rgba(147,197,253,0.4); animation-delay: 0.6s; }
    .loader .box:nth-child(5) { inset: 0%;  z-index: 95; border-color: rgba(147,197,253,0.2); animation-delay: 0.8s; }
    .loader .logo { position: absolute; inset: 0; display: grid; place-content: center; padding: 18%; }
    .loader .logo .pm-icon {
      width: 100%; aspect-ratio: 1; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; overflow: hidden;
      animation: color-change var(--duration) infinite ease-in-out;
    }
    .loader .logo .default-icon {
      width: 100%; aspect-ratio: 1; color: #60a5fa;
      animation: color-change var(--duration) infinite ease-in-out;
    }
    .loader .box.box-hidden { animation: none !important; opacity: 0; transition: opacity 0.4s; }

    @keyframes ripple {
      0%   { transform: scale(1);   }
      50%  { transform: scale(1.3); }
      100% { transform: scale(1);   }
    }
    @keyframes color-change {
      0%   { filter: drop-shadow(0 0 4px rgba(147,197,253,0.4)); }
      50%  { filter: drop-shadow(0 0 14px rgba(186,230,255,1)); }
      100% { filter: drop-shadow(0 0 4px rgba(147,197,253,0.4)); }
    }

    /* ══ SUCCESS ══ */
    .success-ring {
      position: absolute; inset: 0; border-radius: 50%;
      border: 2px solid #22c55e;
      opacity: 0; transform: scale(0.5);
      transition: opacity 0.5s, transform 0.5s cubic-bezier(0.34,1.56,0.64,1);
      z-index: 200;
    }
    .success-ring.show { opacity: 1; transform: scale(1); }
    .checkmark {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      z-index: 201; opacity: 0; transition: opacity 0.3s 0.3s;
    }
    .checkmark.show { opacity: 1; }
    .checkmark svg { width: 54px; height: 54px; }
    .checkmark .check-path { stroke-dasharray: 60; stroke-dashoffset: 60; }
    .checkmark.show .check-path { animation: draw-check 0.5s 0.4s ease forwards; }
    @keyframes draw-check { to { stroke-dashoffset: 0; } }

    /* ══ ERROR ══ */
    .error-ring {
      position: absolute; inset: 0; border-radius: 50%;
      border: 2px solid #ef4444;
      opacity: 0; transform: scale(0.5);
      transition: opacity 0.5s, transform 0.5s cubic-bezier(0.34,1.56,0.64,1);
      z-index: 200;
    }
    .error-ring.show { opacity: 1; transform: scale(1); }
    .errormark {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      z-index: 201; opacity: 0; transition: opacity 0.3s 0.3s;
    }
    .errormark.show { opacity: 1; }
    .errormark svg { width: 54px; height: 54px; }
    .x-path-1, .x-path-2 { stroke-dasharray: 26; stroke-dashoffset: 26; }
    .errormark.show .x-path-1 { animation: draw-x 0.35s 0.4s ease forwards; }
    .errormark.show .x-path-2 { animation: draw-x 0.35s 0.55s ease forwards; }
    @keyframes draw-x { to { stroke-dashoffset: 0; } }

    /* ══ RESULT LABEL ══ */
    .result-label.show { opacity: 1 !important; transform: translateY(0) !important; }

    /* ── Step dots ── */
    .step-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: rgba(255,255,255,0.15);
      transition: background 0.4s, transform 0.3s;
    }
    .step-dot.active        { background: #60a5fa; transform: scale(1.25); }
    .step-dot.done          { background: rgba(96,165,250,0.4); }
    .step-dot.done-success  { background: rgba(34,197,94,0.5); }
    .step-dot.done-error    { background: rgba(239,68,68,0.5); }
  `]
})
export class LoaderPyment implements OnInit, OnChanges, OnDestroy {
  @Input() icon = ''
  @Input() set estado(v: string)    { this._estado.set(v) }
  @Input() set tipoMedio(v: string) { this._tipoMedio.set(v) }

  readonly currentStepIndex = signal(0)
  readonly isSuccess        = signal(false)
  readonly isError          = signal(false)
  readonly textOpacity      = signal(1)

  private readonly _estado    = signal('')
  private readonly _tipoMedio = signal('')
  private cycleTimer: ReturnType<typeof setInterval> | null = null
  private fadeTimer:  ReturnType<typeof setTimeout>  | null = null

  private getSteps(): Step[] {
    return STEPS[this._tipoMedio()] ?? DEFAULT_STEPS
  }

  readonly statusText = computed(() => {
    if (this.isSuccess()) return '¡Pago aprobado!'
    if (this.isError())   return this.errorTextLabel()
    const steps = this.getSteps()
    const idx   = this.currentStepIndex()
    return steps[Math.min(idx, steps.length - 1)].text
  })

  readonly statusSub = computed(() => {
    if (this.isSuccess()) return '¡Transacción completada exitosamente!'
    if (this.isError())   return this.errorSubLabel()
    const steps = this.getSteps()
    const idx   = this.currentStepIndex()
    return steps[Math.min(idx, steps.length - 1)].sub
  })

  readonly resultLabel = computed(() => {
    if (this.isSuccess()) return 'Pago aprobado ✓'
    const e = this._estado()
    if (e === 'DECLINED') return 'Pago rechazado'
    if (e === 'VOIDED')   return 'Transacción anulada'
    if (this.isError())   return 'Error en el pago'
    return ''
  })

  readonly dotClasses = computed(() => {
    const idx   = this.currentStepIndex()
    const total = this.getSteps().length
    if (this.isSuccess()) return Array(total).fill('step-dot done-success')
    if (this.isError())   return Array(total).fill('step-dot done-error')
    return Array.from({ length: total }, (_, n) => {
      if (n < idx)   return 'step-dot done'
      if (n === idx) return 'step-dot active'
      return 'step-dot'
    })
  })

  ngOnInit(): void {
    this.startCycling()
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Skip first-change bindings — ngOnInit handles the initial start
    if (changes['tipoMedio'] && !changes['tipoMedio'].isFirstChange()
        && !this.isSuccess() && !this.isError()) {
      this.stopCycling()
      this.startCycling()
    }
    if (changes['estado'] && !changes['estado'].isFirstChange()) {
      const v = this._estado()
      if (v === 'APPROVED') {
        this.stopCycling()
        this.isError.set(false)
        this.isSuccess.set(true)
      } else if (v === 'DECLINED' || v === 'ERROR' || v === 'VOIDED') {
        this.stopCycling()
        this.isSuccess.set(false)
        this.isError.set(true)
      } else if (v === '' || v === 'PENDING') {
        this.isSuccess.set(false)
        this.isError.set(false)
        if (!this.cycleTimer) this.startCycling()
      }
    }
  }

  ngOnDestroy(): void {
    this.stopCycling()
    if (this.fadeTimer) clearTimeout(this.fadeTimer)
  }

  private startCycling(): void {
    this.stopCycling()
    this.currentStepIndex.set(0)
    this.cycleTimer = setInterval(() => this.advanceStep(), 2500)
  }

  private stopCycling(): void {
    if (this.cycleTimer) { clearInterval(this.cycleTimer); this.cycleTimer = null }
  }

  private advanceStep(): void {
    const steps = STEPS[this._tipoMedio()] ?? DEFAULT_STEPS
    const next  = (this.currentStepIndex() + 1) % steps.length
    this.textOpacity.set(0)
    this.fadeTimer = setTimeout(() => {
      this.currentStepIndex.set(next)
      this.textOpacity.set(1)
    }, 200)
  }

  private errorTextLabel(): string {
    switch (this._estado()) {
      case 'DECLINED': return 'Pago rechazado'
      case 'VOIDED':   return 'Transacción anulada'
      default:         return 'Error en el pago'
    }
  }

  private errorSubLabel(): string {
    switch (this._estado()) {
      case 'DECLINED': return 'El banco no autorizó la transacción'
      case 'VOIDED':   return 'La transacción fue anulada'
      default:         return 'Ocurrió un error técnico en el procesamiento'
    }
  }
}
