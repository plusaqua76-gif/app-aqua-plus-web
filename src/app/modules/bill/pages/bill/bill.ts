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
import { EMPTY, firstValueFrom, of, catchError } from 'rxjs';
import { TableComponent } from '@components/table';
import { PopupComponent } from '@shared/components/popUp';
import { IPaginationParams } from '@interfaces/IpaginatedResponse';
import { PlazoPagoService } from '../../service/print-bill-details.service';
import { PdfService } from '@services/pdf.service';
import { PdfBill } from '@components/pdf-bill/pdf-bill';

@Component({
  selector: 'app-bill',
  imports: [CommonModule, TableComponent, RouterModule, PopupComponent, PdfBill],
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
      [showExportButton]="true"
      [exportFileName]="exportFileName()"
      [showColumnFilters]="true"
      (action)="handleTableAction($event)"
      (secondaryButtonAction)="goToCreateDebt()"
      (serverPaginationChange)="onPaginationChange($event)"
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

    <!-- Contenedor oculto para la factura -->
    <div #hiddenBillContainer style="position: absolute; left: -9999px; top: -9999px; width: 900px; height: 1200px; overflow: hidden;">
      @if (billDataForPdf()) {
        <app-pdf-bill
          [selectedStatus]="null"
          [billData]="billDataForPdf()">
        </app-pdf-bill>
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
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  protected readonly facturaService = inject(FacturaService);
  protected readonly toastService = inject(ToastService);
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
  protected readonly billDetailsService = inject(PlazoPagoService);
  protected readonly pdfService = inject(PdfService);
  protected readonly injector = inject(EnvironmentInjector);

  billColumns = signal([
    { field: 'codigo', header: 'Código', type: 'text' as const },
    { field: 'nombre', header: 'Nombre', type: 'text' as const },
    { field: 'apellido', header: 'Apellido', type: 'text' as const },
    { field: 'consumo', header: 'Consumo (m³)', type: 'number' as const },
    { field: 'fechaEmision', header: 'Fecha emisión', type: 'date' as const },
    { field: 'fechaFin', header: 'Fecha Vencimiento', type: 'date' as const },
    { field: 'estadoNombre', header: 'Estado', type: 'text' as const },
    { field: 'tipoPagoNombre', header: 'Tipo Pago', type: 'text' as const },
    { field: 'precio', header: 'Precio', type: 'currency' as const },
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
    () => `facturas_${new Date().toISOString().split('T')[0]}`
  );

  readonly paginationParams = signal<IPaginationParams>({
    page: 0,
    size: 5,
  });



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
        queryParams: { empresaClienteContadorId: event.row.empresaClienteContadorId }
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
    this.paginationParams.set(params);
  }

  async downloadBillPDF(billId: number, billCode: string | number): Promise<void> {
    if (this.isDownloading()) {
      this.toastService.warning('Descarga en proceso', 'Ya hay una descarga en curso, por favor espere.');
      return;
    }

    this.isDownloading.set(true);
    this.toastService.info('Preparando descarga', 'Generando PDF de la factura...');

    try {
      // 1. Obtener los detalles de la factura
      const billDetailsResponse = await firstValueFrom(this.billDetailsService.getAllBillDetails(billId));

      if (!billDetailsResponse?.response) {
        throw new Error('No se pudieron obtener los detalles de la factura');
      }

      // 2. Establecer los datos para renderizar el componente oculto
      this.billDataForPdf.set(billDetailsResponse.response);

      // 3. Esperar a que el componente se renderice
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 4. Buscar el elemento de la factura en el contenedor oculto
      const billElement = this.hiddenBillContainer.nativeElement.querySelector('.bill-content') as HTMLElement;
      if (!billElement) {
        throw new Error('No se encontró el contenido de la factura renderizada');
      }

      // 5. Generar el PDF
      const filename = `factura-aquaplus-${billCode}-${Date.now()}.pdf`;
      await this.pdfService.convertElementToPdf(billElement, filename);

      // 6. Esperar un momento antes de mostrar el éxito para asegurar que el PDF se descargó
      await new Promise(resolve => setTimeout(resolve, 500));

      // 7. Mostrar toast de éxito más notorio
      this.toastService.success(
        '✅ ¡Descarga Exitosa!',
        `La factura ${billCode} se ha descargado correctamente. Revisa tu carpeta de descargas.`
      );

      // 8. Limpiar los datos después del toast
      setTimeout(() => {
        this.billDataForPdf.set(null);
        this.isDownloading.set(false);
      }, 1500);

    } catch (error) {
      this.toastService.error('Error en la descarga', 'No se pudo generar el PDF de la factura');
      // Limpiar los datos en caso de error
      this.billDataForPdf.set(null);
      this.isDownloading.set(false);
    }
  }
}
