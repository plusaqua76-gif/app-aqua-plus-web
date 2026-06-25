import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, inject, signal, computed, PLATFORM_ID } from '@angular/core'
import { isPlatformBrowser } from '@angular/common'
import { ActivatedRoute } from '@angular/router'
import { firstValueFrom } from 'rxjs'
import { LoaderPyment } from '../../components/loader-pyment'
import { WompiService } from '@services/wompi.service'
import { PymentService } from '../../services/pyment.service'
import { PymentResponse } from '@interfaces/pyment/start-pyment-response'
import { ResponseTransaccion } from '@interfaces/pyment/response-transaccion'
import { PseBanco } from '@interfaces/pyment/pse-banco'
import { IUserBill } from '@interfaces/IuserBill'
import { Checkbox } from '@shared/components/checkbox'

type Screen = 'methods' | 'card' | 'nequi' | 'transfer' | 'pse' | 'processing' | 'result'

interface StoredUserData {
  id: number
  nombre: string
  rolId: number
  rol: string
  personaId?: number
  empresaId: number
}

@Component({
  selector: 'app-pyment',
  standalone: true,
  imports: [LoaderPyment, Checkbox],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pyment.html',
})
export class Pyment implements OnInit, OnDestroy {

  private readonly route      = inject(ActivatedRoute)
  private readonly platformId = inject(PLATFORM_ID)
  protected readonly wompiService  = inject(WompiService)
  protected readonly pymentService = inject(PymentService)

  /** Construye la URL de retorno al comercio que Wompi usa tras el banco.
   *  Angular leerá `referencia` desde query params en ngOnInit y reanudará el polling. */
  private buildReturnUrl(referencia: string): string {
    if (!isPlatformBrowser(this.platformId)) return ''
    const { origin, pathname } = globalThis.location
    const monto     = this.montoCentavos()
    const tipoMedio = this.processingTipoMedio()
    return `${origin}${pathname}?referencia=${referencia}&monto=${monto}&tipoMedio=${tipoMedio}`
  }

  readonly screen        = signal<Screen>('methods')
  readonly lastPayMethod = signal<Screen>('card')
  readonly activeTab     = signal<'card' | 'transfer'>('card')

  readonly cardNumberDisplay = signal('•••• •••• •••• ••••')
  readonly cardNameDisplay   = signal('NOMBRE TITULAR')
  readonly cardExpiryDisplay = signal('MM/AA')
  readonly cardCvcDisplay    = signal('•••')
  readonly cardHasInput      = computed(() => this.cardNumberDisplay() !== '•••• •••• •••• ••••')

  readonly pymentData = signal<PymentResponse | null>(null)
  readonly loading    = signal(false)
  readonly errorMsg   = signal<string | null>(null)

  readonly resultEstado  = signal('')
  readonly resultMensaje = signal('')

  readonly acceptancePermalink = signal<string | null>(null)
  readonly dataAuthPermalink   = signal<string | null>(null)
  readonly acceptTerms         = signal(false)
  readonly acceptDataAuth      = signal(false)
  readonly termsAccepted       = computed(() => this.acceptTerms() && this.acceptDataAuth())
  readonly canPay              = computed(() => this.pymentData() !== null)

  readonly pseBancos = signal<PseBanco[]>([])

  readonly montoCentavos = signal(0)

  readonly montoFormateado = computed(() =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })
      .format(this.montoCentavos() / 100)
  )

  readonly cuotasOptions = computed(() =>
    [1, 3, 6, 12].map(n => ({ value: n, label: `${n} ${n === 1 ? 'cuota' : 'cuotas'}` }))
  )

  private cardNumber   = ''
  private cardHolder   = ''
  private cardExpMonth = ''
  private cardExpYear  = ''
  private cardCvc      = ''
  readonly cardCuotas  = signal(1)


  readonly nequiTelefono  = signal('')

  readonly pseCodigoBanco    = signal('')
  readonly pseTipoUsuario    = signal(0)
  readonly pseDocumento      = signal('')
  readonly pseTipoDocumento  = signal('CC')
  readonly pseNombreCompleto = signal('')
  readonly pseTelefono       = signal('')

  readonly billData = signal<IUserBill | null>(null)

  readonly processingEstado    = signal('')
  readonly processingTipoMedio = signal('')

  private userData: StoredUserData | null = null
  private pollingTimer: ReturnType<typeof setInterval> | null = null

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const raw = sessionStorage.getItem('userData')
      if (raw) {
        try { this.userData = JSON.parse(raw) } catch { /* ignore */ }
      }
      const montoParam = this.route.snapshot.queryParamMap.get('monto')
      if (montoParam) this.montoCentavos.set(Number(montoParam))
      const billParam = this.route.snapshot.queryParamMap.get('bill')
      if (billParam) {
        try { this.billData.set(JSON.parse(decodeURIComponent(billParam))) } catch { /* ignore */ }
      }
      const referenciaReturn =
        this.route.snapshot.queryParamMap.get('referencia') ??
        sessionStorage.getItem('pyment_referencia')
      if (referenciaReturn) {
        sessionStorage.removeItem('pyment_referencia')
        this.processingEstado.set('')
        const savedTipoMedio =
          this.route.snapshot.queryParamMap.get('tipoMedio') ??
          sessionStorage.getItem('pyment_tipo_medio') ??
          ''
        this.processingTipoMedio.set(savedTipoMedio)
        this.screen.set('processing')
        this.startPolling(referenciaReturn)
      }
    }

    this.wompiService.initialize().catch(() => { /* non-critical */ })

    this.pymentService.getMerchant().subscribe({
      next: (res) => {
        this.acceptancePermalink.set(res.response.data.presigned_acceptance.permalink)
        this.dataAuthPermalink.set(res.response.data.presigned_personal_data_auth.permalink)
      },
      error: err => console.error('Error cargando merchant:', err)
    })
  }

  ngOnDestroy(): void {
    if (this.pollingTimer) clearInterval(this.pollingTimer)
  }

  private initPyment(): void {
    if (!this.userData) return
    const email = this.route.snapshot.queryParamMap.get('email')
                  ?? `usuario${this.userData.id}@aquaplus.co`
    const bill = this.billData()
    
    this.loading.set(true)
    this.pymentService.startPyment({
      idUsuario:     this.userData.id,
      montoCentavos: this.montoCentavos(),
      emailCliente:  email,
      idFactura:     bill?.id,
      idEmpresa:     this.userData.empresaId
    }).subscribe({
      next: data => { this.pymentData.set(data.response); this.loading.set(false) },
      error: ()  => {
        this.loading.set(false)
        this.errorMsg.set('No se pudo iniciar el pago. Intenta más tarde.')
      }
    })
  }

  // ── Navigation ─────────────────────────────────────────────────────────
  goTo(s: Screen): void {
    if (s !== 'methods' && s !== 'processing' && s !== 'result') this.lastPayMethod.set(s)
    this.errorMsg.set(null)
    this.screen.set(s)
    // Lazy-load PSE bank list on first navigation to PSE screen
    if (s === 'pse' && this.pseBancos().length === 0) {
      this.loadPseBancos()
    }
  }

  setTab(tab: 'card' | 'transfer'): void { this.activeTab.set(tab) }

  // ── Checkbox / terms handlers ──────────────────────────────────────────
  onToggleTerms(checked: boolean): void {
    this.acceptTerms.set(checked)
    this.checkAndInitPyment()
  }

  onToggleDataAuth(checked: boolean): void {
    this.acceptDataAuth.set(checked)
    this.checkAndInitPyment()
  }

  private checkAndInitPyment(): void {
    if (this.termsAccepted() && !this.pymentData() && !this.loading()) {
      this.initPyment()
    }
  }

  private loadPseBancos(): void {
    this.pymentService.getBancosPSE().subscribe({
      next: res  => this.pseBancos.set(res.response),
      error: err => console.error('Error cargando bancos PSE:', err)
    })
  }

  formatCard(event: Event): void {
    const input = event.target as HTMLInputElement
    const v = input.value.replaceAll(/\D/g, '').substring(0, 16)
    input.value = v.match(/.{1,4}/g)?.join(' ') ?? v
    this.cardNumber = v
    this.cardNumberDisplay.set(v.padEnd(16, '•').match(/.{1,4}/g)!.join(' '))
  }

  formatExp(event: Event): void {
    const input = event.target as HTMLInputElement
    let v = input.value.replaceAll(/\D/g, '').substring(0, 4)
    if (v.length >= 2) v = v.substring(0, 2) + ' / ' + v.substring(2)
    input.value = v
    const digits     = v.replaceAll(/\D/g, '')
    this.cardExpMonth = digits.substring(0, 2)
    this.cardExpYear  = digits.substring(2, 4)
    this.cardExpiryDisplay.set(v || 'MM/AA')
  }

  onCardKey(event: KeyboardEvent): void {
    if (!(event.key.length > 1 || /[\d\s]/.test(event.key))) event.preventDefault()
  }

  updateCardName(event: Event): void {
    const v = (event.target as HTMLInputElement).value.toUpperCase()
    this.cardHolder = v
    this.cardNameDisplay.set(v || 'NOMBRE TITULAR')
  }

  updateCvc(event: Event): void {
    const v = (event.target as HTMLInputElement).value
    this.cardCvc = v
    this.cardCvcDisplay.set(v || '•••')
  }

  setCuotas(event: Event): void {
    this.cardCuotas.set(Number((event.target as HTMLSelectElement).value))
  }

  updateNequiPhone(event: Event): void {
    this.nequiTelefono.set(this.stripCountryCode((event.target as HTMLInputElement).value))
  }

  private stripCountryCode(value: string): string {
    const digits = value.replace(/\D/g, '')
    return digits.startsWith('57') && digits.length > 10 ? digits.slice(2) : digits
  }

  setPseBank(event: Event):      void { this.pseCodigoBanco.set((event.target as HTMLSelectElement).value) }
  setPseTipo(event: Event):      void { this.pseTipoUsuario.set(Number((event.target as HTMLSelectElement).value)) }
  setPseDocumento(event: Event): void { this.pseDocumento.set((event.target as HTMLInputElement).value) }
  setPseTipoDoc(event: Event):   void { this.pseTipoDocumento.set((event.target as HTMLSelectElement).value) }
  setPseNombre(event: Event):    void { this.pseNombreCompleto.set((event.target as HTMLInputElement).value) }
  setPseTelefono(event: Event):  void { this.pseTelefono.set((event.target as HTMLInputElement).value) }

  async payWithCard(): Promise<void> {
    const data = this.pymentData()
    if (!data) { this.errorMsg.set('Cargando datos de pago, por favor espera...'); return }
    if (!this.cardNumber || !this.cardHolder || !this.cardExpMonth || !this.cardCvc) {
      this.errorMsg.set('Por favor completa todos los campos de la tarjeta.')
      return
    }
    this.processingTipoMedio.set('CARD')
    this.processingEstado.set('')
    this.goTo('processing')
    try {
      const tokenResp = await firstValueFrom(
        this.pymentService.tokenizarTarjeta(
          {
            numero:         this.cardNumber,
            cvc:            this.cardCvc,
            mesExpiracion:  this.cardExpMonth,
            anioExpiracion: this.cardExpYear,
            nombreTitular:  this.cardHolder
          },
          data.clave_publica
        )
      )
      if (!tokenResp?.data?.id) throw new Error('No se pudo tokenizar la tarjeta')

      const apiResp = await firstValueFrom(
        this.pymentService.transaccion(
          {
            referencia:      data.referencia,
            acceptanceToken: data.acceptance_token,
            tipoMedio:       'CARD',
            token:           tokenResp.data.id,
            cuotas:          this.cardCuotas()
          },
          this.wompiService.deviceId() ?? '',
          this.wompiService.sessionId() ?? ''
        )
      )
      await this.handleTransaccionResult(apiResp.response)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error procesando el pago'
      this.transitionToResult('ERROR', msg)
    }
  }

  async payWithNequi(): Promise<void> {
    if (!this.nequiTelefono()) { this.errorMsg.set('Ingresa tu número de celular.'); return }
    await this.payWithPhone('NEQUI', this.nequiTelefono())
  }

  async payWithTransfer(): Promise<void> {
    const data = this.pymentData()
    if (!data) { this.errorMsg.set('Cargando datos de pago, por favor espera...'); return }
    this.processingTipoMedio.set('BANCOLOMBIA_TRANSFER')
    this.processingEstado.set('')
    this.goTo('processing')
    try {
      const apiResp = await firstValueFrom(
        this.pymentService.transaccion(
          {
            referencia:      data.referencia,
            acceptanceToken: data.acceptance_token,
            tipoMedio:       'BANCOLOMBIA_TRANSFER',
            redirectUrl:     this.buildReturnUrl(data.referencia)
          },
          this.wompiService.deviceId() ?? '',
          this.wompiService.sessionId() ?? ''
        )
      )
      await this.handleTransaccionResult(apiResp.response)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error procesando el pago'
      this.transitionToResult('ERROR', msg)
    }
  }

  async payWithPSE(): Promise<void> {
    const data = this.pymentData()
    if (!data) { this.errorMsg.set('Cargando datos de pago, por favor espera...'); return }
    if (!this.pseCodigoBanco() || !this.pseDocumento() || !this.pseNombreCompleto()) {
      this.errorMsg.set('Por favor completa todos los campos requeridos.')
      return
    }
    this.processingTipoMedio.set('PSE')
    this.processingEstado.set('')
    this.goTo('processing')
    try {
      const apiResp = await firstValueFrom(
        this.pymentService.transaccion(
          {
            referencia:      data.referencia,
            acceptanceToken: data.acceptance_token,
            tipoMedio:       'PSE',
            redirectUrl:     this.buildReturnUrl(data.referencia),
            tipoUsuario:     this.pseTipoUsuario(),
            documento:       this.pseDocumento(),
            tipoDocumento:   this.pseTipoDocumento(),
            codigoBanco:     this.pseCodigoBanco(),
            nombreCompleto:  this.pseNombreCompleto(),
            telefonoCliente: this.pseTelefono()
          },
          this.wompiService.deviceId() ?? '',
          this.wompiService.sessionId() ?? ''
        )
      )
      await this.handleTransaccionResult(apiResp.response)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error procesando el pago'
      this.transitionToResult('ERROR', msg)
    }
  }

  private async payWithPhone(tipoMedio: string, telefono: string): Promise<void> {
    const data = this.pymentData()
    if (!data) { this.errorMsg.set('Cargando datos de pago, por favor espera...'); return }
    this.processingTipoMedio.set(tipoMedio)
    this.processingEstado.set('')
    this.goTo('processing')
    try {
      const apiResp = await firstValueFrom(
        this.pymentService.transaccion(
          {
            referencia:      data.referencia,
            acceptanceToken: data.acceptance_token,
            tipoMedio,
            telefono
          },
          this.wompiService.deviceId() ?? '',
          this.wompiService.sessionId() ?? ''
        )
      )
      await this.handleTransaccionResult(apiResp.response)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error procesando el pago'
      this.transitionToResult('ERROR', msg)
    }
  }

  private async handleTransaccionResult(txResp: ResponseTransaccion): Promise<void> {
    if (['APPROVED', 'DECLINED', 'ERROR', 'VOIDED'].includes(txResp.estado)) {
      this.transitionToResult(txResp.estado, this.getMensajeEstado(txResp.estado))
      return
    }
    if (txResp.estado === 'PENDING') {
      if (txResp.redirect_url) {
        this.startPolling(txResp.referencia, true)
      } else {
        this.startPolling(txResp.referencia, false)
      }
    }
  }

  private startPolling(referencia: string, redirectMode = false): void {
    const maxMs = 15 * 60 * 1000 // 15 minutes per spec
    const startTime = Date.now()
    let redirectCalled = false

    this.pollingTimer = setInterval(async () => {
      // Global timeout
      if (Date.now() - startTime >= maxMs) {
        clearInterval(this.pollingTimer!); this.pollingTimer = null
        this.transitionToResult('ERROR', 'Tiempo agotado. Verifica el estado de tu pago.')
        return
      }
      try {
        const apiResp = await firstValueFrom(this.pymentService.pollTransaccion(referencia))
        const result = apiResp.response

        // Check redirect link expiration (PSE / Bancolombia)
        if (result.redirectExpiraEn && new Date(result.redirectExpiraEn) < new Date()) {
          clearInterval(this.pollingTimer!); this.pollingTimer = null
          this.transitionToResult('ERROR', 'El link de pago expiró. Por favor intenta nuevamente.')
          return
        }

        // Final states — stop polling
        if (['APPROVED', 'DECLINED', 'ERROR', 'VOIDED'].includes(result.estado)) {
          clearInterval(this.pollingTimer!); this.pollingTimer = null
          this.transitionToResult(result.estado, this.getMensajeEstado(result.estado))
          return
        }

        if (redirectMode && !redirectCalled && result.redirectLista && !result.redirectConsumido) {
          redirectCalled = true
          clearInterval(this.pollingTimer!); this.pollingTimer = null
          try {
            const redirectApiResp = await firstValueFrom(
              this.pymentService.redirectPyment(
                referencia,
                this.wompiService.deviceId() ?? '',
                this.wompiService.sessionId() ?? ''
              )
            )
            const url = redirectApiResp.response?.url
            if (url) {
              sessionStorage.setItem('pyment_tipo_medio', this.processingTipoMedio())
              sessionStorage.setItem('pyment_referencia', referencia)
              globalThis.location.href = url
            } else {
              this.transitionToResult('ERROR', 'No se pudo obtener la URL de redirección.')
            }
          } catch {
            this.transitionToResult('ERROR', 'No se pudo obtener la URL de redirección.')
          }
        }
      } catch {
        // Network error — keep polling until timeout
      }
    }, 3000) // poll every 3 seconds per spec
  }

  private getMensajeEstado(estado: string): string {
    switch (estado) {
      case 'APPROVED': return 'Tu servicio de acueducto ha sido pagado. El recibo quedará registrado en tu cuenta.'
      case 'DECLINED': return 'Pago no procesado. Intenta de nuevo o acércate a una oficina del acueducto.'
      case 'ERROR':    return 'Error técnico en el procesamiento. Contacta soporte si el problema persiste.'
      case 'VOIDED':   return 'Pago anulado. Puedes realizar el pago nuevamente en cualquier punto de atención.'
      default:         return 'Transacción finalizada. El estado de tu servicio de acueducto ha sido actualizado.'
    }
  }

  private transitionToResult(estado: string, mensaje: string): void {
    this.processingEstado.set(estado)
    // Allow the loader animation to play (~1.4 s) before switching screen
    setTimeout(() => this.showResult(estado, mensaje), 1400)
  }

  private showResult(estado: string, mensaje: string): void {
    this.resultEstado.set(estado)
    this.resultMensaje.set(mensaje)
    this.screen.set('result')
  }
}

