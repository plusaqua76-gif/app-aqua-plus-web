import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AbonoService } from '../../service/abono.service';
import { IAbonoFactura } from '@interfaces/IdeudaFactura';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-create-credit',
  imports: [CommonModule,  ReactiveFormsModule],
  templateUrl: './create-credit.html',

})
export class CreateCredit implements OnInit {
  deudaId!: number;
  abonoForm!: FormGroup;
  mensajeExito: string = '';

  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  protected readonly fb = inject(FormBuilder);
  protected readonly abonoService = inject(AbonoService);
  protected readonly toast = inject(ToastService);
    protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.deudaId = +params.get('id')!;
    });

    this.abonoForm = this.fb.group({
      valor: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]]
    });
  }

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

 onSubmit(): void {
  if (this.abonoForm.invalid) {
    this.toast.warning('Formulario inválido', 'Por favor complete los campos correctamente.');
    return;
  }


  const abono: Partial<IAbonoFactura> = {
    valor: this.abonoForm.value.valor,
    deudaCliente: { id: this.deudaId } as any,
    usuarioCreacion: this.nombreUsuario()
  };

  this.abonoService.saveAbono(abono as IAbonoFactura).subscribe({
    next: () => {
      this.toast.success('Éxito', 'El abono se registró correctamente.');
      this.router.navigate(['../customer-debt'], {
        relativeTo: this.route,
      });
    },
    error: (err) => {
      console.error('Error al guardar el abono:', err);
      this.toast.error('Error al guardar', 'No se pudo registrar el abono. Intente más tarde.');
    }
  });
}
}
