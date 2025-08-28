import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TableColumn } from '@interfaces/ItableColumn';
import { IFactura, IfacturaResponse } from '@interfaces/Ifactura';
import { FacturaService } from '../../service/factura.service';
import { ApiResponse } from '@interfaces/Iresponse';
import { ToastService } from '@services/toast.service';
import * as XLSX from 'xlsx';

import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, map } from 'rxjs';
import { TableComponent } from '@components/table';
import { PopupComponent } from "@shared/components/popUp";
import { EnterpriseIdService } from '@services/enterpriceId.service';

@Component({
  selector: 'app-bill',
  imports: [CommonModule, TableComponent, RouterModule, PopupComponent],
  template: `


    <ng-template #actionsTemplate let-row>
  <div class="flex items-center space-x-2">
    <button (click)="handleTableAction({ action: 'edit', row })"
      class="text-green-600 hover:text-green-900 text-sm cursor-pointer">
      <i class="fas fa-edit"></i>
    </button>
   <button (click)="onDelete(row.id)"
      class="text-red-600 hover:text-red-900 text-sm cursor-pointer">
      <i class="fas fa-trash"></i>
    </button>
  </div>
</ng-template>

<app-table-dynamic
  [title]="title()"
  [columns]="billColumns()"
  [datasource]="tableData()"
  [actionTemplate]="actionsTemplate"
  [showAddButton]="true"
  [addButtonText]="'Deuda Clientes'"
  (action)="handleTableAction($event)">
</app-table-dynamic>

<div class="flex justify-end mt-6">
  <button (click)="downloadHistory()" class="mr-3 md:mr-8 bg-green-600 text-white px-4 py-2 rounded-md cursor-pointer">
    <i class="fas fa-file-excel"></i> Descargar historial
  </button>
</div>


<app-pop-up
  [open]="showDeleteConfirm"
  [isConfirmation]="true"
  [title]="'Eliminar Factura'"
  [message]="'¿Está seguro que desea eliminar esta factura? Esta acción no se puede deshacer.'"
  [confirmText]="'Eliminar'"
  [cancelText]="'Cancelar'"
  (confirmAction)="confirmDelete()">
</app-pop-up>
`
})
export class Bill {

  title = signal('Gestión de Facturas');
  showDeleteConfirm = signal(false);
  itemToDelete: number | null = null;

  billColumns = signal([
    { field: 'codigo', header: 'Código' },
    { field: 'clienteNombreCompleto', header: 'Cliente' },
    { field: 'consumo', header: 'Consumo (m³)' },
    { field: 'fechaEmision', header: 'Fecha emisión' },
    { field: 'fechaFin', header: 'Fecha Vencimiento' },
    { field: 'estadoNombre', header: 'Estado' },
    { field: 'consumoAnormal', header: 'Consumo anormal' },
    { field: 'precio', header: 'Total' },
  ]);
  private enterpriseIdService = inject(EnterpriseIdService);
  protected readonly facturaService = inject(FacturaService);
  protected readonly toastService = inject(ToastService);
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);

    readonly enterpriseId = toSignal<number | null>(
    this.enterpriseIdService.getEnterpriseId(),
    { initialValue: null }
  );


  dataBills = rxResource({
    params: () => this.enterpriseId(),
    stream: ({ params: id }) => {
      if (!id) { return EMPTY; }
      return this.facturaService.getAllBillById(id);
    }
  });

  tableData = computed(() => this.dataBills.value()?.response || []);


  // dataBills = rxResource({
  //   stream: () =>
  //     this.billService.getAllBill().pipe(
  //       map((apiRes: ApiResponse<IfacturaResponse[]>) =>
  //         apiRes.response.map(factura => {
  //           const fullName = [
  //             factura.nombre || '',
  //             factura.segundoNombre || '',
  //             factura.apellido || '',
  //             factura.segundoApellido || '',
  //           ].filter(Boolean).join(' ');

  //           const fechaEmision = new Date(factura.fechaEmision);
  //           const fechaFin = new Date(factura.fechaFin);

  //           return {
  //             id: factura.id,
  //             codigo: factura.codigo,
  //             clienteNombreCompleto: fullName,
  //             consumo: factura.consumo,
  //             fechaEmisionTexto: fechaEmision.toLocaleDateString('es-CO'),
  //             fechaFinTexto: fechaFin.toLocaleDateString('es-CO'),
  //             estadoNombre: factura.estadoNombre,
  //             consumoAnormal: factura.consumoAnormal ? 'SI' : 'NO',
  //             precioTexto: `$${Number(factura.precio).toLocaleString()}`,
  //           };
  //         })
  //       )
  //     )
  // });




  goToCustomerDebt(): void {
    this.router.navigate(['/bill/customer-debt']);
  }


  handleTableAction(event: { action: string; row?: any }): void {
  if (event.action === 'add') {
    this.goToCustomerDebt();
  }
  else if (event.action === 'edit' && event.row) {
    this.router.navigate(['/bill/update-bill', event.row.id], { relativeTo: this.route });
  }
  else if (event.action === 'delete' && event.row) {
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
          this.toastService.success('Eliminado', 'Factura eliminada correctamente.');
          this.dataBills.reload?.();
          this.itemToDelete = null;
        },
        error: () => {
          this.toastService.error('Error', 'No se pudo eliminar la factura.');
          this.itemToDelete = null;
        },
      });
    }
  }

  downloadHistory(): void {
  const data = this.tableData();
  const cols = this.billColumns();

  const exportData = data.map(factura => {
    const row: Record<string, any> = {};
    cols.forEach(col => {
      const value = factura[col.field as keyof typeof factura];
      row[col.header] = value ?? '';
    });
    return row;
  });

  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
  const workbook: XLSX.WorkBook = {
    Sheets: { 'Historial de Facturas': worksheet },
    SheetNames: ['Historial de Facturas']
  };

  const excelBuffer: any = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });

  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  });

  // FileSaver.saveAs(blob, `Historial_Facturas_${new Date().toISOString()}.xlsx`);
  this.toastService.success('Descarga completa', 'Historial de facturas descargado con éxito.');
}


}


