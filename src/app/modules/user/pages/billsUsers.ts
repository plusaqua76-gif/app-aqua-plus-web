import { Component, computed, inject, PLATFORM_ID, effect, signal } from '@angular/core';
import { UserAccessService } from '../services/bill-users.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { TableComponent } from '@components/table';
import { PopupComponent } from '@shared/components/popUp';
import { IPaginationParams } from '@interfaces/IpaginatedResponse';
import { ToastService } from '@services/toast.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { PlazoPagoService } from '../../bill/service/print-bill-details.service';
import { PdfBill } from '@components/pdf-bill/pdf-bill';
import { IBillDetailResponse } from '@interfaces/Ibill-detail';
import { PdfService } from '@services/pdf.service';
import { IdEnterprice } from '../../../core/interfaces/IiEnterprice';

@Component({
  selector: 'app-bills-users',
  imports: [CommonModule, TableComponent, RouterModule, PopupComponent, PdfBill],
  template: `
    <ng-template #actionsTemplate let-row>
      <div class="flex items-center space-x-2">
        <button
          type="button"
          (click)="handleTableAction({ action: 'view', row })"
          class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-blue-600/50 text-blue-400 hover:bg-blue-600/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors duration-200 cursor-pointer"
          title="Ver detalles"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
            <button
              type="button"
              (click)="selectedBillRow.set(row); goToPyment()"
      [disabled]="isPagoDisabled(row)"
              class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-green-600/50 text-green-400 hover:bg-green-600/10 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-colors duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              title="Pagar factura"
            >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </button>
      </div>
    </ng-template>

    <app-table-dynamic
      [title]="title()"
      [columns]="userColumns()"
      [serverMode]="true"
      [serverData]="serverUserData.value() ?? null"
      [loading]="serverUserData.isLoading()"
      [actionTemplate]="actionsTemplate"
      [showExportButton]="true"
      [exportFileName]="exportFileName()"
      [showColumnFilters]="true"
      (action)="handleTableAction($event)"
      (serverPaginationChange)="onPaginationChange($event)"
    >
    </app-table-dynamic>

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
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  readonly billDetailsService = inject(PlazoPagoService);
  readonly pdfService = inject(PdfService);
  protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);

  title = signal('Gestión de Usuarios de Facturas');
  showDeleteConfirm = signal(false);
  itemToDelete = signal<number | null>(null);
  showBillDetailsPopup = signal(false);
  selectedBillId = signal<number | null>(null);
  selectedBillRow = signal<any>(null);
  procesandoPDF = signal(false);

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

  const queryParams: Record<string, string> = {};
  if (bill) {
    queryParams['bill'] = encodeURIComponent(JSON.stringify(bill));
    if (bill.precio != null && bill.precio > 0) {
      queryParams['monto'] = String(Math.round(bill.precio * 100));
    }
  }
  this.router.navigate(['../pyments'], { relativeTo: this.route, queryParams });
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
