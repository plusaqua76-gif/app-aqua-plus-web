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

  id = signal<number>(+this.route.snapshot.paramMap.get('id')!);

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

  readonly nombreUsuario = computed(() => {
    const data = this.userData();
    return data?.nombre || null;
  });

  constructor() {
    this.initializeForm();

    // Effect para llenar el formulario cuando los datos estén disponibles
    effect(() => {
      const data = this.debtData();
      if (data) {
        this.fillForm(data);
      }
    });
  }

  initializeForm(): void {
    this.registerForm = this.fb.group({
      empresaClienteContador: [null, Validators.required],
      tipoDeuda: [null, Validators.required],
      factura: [null, Validators.required],
      plazoPago: [null, Validators.required],
      fechaDeuda: ['', Validators.required],
      valor: ['', Validators.required],
      descripcion: ['']
    });
  }

  fillForm(data: any): void {
    // Formatear fecha
    const fechaFormateada = data.fechaDeuda ?
      new Date(data.fechaDeuda).toISOString().split('T')[0] : '';

    this.registerForm.patchValue({
      empresaClienteContador: data.empresaClienteContador,
      tipoDeuda: data.tipoDeuda,
      factura: data.factura,
      plazoPago: data.plazoPago,
      fechaDeuda: fechaFormateada,
      valor: data.valor,
      descripcion: data.descripcion || ''
    });
  }

  onSubmit(): void {
    const data = this.debtData();
    if (!data) return;

    const deuda = {
      ...data,
      fechaDeuda: this.registerForm.value.fechaDeuda || data.fechaDeuda,
      valor: parseFloat(this.registerForm.value.valor) || data.valor,
      descripcion: this.registerForm.value.descripcion || data.descripcion,
      usuarioModificacion: this.nombreUsuario(),
      fechaModificacion: new Date()
    };

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
