import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  PLATFORM_ID,
  signal,
  TemplateRef,
  untracked,
  viewChild,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { InvoiceService } from '../../services/invoice.service';
import { ToastService } from '@services/toast.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { of, catchError, firstValueFrom } from 'rxjs';
import { TableComponent } from '@components/table';
import { PopupComponent } from '@shared/components/popUp';
import { IPaginationParams } from '@interfaces/IpaginatedResponse';
import {
  getInvoiceEstadoLegalBadgeClass,
  getInvoiceEstadoLegalDisplayLabel,
  INVOICE_ESTADO_LEGAL_FILTER_OPTIONS,
} from '../../../../core/utils/invoice-estado-legal.util';

@Component({
  selector: 'app-client-invoices',
  standalone: true,
  imports: [CommonModule, TableComponent, RouterModule, PopupComponent],
  styles: [`
    .pdf-document-content {
      width: 100%;
      min-height: 75vh;
      max-height: 75vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .pdf-viewer-container {
      flex: 1;
      width: 100%;
      min-height: 0;
      display: flex;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
    }

    .pdf-iframe {
      width: 100%;
      height: 100%;
      min-height: 70vh;
      border: 0;
      background: white;
    }

    .state-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
    }

    .pdf-actions-bar {
      position: sticky;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 50;
      padding: 16px;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px;
      background: rgba(10, 12, 22, 0.75);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    @media (max-width: 767px) {
      .pdf-document-content {
        min-height: 65vh;
        max-height: 65vh;
      }

      .pdf-iframe {
        min-height: 55vh;
      }

      .pdf-actions-bar {
        padding: 12px;
        gap: 8px;
      }
    }
  `],
  template: `
    <ng-template #actionsTemplate let-row>
      <div class="flex items-center space-x-2">
        <button
          type="button"
          (click)="handleTableAction({ action: 'view', row })"
          class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-blue-600/50 text-blue-400 hover:bg-blue-600/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors duration-200 cursor-pointer"
          title="Ver detalle"
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
          (click)="handleTableAction({ action: 'download', row })"
          class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-green-600/50 text-green-500 hover:bg-green-600/10 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-colors duration-200 cursor-pointer"
          title="Descargar factura"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
        <button
          type="button"
          (click)="handleTableAction({ action: 'create-credit-note', row })"
          [disabled]="row.codigoConcepto === '2'"
          [class]="row.codigoConcepto === '2'
            ? 'inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-400/30 text-gray-400 cursor-not-allowed opacity-50'
            : 'inline-flex items-center justify-center h-8 w-8 rounded-lg border border-purple-600/50 text-purple-500 hover:bg-purple-600/10 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-colors duration-200 cursor-pointer'"
          [title]="row.codigoConcepto === '2' ? 'No se puede crear nota crédito para facturas anuladas' : 'Crear nota crédito'"
         >
         <i class="fas fa-file-invoice"></i>
        </button>
      </div>
    </ng-template>

    <ng-template #fechaCreacionTpl let-row>
      {{ formatDateTime(row.fechaCreacion) }}
    </ng-template>

    <ng-template #conceptoTpl let-row>
      {{ getConceptoValue(row.codigoConcepto) }}
    </ng-template>

    <ng-template #clienteNombreTpl let-row>
      {{ getClienteNombreCompleto(row.cliente) }}
    </ng-template>

    <ng-template #estadoLegalTpl let-row>
      <span [ngClass]="getEstadoLegalBadgeClass(row.estadoLegal)">
        {{ getEstadoLegalLabel(row.estadoLegal) }}
      </span>
    </ng-template>

    <app-table-dynamic
      [title]="title()"
      [columns]="invoiceColumns()"
      [serverMode]="true"
      [serverData]="serverInvoiceData.value() ?? null"
      [loading]="serverInvoiceData.isLoading()"
      [actionTemplate]="actionsTemplate"
      [columnTemplates]="{
        fechaCreacion: fechaCreacionTpl,
        codigoConcepto: conceptoTpl,
        'cliente.nombre': clienteNombreTpl,
        estadoLegal: estadoLegalTpl
      }"
      [showAddButton]="true"
      [addButtonText]="'Nueva Factura Electrónica'"
      [addButtonIcon]="'fa-regular fa-file-lines'"
      [showExportButton]="true"
      [exportFileName]="exportFileName()"
      [showColumnFilters]="true"
      [exportData]="exportDataForTable()"
      [isLoadingExportData]="isLoadingExportData()"
      (action)="handleTableAction($event)"
      (serverPaginationChange)="onPaginationChange($event)"
      (exportAllDataRequest)="handleExportRequest($event)"
      [showSecondaryButton]="true"
      [secondaryButtonText]="'Configuración '"
      (secondaryButtonAction)="handleTableAction({ action: 'view-enterprise-dian' })"
    >
    </app-table-dynamic>

    <!-- Popup para visualizar PDF de factura DIAN -->
    <app-pop-up
      [open]="showPdfPopup"
      [isConfirmation]="false"
      [title]="getPdfPopupTitle()"
      [maxWidth]="'max-w-7xl'"
      [contentPadding]="'p-2 sm:p-4'"
      (cancelAction)="closePdfPopup()"
    >
      <div class="pdf-document-content">
        @if (documentInvoiceDian.isLoading()) {
          <div class="state-container">
            <div class="flex flex-col justify-center items-center space-y-4">
              <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-500/30 border-t-blue-500"></div>
              <span class="text-white text-lg font-medium">Cargando documento...</span>
            </div>
          </div>
        }

        @if (documentInvoiceDian.error()) {
          <div class="state-container">
            <div class="flex flex-col justify-center items-center space-y-4">
              <i class="fas fa-exclamation-triangle text-red-400 text-6xl"></i>
              <p class="text-red-400 text-lg font-medium">Error al cargar el documento</p>
              <p class="text-gray-400 text-sm">Por favor, intente nuevamente</p>
              <button
                type="button"
                (click)="retryLoadDocument()"
                class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Reintentar
              </button>
            </div>
          </div>
        }

        @if (cachedPdfUrl()) {
          <div class="pdf-viewer-container">
            <iframe
              [src]="cachedPdfUrl()"
              class="pdf-iframe"
              title="Factura Electrónica PDF"
            ></iframe>
          </div>

          <div class="pdf-actions-bar">
            <button
              type="button"
              (click)="printPdf()"
              [disabled]="pdfAction() !== null"
              class="inline-flex items-center justify-center rounded-xl border border-gray-500/70 bg-white/5 px-5 py-2.5 text-sm font-medium text-gray-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-gray-400/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Imprimir documento"
            >
              @if (pdfAction() === 'print') {
                <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="ml-2">Preparando impresión...</span>
              } @else {
                <i class="fas fa-print"></i>
                <span class="ml-2">Imprimir</span>
              }
            </button>

            <button
              type="button"
              (click)="downloadPdfFromPopup()"
              [disabled]="pdfAction() !== null"
              class="inline-flex items-center justify-center rounded-xl border border-green-600/70 bg-green-500/10 px-5 py-2.5 text-sm font-medium text-green-400 hover:bg-green-500/20 focus:outline-none focus:ring-2 focus:ring-green-400/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Descargar PDF"
            >
              @if (pdfAction() === 'download') {
                <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="ml-2">Descargando...</span>
              } @else {
                <i class="fas fa-download"></i>
                <span class="ml-2">Descargar PDF</span>
              }
            </button>

            <button
              type="button"
              (click)="openPdfInNewTab()"
              [disabled]="pdfAction() !== null"
              class="inline-flex items-center justify-center rounded-xl border border-blue-600/70 bg-blue-500/10 px-5 py-2.5 text-sm font-medium text-blue-400 hover:bg-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-400/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Abrir en nueva pestaña"
            >
              <i class="fas fa-external-link-alt"></i>
              <span class="ml-2">Abrir en pestaña</span>
            </button>
          </div>
        }

        @if (!documentInvoiceDian.isLoading() && !cachedPdfUrl() && !documentInvoiceDian.error()) {
          <div class="state-container">
            <div class="flex flex-col justify-center items-center space-y-4">
              <i class="fas fa-file-slash text-gray-400 text-6xl"></i>
              <p class="text-gray-400 text-lg font-medium">No hay documento disponible</p>
            </div>
          </div>
        }
      </div>
    </app-pop-up>
  `,
})
export class ClientInvoices {
  title = signal('Facturas Electrónicas DIAN');
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  protected readonly invoiceService = inject(InvoiceService);
  protected readonly toastService = inject(ToastService);
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);

  // Template references
  readonly fechaCreacionTpl = viewChild<TemplateRef<any>>('fechaCreacionTpl');
  readonly conceptoTpl = viewChild<TemplateRef<any>>('conceptoTpl');

  showPdfPopup = signal(false);
  selectedInvoiceForView = signal<any>(null);
  exportDataForTable = signal<any[] | null>(null);
  isLoadingExportData = signal(false);
  isDownloadingPdf = signal(false);
  pdfAction = signal<'print' | 'download' | null>(null);
  cachedPdfUrl = signal<SafeResourceUrl | null>(null);

  private rawPdfBlobUrl: string | null = null;
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const data = this.exportDataForTable();
      const isLoading = this.isLoadingExportData();
      if (data && data.length > 0 && !isLoading) {
        setTimeout(() => this.exportDataForTable.set(null), 2000);
      }
    });

    effect(() => {
      const base64 = this.documentInvoiceDian.value()?.response?.file?.content;
      const isOpen = this.showPdfPopup();

      untracked(() => {
        this.revokePdfBlobUrl();

        if (base64 && isOpen) {
          const blob = this.base64ToPdfBlob(base64);
          this.rawPdfBlobUrl = URL.createObjectURL(blob);
          const viewerUrl = `${this.rawPdfBlobUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`;
          this.cachedPdfUrl.set(
            this.sanitizer.bypassSecurityTrustResourceUrl(viewerUrl),
          );
        } else {
          this.cachedPdfUrl.set(null);
        }
      });
    });

    this.destroyRef.onDestroy(() => this.revokePdfBlobUrl());
  }

  getPdfPopupTitle(): string {
    const invoice = this.selectedInvoiceForView();
    if (!invoice) {
      return 'Documento Factura Electrónica DIAN';
    }
    const numero = invoice.numero || invoice.factura?.codigo;
    return numero
      ? `Factura Electrónica DIAN — ${numero}`
      : 'Documento Factura Electrónica DIAN';
  }

  retryLoadDocument(): void {
    this.documentInvoiceDian.reload();
  }

  private getCurrentPdfBase64(): string | null {
    return this.documentInvoiceDian.value()?.response?.file?.content ?? null;
  }

  private base64ToPdfBlob(base64: string): Blob {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: 'application/pdf' });
  }

  private revokePdfBlobUrl(): void {
    if (this.rawPdfBlobUrl) {
      URL.revokeObjectURL(this.rawPdfBlobUrl);
      this.rawPdfBlobUrl = null;
    }
    this.cachedPdfUrl.set(null);
  }

  private getPdfFilename(invoice: any): string {
    return `factura_electronica_${invoice?.numero || invoice?.idDian || 'documento'}.pdf`;
  }

  printPdf(): void {
    const base64 = this.getCurrentPdfBase64();
    if (!base64) {
      this.toastService.warning('Advertencia', 'No hay documento disponible para imprimir');
      return;
    }

    if (this.pdfAction()) {
      return;
    }

    this.pdfAction.set('print');

    try {
      const blob = this.base64ToPdfBlob(base64);
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');

      if (!printWindow) {
        this.toastService.error(
          'Error',
          'El navegador bloqueó la ventana de impresión. Permita ventanas emergentes.',
        );
        URL.revokeObjectURL(url);
        return;
      }

      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };

      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      this.toastService.success('Éxito', 'Documento enviado a impresión');
    } catch (error) {
      console.error('Error al imprimir factura electrónica:', error);
      this.toastService.error('Error', 'No se pudo imprimir el documento');
    } finally {
      this.pdfAction.set(null);
    }
  }

  downloadPdfFromPopup(): void {
    const invoice = this.selectedInvoiceForView();
    if (!invoice) {
      return;
    }
    void this.downloadInvoice(invoice);
  }

  openPdfInNewTab(): void {
    const base64 = this.getCurrentPdfBase64();
    if (!base64) {
      this.toastService.warning('Advertencia', 'No hay documento disponible');
      return;
    }

    const url = this.rawPdfBlobUrl ?? URL.createObjectURL(this.base64ToPdfBlob(base64));
    const opened = window.open(url, '_blank');

    if (!opened) {
      this.toastService.error(
        'Error',
        'El navegador bloqueó la nueva pestaña. Permita ventanas emergentes.',
      );
      if (!this.rawPdfBlobUrl) {
        URL.revokeObjectURL(url);
      }
      return;
    }

    if (!this.rawPdfBlobUrl) {
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    }
  }

  invoiceColumns = signal([
    { field: 'numero', header: 'Factura', type: 'text' as const },
    { field: 'factura.codigo', header: 'Código Factura', type: 'text' as const },
    {
      field: 'estadoLegal',
      header: 'Estado Legal',
      type: 'text' as const,
      filterOptions: INVOICE_ESTADO_LEGAL_FILTER_OPTIONS,
      filterPlaceholder: 'Todos',
      filterVariant: 'badge' as const,
    },
    { field: 'codigoConcepto', header: 'Concepto', type: 'text' as const, template: 'conceptoTpl' },
    { field: 'cliente.nombre', header: 'Cliente', type: 'text' as const, template: 'clienteNombreTpl' },
    { field: 'cliente.numeroCedula', header: 'Cédula', type: 'text' as const },
    { field: 'fechaCreacion', header: 'Fecha Emisión', type: 'date' as const, template: 'fechaCreacionTpl' },
    { field: 'factura.consumo', header: 'Consumo', type: 'text' as const },
    { field: 'factura.precio', header: 'Precio', type: 'currency' as const },
  ]);

  readonly enterpriseId = computed(() => {
    if (!this.isBrowser) return null;

    try {
      const userData = sessionStorage.getItem('userData');
      if (!userData) return null;

      const parsedUserData = JSON.parse(userData);
      return parsedUserData.empresaId ? Number(parsedUserData.empresaId) : null;
    } catch {
      return null;
    }
  });

  readonly exportFileName = computed(
    () => `facturas_electronicas_${new Date().toISOString().split('T')[0]}`
  );

  readonly paginationParams = signal<IPaginationParams>({
    page: 0,
    size: 5,
  });

  serverInvoiceData = rxResource({
    params: () => ({
      enterpriseId: this.enterpriseId(),
      pagination: this.paginationParams(),
    }),
    stream: ({ params }) => {
      const { enterpriseId, pagination } = params;
      if (!enterpriseId) {
        return of(null);
      }
      return this.invoiceService.getClientInvoicesPaginated(
        enterpriseId,
        pagination
      ).pipe(
        catchError(error => {
          return of(null);
        })
      );
    },
  });

  documentInvoiceDian = rxResource({
    params: () => ({
      idDian: this.selectedInvoiceForView()?.idDian || null,
    }),
    stream: ({ params }) => {
      const { idDian } = params;
      if (!idDian) {
        return of(null);
      }
      return this.invoiceService.getDocumentInvoiceDian(idDian).pipe(
        catchError(error => {
          return of(null);
        })
      );
    },
  });

handleTableAction(event: { action: string; row?: any }): void {
  switch (event.action) {
    case 'add':
      this.goToCreateInvoice();
      break;

    case 'view':
      if (event.row) {
        this.viewInvoiceDetail(event.row);
      }
      break;

    case 'download':
      if (event.row) {
        this.downloadInvoice(event.row);
      }
      break;

    case 'create-credit-note':
      if (event.row) {
        this.createCreditNote(event.row);
      }
      break;

    case 'view-enterprise-dian':
      this.router.navigate(['/shell/electronic-invoicing/enterprice-dian']);
      break;

    default:
      console.warn('Acción no reconocida:', event.action);
      break;
  }
}

createCreditNote(invoice: any) {
  if (!invoice.cufe) {
    this.toastService.warning('Advertencia', 'Esta factura no tiene CUFE. La nota de crédito podría tener problemas.');
  }

  this.router.navigate(['/shell/electronic-invoicing/create'], {
    state: {
      mode: 'credit-note',
      invoiceId: invoice.id,
      originalInvoice: invoice
    }
  });
}

  onPaginationChange(params: IPaginationParams): void {
    this.paginationParams.set(params);
  }

  async handleExportRequest(event: { totalCount: number; currentParams: IPaginationParams }): Promise<void> {
    const enterpriseId = this.enterpriseId();
    if (!enterpriseId) {
      this.toastService.error('Error', 'No se pudo obtener el ID de la empresa');
      return;
    }

    this.isLoadingExportData.set(true);
    this.toastService.info('Preparando exportación', `Cargando ${event.totalCount} registros...`);

    try {
      const exportParams: IPaginationParams = {
        ...event.currentParams,
        page: 0,
        size: event.totalCount,
      };

      const response = await firstValueFrom(
        this.invoiceService.getClientInvoicesPaginated(enterpriseId, exportParams),
      );

      if (response?.response && Array.isArray(response.response)) {
        const transformedData = response.response.map((invoice) =>
          this.transformInvoiceForExport(invoice),
        );
        this.exportDataForTable.set(transformedData);
        this.toastService.success('Datos cargados', `${transformedData.length} registros listos para exportar`);
      } else {
        throw new Error('No se recibieron datos del servidor');
      }
    } catch (error) {
      console.error('Error al cargar datos para exportación:', error);
      this.toastService.error('Error', 'No se pudieron cargar los datos para exportar');
      this.exportDataForTable.set(null);
    } finally {
      this.isLoadingExportData.set(false);
    }
  }

  private transformInvoiceForExport(invoice: any) {
    return {
      ...invoice,
      cliente: {
        ...invoice.cliente,
        nombre: this.getClienteNombreCompleto(invoice.cliente),
      },
      codigoConcepto: this.getConceptoValue(invoice.codigoConcepto) || invoice.codigoConcepto,
      estadoLegal: this.getEstadoLegalLabel(invoice.estadoLegal),
      fechaCreacion: this.formatDateTime(invoice.fechaCreacion),
    };
  }

  getClienteNombreCompleto(cliente: any): string {
    if (!cliente) return '';

    return [
      cliente.nombre,
      cliente.segundoNombre,
      cliente.apellido,
      cliente.segundoApellido,
    ]
      .filter((parte) => parte?.trim())
      .join(' ');
  }

  getEstadoLegalBadgeClass = getInvoiceEstadoLegalBadgeClass;
  getEstadoLegalLabel = getInvoiceEstadoLegalDisplayLabel;

  goToCreateInvoice(): void {
    this.router.navigate(['/shell/electronic-invoicing/create']);
  }

  viewInvoiceDetail(invoice: any): void {
    if (!invoice?.idDian) {
      this.toastService.warning('Advertencia', 'Esta factura no tiene documento asociado');
      return;
    }
    this.selectedInvoiceForView.set(invoice);
    this.showPdfPopup.set(true);
  }

  async downloadInvoice(invoice: any): Promise<void> {
    if (!invoice?.idDian) {
      this.toastService.warning('Advertencia', 'Esta factura no tiene documento asociado');
      return;
    }

    const cachedBase64 =
      this.selectedInvoiceForView()?.idDian === invoice.idDian
        ? this.documentInvoiceDian.value()?.response?.file?.content
        : null;

    if (cachedBase64) {
      this.triggerPdfDownload(cachedBase64, invoice);
      this.toastService.success('Éxito', 'Documento descargado');
      return;
    }

    if (this.isDownloadingPdf() || this.pdfAction()) {
      this.toastService.warning('Descarga en proceso', 'Espere a que termine la descarga actual');
      return;
    }

    this.isDownloadingPdf.set(true);
    this.pdfAction.set('download');
    this.toastService.info('Descargando', 'Obteniendo documento PDF...');

    try {
      const response = await firstValueFrom(
        this.invoiceService.getDocumentInvoiceDian(invoice.idDian),
      );
      const base64 = response?.response?.file?.content;

      if (!base64) {
        this.toastService.warning('Advertencia', 'No hay documento disponible para descargar');
        return;
      }

      this.triggerPdfDownload(base64, invoice);
      this.toastService.success('Éxito', 'Documento descargado');
    } catch (error) {
      console.error('Error al descargar factura:', error);
      this.toastService.error('Error', 'No se pudo descargar el documento');
    } finally {
      this.isDownloadingPdf.set(false);
      this.pdfAction.set(null);
    }
  }

  private triggerPdfDownload(base64: string, invoice: any): void {
    const blob = this.base64ToPdfBlob(base64);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = this.getPdfFilename(invoice);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  closePdfPopup(): void {
    this.revokePdfBlobUrl();
    this.pdfAction.set(null);
    this.showPdfPopup.set(false);
    this.selectedInvoiceForView.set(null);
  }


  formatDateTime(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '';
      }

      return new Intl.DateTimeFormat('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(date);

    } catch (error) {
      console.error('Error formateando fecha:', error);
      return '';
    }
  }

  getConceptoValue(code: string): string {
    const conceptos: Record<string, string> = {
      '1': 'Devolución parcial de los bienes y/o no aceptación parcial del servicio',
      '2': 'Anulación de factura electrónica',
      '3': 'Rebaja o descuento parcial o total',
      '4': 'Ajuste de precio',
      '5': 'Descuento comercial por pronto pago',
      '6': 'Descuento comercial por volumen de ventas'
    };
    return conceptos[code] || '';
  }
}
