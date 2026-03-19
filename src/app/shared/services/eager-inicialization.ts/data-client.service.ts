import { computed, inject, Injectable, signal } from "@angular/core";
import { rxResource } from "@angular/core/rxjs-interop";
import { catchError, of } from "rxjs";
import { EnterpriseClientCounterService } from "../../../modules/client/service/enterpriseClientCounter.service";


@Injectable({
  providedIn: 'root'
})
export class ClienteDetalleEagerService {

  private readonly clienteService = inject(EnterpriseClientCounterService);
  private empresaClienteContadorId = signal<number | null>(null);

  private clienteResource = rxResource({
    params: () => ({
      id: this.empresaClienteContadorId(),
    }),

    stream: ({ params }) => {

      if (!params.id) {
        return of(null);
      }

      return this.clienteService
        .getClientByEmpresaClienteContadorId(params.id)
        .pipe(
          catchError(() => of(null))
        );
    },
  });

  readonly clienteDetalle = computed(
    () => this.clienteResource.value() || null
  );

  readonly isLoading = this.clienteResource.isLoading;
  readonly error = this.clienteResource.error;


  setClienteId(id: number) {
    this.empresaClienteContadorId.set(id);
  }

  clear() {
    this.empresaClienteContadorId.set(null);
  }

}
