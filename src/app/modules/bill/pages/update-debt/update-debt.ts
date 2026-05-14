import { Component, computed, effect, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { catchError, EMPTY, of } from 'rxjs';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DeudaService } from '../../service/deuda.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EnterpriseClientCounterService } from '../../../client/service/enterpriseClientCounter.service';
import { TipoDeudaService } from '../../service/tipoDeuda.service';
import { FacturaService } from '../../service/factura.service';
import { PlazoPagoService } from '../../service/plazoPago.service';
import { IDeudaCliente, IPlazoPago, ITipoDeuda } from '@interfaces/IdeudaFactura';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { IEnterpriseClientCounter } from '@interfaces/IenterpriseClientCounter';
import { IFactura, IfacturaResponse } from '@interfaces/Ifactura';
import { ToastService } from '@services/toast.service';
import { ApiResponse } from '@interfaces/Iresponse';
import { rxResource } from '@angular/core/rxjs-interop';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-update-debt',
  imports: [CommonModule,  FormsModule, ReactiveFormsModule ],
  templateUrl: './update-debt.html',
})
export class UpdateDebt {

  registerForm!: FormGroup;

  protected fb = inject(FormBuilder);
  protected deudaService = inject(DeudaService);
  protected route = inject(ActivatedRoute);
  protected router = inject(Router);
  protected toast = inject(ToastService);
  protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);
  protected enterpriseClientCounterService = inject(EnterpriseClientCounterService);
  protected facturaService = inject(FacturaService);
  protected tipoDeudaService = inject(TipoDeudaService);

  id = signal<number>(+this.route.snapshot.paramMap.get('id')!);

  // Propiedades para contadores
  selectedCounter = signal<IEnterpriseClientCounter | null>(null);

  // Propiedades para búsqueda de facturas
  billTerm = signal('');
  selectedBill = signal<{ codigo: string; id: number } | null>(null);

  dataDebtClient = rxResource({
    params: () => ({
      id: this.id(),
    }),
    stream: ({ params }) => {
      const { id } = params;
      if (!id) {
        return of(null);
      }
      return this.deudaService.getDebtByIdClient(id).pipe(
        catchError(error => {
          return of(null);
        })
      )
    }
  });

  // Computed para obtener la data de la deuda
  debtData = computed(() => this.dataDebtClient.value()?.response);

  // Obtener contadores del cliente
  countersClient = rxResource({
    params: () => {
      const idEmpresa = this.empresaId();
      const idPersona = this.clienteId();

      return { idEmpresa, idPersona };
    },
    stream: ({ params }) => {
      const { idEmpresa, idPersona } = params;
      if (!idEmpresa || !idPersona) {
        return of(null);
      }
      return this.enterpriseClientCounterService.getCountersByEmpresaPersona(idEmpresa, idPersona).pipe(
        catchError(error => {
          console.error('Error loading counters:', error);
          return of(null);
        })
      );
    }
  });

  // Lista de tipos de deuda
  tipodeuda = rxResource({
    stream: () => this.tipoDeudaService.getAllTipoDeuda().pipe(
      catchError(error => {
        console.error('Error loading debt types:', error);
        return of(null);
      })
    )
  });

  // Búsqueda de facturas por código
  billcode = rxResource({
    params: () => ({
      term: this.billTerm(),
      counterId: this.selectedCounter()?.id || null
    }),
    stream: ({ params }) => {
      const { term, counterId } = params;
      if (!term || term.trim().length < 3 || !counterId) {
        return of(null);
      }
      return this.facturaService.getBillsByCounterAndCode(counterId, term).pipe(
        catchError(error => {
          console.error('Error searching bills:', error);
          return of(null);
        })
      );
    }
  });

  // Computed para obtener el nombre del usuario
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

  readonly nombreUsuario = computed(() => {
    const data = this.userData();
    return data?.nombre || null;
  });

  // Computed para obtener el ID del cliente de la deuda
  readonly clienteId = computed(() => {
    return this.debtData()?.empresaClienteContador?.cliente?.id || null;
  });

  constructor() {
    this.initializeForm();

    // Effect para llenar el formulario cuando los datos estén disponibles
    effect(() => {
      const data = this.debtData();
      if (data) {
        this.fillForm(data);
        // Inicializar contador seleccionado
        if (data.empresaClienteContador) {
          this.selectedCounter.set(data.empresaClienteContador as any);
        }
        // Inicializar factura seleccionada
        if (data.factura) {
          this.selectedBill.set({
            codigo: (data.factura as any).codigo,
            id: data.factura.id
          });
        }
      }
    });
  }

  initializeForm(): void {
    this.registerForm = this.fb.group({
      empresaClienteContador: [null],
      tipoDeudaId: [null],
      factura: [null],
      plazoPago: [null],
      fechaDeuda: [''],
      valor: [''],
      descripcion: ['']
    });
  }

  fillForm(data: any): void {
    // Formatear fecha
    const fechaFormateada = data.fechaDeuda ?
      new Date(data.fechaDeuda).toISOString().split('T')[0] : '';
    const plazoPagoValue = data.plazoPago?.nombre || data.plazoPago || 0;
    this.registerForm.patchValue({
      empresaClienteContador: data.empresaClienteContador,
      tipoDeudaId: data.tipoDeuda?.id ?? null,
      factura: data.factura,
      plazoPago: plazoPagoValue,
      fechaDeuda: fechaFormateada,
      valor: data.valor,
      descripcion: data.descripcion || ''
    });
  }

  // Métodos para contador
  selectCounter(counter: IEnterpriseClientCounter): void {
    this.selectedCounter.set(counter);
    // Limpiar la factura seleccionada al cambiar contador
    this.clearBill();
  }

  clearCounter(): void {
    this.selectedCounter.set(null);
    this.clearBill();
  }

  // Métodos para factura
  onBillTermChange(value: string): void {
    this.billTerm.set(value);
    this.selectedBill.set(null);
  }

  selectBill(bill: { codigo: string; id: number }): void {
    this.selectedBill.set(bill);
  }

  clearBill(): void {
    this.billTerm.set('');
    this.selectedBill.set(null);
  }

  shouldShowNoResultsMessage(): boolean {
    const billData = this.billcode.value();
    const term = this.billTerm();

    if (!term || term.trim().length < 3) {
      return false;
    }

    if (this.billcode.isLoading()) {
      return false;
    }

    if (this.billcode.error()) {
      return false;
    }

    if (!billData) {
      return false;
    }

    if (billData.response && billData.response.length === 0) {
      return true;
    }

    return false;
  }

  onSubmit(): void {
    const data = this.debtData();
    if (!data) return;

    // Validar que haya un contador seleccionado
    const contadorSeleccionado = this.selectedCounter();
    if (!contadorSeleccionado) {
      this.toast.error('Error', 'Debe seleccionar un contador.');
      return;
    }

    const tipoDeudaId = this.registerForm.value.tipoDeudaId;
    if (!tipoDeudaId) {
      this.toast.error('Error', 'Debe seleccionar un tipo de deuda.');
      return;
    }

    // Construir el objeto deuda actualizado
    const deuda = {
      ...data,
      empresaClienteContador: { id: contadorSeleccionado.id },
      tipoDeuda: { id: Number(tipoDeudaId) },
      fechaDeuda: this.registerForm.value.fechaDeuda || data.fechaDeuda,
      valor: parseFloat(this.registerForm.value.valor) || data.valor,
      descripcion: this.registerForm.value.descripcion || data.descripcion,
      plazoPago: parseInt(this.registerForm.value.plazoPago) || data.plazoPago,
      usuarioModificacion: this.nombreUsuario(),
      fechaModificacion: new Date()
    };

    // Agregar factura si fue seleccionada
    const facturaSeleccionada = this.selectedBill();
    if (facturaSeleccionada) {
      (deuda as any).factura = { id: facturaSeleccionada.id };
    } else {
      (deuda as any).factura = null;
    }

    this.deudaService.updateDeuda(deuda as any).subscribe({
      next: () => {
        this.toast.success('Éxito', 'La deuda se actualizó correctamente.');
        this.router.navigate(['../customer-debt'], { relativeTo: this.route });
      },
      error: (err) => {
        console.error('Error al actualizar deuda:', err);
        this.toast.error('Error al actualizar', 'No se pudo actualizar la deuda.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/shell/bill/customer-debt']);
  }

}
