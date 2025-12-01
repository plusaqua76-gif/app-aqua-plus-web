import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EnterpriseClientCounterService } from '../../../client/service/enterpriseClientCounter.service';
import { PlazoPagoService } from '../../service/plazoPago.service';
import { ToastService } from '@services/toast.service';
import { PqrEnterprisesService } from '../../../pqr-client/services/pqr-enterprices.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { of, catchError } from 'rxjs';
import { TipoDeudaService } from '../../service/tipoDeuda.service';
import { DeudaService } from '../../service/deuda.service';
import { IDeudaCliente } from '@interfaces/IdeudaFactura';
import { Router } from '@angular/router';


@Component({
  selector: 'app-create-debt',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './create-debt.html',
})
export class CreateDebt  {

  protected readonly toastService = inject(ToastService);
  protected readonly pqrService = inject(PqrEnterprisesService);
  protected platformId = inject(PLATFORM_ID);
  private readonly enterpriseClientCounterService = inject(EnterpriseClientCounterService);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly plazoPagoService = inject(PlazoPagoService);
  private readonly tipoDeudaService = inject(TipoDeudaService);
  private readonly deudaService = inject(DeudaService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly procesandoDeuda = signal(false);

  readonly deudaForm = this.fb.group({
    empresaClienteContadorId: [null, [Validators.required]],
    tipoDeudaId: [null, [Validators.required]],
    plazoPagoId: [null, [Validators.required]],
    fechaDeuda: [new Date().toISOString().split('T')[0], [Validators.required]],
    valor: ['', [Validators.required, Validators.min(0.01), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
    descripcion: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(500)]]
  });

  readonly userData = computed(() => {
    if (!this.isBrowser) return null;
    try {
      const userDataString = sessionStorage.getItem('userData');
      if (!userDataString) return null;
      return JSON.parse(userDataString);
    } catch (e) {
      return null;
    }
  });

  readonly empresaId = computed(() => {
    const data = this.userData();
    return data?.empresaId || null;
  });

  readonly personaId = computed(() => {
    const data = this.userData();
    return data?.personaId || null;
  });

  readonly nombreUsuario = computed(() => {
    const data = this.userData();
    return data?.nombre || null;
  });

  dataClients = rxResource({
    params: () => ({
      empresaId: this.empresaId()
    }),
    stream: ({ params }) => {
      const { empresaId } = params;
      if (!empresaId) {
        return of(null);
      }
      return this.enterpriseClientCounterService.getAllClientsByIdEnterprise(empresaId).pipe(
        catchError(error => {
          return of({ success: false, response: [], message: 'Error al cargar clientes' });
        })
      );
    }
  })

  plazopago = rxResource({
    stream: () => this.plazoPagoService.getAllPlazoPago().pipe(
      catchError(error => {
        console.error('Error loading payment terms:', error);
        return of({ success: false, response: [], message: 'Error al cargar plazos de pago' });
      })
    )
  })

  tipodeuda = rxResource({
    stream: () => this.tipoDeudaService.getAllTipoDeuda().pipe(
      catchError(error => {
        console.error('Error loading debt types:', error);
        return of({ success: false, response: [], message: 'Error al cargar tipos de deuda' });
      })
    )
  })

  onSubmit(): void {
    if (this.deudaForm.invalid) {
      this.markFormGroupTouched();
      this.toastService.warning('Formulario inválido', 'Por favor complete todos los campos requeridos correctamente.');
      return;
    }

    this.procesandoDeuda.set(true);

    const formValue = this.deudaForm.value;
    const usuario = this.nombreUsuario();

    if (!usuario) {
      this.toastService.error('Error', 'No se pudo obtener la información del usuario');
      this.procesandoDeuda.set(false);
      return;
    }

    // Buscar los objetos completos para las relaciones
    const tipoDeudaSeleccionado = this.tipodeuda.value()?.response?.find(
      tipo => tipo.id === Number(formValue.tipoDeudaId)
    );

    const plazoPagoSeleccionado = this.plazopago.value()?.response?.find(
      plazo => plazo.id === Number(formValue.plazoPagoId)
    );

    if (!tipoDeudaSeleccionado || !plazoPagoSeleccionado) {
      this.toastService.error('Error', 'No se pudieron obtener los datos necesarios');
      this.procesandoDeuda.set(false);
      return;
    }

    // Buscar el cliente seleccionado para obtener el empresaClienteContadorId
    const clienteSeleccionado = this.dataClients.value()?.response?.find(
      cliente => cliente.id === Number(formValue.empresaClienteContadorId)
    );

    if (!clienteSeleccionado) {
      this.toastService.error('Error', 'No se pudo obtener la información del cliente seleccionado');
      this.procesandoDeuda.set(false);
      return;
    }

    const deuda: Partial<IDeudaCliente> = {
      empresaClienteContador: { id: (clienteSeleccionado as any).empresaClienteContadorId } as any,
      tipoDeuda: tipoDeudaSeleccionado,
      plazoPago: plazoPagoSeleccionado.id, // Solo enviar el ID
      fechaDeuda: new Date(formValue.fechaDeuda!),
      valor: formValue.valor!,
      descripcion: formValue.descripcion!,
      activo: true,
      usuarioCreacion: usuario,
      fechaCreacion: new Date()
    };

    this.deudaService.saveDeuda(deuda as IDeudaCliente).subscribe({
      next: (response) => {
        this.toastService.success(
          'Deuda Creada',
          `La deuda por valor de $${Number(formValue.valor).toLocaleString('es-CO')} ha sido creada exitosamente`
        );
        this.resetForm();
        this.procesandoDeuda.set(false);
      },
      error: (error) => {
        console.error('Error al crear deuda:', error);
        this.procesandoDeuda.set(false);
      }
    });
  }

  cancelar(): void {
    this.resetForm();
    this.router.navigate(['/shell/bill/customer-debt']);
  }

  private resetForm(): void {
    this.deudaForm.reset({
      fechaDeuda: new Date().toISOString().split('T')[0]
    });
    this.procesandoDeuda.set(false);
  }

  private markFormGroupTouched(): void {
    for (const key of Object.keys(this.deudaForm.controls)) {
      const control = this.deudaForm.get(key);
      control?.markAsTouched();
    }
  }

}

