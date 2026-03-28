import {
  Component,
  computed,
  inject,
  PLATFORM_ID,
  signal,
  ViewChild,
  ElementRef,
  AfterViewInit,
  EnvironmentInjector,
  effect,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FacturaService } from '../../service/factura.service';
import { ToastService } from '@services/toast.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY, firstValueFrom, of, catchError, map } from 'rxjs';
import { TableComponent } from '@components/table';
import { PopupComponent } from '@shared/components/popUp';
import { IPaginationParams } from '@interfaces/IpaginatedResponse';
import { PlazoPagoService } from '../../service/print-bill-details.service';
import { PdfService } from '@services/pdf.service';
import { PdfBill } from '@components/pdf-bill/pdf-bill';
import { TableStateService } from '../../../../core/services/table-state.service';
import { DeudaService } from '../../service/deuda.service';
import { DocumentAzureBlobService } from '../../../fee/services/document-azure-blob.service';
import { BillBack } from '../../../../core/components/billBack/bill-back';

@Component({
  selector: 'app-bill',
  standalone: true,
  imports: [CommonModule, TableComponent, RouterModule, PopupComponent, PdfBill, BillBack],
  template: `
    <ng-template #actionsTemplate let-row>
      <div class="flex items-center space-x-2">
        <button
          type="button"
          (click)="handleTableAction({ action: 'edit', row })"
          class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-blue-600/50 text-blue-400 hover:bg-blue-600/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors duration-200 cursor-pointer"
          title="Editar factura"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          type="button"
          (click)="handleTableAction({ action: 'print', row })"
          class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-yellow-600/50 text-yellow-500 hover:bg-yellow-600/10 focus:outline-none focus:ring-2 focus:ring-yellow-500/40 transition-colors duration-200 cursor-pointer"
          title="Imprimir factura"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <button
          type="button"
          (click)="handleTableAction({ action: 'download', row })"
          class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-green-600/50 text-green-500 hover:bg-green-600/10 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-colors duration-200 cursor-pointer"
          title="Descargar factura PDF"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      </div>
    </ng-template>

    <app-table-dynamic
      [title]="title()"
      [columns]="billColumns()"
      [serverMode]="true"
      [serverData]="serverBillData.value() ?? null"
      [loading]="serverBillData.isLoading()"
      [actionTemplate]="actionsTemplate"
      [showAddButton]="true"
      [addButtonText]="'Deuda Clientes'"
      [addButtonIcon]="'fa-solid fa-file-invoice-dollar'"
      [showSecondaryButton]="true"
      [secondaryButtonText]="bulkDownloadButtonText()"
      [secondaryButtonIcon]="'fa-solid fa-download'"
      [showExportButton]="true"
      [exportFileName]="exportFileName()"
      [showColumnFilters]="true"
      [externalFilters]="tableState.columnFilters()"
      [externalFiltersVisible]="tableState.filtersVisible()"
      [exportData]="exportDataForTable()"
      [isLoadingExportData]="isLoadingExportData()"
      (action)="handleTableAction($event)"
      (secondaryButtonAction)="confirmBulkDownload()"
      (serverPaginationChange)="onPaginationChange($event)"
      (filtersChange)="onFiltersChange($event)"
      (filtersVisibilityChange)="onFiltersVisibilityChange($event)"
      (exportAllDataRequest)="handleExportRequest($event)"
    >
    </app-table-dynamic>

    <app-pop-up
      [open]="showDeleteConfirm"
      [isConfirmation]="true"
      [title]="'Eliminar Factura'"
      [message]="
        '¿Está seguro que desea eliminar esta factura? Esta acción no se puede deshacer.'
      "
      [confirmText]="'Eliminar'"
      [cancelText]="'Cancelar'"
      (confirmAction)="confirmDelete()"
    >
    </app-pop-up>

    <!-- Popup de confirmación de descarga masiva -->
    <app-pop-up
      [open]="showBulkDownloadConfirm"
      [isConfirmation]="true"
      [title]="'Descarga Masiva de Facturas'"
      [message]="getBulkDownloadConfirmMessage()"
      [confirmText]="'Iniciar Descarga'"
      [cancelText]="'Cancelar'"
      (confirmAction)="startBulkDownload()"
      (cancelAction)="cancelBulkDownload()"
    >
    </app-pop-up>

    <!-- Popup de progreso de descarga masiva -->
    <app-pop-up
      [open]="showBulkDownloadProgress"
      [isConfirmation]="true"
      [title]="'Descargando Facturas'"
      [message]="getBulkDownloadProgressMessage()"
      [confirmText]="'Cancelar Descarga'"
      [cancelText]="''"
      (confirmAction)="cancelBulkDownload()"
    >
    </app-pop-up>

    <!-- Contenedor oculto para la factura -->
    <div #hiddenBillContainer style="position: absolute; left: -9999px; top: -9999px; width: 900px; overflow: hidden;">
      @if (billDataForPdf()) {
        <!-- Frente de la factura -->
        <div class="front">
          <app-pdf-bill
            [selectedStatus]="billDataForPdf().factura?.estadoNombre || null"
            [billData]="billDataForPdf()"
            [dataDeudaConsolidada]="deudaConsolidadaForPdf()">
          </app-pdf-bill>
        </div>
        <!-- Reverso de la factura -->
        <div class="back">
          <app-bill-back
            [templateData]="backTemplateDataForPdf()">
          </app-bill-back>
        </div>
      }
    </div>
  `,
})
export class Bill  {
  @ViewChild('hiddenBillContainer') hiddenBillContainer!: ElementRef<HTMLElement>;
  title = signal('Gestión de Facturas');
  showDeleteConfirm = signal(false);
  itemToDelete: number | null = null;
  isDownloading = signal(false);
  billDataForPdf = signal<any>(null);
  deudaConsolidadaForPdf = signal<any>(null);
  backTemplateDataForPdf = signal<any>(null);
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  // Signals para descarga masiva
  isBulkDownloading = signal(false);
  bulkDownloadProgress = signal(0);
  bulkDownloadTotal = signal(0);
  bulkDownloadErrors = signal<string[]>([]);
  showBulkDownloadConfirm = signal(false);
  showBulkDownloadProgress = signal(false);
  shouldCancelBulkDownload = false;
  exportDataForTable = signal<any[] | null>(null);
  isLoadingExportData = signal(false);

  protected readonly facturaService = inject(FacturaService);
  protected readonly toastService = inject(ToastService);
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
  protected readonly billDetailsService = inject(PlazoPagoService);
  protected readonly pdfService = inject(PdfService);
  protected readonly injector = inject(EnvironmentInjector);
  protected readonly tableState = inject(TableStateService);
  protected readonly deudaService = inject(DeudaService);
  protected readonly documentService = inject(DocumentAzureBlobService);

  constructor() {
    effect(() => {
      const data = this.exportDataForTable();
      const isLoading = this.isLoadingExportData();
      if (data && data.length > 0 && !isLoading) {
        setTimeout(() => {
          this.exportDataForTable.set(null);
        }, 2000);
      }
    });
  }

  billColumns = signal([
    { field: 'codigo', header: 'Código', type: 'text' as const },
    { field: 'nuid', header: 'NUID', type: 'text' as const },
    { field: 'clienteNombreCompleto', header: 'Nombre', type: 'text' as const },
    { field: 'corregimientoNombre', header: 'Ubicación', type: 'text' as const },
    { field: 'consumo', header: 'Lectura', type: 'number' as const },
    { field: 'fechaEmision', header: 'Fecha emisión', type: 'date' as const },
    { field: 'fechaFin', header: 'Fecha Vencimiento', type: 'date' as const },
    { field: 'estadoNombre', header: 'Estado', type: 'text' as const },
    // { field: 'tipoPagoNombre', header: 'Tipo Pago', type: 'text' as const }, lo comente por qeu no nos srive para nada
    { field: 'precio', header: 'Valor', type: 'currency' as const },
  ]);

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

  readonly enterpriseId = computed(() => {
    const data = this.userData();
    return data?.empresaId || null;
  });

    readonly exportFileName = computed(
    () => `facturas_${new Date().toISOString().split('T')[0]}`
  );

  // Computed para el texto dinámico del botón de descarga masiva
  readonly bulkDownloadButtonText = computed(() => {
    if (this.isBulkDownloading()) {
      return `Descargando... (${this.bulkDownloadProgress()}/${this.bulkDownloadTotal()})`;
    }
    const total = this.serverBillData.value()?.response?.length || 0;
    return `Descargar todas (${total})`;
  });

  // Usar paginationParams del servicio de estado genérico
  readonly paginationParams = this.tableState.paginationParams;



  serverBillData = rxResource({
    params: () => ({
      enterpriseId: this.enterpriseId(),
      pagination: this.paginationParams(),
    }),
    stream: ({ params }) => {
      const { enterpriseId, pagination } = params;
      if (!enterpriseId) {
        return EMPTY;
      }
      return this.facturaService.getAllBillByIdPaginated(
        enterpriseId,
        pagination
      ).pipe(
        map(response => {
          // Transformar los datos para concatenar los nombres
          if (response?.response && Array.isArray(response.response)) {
            response.response = response.response.map((factura: any) => ({
              ...factura,
              clienteNombreCompleto: [
                factura.nombre,
                factura.segundoNombre,
                factura.apellido,
                factura.segundoApellido
              ]
                .filter(Boolean)
                .join(' ')
                .trim()
            }));
          }
          return response;
        }),
        catchError(error => {
          console.error('Error loading bills:', error);
          // Retornar un observable con estructura compatible con IPaginatedResponse
          return of({
            success: false,
            message: 'Error al cargar facturas',
            code: error.status || 500,
            totalCount: 0,
            pageSize: pagination.size,
            currentPage: pagination.page,
            totalPages: 0,
            response: []
          });
        })
      );
    },
  });

  goToCustomerDebt(): void {
    this.router.navigate(['customer-debt'], {
      relativeTo: this.route,
    });
  }

  goToCreateDebt(): void {
    this.router.navigate(['create-debt'], {
      relativeTo: this.route,
    });
  }

  handleTableAction(event: { action: string; row?: any }): void {
    if (event.action === 'add') {
      this.goToCustomerDebt();
    } else if (event.action === 'edit' && event.row) {
      this.router.navigate(['update-bill', event.row.id], {
        relativeTo: this.route,
        queryParams: {
          lecturaId: event.row.lectura?.id,
          consumoActual: event.row.consumo
        }
      });
    } else if (event.action === 'print' && event.row) {
      this.router.navigate(['print-bill', event.row.id], {
        relativeTo: this.route,
        queryParams: { empresaClienteContadorId: event.row.empresaClienteContadorId, facturaId: event.row.id}
      });
    } else if (event.action === 'download' && event.row) {
      this.downloadBillPDF(event.row.id, event.row.codigo || event.row.id);
    } else if (event.action === 'delete' && event.row) {
      this.onDelete(event.row.id);
    }
  }

  onDelete(id: number): void {
    this.itemToDelete = id;
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(): void {
    if (this.itemToDelete !== null) {
      this.facturaService.deleteFacturaById(this.itemToDelete).subscribe({
        next: () => {
          this.toastService.success(
            'Eliminado',
            'Factura eliminada correctamente.'
          );
          this.serverBillData.reload?.();
          this.itemToDelete = null;
        },
        error: () => {
          this.toastService.error('Error', 'No se pudo eliminar la factura.');
          this.itemToDelete = null;
        },
      });
    }
    this.showDeleteConfirm.set(false);
  }

  onPaginationChange(params: IPaginationParams): void {
    this.tableState.updatePagination(params);
  }

  onFiltersChange(filters: Record<string, string>): void {
    this.tableState.updateFilters(filters);
  }

  onFiltersVisibilityChange(visible: boolean): void {
    this.tableState.updateFiltersVisibility(visible);
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
        size: event.totalCount
      };

      const response = await firstValueFrom(
        this.facturaService.getAllBillByIdPaginated(enterpriseId, exportParams)
      );

      if (response?.response && Array.isArray(response.response)) {
        const transformedData = response.response.map((factura: any) => ({
          ...factura,
          clienteNombreCompleto: [
            factura.nombre,
            factura.segundoNombre,
            factura.apellido,
            factura.segundoApellido
          ]
            .filter(Boolean)
            .join(' ')
            .trim()
        }));

        this.exportDataForTable.set(transformedData);
        this.toastService.success('Datos cargados', `${transformedData.length} registros listos para exportar`);
      } else {
        throw new Error('No se recibieron datos del servidor');
      }
    } catch (error) {
      console.error('Error al cargar datos para exportación:', error);
      // this.toastService.error('Error', 'No se pudieron cargar los datos para exportar');
      this.exportDataForTable.set(null);
    } finally {
      this.isLoadingExportData.set(false);
    }
  }

  async downloadBillPDF(billId: number, billCode: string | number, isBulkDownload: boolean = false): Promise<boolean> {
    if (!isBulkDownload && this.isDownloading()) {
      this.toastService.warning('Descarga en proceso', 'Ya hay una descarga en curso, por favor espere.');
      return false;
    }

    if (!isBulkDownload) {
      this.isDownloading.set(true);
      this.toastService.info('Preparando descarga', 'Generando PDF de la factura...');
    }

    try {

      const billDetailsResponse = await firstValueFrom(this.billDetailsService.getAllBillDetails(this.enterpriseId(), billId));

      if (!billDetailsResponse?.response) {
        throw new Error('No se pudieron obtener los detalles de la factura');
      }

      const billData = billDetailsResponse.response;
      this.billDataForPdf.set(billData);

      // 2. Cargar deuda
      const empresaClienteContadorId = billData?.factura?.idEmpresaClienteContador;
      if (empresaClienteContadorId) {
        try {
          const deudaResponse = await firstValueFrom(
            this.deudaService.getConsolidationByClienteId(Number(empresaClienteContadorId)).pipe(
              catchError(() => of({ response: null }))
            )
          );
          this.deudaConsolidadaForPdf.set(deudaResponse?.response || null);
        } catch {
          this.deudaConsolidadaForPdf.set(null);
        }
      }

      // 3. Cargar plantilla del reverso (opcional, no crítico)
      const empresaId = this.enterpriseId();
      if (empresaId) {
        try {
          const templateResponse = await firstValueFrom(
            this.documentService.getInvoiceTemplateByEnterprise(empresaId).pipe(
              catchError(() => of({ success: false, response: [] }))
            )
          );

          if (templateResponse?.success && templateResponse.response?.length > 0) {
            const template = templateResponse.response[0];
            this.backTemplateDataForPdf.set({
              htmlContent: template.contenido,
              empresa: {
                nombre: billData?.empresa?.nombre || 'Empresa de Servicios Públicos',
                nit: billData?.empresa?.nit || '',
                direccion: billData?.empresa?.direccion?.descripcion || '',
              },
            });
          } else {
            this.backTemplateDataForPdf.set(null);
          }
        } catch {
          this.backTemplateDataForPdf.set(null);
        }
      }

      // 4. Esperar a que se renderice el contenido
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 5. Capturar elementos del DOM
      const frontElement = this.hiddenBillContainer.nativeElement.querySelector('.front .bill-content') as HTMLElement;
      const backElement = this.hiddenBillContainer.nativeElement.querySelector('.back .bill-back-container') as HTMLElement;

      if (!frontElement) {
        throw new Error('No se encontró el contenido del frente de la factura');
      }

      if (!backElement) {
        throw new Error('No se encontró el contenido del reverso de la factura');
      }

      // 6. Generar PDF con frente y reverso
      const isMobile = window.innerWidth <= 768;
      const empresaCodigo = billData?.empresa?.codigo || '';
      const clienteNombre = billData?.cliente?.primerNombre || 'cliente';
      const timestamp = new Date().getTime();
      const filename = `factura-${empresaCodigo}-${billId}-${clienteNombre}-${timestamp}.pdf`;

      if (isMobile) {
        await this.pdfService.convertTwoPagesToPdfAndOpen(frontElement, backElement);
      } else {
        await this.pdfService.convertTwoPagesToPdf(frontElement, backElement, filename);
      }

      if (!isBulkDownload) {
        this.toastService.success(
          '¡Descarga Exitosa!',
          `La factura ${billCode} se ha descargado correctamente con frente y reverso.`
        );
      }

      // 7. Limpiar los datos después de la descarga
      setTimeout(() => {
        this.billDataForPdf.set(null);
        this.deudaConsolidadaForPdf.set(null);
        this.backTemplateDataForPdf.set(null);
        if (!isBulkDownload) {
          this.isDownloading.set(false);
        }
      }, isBulkDownload ? 100 : 1500);

      return true;

    } catch (error) {
      console.error('Error en downloadBillPDF:', error);
      if (!isBulkDownload) {
        this.toastService.error('Error en la descarga', 'No se pudo generar el PDF de la factura');
      }
      // Limpiar los datos en caso de error
      this.billDataForPdf.set(null);
      this.deudaConsolidadaForPdf.set(null);
      this.backTemplateDataForPdf.set(null);
      if (!isBulkDownload) {
        this.isDownloading.set(false);
      }
      return false;
    }
  }

  // Métodos para descarga masiva
  getBulkDownloadConfirmMessage(): string {
    const total = this.serverBillData.value()?.response?.length || 0;
    return `Está a punto de descargar ${total} factura(s) en formato PDF. Este proceso puede tomar varios minutos dependiendo de la cantidad de facturas. ¿Desea continuar?`;
  }

  getBulkDownloadProgressMessage(): string {
    const progress = this.bulkDownloadProgress();
    const total = this.bulkDownloadTotal();
    const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;
    const errors = this.bulkDownloadErrors().length;

    let message = `Progreso: ${progress} de ${total} facturas (${percentage}%)`;
    if (errors > 0) {
      message += `\n\nErrores: ${errors} factura(s) no se pudieron descargar`;
    }
    message += '\n\nPor favor espere...';

    return message;
  }

  confirmBulkDownload(): void {
    const bills = this.serverBillData.value()?.response;
    if (!bills || bills.length === 0) {
      this.toastService.warning('No hay facturas', 'No hay facturas disponibles para descargar');
      return;
    }

    this.showBulkDownloadConfirm.set(true);
  }

  async startBulkDownload(): Promise<void> {
    const bills = this.serverBillData.value()?.response;
    if (!bills || bills.length === 0) return;

    this.showBulkDownloadConfirm.set(false);
    this.showBulkDownloadProgress.set(true);
    this.isBulkDownloading.set(true);
    this.bulkDownloadProgress.set(0);
    this.bulkDownloadTotal.set(bills.length);
    this.bulkDownloadErrors.set([]);
    this.shouldCancelBulkDownload = false;

    this.toastService.info('Iniciando descarga masiva', `Comenzando a descargar ${bills.length} factura(s)...`);

    const errors: string[] = [];

    for (let i = 0; i < bills.length; i++) {
      // Verificar si se debe cancelar
      if (this.shouldCancelBulkDownload) {
        this.toastService.warning(
          'Descarga cancelada',
          `Se canceló la descarga. Se descargaron ${i} de ${bills.length} facturas.`
        );
        break;
      }

      const bill = bills[i];
      try {
        const success = await this.downloadBillPDF(bill.id, bill.codigo || bill.id, true);
        if (!success) {
          errors.push(`Factura ${bill.codigo || bill.id}`);
        }
      } catch (error) {
        errors.push(`Factura ${bill.codigo || bill.id}`);
      }

      this.bulkDownloadProgress.set(i + 1);
      this.bulkDownloadErrors.set(errors);

      // Pequeño delay entre descargas para no saturar el navegador
      if (i < bills.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }

    // Mostrar resumen final
    this.showBulkDownloadProgress.set(false);
    this.isBulkDownloading.set(false);

    if (!this.shouldCancelBulkDownload) {
      const successCount = bills.length - errors.length;
      if (errors.length === 0) {
        this.toastService.success(
          '¡Descarga masiva completada!',
          `Se descargaron exitosamente ${successCount} factura(s).`
        );
      } else {
        this.toastService.warning(
          'Descarga masiva completada con errores',
          `Se descargaron ${successCount} factura(s). ${errors.length} factura(s) fallaron: ${errors.join(', ')}`
        );
      }
    }

    this.shouldCancelBulkDownload = false;
  }

  cancelBulkDownload(): void {
    this.shouldCancelBulkDownload = true;
    this.showBulkDownloadConfirm.set(false);
    this.showBulkDownloadProgress.set(false);
    this.isBulkDownloading.set(false);
  }
}
