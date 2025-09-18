import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AbonoService } from '../../service/abono.service';
import { ApiResponse } from '@interfaces/Iresponse';
import { IAbonoFactura } from '@interfaces/IdeudaFactura';
import { TableComponent } from '@components/table';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-credit-customer',
  imports: [ CommonModule, TableComponent, RouterModule],
  template: `

    <app-table-dynamic
        [title]="title()"
        [datasource]="creditCustomerData()"
        [columns]="creditCustomerColumns()"
      />
  `,

})
export class CreditCustomer {

  creditCustomerColumns = signal([
    { field: 'nombreCliente', header: 'Cliente' },
    { field: 'codigoFactura', header: 'Código Factura' },
    { field: 'fechaAbono', header: 'Fecha Abono' },
    { field: 'valorAbono', header: 'Valor Abono' },
  ]);
  creditCustomerData = computed(() => this.dataCreditCustomer.value() ?? []);
  title = signal('Abono Facturas');

  tableData: any[] = [];

  protected readonly abonoService = inject(AbonoService);

  dataCreditCustomer = rxResource({
  stream: () =>
    this.abonoService.getAllAbono().pipe(
      map((apiRes: ApiResponse<IAbonoFactura[]>) =>
        apiRes.response.map(abono => {
          const cliente = abono.deudaCliente.empresaClienteContador.cliente;

          const fullName = [
            cliente.nombre || '',
            cliente.segundoNombre || '',
            cliente.apellido || '',
            cliente.segundoApellido || ''
          ].filter(Boolean).join(' ');

          const fechaAbono = new Date(abono.fechaCreacion);

          return {
            id: abono.id,
            nombreCliente: fullName,
            codigoFactura: abono.deudaCliente.factura?.codigo || 'Sin código',
            fechaAbono: fechaAbono.toLocaleDateString('es-CO'),
            valorAbono: `$${Number(abono.valor).toLocaleString()}`
          };
        })
      )
    )
});

}
