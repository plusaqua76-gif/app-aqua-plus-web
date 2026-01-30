import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { AccountsService } from '../../service/accounts.service';
import { ToastService } from '@services/toast.service';
import { ICreateAccount } from '@interfaces/Iaccount';

@Component({
  selector: 'app-create-account',
  imports: [CommonModule, ReactiveFormsModule],
  template: ``,
})
export class CreateAccount {

  // protected platformId = inject(PLATFORM_ID);
  // protected isBrowser = isPlatformBrowser(this.platformId);
  // protected accountsService = inject(AccountsService);
  // protected toastService = inject(ToastService);
  // protected router = inject(Router);
  // protected route = inject(ActivatedRoute);
  // protected fb = inject(FormBuilder);

  // // Signals
  // isCreating = signal(false);

  // // Form
  // accountForm: FormGroup = this.fb.group({
  //   tipoCuentaId: ['', [Validators.required]],
  //   codigo: ['', [Validators.required, Validators.maxLength(5)]],
  //   nombre: ['', [Validators.required, Validators.maxLength(100)]],
  //   valor: [0, [Validators.required, Validators.min(0)]],
  // });

  // readonly userData = computed(() => {
  //   if (!this.isBrowser) return null;
  //   try {
  //     const userDataString = sessionStorage.getItem('userData');
  //     if (!userDataString) return null;
  //     return JSON.parse(userDataString);
  //   } catch (e) {
  //     console.error('Error parsing userData from sessionStorage:', e);
  //     return null;
  //   }
  // });

  // readonly empresaId = computed(() => {
  //   const data = this.userData();
  //   return data?.empresaId || null;
  // });

  // readonly nombreUsuario = computed(() => {
  //   const data = this.userData();
  //   return data?.nombre || null;
  // });

  // getallTypeAccountingAccounts = rxResource({
  //   stream: () => {
  //     return this.accountsService.getAllTypeAccountingAccounts();
  //   }
  // });

  // goBack(): void {
  //   this.router.navigate(['../'], { relativeTo: this.route });
  // }

  // cancelAccount(): void {
  //   this.goBack();
  // }

  // createAccount(): void {
  //   if (this.accountForm.invalid) {
  //     this.markFormGroupTouched();
  //     this.toastService.warning('Formulario incompleto', 'Por favor, complete todos los campos requeridos');
  //     return;
  //   }

  //   const empresaId = this.empresaId();
  //   const nombreUsuario = this.nombreUsuario();

  //   if (!empresaId) {
  //     this.toastService.error('Error de sesión', 'No se pudo obtener la información de la empresa');
  //     return;
  //   }

  //   if (!nombreUsuario) {
  //     this.toastService.error('Error de sesión', 'No se pudo obtener la información del usuario');
  //     return;
  //   }

  //   this.isCreating.set(true);

  //   const formValue = this.accountForm.value;

  //   const accountData: ICreateAccount = {
  //     empresa: {
  //       id: empresaId
  //     },
  //     tipoCuenta: {
  //       id: Number(formValue.tipoCuentaId)
  //     },
  //     codigo: formValue.codigo.trim(),
  //     nombre: formValue.nombre.trim(),
  //     valor: Number(formValue.valor),
  //     activo: true,
  //     usuarioCreacion: nombreUsuario,
  //     fechaCreacion: new Date().toISOString(),
  //     usuarioModificacion: nombreUsuario,
  //     fechaModificacion: new Date().toISOString()
  //   };

  //   this.accountsService.createAccount(accountData).subscribe({
  //     next: (response) => {
  //       this.isCreating.set(false);
  //       if (response.success) {
  //         this.toastService.success('¡Éxito!', 'Cuenta contable creada correctamente');
  //         this.accountForm.reset();
  //         this.accountForm.patchValue({ activo: true, valor: 0 });
  //         // Opcional: redirigir a la lista
  //         // this.goBack();
  //       } else {
  //         this.toastService.error('Error', response.message || 'No se pudo crear la cuenta');
  //       }
  //     },
  //     error: (error) => {
  //       this.isCreating.set(false);
  //       console.error('Error creating account:', error);
  //       this.toastService.error('Error', 'No se pudo crear la cuenta contable');
  //     }
  //   });
  // }

  // private markFormGroupTouched(): void {
  //   for (const key of Object.keys(this.accountForm.controls)) {
  //     const control = this.accountForm.get(key);
  //     control?.markAsTouched();
  //   }
  // }
}
