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
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-6">
      <div class="mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-200 mb-4">
          Actualizar Cuenta Contable
        </h1>
        <div class="flex items-center gap-4 mb-6">
          <button
            type="button"
            (click)="goBack()"
            class="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md text-gray-900 dark:text-white hover:bg-white/20 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Volver a las cuentas
          </button>
        </div>
      </div>
      <div class="relative overflow-hidden shadow-2xl sm:rounded-2xl bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl border border-white/20 dark:border-slate-700/30">
        <div class="p-6 sm:p-8">
          @if (isLoading()) {
            <div class="flex flex-col items-center justify-center py-16">
              <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
              <p class="mt-4 text-gray-600 dark:text-gray-300 font-medium">Cargando datos de la cuenta...</p>
            </div>
          } @else if (loadError()) {
            <div class="flex flex-col items-center justify-center py-16">
              <svg class="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-red-500 font-medium">{{ loadError() }}</p>
              <button
                type="button"
                (click)="goBack()"
                class="mt-4 px-6 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 backdrop-blur-md text-blue-700 dark:text-blue-300 rounded-xl transition-all duration-300"
              >
                Volver al listado
              </button>
            </div>
          } @else {
            <form [formGroup]="accountForm" (ngSubmit)="updateAccount()">
              <div class="mb-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl backdrop-blur-sm">
                <h2 class="text-xl font-bold text-blue-700 dark:text-blue-300 mb-6 tracking-wider uppercase flex items-center gap-2">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Información del Tipo de Cuenta
                </h2>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label class="block text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3 tracking-wider uppercase">
                      Código Tipo
                    </label>
                    <div class="px-4 py-3 bg-white/20 dark:bg-slate-700/30 border border-blue-500/20 rounded-xl text-gray-900 dark:text-white backdrop-blur-md">
                      {{ currentAccount()?.tipoCuenta?.codigo || 'N/A' }}
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3 tracking-wider uppercase">
                      Tipo de Cuenta
                    </label>
                    <div class="px-4 py-3 bg-white/20 dark:bg-slate-700/30 border border-blue-500/20 rounded-xl text-gray-900 dark:text-white backdrop-blur-md">
                      {{ currentAccount()?.tipoCuenta?.nombre || 'N/A' }}
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3 tracking-wider uppercase">
                      Naturaleza
                    </label>
                    <div class="px-4 py-3 bg-white/20 dark:bg-slate-700/30 border border-blue-500/20 rounded-xl text-gray-900 dark:text-white backdrop-blur-md">
                      {{ currentAccount()?.tipoCuenta?.naturaleza || 'N/A' }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="mb-8">
                <h2 class="text-xl font-bold text-gray-700 dark:text-gray-200 mb-6 tracking-wider uppercase flex items-center gap-2">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Datos de la Cuenta
                </h2>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label for="codigo" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                      Código de Cuenta <span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                      <input
                        id="codigo"
                        formControlName="codigo"
                        type="text"
                        maxlength="20"
                        placeholder="Ej: 1101-001"
                        class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40"
                      />
                      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                      </div>
                    </div>
                    @if (accountForm.get('codigo')?.invalid && accountForm.get('codigo')?.touched) {
                      <p class="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                        El código es requerido
                      </p>
                    }
                  </div>
                  <div>
                    <label for="nombre" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                      Nombre de la Cuenta <span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                      <input
                        id="nombre"
                        formControlName="nombre"
                        type="text"
                        maxlength="100"
                        placeholder="Ej: Caja General"
                        class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40"
                      />
                      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    @if (accountForm.get('nombre')?.invalid && accountForm.get('nombre')?.touched) {
                      <p class="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                        El nombre es requerido
                      </p>
                    }
                  </div>
                  <div>
                    <label for="valor" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                      Valor <span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 font-medium">$</span>
                      <input
                        id="valor"
                        formControlName="valor"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        class="w-full pl-8 pr-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40"
                      />
                      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    @if (accountForm.get('valor')?.invalid && accountForm.get('valor')?.touched) {
                      <p class="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                        El valor debe ser mayor o igual a 0
                      </p>
                    }
                  </div>

                  <!-- Tipo de Cuenta -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                      Tipo de Cuenta
                    </label>
                    <div class="relative">
                      @if (getallTypeAccountingAccounts.isLoading()) {
                        <div class="flex items-center justify-center py-3">
                          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                          <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">Cargando tipos...</span>
                        </div>
                      } @else {
                        <select
                          formControlName="tipoCuentaId"
                          class="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent dark:bg-slate-800/50 dark:border-slate-600/30 dark:text-white transition-all duration-300"
                        >
                          <option value="" disabled>
                            @if (currentAccount()?.tipoCuenta?.nombre) {
                              Actual: {{ currentAccount()?.tipoCuenta?.nombre }}
                            } @else {
                              Seleccionar tipo de cuenta
                            }
                          </option>
                          @for (tipo of getallTypeAccountingAccounts.value()?.response || []; track tipo.id) {
                            <option [value]="tipo.id">
                              {{ tipo.nombre }} - {{ tipo.naturaleza }}
                              @if (tipo.descripcion) {
                                ({{ tipo.descripcion }})
                              }
                            </option>
                          }
                        </select>
                      }
                    </div>
                    @if (accountForm.get('tipoCuentaId')?.invalid && accountForm.get('tipoCuentaId')?.touched) {
                      <p class="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                        Debe seleccionar un tipo de cuenta
                      </p>
                    }
                  </div>


                </div>
              </div>
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t border-white/10 dark:border-slate-700/30">
                <!-- Letrerito en la parte izquierda -->
                <p class="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                  Formulario de actualización de cuenta contable
                </p>

                <!-- Botones en la parte derecha -->
                <div class="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    (click)="goBack()"
                    class="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 dark:border-slate-400/30 backdrop-blur-md text-gray-900 dark:text-white font-semibold rounded-xl hover:border-white/40 transform transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 flex items-center gap-3 justify-center"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    [disabled]="!accountForm.valid || isSaving()"
                    class="px-8 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 backdrop-blur-md text-blue-700 dark:text-blue-300 font-semibold rounded-xl hover:border-blue-500/50 transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 flex items-center gap-3 justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                  >
                    @if (isSaving()) {
                      <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Actualizando...
                    } @else {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Actualizar Cuenta
                    }
                  </button>
                </div>
              </div>
            </form>
          }
        </div>
      </div>
    </div>
  `,
})
export class UpdateAccount implements OnInit {
  private readonly accountsService = inject(AccountsService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  // Signals para manejo de estado
  currentAccount = signal<IAccountDetail | null>(null);
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  loadError = signal<string | null>(null);
  accountId = signal<number | null>(null);

  // Formulario reactivo
  accountForm: FormGroup;

  // rxResource para obtener los tipos de cuenta
  getallTypeAccountingAccounts = rxResource({
    stream: () => {
      return this.accountsService.getAllTypeAccountingAccounts();
    }
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

  readonly nombreUsuario = computed(() => {
    const data = this.userData();
    return data?.nombre || 'sistema';
  });

  constructor() {
    // Inicializar el formulario
    this.accountForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(20)]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      valor: [0, [Validators.required, Validators.min(0)]],
      tipoCuentaId: [null, [Validators.required]] // Campo para el tipo de cuenta
    });

    // Configurar listeners para detectar cambios
    // this.setupChangeDetection(); // No es necesario detectar cambios
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.accountId.set(+id);
        this.loadAccountData(+id);
      } else {
        this.loadError.set('ID de cuenta no proporcionado');
        this.isLoading.set(false);
      }
    });
  }

  private loadAccountData(id: number): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.accountsService.getAccountById(id).subscribe({
      next: (response) => {
        if (response.success && response.response) {
          this.currentAccount.set(response.response);
          this.populateForm(response.response);
          this.isLoading.set(false);
        } else {
          this.loadError.set('No se pudo cargar la cuenta');
          this.isLoading.set(false);
        }
      },
      error: (error) => {
        this.loadError.set('Error al cargar los datos de la cuenta');
        this.isLoading.set(false);
      }
    });
  }

  private populateForm(account: IAccountDetail): void {
    this.accountForm.patchValue({
      codigo: account.codigo || '',
      nombre: account.nombre || '',
      valor: account.valor || 0,
      tipoCuentaId: account.tipoCuenta?.id || null
    }, { emitEvent: false });
  }

  updateAccount(): void {
    if (!this.accountForm.valid || !this.currentAccount() || this.isSaving()) {
      console.warn(' No se puede actualizar:', {
        formValid: this.accountForm.valid,
        hasAccount: !!this.currentAccount(),
        isSaving: this.isSaving()
      });
      return;
    }

    this.isSaving.set(true);
    const formValue = this.accountForm.value;
    const current = this.currentAccount()!;

    if (!current.id) {
      this.isSaving.set(false);
      return;
    }

    const empresaId = this.empresaId();
    if (!empresaId) {
      this.isSaving.set(false);
      return;
    }

    // Construir el payload para actualización usando la misma estructura que createAccount
    const accountData: ICreateAccount = {
      id: current.id,
      empresa: {
        id: empresaId
      },
      tipoCuenta: {
        id: Number(formValue.tipoCuentaId)
      },
      codigo: formValue.codigo.trim(),
      nombre: formValue.nombre.trim(),
      valor: Number(formValue.valor),
      activo: true,
      usuarioCreacion: current.fechaCreacion ? 'sistema' : this.nombreUsuario(),
      fechaCreacion: current.fechaCreacion || new Date().toISOString(),
      usuarioModificacion: this.nombreUsuario(),
      fechaModificacion: new Date().toISOString()
    };

    this.accountsService.createAccount(accountData).subscribe({
      next: (response) => {
        this.isSaving.set(false);
        this.toast.success('success', 'Cuenta actualizada exitosamente');
        this.goBack();
      },
      error: (error) => {
        this.isSaving.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  cancelAccount(): void {
    this.goBack();
  }
}
