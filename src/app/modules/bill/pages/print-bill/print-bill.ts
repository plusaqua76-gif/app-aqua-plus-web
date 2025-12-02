import { Component, inject, signal, computed, PLATFORM_ID, effect } from '@angular/core';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PdfBill } from "@components/pdf-bill/pdf-bill";
import { BillBack } from "@components/billBack/bill-back";
import { PdfService } from "../../../../core/services/pdf.service";
import { ToastService } from '../../../../core/services/toast.service';
import { EstadoService } from '../../service/estado.service';
import { PlazoPagoService } from '../../service/print-bill-details.service';
import { DeudaService } from '../../service/deuda.service';
import { AbonoService, IAbonoMassive, IAbonoMultiple, IAbonoItem } from '../../service/abono.service';
import { TipoDeudaService } from '../../service/tipoDeuda.service';
import { FacturaService } from '../../service/factura.service';
import { PopupComponent } from '@shared/components/popUp';
import { IAbonoFactura, IDeudaCliente } from '@interfaces/IdeudaFactura';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY, of, catchError } from 'rxjs';
import { ColombianCurrencyPipe } from '@shared/index';
import { IBillBackResponse } from '@interfaces/bill/Ibill-back';
import { DocumentAzureBlobService } from '../../../fee/services/document-azure-blob.service';

@Component({
  selector: 'app-print-bill',
  imports: [PdfBill, BillBack, FormsModule, ReactiveFormsModule, CommonModule, PopupComponent, ColombianCurrencyPipe],
  templateUrl: './print-bill.html',
  styleUrl: './print-bill.css'
})
export class PrintBill {

  readonly pdfService = inject(PdfService);
  readonly toast = inject(ToastService);
  readonly estadoService = inject(EstadoService);
  readonly billDetailsService = inject(PlazoPagoService);
  readonly documentService = inject(DocumentAzureBlobService);
  readonly deudaService = inject(DeudaService);
  readonly abonoService = inject(AbonoService);
  readonly tipoDeudaService = inject(TipoDeudaService);
  readonly facturaService = inject(FacturaService);
  readonly route = inject(ActivatedRoute);
  readonly fb = inject(FormBuilder);
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

constructor() {
  effect(() => {
   console.log("que lo que esta es la data de cleites deuda anidadas ", this.getConsolidationByClienteId.value())
  })
}


  isFlipped = signal(false);
  billBackData = signal<IBillBackResponse | null>(null);

  getStatus = rxResource({
    stream: () => this.estadoService.getAllEstado(),
  });

  tiposDeuda = rxResource({
    stream: () => this.tipoDeudaService.getAllTipoDeuda(),
  });

  clienteDeudas = rxResource({
    params: () => {
      const empresaClienteContadorId = this.route.snapshot.queryParamMap.get('empresaClienteContadorId');
      return empresaClienteContadorId;
    },
    stream: ({ params: empresaClienteContadorId }) => {
      if (!empresaClienteContadorId) {
        return of({ success: true, response: null, message: 'Sin deudas' });
      }
      return this.deudaService.getDebByCodeClienteContadorId(empresaClienteContadorId).pipe(
        catchError((error) => {
          console.warn('No se encontraron deudas (404 - normal):', error);
          return of({ success: true, response: null, message: 'Sin deudas' });
        })
      );
    },
  });

  billDetails = rxResource({
    params: () => {
      const billId = this.route.snapshot.paramMap.get('id');
      const empresaClienteContadorId = this.route.snapshot.queryParamMap.get('empresaClienteContadorId');
      return {
        billId: billId ? Number(billId) : null,
        empresaClienteContadorId: empresaClienteContadorId ? Number(empresaClienteContadorId) : null
      };
    },
    stream: ({ params }) => {
      if (!params.billId) {
        return EMPTY;
      }
      return this.billDetailsService.getAllBillDetails(params.billId);
    },
  });

  InvoiceBackTemplate = rxResource({
    params: () => {
      return { empresaId: this.enterpriceId() };
    },
    stream: ({ params }) => {
      if (!params.empresaId) {
        return of({ success: true, response: null, message: 'Sin template' });
      }
      return this.documentService.getInvoiceTemplateByEnterprise(params.empresaId).pipe(
        catchError((error) => {
          console.warn('No se encontró template de factura (404 - normal):', error);
          return of({ success: true, response: null, message: 'Sin template' });
        })
      );
    }
  });

  getConsolidationByClienteId = rxResource({
    params: () => ({
      empresaClienteContadorId: this.route.snapshot.queryParamMap.get('empresaClienteContadorId')
    }),
    stream: ({ params }) => {
      if (!params.empresaClienteContadorId) {
        return of({ success: true, response: null, message: 'Sin consolidación' });
      }
      return this.deudaService.getConsolidationByClienteId(Number(params.empresaClienteContadorId)).pipe(
        catchError((error) => {
          console.warn('No se encontró consolidación de deudas (404 - normal):', error);
          return of({ success: true, response: null, message: 'Sin consolidación' });
        })
      );
    }
  })


  tipoPago: 'total' | 'parcial' | null = null;
  valorPago: number | null = null;

  // Computed para controlar el loader local - Solo servicios críticos
  isLoading = computed(() => {
    return this.getStatus.isLoading() ||
           this.billDetails.isLoading() ||
           this.tiposDeuda.isLoading();
  });

  // Loading separado solo para deudas (opcional)
  isLoadingDeudas = computed(() => {
    return this.clienteDeudas.isLoading();
  });

  // Computed para verificar si hay errores críticos (solo servicios esenciales)
  hasErrors = computed(() => {
    return !!this.getStatus.error() ||
           !!this.billDetails.error() ||
           !!this.tiposDeuda.error();
  });

  // Computed para verificar errores en deudas (no crítico)
  hasDeudaErrors = computed(() => {
    return !!this.clienteDeudas.error();
  });

  // Computed para verificar si los datos están listos y sin errores
  isDataReady = computed(() => {
    return !this.isLoading() && !this.hasErrors();
  });

  // Computed para informar sobre servicios opcionales no disponibles
  serviciosOpcionalesInfo = computed(() => {
    const info: string[] = [];
    
    if (!this.getConsolidationByClienteId.value()?.response) {
      info.push('Sin consolidación de deudas');
    }
    
    if (!this.clienteDeudas.value()?.response) {
      info.push('Sin deudas pendientes');
    }
    
    if (!this.InvoiceBackTemplate.value()?.response) {
      info.push('Sin template de factura');
    }
    
    return info;
  });

  // Método para calcular el progreso de carga (solo servicios críticos)
  getLoadingProgress(): number {
    const services = [
      !this.getStatus.isLoading(),
      !this.billDetails.isLoading(),
      !this.tiposDeuda.isLoading()
    ];

    const completedServices = services.filter(Boolean).length;
    return Math.round((completedServices / services.length) * 100);
  }

  valorFactura = computed(() => {
    if (this.billDetails.error()) {
      console.warn('Error en billDetails:', this.billDetails.error());
      return 0;
    }

    const billData = this.billDetails.value()?.response;
    if (!billData?.totalesTarifas?.total) return 0;

    const valor = typeof billData.totalesTarifas.total === 'string'
      ? parseFloat(billData.totalesTarifas.total)
      : billData.totalesTarifas.total;
    return valor || 0;
  });


  selectedStatus = computed(() => {
    // Obtener el estadoNombre directamente del endpoint de la factura
    const billData = this.billDetails.value()?.response;
    return billData?.factura?.estadoNombre || null;
  });

  valorDeuda = computed(() => {
    // Si hay error o está cargando, asumir sin deudas (no es crítico)
    if (this.clienteDeudas.error() || this.clienteDeudas.isLoading()) {
      if (this.clienteDeudas.error()) {
        console.warn('Error en clienteDeudas (no crítico):', this.clienteDeudas.error());
      }
      return 0; // Sin deudas por defecto
    }

    const deudaResponse = this.clienteDeudas.value()?.response;
    if (!deudaResponse) return 0; // Sin deudas

    // Si es un array, sumar todas las deudas
    if (Array.isArray(deudaResponse)) {
      return deudaResponse.reduce((total, deuda: any) => {
        const valorDeuda = deuda.valorTotal || deuda.valor || 0;
        const valor = typeof valorDeuda === 'string' ? parseFloat(valorDeuda) : valorDeuda;
        return total + (isNaN(valor) ? 0 : valor);
      }, 0);
    }

    // Si es un objeto único
    const deudaData = deudaResponse as any;
    const valorDeuda = deudaData.valorTotal || deudaData.valor || 0;
    const valor = typeof valorDeuda === 'string' ? parseFloat(valorDeuda) : valorDeuda;
    return isNaN(valor) ? 0 : valor;
  });

  deudaInfo = computed(() => {
    try {
      const deudaResponse = this.clienteDeudas.value()?.response;
      // Si la respuesta es null (404 manejado), retornar null
      if (deudaResponse === null) {
        return null;
      }
      const deudaData = Array.isArray(deudaResponse) ? deudaResponse[0] : deudaResponse;
      return deudaData || null;
    } catch (error) {
      return null;
    }
  });

  // Nuevo computed para obtener todas las deudas
  todasLasDeudas = computed(() => {
    if (this.clienteDeudas.error() || this.clienteDeudas.isLoading()) {
      return [];
    }

    const deudaResponse = this.clienteDeudas.value()?.response;
    if (!deudaResponse) return [];

    return Array.isArray(deudaResponse) ? deudaResponse : [deudaResponse];
  });

  // Computed para contar el número de deudas
  cantidadDeudas = computed(() => {
    return this.todasLasDeudas().length;
  });

  // Computed para generar texto informativo de las deudas
  textoInformativoDeuda = computed(() => {
    const cantidad = this.cantidadDeudas();
    const valor = this.valorDeuda();

    if (cantidad === 0) return '';

    if (cantidad === 1) {
      return `Tienes 1 deuda pendiente por valor de $${valor.toLocaleString('es-CO')}`;
    }

    return `Tienes ${cantidad} deudas pendientes por un total de $${valor.toLocaleString('es-CO')}`;
  });


  procesandoPDF = signal(false);
  showAbonoPopup = signal(false);
  showConfirmPagoPopup = signal(false);
  showDeudasPopup = signal(false);
  abonoForm = this.fb.group({
    valor: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]]
  });
  procesandoAbono = signal(false);
  procesandoPago = signal(false);
  procesandoAbonoMasivo = signal(false);
  showConfirmPagoTotalPopup = signal(false);
  valoresAbonoIndividual = signal<{[key: number]: number}>({});
  tipoConfirmacion = signal<'total' | 'parcial'>('total');
  empresaClienteContadorId = computed(() => {
    const empresaClienteContadorId = this.route.snapshot.queryParamMap.get('empresaClienteContadorId');
    const id = empresaClienteContadorId ? Number(empresaClienteContadorId) : null;
    return id;
  });
  readonly userData = computed(() => {
    if (!this.isBrowser) return null;
    try {
      const userDataString = sessionStorage.getItem('userData');
      if (!userDataString) return null;
      return JSON.parse(userDataString);
    } catch (e) {
      console.warn('Error al parsear userData:', e);
      return null;
    }
  });

  readonly enterpriceId = computed(() => {
    const data = this.userData();
    return data?.empresaId || null;
  })

  readonly nombreUsuario = computed(() => {
    const data = this.userData();
    return data?.nombre || null;
  });



  onTipoPagoChange(): void {
    if (this.tipoPago === 'total') {
      this.valorPago = this.valorFactura();
    } else if (this.tipoPago === 'parcial') {
      this.valorPago = null;
    }
  }



  canConfirmarPago(): boolean {
    if (!this.tipoPago) {
      return false;
    }

    const estadoActual = this.selectedStatus();
    if (!estadoActual) {
      return false;
    }

    const estadosPermitidos = [
      'PENDIENTE',
      'ACTIVO',
      'VENCIDA',
      'AVISO DE SUSPENSIÓN',
      'PAGO PARCIAL'
    ];

    // Verificar si el estado actual está en la lista de permitidos
    const estadoPermitido = estadosPermitidos.some(estado =>
      estadoActual.toUpperCase().includes(estado.toUpperCase())
    );

    // Para pago parcial, verificar que el valor sea válido
    if (this.tipoPago === 'parcial') {
      return estadoPermitido && this.valorPago !== null && this.valorPago > 0 && this.valorPago <= this.valorFactura();
    }

    return estadoPermitido;
  }

  confirmarPago(): void {
    if (!this.canConfirmarPago()) {
      const estadoActual = this.selectedStatus();
      if (!estadoActual) {
        this.toast.warning('Advertencia', 'No se pudo obtener el estado de la factura');
      } else if (!this.tipoPago) {
        this.toast.warning('Advertencia', 'Debe seleccionar un tipo de pago');
      } else {
        this.toast.warning('Advertencia', `No se puede confirmar el pago para facturas en estado: ${estadoActual}`);
      }
      return;
    }

    // Mostrar popup de confirmación
    this.showConfirmPagoPopup.set(true);
  }

  // Método para ejecutar el pago después de la confirmación
  ejecutarConfirmacionPago(): void {
    this.procesandoPago.set(true);

    const montoPagado = this.tipoPago === 'total' ? this.valorFactura() : (this.valorPago || 0);
    const tipoPagoTexto = this.tipoPago === 'total' ? 'total' : 'parcial';
    const billId = Number(this.route.snapshot.paramMap.get('id'));
    const estadoNombre = this.selectedStatus();

    if (!billId || !estadoNombre) {
      this.toast.error('Error', 'No se pudo obtener la información necesaria para actualizar la factura');
      this.procesandoPago.set(false);
      this.closeConfirmPagoPopup();
      return;
    }

    // Determinar el nuevo estado basado en el tipo de pago
    const estados = this.getStatus.value()?.response;
    let nuevoEstadoId = null;

    if (estados) {
      const buscarPorNombre = (palabrasClave: string[]) =>
        estados.find(estado =>
          palabrasClave.some(palabra =>
            estado.nombre.toLowerCase().includes(palabra.toLowerCase())
          )
        );

      const estadoEncontrado = this.tipoPago === 'total'
        ? buscarPorNombre(['pagada', 'pago', 'cancelada'])
        : buscarPorNombre(['parcial', 'abono']);

      nuevoEstadoId = estadoEncontrado?.id;
    }

    if (!nuevoEstadoId) {
      this.toast.error('Error', 'No se pudo determinar el nuevo estado de la factura');
      this.procesandoPago.set(false);
      this.closeConfirmPagoPopup();
      return;
    }

    const nuevoEstadoNombre = estados?.find(e => e.id === nuevoEstadoId)?.nombre || estadoNombre;

    this.facturaService.updateStatusBill(billId, nuevoEstadoId, nuevoEstadoNombre).subscribe({
      next: (response) => {
        if (this.tipoPago === 'parcial' && this.valorPago !== null && this.valorPago < this.valorFactura()) {
          this.crearDeudaPorDiferencia();
        }

        this.toast.success(
          'Pago Confirmado',
          `Pago ${tipoPagoTexto} de $${montoPagado.toLocaleString('es-CO')} registrado correctamente. Estado actualizado a: ${nuevoEstadoNombre}`
        );

        // Recargar datos después del pago exitoso
        this.billDetails.reload?.();
        this.procesandoPago.set(false);
        this.closeConfirmPagoPopup();
      },
      error: (error) => {
        this.toast.error(
          'Error al confirmar pago',
          'No se pudo actualizar el estado de la factura. Intente nuevamente.'
        );
        this.procesandoPago.set(false);
        this.closeConfirmPagoPopup();
      }
    });
  }

  tieneDeuda(): boolean {
    return this.valorDeuda() > 0;
  }

  getValorAPagar(): number {
    return this.tipoPago === 'total' ? this.valorFactura() : (this.valorPago || 0);
  }

  async guardarEImprimir(): Promise<void> {
    const estadoActual = this.selectedStatus();
    if (!estadoActual) {
      this.toast.warning('Advertencia', 'No se pudo obtener el estado de la factura');
      return;
    }

    this.procesandoPDF.set(true);

    try {
      await this.guardarFactura();
      await this.downloadPDF();
      this.toast.success('Éxito', 'Factura guardada e impresa correctamente');

    } catch (error) {
      console.error('Error en guardarEImprimir:', error);
      this.toast.error('Error', 'No se pudo completar la operación');
    } finally {
      this.procesandoPDF.set(false);
    }
  }

  private async guardarFactura(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  }

  async downloadPDF(): Promise<void> {
    const billData = this.billDetails.value()?.response;
    if (!billData) {
      this.toast.error('Error', 'No hay datos de factura para descargar');
      return;
    }

    this.procesandoPDF.set(true);

    try {
      const frontElement = document.querySelector('.front .bill-content') as HTMLElement;
      const backElement = document.querySelector('.back .bill-back-container') as HTMLElement;

      if (!frontElement) {
        this.toast.error('Error', 'No se encontró el elemento de la factura (frente)');
        this.procesandoPDF.set(false);
        return;
      }

      if (!backElement) {
        this.toast.error('Error', 'No se encontró el elemento de la factura (reverso)');
        this.procesandoPDF.set(false);
        return;
      }

      const isMobile = window.innerWidth <= 768;
      const facturaId = billData?.factura?.id || 'factura';
      const empresaCodigo = billData?.empresa?.codigo || '';
      const clienteNombre = billData?.cliente?.primerNombre || 'cliente';
      const timestamp = new Date().getTime();
      const filename = `factura-${empresaCodigo}-${facturaId}-${clienteNombre}-${timestamp}.pdf`;

      if (isMobile) {
        await this.pdfService.convertTwoPagesToPdfAndOpen(frontElement, backElement);
      } else {
        await this.pdfService.convertTwoPagesToPdf(frontElement, backElement, filename);
      }

      this.toast.success('Éxito', 'PDF generado correctamente con frente y reverso');

    } catch (error) {
      console.error('Error en downloadPDF:', error);
      this.toast.error('Error', 'No se pudo generar el PDF. Intente nuevamente.');
    } finally {
      this.procesandoPDF.set(false);
    }
  }

  openAbonoPopup(): void {
    this.openDeudasPopup();
  }

  openDeudasPopup(): void {
    this.showDeudasPopup.set(true);
    this.valoresAbonoIndividual.set({});
  }

  closeDeudasPopup(): void {
    this.showDeudasPopup.set(false);
    this.procesandoAbonoMasivo.set(false);
    this.valoresAbonoIndividual.set({});
    this.tipoConfirmacion.set('total');
  }

  // Métodos helper para el template de deudas
  getTipoDeudaNombre(deuda: any): string {
    return deuda.tipoDeudaNombre || deuda.tipoDeuda?.nombre || 'Deuda General';
  }

  // Método para verificar si se puede pagar las deudas
  canPagarDeudas(): boolean {
    return this.valorDeuda() > 0 && !this.procesandoAbonoMasivo();
  }

  // Métodos para manejar valores de abono individual
  setValorAbonoIndividual(deudaIndex: number, valor: number): void {
    const valoresActuales = this.valoresAbonoIndividual();
    this.valoresAbonoIndividual.set({
      ...valoresActuales,
      [deudaIndex]: valor
    });
  }

  getValorAbonoIndividual(deudaIndex: number): number {
    return this.valoresAbonoIndividual()[deudaIndex] || 0;
  }

  // Computed para calcular el total de abonos parciales
  totalAbonosParciales = computed(() => {
    const valores = this.valoresAbonoIndividual();
    return Object.values(valores).reduce((total, valor) => total + (valor || 0), 0);
  });

  // Computed para obtener el número de deudas con valores ingresados
  cantidadDeudasConValores = computed(() => {
    const valores = this.valoresAbonoIndividual();
    return Object.values(valores).filter(valor => (valor || 0) > 0).length;
  });

  // Método para llenar todos los inputs con el valor total de cada deuda
  llenarValoresTotales(): void {
    const deudas = this.todasLasDeudas();
    const valoresCompletos: {[key: number]: number} = {};

    deudas.forEach((deuda, index) => {
      valoresCompletos[index] = this.getValorDeuda(deuda);
    });

    this.valoresAbonoIndividual.set(valoresCompletos);
  }

  realizarAbonoMasivo(): void {
    const usuario = this.nombreUsuario();

    if (!usuario) {
      this.toast.error('Error', 'No se pudo obtener la información del usuario');
      return;
    }

    const deudas = this.todasLasDeudas();
    if (deudas.length === 0) {
      this.toast.error('Error', 'No hay deudas pendientes para pagar');
      return;
    }

    // Validar que todos los valores sean válidos
    const items: any[] = [];
    let totalAPagar = 0;

    for (let i = 0; i < deudas.length; i++) {
      const deuda = deudas[i];
      const valorAbono = this.getValorAbonoIndividual(i);
      const valorMaximo = this.getValorDeuda(deuda);

      if (valorAbono <= 0) {
        this.toast.error('Error', `Debe ingresar un valor válido para la deuda #${i + 1}`);
        return;
      }

      if (valorAbono > valorMaximo) {
        this.toast.error('Error', `El valor para la deuda #${i + 1} no puede ser mayor a $${valorMaximo.toLocaleString('es-CO')}`);
        return;
      }

      items.push({
        deudaCliente: { id: deuda.id },
        valor: valorAbono
      });

      totalAPagar += valorAbono;
    }

    if (items.length === 0) {
      this.toast.error('Error', 'Debe ingresar al menos un valor para pagar');
      return;
    }

    this.procesandoAbonoMasivo.set(true);

    const abonoMultiple: any = {
      usuarioCreacion: usuario,
      items: items
    };

    this.abonoService.saveAbonoMultiple(abonoMultiple).subscribe({
      next: () => {
        this.toast.success(
          'Pago Exitoso',
          `Se ha procesado el pago de $${totalAPagar.toLocaleString('es-CO')} correctamente`
        );
        // Cerrar popups si están abiertos
        this.closeDeudasPopup();
        this.closeConfirmPagoTotalPopup();
        this.procesandoAbonoMasivo.set(false);
        // Limpiar valores
        this.valoresAbonoIndividual.set({});
        this.tipoConfirmacion.set('total');
        this.clienteDeudas.reload?.();
      },
      error: (err) => {
        console.error('Error al realizar pago:', err);
        this.toast.error('Error al procesar pago', 'No se pudo procesar el pago. Intente más tarde.');
        this.procesandoAbonoMasivo.set(false);
      }
    });
  }

  // Método para pagar solo las deudas con valores ingresados (pago parcial configurado)
  realizarPagoParcial(): void {
    const usuario = this.nombreUsuario();

    if (!usuario) {
      this.toast.error('Error', 'No se pudo obtener la información del usuario');
      return;
    }

    const deudas = this.todasLasDeudas();
    if (deudas.length === 0) {
      this.toast.error('Error', 'No hay deudas pendientes para pagar');
      return;
    }

    // Recopilar solo las deudas con valores ingresados (mayores a 0)
    const items: any[] = [];
    let totalAPagar = 0;

    for (let i = 0; i < deudas.length; i++) {
      const deuda = deudas[i];
      const valorAbono = this.getValorAbonoIndividual(i);
      const valorMaximo = this.getValorDeuda(deuda);

      // Solo incluir si hay un valor ingresado
      if (valorAbono > 0) {
        if (valorAbono > valorMaximo) {
          this.toast.error('Error', `El valor para la deuda #${i + 1} no puede ser mayor a $${valorMaximo.toLocaleString('es-CO')}`);
          return;
        }

        items.push({
          deudaCliente: { id: deuda.id },
          valor: valorAbono
        });

        totalAPagar += valorAbono;
      }
    }

    if (items.length === 0) {
      this.toast.error('Error', 'Debe ingresar al menos un valor para pagar');
      return;
    }

    this.procesandoAbonoMasivo.set(true);

    const abonoMultiple: any = {
      usuarioCreacion: usuario,
      items: items
    };

    this.abonoService.saveAbonoMultiple(abonoMultiple).subscribe({
      next: () => {
        this.toast.success(
          'Pago Parcial Exitoso',
          `Se ha procesado el pago de ${items.length} deuda(s) por un total de $${totalAPagar.toLocaleString('es-CO')}`
        );
        // Cerrar popups si están abiertos
        this.closeDeudasPopup();
        this.closeConfirmPagoTotalPopup();
        this.procesandoAbonoMasivo.set(false);
        // Limpiar valores
        this.valoresAbonoIndividual.set({});
        this.tipoConfirmacion.set('total');
        this.clienteDeudas.reload?.();
      },
      error: (err) => {
        console.error('Error al realizar pago parcial:', err);
        this.toast.error('Error al procesar pago', 'No se pudo procesar el pago. Intente más tarde.');
        this.procesandoAbonoMasivo.set(false);
      }
    });
  }

  // Método para confirmar pago total de todas las deudas
  confirmarPagoTotal(): void {
    const valorTotal = this.valorDeuda();

    if (valorTotal <= 0) {
      this.toast.error('Error', 'No hay deudas pendientes para pagar');
      return;
    }

    // Llenar todos los valores con el total de cada deuda
    this.llenarValoresTotales();
    this.tipoConfirmacion.set('total');

    // Mostrar popup de confirmación
    this.showConfirmPagoTotalPopup.set(true);
  }

  // Método para confirmar pago parcial (solo deudas con valores)
  confirmarPagoParcial(): void {
    const valoresIngresados = this.valoresAbonoIndividual();
    const tienePagos = Object.values(valoresIngresados).some(valor => (valor || 0) > 0);

    if (!tienePagos) {
      this.toast.error('Error', 'Debe ingresar al menos un valor para pagar');
      return;
    }

    this.tipoConfirmacion.set('parcial');

    // Mostrar popup de confirmación
    this.showConfirmPagoTotalPopup.set(true);
  }

  // Método para confirmar pago total de todas las deudas
  confirmarPagoTotalDeudas(): void {
    const valorTotal = this.valorDeuda();

    if (valorTotal <= 0) {
      this.toast.error('Error', 'No hay deudas pendientes para pagar');
      return;
    }

    // Llenar todos los valores con el total de cada deuda
    this.llenarValoresTotales();
    this.tipoConfirmacion.set('total');

    // Mostrar popup de confirmación
    this.showConfirmPagoTotalPopup.set(true);
  }

  // Método para ejecutar el pago después de la confirmación
  ejecutarPagoTotal(): void {
    this.showConfirmPagoTotalPopup.set(false);

    // Ejecutar el método correcto según el tipo de confirmación
    if (this.tipoConfirmacion() === 'total') {
      this.realizarAbonoMasivo(); // Pago total de todas las deudas
    } else {
      this.realizarPagoParcial(); // Pago solo de las deudas con valores
    }
  }

  // Método para cerrar el popup de confirmación de pago total
  closeConfirmPagoTotalPopup(): void {
    this.showConfirmPagoTotalPopup.set(false);
  }

  // Computed para obtener el mensaje de confirmación del pago total
  getMensajeConfirmacionPagoTotal = computed(() => {
    const cantidad = this.cantidadDeudas();
    const tipo = this.tipoConfirmacion();
    const totalAPagar = tipo === 'total' ? this.valorDeuda() : this.totalAbonosParciales();
    const modo = tipo === 'total' ? 'total' : 'parcial';

    if (cantidad === 1) {
      return `¿Está seguro de realizar el pago ${modo} de $${totalAPagar.toLocaleString('es-CO')}?`;
    }

    return `¿Está seguro de realizar el pago ${modo} de ${cantidad} deudas por un total de $${totalAPagar.toLocaleString('es-CO')}?`;
  });

  getFacturaCodigo(deuda: any): string | null {
    return deuda.facturaCodigo || deuda.factura?.codigo || null;
  }

  getPlazoPagoNombre(deuda: any): string | null {
    return deuda.plazoPagoNombre || deuda.plazoPago?.nombre || null;
  }

  getValorDeuda(deuda: any): number {
    if (deuda.valorTotal) return deuda.valorTotal;
    if (typeof deuda.valor === 'string') return parseFloat(deuda.valor) || 0;
    return deuda.valor || 0;
  }

  hasMesesInfo(deuda: any): boolean {
    return !!(deuda.meses && deuda.valorMes);
  }

  getMesesInfo(deuda: any): string {
    if (!this.hasMesesInfo(deuda)) return '';
    return `(${deuda.meses} meses - $${deuda.valorMes?.toLocaleString('es-CO')}/mes)`;
  }

  closeAbonoPopup(): void {
    this.showAbonoPopup.set(false);
    this.abonoForm.reset();
  }

  closeConfirmPagoPopup(): void {
    this.showConfirmPagoPopup.set(false);
  }

  // Computed para obtener el mensaje de confirmación del pago
  getMensajeConfirmacionPago = computed(() => {
    if (!this.tipoPago) return '';

    const valorAPagar = this.getValorAPagar();
    const tipoTexto = this.tipoPago === 'total' ? 'total' : 'parcial';

    return `¿Está seguro de confirmar el pago ${tipoTexto} de $${valorAPagar.toLocaleString('es-CO')}?`;
  });  // Computed para obtener información sobre por qué no se puede confirmar el pago
  getMensajeEstadoNoPermitido = computed(() => {
    const estadoActual = this.selectedStatus();
    if (!estadoActual) return 'Estado de factura no disponible';

    const estadosNoPermitidos = ['PAGADA', 'INACTIVO'];
    const esEstadoNoPermitido = estadosNoPermitidos.some(estado =>
      estadoActual.toUpperCase().includes(estado.toUpperCase())
    );

    if (esEstadoNoPermitido) {
      return `Las facturas en estado "${estadoActual}" no permiten confirmación de pago.`;
    }

    return `Estado actual: ${estadoActual}`;
  });

  onSubmitAbono(): void {
    if (this.abonoForm.invalid) {
      this.toast.warning('Formulario inválido', 'Por favor complete los campos correctamente.');
      return;
    }

    const valorInput = this.abonoForm.value.valor;
    if (!valorInput) {
      this.toast.error('Valor requerido', 'Debe ingresar un valor para el abono');
      return;
    }

    const valorAbono = parseFloat(valorInput);
    const valorDeuda = this.valorDeuda();
    if (valorAbono > valorDeuda) {
      this.toast.error('Valor inválido', `El abono no puede ser mayor a la deuda pendiente ($${valorDeuda.toLocaleString('es-CO')})`);
      return;
    }

    if (valorAbono <= 0) {
      this.toast.error('Valor inválido', 'El abono debe ser mayor a 0');
      return;
    }

    this.procesandoAbono.set(true);

    const deudaInfo = this.deudaInfo();
    if (!deudaInfo) {
      this.toast.error('Error', 'No se encontró información de la deuda');
      this.procesandoAbono.set(false);
      return;
    }

    // Crear el abono con la estructura correcta del payload
    const abono: Partial<IAbonoFactura> = {
      valor: valorAbono.toString(),
      deudaCliente: { id: deudaInfo.id } as any,
      usuarioCreacion: this.nombreUsuario() || 'Sistema'
    };


    this.abonoService.saveAbono(abono as IAbonoFactura).subscribe({
      next: () => {
        this.toast.success('Éxito', `Abono de $${valorAbono.toLocaleString('es-CO')} registrado correctamente.`);
        this.closeAbonoPopup();
        this.procesandoAbono.set(false);
        this.clienteDeudas.reload?.();
      },
      error: (err) => {
        console.error('Error al guardar abono general:', err);
        console.error('Detalles del error:', err.error);
        this.toast.error('Error al guardar', 'No se pudo registrar el abono. Intente más tarde.');
        this.procesandoAbono.set(false);
      }
    });
  }

  private crearDeudaPorDiferencia(): void {
    if (this.valorPago === null) return;
    const diferencia = this.valorFactura() - this.valorPago;
    if (diferencia <= 0) return;
    this.crearNuevaDeuda(diferencia);
  }



  private crearNuevaDeuda(diferencia: number): void {
    const billDetails = this.billDetails.value()?.response;
    if (!billDetails) {
      this.toast.error('Error', 'No se encontró información de la factura');
      return;
    }

    const tiposDeuda = this.tiposDeuda.value()?.response;
    const tipoDeudaFacturaVencida = tiposDeuda?.find(tipo =>
      tipo.nombre.toLowerCase().includes('factura') ||
      tipo.nombre.toLowerCase().includes('vencida')
    ) || tiposDeuda?.[0];

    if (!tipoDeudaFacturaVencida) {
      this.toast.error('Error', 'No se encontró tipo de deuda disponible');
      return;
    }

    const empresaClienteContadorId = this.empresaClienteContadorId();
    if (!empresaClienteContadorId) {
      this.toast.error('Error', 'No se encontró información del cliente');
      return;
    }

    const deuda: Partial<IDeudaCliente> = {
      fechaDeuda: new Date(),
      valor: diferencia.toString(),
      descripcion: `Deuda por saldo pendiente de factura tras pago parcial. Valor adeudado: $${diferencia.toLocaleString('es-CO')}`,
      activo: true,
      factura: { id: Number(this.route.snapshot.paramMap.get('id')) } as any,
      empresaClienteContador: { id: empresaClienteContadorId } as any,
      tipoDeuda: tipoDeudaFacturaVencida,
      usuarioCreacion: this.nombreUsuario(),
      fechaCreacion: new Date(),
    };

    this.deudaService.saveDeuda(deuda as IDeudaCliente).subscribe({
      next: (response) => {
        this.toast.success(
          'Nueva Deuda Registrada',
          `Se registró una nueva deuda de $${diferencia.toLocaleString('es-CO')} por el saldo pendiente de la factura`
        );
        this.clienteDeudas.reload?.();
      },
      error: (error) => {
        this.toast.error(
          'Error al crear deuda',
          'No se pudo crear la deuda por el saldo pendiente. La operación continuará sin crear la deuda.'
        );
      }
    });
  }

  // Método para recargar todos los recursos
  reloadAllResources(): void {
    this.getStatus.reload?.();
    this.billDetails.reload?.();
    this.tiposDeuda.reload?.();
    // También intentar recargar deudas aunque no sea crítico
    this.clienteDeudas.reload?.();
  }

  // Método para voltear la factura
  toggleFlip(): void {
    this.isFlipped.update(value => !value);
  }

  // Computed para preparar los datos del back con el contenido HTML de la plantilla
  backTemplateData = computed(() => {
    const templateResponse = this.InvoiceBackTemplate.value();
    const empresaData = this.billDetails.value()?.response?.empresa;

    // Si no hay plantilla o aún está cargando
    if (!templateResponse?.success || !templateResponse.response || templateResponse.response.length === 0) {
      return null;
    }

    // Obtener la primera plantilla del array
    const template = templateResponse.response[0];

    return {
      htmlContent: template.contenido,
      empresa: {
        nombre: empresaData?.nombre || 'Empresa de Servicios Públicos',
        nit: empresaData?.nit || '',
        direccion: empresaData?.direccion?.descripcion || ''
      }
    };
  });
}
