import { Component, inject, signal, computed, PLATFORM_ID, effect } from '@angular/core';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PdfBill } from "@components/pdf-bill";
import { PdfService } from "../../../../core/services/pdf.service";
import { ToastService } from '../../../../core/services/toast.service';
import { EstadoService } from '../../service/estado.service';
import { PlazoPagoService } from '../../service/print-bill-details.service';
import { DeudaService } from '../../service/deuda.service';
import { AbonoService } from '../../service/abono.service';
import { TipoDeudaService } from '../../service/tipoDeuda.service';
import { PlazoPagoService as PlazoPagoDeudaService } from '../../service/plazoPago.service';
import { FacturaService } from '../../service/factura.service';
import { PopupComponent } from '@shared/components/popUp';
import { IAbonoFactura, IDeudaCliente } from '@interfaces/IdeudaFactura';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-print-bill',
  imports: [PdfBill, FormsModule, ReactiveFormsModule, CommonModule, PopupComponent],
  templateUrl: './print-bill.html',
  styleUrl: './print-bill.css'
})
export class PrintBill {

  readonly pdfService = inject(PdfService);
  readonly toast = inject(ToastService);
  readonly estadoService = inject(EstadoService);
  readonly billDetailsService = inject(PlazoPagoService);
  readonly deudaService = inject(DeudaService);
  readonly abonoService = inject(AbonoService);
  readonly tipoDeudaService = inject(TipoDeudaService);
  readonly plazoPagoDeudaService = inject(PlazoPagoDeudaService);
  readonly facturaService = inject(FacturaService);
  readonly route = inject(ActivatedRoute);
  readonly fb = inject(FormBuilder);
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  getStatus = rxResource({
    stream: () => this.estadoService.getAllEstado(),
  });

  tiposDeuda = rxResource({
    stream: () => this.tipoDeudaService.getAllTipoDeuda(),
  });

  plazosDeuda = rxResource({
    stream: () => this.plazoPagoDeudaService.getAllPlazoPago(),
  });


  clienteDeudas = rxResource({
    params: () => {
      const empresaClienteContadorId = this.route.snapshot.queryParamMap.get('empresaClienteContadorId');
      return empresaClienteContadorId;
    },
    stream: ({ params: empresaClienteContadorId }) => {
      if (!empresaClienteContadorId) {
        return EMPTY;
      }
      return this.deudaService.getDebByCodeClienteContadorId(empresaClienteContadorId).pipe(
        catchError((error) => {
          if (error.code === 404 || error.httpStatus === 404) {
            return of({ response: null, success: true });
          }
          throw error;
        })
      );
    },
  });

  constructor() {
    effect(() => {
      console.log("esta es la data mi negro", this.billDetails.value() )
    })
  }


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


  selectedEstado = signal<string | null>(null);
  tipoPago: 'total' | 'parcial' | null = null;
  valorPago: number = 0;

  valorFactura = computed(() => {
    const billData = this.billDetails.value()?.response;
    if (!billData?.totalesTarifas.total) return 0;
    const valor = typeof billData.totalesTarifas.total === 'string' ? parseFloat(billData.totalesTarifas.total) : billData.totalesTarifas.total;
    return valor || 0;
  });


  selectedStatus = computed(() => {
    const estadoId = this.selectedEstado();
    const estados = this.getStatus.value()?.response;

    if (!estadoId || !estados) {
      return null;
    }

    const estadoEncontrado = estados.find(
      estado => estado.id.toString() === estadoId
    );

    return estadoEncontrado?.nombre || null;
  });

  valorDeuda = computed(() => {
    try {
      const deudaResponse = this.clienteDeudas.value()?.response;
      // Si la respuesta es null (404 manejado), retornar 0
      if (deudaResponse === null) {
        return 0;
      }
      const deudaData = Array.isArray(deudaResponse) ? deudaResponse[0] : deudaResponse;
      let valor = 0;
      if (deudaData?.valor) {
        valor = typeof deudaData.valor === 'string' ? parseFloat(deudaData.valor) : deudaData.valor;
      }
      return valor;
    } catch (error) {
      return 0;
    }
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


  procesandoPDF = signal(false);
  showAbonoPopup = signal(false);
  abonoForm = this.fb.group({
    valor: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]]
  });
  procesandoAbono = signal(false);

  // Computado para obtener el empresaClienteContadorId
  empresaClienteContadorId = computed(() => {
    const empresaClienteContadorId = this.route.snapshot.queryParamMap.get('empresaClienteContadorId');
    const id = empresaClienteContadorId ? Number(empresaClienteContadorId) : null;
    return id;
  });

  // Computed para obtener datos del usuario
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

  readonly nombreUsuario = computed(() => {
    const data = this.userData();
    return data?.nombre || null;
  });


  // constructor() {
  //   effect(() => {
  //      console.log("esta es la dat mi negro", this.billDetails.value())
  //     const id = this.empresaClienteContadorId();
  //     if (id) {
  //       console.log(' EmpresaClienteContadorId recibido en print-bill:', id);
  //     }
  //   });

  //   // Efecto para mostrar información de deudas cuando cambien
  //   effect(() => {
  //     const deudas = this.clienteDeudas.value();
  //     const valorDeuda = this.valorDeuda();
  //     const info = this.deudaInfo();

  //     console.log(' Estado de deudas:');
  //     console.log('  - Response completa:', deudas);
  //     console.log('  - Valor calculado:', valorDeuda);
  //     console.log('  - Información procesada:', info);
  //     console.log('  - ¿Tiene deuda?:', this.tieneDeuda());
  //   });
  // }


  onEstadoChange(value: string | null): void {
    this.selectedEstado.set(value);
  }

  onTipoPagoChange(): void {
    if (this.tipoPago === 'total') {
      this.valorPago = this.valorFactura();
    } else if (this.tipoPago === 'parcial') {
      this.valorPago = 0;
    }
  }

  private actualizarEstadoSegunPago(): void {
    const estados = this.getStatus.value()?.response;
    if (!estados || !this.tipoPago) return;

    const buscarPorNombre = (palabrasClave: string[]) =>
      estados.find(estado =>
        palabrasClave.some(palabra =>
          estado.nombre.toLowerCase().includes(palabra.toLowerCase())
        )
      );

    const estadoEncontrado = this.tipoPago === 'total'
      ? buscarPorNombre(['pagada', 'pago', 'cancelada'])
      : buscarPorNombre(['parcial', 'abono']);

    this.selectedEstado.set(estadoEncontrado?.id.toString() || null);
  }

  canConfirmarPago(): boolean {
    return !!this.tipoPago && !!this.selectedEstado();
  }

  confirmarPago(): void {
    if (!this.canConfirmarPago()) {
      this.toast.warning('Advertencia', 'Debe seleccionar un estado y tipo de pago');
      return;
    }

    const montoPagado = this.tipoPago === 'total' ? this.valorFactura() : this.valorPago;
    const tipoPagoTexto = this.tipoPago === 'total' ? 'total' : 'parcial';
    const billId = Number(this.route.snapshot.paramMap.get('id'));
    const estadoId = Number(this.selectedEstado());
    const estadoNombre = this.selectedStatus();

    if (!billId || !estadoId || !estadoNombre) {
      this.toast.error('Error', 'No se pudo obtener la información necesaria para actualizar la factura');
      return;
    }

    this.facturaService.updateStatusBill(billId, estadoId, estadoNombre).subscribe({
      next: (response) => {
        if (this.tipoPago === 'parcial' && this.valorPago < this.valorFactura()) {
          this.crearDeudaPorDiferencia();
        }

        this.toast.success(
          'Pago Confirmado',
          `Pago ${tipoPagoTexto} de $${montoPagado.toLocaleString('es-CO')} registrado correctamente. Estado actualizado a: ${estadoNombre}`
        );
      },
      error: (error) => {
        this.toast.error(
          'Error al confirmar pago',
          'No se pudo actualizar el estado de la factura. Intente nuevamente.'
        );
      }
    });
  }

  tieneDeuda(): boolean {
    try {
      return this.valorDeuda() > 0;
    } catch (error) {
      console.warn('ℹ️ Error al verificar si tiene deuda, asumiendo que no tiene:', error);
      return false;
    }
  }

  getValorAPagar(): number {
    return this.tipoPago === 'total' ? this.valorFactura() : this.valorPago;
  }

  async guardarEImprimir(): Promise<void> {
    if (!this.selectedEstado()) {
      this.toast.warning('Advertencia', 'Debe seleccionar un estado para la factura');
      return;
    }

    this.procesandoPDF.set(true);

    try {
      await this.guardarFactura();
      await this.downloadPDF();
      this.toast.success('Éxito', 'Factura guardada e impresa correctamente');

    } catch (error) {
      console.error('Error al guardar e imprimir:', error);
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
    try {
      const billElement = document.querySelector('.bill-content') as HTMLElement;
      if (!billElement) {
        this.toast.error('Error', 'No se encontró el contenido de la factura.');
        return;
      }

      const filename = `factura-aquaplus-${new Date().getTime()}.pdf`;
      await this.pdfService.convertElementToPdf(billElement, filename);

      if (!this.procesandoPDF()) {
        this.toast.success('Éxito', 'PDF generado correctamente');
      }

    } catch (error) {
      console.error('Error al descargar PDF:', error);
      this.toast.warning('Advertencia', 'No se pudo generar el PDF');
      throw error;
    }
  }

  openAbonoPopup(): void {
    this.abonoForm.reset();
    this.showAbonoPopup.set(true);
  }

  closeAbonoPopup(): void {
    this.showAbonoPopup.set(false);
    this.abonoForm.reset();
  }

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

    const abono: Partial<IAbonoFactura> = {
      valor: valorAbono.toString(),
      deudaCliente: { id: deudaInfo.id } as any,
      usuarioCreacion: this.nombreUsuario()
    };

    this.abonoService.saveAbono(abono as IAbonoFactura).subscribe({
      next: () => {
        this.toast.success('Éxito', `Abono de $${valorAbono.toLocaleString('es-CO')} registrado correctamente.`);
        this.closeAbonoPopup();
        this.procesandoAbono.set(false);
        this.clienteDeudas.reload?.();
      },
      error: (err) => {
        console.error('Error al guardar el abono:', err);
        this.toast.error('Error al guardar', 'No se pudo registrar el abono. Intente más tarde.');
        this.procesandoAbono.set(false);
      }
    });
  }

  private crearDeudaPorDiferencia(): void {
    const diferencia = this.valorFactura() - this.valorPago;
    if (diferencia <= 0) return;

    const deudaExistente = this.deudaInfo();

    // Si ya existe una deuda, actualizarla sumando la diferencia
    if (deudaExistente?.id) {
      this.actualizarDeudaExistente(deudaExistente, diferencia);
    } else {
      this.crearNuevaDeuda(diferencia);
    }
  }

  private actualizarDeudaExistente(deudaExistente: any, diferencia: number): void {
    const valorActual = typeof deudaExistente.valor === 'string' ? parseFloat(deudaExistente.valor) : deudaExistente.valor;
    const nuevoValor = valorActual + diferencia;



    // Crear objeto de deuda actualizada siguiendo la estructura de update-debt
    const deudaActualizada: Partial<IDeudaCliente> = {
      id: deudaExistente.id,
      fechaDeuda: deudaExistente.fechaDeuda ? new Date(deudaExistente.fechaDeuda) : new Date(),
      valor: nuevoValor.toString(),
      descripcion: `${deudaExistente.descripcion || 'Deuda existente'} + Pago parcial de factura: $${diferencia.toLocaleString('es-CO')}`,
      activo: true,
      factura: deudaExistente.factura || { id: Number(this.route.snapshot.paramMap.get('id')) } as any,
      empresaClienteContador: deudaExistente.empresaClienteContador || { id: this.empresaClienteContadorId() } as any,
      tipoDeuda: deudaExistente.tipoDeuda,
      plazoPago: deudaExistente.plazoPago,
      usuarioCreacion: deudaExistente.usuarioCreacion,
      fechaCreacion: deudaExistente.fechaCreacion ? new Date(deudaExistente.fechaCreacion) : new Date(),
      usuarioActualizacion: this.nombreUsuario(),
      fechaModificacion: new Date()
    };

    this.deudaService.updateDeuda(deudaActualizada as IDeudaCliente).subscribe({
      next: (response) => {
        this.toast.success(
          'Deuda Actualizada',
          `Se actualizó la deuda existente. Nuevo valor: $${nuevoValor.toLocaleString('es-CO')}`
        );
        this.clienteDeudas.reload?.();
      },
      error: (error) => {
        this.toast.error(
          'Error al actualizar deuda',
          'No se pudo actualizar la deuda existente. Se intentará crear una nueva.'
        );
        this.crearNuevaDeuda(diferencia);
      }
    });
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
      descripcion: `Deuda generada por pago parcial de factura. Diferencia: $${diferencia.toLocaleString('es-CO')}`,
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
          'Deuda Creada',
          `Se creó una nueva deuda de $${diferencia.toLocaleString('es-CO')} por el saldo pendiente de la factura`
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
}
