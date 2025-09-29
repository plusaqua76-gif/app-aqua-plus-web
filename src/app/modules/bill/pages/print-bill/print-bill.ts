import { Component, inject, signal, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PdfBill } from "@components/pdf-bill";
import { PdfService } from "../../../../core/services/pdf.service";
import { ToastService } from '../../../../core/services/toast.service';
import { EstadoService } from '../../service/estado.service';
import { PlazoPagoService } from '../../service/print-bill-details.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY } from 'rxjs';

@Component({
  selector: 'app-print-bill',
  imports: [PdfBill, FormsModule, CommonModule],
  templateUrl: './print-bill.html',
  styleUrl: './print-bill.css'
})
export class PrintBill {

  readonly pdfService = inject(PdfService);
  readonly toast = inject(ToastService);
  readonly estadoService = inject(EstadoService);
  readonly billDetailsService = inject(PlazoPagoService);
  readonly route = inject(ActivatedRoute);

  getStatus = rxResource({
    stream: () => this.estadoService.getAllEstado(),
  });


  billDetails = rxResource({
    params: () => {
      const billId = this.route.snapshot.paramMap.get('id');
      console.log('Bill ID from route:', billId);
      return billId ? Number(billId) : null;
    },
    stream: ({ params: billId }) => {
      if (!billId) {
        console.log('No bill ID provided');
        return EMPTY;
      }
      console.log('Fetching bill details for ID:', billId);
      return this.billDetailsService.getAllBillDetails(billId);
    },
  });


  // Propiedades del formulario
  selectedEstado = signal<string | null>(null);
  valorFactura: number = 0;
  tipoPago: 'total' | 'parcial' | null = null;
  valorPago: number = 0;

  /**
   * Computed que convierte el ID del estado seleccionado al nombre del estado
   * para mostrar en el letrero de la factura
   */
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

  // Información de deuda (simulada)
  valorDeuda: number = 150000; // Valor de ejemplo, puedes cambiarlo según tu lógica

  // Estados de carga
  procesandoPDF = signal(false);

  // Métodos para manejar el pago y estado
  /**
   * Maneja el cambio de estado seleccionado desde el dropdown
   */
  onEstadoChange(value: string | null): void {
    this.selectedEstado.set(value);
  }

  onTipoPagoChange(): void {
    if (this.tipoPago === 'total') {
      this.valorPago = this.valorFactura;
    } else if (this.tipoPago === 'parcial') {
      this.valorPago = 0;
    }
  }

  /**
   * Actualiza automáticamente el estado de la factura según el tipo de pago confirmado
   */
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
    return !!this.tipoPago;
  }

  confirmarPago(): void {
    if (!this.canConfirmarPago()) {
      this.toast.warning('Advertencia', 'Verifique los datos del pago');
      return;
    }

    const montoPagado = this.tipoPago === 'total' ? this.valorFactura : this.valorPago;
    const tipoPagoTexto = this.tipoPago === 'total' ? 'total' : 'parcial';

    // Actualizar el estado según el tipo de pago
    this.actualizarEstadoSegunPago();

    this.toast.success(
      'Pago Confirmado',
      `Pago ${tipoPagoTexto} de $${montoPagado.toLocaleString('es-CO')} registrado correctamente`
    );
  }

  // Métodos para información de deuda
  tieneDeuda(): boolean {
    return this.valorDeuda > 0;
  }

  getValorAPagar(): number {
    return this.tipoPago === 'total' ? this.valorFactura : this.valorPago;
  }

  async guardarEImprimir(): Promise<void> {
    if (!this.selectedEstado()) {
      this.toast.warning('Advertencia', 'Debe seleccionar un estado para la factura');
      return;
    }

    this.procesandoPDF.set(true);

    try {
      // Simular guardado en base de datos
      await this.guardarFactura();

      // Generar e imprimir PDF
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
    // Simular una operación async de guardado
    return new Promise((resolve) => {
      setTimeout(() => {
        // Factura guardada exitosamente
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
        // Solo mostrar el toast si no estamos en el proceso de guardar e imprimir
        this.toast.success('Éxito', 'PDF generado correctamente');
      }

    } catch (error) {
      console.error('Error al descargar PDF:', error);
      this.toast.warning('Advertencia', 'No se pudo generar el PDF');
      throw error; // Re-lanzar el error para que lo maneje guardarEImprimir
    }
  }
}
