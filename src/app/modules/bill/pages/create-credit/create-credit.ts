import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

import { AbonoService } from '../../service/abono.service';
import { IAbonoFactura } from '@interfaces/abono/IAbonoFactura';
import { IAbonoReceiptData } from '@interfaces/abono/IAbonoReceipt';
import { IDeudaAbonoQueryData } from '@interfaces/deuda/IDeudaAbonoQueryData';
import { IDeudaCliente } from '@interfaces/deuda/IDeudaCliente';
import { ToastService } from '@services/toast.service';
import { PdfService } from '@services/pdf.service';
import { ColombianCurrencyPipe } from '@shared/pipes/colombian-currency.pipe';
import { AbonoReceipt } from '@components/abono-receipt/abono-receipt';
import { CounterEnterpriceService } from '../../../fee/services/counter-enterprice.service';

@Component({
  selector: 'app-create-credit',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ColombianCurrencyPipe,
    AbonoReceipt,
  ],
  templateUrl: './create-credit.html',
  standalone: true,
})
export class CreateCredit implements OnInit {
  deudaId = signal(0);
  debtDetail = signal<IDeudaCliente | null>(null);
  abonoForm!: FormGroup;

  guardandoAbono = signal(false);
  showReceiptModal = signal(false);
  receiptData = signal<IAbonoReceiptData | null>(null);
  pdfAction = signal<'download' | 'print' | null>(null);

  readonly procesandoPDF = computed(() => this.pdfAction() !== null);
  readonly descargandoPDF = computed(() => this.pdfAction() === 'download');
  readonly imprimiendoPDF = computed(() => this.pdfAction() === 'print');

  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  protected readonly fb = inject(FormBuilder);
  protected readonly abonoService = inject(AbonoService);
  protected readonly counterEnterpriceService = inject(CounterEnterpriceService);
  protected readonly toast = inject(ToastService);
  protected readonly pdfService = inject(PdfService);
  protected readonly platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);

  readonly userData = computed(() => {
    if (!this.isBrowser) return null;
    try {
      const userDataString = sessionStorage.getItem('userData');
      if (!userDataString) return null;
      return JSON.parse(userDataString);
    } catch {
      return null;
    }
  });

  readonly nombreUsuario = computed(() => this.userData()?.nombre || 'Sistema');
  readonly empresaId = computed(() => this.userData()?.empresaId ?? null);

  readonly parametroInteres = rxResource({
    params: () => ({ empresaId: this.empresaId() }),
    stream: ({ params }) => {
      const { empresaId } = params;
      if (!empresaId) {
        return of(null);
      }
      return this.counterEnterpriceService.getParamsEnterprice(empresaId, 'INTERES_DEUDA').pipe(
        catchError((error) => {
          console.error('Error loading interest parameter:', error);
          return of(null);
        })
      );
    },
  });

  readonly tasaInteres = computed(() => {
    const paramResponse = this.parametroInteres.value();
    if (!paramResponse?.response) return null;

    const param = Array.isArray(paramResponse.response)
      ? paramResponse.response[0]
      : paramResponse.response;

    return param?.valorParametro != null ? Number(param.valorParametro) : 0;
  });

  readonly saldoPendiente = computed(() => {
    const debt = this.debtDetail();
    if (!debt) return 0;
    if (debt.saldoPendiente != null) return Math.max(0, debt.saldoPendiente);
    const valorTotal = debt.valorTotal ?? debt.valor ?? 0;
    return Math.max(0, valorTotal - (debt.totalAbonado ?? 0));
  });

  readonly valorMes = computed(() => this.debtDetail()?.valorMes ?? 0);

  readonly valorTotalDeuda = computed(() => {
    const debt = this.debtDetail();
    return debt?.valorTotal ?? debt?.valor ?? 0;
  });

  readonly totalAbonado = computed(() => this.debtDetail()?.totalAbonado ?? 0);

  readonly plazoPago = computed(() => {
    const debt = this.debtDetail();
    if (!debt) return 1;
    return typeof debt.plazoPago === 'number'
      ? Math.max(1, debt.plazoPago)
      : Math.max(1, Number(debt.plazoPago) || 1);
  });

  ngOnInit(): void {
    this.abonoForm = this.fb.group({
      valor: ['', [Validators.required, Validators.pattern(/^\d+$/), Validators.min(1)]],
    });

    this.loadDebtFromQueryParams();
  }

  /** Proyección post-abono para el comprobante (los query params quedan desactualizados). */
  private proyectarCuotaDespuesAbono(
    nuevoSaldo: number,
    tasaInteresPercent: number
  ): { capitalCuota: number; interesCuota: number; valorMes: number } {
    const plazo = this.plazoPago();
    const capitalCuota = nuevoSaldo / plazo;
    const interesCuota = nuevoSaldo * (tasaInteresPercent / 100);
    return {
      capitalCuota,
      interesCuota,
      valorMes: capitalCuota + interesCuota,
    };
  }

  private loadDebtFromQueryParams(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const deudaParam = this.route.snapshot.queryParamMap.get('deuda');

    if (!idParam || !deudaParam) {
      this.toast.error('Error', 'No se recibió la información de la deuda.');
      this.goBack();
      return;
    }

    try {
      const data = JSON.parse(decodeURIComponent(deudaParam)) as IDeudaAbonoQueryData;

      if (data.id !== Number(idParam)) {
        this.toast.error('Error', 'Los datos de la deuda no coinciden.');
        this.goBack();
        return;
      }

      this.deudaId.set(data.id);
      this.debtDetail.set(this.mapQueryToDeuda(data));
    } catch {
      this.toast.error('Error', 'No se pudo leer la información de la deuda.');
      this.goBack();
    }
  }

  private mapQueryToDeuda(data: IDeudaAbonoQueryData): IDeudaCliente {
    return {
      id: data.id,
      clienteNombre: data.clienteNombre,
      facturaCodigo: data.facturaCodigo,
      fechaDeuda: data.fechaDeuda,
      valor: data.valor,
      valorTotal: data.valorTotal ?? data.valor,
      totalAbonado: data.totalAbonado ?? 0,
      saldoPendiente: data.saldoPendiente,
      valorMes: data.valorMes,
      plazoPago: data.plazoPago,
      descripcion: data.descripcion ?? '',
      activo: true,
      usuarioCreacion: '',
      tipoDeuda: {
        id: data.tipoDeudaId ?? 0,
        nombre: data.tipoDeudaNombre ?? 'Deuda',
      },
      empresaClienteContador: { id: 0 },
      factura: data.facturaCodigo ? { id: 0, codigo: data.facturaCodigo } : undefined,
    };
  }

  goBack(): void {
    this.router.navigate(['/shell/bill/customer-debt']);
  }

  setValorAbono(valor: number): void {
    if (valor <= 0) return;
    this.abonoForm.patchValue({ valor: String(Math.round(valor)) });
    this.abonoForm.get('valor')?.markAsTouched();
  }

  abonarUnaCuota(): void {
    const sugerido = Math.min(Math.round(this.valorMes()), this.saldoPendiente());
    this.setValorAbono(sugerido);
  }

  abonarSaldoTotal(): void {
    this.setValorAbono(this.saldoPendiente());
  }

  onValorInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digitsOnly = input.value.replace(/\D/g, '');
    input.value = digitsOnly;
    this.abonoForm.patchValue({ valor: digitsOnly }, { emitEvent: false });
  }

  onSubmit(): void {
    if (this.abonoForm.invalid || !this.debtDetail()) {
      this.abonoForm.markAllAsTouched();
      this.toast.warning('Formulario inválido', 'Ingrese un valor entero válido para el abono.');
      return;
    }

    const valorAbono = Number(this.abonoForm.value.valor);
    const saldo = this.saldoPendiente();

    if (valorAbono <= 0) {
      this.toast.error('Valor inválido', 'El abono debe ser mayor a cero.');
      return;
    }

    if (valorAbono > saldo) {
      this.toast.error(
        'Valor inválido',
        `El abono no puede superar el saldo de capital (${saldo.toLocaleString('es-CO')}).`
      );
      return;
    }

    this.guardandoAbono.set(true);

    const abono: Partial<IAbonoFactura> = {
      valor: String(valorAbono),
      deudaCliente: { id: this.deudaId() } as any,
      usuarioCreacion: this.nombreUsuario(),
    };

    this.abonoService.saveAbono(abono as IAbonoFactura).subscribe({
      next: (response) => {
        this.guardandoAbono.set(false);
        this.toast.success('Éxito', 'El abono se registró correctamente.');
        this.openReceiptModal(valorAbono, response?.response);
      },
      error: () => {
        this.guardandoAbono.set(false);
        this.toast.error('Error al guardar', 'No se pudo registrar el abono. Intente más tarde.');
      },
    });
  }

  private openReceiptModal(valorAbono: number, abonoResponse: any): void {
    const debt = this.debtDetail();
    if (!debt) return;

    const saldoAnterior = this.saldoPendiente();
    const nuevoSaldo = Math.max(0, saldoAnterior - valorAbono);
    const tasa = this.tasaInteres();

    const tipoDeudaNombre =
      typeof debt.tipoDeuda === 'object' && 'nombre' in debt.tipoDeuda
        ? debt.tipoDeuda.nombre
        : 'Deuda';

    const receipt: IAbonoReceiptData = {
      codigo: abonoResponse?.id ? `ABO-${abonoResponse.id}` : `ABO-${Date.now()}`,
      fecha: abonoResponse?.fechaCreacion || new Date().toISOString(),
      clienteNombre: debt.clienteNombre ?? 'Cliente',
      facturaCodigo: debt.facturaCodigo ?? debt.factura?.codigo,
      descripcionDeuda: debt.descripcion,
      tipoDeudaNombre,
      valorAbono,
      saldoAnterior,
      saldoPendiente: nuevoSaldo,
      valorTotalDeuda: this.valorTotalDeuda(),
      numeroCuotas: this.plazoPago(),
      usuarioCreacion: this.nombreUsuario(),
    };

    if (tasa !== null) {
      const proyectado = this.proyectarCuotaDespuesAbono(nuevoSaldo, tasa);
      receipt.capitalCuota = proyectado.capitalCuota;
      receipt.interesCuota = proyectado.interesCuota;
      receipt.tasaInteresPercent = tasa;
      receipt.valorMesProyectado = proyectado.valorMes;
    }

    this.receiptData.set(receipt);
    this.showReceiptModal.set(true);
  }

  finishAndGoBack(): void {
    this.showReceiptModal.set(false);
    this.router.navigate(['/shell/bill/customer-debt']);
  }

  closeReceiptModal(): void {
    this.showReceiptModal.set(false);
  }

  async downloadReceiptPdf(): Promise<void> {
    await this.ejecutarAccionPdf('download');
  }

  async printReceipt(): Promise<void> {
    await this.ejecutarAccionPdf('print');
  }

  private async ejecutarAccionPdf(action: 'download' | 'print'): Promise<void> {
    const element = document.querySelector('.abono-receipt-content') as HTMLElement | null;
    if (!element) {
      this.toast.error('Error', 'No se encontró el comprobante para generar el PDF.');
      return;
    }

    if (this.pdfAction()) return;

    this.pdfAction.set(action);

    try {
      const codigo = (this.receiptData()?.codigo || 'comprobante-abono').replace(/[^\w.-]/g, '_');
      const filename = `${codigo}.pdf`;
      const isMobile = window.innerWidth <= 768;

      if (action === 'download') {
        if (isMobile) {
          await this.pdfService.convertElementToPdfAndOpen(element);
        } else {
          await this.pdfService.convertElementToPdf(element, filename);
        }
        this.toast.success('Éxito', 'Comprobante descargado correctamente');
      } else {
        await this.pdfService.convertElementToPdfAndPrint(element);
        this.toast.success('Éxito', 'Comprobante enviado a impresión');
      }
    } catch (error) {
      console.error('Error al generar comprobante:', error);
      this.toast.error('Error', 'No se pudo generar el comprobante');
    } finally {
      this.pdfAction.set(null);
    }
  }
}
