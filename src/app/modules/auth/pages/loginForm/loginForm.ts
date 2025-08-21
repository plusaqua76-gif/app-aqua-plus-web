import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '@interfaces/IAuth';



@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form (ngSubmit)="login()" [formGroup]="loginForm" class="w-full">
      <div class="mb-4 relative w-3/4 mx-auto">
        <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
          <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
  <path fill-rule="evenodd" d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4h-4Z" clip-rule="evenodd"/>
</svg>

        </span>
        <input
          type="text"
          placeholder="Usuario..."
          formControlName="nombre"
          class="w-full pl-12 pr-4 py-3 text-lg bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-500 transition-all duration-200"
        />
        @let nombre = loginForm.get('nombre');
        @if(nombre?.dirty && nombre?.invalid) {
          <div class="text-red-500 text-xs mt-1 ml-2">* Usuario es obligatorio</div>
        }
      </div>

      <div class="mb-4 relative w-3/4 mx-auto">
        <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
          <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path fill-rule="evenodd" d="M8 10V7a4 4 0 1 1 8 0v3h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1Zm2-3a2 2 0 1 1 4 0v3h-4V7Zm2 6a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1Z" clip-rule="evenodd"/>
          </svg>
        </span>
        <input
          [type]="showPassword() ? 'text' : 'password'"
          placeholder="Contraseña..."
          formControlName="contrasena"
          class="w-full pl-12 pr-12 py-3 text-lg bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-500 transition-all duration-200"
        />
        <span
          class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer hover:text-gray-700 transition-colors duration-200"
          (click)="togglePasswordVisibility()">
          @if (showPassword()) {
            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="m4 15.6 3.055-3.056A4.913 4.913 0 0 1 7 12.012a5.006 5.006 0 0 1 5-5c.178.009.356.027.532.054l1.744-1.744A8.973 8.973 0 0 0 12 5.012c-5.388 0-10 5.336-10 7A6.49 6.49 0 0 0 4 15.6Z"/>
              <path d="m14.7 10.726 4.995-5.007A.998.998 0 0 0 18.99 4a1 1 0 0 0-.71.305l-4.995 5.007a2.98 2.98 0 0 0-.588-.21l-.035-.01a2.981 2.981 0 0 0-3.584 3.583c0 .012.008.022.01.033.05.204.12.402.211.59l-4.995 4.983a1 1 0 1 0 1.414 1.414l4.995-4.983c.189.091.386.162.59.211.011 0 .021.007.033.01a2.982 2.982 0 0 0 3.584-3.584c0-.012-.008-.023-.011-.035a3.05 3.05 0 0 0-.21-.588Z"/>
              <path d="m19.821 8.605-2.857 2.857a4.952 4.952 0 0 1-5.514 5.514l-1.785 1.785c.767.166 1.55.25 2.335.251 6.453 0 10-5.258 10-7 0-1.166-1.637-2.874-2.179-3.407Z"/>
            </svg>
          } @else {
            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-width="2" d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z"/>
              <path stroke="currentColor" stroke-width="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
            </svg>
          }
        </span>
        @let contrasena = loginForm.get('contrasena');
        @if(contrasena?.dirty && contrasena?.invalid) {
          <div class="text-red-500 text-xs mt-1 ml-2">* Contraseña es obligatoria</div>
        }
      </div>


      <div class="text-center mb-6">
        <a href="#" class="text-sm text-gray-500 hover:text-blue-600 cursor-pointer transition-colors duration-200">
          ¿Olvidaste tu contraseña?
        </a>
      </div>


      @if(message) {
        <div class="text-center mb-4">
          <div class="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2 mx-auto w-3/4">
            {{ message }}
          </div>
        </div>
      }


      <div class="flex justify-center mb-4">
        <button
          type="submit"
          [disabled]="loginForm.invalid"
          [class]="'w-1/2 py-3 rounded-lg text-white font-medium text-lg transition-all duration-200 ' +
                   (loginForm.invalid ?
                     'bg-gray-400 cursor-not-allowed' :
                     'bg-[#3388f5] hover:bg-blue-700 cursor-pointer hover:shadow-lg transform hover:scale-105')"
        >
          Iniciar Sesión
        </button>
      </div>

      <div class="text-center">
        <span class="text-gray-500 text-sm">¿No tienes cuenta? </span>
        <a href="#" class="text-[#3388f5] hover:underline text-sm font-medium transition-colors duration-200">
          Regístrate
        </a>
      </div>
    </form>
  `
})
export class LoginFormComponent {

  sendLogin = output<Auth>();
  readonly #formBuilder = inject(FormBuilder);
  public message = "";

  readonly showPassword = signal(false);

  public loginForm: FormGroup =  this.#formBuilder.group({
    nombre: ['', [Validators.required]],
    contrasena: ['', [Validators.required]],
  });

  togglePasswordVisibility() {
    this.showPassword.update(show => !show);
  }

  login() {
    if(this.loginForm.invalid){
      this.message = "Please correct all errors and resubmit the form";
    }else{
      const login: Auth = this.loginForm.value;
      this.sendLogin.emit(login);
    }
  }
}
