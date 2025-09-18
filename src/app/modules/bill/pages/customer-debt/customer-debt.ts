import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IDeudaCliente } from '@interfaces/IdeudaFactura';
import { DeudaService } from '../../service/deuda.service';
import { ApiResponse } from '@interfaces/Iresponse';
import { ToastService } from '@services/toast.service';
import { TableComponent } from '@components/table';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-customer-debt',
  imports: [CommonModule, TableComponent, RouterModule],
  template: `
    <ng-template #actionsTemplate let-row>
    <div class="flex items-center space-x-2">
      <button (click)="handleTableAction({ action: 'edit', row })"
        class="text-green-600 hover:text-green-900 text-sm">
        <i class="fas fa-edit"></i>
      </button>
      <button (click)="redirigirCrearAbono(row.id)"
        class="text-yellow-600 hover:text-yellow-900 text-sm">
        <i class="fas fa-coins"></i>
      </button>
      <button (click)="handleTableAction({ action: 'delete', row })"
        class="text-red-600 hover:text-red-900 text-sm">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  </ng-template>

  <app-table-dynamic
  [title]="title()"
  [columns]="debtColumns()"
  [datasource]="debtData()"
  [actionTemplate]="actionsTemplate"
  [showAddButton]="true"
  [addButtonText]="'Abono factura'"
  [showSecondaryButton]="true"
  (secondaryButtonAction)="createdebt()"
  (action)="handleTableAction($event)">
  </app-table-dynamic>

  `
})
export class CustomerDebt {

  debtColumns = signal<{ field: string; header: string }[]>([
    { field: 'clienteNombreCompleto', header: 'Cliente' },
    { field: 'facturaCodigo', header: 'Factura' },
    { field: 'fechaDeudaTexto', header: 'Fecha deuda' },
    { field: 'descripcion', header: 'Descripción' },
    { field: 'tipoDeudaNombre', header: 'Tipo deuda' },
    { field: 'valorTexto', header: 'Valor' },
    { field: 'activo', header: 'Estado' },
    { field: 'plazoPagoNombre', header: 'N° de cuotas' }
  ]);

  protected readonly deudaService = inject(DeudaService);
  protected readonly toastService = inject(ToastService);
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);


  /** commentNg
 * @author [PipeChavarro]
 *
 * @remarks
 * El componente no debería realizar ninguna lógica para mostrar la data; toda la lógica de transformación debe hacerse en el backend.
 * Si existe alguna lógica que no se pueda realizar desde el backend, debe implementarse en el service de Angular, no en el componente.
 */

  dataDebts = rxResource({
    stream: () => this.deudaService.getAllDeuda(
    ).pipe(
      map((apiRes: ApiResponse<IDeudaCliente[]>) =>
        apiRes.response.map(deuda => ({
          id: deuda.id,
          clienteNombreCompleto: [
            deuda.empresaClienteContador?.cliente?.nombre ?? '',
            deuda.empresaClienteContador?.cliente?.segundoNombre ?? '',
            deuda.empresaClienteContador?.cliente?.apellido ?? '',
            deuda.empresaClienteContador?.cliente?.segundoApellido ?? ''
          ].filter(Boolean).join(' '),
          facturaCodigo: deuda.factura?.codigo ?? '',
          fechaDeudaTexto: new Date(deuda.fechaDeuda).toLocaleDateString('es-CO'),
          descripcion: deuda.descripcion ?? '',
          tipoDeudaNombre: deuda.tipoDeuda?.nombre ?? '',
          valorTexto: `$${parseFloat(deuda.valor).toLocaleString('es-CO')}`,
          activo: deuda.activo ? 'PENDIENTE' : 'PAGO',
          plazoPagoNombre: deuda.plazoPago?.nombre ?? ''
        }))
      )
    )
  });

  debtData = computed(() => this.dataDebts.value() ?? []);
  title = signal('Deuda de clientes');


  handleTableAction(event: { action: string; row?: any }) {
  switch (event.action) {
    case 'edit':
      this.router.navigate(['../update-debt', event.row.id], {
        relativeTo: this.route,
      });
      break;
    case 'delete':
      this.confirmDelete(event.row?.id);
      break;
    case 'add':
      this.irAbonoFactura();
      break;
  }
}


  confirmDelete(id: number) {
    if (confirm('¿Eliminar deuda?')) {
      this.deudaService.deleteDeudaById(id).subscribe({
        next: () => {
          this.toastService.success('Éxito', 'Deuda eliminada');
          this.dataDebts.reload?.();
        },
        error: () => this.toastService.error('Error', 'No se pudo eliminar')
      });
    }
  }

  createdebt() {
    this.router.navigate(['../create-debt'], {
      relativeTo: this.route,
    });
  }

  irAbonoFactura() {
    this.router.navigate(['../credit-customer'], {
      relativeTo: this.route,
    });
  }

  redirigirCrearAbono(id: number) {
    this.router.navigate(['../create-credit', id], {
      relativeTo: this.route,
    });
  }


}
