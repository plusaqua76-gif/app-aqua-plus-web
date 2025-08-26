import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { EMPTY } from 'rxjs';

import { LoginFormComponent } from '../loginForm/loginForm';
import { AuthUserService } from '../../service/authUser.service';
import { Auth, AuthLoginResponse, AuthResponse } from '@interfaces/IAuth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LoginFormComponent],
  template: `
    <div class="min-h-screen w-full bg-gray-100">
      <div
        class="w-full h-screen bg-white shadow-lg rounded-none overflow-hidden flex flex-col"
      >
        <div
          class="relative w-full overflow-hidden"
          style="height: 220px; width: 130%;"
        >
          <div class="absolute top-4 left-4 z-10">
            <button class="text-white text-2xl cursor-pointer">
              <i class="fas fa-arrow-left"></i>
            </button>
          </div>

          <div
            class="absolute w-full h-full bg-[#3388f5] rounded-b-[60px]"
          ></div>

          <svg
            class="absolute w-full h-full top-0 left-0"
            viewBox="0 0 1000 220"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0,30 Q250,130 500,70 Q750,10 1000,60 L1000,0 L0,0Z"
              fill="#94c0fa"
            />
            <path
              d="M0,90 Q280,200 650,90 Q850,50 1000,100 L1000,220 L0,220Z"
              fill="#fff"
            />
          </svg>

          <div class="absolute bottom-0 w-full h-1 bg-white z-20"></div>
        </div>

        <div class="flex flex-col items-center justify-center px-4 py-8 flex-1">
          <div class="w-full max-w-md">
            <h2
              class="text-2xl font-bold text-center mb-2 text-gray-800 dark:text-gray-100"
            >
              Iniciar Sesión
            </h2>
            <p class="text-center font-semibold text-gray-500 mb-6">
              ¡Bienvenido! Por favor, ingresa tus datos
            </p>

            <app-login-form (sendLogin)="login($event)" />
          </div>
        </div>

        <div class="relative w-full h-[120px] mt-auto">
          <svg
            class="absolute w-full h-full"
            viewBox="0 0 924 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,60 Q200,140 462,60 Q724,-20 924,80 L924,120 L0,120Z"
              fill="#3388f5"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthUserService);
  private readonly router = inject(Router);
  private readonly cred = signal<Auth>({ nombre: '', contrasena: '' });
  readonly errorMessage = signal<string | null>(null);

  readonly loginRes = rxResource<AuthLoginResponse, Auth>({
    params: () => this.cred(),
    stream: ({ params }) => {
      const nombre = (params?.nombre ?? '').trim();
      const contrasena = (params?.contrasena ?? '').trim();
      if (!nombre || !contrasena) return EMPTY;
      return this.auth.login({ nombre, contrasena });
    },
  });

  readonly isSuccess = computed(
    () => this.loginRes.status() === 'resolved' && !!this.loginRes.value()
  );

  readonly onError = effect(() => {
    const err = this.loginRes.error();
    if (err) {
      const http = err as HttpErrorResponse;
      const msg =
        (http.error && (http.error.msg || http.error.message)) ||
        http.message ||
        'Usuario o contraseña incorrectos';
      this.errorMessage.set(String(msg));
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
      } else {
        console.error('No se encontró el token en la respuesta');
      }
    }
  });

  login(a: Auth) {
    this.errorMessage.set(null);
    this.cred.set(a);
  }
}
