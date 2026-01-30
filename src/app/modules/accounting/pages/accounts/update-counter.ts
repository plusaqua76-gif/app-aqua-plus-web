import { Component, computed, inject, PLATFORM_ID, signal, OnInit, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { AccountsService } from '../../service/accounts.service';
import { ToastService } from '@services/toast.service';
import { ICreateAccount, IAccountDetail } from '@interfaces/Iaccount';

@Component({
  selector: 'app-update-account',
  imports: [CommonModule, ReactiveFormsModule],
  template: ``,
})
export class UpdateAccount {

  // private readonly accountsService = inject(AccountsService);
  // private readonly platformId = inject(PLATFORM_ID);
  // private readonly isBrowser = isPlatformBrowser(this.platformId);
  // private readonly router = inject(Router);
  // private readonly route = inject(ActivatedRoute);
  // private readonly fb = inject(FormBuilder);
  // private readonly toast = inject(ToastService);

  // // Signals para manejo de estado
  // currentAccount = signal<IAccountDetail | null>(null);
  // isLoading = signal<boolean>(true);
  // isSaving = signal<boolean>(false);
  // loadError = signal<string | null>(null);
  // accountId = signal<number | null>(null);

  // // Formulario reactivo
  // accountForm: FormGroup;

  // // rxResource para obtener los tipos de cuenta
  // getallTypeAccountingAccounts = rxResource({
  //   stream: () => {
  //     return this.accountsService.getAllTypeAccountingAccounts();
  //   }
  // });

  // readonly userData = computed(() => {
  //   if (!this.isBrowser) return null;
  //   try {
  //     const userDataString = sessionStorage.getItem('userData');
  //     if (!userDataString) return null;
  //     return JSON.parse(userDataString);
  //   } catch (e) {
  //     return null;
  //   }
  // });

  // readonly empresaId = computed(() => {
  //   const data = this.userData();
  //   return data?.empresaId || null;
  // });

  // readonly nombreUsuario = computed(() => {
  //   const data = this.userData();
  //   return data?.nombre || 'sistema';
  // });

  // constructor() {
  //   // Inicializar el formulario
  //   this.accountForm = this.fb.group({
  //     codigo: ['', [Validators.required, Validators.maxLength(20)]],
  //     nombre: ['', [Validators.required, Validators.maxLength(100)]],
  //     valor: [0, [Validators.required, Validators.min(0)]],
  //     tipoCuentaId: [null, [Validators.required]] // Campo para el tipo de cuenta
  //   });

  //   // Configurar listeners para detectar cambios
  //   // this.setupChangeDetection(); // No es necesario detectar cambios
  // }

  // ngOnInit(): void {
  //   this.route.params.subscribe(params => {
  //     const id = params['id'];
  //     if (id) {
  //       this.accountId.set(+id);
  //       this.loadAccountData(+id);
  //     } else {
  //       this.loadError.set('ID de cuenta no proporcionado');
  //       this.isLoading.set(false);
  //     }
  //   });
  // }

  // private loadAccountData(id: number): void {
  //   this.isLoading.set(true);
  //   this.loadError.set(null);

  //   this.accountsService.getAccountById(id).subscribe({
  //     next: (response) => {
  //       if (response.success && response.response) {
  //         this.currentAccount.set(response.response);
  //         this.populateForm(response.response);
  //         this.isLoading.set(false);
  //       } else {
  //         this.loadError.set('No se pudo cargar la cuenta');
  //         this.isLoading.set(false);
  //       }
  //     },
  //     error: (error) => {
  //       this.loadError.set('Error al cargar los datos de la cuenta');
  //       this.isLoading.set(false);
  //     }
  //   });
  // }

  // private populateForm(account: IAccountDetail): void {
  //   this.accountForm.patchValue({
  //     codigo: account.codigo || '',
  //     nombre: account.nombre || '',
  //     valor: account.valor || 0,
  //     tipoCuentaId: account.tipoCuenta?.id || null
  //   }, { emitEvent: false });
  // }

  // updateAccount(): void {
  //   if (!this.accountForm.valid || !this.currentAccount() || this.isSaving()) {
  //     console.warn(' No se puede actualizar:', {
  //       formValid: this.accountForm.valid,
  //       hasAccount: !!this.currentAccount(),
  //       isSaving: this.isSaving()
  //     });
  //     return;
  //   }

  //   this.isSaving.set(true);
  //   const formValue = this.accountForm.value;
  //   const current = this.currentAccount()!;

  //   if (!current.id) {
  //     this.isSaving.set(false);
  //     return;
  //   }

  //   const empresaId = this.empresaId();
  //   if (!empresaId) {
  //     this.isSaving.set(false);
  //     return;
  //   }

  //   // Construir el payload para actualización usando la misma estructura que createAccount
  //   const accountData: ICreateAccount = {
  //     id: current.id,
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
  //     usuarioCreacion: current.fechaCreacion ? 'sistema' : this.nombreUsuario(),
  //     fechaCreacion: current.fechaCreacion || new Date().toISOString(),
  //     usuarioModificacion: this.nombreUsuario(),
  //     fechaModificacion: new Date().toISOString()
  //   };

  //   this.accountsService.createAccount(accountData).subscribe({
  //     next: (response) => {
  //       this.isSaving.set(false);
  //       this.toast.success('success', 'Cuenta actualizada exitosamente');
  //       this.goBack();
  //     },
  //     error: (error) => {
  //       this.isSaving.set(false);
  //     }
  //   });
  // }

  // goBack(): void {
  //   this.router.navigate(['../../'], { relativeTo: this.route });
  // }

  // cancelAccount(): void {
  //   this.goBack();
  // }
}
