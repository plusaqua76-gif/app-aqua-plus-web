import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { LoginFormComponent } from '../loginForm/loginForm';
import { AuthUserService } from '../../service/authUser.service';
import { Auth, AuthLoginResponse, AuthResponse } from '@interfaces/IAuth';
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
      const trimmedNombre = nombre?.trim() ?? '';
      const trimmedContrasena = contrasena?.trim() ?? '';

      if (!trimmedNombre || !trimmedContrasena) return of(null);

      return this.auth.login({
        nombre: trimmedNombre,
        contrasena: trimmedContrasena
      });
    },
  });

  readonly isSuccess = computed(
    () => this.loginRes.status() === 'resolved' && !!this.loginRes.value()
  );

  readonly onError = effect(() => {
    const error = this.loginRes.error();
    if (error) {
      this.errorMessage.set(this.extractErrorMessage(error));
      this.shouldLogin.set(false);
    }
  });

  readonly onNavigate = effect(() => {
    if (!this.isSuccess()) return;

    const response = this.loginRes.value()!;
    const authData = response.response;

    if (!authData?.token) {
      console.error('No se encontró el token en la respuesta');
      return;
    }

    this.saveAuthDataToStorage(authData);
    this.resetLoginState();
    this.router.navigate(['shell']);
  });

  login(credentials: Auth): void {
    this.errorMessage.set(null);
    this.cred.set(credentials);
    this.shouldLogin.set(true);
  }

  private extractErrorMessage(error: unknown): string {
    const httpError = error as HttpErrorResponse;
    const errorBody = httpError.error;

    return errorBody?.userMessage
      ?? errorBody?.message
      ?? errorBody?.msg
      ?? 'Usuario o contraseña incorrectos';
  }

  private saveAuthDataToStorage(authData: AuthResponse): void {
    sessionStorage.setItem('authToken', authData.token);

    const userData = {
      id: authData.id,
      nombre: authData.nombre,
      rolId: authData.rolId,
      rol: authData.rol,
      personaId: authData.personaId,
      empresaId: authData.empresaId,
      idEmpresaDian: authData.empresa?.idEmpresaDian,
      empresa: authData.empresa,
    };

    sessionStorage.setItem('userData', JSON.stringify(userData));
  }

  private resetLoginState(): void {
    this.errorMessage.set(null);
    this.cred.set({ nombre: '', contrasena: '' });
    this.shouldLogin.set(false);
  }
}
