import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import {  of } from 'rxjs';
import { LoginFormComponent } from '../loginForm/loginForm';
import { AuthUserService } from '../../service/authUser.service';
import { Auth, AuthLoginResponse } from '@interfaces/IAuth';
import { LoginParams } from '@interfaces/loginParams';

@Component({
  selector: 'app-login',
  standalone: true,
  styleUrls: ['./login.css'],
  imports: [LoginFormComponent, RouterLink],
  template: `
  <div class="login-container">
    <button
      routerLink="/welcome"
      class="back-button"
      type="button"
      aria-label="Volver al inicio"
    >
      <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12l4-4m-4 4 4 4"/>
      </svg>
    </button>

    <img src="blob.svg" class="blob" />
    <div class="orbit"></div>

    <div class="login">
      <img src="/images/logoAquaplus.webp" alt="Logo" />
      <h2>Bienvenido usuario!</h2>
      <h3>¡Vamos a iniciar sesión!</h3>

      <app-login-form (sendLogin)="login($event)" [errorMessage]="errorMessage()" />

      <a routerLink="/auth/forgot-password">¿Olvidaste tu contraseña?</a>
      <p class="footer">¿No tienes una cuenta? <a routerLink="/auth/register">¡Regístrate!</a></p>
    </div>
  </div>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthUserService);
  private readonly router = inject(Router);
  private readonly shouldLogin = signal<boolean>(false);
  private readonly cred = signal<Auth>({ nombre: '', contrasena: '' });
  readonly errorMessage = signal<string | null>(null);

  readonly loginRes = rxResource<AuthLoginResponse | null, LoginParams>({
    params: () => ({ cred: this.cred(), shouldLogin: this.shouldLogin() }),
    stream: ({ params }) => {
      if (!params?.shouldLogin) return of(null);
      const { nombre, contrasena } = params.cred;
      const trimmedNombre = (nombre ?? '').trim();
      const trimmedContrasena = (contrasena ?? '').trim();
      if (!trimmedNombre || !trimmedContrasena) return of(null);
      return this.auth.login({ nombre: trimmedNombre, contrasena: trimmedContrasena });
    },
  });

  readonly isSuccess = computed(
    () => this.loginRes.status() === 'resolved' && !!this.loginRes.value()
  );

  readonly onError = effect(() => {
    const err = this.loginRes.error();
    if (err) {
      const http = err as HttpErrorResponse;
      // Primero intentar obtener el mensaje procesado por el interceptor
      let msg = 'Usuario o contraseña incorrectos';
      if (http.error) {
        if (http.error.userMessage) {
          msg = http.error.userMessage;
        }
        else if (http.error.message) {
          msg = http.error.message;
        }
        else if (http.error.msg) {
          msg = http.error.msg;
        }
      }
      this.errorMessage.set(String(msg));
      this.shouldLogin.set(false);
    }
  });

  readonly onNavigate = effect(() => {
    if (this.isSuccess()) {
      this.errorMessage.set(null);
      const res = this.loginRes.value()!;
      const token = res.response?.token;
      if (token) {
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('userData', JSON.stringify(res.response));
        this.router.navigate(['shell']);
        this.cred.set({ nombre: '', contrasena: '' });
        this.shouldLogin.set(false);
      } else {
        console.error('No se encontró el token en la respuesta');
      }
    }
  });

  login(a: Auth) {
    this.errorMessage.set(null);
    this.cred.set(a);
    this.shouldLogin.set(true);
  }
}
