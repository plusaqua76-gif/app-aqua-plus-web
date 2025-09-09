import { ChangeDetectionStrategy, Component, inject, output, signal, input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '@interfaces/IAuth';

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
      --color-primary: #0054d759;
      --color-muted: #ada5b4;
    }

    .form {
      display: grid;
      gap: 12px;
      width: 100%;
      margin: 0 0 20px;
    }

    .form :is(input, button) {
      height: 52px;
      border: 0;
    }

    .form input {
      padding: 0 45px 0 45px;
      border-radius: 12px;
    }

    .form button {
      padding: 0 12px;
      border-radius: 6px;
    }

    .textbox {
      position: relative;
    }

    label,
    input {
      transition: 0.3s;
    }

    /* Inputs y labels flotantes */
    .textbox input {
      width: 100%;
      padding: 12px 16px 12px 45px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      color: #ffffff;
      font-size: 14px;
      transition: all 0.3s ease;
      -webkit-backdrop-filter: blur(10px);
      backdrop-filter: blur(10px);
      outline: none;
    }

    .textbox input:focus {
      outline: none;
      border-color: #0062ff;
      background: rgba(255, 255, 255, 0.15);
    }

    .textbox label {
      position: absolute;
      top: 50%;
      left: 45px;
      translate: 0 -50%;
      transform-origin: 0 50%;
      pointer-events: none;
      color: var(--color-muted);
    }

    .textbox input:is(:focus, :not(:invalid)) ~ label {
      scale: 0.725;
      translate: 0 -112%;
    }

    /* Input icons */
    .input-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-muted);
      font-size: 16px;
    }

    /* Botón */
    button {
      color: #f9f9f9;
      background: var(--color-primary);
      cursor: pointer;
      transition: 0.3s;
    }

    button:disabled {
      background: #666;
      cursor: not-allowed;
    }

    button:hover:not(:disabled) {
      background: #7a69d2;
    }

    /* Password toggle */
    .password-toggle {
      position: absolute;
      right: 12px;
      top: 50%;
      translate: 0 -50%;
      cursor: pointer;
      color: var(--color-muted);
      transition: 0.3s;
    }

    .password-toggle:hover {
      color: #ffffff;
    }

    .eye-icon {
      width: 20px;
      height: 20px;
    }

    /* Error message */
    .error-message {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 6px;
      padding: 8px 12px;
      color: #ef4444;
      font-size: 14px;
      text-align: center;
    }
  `],
  template: `
    <form (ngSubmit)="login()" [formGroup]="loginForm" class="form">
      <div class="textbox">
        <i class="fa fa-envelope input-icon"></i>
        <input
          type="text"
          formControlName="nombre"
          required
        />
        <label>Correo</label>
      </div>

      <div class="textbox">
        <i class="fa fa-lock input-icon"></i>
        <input
          [type]="showPassword() ? 'text' : 'password'"
          formControlName="contrasena"
          required
        />
        <label>Contraseña</label>
        <span
          class="password-toggle"
          (click)="togglePasswordVisibility()">
          @if (showPassword()) {
            <svg class="eye-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="m4 15.6 3.055-3.056A4.913 4.913 0 0 1 7 12.012a5.006 5.006 0 0 1 5-5c.178.009.356.027.532.054l1.744-1.744A8.973 8.973 0 0 0 12 5.012c-5.388 0-10 5.336-10 7A6.49 6.49 0 0 0 4 15.6Z"/>
              <path d="m14.7 10.726 4.995-5.007A.998.998 0 0 0 18.99 4a1 1 0 0 0-.71.305l-4.995 5.007a2.98 2.98 0 0 0-.588-.21l-.035-.01a2.981 2.981 0 0 0-3.584 3.583c0 .012.008.022.01.033.05.204.12.402.211.59l-4.995 4.983a1 1 0 1 0 1.414 1.414l4.995-4.983c.189.091.386.162.59.211.011 0 .021.007.033.01a2.982 2.982 0 0 0 3.584-3.584c0-.012-.008-.023-.011-.035a3.05 3.05 0 0 0-.21-.588Z"/>
              <path d="m19.821 8.605-2.857 2.857a4.952 4.952 0 0 1-5.514 5.514l-1.785 1.785c.767.166 1.55.25 2.335.251 6.453 0 10-5.258 10-7 0-1.166-1.637-2.874-2.179-3.407Z"/>
            </svg>
          } @else {
            <svg class="eye-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-width="2" d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z"/>
              <path stroke="currentColor" stroke-width="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
            </svg>
          }
        </span>
      </div>

      @if(errorMessage()) {
        <div class="error-message">{{ errorMessage() }}</div>
      }

      <button type="submit" [disabled]="loginForm.invalid">
        Iniciar Sesión
      </button>
    </form>
  `
})
export class LoginFormComponent {

  sendLogin = output<Auth>();
  errorMessage = input<string | null>(null);
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
      this.message = "Por favor corrige todos los errores y vuelve a enviar el formulario";
    }else{
      const login: Auth = this.loginForm.value;
      this.sendLogin.emit(login);
    }
  }
}
