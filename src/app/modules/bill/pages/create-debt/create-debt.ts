import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EnterpriseClientCounterService } from '../../../client/service/enterpriseClientCounter.service';
import { PlazoPagoService } from '../../service/plazoPago.service';
import { ToastService } from '@services/toast.service';
import { PqrEnterprisesService } from '../../../pqr-client/services/pqr-enterprices.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
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
    descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
  });

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
      return this.enterpriseClientCounterService.getAllClientsByIdEnterprise(empresaId);
    }
  })

  plazopago = rxResource({
    stream: () => this.plazoPagoService.getAllPlazoPago()
  })

  tipodeuda = rxResource({
    stream: () => this.tipoDeudaService.getAllTipoDeuda()
  })

  // Métodos para validar el formulario
  isFormValid(): boolean {
    return this.deudaForm.valid;
  }

  getFieldError(fieldName: string): string | null {
    const field = this.deudaForm.get(fieldName);
    if (field?.errors && field?.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['min']) return `El valor debe ser mayor a 0`;
      if (field.errors['pattern']) return `Formato de valor inválido`;
      if (field.errors['minlength']) return `Mínimo 10 caracteres`;
      if (field.errors['maxlength']) return `Máximo 500 caracteres`;
    }
    return null;
  }

  // Método para crear la deuda
  crearDeuda(): void {
    if (!this.isFormValid()) {
      this.toastService.warning('Formulario inválido', 'Por favor complete todos los campos correctamente');
      this.markAllFieldsAsTouched();
      return;
    }

    const usuario = this.nombreUsuario();
    if (!usuario) {
      this.toastService.error('Error', 'No se pudo obtener la información del usuario');
      return;
    }

    this.procesandoDeuda.set(true);

    const formValues = this.deudaForm.value;

    // Validar que los IDs existen en las listas cargadas
    // const tipoDeudaExists = this.tipodeuda.value()?.response?.find(
    //   t => t.id === Number(formValues.tipoDeudaId)
    // );

    // const plazoPagoExists = this.plazopago.value()?.response?.find(
    //   p => p.id === Number(formValues.plazoPagoId)
    // );

    // if (!tipoDeudaExists) {
    //   this.toastService.error('Error', 'Tipo de deuda no válido');
    //   this.procesandoDeuda.set(false);
    //   return;
    // }

    // if (!plazoPagoExists) {
    //   this.toastService.error('Error', 'Plazo de pago no válido');
    //   this.procesandoDeuda.set(false);
    //   return;
    // }

    // Construir el objeto de deuda enviando solo los IDs como en el ejemplo que funciona
    const deuda: Partial<IDeudaCliente> = {
      fechaDeuda: new Date(formValues.fechaDeuda!),
      valor: formValues.valor!,
      descripcion: formValues.descripcion!,
      activo: true,
      empresaClienteContador: { id: Number(formValues.empresaClienteContadorId) } as any,
      tipoDeuda: { id: Number(formValues.tipoDeudaId) } as any,
      plazoPago: { id: Number(formValues.plazoPagoId) } as any,
      usuarioCreacion: usuario,
      fechaCreacion: new Date(),
    };

    this.deudaService.saveDeuda(deuda as IDeudaCliente).subscribe({
      next: (response) => {
        const valorFormateado = Number(formValues.valor).toLocaleString('es-CO');
        this.toastService.success(
          'Deuda Creada Exitosamente',
          `Se ha registrado una nueva deuda por valor de $${valorFormateado}`
        );
        this.resetForm();
        this.procesandoDeuda.set(false);

        // Opcional: redirigir o realizar alguna acción después del éxito
        // this.router.navigate(['/bill/debt-list']);
      },
      error: (error) => {
        console.error('Error al crear deuda:', error);
        this.toastService.error(
          'Error al crear deuda',
          'No se pudo crear la deuda. Intente nuevamente.'
        );
        this.procesandoDeuda.set(false);
      }
    });
  }

  // Método para resetear el formulario
  resetForm(): void {
    this.deudaForm.reset({
      fechaDeuda: new Date().toISOString().split('T')[0]
    });
  }

  // Método para marcar todos los campos como tocados (para mostrar errores)
  private markAllFieldsAsTouched(): void {
    Object.keys(this.deudaForm.controls).forEach(key => {
      this.deudaForm.get(key)?.markAsTouched();
    });
  }

}

