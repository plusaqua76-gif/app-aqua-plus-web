import {
  Component,
  computed,
  effect,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { InvoiceService } from '../../services/invoice.service';
import { ToastService } from '@services/toast.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { of, catchError } from 'rxjs';
import { TableComponent } from '@components/table';
import { IPaginationParams } from '@interfaces/IpaginatedResponse';

@Component({
  selector: 'app-client-invoices',
  standalone: true,
  imports: [CommonModule, TableComponent, RouterModule],
  styles: [`
    .pdf-content-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-height: 0;
    }

    .pdf-viewer-container {
      width: 100%;
      height: 100%;
      flex: 1;
      display: flex;
      align-items: stretch;
      justify-content: center;
    }

    .pdf-iframe {
      width: 100%;
      height: 100%;
      border: 0;
      border-radius: 12px;
      background: white;
      min-height: 500px;
    }

    /* Estados de loading y error - centrados verticalmente */
    .state-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
    }

    /* Responsive para mobile */
    @media (max-width: 767px) {
      .pdf-iframe {
        min-height: 400px;
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
      </div>
    </ng-template>

    <!-- <ng-template #fechaCreacionTpl let-row>
      {{ formatDate(row.empresa?.fechaCreacion) }}
    </ng-template> -->

    <!-- este va en la tabla
          [columnTemplates]="{
        'empresa.fechaCreacion': fechaCreacionTpl
      }" -->

    <app-table-dynamic
      [title]="title()"
      [columns]="invoiceColumns()"
      [serverMode]="true"
      [serverData]="serverInvoiceData.value() ?? null"
      [loading]="serverInvoiceData.isLoading()"
      [actionTemplate]="actionsTemplate"
      [showAddButton]="true"
      [addButtonText]="'Nueva Factura Electrónica'"
      [addButtonIcon]="'fa-regular fa-file-lines'"
      [showExportButton]="true"
      [exportFileName]="exportFileName()"
      [showColumnFilters]="true"
      (action)="handleTableAction($event)"
      (serverPaginationChange)="onPaginationChange($event)"
            [showSecondaryButton]="true"
      [secondaryButtonText]="'Configuración '"
            (secondaryButtonAction)="handleTableAction({ action: 'view-enterprise-dian' })"
    >
    </app-table-dynamic>

    <!-- Popup para visualizar PDF de factura DIAN -->
    @if (showPdfPopup()) {
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" (click)="closePdfPopup()">
        <div class="bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 rounded-2xl shadow-2xl w-full max-w-7xl flex flex-col max-h-[95vh]" (click)="$event.stopPropagation()">
          <!-- Modal Header -->
          <div class="sticky top-0 bg-gradient-to-r from-[#2563eb00] to-blue-500 px-6 py-4 rounded-t-2xl flex-shrink-0 z-10">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-bold text-white flex items-center gap-2">
                <i class="fas fa-file-pdf"></i>
                Documento Factura Electrónica DIAN
              </h3>
              <button
                (click)="closePdfPopup()"
                class="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
              >
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>
          </div>

          <!-- Content - Área scrollable con flex-1 para ocupar todo el espacio -->
          <div class="pdf-content-wrapper">
            @if (documentInvoiceDian.isLoading()) {
              <div class="state-container">
                <div class="flex flex-col justify-center items-center space-y-4">
                  <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-500/30 border-t-blue-500"></div>
                  <span class="text-white text-lg font-medium">Cargando documento...</span>
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
            }

            @if (documentInvoiceDian.error()) {
              <div class="state-container">
                <div class="flex flex-col justify-center items-center space-y-4">
                  <i class="fas fa-exclamation-triangle text-red-400 text-6xl"></i>
                  <p class="text-red-400 text-lg font-medium">Error al cargar el documento</p>
                  <p class="text-gray-400 text-sm">Por favor, intente nuevamente</p>
                </div>
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

          <!-- Modal Footer - Sticky -->
          <div class="sticky bottom-0 bg-white/10 dark:bg-slate-700/30 backdrop-blur-md border-t border-white/20 dark:border-slate-600/30 px-6 py-4 rounded-b-2xl flex justify-end gap-3 flex-shrink-0 z-10">
            <button
              (click)="downloadInvoice(selectedInvoiceForView()!)"
              [disabled]="!cachedPdfUrl()"
              class="px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <i class="fas fa-download"></i>
              <span>Descargar PDF</span>
            </button>
            <button
              (click)="closePdfPopup()"
              class="px-4 py-3 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md text-gray-900 dark:text-white hover:bg-white/20 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 font-semibold flex items-center gap-2"
            >
              <i class="fas fa-times"></i>
              <span>Cerrar</span>
            </button>
          </div>
        </div>
      </div>
    }
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

  showPdfPopup = signal(false);
  selectedInvoiceForView = signal<any>(null);

  cachedPdfUrl = computed(() => {
    const base64 = this.documentInvoiceDian.value()?.response?.file?.content;
    if (!base64) return null;
    const dataUrl = `data:application/pdf;base64,${base64}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(dataUrl);
  });

  invoiceColumns = signal([
    // { field: 'estado', header: 'Estado', type: 'text' as const },
    { field: 'numero', header: 'Factura', type: 'text' as const },
    { field: 'estadoLegal', header: 'Estado Legal', type: 'text' as const },
    { field: 'empresa.nombre', header: 'Empresa', type: 'text' as const },
    { field: 'cliente.nombre', header: 'Cliente', type: 'text' as const },
    { field: 'cliente.numeroCedula', header: 'Cédula', type: 'text' as const },
    // { field: 'empresa.fechaCreacion', header: 'Fecha Emisión', type: 'date' as const, template: 'fechaCreacionTpl' },
    { field: 'descripcion', header: 'Descripción', type: 'text' as const },
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
    if (event.action === 'add') {
      this.goToCreateInvoice();
    } else if (event.action === 'view' && event.row) {
      this.viewInvoiceDetail(event.row);
    } else if (event.action === 'download' && event.row) {
      this.downloadInvoice(event.row);
    } else if (event.action === 'view-enterprise-dian') {
      this.router.navigate(['/shell/electronic-invoicing/enterprice-dian']);
    }
  }

  onPaginationChange(params: IPaginationParams): void {
    this.paginationParams.set(params);
  }

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

  downloadInvoice(invoice: any): void {
    const base64 = this.documentInvoiceDian.value()?.response?.file?.content;
    if (!base64) {
      this.toastService.warning('Advertencia', 'No hay documento disponible para descargar');
      return;
    }

    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${base64}`;
    link.download = `factura_${invoice.numero || invoice.idDian}.pdf`;
    link.click();
    this.toastService.success('Exito', 'Documento descargado');
  }

  closePdfPopup(): void {
    this.showPdfPopup.set(false);
    this.selectedInvoiceForView.set(null);
  }

  /**
   * Formatea una fecha ISO a formato legible DD/MM/YYYY
   */
  // formatDate(dateString: string): string {
  //   if (!dateString) return '';

  //   try {
  //     const datePart = dateString.split('T')[0];
  //     const [year, month, day] = datePart.split('-');
  //     const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day));

  //     return date.toLocaleDateString('es-ES', {
  //       day: '2-digit',
  //       month: '2-digit',
  //       year: 'numeric'
  //     });
  //   } catch (error) {
  //     return dateString;
  //   }
  // }
}
