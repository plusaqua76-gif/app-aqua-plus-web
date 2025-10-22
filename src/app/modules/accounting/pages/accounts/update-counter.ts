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
  template: `
    <!-- Formulario de creación de cuenta con estilos glassmorphism -->
    <div class="px-4 sm:px-6 lg:px-8 py-6">
      <!-- Header con estilo similar al de la tabla -->
      <div class="mb-6">
        <h1
          class="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-200 mb-4"
        >
          Crear Nueva Cuenta Contable
        </h1>

        <!-- Breadcrumb o botón de regreso -->
        <div class="flex items-center gap-4 mb-6">
          <button
            type="button"
            (click)="goBack()"
            class="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md text-gray-900 dark:text-white hover:bg-white/20 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver a la lista
          </button>
        </div>
      </div>

      <!-- Contenedor principal con estilo glassmorphism -->
      <div
        class="relative overflow-hidden shadow-2xl sm:rounded-2xl bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl border border-white/20 dark:border-slate-700/30"
      >
        <!-- Formulario -->
        <form [formGroup]="accountForm" class="p-6 sm:p-8">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            <!-- Campo: Tipo de Cuenta -->
            <div class="lg:col-span-1">
              <label
                for="tipoCuentaId"
                class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase"
                >Tipo de Cuenta <span class="text-red-500">*</span></label
              >
              <select
                id="tipoCuentaId"
                formControlName="tipoCuentaId"
                class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 appearance-none cursor-pointer invalid:text-gray-400 dark:invalid:text-gray-500"
                required
              >
                <option value="" disabled>Seleccione tipo de cuenta</option>
                @for (tipo of getallTypeAccountingAccounts.value()?.response; track tipo.id) {
                <option
                  [value]="tipo.id"
                  class="text-gray-900 dark:text-white bg-white dark:bg-gray-700 py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  {{ tipo.nombre }} ({{ tipo.naturaleza }})
                </option>
                }
              </select>
              @if (accountForm.get('tipoCuentaId')?.invalid && accountForm.get('tipoCuentaId')?.touched) {
              <p class="text-red-500 text-sm mt-2 flex items-center gap-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                El tipo de cuenta es requerido
              </p>
              }
            </div>

            <!-- Campo: Código -->
            <div>
              <label
                for="codigo"
                class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase"
              >
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
                <div
                  class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
                >
                  <svg
                    class="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
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

            <!-- Campo: Nombre -->
            <div>
              <label
                for="nombre"
                class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase"
              >
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
                <div
                  class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
                >
                  <svg
                    class="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
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

            <!-- Campo: Valor Inicial -->
            <div>
              <label
                for="valor"
                class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase"
              >
                Valor Inicial <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  id="valor"
                  formControlName="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40"
                />
                <div
                  class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
                >
                  <svg
                    class="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              @if (accountForm.get('valor')?.invalid && accountForm.get('valor')?.touched) {
              <p class="text-red-500 text-sm mt-2 flex items-center gap-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                El valor inicial es requerido y debe ser mayor o igual a 0
              </p>
              }
            </div>

            <!-- Campo: Estado Activo  -->
     <div class="lg:col-span-1">
              <label
                class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase"
              >
                Estado de la Cuenta
              </label>
              <div class="flex items-center space-x-4">
                <label class="flex items-center">
                  <input
                    type="radio"
                    formControlName="activo"
                    [value]="true"
                    class="w-4 h-4 text-green-600 bg-white/10 border-white/20 focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-slate-700/50 dark:border-slate-400/30"
                  />
                  <span class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Activa
                  </span>
                </label>
                <label class="flex items-center">
                  <input
                    type="radio"
                    formControlName="activo"
                    [value]="false"
                    class="w-4 h-4 text-red-600 bg-white/10 border-white/20 focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-slate-700/50 dark:border-slate-400/30"
                  />
                  <span class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Inactiva
                  </span>
                </label>
              </div>
            </div>
          </div>

          <!-- Información adicional -->
          @if (getallTypeAccountingAccounts.value()?.response) {
          <div class="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl backdrop-blur-sm">
            <h3 class="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2 tracking-wider uppercase">
              Información sobre tipos de cuenta
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-blue-600 dark:text-blue-400">
              @for (tipo of getallTypeAccountingAccounts.value()?.response; track tipo.id) {
              <div class="flex items-center gap-2">
                <span class="font-medium">{{ tipo.codigo }}:</span>
                <span>{{ tipo.nombre }} ({{ tipo.naturaleza }})</span>
              </div>
              }
            </div>
          </div>
          }

          <!-- Botones de acción con estilo similar a la tabla -->
          <div
            class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-white/10 dark:border-slate-700/30"
          >
            <div
              class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Formulario de registro de cuenta contable</span>
            </div>

            <div
              class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
            >
              <!-- Botón Cancelar -->
              <button
                type="button"
                (click)="cancelAccount()"
                class="w-full sm:w-auto bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 backdrop-blur-md text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-xl hover:border-gray-500/50 transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-gray-500/20 active:scale-95 flex items-center gap-3 justify-center"
              >
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Cancelar
              </button>

              <!-- Botón Crear Cuenta -->
              <button
                type="button"
                (click)="createAccount()"
                [disabled]="accountForm.invalid || isCreating()"
                class="w-full sm:w-auto bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 backdrop-blur-md text-green-700 dark:text-green-300 font-semibold py-3 px-6 rounded-xl hover:border-green-500/50 transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 active:scale-95 flex items-center gap-3 justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                @if (isCreating()) {
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creando...
                } @else {
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Crear Cuenta
                }
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class CreateAccount {
  protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);
  protected accountsService = inject(AccountsService);
  protected toastService = inject(ToastService);
  protected router = inject(Router);
  protected route = inject(ActivatedRoute);
  protected fb = inject(FormBuilder);

  // Signals
  isCreating = signal(false);

  // Form
  accountForm: FormGroup = this.fb.group({
    tipoCuentaId: ['', [Validators.required]],
    codigo: ['', [Validators.required, Validators.maxLength(20)]],
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    activo: [true, [Validators.required]],
    valor: [0, [Validators.required, Validators.min(0)]],
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

  readonly nombreUsuario = computed(() => {
    const data = this.userData();
    return data?.nombre || null;
  });

  getallTypeAccountingAccounts = rxResource({
    stream: () => {
      return this.accountsService.getAllTypeAccountingAccounts();
    }
  });

  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  cancelAccount(): void {
    this.goBack();
  }

  createAccount(): void {
    if (this.accountForm.invalid) {
      this.markFormGroupTouched();
      this.toastService.warning('Formulario incompleto', 'Por favor, complete todos los campos requeridos');
      return;
    }

    const empresaId = this.empresaId();
    const nombreUsuario = this.nombreUsuario();

    if (!empresaId) {
      this.toastService.error('Error de sesión', 'No se pudo obtener la información de la empresa');
      return;
    }

    if (!nombreUsuario) {
      this.toastService.error('Error de sesión', 'No se pudo obtener la información del usuario');
      return;
    }

    this.isCreating.set(true);

    const formValue = this.accountForm.value;

    const accountData: ICreateAccount = {
      empresa: {
        id: empresaId
      },
      tipoCuenta: {
        id: Number(formValue.tipoCuentaId)
      },
      codigo: formValue.codigo.trim(),
      nombre: formValue.nombre.trim(),
      valor: Number(formValue.valor),
      activo: formValue.activo,
      usuarioCreacion: nombreUsuario,
      fechaCreacion: new Date().toISOString(),
      usuarioModificacion: nombreUsuario,
      fechaModificacion: new Date().toISOString()
    };

    this.accountsService.createAccount(accountData).subscribe({
      next: (response) => {
        this.isCreating.set(false);
        if (response.success) {
          this.toastService.success('¡Éxito!', 'Cuenta contable creada correctamente');
          this.accountForm.reset();
          this.accountForm.patchValue({ activo: true, valor: 0 });
          // Opcional: redirigir a la lista
          // this.goBack();
        } else {
          this.toastService.error('Error', response.message || 'No se pudo crear la cuenta');
        }
      },
      error: (error) => {
        this.isCreating.set(false);
        console.error('Error creating account:', error);
        this.toastService.error('Error', 'No se pudo crear la cuenta contable');
      }
    });
  }

  private markFormGroupTouched(): void {
    for (const key of Object.keys(this.accountForm.controls)) {
      const control = this.accountForm.get(key);
      control?.markAsTouched();
    }
  }
}
